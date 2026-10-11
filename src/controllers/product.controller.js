
import { prisma } from "../lib/prisma.js";

// GET /api/products
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { pid: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Get products error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get products",
    });
  }
};

// GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const pid = Number(req.params.id);

    if (!Number.isInteger(pid) || pid <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product ID must be a positive integer",
      });
    }

    const product = await prisma.product.findUnique({
      where: { pid },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get product",
    });
  }
};

// Validate product input
const validateProductInput = (body, isUpdate = false) => {
  const { pname, price, quantity } = body;

  if (!isUpdate || pname !== undefined) {
    if (typeof pname !== "string" || pname.trim() === "") {
      return "pname must be a non-empty string";
    }
  }

  if (!isUpdate || price !== undefined) {
    if (
      price === null ||
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      return "Price must be a valid non-negative number";
    }
  }

  if (!isUpdate || quantity !== undefined) {
    if (
      quantity === null ||
      quantity === "" ||
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) < 0
    ) {
      return "Quantity must be a non-negative integer";
    }
  }

  return null;
};

// POST /api/products
export const createProduct = async (req, res) => {
  try {
    const validationError = validateProductInput(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const { pname, price, quantity } = req.body;

    const product = await prisma.product.create({
      data: {
        pname: pname.trim(),
        price: Number(price),
        quantity: Number(quantity),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

// PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const pid = Number(req.params.id);

    if (!Number.isInteger(pid) || pid <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product ID must be a positive integer",
      });
    }

    const validationError = validateProductInput(req.body, true);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { pid },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const { pname, price, quantity } = req.body;

    const product = await prisma.product.update({
      where: { pid },
      data: {
        pname: pname !== undefined ? pname.trim() : undefined,
        price: price !== undefined ? Number(price) : undefined,
        quantity: quantity !== undefined ? Number(quantity) : undefined,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

// DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const pid = Number(req.params.id);

    if (!Number.isInteger(pid) || pid <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product ID must be a positive integer",
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { pid },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await prisma.product.delete({
      where: { pid },
    });

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};
