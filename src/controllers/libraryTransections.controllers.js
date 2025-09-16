import {LibraryTransaction} from "../models/library.modal.js";
import {Book} from "../models/book.modal.js";
import {Student} from "../models/user.modal.js";
import { calculateFine } from "../helpers/calculateFine.js";

export const issueBook = async (req, res) => {
  try {
    const { studentId, bookId } = req.body;

    if (!studentId || !bookId) {
      return res.status(400).json({ message: "Student ID and Book ID are required" });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: "No copies available for this book" });
    }

    // Set due date = 14 days from now
    const issueDate = new Date();
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 14);

    // Create new transaction
    const transaction = new LibraryTransaction({
      studentId,
      bookId,
      issueDate,
      dueDate,
      status: "issued",
    });
    await transaction.save();

    // Decrease available copies
    book.availableCopies -= 1;
    await book.save();

    res.status(201).json({
      message: "Book issued successfully",
      transaction,
    });
  } catch (error) {
    console.error("Error issuing book:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const returnBook = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await LibraryTransaction.findById(transactionId).populate("bookId");
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.status === "returned") {
      return res.status(400).json({ message: "Book already returned" });
    }

    const returnDate = new Date();

    // Calculate fine if returned late
    const fine = calculateFine(transaction.dueDate, returnDate);

    transaction.status = "returned";
    transaction.returnDate = returnDate;
    transaction.fine = fine;
    await transaction.save();

    // Increase available copies back
    const book = await Book.findById(transaction.bookId._id);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    res.status(200).json({
      message: "Book returned successfully",
      transaction,
    });
  } catch (error) {
    console.error("Error returning book:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getStudentTransactions = async (req, res) => {
  try {
    const { studentId } = req.params;

    //  student sirf apna data dekh paaye
    if (req.user.role === "student" && req.user._id.toString() !== studentId) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    const transactions = await LibraryTransaction.find({ student: studentId })
      .populate("book", "title author isbn")
      .sort({ issueDate: -1 });

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ message: "No transactions found for this student" });
    }

    // Pending books
    const pendingBooks = transactions.filter(t => t.status === "issued");

    // Total fine
    const totalFine = transactions.reduce((sum, t) => sum + (t.fine || 0), 0);

    res.status(200).json({
      message: "Student library records fetched successfully",
      transactions,
      pendingBooks,
      totalFine,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching student transactions", error: error.message });
  }
};
  