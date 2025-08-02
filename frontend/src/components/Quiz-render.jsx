import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  LinearProgress,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export function QuizRenderer({ roomCode, userId }) {
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState([]);
  const nav = useNavigate();
  useEffect(() => {
    async function fetchQuiz() {
      try {
        const response = await axios.post(
          "https://codingassistant.onrender.com/api/get-quiz",
          { roomCode }
        );
        // const response = await axios.post( "https://codingassistant.onrender.com/api/get-quiz",
        //   { roomCode }
        // );
        setQuizData(response.data.quizData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching quiz:", error);
      }
    }
    fetchQuiz();
  }, [roomCode]);

  if (loading) {
    return <Typography>Loading quiz...</Typography>;
  }

  const question = quizData[currentQuestion];
  const totalQuestions = quizData.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswerSelect = (event) => {
    if (submitted) return;
    setSelectedAnswer(parseInt(event.target.value));
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === question.correctAnswer;
    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
    }

    setAnswers([
      ...answers,
      { questionIndex: currentQuestion, selectedAnswer, isCorrect },
    ]);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setSubmitted(false);
    } else {
      setShowResults(true);
      saveResults(); // Save results when the quiz is over
    }
  };

  const saveResults = async () => {
    try {
      // change to onrender  -> https://codingassistant.onrender.com
      await axios.post(`"https://codingassistant.onrender.com/results`, {
        userId,
        roomCode,
        score,
        totalQuestions,
        answers,
      });
    } catch (error) {
      console.error("Error saving results:", error);
    }
  };
  const handleExit = async () => {
    setTimeout(() => {
      nav("/");
    }, 750);
  };
  return (
    <div className="w-full max-w-2xl mx-auto">
      {!showResults ? (
        <Card>
          <CardContent>
            <Typography variant="caption" color="textSecondary">
              Question {currentQuestion + 1} of {totalQuestions}
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="h5" className="mt-4">
              {question.question}
            </Typography>
            <RadioGroup
              value={selectedAnswer !== null ? selectedAnswer.toString() : ""}
              onChange={handleAnswerSelect}
            >
              {question.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={index.toString()}
                  control={<Radio />}
                  label={option}
                  className={`space-x-2 rounded-md border p-3 cursor-pointer transition-colors
                    ${
                      submitted && index === question.correctAnswer
                        ? "border-green-500 bg-green-50"
                        : ""
                    }
                    ${
                      submitted &&
                      selectedAnswer === index &&
                      index !== question.correctAnswer
                        ? "border-red-500 bg-red-50"
                        : ""
                    }
                  `}
                />
              ))}
            </RadioGroup>
          </CardContent>
          <div className="p-4 flex justify-end">
            {!submitted ? (
              <Button
                onClick={handleSubmit}
                disabled={selectedAnswer === null}
                variant="contained"
                color="primary"
              >
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNext} variant="contained" color="primary">
                {currentQuestion < totalQuestions - 1
                  ? "Next Question"
                  : "View Results"}
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h5">Quiz Results</Typography>
            <Typography variant="body2" color="textSecondary">
              You scored {score} out of {totalQuestions}
            </Typography>
            <ul>
              {answers.map((answer, index) => (
                <li key={index} className="flex items-center text-sm">
                  <span
                    className={`mr-2 h-2 w-2 rounded-full ${
                      answer.isCorrect ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  Question {index + 1}:{" "}
                  {answer.isCorrect ? "Correct" : "Incorrect"}
                </li>
              ))}
            </ul>
          </CardContent>
          <div className="p-4 flex justify-end">
            <Button onClick={handleExit} variant="contained" color="primary">
              Exit Quiz
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
