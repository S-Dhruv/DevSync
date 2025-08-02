import mongoose from "mongoose";
const { Schema } = mongoose;

const postSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    desc : { type: String, required: true },
    imgUrl : { type: String, default: null },
    createdAt: {
        type: Date,
        default: Date.now
    },
});


const postModel = mongoose.model("blogPost", postSchema);
export default postModel;