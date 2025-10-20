import { Schema, model } from "mongoose";
const TestSchema = new Schema({
  testName: String,
  roomId: String,
  questions: [
    {
      questionName: [String],
      testCases: [String],
      Output: [String],
    },
  ],
});

export default model("Test", TestSchema);
