const express = require("express");
const router = express.Router();
const urlController = require("../controllers/urlController");

router.post("/shorten", urlController.shortenUrl);
router.get("/api/stats/:shortCode", urlController.getStats);
router.get("/:shortCode", urlController.redirectUrl);

module.exports = router;
