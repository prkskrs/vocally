import { NextFunction, Request, Response } from "express";
import bigPromise from "./bigPromise";
import User from "../models/User";
import jwt from "jsonwebtoken";

const errorMessage = "You do not have permissions to perform this action";
export const isLoggedIn = bigPromise(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "")
    // console.log(token);
    if (!token) {
      return res.status(403).json({
        success: "false",
        message: "Login First to access this page",
      });
    }
    const decode: any = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findOne({ _id: decode?.userId });
    return next();
  }
);
