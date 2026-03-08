import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { authService } from "../services/auth.service.js";

export const authController = {
  async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({ error: "Email, password, and name are required" });
        return;
      }

      if (password.length < 8) {
        res.status(400).json({ error: "Password must be at least 8 characters" });
        return;
      }

      const result = await authService.register(email, password, name);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Registration failed" });
      }
    }
  },

  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      const result = await authService.login(email, password);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Login failed" });
      }
    }
  },

  async refreshToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ error: "Refresh token is required" });
        return;
      }

      const result = await authService.refreshToken(refreshToken);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Token refresh failed" });
      }
    }
  },

  async validateToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({ error: "Token is required" });
        return;
      }

      const user = await authService.validateToken(token);
      if (!user) {
        res.status(401).json({ error: "Invalid token" });
        return;
      }

      res.status(200).json({ valid: true, user });
    } catch (error) {
      res.status(500).json({ error: "Token validation failed" });
    }
  },

  async me(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { User } = await import("../models/User.model.js");
      const user = await User.findById(req.userId);
      
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json(user.toJSON());
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  },
};
