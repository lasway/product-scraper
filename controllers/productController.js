const Product = require("../models/product");

// Get all products with optional filtering
exports.getProducts = async (req, res) => {
  try {
    const {
      minPrice,
      maxPrice,
      minRating,
      search,
      sort,
      limit = 20,
      page = 1,
    } = req.query;

    const query = {};

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    if (minRating !== undefined) {
      query.rating = { $gte: Number(minRating) };
    }

    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions = {};
    if (sort) {
      const [field, order] = sort.split(":");
      sortOptions[field] = order === "desc" ? -1 : 1;
    } else {
      sortOptions.lastUpdated = -1;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(Number(limit))
      .skip(skip);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Error retrieving products: ${error.message}`,
    });
  }
};

// Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Error retrieving product: ${error.message}`,
    });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: `Error creating product: ${error.message}`,
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: `Error updating product: ${error.message}`,
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Error deleting product: ${error.message}`,
    });
  }
};

exports.triggerScraping = async (req, res) => {
  try {
    const scraperService = require("../services/scraperService");

    scraperService.scrapeProducts();

    res.status(200).json({
      success: true,
      message: "Scraping process triggered",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Error triggering scraping: ${error.message}`,
    });
  }
};
