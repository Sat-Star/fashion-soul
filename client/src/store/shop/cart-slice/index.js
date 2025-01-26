import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
  isLoading: false,
  error: null,
};

const initialDirectCheckoutState = {
  directCheckoutItems: [],
  isLoading: false,
  error: null
};

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ userId, productId, quantity, size, color }) => {
    const response = await axios.post(
      "http://localhost:5000/api/shop/cart/add",
      {
        userId,
        productId,
        quantity,
        size,
        color,
      }
    );
    return response.data;
  }
);

export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (userId) => {
    const response = await axios.get(
      `http://localhost:5000/api/shop/cart/get/${userId}`
    );
    return response.data;
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async ({ userId, productId, size, color }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/shop/cart/delete/${userId}`,
        { 
          data: { 
            productId,
            size,
            color 
          } 
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Delete failed" });
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async ({ userId, productId, quantity, size, color }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        "http://localhost:5000/api/shop/cart/update-cart",
        { userId, productId, quantity, size, color }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createDirectCheckout = createAsyncThunk(
  "directCheckout/createDirectCheckout",
  async (checkoutData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/shop/cart/direct-checkout",
        checkoutData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const shoppingCartSlice = createSlice({
  name: "shoppingCart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Add to Cart
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data.items;
      })

      // Fetch Cart Items
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data.items.map((item) => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          salePrice: item.salePrice,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          image: item.image,
        }));
      })

      // Update Quantity
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data.items;
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to update quantity";
      })

      // Delete Item
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data.items;
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to delete item";
      })

      // Common error handling
      .addMatcher(
        (action) =>
          action.type.startsWith("cart/") && action.type.endsWith("/pending"),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("cart/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.isLoading = false;
          state.error =
            action.error?.message || "Failed to process cart operation";
        }
      );
  },
});

export const directCheckoutSlice = createSlice({
  name: "directCheckout",
  initialState: initialDirectCheckoutState,
  reducers: {
    resetDirectCheckout: (state) => {
      state.directCheckoutItems = [];
    },
    removeDirectCheckoutItem: (state, action) => {
      state.directCheckoutItems = state.directCheckoutItems.filter(item => 
        !(item.productId === action.payload.productId &&
          item.size === action.payload.size &&
          item.color.colorName === action.payload.color.colorName)
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createDirectCheckout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDirectCheckout.fulfilled, (state, action) => {
        state.isLoading = false;
        state.directCheckoutItems = action.payload.data;
      })
      .addCase(createDirectCheckout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Direct checkout failed";
      });
  }
});

export default shoppingCartSlice.reducer;
export const directCheckoutReducer = directCheckoutSlice.reducer;
export const { resetDirectCheckout, removeDirectCheckoutItem } = directCheckoutSlice.actions;