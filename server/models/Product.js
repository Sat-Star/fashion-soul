const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    image: String, // Main image
    title: String,
    description: String,
    category: String,
    brand: String,
    price: Number,
    salePrice: Number,
    totalStock: Number,
    averageReview: Number,
    sizes: {
      type: [String], // Array of strings to store available sizes (e.g., ['S', 'M', 'L'])
      required: true,
    },
    colors: [
      {
        colorName: { 
          type: String, 
          required: true,
          enum: ['White', 'Black', 'Blue', 'Red'] // Limit allowed colors
        },
        colorCode: { 
          type: String, 
          required: true,
          enum: ['#FFFFFF', '#000000', '#0000FF', '#FF0000']
        },
        image: String
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
