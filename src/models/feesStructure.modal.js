import mongoose from "mongoose";

const feeStructureSchema = new mongoose.Schema(
  {
    course: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1,
    },
    tuitionFee: {
      type: Number,
      required: true,
      min: 0,
    },
    hostelFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    libraryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    transportFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    otherCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalFee: {
      type: Number,
      required: true,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin who created this fee structure
      required: true,
    },
  },
  { timestamps: true }
);

// Calculate total automatically before saving
feeStructureSchema.pre("save", function (next) {
  this.totalFee =
    (this.tuitionFee || 0) +
    (this.hostelFee || 0) +
    (this.libraryFee || 0) +
    (this.transportFee || 0) +
    (this.otherCharges || 0);
  next();
});

export default mongoose.model("FeeStructure", feeStructureSchema);
