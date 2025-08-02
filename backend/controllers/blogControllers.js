import cloudinary from "../utils/cloudinary.js";
import postModel from "../models/blogModel.js";

export async function createPost(req, res) {
  const { title, content, desc } = req.body;
  console.log("req.body:", req.body);
  console.log("req.file:", req.file);
  try {
    let imgUrl = null;

    if(req.file) {
        const type = req.file.mimetype.startsWith("video") ? "video" : "image";
        const resultUrl = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { resource_type: type },
                (error, result) => {
                    if (error) return reject("Upload failed");
                    resolve(result.secure_url);
                }
            );  
            stream.end(req.file.buffer);
        });

        imgUrl = resultUrl;
    }

    const newPost = new postModel({
      title,
      content,
      imgUrl,
      desc,
    });

    await newPost.save();

    res.status(201).json({
      message: "Post created successfully",
      success: true,
      post: newPost,
    });

  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({
      message: "Error creating post",
      success: false,
      error: error.message,
    });
  }
}

export async function getPosts(req, res) {
    res.json({
        message : "Get all posts",
        success: true,
    })
}

export async function getPost(req, res) {
    res.json({
        message : "Get post by id",
        success: true,
    }) 
}