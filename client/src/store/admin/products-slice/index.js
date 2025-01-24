import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  productList: [],
};

export const addNewProduct = createAsyncThunk(
  "/products/addnewproduct",
  async (formData) => {
    const result = await axios.post(
      "http://localhost:5000/api/admin/products/add",
      formData,
      { headers: { "Content-Type": "application/json" } } // 👈 Explicit JSON header
    );
    return result?.data;
  }
);

export const editProduct = createAsyncThunk(
  "/products/editProduct",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const result = await axios.put(
        `http://localhost:5000/api/admin/products/edit/${id}`,
        formData
      );
      return result.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchAllProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async () => {
    const result = await axios.get(
      "http://localhost:5000/api/admin/products/get"
    );

    return result?.data;
  }
);

export const deleteProduct = createAsyncThunk(
  "/products/deleteProduct",
  async (id) => {
    const result = await axios.delete(
      `http://localhost:5000/api/admin/products/delete/${id}`
    );

    return result?.data;
  }
);

const AdminProductsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.productList = [];
      })
      // Handling addNewProduct success
      .addCase(addNewProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.data) {
          state.productList = [action.payload.data, ...state.productList];
        }
        // if (action.payload.success) {
        //   state.productList.push(action.payload.product); // Add the new product to the list
        // }
      })
      // Handling editProduct success
      .addCase(editProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedProduct = action.payload?.data;
        
        if (updatedProduct?._id) {
          state.productList = state.productList.map(product => 
            product._id === updatedProduct._id ? updatedProduct : product
          );
        }
      })
      // Handling deleteProduct success
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = state.productList.filter(
          (product) => product._id !== action.payload.id
        );
      });
  },
});

export default AdminProductsSlice.reducer;
