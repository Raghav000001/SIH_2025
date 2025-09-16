import mongoose from "mongoose";

//  Base Schema (common fields for all roles)
const BaseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    password: { type: String, default: null },
    city: { type: String, required: true },
    state: { type: String, required: true },
    service: { type: Boolean, default: true },
    role: {
      type: String,
      required: true,
      enum: ["director", "teacher", "student"],
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "others"],
    },
    dob: { type: Date, required: true },

    // login otp fields
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },

    // forgot password otp fields
    resetOtp: { type: String, default: null },
    resetOtpExpiry: { type: Date, default: null },
  },
  {
    timestamps: true,
    discriminatorKey: "role",
    collection: process.env.MONGODB_USER_COLLECTION || "users",
  }
);


//  Base User Model
const User = mongoose.model(
  process.env.MONGODB_USER_COLLECTION || "users",
  BaseSchema
);

//  Director Schema
const DirectorSchema = new mongoose.Schema({
  graduation: { type: String, required: true },
  postGraduation: { type: String, default: null },
});

//  Teacher Schema
const TeacherSchema = new mongoose.Schema({
  graduation: { type: String, required: true },
  postGraduation: { type: String, default: null },
  mainSubject: { type: String, required: true },
  otherSubjects: { type: [String], default: [] },
  photo: { type: String, required: true },
  aadharCard: { type: String, required: true },
  tenthMarksheet: { type: String, required: true },   // Cloudinary URL
  twelfthMarksheet: { type: String, required: true }, // Cloudinary URL
  graduationMarksheet: { type: String, required: true },   // Cloudinary URL
  postGraduationMarksheet: { type: String, required: true }, // Cloudinary URL
  
});

//  Student Schema
const StudentSchema = new mongoose.Schema({
  course: { type: String, required: true },
  department: { type: String, required: true },
  rollNo: { type: String, required: true, unique: true },
  yearOfEnrollment: { type: String, required: true },
  fatherName: { type: String, required: true },
  fatherPhoneNumber: { type: String, required: true },
  motherName: { type: String, required: true },
  aadharNumber: { type: String, required: true, unique: true },

  // Admission Status
  admissionStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  // Admission Documents
  admissionDocs: {
    tenthMarksheet: { type: String, required: true },   // Cloudinary URL
    twelfthMarksheet: { type: String, required: true }, // Cloudinary URL
    photo: { type: String, required: true },
    signature: { type: String, required: true },
    casteCertificate: { type: String, default: null },  // optional
    ewsCertificate: { type: String, default: null },    // optional
    domicile: { type: String, default: null },          // optional
    sportsCertificate: { type: String, default: null }, // optional
    aadharCard: { type: String, required: true },
  },

  // Fee Records
  fees: [
    {
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now },
      mode: { type: String, enum: ["cash", "online", "cheque"], required: true },
      receiptId: { type: String, required: true },
      status: { type: String, enum: ["paid", "pending"], default: "pending" },
    },
  ],

  // Hostel Allocation
  hostel: {
    hostelName: { type: String, default: null },
    roomNumber: { type: String, default: null },
    isAllocated: { type: Boolean, default: false },
  },

  // Examination Records
  exams: [
    {
      subject: { type: String, required: true },
      marks: { type: Number, required: true },
      grade: { type: String, default: null },
      semester: { type: String, required: true },
    },
  ],
});






//  Discriminators
const Director = User.discriminator("director", DirectorSchema);
const Teacher = User.discriminator("teacher", TeacherSchema);
const Student = User.discriminator("student", StudentSchema);

export { User, Director, Teacher, Student };
