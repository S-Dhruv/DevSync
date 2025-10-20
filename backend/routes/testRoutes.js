import { Router } from "express";
import {
  createTest,
  getTest,
  getTests,
} from "../controllers/testController.js";
const router = Router();
router.post("/api/submit-test", createTest);
router.post("/api/get-test", getTest);
router.post("/api/get-tests", getTests);
export default router;
