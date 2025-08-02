import React, { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Box,
} from "@mui/material";

export function QuizUpload({ onQuizUpload, roomCode }) {
  const [jsonData, setJsonData] = useState("");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        validateQuizData(data);
        setJsonData(JSON.stringify(data, null, 2));
        setError("");
      } catch (err) {
        setError("Invalid JSON file. Please check the format.");
      }
    };
    reader.readAsText(file);
  };

  const validateQuizData = (data) => {
    if (!Array.isArray(data)) throw new Error("Quiz data must be an array.");

    data.forEach((question) => {
      if (
        !question.question ||
        !Array.isArray(question.options) ||
        question.options.length < 2 ||
        typeof question.correctAnswer !== "number" ||
        question.correctAnswer < 0 ||
        question.correctAnswer >= question.options.length
      ) {
        throw new Error("Invalid question format.");
      }
    });
  };
  const handleSubmit = async () => {
    try {
      setIsUploading(true);
      const data = JSON.parse(jsonData);
      validateQuizData(data); // Ensure validation
      // change to onrender
      const response = await fetch(
        `https://codingassistant.onrender.com/api/save-quiz`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomCode, quizData: data }), // Ensure correct format
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Error saving quiz");
      }

      onQuizUpload(data);
    } catch (err) {
      console.log(err);
      setError("Invalid JSON data. Please check the format.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Upload Quiz
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Upload a JSON file or paste quiz data.
        </Typography>

        <Box mt={2}>
          <input
            id="quiz-file"
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
          <Button
            variant="contained"
            component="label"
            color="primary"
            fullWidth
          >
            Upload File
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              hidden
            />
          </Button>
        </Box>

        <Box mt={2}>
          <TextField
            label="Quiz JSON Data"
            variant="outlined"
            multiline
            rows={10}
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            fullWidth
          />
          {error && <Typography color="error">{error}</Typography>}
        </Box>

        <Box mt={2}>
          <Typography variant="subtitle1" gutterBottom>
            Expected JSON Format:
          </Typography>
          <pre
            style={{
              backgroundColor: "#f0f0f0",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            {`[
  {
    "question": "What is 2+2?",
    "options": ["3", "4", "5", "6"],
    "correctAnswer": 1
  },
  {
    "question": "What is the capital of France?",
    "options": ["London", "Berlin", "Paris", "Madrid"],
    "correctAnswer": 2
  }
]`}
          </pre>
        </Box>
      </CardContent>
      <CardContent>
        <Button
          onClick={handleSubmit}
          disabled={!jsonData || isUploading}
          variant="contained"
          color="primary"
          fullWidth
        >
          {isUploading ? "Uploading..." : "Start Quiz"}
        </Button>
      </CardContent>
    </Card>
  );
}
