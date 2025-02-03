const { imageUploadUtil } = require("../../helpers/cloudinary");
const Product = require("../../models/Product");

// Handle single image upload
const handleImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        message: "Only image files are allowed",
      });
    }

    const result = await imageUploadUtil(req.file);
    res.status(200).json({
      success: true,
      url: result.secure_url,
    });
  } catch (error) {
    console.error("Image upload error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add new product
const addProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      categories,
      brand,
      price,
      salePrice,
      totalStock,
      sizes,
      colors = [],
      mainImage,
    } = req.body;

    // Validate categories
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one category is required",
      });
    }

    // Validate main image URL
    if (!mainImage?.startsWith("http")) {
      return res.status(400).json({
        success: false,
        message: "Valid main image URL required",
      });
    }

    if (!Array.isArray(colors) || colors.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one valid color is required",
      });
    }

    const validColors = colors.filter(
      (color) =>
        color?.colorName &&
        color?.image?.startsWith("http") &&
        ["White", "Black", "Blue", "Red"].includes(color.colorName)
    );

    // Create product
    const newProduct = await Product.create({
      title: title?.trim(),
      description: description?.trim(),
      categories: categories.filter((c) =>
        [
          "men",
          "unisex",
          "collaboration",
          "couple-clothes",
          "pair-love",
          "limited-edition",
          "newest-arrived",
        ].includes(c)
      ),
      brand: brand?.trim(),
      price: Math.max(0, parseFloat(price)) || 0,
      salePrice: Math.max(0, parseFloat(salePrice)) || 0,
      totalStock: Math.max(0, parseInt(totalStock)) || 0,
      sizes: Array.isArray(sizes)
        ? sizes
        : sizes
        ? sizes.split(",").map((s) => s.trim())
        : [],
      colors: validColors,
      image: mainImage,
      averageReview: 0,
    });

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error("Add product error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Product creation failed",
    });
  }
};

const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.categories) {
      if (
        !Array.isArray(updates.categories) ||
        updates.categories.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "At least one valid category is required",
        });
      }

      updates.categories = updates.categories.filter((c) =>
        [
          "men",
          "unisex",
          "collaboration",
          "couple-clothes",
          "pair-love",
          "limited-edition",
          "newest-arrived",
        ].includes(c)
      );
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true } // Return updated document
    );
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Update main image
    if (updates.mainImage) {
      if (updates.mainImage.startsWith("data:image/")) {
        // Handle new image upload
        const [mimeType, base64Data] = updates.mainImage.split(";base64,");
        const result = await imageUploadUtil({
          buffer: Buffer.from(base64Data, "base64"),
          mimetype: mimeType.split(":")[1],
        });
        product.image = result.secure_url;
      } else {
        // Keep existing image
        product.image = updates.mainImage;
      }
    }

    // Update colors
    if (updates.colors) {
      let parsedColors;
      try {
        parsedColors = Array.isArray(updates.colors)
          ? updates.colors
          : JSON.parse(updates.colors);
      } catch {
        return res
          .status(400)
          .json({ success: false, message: "Invalid color data format" });
      }

      product.colors = parsedColors.filter(
        (color) =>
          color?.colorName &&
          color?.image?.startsWith("http") &&
          ["White", "Black", "Blue", "Red"].includes(color.colorName)
      );
    }

    // Update other fields
    if (updates.title) product.title = updates.title.trim();
    if (updates.description) product.description = updates.description.trim();
    if (updates.categories) product.categories = updates.categories;
    if (updates.brand) product.brand = updates.brand.trim();
    if (updates.price) product.price = Math.max(0, parseFloat(updates.price));
    if (updates.salePrice)
      product.salePrice = Math.max(0, parseFloat(updates.salePrice));
    if (updates.totalStock)
      product.totalStock = Math.max(0, parseInt(updates.totalStock));
    if (updates.sizes)
      product.sizes = Array.isArray(updates.sizes)
        ? updates.sizes
        : updates.sizes.split(",").map((s) => s.trim());

    await product.save();
    res.json({ success: true, data: product });
  } catch (error) {
    console.error("Edit product error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Product update failed",
    });
  }
};

// Get all products
const fetchAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Fetch products error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    console.error("Delete product error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};

module.exports = {
  handleImageUpload,
  addProduct,
  editProduct,
  fetchAllProducts,
  deleteProduct,
};
