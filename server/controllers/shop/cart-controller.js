const mongoose = require("mongoose");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

// Helper to find cart item index
const findCartItemIndex = (items, productId, size, color) => {
  return items.findIndex(
    (item) =>
      item?.productId?.toString() === productId?.toString() &&
      item?.size === size &&
      item?.color?.colorName === color?.colorName
  );
};

const createDirectCheckout = async (req, res) => {
  try {
    const { productId, quantity, size, color } = req.body;

    // Validate product exists
    const product = await Product.findById(productId)
      .select("title price salePrice colors sizes totalStock image")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Validate variant availability
    const isValidSize = product.sizes.includes(size);
    const isValidColor = product.colors.some(
      (c) => c.colorName === color.colorName
    );

    if (!isValidSize || !isValidColor) {
      return res.status(400).json({
        success: false,
        message: "Invalid size or color selection",
      });
    }

    // Create temporary checkout item
    const checkoutItem = {
      productId,
      title: product.title,
      price: product.salePrice > 0 ? product.salePrice : product.price,
      quantity,
      size,
      color: {
        colorName: color.colorName,
        colorCode: color.colorCode,
        image: color.image || product.image,
      },
      image: color.image || product.image,
      maxStock: product.totalStock,
    };

    res.status(200).json({
      success: true,
      data: [checkoutItem], // Return as array for consistency
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Direct checkout failed",
    });
  }
};

const addToCart = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { userId, productId, quantity, size, color } = req.body;

    // Validate input format first
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    if (!userId || !productId || quantity <= 0 || !size || !color) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Product no longer available",
      });
    }

    if (
      !product.sizes.includes(size) ||
      !product.colors.some((c) => c.colorName === color.colorName)
    ) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Selected variant unavailable",
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
        quantity: Math.min(quantity, product.totalStock),
        size,
        color: {
          colorName: color.colorName,
          colorCode: color.colorCode,
          image: color.image,
        },
      });
    } else {
      const newQty = cart.items[itemIndex].quantity + quantity;
      cart.items[itemIndex].quantity = Math.min(newQty, product.totalStock);
    }

    await cart.save({ session });
    await session.commitTransaction();

    const newCart = await Cart.findOne({ userId }).populate("items.productId");
    const validItems = newCart.items.filter((item) => item.productId);
    const processedItems = validItems.map((item) => ({
      productId: item.productId._id,
      image: item.color?.image || item.productId.image,
      title: item.productId.title,
      price: Number(item.productId.price) || 0,
      salePrice: Number(item.productId.salePrice) || 0,
      quantity: Number(item.quantity) || 0,
      size: item.size,
      color: item.color,
    }));

    res.status(200).json({
      success: true,
      data: { items: processedItems },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Cart add error:", error);

    if (error.name === "ValidationError") {
      return res.status(410).json({
        // 410 Gone
        success: false,
        message: "Product no longer available",
        code: "PRODUCT_REMOVED",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error adding to cart",
    });
  } finally {
    session.endSession();
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
      select: "image title price salePrice colors",
    });

    const validItems = updatedCart.items.filter((item) => item.productId);
    const processedItems = validItems.map((item) => ({
      productId: item.productId._id,
      image: item.color?.image || item.productId.image,
      title: item.productId.title,
      price: Number(item.productId.price) || 0,
      salePrice: Number(item.productId.salePrice) || 0,
      quantity: Number(item.quantity) || 0,
      size: item.size,
      color: item.color,
    }));

    res.status(200).json({
      success: true,
      data: { items: processedItems },
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
        message: "Invalid product ID format",
      });
    }

    const cart = await Cart.findOneAndUpdate(
      { userId },
      {
        $pull: {
          items: {
            productId: new mongoose.Types.ObjectId(productId),
            size,
            "color.colorName": color?.colorName,
          },
        },
      },
      { new: true }
    ).populate("items.productId");

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const validItems = cart.items.filter((item) => item.productId);
    const processedItems = validItems.map((item) => ({
      productId: item.productId._id.toString(),
      image: item.color?.image || item.productId?.image || "",
      title: item.productId?.title || "Product not available",
      price: Number(item.productId?.price) || 0,
      salePrice: Number(item.productId?.salePrice) || 0,
      quantity: Number(item.quantity) || 0,
      size: item.size,
      color: item.color || {},
    }));

    // Convert all numeric fields to proper numbers
    // const formattedItems = cart.items.map(item => ({
    //   productId: item.productId._id,
    //   title: item.productId.title,
    //   price: Number(item.productId.price) || 0,
    //   salePrice: Number(item.productId.salePrice) || 0,
    //   quantity: Number(item.quantity) || 0,
    //   size: item.size,
    //   color: item.color,
    //   image: item.color?.image || item.productId.image
    // }));

    res.status(200).json({
      success: true,
      data: { items: processedItems },
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during deletion",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  addToCart,
  updateCartItemQty,
  deleteCartItem,
  fetchCartItems,
  createDirectCheckout,
};
