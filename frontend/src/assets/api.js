// api.js
import axios from "axios";

const API = axios.create({
  baseURL: "https://emkc.org/api/v2/piston",
});
const getFileName = (language) => {
  switch (language) {
    case "python":
      return "main.py";
    case "javascript":
      return "main.js";
    case "java":
      return "Main.java"; // Java class must be Main
    case "c":
      return "main.c";
    case "cpp":
      return "main.cpp";
    default:
      return "main.txt";
  }
};

const getVersion = (language) => {
  switch (language) {
    case "java":
      return "15.0.2";
    case "python":
      return "3.10.0"; // new default
    case "javascript":
      return "18.15.0"; // latest Node
    case "c":
      return "10.2.0"; // GCC
    case "cpp":
      return "10.2.0"; // g++
    default:
      return "latest";
  }
};
export const executeCode = async (sourceCode, language, stdin) => {
  try {
    // If language is empty, throw explicit error
    if (!language) {
      throw new Error("Language not selected!");
    }

    console.log(`Executing ${language} code...`);

    const response = await API.post("/execute", {
      language: language,
      version: getVersion(language),
      files: [
        {
          name: getFileName(language), // ✅ REQUIRED
          content: sourceCode,
        },
      ],
      stdin: stdin, // optional input
      args: [], // optional CLI arguments
      compile_timeout: 20000,
      run_timeout: 20000,
      compile_memory_limit: -1,
      run_memory_limit: -1,
    });

    return response.data;
  } catch (error) {
    console.error(
      "Error executing code:",
      error.response?.data || error.message || error,
    );
    throw error;
  }
};
