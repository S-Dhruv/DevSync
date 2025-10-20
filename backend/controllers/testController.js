// model
import Test from "../models/Test.js";
export async function createTest(req, res) {
  const { roomId, title, question, testCases, outputs } = req.body;
  const existingTitle = await Test.findOne({ testName: title });
  console.log(question, testCases, outputs);
  if (existingTitle) {
    return res.status(400).json({ message: "Title already exists" });
  }
  try {
    const questionsArray = question.map((q, index) => ({
      questionName: [q],
      testCases: testCases[index],
      Output: outputs[index],
    }));

    const newTest = new Test({
      testName: title,
      roomId,
      questions: questionsArray,
    });
    await newTest.save();
    return res.status(200).json({ message: "Test created successfully" });
  } catch (err) {
    console.log("Error", err);
  }
}

export async function getTests(req, res) {
  const { roomId } = req.body;
  try {
    const tests = await Test.find({ roomId });
    console.log(roomId);
    return res.status(200).json({ tests });
  } catch (err) {
    console.log("Error", err);
  }
}

export async function getTest(req, res) {
  const { roomId, title } = req.body;
  try {
    const test = await Test.findOne({ roomId, testName: title });
    return res.status(200).json({ test });
  } catch (err) {
    console.log("Error", err);
  }
}
