const express = require("express");
const router = express.Router();
const tokenMiddleware = require("../middlewares/token.admin.middleware");

const admins = require("../controllers/adminController");

router.get("/admin", tokenMiddleware, admins.getTokenData);
router.post("/sign-up", admins.signUp);
router.post("/log-in", admins.logIn);
router.get("/All", admins.getAllAdmin);
router.get("/:id", admins.getOne);
router.put("/forget-password/:id", admins.forgetPassword);
router.put("/update-password/:id", admins.updatePassword);
router.post("/sendotp", admins.otp);
router.post("/logout", tokenMiddleware, admins.logout);

module.exports = router;
