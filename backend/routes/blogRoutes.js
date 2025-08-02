import { Router } from "express";
import { createPost, getPost, getPosts } from "../controllers/blogControllers.js";
import upload from "../middlewares/multer.js";

const blogRouter = Router();

blogRouter.get("/", getPosts);
blogRouter.get("/:id", getPost);
blogRouter.post("/create", upload.single("image"), createPost);

export default blogRouter;