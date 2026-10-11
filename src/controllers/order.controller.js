
import { prisma } from "../lib/prisma.js";

// POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const { items } = req.body;
    const uid = req.user.uid;

    // 1. Kiểm tra danh sách sản phẩm
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one product",
      });
    }

    // 2. Kiểm tra dữ liệu đầu vào
    for (const item of items) {
      if (
        !Number.isInteger(Number(item.pid)) ||
        Number(item.pid) <= 0 ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Each item must have a valid pid and positive integer quantity",
        });
      }
    }

    // Không cho phép một sản phẩm xuất hiện nhiều lần trong cùng request
    const productIds = items.map((item) => Number(item.pid));

    if (new Set(productIds).size !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate products are not allowed",
      });
    }

    // 3. Tạo đơn hàng và cập nhật tồn kho trong một transaction
    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: {
          pid: { in: productIds },
        },
      });

      if (products.length !== productIds.length) {
        const error = new Error("One or more products do not exist");
        error.statusCode = 404;
        throw error;
      }

      const productMap = new Map(
        products.map((product) => [product.pid, product])
      );

      // Kiểm tra tồn kho trước khi tạo đơn
      for (const item of items) {
        const product = productMap.get(Number(item.pid));

        if (product.quantity < item.quantity) {
          const error = new Error(
            `Insufficient stock for product ${item.pid}`
          );
          error.statusCode = 400;
          throw error;
        }
      }

      const newOrder = await tx.orders.create({
        data: {
          uid,
        },
      });

      for (const item of items) {
        const pid = Number(item.pid);
        const product = productMap.get(pid);

        // Cập nhật tồn kho có điều kiện để tránh bán vượt số lượng còn lại
        const stockUpdate = await tx.product.updateMany({
          where: {
            pid,
            quantity: { gte: item.quantity },
          },
          data: {
            quantity: { decrement: item.quantity },
          },
        });

        if (stockUpdate.count !== 1) {
          const error = new Error(
            `Insufficient stock for product ${pid}`
          );
          error.statusCode = 400;
          throw error;
        }

        await tx.order_detail.create({
          data: {
            oid: newOrder.oid,
            pid,
            quantity: item.quantity,
            price: product.price,
          },
        });
      }

            // Create shipment for the new order
      await tx.shipment.create({
        data: {
          oid: newOrder.oid,
          status: "Pending",
        },
      });

      return tx.orders.findUnique({
        where: { oid: newOrder.oid },
        include: {
          order_detail: {
            include: {
              product: true,
            },
          },
          shipment: true,
        },
      });
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create order error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
//


export const getOrders = async (req, res) => {
  try {
    const orders = await prisma.orders.findMany({
      where: {
        uid: req.user.uid,
      },
      orderBy: {
        createat: "desc",
      },
      include: {
        order_detail: {
          include: {
            product: true,
          },
        },
        shipment: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const oid = Number(req.params.id);

    if (!Number.isInteger(oid) || oid <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await prisma.orders.findFirst({
      where: {
        oid,
        uid: req.user.uid,
      },
      include: {
        order_detail: {
          include: {
            product: true,
          },
        },
        shipment: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
