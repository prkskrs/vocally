import compression from "compression";
import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import httpContext from "express-http-context";
import { connectDB } from "./config/db";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import YAML from "yaml";
import notFound from "./errors/notFound";
import {
  generateRequestId,
  logRequest,
  logResponse,
} from "./middlewares/commonMiddleware";
import errorHandlerMiddleware from "./middlewares/errorHandler";
import router from "./routes";
import rateLimit from "express-rate-limit";

const corsOptions: cors.CorsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  // allowedHeaders: ["Content-Type", "Accept"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Load environment variables
// dotenv.config({ path: `.env.${process.env.NODE_ENV.toLowerCase()}` });
dotenv.config({ path: `.env.${"dev"}` });

// Create Express server
const app = express();

// Set up a rate limiter with a maximum of 100 requests per hour
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
});

// Apply the rate limiter to all routes
app.use(limiter);

// swagger api-docs
const file = fs.readFileSync("src/swagger.yml", "utf8");
const swaggerDocument = YAML.parse(file);
// console.log(swaggerDocument);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Connecting Database
connectDB();

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// CORS configuration
app.use(cors(corsOptions));
app.options("*", cors);

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user: {
        userId: string;
        role: string;
      };
    }
  }
}

// Set HTTP context
app.use(httpContext.middleware);
app.use(generateRequestId);

// Log all the requests and response.
app.use(logRequest);
app.use(logResponse);

app.use(router);

// Error handling
app.use(notFound);
app.use(errorHandlerMiddleware);

export default app;
