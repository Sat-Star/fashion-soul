import { StarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems, createDirectCheckout } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { setProductDetails } from "@/store/shop/products-slice";
import { Label } from "../ui/label";
import StarRatingComponent from "../common/star-rating";
import { useEffect, useState } from "react";
import { addReview, getReviews } from "@/store/shop/review-slice";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems = [] } = useSelector((state) => state.shoppingCart);
  const { reviews } = useSelector((state) => state.shopReview);
  const [selectedColor, setSelectedColor] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Add state for variant validation
  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);

  function handleRatingChange(getRating) {
    setRating(getRating);
  }

  const handleBuyNow = async (getCurrentProductId, getTotalStock) => {
    // Reuse validation from handleAddToCart
    let hasError = false;
    if (!selectedSize) {
      setSizeError(true);
      hasError = true;
    }
    if (!selectedColor) {
      setColorError(true);
      hasError = true;
    }
    if (hasError) {
      toast({
        title: "Please select both size and color",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await dispatch(
        createDirectCheckout({
          productId: getCurrentProductId,
          quantity: 1,
          size: selectedSize,
          color: {
            colorName: selectedColor.colorName,
            colorCode: selectedColor.colorCode,
            image: selectedColor.image
          }
        })
      ).unwrap();

      if (result.success) {
        navigate("/shop/checkout?type=direct");
        setOpen(false);
      }
    } catch (error) {
      toast({
        title: "Failed to process Buy Now",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    }
  };


  function handleAddToCart(getCurrentProductId, getTotalStock) {
    let hasError = false;
    if (!selectedSize) {
      setSizeError(true);
      hasError = true;
    }
    if (!selectedColor) {
      setColorError(true);
      hasError = true;
    }
    if (hasError) {
      toast({
        title: "Please select both size and color",
        variant: "destructive",
      });
      return;
    }

    const existingItem = cartItems.find(item =>
      item.productId === getCurrentProductId &&
      item.size === selectedSize &&
      item.color?.colorName === selectedColor?.colorName
    );

    if (existingItem) {
      if (existingItem.quantity + 1 > getTotalStock) {
        toast({
          title: `Only ${getTotalStock - existingItem.quantity} more available`,
          variant: "destructive",
        });
        return;
      }
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
        size: selectedSize,
        color: {
          colorName: selectedColor.colorName,
          colorCode: selectedColor.colorCode,
          image: selectedColor.image
        },
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({ title: "Added to cart" });
      } else {
        toast({
          title: "Failed to add to cart",
          variant: "destructive"
        });
      }
    });
  }

  function handleDialogClose() {
    setOpen(false);
    dispatch(setProductDetails());
    setRating(0);
    setReviewMsg("");
    setSelectedSize(null);
    setSelectedColor(null);
    // Reset validation states
    setSizeError(false);
    setColorError(false);
  }

  function handleAddReview() {
    dispatch(
      addReview({
        productId: productDetails?._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    ).then((data) => {
      if (data.payload.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails?._id));
        toast({
          title: "Review added successfully!",
        });
      }
    });
  }

  useEffect(() => {
    if (productDetails) {
      dispatch(getReviews(productDetails?._id));
      // Preselect first available color
      if (productDetails.colors?.length > 0 && !selectedColor) {
        setSelectedColor(productDetails.colors[0]);
      }
    }
  }, [productDetails]);

  const averageReview =
    reviews?.reduce((sum, item) => sum + item.reviewValue, 0) / reviews?.length || 0;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="grid lg:grid-cols-2 grid-cols-1 gap-6 p-6 max-w-[95vw] max-h-[90vh] overflow-y-auto">
        {/* Image Section */}
        <div className="relative overflow-hidden rounded-lg border-2 border-cream-200 h-[400px]">
          <img
            src={selectedColor?.image || productDetails?.image}
            alt={productDetails?.title}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Content Section */}
        <div className="space-y-4 text-brown-900 lg:max-h-[85vh] overflow-y-auto">
          <h1 className="text-3xl font-serif font-extrabold">{productDetails?.title}</h1>
          <p className="text-brown-600 text-lg">
            {productDetails?.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className={`text-2xl font-bold ${productDetails?.salePrice > 0 ? "line-through text-brown-400" : "text-brown-900"}`}>
                ₹{productDetails?.price?.toLocaleString('en-IN')}
              </p>
              {productDetails?.salePrice > 0 && (
                <p className="text-2xl font-bold text-brown-900">
                  ₹{productDetails?.salePrice?.toLocaleString('en-IN')}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <StarRatingComponent rating={averageReview} starColor="#3d2e28" />
              <span className="text-brown-600">
                ({averageReview.toFixed(1)})
              </span>
            </div>
          </div>

          {/* Size Selection */}
          <div className="space-y-2">
            <Label className={`${sizeError ? "text-red-600" : "text-brown-800"}`}>
              Select Size
            </Label>
            <div className="flex gap-2 flex-wrap">
              {["XS", "S", "M", "L", "XL"].map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "default" : "outline"}
                  className={`min-w-[60px] transition-all ${selectedSize === size
                      ? 'bg-brown-800 text-cream-100 hover:bg-brown-900'
                      : 'border-brown-800 text-brown-800 hover:bg-cream-200'
                    } ${sizeError ? "border-red-500" : ""}`}
                  onClick={() => {
                    setSelectedSize(size);
                    setSizeError(false);
                  }}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label className={`${colorError ? "text-red-600" : "text-brown-800"}`}>
              Select Color
            </Label>
            <div className="flex gap-2 flex-wrap">
              {productDetails?.colors?.map((color) => (
                <button
                  key={color.colorName}
                  onClick={() => {
                    setSelectedColor(color);
                    setColorError(false);
                  }}
                  className={`h-10 w-10 rounded-full border-2 relative transition-all ${selectedColor?.colorName === color.colorName
                      ? "border-brown-900 shadow-lg"
                      : "border-cream-200"
                    } ${colorError ? "border-red-500" : ""}`}
                  style={{ backgroundColor: color.colorCode }}
                >
                  {selectedColor?.colorName === color.colorName && (
                    <div className="absolute inset-0 border-2 border-cream-100 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Cart */}
          <div className="pt-4 space-y-2">
            {productDetails?.totalStock === 0 ? (
              <Button className="w-full bg-cream-200 text-brown-600" disabled>
                Currently Unavailable
              </Button>
            ) : (
              <>
                <Button
                  className="w-full bg-brown-800 hover:bg-brown-900 text-cream-100 h-12 text-lg"
                  onClick={() => handleAddToCart(productDetails?._id, productDetails?.totalStock)}
                >
                  {cartItems.some(
                    item => item.productId === productDetails?._id &&
                      item.size === selectedSize &&
                      item.color?.colorName === selectedColor?.colorName
                  ) ? "Update Cart" : "Add to Cart"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-brown-800 text-brown-800 hover:bg-cream-200 h-12 text-lg"
                  onClick={() => handleBuyNow(productDetails?._id, productDetails?.totalStock)}
                >
                  Secure Checkout
                </Button>
              </>
            )}
          </div>

          {/* Reviews Section */}
          <Separator className="my-6 bg-cream-200" />
          <div className="space-y-6">
            <h2 className="text-xl font-serif font-bold">Customer Reflections</h2>

            <div className="space-y-6 max-h-[40vh] overflow-auto pr-2">
              {reviews?.length > 0 ? (
                reviews.map((review) => (
                  <div key={review._id} className="flex gap-4">
                    <Avatar className="h-10 w-10 border-2 border-brown-800">
                      <AvatarFallback className="bg-brown-800 text-cream-100">
                        {review.userName?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <h3 className="font-medium text-brown-900">{review.userName}</h3>
                        <StarRatingComponent
                          rating={review.reviewValue}
                          size={16}
                          starColor="#3d2e28"
                        />
                      </div>
                      <p className="text-brown-600 mt-1">
                        {review.reviewMessage}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-brown-600">No reflections yet</p>
              )}
            </div>

            {user && (
              <div className="space-y-4 pb-4">
                <Label className="text-brown-800">Share Your Experience</Label>
                <StarRatingComponent
                  rating={rating}
                  handleRatingChange={handleRatingChange}
                  size={24}
                  starColor="#3d2e28"
                />
                <Input
                  value={reviewMsg}
                  onChange={(e) => setReviewMsg(e.target.value)}
                  placeholder="What makes this piece special..."
                  className="bg-cream-100 border-brown-800 focus-visible:ring-brown-800"
                />
                <Button
                  onClick={handleAddReview}
                  disabled={!rating || reviewMsg.trim() === ""}
                  className="bg-brown-800 hover:bg-brown-900 text-cream-100"
                >
                  Share Reflection
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;