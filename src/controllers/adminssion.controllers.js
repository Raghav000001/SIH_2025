import { Student } from "../models/user.modal.js";
import { sendMail } from "../helpers/mailer.js";
import FeeStructure from "../models/feesStructure.modal.js"

export const applyForAdmission = async (req, res) => {
  try {
    const {
      name,
      email,
      course,
      department,
      rollNo,
      yearOfEnrollment,
      fatherName,
      fatherPhoneNumber,
      motherName,
      aadharNumber,
    } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    // Duplicate check
    const existing = await Student.findOne({ $or: [{ aadharNumber }, { rollNo }] });
    if (existing) {
      return res.status(400).json({ message: "Student with same Aadhaar or Roll No already exists" });
    }

    // Files handle
    const admissionDocs = {
      tenthMarksheet: req.files["tenthMarksheet"]?.[0]?.path,
      twelfthMarksheet: req.files["twelfthMarksheet"]?.[0]?.path,
      photo: req.files["photo"]?.[0]?.path,
      signature: req.files["signature"]?.[0]?.path,
      aadharCard: req.files["aadharCard"]?.[0]?.path,
      casteCertificate: req.files["casteCertificate"]?.[0]?.path || null,
      ewsCertificate: req.files["ewsCertificate"]?.[0]?.path || null,
      domicile: req.files["domicile"]?.[0]?.path || null,
      sportsCertificate: req.files["sportsCertificate"]?.[0]?.path || null,
    };

    // Validation for required docs
    if (!admissionDocs.tenthMarksheet || !admissionDocs.twelfthMarksheet || !admissionDocs.photo || !admissionDocs.signature || !admissionDocs.aadharCard) {
      return res.status(400).json({ message: "Required documents missing" });
    }

    const student = await Student.create({
      name,
      email,
      course,
      department,
      rollNo,
      yearOfEnrollment,
      fatherName,
      fatherPhoneNumber,
      motherName,
      aadharNumber,
      admissionDocs,
      admissionStatus: "pending",
      role: "student",
    });

    // Send email
    await sendMail(
      email,
      "Admission Application Received",
      `<h3>Dear ${student.name},</h3>
      <p>Thank you for applying for admission. Our team will review your application and get back to you soon.</p>`
    );

    res.status(200).json({ message: "Admission form submitted successfully", student });
  } catch (error) {
    console.error("Admission Apply Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


  export const approveAdmission = async (req, res) => {
    try {
      const { studentId } = req.params;
  
      // 1. Student fetch
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
  
      // 2. Fee Structure fetch (course + year match)
      const feeStructure = await FeeStructure.findOne({
        course: student.course,
        year: parseInt(student.yearOfEnrollment), // 
      });
  
      if (!feeStructure) {
        return res.status(400).json({
          message: `No fee structure defined for course: ${student.course}, year: ${student.yearOfEnrollment}`,
        });
      }
  
      // 3. Admission approve + attach fee record
      student.admissionStatus = "approved";
      student.fees.push({
        amount: feeStructure.totalFee,
        mode: "online", // default, real update jab payment hoga
        receiptId: `PENDING-${Date.now()}`,
        status: "pending",
      });
  
      await student.save();
  
      // 4. Send email notification
      await sendMail(
        student.email,
        "Admission Approved 🎉",
        `<h3>Dear ${student.name},</h3>
          <p>Congratulations! Your admission has been approved. 🎓</p>
          <p>Your total fee for <b>${student.course}</b> (${student.yearOfEnrollment}) is <b>₹${feeStructure.totalFee}</b>.</p>
          <p>Please proceed with the payment at the earliest.</p>`
      );
  
      return res.status(200).json({
        message: "Admission approved successfully & fee structure attached",
        student,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error approving admission",
        error: error.message,
      });
    }
  };
  
  export const rejectAdmission = async (req, res) => {
    try {
      const { studentId } = req.params;
  
      const student = await Student.findByIdAndUpdate(
        studentId,
        { admissionStatus: "rejected" },
        { new: true }
      );
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
  
      return res.status(200).json({
        message: "Admission rejected successfully",
        student,
      });
    } catch (error) {
      return res.status(500).json({ message: "Error rejecting admission", error });
    }
  };
  
  export const keepPending = async (req, res) => {
    try {
      const { studentId } = req.params;
  
      const student = await Student.findByIdAndUpdate(
        studentId,
        { admissionStatus: "pending" },
        { new: true }
      );
  
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
  
      return res.status(200).json({
        message: "Admission status set to pending",
        student,
      });
    } catch (error) {
      return res.status(500).json({ message: "Error updating admission status", error });
    }
  };
  
  export const fetchAdmissions = async (req, res) => {
    try {
      const { status, search, page = 1, limit = 10 } = req.query;
  
      let filter = {};
      if (status) {
        filter.admissionStatus = status; // pending / approved / rejected
      }
  
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ];
      }
  
      //  Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
  
      const students = await Student.find(filter)
        .select("-password -otp -resetOtp -resetOtpExpiry") // exclude sensitive fields
        .sort({ createdAt: -1 }) // latest first
        .skip(skip)
        .limit(parseInt(limit));
  
      const total = await Student.countDocuments(filter);
  
      res.status(200).json({
        success: true,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        students,
      });
    } catch (error) {
      console.error("Fetch Admissions Error:", error.message);
      res.status(500).json({
        success: false,
        message: "Error fetching admissions",
      });
    }
  };