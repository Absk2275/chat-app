const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { sendMessage, allMessage } = require("../controllers/messageControllers");
const router = express.Router();

router.post("/message", protect, sendMessage);
router.get("/message/:chatId", protect, allMessage);


module.exports = router; 
