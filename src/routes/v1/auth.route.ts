import express from "express";
const router = express.Router();

// import controllers
import {
  signup,
  login,
  logout,
  refreshToken,
  userDetails,
} from "../../controllers/auth.controller";

// import middlwares
import { isLoggedIn } from "../../middlewares/authorization";

router.route("/refresh-token").get(refreshToken);
router.route("/signup").patch(signup);
router.route("/login").patch(login);
router.route("/logout").get(logout);
router.route("/user-details").get(isLoggedIn, userDetails);

export default router;
