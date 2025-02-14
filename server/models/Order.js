const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  cartId: {
    type: String,
    required: true
  },
  cartItems: [
    {
      productId: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true
      },
      image: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      size: String,
      color: {
        colorName: String,
        colorCode: String,
        image: String
      }
    }
  ],
  addressInfo: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    notes: String
  },
  orderStatus: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending"
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  merchantTransactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  'transactionDetails.transactionId': {
    type: String,
    index: true
  },
  paymentId: String,
  payerId: String,
  orderDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Order", OrderSchema);