import express from "express";

import {
  createOrder,
  getOrders,
  getOrderById,
} from "../controllers/order.controller.js";

import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", getOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);

export default router;