import mongoose from "mongoose";

const ExamResultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamSchedule",
      required: true,
    },
    marks: [
      {
        subjectCode: { type: String, required: true },
        subjectName: { type: String, required: true },
        marksObtained: { type: Number, required: true, min: 0 },
        maxMarks: { type: Number, required: true },
        grade: { type: String, default: null }, // e.g., A, B, C, F
      },
    ],
    overallPercentage: { type: Number, default: 0 },
    resultStatus: {
      type: String,
      enum: ["pass", "fail", "pending"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Pre-save hook for auto calculation of percentage & result
ExamResultSchema.pre("save", function (next) {
  if (this.marks && this.marks.length > 0) {
    const totalObtained = this.marks.reduce(
      (acc, m) => acc + m.marksObtained,
      0
    );
    const totalMax = this.marks.reduce((acc, m) => acc + m.maxMarks, 0);

    this.overallPercentage = ((totalObtained / totalMax) * 100).toFixed(2);

    this.resultStatus = this.overallPercentage >= 40 ? "pass" : "fail";
  }
  next();
});

const ExamResult = mongoose.model("ExamResult", ExamResultSchema);

export default ExamResult;
