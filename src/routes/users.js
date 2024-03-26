const express = require("express");
const router = express.Router();
const tokenMiddleware = require("../middlewares/token.user.middleware");

const users = require("../controllers/usersController");

//router.post("/add", users.addUser);

router.get("/user", tokenMiddleware, users.getTokenData);
router.put("/update-user", tokenMiddleware, users.updateUser);
router.post("/sign-up", users.signUp);
router.post("/log-in", users.logIn);
router.get("/All", users.getAllUser);
router.get("/:id", users.getOne);
//router.delete("/:id", users.deleteUser);
router.put("/forget-password/:id", users.forgetPassword);
router.put("/update-password/:id", users.updatePassword);
router.post("/filters", users.filterView);
router.get("/filters-new-user/:days", users.lastAdded);
router.post("/sendotp", users.otp);

module.exports = router;
