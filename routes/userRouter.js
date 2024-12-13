const express = require("express");
const {
  createUser,
  loginUser,
  logoutUser,
  getUserDetails,
  updateUser,
  getActivityLog,
  changePassword,
} = require("../controller/userController");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// Public Routes
router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// Protected Routes

router.get("/details", verifyToken, getUserDetails);
router.put("/update", verifyToken, updateUser);
router.get("/activity", verifyToken, getActivityLog);
router.put("/change-password", verifyToken, changePassword);

module.exports = router;
