import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema(
  {
    hostel: { type: mongoose.Schema.Types.ObjectId, ref: "Hostel", required: true },
    roomNumber: { type: String, required: true },
    capacity: { type: Number, required: true },
    type: { type: String, enum: ["single", "double", "triple","four"], required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "student" }],
  },
  { timestamps: true }
);

export const Room = mongoose.model("Room", RoomSchema);
