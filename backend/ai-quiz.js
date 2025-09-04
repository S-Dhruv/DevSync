import { PromptTemplate } from "@langchain/core/prompts";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatGroq } from "@langchain/groq";
import * as dotenv from "dotenv";
dotenv.config();
const model = new ChatGroq({
  model: "openai/gpt-oss-20b",
  apiKey: process.env.ApiKey,
});
const quizgen = new PromptTemplate({
  template: `
You are a quiz generator AI. Generate 10 **multiple choice** questions based on the following input:

- Subject: {subjects}
- Difficulty: {difficulty}

Each question must be a JSON object with the following fields:
- "question": The question text
- "options": An array of 4 unique answer options
- "correctOption": The **exact string value** that is the correct answer (must match one of the options)

Return ONLY a JSON array wrapped in a Markdown code block like this:
Question:
Options:
CorrectOption:


Do not include any explanation or extra text — just return the JSON code block.`,
  inputVariables: ["subjects", "difficulty"],
});

export async function generateQuiz(subjects, difficulty) {
  try {
    const formattedPrompt = await quizgen.format({
      subjects,
      difficulty,
    });

    const jsonPrompt = `${formattedPrompt}
    Give me an array of questions, wrong options and correct option for each test. 
    Make sure it is a JSON format and it is easy to parse and display.`;
    const response = await model.invoke(jsonPrompt);
    return response;
  } catch (error) {
    console.error("Error generating study plan:", error);
  }
}
