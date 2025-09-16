import { sendMail } from "../helpers/mailer.js";
import { Student } from "../models/user.modal.js";

export const getStudents = async (req, res) => {
  try {
    const { course, department, yearOfEnrollment, hostelName } = req.query;

    const filters = { role: "student" };

    if (course) filters.course = course;
    if (department) filters.department = department;
    if (yearOfEnrollment) filters.yearOfEnrollment = yearOfEnrollment;
    if (hostelName) filters["hostel.hostelName"] = hostelName;

    const students = await Student.find(filters)
      .select("-password -otp -resetOtp -__v")
      .lean();

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students",
      error: error.message,
    });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.params.id, role: "student" })
      .select("-password -otp -resetOtp -__v")
      .lean();

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student",
      error: error.message,
    });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const updates = req.body;

    // Prevent role tampering
    delete updates.role;

    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, role: "student" },
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password -otp -resetOtp -__v");

    await sendMail(
        "braghav474@gmail.com",
        "student updated",
        `<h3>student ${student.name},updated successfully.</h3>
        <p>You may contact us for further details.</p>`
      );

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: student,
    });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update student",
      error: error.message,
    });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({
      _id: req.params.id,
      role: "student",
    });

    await sendMail(
        "braghav474@gmail.com",
        "student deleted",
        `<h3>Dear ${student.name},</h3>
        <p>student deleted successfully. 
        You may contact us for further details.</p>`
      );

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete student",
      error: error.message,
    });
  }
};
