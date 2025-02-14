import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  featureImageList: [],
  error: null,
};

export const getFeatureImages = createAsyncThunk(
  "feature/getFeatureImages",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/common/feature/get`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addFeatureImage = createAsyncThunk(
  "feature/addFeatureImage",
  async (image, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/common/feature/add`,
        { image }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Add this new async thunk for deletion
export const removeFeatureImage = createAsyncThunk(
  "feature/removeFeatureImage",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/common/feature/delete/${id}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const commonSlice = createSlice({
  name: "commonFeature",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFeatureImages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFeatureImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featureImageList = action.payload.data;
      })
      .addCase(getFeatureImages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(addFeatureImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addFeatureImage.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(addFeatureImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add cases for removeFeatureImage
      .addCase(removeFeatureImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFeatureImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featureImageList = state.featureImageList.filter(
          img => img._id !== action.payload.data._id
        );
      })
      .addCase(removeFeatureImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default commonSlice.reducer;