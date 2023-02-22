import express from "express";
import { sendSuccessApiResponse } from "../../middlewares/successApiResponse";
import authRoute from "./auth.route";
import bookRoute from "./book.route";

const router = express.Router();

/**
 * Endpoint: /api/v1
 */

router.use("/auth", authRoute);
router.use("/book", bookRoute);

router.get("/", (req, res) => {
    return res.status(200).send({
        uptime: process.uptime(),
        message: "Prakash's API health check :: GOOD",
        timestamp: Date.now(),
    });
});

export default router;
