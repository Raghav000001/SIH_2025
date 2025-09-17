import crypto from "crypto";
import { razorpay } from "../helpers/razorpay.js";
import { Student } from "../models/user.modal.js";

// Step 1: Create Razorpay Order
export const createOrder = async (req, res) => {
  try {
    const { studentId } = req.body;

    // Student fetch
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Pending fee record find karo
    const pendingFee = student.fees.find(fee => fee.status === "pending");
    if (!pendingFee) {
      return res.status(400).json({ message: "No pending fee found" });
    }

    // Order create
    const options = {
      amount: pendingFee.amount * 100, // Razorpay works in paise
      currency: "INR",
      receipt: `receipt_${student._id}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order,
      studentId: student._id,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error creating order", error: error.message });
  }
};

// Step 2: Verify Payment
export const verifyPayment = async (req, res) => {
  try {
    const { studentId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Generate expected signature
    const sign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (sign !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Update student fee record
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const feeRecord = student.fees.find(fee => fee.status === "pending");
    if (!feeRecord) return res.status(400).json({ message: "No pending fee found" });

    feeRecord.status = "paid";
    feeRecord.receiptId = razorpay_payment_id; // save paymentId as receipt

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified & fee updated",
      student,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error verifying payment", error: error.message });
  }
};
