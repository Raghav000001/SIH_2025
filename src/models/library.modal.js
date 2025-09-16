import mongoose from "mongoose";

const LibraryTransactionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "student", required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },   // usually +14 days from issue hota hai
  returnDate: { type: Date, default: null },
  fine: { type: Number, default: 0 },
  status: { type: String, enum: ["issued", "returned"], default: "issued" },
}, { timestamps: true });

export const LibraryTransaction = mongoose.model("LibraryTransaction", LibraryTransactionSchema);
