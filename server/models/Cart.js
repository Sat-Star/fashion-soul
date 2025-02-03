const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index : true
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
          validate: {
            validator: async function(v) {
              return await mongoose.model('Product').exists({ _id: v });
            },
            message: props => `Product ${props.value} does not exist`
          }
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        size: {
          // Added size field for each cart item
          type: String, // You can store sizes as strings (e.g., 'S', 'M', 'L')
          required: true,
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
