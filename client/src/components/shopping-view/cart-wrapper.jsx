import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";
import { fetchCartItems } from "@/store/shop/cart-slice";


function UserCartWrapper({ setOpenCartSheet }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems, isLoading, error } = useSelector(
    (state) => state.shoppingCart || {
      cartItems: [],
      isLoading: false,
      error: null
    }
  );
  // Fetch cart items when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user.id));
    }
  }, [dispatch, user?.id]);

  // Calculate total amount
  const totalCartAmount = cartItems.reduce((sum, item) => {
    const price = Number(item.salePrice) > 0 ?
      Number(item.salePrice) :
      Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + (price * quantity);
  }, 0);

  return (
    <SheetContent className="sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Your Cart</SheetTitle>
      </SheetHeader>

      <div className="mt-8 space-y-4">
        {isLoading ? (
          <div className="text-center">Loading cart items...</div>
        ) : error ? (
          <div className="text-destructive text-center">
            Error loading cart: {error}
          </div>
        ) : cartItems?.length > 0 ? (
          cartItems.map((item) => (
            <UserCartItemsContent
              key={`${item.productId}-${item.size}-${item.color?.colorName}`}
              cartItem={item}
            />
          ))
        ) : (
          <div className="text-center text-muted-foreground">
            Your cart is empty
          </div>
        )}
      </div>

      {cartItems?.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg">Total:</span>
            <span className="font-bold text-lg">
              ${totalCartAmount.toFixed(2)}
            </span>
          </div>

          <Button
            onClick={() => {
              navigate("/shop/checkout");
              setOpenCartSheet(false);
            }}
            className="w-full mt-4"
            size="lg"
          >
            Proceed to Checkout
          </Button>
        </div>
      )}
    </SheetContent>
  );
}

export default UserCartWrapper;