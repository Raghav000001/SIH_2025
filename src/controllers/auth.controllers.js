import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer"
import { User } from "../models/user.modal.js";

export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Response with role + password status
    //pass status true/false me aayega to frontend pe uske basis pe hume create password page ya otp page show karna hai
    return res.status(200).json({
      success: true,
      message: "User found",
      data: {
        role: user.role,
        hasPassword: !!user.password,
      },
    });
  } catch (error) {
    console.error("Error in checkEmail:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const loginWithPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT with role
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Set cookie
    res.cookie("auth_token", token, {
      httpOnly: true,   // frontend JS can't access
      secure: process.env.NODE_ENV === "production", // only https in prod
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    // Send response
    return res.json({
      success: true,
      message: `Login successful as ${user.role} `,
      role: user.role 
    });

  } catch (error) {
    console.error("Error in loginWithPassword:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const requestOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // 6 digit
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min ka time diya hai

    // Save to DB
    user.otp = otp.toString();
    user.otpExpiry = otpExpiry;
    await user.save();

    // Nodemailer 
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Auth System" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
      html: `<h3>Your OTP is <b>${otp}</b></h3><p>It will expire in 5 minutes.</p>`,
    });

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error in requestOTP:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check OTP & expiry
    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ success: false, message: "No OTP requested" });
    }

    if (user.otpExpiry < Date.now()) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // OTP verified agar hogya to cookie clear
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    //  JWT token 
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "OTP verified, login successful",
      role: user.role,
    });
  } catch (err) {
    console.error("Error in verifyOTP:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Email, password and confirmPassword required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.password) {
      return res
        .status(400)
        .json({ message: "Password already set. Use login instead." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password created successfully" });
  } catch (error) {
    console.error("Error in createPassword:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// forgot password ki 3 api bani hai
// 1. requestForgotPass
// 2. verifyOtpForgotPass
// 3. resetPass
export const requestForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    //  OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 min

    user.resetOtp = otp;
    user.resetOtpExpiry = otpExpiry;
    await user.save();

    //  OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"MyApp Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    });

    return res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("Error in requestForgotPassword:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//  2: Verify OTP
export const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email & OTP required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.resetOtp || user.resetOtp !== otp || !user.resetOtpExpiry || user.resetOtpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Clear OTP fields
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // reset token (JWT)
    const resetToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "10m" } 
    );

    // resetToken in  cookie
    res.cookie("resetToken", resetToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 10 * 60 * 1000, // 10 min
    });

    return res.status(200).json({ success: true, message: "OTP verified successfully" });

  } catch (error) {
    console.error("Error in verifyForgotPasswordOtp:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 3. Reset Password
export const resetForgotPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "Both password fields required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    //  Extract resetToken from cookie
    const resetToken = req.cookies.resetToken;
    if (!resetToken) {
      return res.status(401).json({ success: false, message: "Reset token missing" });
    }

    //  Verify resetToken
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired reset token" });
    }

    //  Update password
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    //  Clear resetToken cookie
    res.clearCookie("resetToken");

    return res.status(200).json({ success: true, message: "Password reset successful" });

  } catch (error) {
    console.error("Error in resetForgotPassword:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};