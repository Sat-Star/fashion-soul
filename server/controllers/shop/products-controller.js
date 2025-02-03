const Product = require("../../models/Product");

const getFilteredProducts = async (req, res) => {
  try {
    const { categories = [], brand = [], sortBy = "price-lowtohigh" } = req.query;

    let filters = {};

    if (categories.length) {
      filters.categories = { 
        $all: Array.isArray(categories) 
          ? categories 
          : categories.split(",")
      };
    }

    if (brand.length) {
      filters.brand = { $in: brand.split(",") };
    }

    let sort = {};
    switch (sortBy) {
      case "price-lowtohigh":
        sort.price = 1;
        break;
      case "price-hightolow":
        sort.price = -1;
        break;
      case "title-atoz":
        sort.title = 1;
        break;
      case "title-ztoa":
        sort.title = -1;
        break;
      default:
        sort.price = 1;
    }

    const products = await Product.find(filters).sort(sort);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (e) {
    console.error("Filter Error:", e);
    res.status(500).json({
      success: false,
      message: "Error filtering products",
      error: process.env.NODE_ENV === "development" ? e.message : undefined,
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (e) {
    console.error("Details Error:", e);
    res.status(500).json({
      success: false,
      message: "Error fetching product details",
      error: process.env.NODE_ENV === "development" ? e.message : undefined,
    });
  }
};

module.exports = { getFilteredProducts, getProductDetails };