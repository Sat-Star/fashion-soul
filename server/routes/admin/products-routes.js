const express = require("express");
const { upload } = require("../../helpers/cloudinary");
const {
  handleImageUpload,
  addProduct,
  editProduct,
  fetchAllProducts,
  deleteProduct
} = require("../../controllers/admin/products-controller");

const router = express.Router();

router.post("/add", upload.none(), addProduct); // 👈 Handle form-data
router.put("/edit/:id", upload.none(), editProduct); 

// Keep other routes unchanged
router.post("/upload-image", upload.single("file"), handleImageUpload);
router.get("/get", fetchAllProducts);
router.delete("/delete/:id", deleteProduct);

module.exports = router;