import { sendMail } from "../helpers/mailer.js";
import { Student } from "../models/user.modal.js";
import { Hostel } from "../models/hostel.modal.js";
import { Room } from "../models/room.modal.js";


// 1. Hostel crud with mailer (admin ko bhej dia maine direct) 
// 2. rooms crud 
// 3. student allocation with mail



// Common response helpers
const successResponse = (res, code, message, data = null) =>
  res.status(code).json({ success: true, message, data });

const errorResponse = (res, code, message) =>
  res.status(code).json({ success: false, message });



/* -------------------- 1. HOSTEL CRUD -------------------- */

// Add hostel
export const createHostel = async (req, res) => {
  try {
    const { name, location, capacity, warden } = req.body;

    if (!name || !location || !capacity || !warden)
      return errorResponse(res, 400, "All fields are required");

    const existing = await Hostel.findOne({ name });
    if (existing) return errorResponse(res, 409, "Hostel already exists");

    const hostel = await Hostel.create({ name, location, capacity, warden });

    await sendMail(
      "braghav474@gmail.com",
      "New Hostel Added",
      `<h2>New Hostel Created</h2><p>Name: ${name}, Capacity: ${capacity}</p>`
    );

    successResponse(res, 201, "Hostel created successfully", hostel);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get all hostels
export const getHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find().populate("warden", "name email");
    if (!hostels.length) return errorResponse(res, 404, "No hostels found");
    successResponse(res, 200, "Hostels fetched successfully", hostels);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get single hostel
export const getHostelById = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id).populate(
      "warden",
      "name email"
    );
    if (!hostel) return errorResponse(res, 404, "Hostel not found");
    successResponse(res, 200, "Hostel fetched successfully", hostel);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Update hostel
export const updateHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!hostel) return errorResponse(res, 404, "Hostel not found");

    await sendMail(
      "braghav474@gmail.com",
      "Hostel Updated",
      `<h2>Hostel Updated</h2><p>${hostel.name} details were updated.</p>`
    );

    successResponse(res, 200, "Hostel updated successfully", hostel);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Delete hostel
export const deleteHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findByIdAndDelete(req.params.id);
    if (!hostel) return errorResponse(res, 404, "Hostel not found");

    await Room.deleteMany({ hostel: hostel._id }); // delete all rooms also

    await sendMail(
      "braghav474@gmail.com",
      "Hostel Deleted",
      `<h2>Hostel Deleted</h2><p>${hostel.name} has been removed.</p>`
    );

    successResponse(res, 200, "Hostel deleted successfully");
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

/* -------------------- 2. ROOM MANAGEMENT -------------------- */

// Add room to hostel
export const addRoom = async (req, res) => {
  try {
    const { roomNumber, capacity, type } = req.body;
    const hostelId = req.params.id;

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) return errorResponse(res, 404, "Hostel not found");

    const existingRoom = await Room.findOne({ hostel: hostelId, roomNumber });
    if (existingRoom)
      return errorResponse(res, 409, "Room already exists in this hostel");

    const room = await Room.create({ hostel: hostelId, roomNumber, capacity, type });

    await sendMail(
      "braghav474@gmail.com",
      "New Room Added",
      `<h2>Room Added</h2><p>Room ${roomNumber} added to hostel ${hostel.name}</p>`
    );

    successResponse(res, 201, "Room added successfully", room);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get all rooms of hostel
export const getHostelRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ hostel: req.params.id });
    if (!rooms.length) return errorResponse(res, 404, "No rooms found");
    successResponse(res, 200, "Rooms fetched successfully", rooms);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get single room
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId).populate("hostel", "name");
    if (!room) return errorResponse(res, 404, "Room not found");
    successResponse(res, 200, "Room fetched successfully", room);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Update room
export const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.roomId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!room) return errorResponse(res, 404, "Room not found");

    await sendMail(
      "braghav474@gmail.com",
      "Room Updated",
      `<h2>Room Updated</h2><p>Room ${room.roomNumber} was updated</p>`
    );

    successResponse(res, 200, "Room updated successfully", room);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Delete room
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.roomId);
    if (!room) return errorResponse(res, 404, "Room not found");

    await sendMail(
      "braghav474@gmail.com",
      "Room Deleted",
      `<h2>Room Deleted</h2><p>Room ${room.roomNumber} has been deleted</p>`
    );

    successResponse(res, 200, "Room deleted successfully");
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

/* -------------------- 3. STUDENT ROOM ALLOCATION -------------------- */

// Allocate student to room
export const allocateStudent = async (req, res) => {
  try {
    const { studentId, allocationDate, expectedVacateDate } = req.body;
    const room = await Room.findById(req.params.roomId);
    if (!room) return errorResponse(res, 404, "Room not found");

    if (room.students.length >= room.capacity)
      return errorResponse(res, 400, "Room is already full");

    const student = await Student.findById(studentId);
    if (!student) return errorResponse(res, 404, "Student not found");
    if (student.hostel.isAllocated)
      return errorResponse(res, 400, "Student already allocated");

    // Update room
    room.students.push({ student: studentId, allocationDate, expectedVacateDate });
    await room.save();

    // Update student
    student.hostel = {
      hostelName: room.hostel.toString(),
      roomNumber: room.roomNumber,
      isAllocated: true,
    };
    await student.save();

    await sendMail(
      student.email,
      "Hostel Allocation Successful",
      `<h2>Room Allocated</h2><p>You have been allocated Room ${room.roomNumber}</p>`
    );

    successResponse(res, 200, "Student allocated successfully", { room, student });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Vacate student
export const vacateStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const room = await Room.findById(req.params.roomId);
    if (!room) return errorResponse(res, 404, "Room not found");

    const student = await Student.findById(studentId);
    if (!student || !student.hostel.isAllocated)
      return errorResponse(res, 400, "Student not allocated");

    room.students = room.students.filter(
      (s) => s.student.toString() !== studentId
    );
    await room.save();

    student.hostel = { hostelName: null, roomNumber: null, isAllocated: false };
    await student.save();

    await sendMail(
      student.email,
      "Room Vacated",
      `<h2>Room Vacated</h2><p>You have vacated Room ${room.roomNumber}</p>`
    );

    successResponse(res, 200, "Student vacated successfully");
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get students in a room
export const getRoomStudents = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId).populate(
      "students.student",
      "name email rollNo"
    );
    if (!room) return errorResponse(res, 404, "Room not found");
    successResponse(res, 200, "Students fetched successfully", room.students);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get hostel + room of a student
export const getStudentHostel = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return errorResponse(res, 404, "Student not found");

    if (!student.hostel.isAllocated)
      return errorResponse(res, 404, "Student not allocated");

    successResponse(res, 200, "Student hostel fetched", student.hostel);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};
