import express from "express";
import { adminSignIn } from "../controllers/adminSignIn.controller.js";

const router = express.Router();

router.post("/admin-login",adminSignIn);

export default router;