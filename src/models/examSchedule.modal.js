import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  subjectName: {
    type: String,
    required: [true, "Subject name is required"],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, "Exam date is required"],
  },
  startTime: {
    type: String,
    required: [true, "Exam start time is required"],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid start time format (HH:mm)"],
  },
  endTime: {
    type: String,
    required: [true, "Exam end time is required"],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid end time format (HH:mm)"],
  },
});

const examScheduleSchema = new mongoose.Schema(
  {
    course: {
      type: String,
      required: [true, "Course is required"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [1, "Year must be at least 1"],
      max: [6, "Year cannot exceed 6"], // for engineering/medical etc.
    },
    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: [1, "Semester must be at least 1"],
      max: [12, "Semester cannot exceed 12"],
    },
    subjects: {
      type: [subjectSchema],
      required: [true, "At least one subject is required"],
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: "Subjects array cannot be empty",
      },
    },
  },
  { timestamps: true }
);

export const ExamSchedule =  mongoose.model("ExamSchedule", examScheduleSchema);