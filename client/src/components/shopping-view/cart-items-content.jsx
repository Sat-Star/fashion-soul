import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";

function UserCartItemsContent({ cartItem }) {
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
  };

  return (
    <div className="flex items-center gap-4 p-4 border-b">
      {/* Color image preview */}
      <img
        src={cartItem.color?.image || cartItem.image}
        alt={cartItem.title}
        className="w-20 h-20 object-cover rounded-lg"
      />

      <div className="flex-1">
        <h3 className="font-bold">{cartItem.title}</h3>
        
        {/* Size and color display */}
        <div className="flex items-center gap-4 mt-1">
          <div className="flex items-center gap-1">
            <div 
              className="w-4 h-4 rounded-full border"
              style={{ 
                backgroundColor: cartItem.color?.colorCode,
                borderColor: cartItem.color?.colorCode
              }}
            />
            <span className="text-sm">{cartItem.color?.colorName}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-sm">Size:</span>
            <span className="text-sm font-medium">
              {cartItem.size || "N/A"}
            </span>
          </div>
        </div>

        {/* Quantity controls */}
        <div className="flex items-center gap-3 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUpdateQuantity('minus')}
            disabled={cartItem.quantity === 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="font-medium w-6 text-center">
            {cartItem.quantity}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUpdateQuantity('plus')}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Price & Delete */}
      <div className="flex flex-col items-end">
        <p className="font-semibold">
        ₹{(
            (Number(cartItem.salePrice) > 0
              ? Number(cartItem.salePrice)
              : Number(cartItem.price) || 0) * cartItem.quantity
          ).toFixed(2)}
        </p>
        <Trash
          onClick={handleDelete}
          className="mt-2 text-red-500 hover:text-red-600 cursor-pointer"
          size={18}
        />
      </div>
    </div>
  );
}

export default UserCartItemsContent;