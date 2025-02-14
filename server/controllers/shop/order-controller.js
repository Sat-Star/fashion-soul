const crypto = require("crypto");
const axios = require("axios");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

// PhonePe Configuration
const PHONEPE_ENDPOINTS = {
  uat: {
    base: "https://api-preprod.phonepe.com/apis/pg-sandbox",
    pay: "/pg/v1/pay",
    status: "/pg/v1/status",
  },
  prod: {
    base: "https://api.phonepe.com/apis/hermes",
    pay: "/pg/v1/pay",
    status: "/pg/v1/status",
  },
};

const getPhonePeURL = (endpointType) => {
  const env = process.env.NODE_ENV === "production" ? "prod" : "uat";
  return `${PHONEPE_ENDPOINTS[env].base}${PHONEPE_ENDPOINTS[env][endpointType]}`;
};

const handlePhonePeCallback = async (req, res) => {
  try {
    const { response, checksum } = req.body;
    
    // 1. Validate checksum first
    const salt = process.env.PHONEPE_SALT_KEY;
    const stringToHash = response + "/pg/v1/callback" + salt;
    const generatedChecksum = crypto.createHash('sha256')
      .update(stringToHash)
      .digest('hex') + '###1';

    if (generatedChecksum !== checksum) {
      console.error('Checksum mismatch:', { received: checksum, generated: generatedChecksum });
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
    }

    // 2. Decode response
    const decoded = JSON.parse(Buffer.from(response, 'base64').toString());
    const success = decoded.code === 'PAYMENT_SUCCESS';

    // 3. Immediate database update
    const order = await Order.findOneAndUpdate(
      { merchantTransactionId: decoded.data.merchantTransactionId },
      {
        paymentStatus: success ? 'paid' : 'failed',
        transactionDetails: decoded
      },
      { new: true }
    );

    if (!order) {
      console.error('Order not found:', decoded.data.merchantTransactionId);
      return res.redirect(`${process.env.FRONTEND_URL}/shop/payment-failed`);
    }

    // 4. Final redirect with simple status
    res.redirect(303,
      `${process.env.FRONTEND_URL}/shop/phonepe-return?` +
      `transactionId=${order.merchantTransactionId}&status=${success ? 'success' : 'failed'}`
    );

  } catch (error) {
    console.error("Callback error:", error);
    res.redirect(303, `${process.env.FRONTEND_URL}/shop/payment-failed`);
  }
};

const handlePhonePeRedirect = async (req, res) => {
  try {
    const { mtId: merchantTransactionId } = req.query;
    const { transactionId: phonePeTxnId, code } = req.body;

    // 1. Immediately update status from PhonePe's response
    const success = code === 'PAYMENT_SUCCESS';
    
    // 2. Update database with final status
    const order = await Order.findOneAndUpdate(
      { merchantTransactionId },
      {
        paymentStatus: success ? 'paid' : 'failed',
        $set: { "transactionDetails.transactionId": phonePeTxnId }
      },
      { new: true }
    );

    if (!order) {
      return res.redirect(`${process.env.FRONTEND_URL}/shop/payment-failed`);
    }

    // 3. Redirect with ACTUAL status from PhonePe
    res.redirect(303,
      `${process.env.FRONTEND_URL}/shop/phonepe-return?` +
      `transactionId=${merchantTransactionId}&status=${success ? 'success' : 'failed'}`
    );

  } catch (error) {
    console.error("Redirect error:", error);
    res.redirect(303, `${process.env.FRONTEND_URL}/shop/payment-failed`);
  }
};

// Create new order with PhonePe integration
const createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    const merchantTransactionId = `TXN${Date.now()}${Math.random()
      .toString(36)
      .substring(2, 6)}`;

    // Generate PhonePe payload
    const payload = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      merchantTransactionId,
      merchantUserId: orderData.userId,
      amount: Math.round(orderData.totalAmount * 100), // Convert to paise
      redirectUrl: `${process.env.BACKEND_URL}/api/shop/order/phonepe-redirect?mtId=${merchantTransactionId}`,
      redirectMode: "GET",
      callbackUrl: `${process.env.BACKEND_URL}/api/shop/order/phonepe-callback`,
      paymentInstrument: { type: "PAY_PAGE" },
    };

    // Generate signature
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
      "base64"
    );
    const stringToHash =
      base64Payload + "/pg/v1/pay" + process.env.PHONEPE_SALT_KEY;
    const signature = crypto
      .createHash("sha256")
      .update(stringToHash)
      .digest("hex");

    // Create order in database
    const newOrder = new Order({
      ...orderData,
      paymentMethod: "phonepe",
      merchantTransactionId: payload.merchantTransactionId,
      paymentStatus: "pending",
    });

    await newOrder.save();

    // PhonePe API request
    const response = await axios.post(
      getPhonePeURL("pay"),
      {
        request: base64Payload,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": `${signature}###1`,
          "X-MERCHANT-ID": process.env.PHONEPE_MERCHANT_ID,
        },
      }
    );

    res.status(201).json({
      success: true,
      paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
      transactionId: payload.merchantTransactionId,
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Payment initiation failed",
      error: error.message,
    });
  }
};

// Verify PhonePe payment
const verifyPhonePePayment = async (req, res) => {
  try {
    const { transactionId } = req.query;
    
    // 1. Direct database check
    const order = await Order.findOne({ 
      merchantTransactionId: transactionId 
    });

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Order not found" 
      });
    }

    // 2. Return current status from database
    res.status(200).json({
      success: order.paymentStatus === 'paid',
      data: {
        transactionId: order.merchantTransactionId,
        status: order.paymentStatus,
        amount: order.totalAmount,
        // Include other relevant order details
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Verification failed",
      error: error.message
    });
  }
};
// Get all user orders
const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).sort({ orderDate: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve orders",
      error: error.message,
    });
  }
};

// Get order details
const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate("cartItems.productId");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve order",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  verifyPhonePePayment,
  getAllOrdersByUser,
  getOrderDetails,
  handlePhonePeCallback,
  handlePhonePeRedirect,
};
