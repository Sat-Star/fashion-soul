import { useState, useEffect } from "react";
import CommonForm from "../common/form";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} from "@/store/admin/order-slice";
import { useToast } from "../ui/use-toast";

const initialFormData = {
  status: "",
};

function AdminOrderDetailsView({ orderDetails }) {
  const [formData, setFormData] = useState(initialFormData);
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Initialize form with current order status
  useEffect(() => {
    if (orderDetails?.orderStatus) {
      setFormData({ status: orderDetails.orderStatus });
    }
  }, [orderDetails]);

  async function handleUpdateStatus(event) {
    event.preventDefault();
    try {
      const result = await dispatch(
        updateOrderStatus({
          id: orderDetails?._id,
          orderStatus: formData.status
        })
      ).unwrap();

      if (result.success) {
        // Refresh data
        await dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        
        toast({
          title: "Order Updated",
          description: result.message,
          variant: "success"
        });
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  return (
    <DialogContent className="sm:max-w-[600px]">
      <div className="grid gap-6">
        <div className="grid gap-2">
          {/* Order Information Section */}
          <div className="flex items-center justify-between">
            <p className="font-medium">Order ID</p>
            <Label>{orderDetails?._id || 'N/A'}</Label>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="font-medium">Order Date</p>
            <Label>
              {orderDetails?.orderDate ? 
                new Date(orderDetails.orderDate).toLocaleDateString() : 
                'N/A'
              }
            </Label>
          </div>

          <div className="flex items-center justify-between">
            <p className="font-medium">Order Price</p>
            <Label>₹{orderDetails?.totalAmount?.toFixed(2) || '0.00'}</Label>
          </div>

          <div className="flex items-center justify-between">
            <p className="font-medium">Payment Method</p>
            <Label className="capitalize">
              {orderDetails?.paymentMethod || 'N/A'}
            </Label>
          </div>

          <div className="flex items-center justify-between">
            <p className="font-medium">Payment Status</p>
            <Badge
              className={`py-1 px-3 ${
                orderDetails?.paymentStatus === 'paid' 
                  ? 'bg-green-500' 
                  : 'bg-red-500'
              }`}
            >
              {orderDetails?.paymentStatus || 'N/A'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <p className="font-medium">Order Status</p>
            <Badge
              className={`py-1 px-3 ${
                orderDetails?.orderStatus === "confirmed" ? "bg-green-500" :
                orderDetails?.orderStatus === "rejected" ? "bg-red-600" :
                orderDetails?.orderStatus === "delivered" ? "bg-blue-500" :
                "bg-gray-500"
              }`}
            >
              {orderDetails?.orderStatus || 'Processing'}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Order Items Section */}
        <div className="grid gap-4">
          <div className="font-medium">Order Items</div>
          <ul className="grid gap-3">
            {orderDetails?.cartItems?.map((item, index) => (
              <li 
                key={`${item.productId}-${index}`}
                className="flex items-center justify-between py-2 border-b"
              >
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  {item.color && (
                    <div className="flex items-center gap-2 mt-1">
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: item.color.colorCode }}
                      />
                      <span>{item.color.colorName}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 w-48 justify-end">
                  <span>Qty: {item.quantity}</span>
                  <span>₹{item.price?.toFixed(2)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Shipping Information */}
        <div className="grid gap-4">
          <div className="font-medium">Shipping Details</div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span>{orderDetails?.addressInfo?.name || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Address:</span>
              <span className="text-right">
                {orderDetails?.addressInfo?.address || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">City:</span>
              <span>{orderDetails?.addressInfo?.city || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pincode:</span>
              <span>{orderDetails?.addressInfo?.pincode || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Phone:</span>
              <span>{orderDetails?.addressInfo?.phone || 'N/A'}</span>
            </div>
            {orderDetails?.addressInfo?.notes && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Notes:</span>
                <span className="text-right">
                  {orderDetails.addressInfo.notes}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Status Update Form */}
        <Separator />
        <CommonForm
          formControls={[
            {
              label: "Update Order Status",
              name: "status",
              componentType: "select",
              options: [
                { id: "pending", label: "Pending" },
                { id: "confirmed", label: "Confirmed" },
                { id: "inProcess", label: "In Process" },
                { id: "inShipping", label: "In Shipping" },
                { id: "delivered", label: "Delivered" },
                { id: "rejected", label: "Rejected" },
              ],
            },
          ]}
          formData={formData}
          setFormData={setFormData}
          buttonText="Update Status"
          onSubmit={handleUpdateStatus}
          disabled={!orderDetails}
        />
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;