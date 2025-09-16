import mongoose from "mongoose";

const HostelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    capacity: { type: Number, required: true },
    warden: { type: String, required: true },
  },
  { timestamps: true }
);

export const Hostel = mongoose.model("Hostel", HostelSchema);
