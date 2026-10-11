
import express from "express";

import {
  register,
  login,
  getMe,
} from "../controllers/auth/auth.controller.js";

import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateToken, getMe);

export default router;
