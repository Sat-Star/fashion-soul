const express = require("express");
const {
  createOrder,
  getAllOrdersByUser,
  getOrderDetails,
  verifyPhonePePayment,
  handlePhonePeCallback,
  handlePhonePeRedirect
} = require("../../controllers/shop/order-controller");

const router = express.Router();

// PhonePe-specific routes
router.post("/create", createOrder);
router.get("/verify-payment", verifyPhonePePayment);
router.get("/list/:userId", getAllOrdersByUser);
router.get("/details/:id", getOrderDetails);
router.post('/phonepe-callback', handlePhonePeCallback);
router.post('/phonepe-redirect', handlePhonePeRedirect);

module.exports = router;