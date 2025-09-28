interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface CreateProductData {
  name: string;
  price: number;
  category: string;
}

export type { Product, CreateProductData };
