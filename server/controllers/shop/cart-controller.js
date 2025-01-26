const mongoose = require("mongoose");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

// Helper to find cart item index
const findCartItemIndex = (items, productId, size, color) => {
  return items.findIndex(
    (item) =>
      item.productId.toString() === productId &&
      item.size === size &&
      item.color?.colorName === color?.colorName
  );
};

const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, size, color } = req.body;

    if (!userId || !productId || quantity <= 0 || !size || !color) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const itemIndex = findCartItemIndex(cart.items, productId, size, color);

    if (itemIndex === -1) {
      cart.items.push({
        productId,
        quantity,
        size,
        color: {
          colorName: color.colorName,
          colorCode: color.colorCode,
          image: color.image,
        },
      });
    } else {
      cart.items[itemIndex].quantity += quantity;
    }

    await cart.save();

    const newCart = await Cart.findOne({ userId }).populate("items.productId");
    const validItems = newCart.items.filter(item => item.productId);
    const processedItems = validItems.map(item => ({
      productId: item.productId._id,
      image: item.color?.image || item.productId.image,
      title: item.productId.title,
      price: Number(item.productId.price) || 0,
      salePrice: Number(item.productId.salePrice) || 0,
      quantity: Number(item.quantity) || 0,
      size: item.size,
      color: item.color
    }));

    res.status(200).json({
      success: true,
      data: { items: processedItems }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error adding to cart",
    });
  }
};

const fetchCartItems = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "image title price salePrice colors",
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    const validItems = cart.items.filter((item) => item.productId);

    const populateCartItems = validItems.map((item) => ({
      productId: item.productId._id,
      image: item.color?.image || item.productId.image,
      title: item.productId.title,
      price: Number(item.productId.price) || 0,
      salePrice: Number(item.productId.salePrice) || 0,
      quantity: Number(item.quantity) || 0,
      size: item.size,
      color: item.color,
      productColors: item.productId.colors, // For color validation
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error fetching cart",
    });
  }
};

const updateCartItemQty = async (req, res) => {
  try {
    const { userId, productId, quantity, size, color } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    const itemIndex = findCartItemIndex(cart.items, productId, size, color);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found!",
      });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    const updatedCart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "image title price salePrice colors"
    });

    const validItems = updatedCart.items.filter(item => item.productId);
    const processedItems = validItems.map(item => ({
      productId: item.productId._id,
      image: item.color?.image || item.productId.image,
      title: item.productId.title,
      price: Number(item.productId.price) || 0,
      salePrice: Number(item.productId.salePrice) || 0,
      quantity: Number(item.quantity) || 0,
      size: item.size,
      color: item.color
    }));

    res.status(200).json({
      success: true,
      data: { items: processedItems }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error updating cart",
    });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, size, color } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format"
      });
    }

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { 
        productId: new mongoose.Types.ObjectId(productId),
        size,
        "color.colorName": color.colorName 
      }}},
      { new: true }
    ).populate("items.productId");

    const validItems = cart.items.filter(item => item.productId);
    const processedItems = validItems.map(item => ({
      productId: item.productId._id,
      image: item.color?.image || item.productId.image,
      title: item.productId.title,
      price: Number(item.productId.price) || 0,
      salePrice: Number(item.productId.salePrice) || 0,
      quantity: Number(item.quantity) || 0,
      size: item.size,
      color: item.color
    }));

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    // Convert all numeric fields to proper numbers
    const formattedItems = cart.items.map(item => ({
      productId: item.productId._id,
      title: item.productId.title,
      price: Number(item.productId.price) || 0,
      salePrice: Number(item.productId.salePrice) || 0,
      quantity: Number(item.quantity) || 0,
      size: item.size,
      color: item.color,
      image: item.color?.image || item.productId.image
    }));

    res.status(200).json({
      success: true,
      data: { items: formattedItems, processedItems }
    });

  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during deletion",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  addToCart,
  updateCartItemQty,
  deleteCartItem,
  fetchCartItems,
};
