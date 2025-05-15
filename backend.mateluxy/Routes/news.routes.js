import express from "express";
import { 
  getAllNews, 
  getNewsById, 
  getNewsBySlug,
  createNews, 
  updateNews, 
  deleteNews 
} from "../controllers/news.controller.js";
import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

// Public routes
router.get("/", getAllNews);
router.get("/id/:id", getNewsById);
router.get("/slug/:slug", getNewsBySlug);

// Protected routes - require authentication
router.post("/", verifyToken, createNews);
router.put("/:id", verifyToken, updateNews);
router.delete("/:id", verifyToken, deleteNews);

export default router; 