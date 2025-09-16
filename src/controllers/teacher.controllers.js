import { Teacher } from "../models/user.modal.js";
import { sendMail } from "../helpers/mailer.js";

export const getTeachers = async (req, res) => {
  try {
    const { mainSubject, graduation, postGraduation } = req.query;

    const filters = { role: "teacher" };

    if (mainSubject) filters.mainSubject = mainSubject;
    if (graduation) filters.graduation = graduation;
    if (postGraduation) filters.postGraduation = postGraduation;

    const teachers = await Teacher.find(filters)
      .select("-password -otp -resetOtp -__v")
      .lean();

    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teachers",
      error: error.message,
    });
  }
};

export const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({
      _id: req.params.id,
      role: "teacher",
    })
      .select("-password -otp -resetOtp -__v")
      .lean();

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    res.status(200).json({ success: true, data: teacher });
  } catch (error) {
    console.error("Error fetching teacher:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teacher",
      error: error.message,
    });
  }
};

export const createTeacher = async (req, res) => {
  try {
    const data = req.body;

    // Ensure role is teacher
    data.role = "teacher";

    const newTeacher = new Teacher(data);
    await newTeacher.save();

    await sendMail(
        email,
        "teacher created successfully",
        `<h3>Dear ${newTeacher.name},</h3>
        <p>welcome. Our team will get back to you soon.</p>`
      );
  

    res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      data: newTeacher,
    });
  } catch (error) {
    console.error("Error creating teacher:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create teacher",
      error: error.message,
    });
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const updates = req.body;

    // Prevent role tampering
    delete updates.role;

    const teacher = await Teacher.findOneAndUpdate(
      { _id: req.params.id, role: "teacher" },
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password -otp -resetOtp -__v");


    await sendMail(
        email,
        "Teacher updated successfully",
        `<h3>teacher ${teacher.name},updated successfully </h3>`
      );
  

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      data: teacher,
    });
  } catch (error) {
    console.error("Error updating teacher:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update teacher",
      error: error.message,
    });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findOneAndDelete({
      _id: req.params.id,
      role: "teacher",
    });

    await sendMail(
        email,
        "Teacher deleted successfully",
        `<h3>teacher ${teacher.name},deleted successfully</h3>`
      );
  


    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete teacher",
      error: error.message,
    });
  }
};
