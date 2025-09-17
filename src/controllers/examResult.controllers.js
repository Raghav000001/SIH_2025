import createError from "http-errors";
import { generateResultPDF } from "../helpers/pdfGenerator.js";
import { ExamSchedule } from "../models/examSchedule.modal.js";
import ExamResult from "../models/examResult.modal.js";
import { Student } from "../models/user.modal.js";


export const uploadMarks = async (req, res, next) => {
  try {
    const { studentId, examId, marks } = req.body;

    if (!studentId || !examId || !marks || !Array.isArray(marks)) {
      throw createError(400, "studentId, examId and marks are required");
    }

    const student = await Student.findById(studentId);
    if (!student) throw createError(404, "Student not found");

    const exam = await ExamSchedule.findById(examId);
    if (!exam) throw createError(404, "Exam schedule not found");

    const examResult = new ExamResult({ student, exam, marks });
    await examResult.save();

    res.status(201).json({
      success: true,
      message: "Marks uploaded successfully",
      data: examResult,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentResult = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const results = await ExamResult.find({ student: studentId })
      .populate("exam", "examName semester examDate")
      .populate("student", "name rollNo course department");

    if (!results || results.length === 0) {
      throw createError(404, "No results found for this student");
    }

    res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    next(error);
  }
};

export const downloadStudentResult = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const results = await ExamResult.find({ student: studentId })
      .populate("exam", "examName semester examDate")
      .populate("student", "name rollNo course department");

    if (!results || results.length === 0) {
      throw createError(404, "No results found to download");
    }

    const studentInfo = results[0].student;

    generateResultPDF(studentInfo, results, res);
  } catch (error) {
    next(error);
  }
};
