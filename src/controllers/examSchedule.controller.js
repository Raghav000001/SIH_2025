import { ExamSchedule } from "../models/examSchedule.modal.js";

export const createExamSchedule = async (req, res) => {
  try {
    const { course, department, year, semester, subjects } = req.body;

    if (!course || !department || !year || !semester || !subjects) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ error: "Subjects must be a non-empty array" });
    }

    const examSchedule = new ExamSchedule({
      course,
      department,
      year,
      semester,
      subjects,
    });

    await examSchedule.save();

    res.status(201).json({
      message: "Exam schedule created successfully",
      data: examSchedule,
    });
  } catch (error) {
    console.error("Error creating exam schedule:", error);
    res.status(500).json({ error: "Server error while creating exam schedule" });
  }
};

export const getExamSchedules = async (req, res) => {
  try {
    const schedules = await ExamSchedule.find().sort({ createdAt: -1 });
    res.status(200).json(schedules);
  } catch (error) {
    console.error("Error fetching exam schedules:", error);
    res.status(500).json({ error: "Server error while fetching exam schedules" });
  }
};

export const getExamScheduleById = async (req, res) => {
  try {
    const schedule = await ExamSchedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({ error: "Exam schedule not found" });
    }

    res.status(200).json(schedule);
  } catch (error) {
    console.error("Error fetching exam schedule:", error);
    res.status(500).json({ error: "Server error while fetching exam schedule" });
  }
};

export const updateExamSchedule = async (req, res) => {
  try {
    const schedule = await ExamSchedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!schedule) {
      return res.status(404).json({ error: "Exam schedule not found" });
    }

    res.status(200).json({
      message: "Exam schedule updated successfully",
      data: schedule,
    });
  } catch (error) {
    console.error("Error updating exam schedule:", error);
    res.status(500).json({ error: "Server error while updating exam schedule" });
  }
};
    

export const deleteExamSchedule = async (req, res) => {
  try {
    const schedule = await ExamSchedule.findByIdAndDelete(req.params.id);

    if (!schedule) {
      return res.status(404).json({ error: "Exam schedule not found" });
    }

    res.status(200).json({ message: "Exam schedule deleted successfully" });
  } catch (error) {
    console.error("Error deleting exam schedule:", error);
    res.status(500).json({ error: "Server error while deleting exam schedule" });
  }
};
