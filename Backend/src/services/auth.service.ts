import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import {
  generateToken,
  generateRefreshToken,
} from "../middleware/auth.middleware.js";

export const authService = {
  async register(email: string, password: string, name: string) {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Create new user
    const user = new User({ email, password, name });
    await user.save();

    // Generate tokens
    const accessToken = generateToken(user._id.toString(), user.email);
    const refreshToken = generateRefreshToken(user._id.toString());

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  },

  async login(email: string, password: string) {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const accessToken = generateToken(user._id.toString(), user.email);
    const refreshToken = generateRefreshToken(user._id.toString());

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  },

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || "your-refresh-secret",
      ) as { id: string };

      const user = await User.findById(decoded.id);
      if (!user) {
        throw new Error("User not found");
      }

      const newAccessToken = generateToken(user._id.toString(), user.email);
      return { accessToken: newAccessToken };
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  },

  async validateToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        email: string;
      };

      const user = await User.findById(decoded.id);
      return user ? user.toJSON() : null;
    } catch (error) {
      return null;
    }
  },
};
