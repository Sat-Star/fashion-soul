import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function AdminProductTile({
  product,
  setFormData,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  handleDelete,
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Combine main image with color variant images
  const allImages = [
    product.image,
    ...product.colors.map(color => color.image)
  ];

  const handlePrev = () => {
    setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNext = () => {
    setCurrentImageIndex(prev => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <Card className="w-full max-w-sm mx-auto group">
      <div className="relative">
        {/* Main Image with Navigation Arrows */}
        <div className="relative overflow-hidden">
          <img
            src={allImages[currentImageIndex]}
            alt={product.title}
            className="w-full h-[300px] object-cover rounded-t-lg transition-opacity duration-300"
          />

          {/* Navigation Arrows */}
          <div className="absolute inset-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrev}
              className="h-full rounded-none bg-black/20 hover:bg-black/30 text-white"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="h-full rounded-none bg-black/20 hover:bg-black/30 text-white"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Color Thumbnail Strip */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 px-2">
          {allImages.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-8 h-8 rounded border-2 ${index === currentImageIndex
                ? "border-primary shadow-lg"
                : "border-white"
                } transition-all`}
            >
              <img
                src={img}
                alt={`Variant ${index + 1}`}
                className="w-full h-full object-cover rounded-sm"
              />
            </button>
          ))}
        </div>
      </div>

      <CardContent className="pt-4">
        <h2 className="text-xl font-bold mb-2">{product.title}</h2>

        <div className="flex justify-between items-center mb-2">
          <span className={`${product.salePrice > 0 ? "line-through" : ""} text-lg font-semibold`}>
          ₹{product.price}
          </span>
          {product.salePrice > 0 && (
            <span className="text-lg font-bold text-red-600">
              ₹{product.salePrice}
            </span>
          )}
        </div>

        {product.sizes?.length > 0 && (
          <div className="space-y-1">
            <span className="text-sm font-medium">Available Sizes:</span>
            <div className="flex flex-wrap gap-1">
              {product.sizes.map(size => (
                <span
                  key={size}
                  className="px-2 py-1 bg-muted rounded text-sm"
                >
                  {size}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between gap-2">
        <Button
          onClick={() => {
            if (!product?._id) return; // Safety check

            setOpenCreateProductsDialog(true);
            setCurrentEditedId(product._id);

            // Initialize form data properly
            setFormData({
              ...product,
              sizes: product.sizes?.join(', ') || '',
              mainImage: product.image || '',
              colors: product.colors || []
            });

            // Initialize image state
            setUploadedImageUrl(product.image || '');
            setImageFile(null);
          }}
        >
          Edit
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          onClick={() => handleDelete(product._id)}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AdminProductTile;