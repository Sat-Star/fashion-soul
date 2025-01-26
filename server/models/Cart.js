const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        size: {
          // Added size field for each cart item
          type: String, // You can store sizes as strings (e.g., 'S', 'M', 'L')
          required: true, // Make it required if necessary
        },
        color: {
          // Add color field
          colorName: { type: String, required: true },
          colorCode: { type: String },
          image: { type: String },
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Cart", CartSchema);
