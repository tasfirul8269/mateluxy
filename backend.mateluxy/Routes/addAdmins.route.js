import express from "express";
import { addAdmins } from "../controllers/addAdmins.controller.js";

const router = express.Router();

router.post("/add-admins", addAdmins);

export default router;