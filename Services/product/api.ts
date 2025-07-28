import { api, APIError } from "encore.dev/api";
import { CreateProductDTO, ProductResponse } from "./product.types";
import ProductService from "./product.service";

export const create = api(
  { expose: true, method: "POST", path: "/products" },
  async (data: CreateProductDTO): Promise<ProductResponse> => {
    try {
      if (!data.title || data.price == null) {
        throw APIError.invalidArgument("Missing fields");
      }
      return await ProductService.create(data);
    } catch (error) {
      throw APIError.aborted(error?.toString() || "Error creating product");
    }
  }
);

export const read = api(
  { expose: true, method: "GET", path: "/products" },
  async (): Promise<ProductResponse> => {
    try {
      return await ProductService.findAll();
    } catch (error) {
      throw APIError.aborted(error?.toString() || "Error fetching products");
    }
  }
);

export const readOne = api(
  { expose: true, method: "GET", path: "/products/:id" },
  async ({ id }: { id: string }): Promise<ProductResponse> => {
    try {
      return await ProductService.findOne(id);
    } catch (error) {
      throw APIError.aborted(error?.toString() || "Error fetching product");
    }
  }
);