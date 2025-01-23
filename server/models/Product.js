const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    image: String,
    title: String,
    description: String,
    category: String,
    brand: String,
    price: Number,
    salePrice: Number,
    totalStock: Number,
    averageReview: Number,
    sizes: { // Added sizes field
      type: [String], // Array of strings to store available sizes (e.g., ['S', 'M', 'L'])
      required: true, // Make it required if necessary
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
