from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from transformers import pipeline
from PyPDF2 import PdfReader
from docx import Document
import pandas as pd
import os
import torch
from dotenv import load_dotenv
import requests
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient  # Import Motor for MongoDB
import google.generativeai as genai
from pydantic import BaseModel
from fastapi import HTTPException, status
from bson import ObjectId  # Import ObjectId for MongoDB queries
import asyncio
from datetime import datetime

# Initialize MongoDB client
MONGODB_URL = os.getenv("MOMONGODB_URL")  # MongoDB connection string
mongo_client = AsyncIOMotorClient(MONGODB_URL)
db = mongo_client["sample"]  # Replace with your database name
files_collection = db["files"]  # Collection for storing file data
questions_collection = db["questions"]  # Collection for storing questions and answers


# Load environment variables from the .env file
load_dotenv()

# Initialize Gemin API credentials
GEMIN_API_KEY = os.getenv("GEMIN_API_KEY")  # Your Gemin API key

if not GEMIN_API_KEY:
    raise ValueError("GEMIN_API_KEY is not set in the .env file.")

# Configure Gemini API
genai.configure(api_key=GEMIN_API_KEY)
generation_config = {
    "temperature": 0.3,
    "top_p": 1,
    "max_output_tokens": 2048,
}

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    #allow_origins=["http://localhost:3000"],  # Add the origin of your React app
    allow_origins=["http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

#Extract text content from supported file types (.txt, .pdf, .docx, .csv).
def extract_text_from_file(file_path):
    try:
        if file_path.endswith(".txt"):
            with open(file_path, "r", encoding="utf-8") as file:
                return file.read()
        elif file_path.endswith(".pdf"):
            reader = PdfReader(file_path)
            return " ".join(page.extract_text() for page in reader.pages if page.extract_text())
        elif file_path.endswith(".docx"):
            doc = Document(file_path)
            return " ".join(paragraph.text for paragraph in doc.paragraphs)
        elif file_path.endswith(".csv"):
            df = pd.read_csv(file_path)
            return df.to_string()  # Convert the dataframe to a string
        else:
            raise ValueError("Unsupported file type! Please provide a .txt, .pdf, .docx, or .csv file.")
    except Exception as e:
        return f"Error extracting content from file: {e}"

# Clean up tem file
def cleanup_temp_file(file_path):
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Error cleaning up file: {e}")

#Ask a question using the Gemini API with formatted input text.
def ask_question_gemin(input_text):
    try:
        # Initialize the Gemini model
        model = genai.GenerativeModel("models/gemini-1.5-flash", generation_config=generation_config)
        
        # Generate response
        response = model.generate_content([input_text])
        
        # Extract and return the generated text
        return response.text
    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error: {e}")
        return f"HTTP error: {e}"
    except requests.exceptions.RequestException as e:
        print(f"Request Error: {e}")
        return f"Request error: {e}"

# Upload a file and extract its content.
@app.post("/ask-question/")
async def ask_question_api(file: UploadFile = File(...), question: str = Form(...)):
    try:
        # Print the received file and question
        print(f"Received file: {file.filename}")
        print(f"Received question: {question}")

        if not file:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No file uploaded. Please upload a file and try again."
            )
        if not question:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No question provided. Please provide a question."
            )

        # Save the uploaded file temporarily
        file_path = f"temp/{file.filename}"
        with open(file_path, "wb") as f:
            f.write(await file.read())

        # Extract content from the file
        file_content = extract_text_from_file(file_path)
        if "Error" in file_content:
            raise HTTPException(status_code=400, detail=file_content)

        # Combine content and question
        input_text = f"{file_content}\n\nQuestion: {question}"

        # Get the answer using the Gemini API
        answer = ask_question_gemin(input_text)

        # Save the question and answer to MongoDB (mocked here)
        timestamp = datetime.now()
        await questions_collection.insert_one(
            {
                "question": question, 
                "answer": answer, 
                "file": file.filename,
                "timestamp": timestamp
            }
        )

        # Optionally clean up the temporary file
        cleanup_temp_file(file_path)

        return {"question": question, "answer": answer}
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again later."
        )


#######################################################################################################################



# Pydantic model for response
class Chat(BaseModel):
    id: str
    question: str
    answer: str
    file: str

@app.get("/get-past-chats/")
async def get_past_chats():
    """
    Get a list of all chats.
    """
    try:
        chats = await questions_collection.find({}).to_list(length=100)  # Adjust length as needed
        return [{"id": str(chat["_id"]), "question": chat["question"], "answer": chat["answer"], "file": chat["file"], "timestamp": chat["timestamp"]} for chat in chats]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching chats: {e}")



@app.get("/chat/{chat_id}/")
async def get_chat_by_id(chat_id: str):
    print("Chat id : ", chat_id)
    """
    Get details of a specific chat by ID.
    """
    try:
        # Convert chat_id to ObjectId
        chat = await questions_collection.find_one({"_id": ObjectId(chat_id)})
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        # Return the chat details
        return {
            "id": str(chat["_id"]),  # Convert ObjectId to string for JSON response
            "question": chat["question"],
            "answer": chat["answer"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching chat: {e}")


@app.delete("/chat/{chat_id}/")
async def delete_chat_by_id(chat_id: str):
    """
    Delete a chat by its ID.
    """
    try:
        # Convert chat_id to ObjectId
        chat_object_id = ObjectId(chat_id)
        
        # Attempt to delete the chat from the database
        result = await questions_collection.delete_one({"_id": chat_object_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        return {"message": f"Chat with ID {chat_id} deleted successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting chat: {e}")
