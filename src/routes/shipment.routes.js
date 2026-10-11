
import express from "express";

import {
  getShipmentById,
  updateShipmentStatus,
} from "../controllers/shipment.controller.js";

import {
  authenticateToken,
  authorizeAdmin,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// Mọi endpoint đều yêu cầu đăng nhập
router.use(authenticateToken);

// Khách hàng chỉ xem được vận chuyển của đơn hàng thuộc về mình
router.get("/:id", getShipmentById);

// Chỉ Admin mới được cập nhật trạng thái
router.patch("/:id/status", authorizeAdmin, updateShipmentStatus);

export default router;
