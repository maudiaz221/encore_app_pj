import { prismaClient } from "../../prisma/client";
import { CreateProductDTO, ProductResponse } from "./product.types";

const ProductService = {
  create: async (data: CreateProductDTO): Promise<ProductResponse> => {
    const product = await prismaClient.product.create({ data });
    return { success: true, result: product };
  },

  findOne: async (id: string): Promise<ProductResponse> => {
    const product = await prismaClient.product.findUnique({ where: { id } });
    if (!product) {
      return { success: false, message: "Product not found" };
    }
    return { success: true, result: product };
  },

  findAll: async (): Promise<ProductResponse> => {
    const products = await prismaClient.product.findMany();
    return { success: true, result: products };
  },
};

export default ProductService;