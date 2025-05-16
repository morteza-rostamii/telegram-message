import User from "../models/User.js";
import Profile from "../models/Profile.js";
import Otp from "../models/Otp.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../../config/config.js";
import { NODE_ENV } from "../../config/config.js";
import canRequestOtp from "../utils/can-request-otp.util.js";
import profileEditor from "../../editors/profile.editor.js";

const usersController = {
  getUsers: async (req, res) => {
    try {
      // Simulate fetching users from a database
      const users = await User.find({});

      res.status(200).json({
        message: "Users fetched successfully",
        success: true,
        data: { users },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "failed to fetch users",
        success: false,
        data: null,
        error,
      });
    }
  },

  async requestOtp(req, res) {
    const { email } = req.body;
    try {
      // check if user can request OTP
      if (!canRequestOtp(req.ip, email)) {
        return res.status(429).json({
          message: "Too many requests, please try again later",
          success: false,
          data: null,
        });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit

      let user = await User.findOne({ email });

      if (!user) {
        // generate random username
        const username = Math.random().toString(36).substring(7);

        user = new User({ email, username });
        await user.save();

        // create a profile
        const profile = new Profile({ user: user._id });
        await profile.save();
      }

      // expires in 5 minutes
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // save otp
      const newOtp = new Otp({ user: user._id, otp, expiresAt });
      await newOtp.save();

      // Simulate sending OTP to the user's email
      res.status(200).json({
        message: "OTP sent successfully",
        data: { user, newOtp },
        success: true,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "failed to send OTP",
        success: false,
        data: null,
        error,
      });
    }
  },

  async verifyOtp(req, res) {
    const { otp, email } = req.body;
    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
          success: false,
          data: null,
        });
      }

      // check if the otp is valid

      // get the latest otp for this user
      const otpDoc = await Otp.findOne({ user: user._id }).sort({
        createdAt: -1,
      });

      if (!otpDoc) {
        return res.status(400).json({
          message: "Invalid OTP",
          success: false,
          data: null,
        });
      }

      if (otpDoc.otp !== otp) {
        return res.status(400).json({
          message: "Invalid OTP",
          success: false,
          data: null,
        });
      }

      if (otpDoc.expiresAt < new Date()) {
        return res.status(400).json({
          message: "OTP expired",
          success: false,
          data: null,
        });
      }

      // delete all otps for this user
      await Otp.deleteMany({ user: user._id });

      const token = jwt.sign(
        { userId: user._id, email: user.email },
        JWT_SECRET,
        {
          expiresIn: JWT_EXPIRES_IN,
        }
      );

      // Set JWT as HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "lax",
        // 1 day
        maxAge: 24 * 60 * 60 * 1000,
      });

      const profile = await Profile.findOne({ user: user._id }).lean();

      // Simulate verifying OTP
      res.status(200).json({
        message: "OTP verified successfully",
        data: { user, profile: profileEditor({ profile }) },
        success: true,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "failed to verify OTP",
        success: false,
        data: null,
        error,
      });
    }
  },

  async logout(req, res) {
    try {
      // Clear JWT cookie
      res.clearCookie("token");

      // Simulate user logout
      res.status(200).json({
        message: "User logged out successfully",
        success: true,
        data: null,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Internal server error",
        success: false,
        data: null,
        error,
      });
    }
  },

  async getProfile(req, res) {
    try {
      const user = req.user;

      // get profile
      const profile = await Profile.findOne({ user: user._id }).lean();

      res.status(200).json({
        message: "Profile fetched successfully",
        success: true,
        data: { user, profile: profileEditor({ profile }) },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "failed to fetch profile",
        success: false,
        data: null,
      });
    }
  },
};

export default usersController;
