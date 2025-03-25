import React, { useState } from "react";
import { Form, Button, Modal, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import "../styles/QuestionForm.css";

const QuestionForm = () => {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !question) {
      setError("Please upload a file and enter a question.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("question", question);

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/ask-question/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAnswer(response.data.answer);
      setShowModal(true); // Show the modal with the answer
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to fetch the answer.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setQuestion("");
    setFile("");
    setAnswer("");
  };

  return (
    <div className="question-form">
      <h2 className="question-form__title">Ask Your Question</h2>
      <p className="question-form__subtitle">Upload a file and ask a question about its content.</p>

      <Form onSubmit={handleSubmit} className="question-form__form">
        <Form.Group controlId="file" className="question-form__group">
          <Form.Label className="question-form__label">Upload File</Form.Label>
          <Form.Control
            type="file"
            onChange={handleFileChange}
            className="question-form__control"
          />
        </Form.Group>

        <Form.Group controlId="question" className="question-form__group">
          <Form.Label className="question-form__label">Your Question</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="question-form__control"
          />
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          disabled={loading}
          className="question-form__button"
        >
          {loading ? <Spinner animation="border" size="sm" /> : "Ask Question"}
        </Button>
      </Form>

      {error && <Alert className="question-form__alert mt-3">{error}</Alert>}

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
            <Modal.Title>Answer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p>{answer || "Your answer will appear here after submission."}</p>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
            Close
            </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default QuestionForm;
