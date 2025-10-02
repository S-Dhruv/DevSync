import { Schema, model } from "mongoose";

const roomSchema = new Schema({
  roomId: {
    type: String,
    required: true,
  },
  users: [
    {
      userId: String,
    },
  ],
});
export default model("room", roomSchema);
