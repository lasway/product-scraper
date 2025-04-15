const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);
router.post("/", productController.createProduct);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

router.post("/shortcode", productController.shortUrl);
router.get("/shortcode/:shortCode", productController.redirectUrl);
router.get("/shortcode/clicks", productController.getClicks);

router.post("/trigger-scrape", productController.triggerScraping);

module.exports = router;
