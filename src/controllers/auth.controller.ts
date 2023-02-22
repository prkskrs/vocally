import User from "../models/User";
import { NextFunction, Request, RequestHandler, Response } from "express";
import bigPromise from "../middlewares/bigPromise";
import { sendSuccessApiResponse } from "../middlewares/successApiResponse";
import { createCustomError } from "../errors/customAPIError";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const options = {
  expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  httpOnly: true,
};

interface signupObject {
  firstName: String;
  lastName: String;
  email: String;
  password: String;
  gender: String;
  role: String;
}

export const signup: RequestHandler = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        gender,
        role,
      }: {
        firstName: String;
        lastName: String;
        email: String;
        password: String;
        gender: String;
        role: String;
      } = req.body;

      const toStore: signupObject = {
        firstName,
        lastName,
        email,
        password,
        gender,
        role,
      };

      if (!email || !firstName || !lastName || !password) {
        return next(
          createCustomError("Name, Email and Password fields are required", 400)
        );
      }

      const existingUser = await User.findOne({ email, isActive: true });

      if (existingUser) {
        return next(createCustomError("User Already exists", 400));
      }

      const user: any = await User.create(toStore);

      if (role === "admin") {
        console.log(role);
        user.isAdmin = true;
      }
      user.save();
      const data: any = { token: user.getJwtToken(), user };

      const response = sendSuccessApiResponse(
        "User Registered Successfully!",
        data
      );
      res.status(200).cookie("token", data.token, options).send(response);
    } catch (error) {
      console.log(error);
    }
  }
);

export const refreshToken: RequestHandler = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      const message = "Unauthenticaded No Bearer";
      return next(createCustomError(message, 401));
    }

    let data: any;
    const token = authHeader.split(" ")[1];
    try {
      const payload: string | jwt.JwtPayload | any = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
      console.log(payload);

      data = await getNewToken(payload);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        const payload: any = jwt.decode(token, { complete: true }).payload;
        data = await getNewToken(payload);

        if (!data) {
          const message = "Authentication failed invalid JWT";
          return next(createCustomError(message, 401));
        }
      } else {
        const message = "Authentication failed invalid JWT";
        return next(createCustomError(message, 401));
      }
    }

    res
      .status(200)
      .json(sendSuccessApiResponse("Refresh Token Generated", data, 200));
  }
);

const getNewToken = async (payload: any) => {
  const isUser = payload?.id ? true : false;
  console.log(isUser);
  let data: any;
  if (isUser) {
    const user: any = await User.findOne({
      isActive: true,
      _id: payload.userId,
    });
    if (user) {
      data = { token: user.generateJWT() };
    }
  }
  return data;
};

export const login: RequestHandler = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      email,
      password,
    }: {
      email: string;
      password: string;
    } = req.body;

    if (!(email && password)) {
      return next(
        createCustomError("Email and Password fields are required", 400)
      );
    }

    const userExists: any = await User.findOne(
      { email: email, isActive: true },
      ["firstName", "lastName", "email", "password"]
    );

    if (userExists) {
      const isPasswordCorrect = await userExists.isValidatedPassword(
        password,
        userExists.password
      );

      if (!isPasswordCorrect) {
        return next(createCustomError("Incorrect Password", 401));
      }
      userExists.password = undefined;
      const data: any = { token: userExists.getJwtToken(), userExists };

      return res
        .cookie("token", data.token, options)
        .send(sendSuccessApiResponse("User LoggedIn Successfully!", data, 201));
    } else {
      return next(createCustomError("You're not registered in our app", 400));
    }
  }
);

export const logout = bigPromise(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  return res.status(200).json({
    success: true,
    message: "Logged Out Successfully",
  });
});

export const userDetails = bigPromise(async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user._id})
      .lean()
      .catch((err) => {
        console.log(`error getting logged in user :: ${err}`);
        return null;
      });

    if (user === null) {
      return next(createCustomError("No user found with this userId", 400));
    }

    const data: any = { user };
    const response = sendSuccessApiResponse("LoggedIn User Details", data);
    return res.status(200).send(response);
  } catch (error) {
    console.log(error);
  }
});
