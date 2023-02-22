import express from "express";
const router = express.Router();

// import controllers
import { addBook, deleteBook, getAllBook, getBookById, updateBook } from "../../controllers/crud.controller";


router.route("/").patch(addBook);
router.route("/:bookId").get(getBookById);
router.route("/").get(getAllBook);
router.route("/:bookId").patch(updateBook);
router.route("/:bookId").delete(deleteBook);


export default router;
