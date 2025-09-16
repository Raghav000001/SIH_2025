import { Book } from "../models/book.modal.js";



export const getAllBooks = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { author: { $regex: search, $options: "i" } },
          { isbn: { $regex: search, $options: "i" } },
        ],
      };
    }

    const books = await Book.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching books",
    });
  }
};

export const addBook = async (req, res) => {
  try {
    const { title, author, isbn, totalCopies ,category} = req.body;

    if (!title || !author || !isbn || !totalCopies || !category) {
      return res.status(400).json({
        success: false,
        message: "All fields (title, author, isbn, totalCopies,category) are required",
      });
    }

    // Prevent duplicate ISBN
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: "Book with this ISBN already exists",
      });
    }

    const book = await Book.create({
      title,
      author,
      isbn,
      totalCopies,
      category,
      availableCopies: totalCopies,
    });

    res.status(201).json({
      success: true,
      message: "Book added successfully",
      data: book,
    });
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding book",
    });
  }
};

export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Prevent reducing totalCopies below issued copies
    if (updates.totalCopies !== undefined && updates.totalCopies < (book.totalCopies - book.availableCopies)) {
      return res.status(400).json({
        success: false,
        message: "Total copies cannot be less than already issued copies",
      });
    }

    Object.assign(book, updates);

    // If totalCopies updated, adjust availableCopies properly
    if (updates.totalCopies !== undefined) {
      const issuedCopies = book.totalCopies - book.availableCopies;
      book.availableCopies = updates.totalCopies - issuedCopies;
    }

    await book.save();

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: book,
    });
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating book",
    });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Prevent deleting if books are issued
    const issuedCopies = book.totalCopies - book.availableCopies;
    if (issuedCopies > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete book while copies are issued",
      });
    }

    await book.deleteOne();

    res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting book",
    });
  }
};
