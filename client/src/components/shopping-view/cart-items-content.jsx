import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity, removeDirectCheckoutItem } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";

function UserCartItemsContent({ cartItem, isDirectCheckout }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const handleUpdateQuantity = (type) => {
    const newQuantity = type === 'plus' ? cartItem.quantity + 1 : cartItem.quantity - 1;
    if (newQuantity < 1) {
      toast({
        title: "Minimum quantity is 1",
        variant: "destructive"
      });
      return;
    }
    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: cartItem.productId,
        quantity: newQuantity,
        size: cartItem.size,
        color: { colorName: cartItem.color.colorName }
      })
    ).unwrap().catch(error => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    });
  };

  const handleDelete = () => {
    if (isDirectCheckout) {
      // Remove from direct checkout items
      dispatch(removeDirectCheckoutItem(cartItem));
      toast({ title: "Item removed from checkout" });
    } else {
      dispatch(
        deleteCartItem({
          userId: user?.id,
          productId: cartItem.productId,
          size: cartItem.size,
          color: { colorName: cartItem.color.colorName }
        })
      ).unwrap().then(() => {
        toast({ title: "Item removed from cart" });
      }).catch(error => {
        toast({
          title: "Delete failed",
          description: error.message,
          variant: "destructive"
        });
      });
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 border-b border-cream-200 bg-cream-50 hover:bg-cream-100 transition-colors">
      {/* Color image preview */}
      <img
        src={cartItem.color?.image || cartItem.image}
        alt={cartItem.title}
        className="w-20 h-20 object-cover rounded-lg border-2 border-cream-200"
      />

      <div className="flex-1">
        <h3 className="font-serif font-bold text-brown-900">{cartItem.title}</h3>

        {/* Size and color display */}
        <div className="flex items-center gap-4 mt-1">
          <div className="flex items-center gap-1">
            <div
              className="w-4 h-4 rounded-full border border-cream-200"
              style={{
                backgroundColor: cartItem.color?.colorCode,
              }}
            />
            <span className="text-sm text-brown-600">
              {cartItem.color?.colorName}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-sm text-brown-600">Size:</span>
            <span className="text-sm font-medium text-brown-800">
              {cartItem.size || "N/A"}
            </span>
          </div>
        </div>

        {/* Quantity controls */}
        <div className="flex items-center gap-3 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="border-brown-800 text-brown-800 hover:bg-brown-800 hover:text-cream-100"
            onClick={() => handleUpdateQuantity('minus')}
            disabled={cartItem.quantity === 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="font-medium w-6 text-center text-brown-900">
            {cartItem.quantity}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="border-brown-800 text-brown-800 hover:bg-brown-800 hover:text-cream-100"
            onClick={() => handleUpdateQuantity('plus')}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Price & Delete */}
      <div className="flex flex-col items-end gap-2 min-w-[120px]">
        <p className="font-serif font-semibold text-brown-900 text-lg tracking-wide">
          ₹{(
            (Number(cartItem.salePrice) > 0
              ? Number(cartItem.salePrice)
              : Number(cartItem.price) || 0) * cartItem.quantity
          ).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </p>
        <Trash
          onClick={handleDelete}
          className="text-brown-600 hover:text-brown-800 cursor-pointer transition-colors"
          size={20}
        />
      </div>
    </div>
  );
}

export default UserCartItemsContent;