import { Router } from "express";
import {
  createQuiz,
  saveQuiz,
  getQuiz,
  quizResults,
} from "../controllers/quizController.js";
const router = Router();
router.post("/api/init-quiz", createQuiz);
router.post("/api/save-quiz", saveQuiz);
router.post("/api/get-quiz", getQuiz);
router.post("/results", quizResults);

export default router;
