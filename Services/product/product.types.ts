export interface ProductDTO {
    id: string;
    title: string;
    price: number;
  }
  
  export interface CreateProductDTO {
    title: string;
    price: number;
  }
  
  export interface UpdateProductDTO {
    title?: string;
    price?: number;
  }
  
  export interface ProductResponse {
    success: boolean;
    message?: string;
    result?: ProductDTO | ProductDTO[];
  }