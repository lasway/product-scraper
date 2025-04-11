const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    productUrl: {
      type: String,
      required: true,
      unique: true,
    },
    imageUrl: {
      type: String,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

ProductSchema.index({ name: "text", description: "text" });
ProductSchema.index({ price: 1 });
ProductSchema.index({ rating: -1 });

module.exports = mongoose.model("Product", ProductSchema);
