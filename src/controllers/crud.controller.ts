import bigPromise from "../middlewares/bigPromise";
import { NextFunction, Request, RequestHandler, Response } from "express";
import Book from "../models/book";
import { createCustomError } from "../errors/customAPIError";
import { sendSuccessApiResponse } from "../middlewares/successApiResponse";
import { send } from "process";

interface createObject {
  title: String;
  author: String;
  publication_date: String;
  description: String;
  isAvailable: Boolean;
}

export const addBook: RequestHandler = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        title,
        author,
        publication_date,
        description,
        isAvailable,
      }: {
        title: String;
        author: String;
        publication_date: String;
        description: String;
        isAvailable: Boolean;
      } = req.body;

      const toStore: createObject = {
        title,
        author,
        publication_date,
        description,
        isAvailable: true,
      };

      if (!title || !author || !publication_date || !description) {
        return next(
          createCustomError(
            "Title, Author, Publication Date, and Description fields are required",
            400
          )
        );
      }

      const existingBook = await Book.findOne({ title, isAvailable: true });

      if (existingBook) {
        return next(createCustomError("Book Already In Stock", 400));
      }

      const book: any = await Book.create(toStore);
      const data: any = { book };

      const response = sendSuccessApiResponse(
        "Book Added In List Successfully!",
        data
      );
      res.status(200).send(response);
    } catch (error) {
      console.log(error);
    }
  }
);

export const getBookById: RequestHandler = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bookId = req.params.bookId;
      if (!bookId) {
        return next(createCustomError("No bookId in params", 400));
      }

      const book = await Book.findById(bookId)
        .lean()
        .catch((err) => {
          console.log(`error getting book ${err}`);
          return null;
        });

      if (book === null) {
        return next(createCustomError(`No book found with this ${bookId}`));
      }

      const data: any = { book };
      const response = sendSuccessApiResponse("Found Book", data);
      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
    }
  }
);

export const getAllBook: RequestHandler = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const books = await Book.find({ isAvailable: true })
        .lean()
        .catch((err) => {
          console.log(`error getting book ${err}`);
          return null;
        });

      if (books === null) {
        return next(createCustomError(`No books found`, 400));
      }

      const data: any = { books };
      const response = sendSuccessApiResponse("Found Books", data);
      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
    }
  }
);

export const updateBook: RequestHandler = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bookId = req.params.bookId;
      if (!bookId) {
        return next(createCustomError("No bookId in params", 400));
      }
      const newData = {
        title: req.body.title,
        author: req.body.author,
        publication_date: req.body.publication_date,
        description: req.body.description,
        isAvailable: req.body.isAvailable,
      };

      const updatedBook = await Book.findByIdAndUpdate(bookId, newData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      })
        .lean()
        .catch((err) => {
          console.log(`error updating book details :: ${err}`);
          return null;
        });

      if (updatedBook === null) {
        return next(createCustomError("Failed to update book", 400));
      }

      const data: any = { updatedBook };
      const response = sendSuccessApiResponse(
        "Book Updated Successfully",
        data
      );
      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
    }
  }
);

export const deleteBook: RequestHandler = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bookId = req.params.bookId;
      if (!bookId) {
        return next(createCustomError("No bookId in params", 400));
      }
      const book = await Book.findByIdAndDelete({ _id: bookId })
        .lean()
        .catch((err) => {
          console.log(`error getting book to delete :: ${err}`);
          return null;
        });

      if (book === null) {
        return next(
          createCustomError("Failed to find book with this bookId", 400)
        );
      }
      console.log(book)
      const data: any = { book };
      const response = sendSuccessApiResponse(
        "Book Deleted Successfully!",
        data
      );
      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
    }
  }
);


