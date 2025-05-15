import express from "express";
import { 
  getBanners, 
  getBanner, 
  createBanner, 
  updateBanner, 
  deleteBanner 
} from "../controllers/banner.controller.js";
import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

// Public routes
router.get("/", getBanners);
router.get("/:id", getBanner);

// Protected routes (admin only)
router.post("/", verifyToken, createBanner);
router.put("/:id", verifyToken, updateBanner);
router.delete("/:id", verifyToken, deleteBanner);

export default router;
