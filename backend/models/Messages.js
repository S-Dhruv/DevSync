import mongoose, { Schema, model } from "mongoose";

const messagesSchema = new Schema({
  room: {
    type: String,
    required: true,
    unique: true,
  },
  message: [
    {
      userId: {
        type: String,
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      timestamps: {
        type: Date,
        default: Date.now,
      },
      tempId: {
        type: String,
        required: true,
      },
    },
  ],
});
export default model("Messages", messagesSchema);
