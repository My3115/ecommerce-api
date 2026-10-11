
import { prisma } from "../lib/prisma.js";

const validStatuses = [
  "Pending",
  "Shipping",
  "Delivered",
  "Failed",
];

// GET /api/shipments/:id
export const getShipmentById = async (req, res) => {
  try {
    const shipid = Number(req.params.id);

    if (!Number.isInteger(shipid) || shipid <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid shipment ID",
      });
    }

    const shipment = await prisma.shipment.findFirst({
      where: {
        shipid,
        orders: {
          uid: req.user.uid,
        },
      },
      include: {
        orders: true,
      },
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: shipment,
    });
  } catch (error) {
    console.error("Get shipment error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// PATCH /api/shipments/:id/status
export const updateShipmentStatus = async (req, res) => {
  try {
    const shipid = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(shipid) || shipid <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid shipment ID",
      });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shipment status",
        allowedStatuses: validStatuses,
      });
    }

    const shipment = await prisma.shipment.findUnique({
      where: { shipid },
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    const updatedShipment = await prisma.shipment.update({
      where: { shipid },
      data: { status },
    });

    return res.status(200).json({
      success: true,
      message: "Shipment status updated successfully",
      data: updatedShipment,
    });
  } catch (error) {
    console.error("Update shipment status error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
