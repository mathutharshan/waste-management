import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "../styles/ChatDashboard.css";
import { FaMicrophone, FaPaperclip, FaTimes, FaFilePdf, FaFileWord, FaFileExcel, FaFileAlt, FaFile} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ChatDashboard = () => {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [pastChats, setPastChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [isListening, setIsListening] = useState(false); // State for voice input
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [showSpeechControls, setShowSpeechControls] = useState(false);

  let speechSynthesisInstance = window.speechSynthesis;
  let utterance = null;

  useEffect(() => {
    const fetchPastChats = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/get-past-chats/");
        // Assuming each chat object has a `timestamp` field
        const sortedChats = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setPastChats(sortedChats);
      } catch (err) {
        console.error("Error fetching past chats:", err);
      }
    };
    fetchPastChats();
  
    // Check if the browser supports the Web Speech API
    if ("webkitSpeechRecognition" in window) {
      setVoiceSupported(true);
    }
  }, []);  

  const showErrorMessage = (message) => {
    toast.error(message, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      newestOnTop: false,
      closeOnClick: true,
      rtl: false,
      pauseOnFocusLoss: false,
      draggable: true,
      pauseOnHover: true,
    });
  };

  const showSuccessMessage = (message) => {
    toast.success(message, {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      newestOnTop: false,
      closeOnClick: true,
      rtl: false,
      pauseOnFocusLoss: false,
      draggable: true,
      pauseOnHover: true,
    });
  };

  const preprocessTextForSpeech = (text) => {
    if (!text) return "";
    text = text.replace(/•/g, "bullet point").replace(/:/g, ", ").replace(/[^\w\s.,!?]/g, "").replace(/\s+/g, " ").trim();
    return text;
  };

  const speakText = (text) => {
    if (!("speechSynthesis" in window)) {
      console.error("Text-to-Speech not supported in this browser.");
      return;
    }
    if (!text) {
      console.error("No text provided for Text-to-Speech.");
      return;
    }
  
    const processedText = preprocessTextForSpeech(text);
    if (!processedText) {
      console.error("Processed text is empty or invalid.");
      return;
    }
  
    // Ensure any ongoing speech is stopped
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
  
    const utterance = new SpeechSynthesisUtterance(processedText);
    utterance.lang = "en-US";
    utterance.rate = 1.15;
    utterance.pitch = 1;
    utterance.volume = 1;
  
    utterance.onstart = () => {
      console.log("Speech started.");
      setShowSpeechControls(true); // Show speech controls when speech starts
    };
    utterance.onend = () => {
      console.log("Speech ended.");
      setShowSpeechControls(false); // Hide speech controls when speech ends
    };
    utterance.onerror = (e) => {
      console.error("TTS error:", e);
      setShowSpeechControls(false); // Ensure controls are hidden on error
    };
  
    speechSynthesis.speak(utterance);
  };
  
  const pauseSpeech = () => {
    if (speechSynthesisInstance.speaking && !speechSynthesisInstance.paused) {
      speechSynthesisInstance.pause();
    }
  };

  const resumeSpeech = () => {
    if (speechSynthesisInstance.paused) {
      speechSynthesisInstance.resume();
    }
  };

  const stopSpeech = () => {
    if (speechSynthesisInstance.speaking) {
      speechSynthesisInstance.cancel();
      setShowSpeechControls(false);
    }
  };

  const SpeechControls = () => {
    if (!showSpeechControls) return null; // Only render controls if they should be visible
  
    return (
      <div className="speech-controls">
        <button className="btn btn-secondary" onClick={pauseSpeech}>Pause</button>
        <button className="btn btn-primary" onClick={resumeSpeech}>Resume</button>
        <button className="close-button" onClick={stopSpeech}>
          <FaTimes />
        </button>
      </div>
    );
  };

  // Helper function to determine file type
  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf":
        return <FaFilePdf />;
      case "doc":
      case "docx":
        return <FaFileWord />;
      case "xls":
      case "xlsx":
        return <FaFileExcel />;
      case "txt":
        return <FaFileAlt />;
      default:
        return <FaFile />;
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setFile(null);
      setError("Please upload a file.");
      return;
    }

    setFile(selectedFile);
    setFileType(getFileIcon(selectedFile.name)); 
    setError("");
  };
  
  
  const handleQuestionChange = (e) => {
    const value = e.target.value;
    setQuestion(value);
    setError(value.trim() ? "" : "Please enter a question.");
  };
  
  const handleSend = async () => {
    if (!question.trim()) {
      showErrorMessage("Please enter a question.");
      return;
    }
  
    if (!file) {
      showErrorMessage("Please upload a file.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("question", question.trim());
  
    setLoading(true);
    setError("");
  
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/ask-question/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
  
      const newMessage = {
        question,
        answer: response.data.answer,
      };
  
      setMessages((prev) => [...prev, newMessage]);
      setQuestion(""); // Clear the input field

      if (ttsEnabled) {
        speakText(newMessage.answer); // Automatically speak the answer
      }
        
      if (!selectedChat) {
        const chatsResponse = await axios.get(
          "http://127.0.0.1:8000/get-past-chats/"
        );
        setPastChats(chatsResponse.data);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || "Failed to fetch the answer.";
      showErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  }; 

  const handleSelectChat = async (chatId) => {
    setSelectedChat(chatId);

    try {
      const response = await axios.get(`http://127.0.0.1:8000/chat/${chatId}/`);
      setMessages([response.data]); // Assuming one message per chat for simplicity
    } catch (err) {
      console.error("Error fetching chat:", err);
    }
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuestion((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.start();
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/chat/${chatId}/`);
      setPastChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
      showSuccessMessage("Chat deleted successfully!");
    } catch (err) {
      showErrorMessage("Failed to delete chat.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="chat-dashboard">
      <ToastContainer />
      <div className="chat-sidebar">
        <h3>Past Chats</h3>
        <ul>
          {pastChats.map((chat) => (
            <li
              key={chat.id}
              onClick={() => handleSelectChat(chat.id)}
              className={chat.id === selectedChat ? "active" : ""}
            >
              {chat.question.length > 25
                ? `${chat.question.slice(0, 25)}...`
                : chat.question}
                <button
                  className="delete-chat-button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the chat selection
                    handleDeleteChat(chat.id);
                  }}
                >
                  X {/* Or you can leave this empty for just a red circle */}
                </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-window">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className="chat-message">
              <div className="chat-question">
                <strong>Question:</strong> {msg.question}
              </div>
              <div className="chat-answer">
              <ReactMarkdown>
                {typeof msg.answer === "string" ? msg.answer : JSON.stringify(msg.answer)}
              </ReactMarkdown>
              {ttsEnabled && showSpeechControls && <SpeechControls />} {/* Render speech controls conditionally */}
              {ttsEnabled && !showSpeechControls && (
                <button
                  className="btn btn-info"
                  onClick={() => speakText(msg.answer)}
                >
                  Speak Answer
                </button>
              )}
              </div>
            </div>
          ))}
        </div>
        <div className="chat-input-container">
          <div className={`chat-input-wrapper ${file ? "file-uploaded" : ""}`}>
            {file && (
              <div className="uploaded-file-display">
                <span className="file-icon">{fileType}</span>
                <span className="file-name">{file.name}</span>
                <button
                  className="remove-file-button"
                  onClick={() => setFile(null)}
                >
                  &times;
                </button>
              </div>
            )}
            {!file && (
              <label htmlFor="file-upload" className="file-upload-icon">
                <FaPaperclip />
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  className="file-input-hidden"
                />
              </label>
            )}
            <input
              type="text"
              value={question}
              onChange={handleQuestionChange}
              onKeyDown={handleKeyPress}
              placeholder="Enter your question after uploading file..."
              className="chat-input"
            />
            {voiceSupported && (
              <button
                onClick={startListening}
                disabled={isListening}
                className="voice-input"
              >
                <FaMicrophone />
              </button>
            )}
          </div>
          <label className="tts-toggle">
            <input
              type="checkbox"
              checked={ttsEnabled}
              onChange={(e) => setTtsEnabled(e.target.checked)}
            />
            Enable Voice Response
          </label>
        </div>
        {/*error && <div className="chat-error">{error}</div>*/}
      </div>
    </div>
  );
};

export default ChatDashboard;
