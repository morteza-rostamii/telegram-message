import express from "express";
import usersController from "../controllers/users.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import imageUploadMid from "../../middlewares/img-upload.mid.js";
import Profile from "../models/Profile.js";
import profileEditor from "../../editors/profile.editor.js";
import passport from "passport";
import {
  FRONT_URL,
  JWT_EXPIRES_IN,
  JWT_SECRET,
  NODE_ENV,
} from "#@/config/config.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/", usersController.getUsers);

router.post("/request-otp", usersController.requestOtp);

router.post("/verify-otp", usersController.verifyOtp);

// logout
router.post("/logout", usersController.logout);

// profile
router.get("/profile", authMiddleware, usersController.getProfile);

// update profile:
router.put(
  "/profile/update",
  authMiddleware,
  imageUploadMid,
  async (req, res) => {
    try {
      const bio = req.body?.bio || "";
      const username = req.body?.username || "";

      // uploaded files
      const uploadedFiles = req.uploadedFiles;
      const filePath = uploadedFiles[0]?.url;

      const user = req.user;

      // update profile
      const profile = await Profile.findOne({ user: user._id });
      if (bio) profile.bio = bio;
      if (filePath) profile.avatar = filePath;
      if (username) user.username = username; // username is unique (error)

      profile.save();
      user.save();

      return res.status(200).json({
        message: "Profile updated successfully",
        success: true,
        data: {
          files: uploadedFiles,
          profile: profileEditor({ profile }),
        },
      });
    } catch (err) {
      console.error(err);

      // check for duplicate key error (username)
      if (err.code === 11000 && err.keyPattern?.username) {
        return res.status(400).json({
          message: "Username already exists",
          success: false,
          data: null,
          error: err,
        });
      }

      return res.status(500).json({
        message: "failed to update profile",
        success: false,
        data: null,
        error: err,
      });
    }
  }
);

// google login
router.get(
  "/google/login",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// google auth:
router.get(
  "/google",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/v1/users/google/login",
  }),
  (req, res) => {
    try {
      const user = req.user;
      console.log("user", user);
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      // store token in cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // redirect to frontend
      res.redirect(FRONT_URL + "/dashboard/testimonials");

      // return res.status.json({
      //   message: "google auth",
      //   success: true,
      //   data: {},
      // });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "failed to google auth",
        success: false,
        data: null,
        error,
      });
    }
  }
);

export default router;
