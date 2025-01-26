import { useSearchParams } from "react-router-dom";
import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createNewOrder } from "@/store/shop/order-slice";
import { Navigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

function ShoppingCheckout() {
  const [searchParams] = useSearchParams();
  const isDirectCheckout = searchParams.get('type') === 'direct';
  
  // Get items from appropriate source
  const { cartItems } = useSelector((state) => state.shoppingCart);
  const { directCheckoutItems } = useSelector((state) => state.directCheckout);
  const { user } = useSelector((state) => state.auth);
  const { approvalURL } = useSelector((state) => state.shopOrder);
  
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymemntStart] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Use correct items source
  const itemsToDisplay = isDirectCheckout ? directCheckoutItems : cartItems || [];
  const itemsTotal = isDirectCheckout ? directCheckoutItems : cartItems;

  const totalCartAmount = itemsTotal?.reduce(
    (sum, currentItem) => sum + (
      (currentItem?.salePrice > 0 ? currentItem?.salePrice : currentItem?.price) *
      currentItem?.quantity
    ),
    0
  ) || 0;

  function handleInitiatePaypalPayment() {
    if (itemsToDisplay.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });
      return;
    }

    if (!currentSelectedAddress) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      userId: user?.id,
      cartId: isDirectCheckout ? 'direct-checkout' : cartItems?._id || 'regular-cart',
      cartItems: itemsToDisplay.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        image: singleCartItem?.image,
        price: singleCartItem?.salePrice > 0 
          ? singleCartItem?.salePrice 
          : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      orderStatus: "pending",
      paymentMethod: "paypal",
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
    };

    dispatch(createNewOrder(orderData)).then((data) => {
      if (data?.payload?.success) {
        setIsPaymemntStart(true);
      } else {
        setIsPaymemntStart(false);
      }
    });
  }

  if (approvalURL) {
    window.location.href = approvalURL;
  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover object-center" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />
        <div className="flex flex-col gap-4">
          {itemsToDisplay.length > 0 ? (
            itemsToDisplay.map((item) => (
              <UserCartItemsContent 
              key={`${item.productId}-${item.size}-${item.color?.colorName}`}
              cartItem={item}
              isDirectCheckout={isDirectCheckout}  // Pass the checkout type
            />
            ))
          ) : (
            <p className="text-muted-foreground">No items to display</p>
          )}
          
          <div className="mt-8 space-y-4">
            <div className="flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold">₹{totalCartAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="mt-4 w-full">
            <Button 
              onClick={handleInitiatePaypalPayment} 
              className="w-full"
              disabled={isPaymentStart}
            >
              {isPaymentStart
                ? "Processing Paypal Payment..."
                : `Checkout with Paypal (${isDirectCheckout ? 'Direct Purchase' : 'Cart'})`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;