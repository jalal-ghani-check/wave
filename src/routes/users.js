const multer = require('multer');
const express = require("express");
const router = express.Router();
const tokenMiddleware = require("../middlewares/token.user.middleware");

const users = require("../controllers/usersController");

//router.post("/add", users.addUser);
const storage = multer.diskStorage({});
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb('invalid image file!', false);
  }
};
const uploads = multer({ storage, fileFilter });
router.post("/upload", tokenMiddleware, uploads.single('event_image'), users.uploadProfile);


router.get("/user", tokenMiddleware, users.getTokenData);
router.put("/update-user", tokenMiddleware, users.updateUser);
router.post("/sign-up", users.signUp);
router.post("/log-in", users.logIn);
router.get("/All", users.getAllUser);
router.get("/:id", users.getOne);
//router.delete("/:id", users.deleteUser);
router.put("/forget-password", users.forgetPassword);
router.put("/update-password", tokenMiddleware, users.updatePassword);
router.post("/filters", tokenMiddleware, users.filterView);
router.get("/filters-new-user/:days", users.lastAdded);
router.post("/sendotp", users.otp);
router.post("/logout", tokenMiddleware, users.logout);
module.exports = router;
