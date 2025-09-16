import express from "express";
import {
    getAllBooks,
    addBook,
    updateBook,
    deleteBook,
} from "../controllers/library.controllers.js";

import {
    issueBook,
    returnBook,
    getStudentTransactions,
} from "../controllers/libraryTransections.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const libraryRouter = express.Router();

// Get all books (any logged-in user)
libraryRouter.get("/books", authMiddleware(["student", "teacher", "director"]), getAllBooks);
// Add a new book (only director)
libraryRouter.post("/books", authMiddleware(["director"]), addBook);
// Update a book (only director)
libraryRouter.put("/books/:id", authMiddleware(["director"]), updateBook);
// Delete a book (only director)
libraryRouter.delete("/books/:id", authMiddleware(["director"]), deleteBook);
// Issue a book (only student)
libraryRouter.post("/issue", authMiddleware(["student"]), issueBook);
// Return a book (only student)
libraryRouter.put("/return/:transactionId", authMiddleware(["student"]), returnBook);


libraryRouter.get(
  "/student/:studentId",
  authMiddleware(["student", "director"]),
  getStudentTransactions
);

export default libraryRouter;
