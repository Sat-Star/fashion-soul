import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-tile";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { addProductFormElements } from "@/config";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiUpload } from "react-icons/fi";
import axios from "axios";

const initialFormData = {
  image: null,
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  totalStock: "",
  sizes: "",
  averageReview: 0,
  colors: [],
  mainImage: "",
};

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [colorUploadStates, setColorUploadStates] = useState({
    White: { loading: false, success: false, error: false },
    Black: { loading: false, success: false, error: false },
    Blue: { loading: false, success: false, error: false },
    Red: { loading: false, success: false, error: false },
  });

  const { productList } = useSelector((state) => state.adminProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const getColorHexCode = (colorName) => ({
    'White': '#FFFFFF',
    'Black': '#000000',
    'Blue': '#0000FF',
    'Red': '#FF0000'
  }[colorName] || '#CCCCCC');

  const handleColorImageUpload = (colorName) => async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setColorUploadStates(prev => ({
        ...prev,
        [colorName]: { ...prev[colorName], loading: true }
      }));

      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(
        "http://localhost:5000/api/admin/products/upload-image",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setFormData(prev => ({
        ...prev,
        colors: [
          ...prev.colors.filter(c => c.colorName !== colorName),
          {
            colorName,
            colorCode: getColorHexCode(colorName),
            image: response.data.url
          }
        ]
      }));

      setColorUploadStates(prev => ({
        ...prev,
        [colorName]: { loading: false, success: true, error: false }
      }));

      toast({ title: `${colorName} image uploaded!`, variant: "success" });

    } catch (error) {
      setColorUploadStates(prev => ({
        ...prev,
        [colorName]: { loading: false, success: false, error: true }
      }));
      toast({
        variant: "destructive",
        title: `${colorName} upload failed`,
        description: error.response?.data?.message || "Could not upload image",
      });
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!currentEditedId) { // Add safety check
      toast({ variant: "destructive", title: "No product selected for editing" });
      return;
    }

    if (imageLoadingState || !uploadedImageUrl) {
      toast({
        variant: "destructive",
        title: imageLoadingState
          ? "Please wait for image upload to complete"
          : "Main image is required"
      });
      return;
    }

    if (isNaN(formData.price) || isNaN(formData.totalStock) || !formData.sizes.trim()) {
      toast({ variant: "destructive", title: "Invalid numeric values or empty sizes" });
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      brand: formData.brand,
      price: parseFloat(formData.price),
      salePrice: parseFloat(formData.salePrice) || 0,
      totalStock: parseInt(formData.totalStock),
      sizes: formData.sizes.split(',').map(s => s.trim()),
      colors: formData.colors.filter(color => color.image),
      mainImage: uploadedImageUrl
    };

    try {
      const action = currentEditedId !== null
        ? editProduct({ id: currentEditedId, formData: payload }) // Send as JSON
        : addNewProduct(payload);

      const result = await dispatch(action).unwrap();

      // Show success FIRST
    toast({ title: `Product ${currentEditedId ? 'updated' : 'added'} successfully` });

    // Refresh list BEFORE closing dialog
    await dispatch(fetchAllProducts());

    // Close dialog and reset AFTER refresh
    setOpenCreateProductsDialog(false);
    setImageFile(null);
    setFormData(initialFormData);
    setCurrentEditedId(null);

    } catch (error) {
      toast({
        variant: "destructive",
        title: error.message || "Operation failed"
      });
    }

    try {
      const result = await dispatch(
        editProduct({ id: currentEditedId, formData: payload })
      ).unwrap();
  
      toast({ title: "Product updated successfully" });
      
      // Close dialog after success
      setOpenCreateProductsDialog(false);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: error.message || "Update failed"
      });
    }
  };


  const handleDelete = (getCurrentProductId) => {
    dispatch(deleteProduct(getCurrentProductId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
        toast({ title: "Product deleted successfully" });
      }
    });
  };

  const isFormValid = () => {
    const requiredFields = ['title', 'description', 'category', 'brand', 'price', 'totalStock'];
    return (
      uploadedImageUrl &&
      requiredFields.every(field => formData[field]) &&
      formData.colors.some(color => color?.image)
    );
  };

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-end">
        <Button onClick={() => setOpenCreateProductsDialog(true)}>
          Add New Product
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {productList?.map((productItem) => (
          <AdminProductTile
            key={productItem._id || "fallback-key"}
            setFormData={setFormData}
            setOpenCreateProductsDialog={setOpenCreateProductsDialog}
            setCurrentEditedId={setCurrentEditedId}
            product={productItem}
            handleDelete={handleDelete}
          />
        ))}
      </div>

      <Sheet open={openCreateProductsDialog} onOpenChange={() => {
        setOpenCreateProductsDialog(false);
        setCurrentEditedId(null);
        setFormData(initialFormData);
      }}>
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>

          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={currentEditedId !== null}
          />

          <div className="flex flex-wrap gap-4 mb-4 mt-6">
            {["White", "Black", "Blue", "Red"].map((color) => (
              <div key={color} className="flex flex-col items-center gap-2">
                <div
                  className={`w-12 h-12 rounded-full relative ${colorUploadStates[color].success ? 'ring-2 ring-green-500' :
                    colorUploadStates[color].error ? 'ring-2 ring-red-500' : ''
                    }`}
                  style={{ backgroundColor: getColorHexCode(color) }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleColorImageUpload(color)}
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {colorUploadStates[color].loading ? (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    <FiUpload className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-lg" />
                  )}
                  {colorUploadStates[color].success && (
                    <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                  {colorUploadStates[color].error && (
                    <div className="absolute bottom-0 right-0 bg-red-500 rounded-full p-1">
                      <X className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                <span>{color}</span>
              </div>
            ))}
          </div>

          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Save Changes" : "Add Product"}
              formControls={addProductFormElements}
              isBtnDisabled={!isFormValid()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;