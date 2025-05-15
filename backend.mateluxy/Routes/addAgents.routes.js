import express from "express";
import {addAgents} from "../controllers/addAgents.controller.js";

const router = express.Router();

router.post("/add-agents",addAgents);

export default router;