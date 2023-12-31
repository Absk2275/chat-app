const express = require("express");
const {protect} = require("../middleware/authMiddleware");
const {accessChat, fetchChat, createGroupChat, renameGroup, addToGroup, removeFromGroup} = require("../controllers/chatControllers");
const router  = express.Router();

router.post("/accessChat",protect, accessChat);
router.get("/fetchChat", protect, fetchChat);
router.post("/group",protect, createGroupChat);
router.put("/renameGroup", renameGroup);
router.put("/removeFromGroup", removeFromGroup);
router.put("/addToGroup", addToGroup);


module.exports = router;

