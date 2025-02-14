import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import ShoppingOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersByUserId,
  getOrderDetails,
  resetOrderDetails,
} from "@/store/shop/order-slice";
import { Badge } from "../ui/badge";

function ShoppingOrders() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orderList, orderDetails, isLoading } = useSelector((state) => state.shopOrder);

  function handleFetchOrderDetails(orderId) {
    if (orderId) {
      dispatch(getOrderDetails(orderId));
    }
  }

  useEffect(() => {
    if (user?.id) {
      dispatch(getAllOrdersByUserId(user.id));
    }
  }, [dispatch, user?.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Order Price</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : orderList?.length > 0 ? (
              orderList.map((orderItem) => (
                <TableRow key={orderItem._id}>
                  <TableCell className="font-medium">
                    {orderItem._id.substring(18, 24).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    {orderItem.orderDate 
                      ? new Date(orderItem.orderDate).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`py-1 px-3 ${
                        orderItem.orderStatus === "confirmed"
                          ? "bg-green-500"
                          : orderItem.orderStatus === "rejected"
                          ? "bg-red-600"
                          : "bg-gray-500"
                      }`}
                    >
                      {orderItem.orderStatus || 'Processing'}
                    </Badge>
                  </TableCell>
                  <TableCell>₹{orderItem.totalAmount?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleFetchOrderDetails(orderItem._id);
                        setOpenDetailsDialog(true);
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Dialog
          open={openDetailsDialog}
          onOpenChange={(open) => {
            if (!open) {
              setOpenDetailsDialog(false);
              dispatch(resetOrderDetails());
            }
          }}
        >
          <ShoppingOrderDetailsView orderDetails={orderDetails} />
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default ShoppingOrders;