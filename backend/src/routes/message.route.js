import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { sendMessage, getMessages, getUsersForSidebar } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar); // Fonksiyon adını düzelttim
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);

export default router;
