const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    image: String, // Main image
    title: String,
    description: String,
    categories: {
      type: [String],
      required: [true, "At least one category is required"],
      validate: {
        validator: function(v) {
          return v.length > 0;
        },
        message: "At least one category is required"
      },
      enum: {
        values: [
          "men",
          "unisex",
          "collaboration",
          "couple-clothes",
          "pair-love",
          "limited-edition",
          "newest-arrived"
        ],
        message: "Invalid category"
      }
    },
    brand: String,
    price: Number,
    salePrice: Number,
    totalStock: Number,
    averageReview: Number,
    sizes: {
      type: [String],
      required: true,
    },
    colors: [
      {
        colorName: { 
          type: String, 
          required: true,
          enum: ['White', 'Black', 'Blue', 'Red']
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