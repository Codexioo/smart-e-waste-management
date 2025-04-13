const express = require("express");
const router = express.Router();
const { submitWaste } = require("../controllers/wasteCollectionController");

router.post("/submit-waste", submitWaste);

module.exports = router;
