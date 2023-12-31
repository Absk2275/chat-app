const express = require("express");
const router = express.Router();
const {registerUser, loginUser, allUser} = require("../controllers/userController");
const {protect} = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/alluser",protect, allUser)
module.exports=router;