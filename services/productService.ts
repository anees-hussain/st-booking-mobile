// services/productService.ts

import API from "./api";

export interface ProductPayload {
  name: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
}

// GET ALL PRODUCTS
export const getProducts = async () => {
  try {
    const response = await API.get("/products");

    return response.data;
  } catch (error) {
    console.log("GET PRODUCTS ERROR:", error);
    throw error;
  }
};

// GET SINGLE PRODUCT
export const getSingleProduct = async (id: string) => {
  try {
    const response = await API.get(`/products/${id}`);

    return response.data;
  } catch (error) {
    console.log("GET SINGLE PRODUCT ERROR:", error);

    throw error;
  }
};

// CREATE PRODUCT
export const createProduct = async (productData: ProductPayload) => {
  try {
    const response = await API.post("/products", productData);

    return response.data;
  } catch (error) {
    console.log("CREATE PRODUCT ERROR:", error);

    throw error;
  }
};

// UPDATE PRODUCT
export const updateProduct = async (
  id: string,
  productData: ProductPayload,
) => {
  try {
    const response = await API.put(`/products/${id}`, productData);

    return response.data;
  } catch (error) {
    console.log("UPDATE PRODUCT ERROR:", error);

    throw error;
  }
};

// DELETE PRODUCT
export const deleteProduct = async (id: string) => {
  try {
    const response = await API.delete(`/products/${id}`);

    return response.data;
  } catch (error) {
    console.log("DELETE PRODUCT ERROR:", error);

    throw error;
  }
};

// UPDATE PRODUCT RATE
export const updateProductRates = async (id: string, rate: number) => {
  try {
    const response = await API.put(`/products/update-rate/${id}`, {
      rate,
    });

    return response.data;
  } catch (error) {
    console.log("UPDATE PRODUCT RATE ERROR:", error);

    throw error;
  }
};
