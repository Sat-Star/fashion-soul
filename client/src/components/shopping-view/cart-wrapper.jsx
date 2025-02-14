import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";
import { fetchCartItems } from "@/store/shop/cart-slice";


function UserCartWrapper({ setOpenCartSheet }) {
  const [searchParams] = useSearchParams();
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
    <SheetContent className="sm:max-w-md bg-cream-50 border-l-2 border-cream-200 flex flex-col">
      <SheetHeader>
        <SheetTitle className="font-serif text-2xl text-brown-900 border-b border-cream-200 pb-4">
          Your Shopping Bag
        </SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="mt-4 space-y-4">
          {isLoading ? (
            <div className="text-center text-brown-600">Loading your items...</div>
          ) : error ? (
            <div className="text-brown-800 text-center bg-cream-100 p-3 rounded-lg">
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
            <div className="text-center text-brown-600 pt-8">
              No items in your bag
            </div>
          )}
        </div>
      </div>

      {cartItems?.length > 0 && (
        <div className="pt-4 border-t border-cream-200 bg-cream-50 sticky bottom-0">
          <div className="flex justify-between items-center mb-4">
            <span className="font-serif font-bold text-xl text-brown-900">
              Total Amount:
            </span>
            <span className="font-serif font-bold text-xl text-brown-900">
              ₹{totalCartAmount.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
          </div>

          <Button
            onClick={() => {
              navigate("/shop/checkout");
              setOpenCartSheet(false);
            }}
            className="w-full h-12 text-lg bg-brown-800 hover:bg-brown-900 text-cream-100 transition-colors"
            size="lg"
          >
            Secure Checkout
          </Button>
        </div>
      )}
    </SheetContent>
  );
}

export default UserCartWrapper;