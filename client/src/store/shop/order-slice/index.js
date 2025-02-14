import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  approvalURL: null,
  isLoading: false,
  orderId: null,
  orderList: [],
  orderDetails: null,
  paymentVerificationLoading: false,
  phonePeError: null,
};

// export const verifyPhonePePayment = createAsyncThunk(
//   "shopOrders/verifyPhonePePayment",
//   async (transactionId, { rejectWithValue }) => { // Single parameter
//     try {
//       const response = await axios.get(
//         `${import.meta.env.VITE_API_BASE_URL}/shop/order/verify-payment`,
//         { params: { transactionId } } // Proper axios params
//       );
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );

export const verifyPhonePePayment = createAsyncThunk(
  "shopOrders/verifyPhonePePayment",
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/shop/order/verify-payment`,
        { 
          params: { transactionId }, 
          timeout: 15000 // Increased timeout for PhonePe latency
        }
      );

      // Handle API success but payment failure
      if (!response.data.success) {
        throw new Error(response.data.message || "Payment verification failed");
      }

      // Validate critical response data
      if (!response.data.data?.transactionId || !response.data.data?.status) {
        throw new Error("Invalid verification response format");
      }

      return {
        ...response.data,
        transactionId // Ensure we return the verified ID
      };

    } catch (error) {
      // Handle different error types
      const errorMessage = error.response?.data?.error?.message || 
                          error.message || 
                          "Payment verification failed";
      return rejectWithValue(errorMessage);
    }
  }
);

export const createNewOrder = createAsyncThunk(
  "/order/createNewOrder",
  async (orderData) => {
    const response = await axios.post(
      "http://localhost:5000/api/shop/order/create",
      orderData
    );

    return response.data;
  }
);

export const capturePayment = createAsyncThunk(
  "/order/capturePayment",
  async ({ paymentId, payerId, orderId }) => {
    const response = await axios.post(
      "http://localhost:5000/api/shop/order/capture",
      {
        paymentId,
        payerId,
        orderId,
      }
    );

    return response.data;
  }
);

export const getAllOrdersByUserId = createAsyncThunk(
  "/order/getAllOrdersByUserId",
  async (userId) => {
    const response = await axios.get(
      `http://localhost:5000/api/shop/order/list/${userId}`
    );

    return response.data;
  }
);

export const getOrderDetails = createAsyncThunk(
  "/order/getOrderDetails",
  async (id) => {
    const response = await axios.get(
      `http://localhost:5000/api/shop/order/details/${id}`
    );

    return response.data;
  }
);

const shoppingOrderSlice = createSlice({
  name: "shoppingOrderSlice",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.approvalURL = action.payload.approvalURL;
        state.orderId = action.payload.orderId;
        sessionStorage.setItem(
          "currentOrderId",
          JSON.stringify(action.payload.orderId)
        );
      })
      .addCase(createNewOrder.rejected, (state) => {
        state.isLoading = false;
        state.approvalURL = null;
        state.orderId = null;
      })
      .addCase(getAllOrdersByUserId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrdersByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data;
      })
      .addCase(getAllOrdersByUserId.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
      })
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.data;
      })
      .addCase(getOrderDetails.rejected, (state) => {
        state.isLoading = false;
        state.orderDetails = null;
      })
      .addCase(verifyPhonePePayment.pending, (state) => {
        state.paymentVerificationLoading = true;
        state.phonePeError = null;
      })
      .addCase(verifyPhonePePayment.fulfilled, (state, action) => {
        state.paymentVerificationLoading = false;
        // Update order status in list
        state.orderList = state.orderList.map((order) =>
          order._id === action.payload.data._id ? action.payload.data : order
        );
        // Update current order details if open
        if (state.orderDetails?._id === action.payload.data._id) {
          state.orderDetails = action.payload.data;
        }
      })
      .addCase(verifyPhonePePayment.rejected, (state, action) => {
        state.paymentVerificationLoading = false;
        state.phonePeError = action.payload;
      });
  },
});

export const { resetOrderDetails } = shoppingOrderSlice.actions;

export default shoppingOrderSlice.reducer;
