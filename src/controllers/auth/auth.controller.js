import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";

// ==========================================
// POST /api/auth/register
// ==========================================
export const register = async (req, res) => {
  try {
    const { username, fullname, password } = req.body;

    // 1. Validate input
    if (!username || !fullname || !password) {
      return res.status(400).json({
        success: false,
        message: "username, fullname and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // 2. Check username already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }

    // 3. Find Customer role
    // 3. Find normal role
    const customerRole = await prisma.role.findFirst({
      where: {
        rolename: "normal",
      },
    });

    if (!customerRole) {
      return res.status(500).json({
        success: false,
        message: "Customer role not found",
      });
    }

    // 4. Find Normal membership
    const basicMembership = await prisma.membership.findFirst({
      where: {
        mname: "Normal",
        score: 10,
      },
    });

    if (!basicMembership) {
      return res.status(500).json({
        success: false,
        message: "Basic membership not found",
      });
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Create user
    const user = await prisma.user.create({
      data: {
        username,
        fullname,
        password: hashedPassword,
        roleid: customerRole.roleid,
        mid: basicMembership.mid,
      },
      include: {
        role: true,
        membership: true,
      },
    });

    // 7. Never return password
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to register user",
    });
  }
};

// ==========================================
// POST /api/auth/login
// ==========================================
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "username and password are required",
      });
    }

    // 2. Find user
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
      include: {
        role: true,
        membership: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // 3. Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // 4. Create JWT
    const token = jwt.sign(
      {
        uid: user.uid,
        username: user.username,
        roleid: user.roleid,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      }
    );

    // 5. Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // 6. Return response
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: userWithoutPassword,
        accessToken: token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
  
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        uid: req.user.uid,
      },
      include: {
        role: true,
        membership: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { password, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
