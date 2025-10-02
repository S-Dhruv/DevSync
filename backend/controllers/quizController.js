import { generateQuiz } from "../ai-quiz.js";
import Quiz from "../models/Quiz.js";
import { jsonrepair } from "jsonrepair";
export async function createQuiz(req, res) {
  try {
    const { subjects, difficulty, roomCode } = req.body;

    const response = await generateQuiz(subjects, difficulty);
    const val = response.content;

    const matches = [...val.matchAll(/```json\n([\s\S]*?)\n```/g)];

    if (!matches.length) {
      console.error("No JSON code block found in response.");
      return res.status(500).json({ error: "No JSON found in AI response." });
    }

    const jsonString = matches[0][1].trim();

    let rawQuizData;
    try {
      const repaired = jsonrepair(jsonString);
      rawQuizData = JSON.parse(repaired);
    } catch (err) {
      console.error("Failed to parse or repair JSON:", err.message);
      return res.status(500).json({ error: "Invalid JSON format from AI." });
    }
    console.log(rawQuizData);

    const newData = rawQuizData.map((q) => {
      const correctIdx = q.options.indexOf(q.correctOption);
      return {
        question: q.question,
        options: q.options,
        correctAnswer: correctIdx,
      };
    });
    const data = Quiz.findOne({ roomCode });
    if (data !== null) {
      await Quiz.updateOne(
        { roomCode },
        { $set: { quizData: newData } },
        { upsert: true }
      );
    } else {
      const addQuiz = new Quiz({
        roomCode,
        quizData: newData,
      });
      await addQuiz.save();
    }
    res.json({
      success: true,
      message: "Quiz initialized and saved successfully!",
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    res.status(500).json({ error: "Failed to generate quiz." });
  }
}

export async function saveQuiz(req, res) {
  try {
    const { roomCode, quizData } = req.body;

    if (!roomCode || !Array.isArray(quizData)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid JSON format" });
    }

    for (const question of quizData) {
      if (
        typeof question.question !== "string" ||
        !Array.isArray(question.options) ||
        question.options.length < 2 ||
        typeof question.correctAnswer !== "number" ||
        question.correctAnswer < 0 ||
        question.correctAnswer >= question.options.length
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid question format" });
      }
    }

    let existingQuiz = await Quiz.findOne({ roomCode });
    if (existingQuiz) {
      existingQuiz.quizData = quizData;
      await existingQuiz.save();
    } else {
      await Quiz.create({ roomCode, quizData });
    }

    res.json({ success: true, message: "Quiz saved successfully!" });
  } catch (error) {
    console.error("Error saving quiz:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function getQuiz(req, res) {
  const { roomCode } = req.body;
  try {
    const quiz = await Quiz.findOne({ roomCode: roomCode });
    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }
    res.json({ success: true, quizData: quiz.quizData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching quiz" });
  }
}

export async function quizResults(req, res) {
  try {
    const { userId, roomCode, score, totalQuestions, answers } = req.body;

    const newResult = new Result({
      userId,
      roomCode,
      score,
      totalQuestions,
      answers,
    });

    await newResult.save();
    res.json({ message: "Results saved successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error saving results", error });
  }
}
