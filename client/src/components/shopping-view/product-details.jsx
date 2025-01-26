import { StarIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
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

  // Add state for variant validation
  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);

  function handleRatingChange(getRating) {
    setRating(getRating);
  }

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
      <DialogContent className="grid grid-cols-2 gap-8 sm:p-12 max-w-[90vw] sm:max-w-[80vw] lg:max-w-[70vw]">
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={selectedColor?.image || productDetails?.image}
            alt={productDetails?.title}
            className="aspect-square w-full object-cover"
          />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-extrabold">{productDetails?.title}</h1>
          <p className="text-muted-foreground text-lg">
            {productDetails?.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className={`text-2xl font-bold ${productDetails?.salePrice > 0 ? "line-through text-muted-foreground" : "text-primary"}`}>
              ₹{productDetails?.price}
              </p>
              {productDetails?.salePrice > 0 && (
                <p className="text-2xl font-bold text-primary">
                  ₹{productDetails?.salePrice}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <StarRatingComponent rating={averageReview} />
              <span className="text-muted-foreground">
                ({averageReview.toFixed(1)})
              </span>
            </div>
          </div>

          {/* Size Selection */}
          <div className="space-y-2">
            <Label className={`${sizeError ? "text-destructive" : ""}`}>Select Size</Label>
            <div className="flex gap-2 flex-wrap">
              {["XS", "S", "M", "L", "XL"].map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "default" : "outline"}
                  onClick={() => {
                    setSelectedSize(size);
                    setSizeError(false);
                  }}
                  className={`min-w-[60px] ${sizeError ? "border-destructive" : ""}`}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label className={`${colorError ? "text-destructive" : ""}`}>Select Color</Label>
            <div className="flex gap-2 flex-wrap">
              {productDetails?.colors?.map((color) => (
                <button
                  key={color.colorName}
                  onClick={() => {
                    setSelectedColor(color);
                    setColorError(false);
                  }}
                  className={`h-10 w-10 rounded-full border-2 relative ${selectedColor?.colorName === color.colorName
                      ? "border-primary shadow-lg"
                      : "border-muted-foreground"
                    } ${colorError ? "border-destructive" : ""}`}
                  style={{ backgroundColor: color.colorCode }}
                >
                  {selectedColor?.colorName === color.colorName && (
                    <div className="absolute inset-0 border-2 border-white rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Cart */}
          <div className="pt-4">
            {productDetails?.totalStock === 0 ? (
              <Button className="w-full" disabled>
                Out of Stock
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() => handleAddToCart(productDetails?._id, productDetails?.totalStock)}
              >
                {cartItems.some(
                  item => item.productId === productDetails?._id &&
                    item.size === selectedSize &&
                    item.color?.colorName === selectedColor?.colorName
                ) ? "Update Cart" : "Add to Cart"}
              </Button>
            )}
          </div>

          {/* Reviews Section */}
          <Separator className="my-6" />
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Customer Reviews</h2>

            <div className="space-y-6 max-h-[300px] overflow-auto pr-4">
              {reviews?.length > 0 ? (
                reviews.map((review) => (
                  <div key={review._id} className="flex gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {review.userName?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <h3 className="font-medium">{review.userName}</h3>
                        <StarRatingComponent
                          rating={review.reviewValue}
                          size={16}
                        />
                      </div>
                      <p className="text-muted-foreground mt-1">
                        {review.reviewMessage}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No reviews yet</p>
              )}
            </div>

            {user && (
              <div className="space-y-4">
                <Label>Write a Review</Label>
                <StarRatingComponent
                  rating={rating}
                  handleRatingChange={handleRatingChange}
                  size={24}
                />
                <Input
                  value={reviewMsg}
                  onChange={(e) => setReviewMsg(e.target.value)}
                  placeholder="Share your experience..."
                />
                <Button
                  onClick={handleAddReview}
                  disabled={!rating || reviewMsg.trim() === ""}
                >
                  Submit Review
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