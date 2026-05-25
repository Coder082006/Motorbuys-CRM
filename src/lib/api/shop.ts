import apiClient, { BASE_URL, getResults, type PaginatedResponse } from "./client";

export type MotorbikeProduct = {
  id: number;
  model_detail?: {
    brand: string;
    model_name: string;
    engine_cc: number;
    bike_type: string;
  };
  color: string;
  year: number;
  price: string | number;
  status: string;
  image?: string | null;
  notes?: string;
};

export type ShopOrder = {
  id: number;
  motorbike: number;
  motorbike_detail?: MotorbikeProduct;
  customer_name?: string;
  status: string;
  payment_method: string;
  total_amount: string | number;
  delivery_address: string;
  delivery_city?: string;
  delivery_region?: string;
  phone: string;
  notes?: string;
  created_at: string;
};

export type AdminCustomer = {
  id: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  created_at?: string;
};

export type CreateOrderPayload = {
  motorbike: number;
  payment_method: "mpesa" | "cash" | "bank_transfer" | "installment";
  delivery_address: string;
  delivery_city?: string;
  delivery_region?: string;
  phone: string;
  notes?: string;
};

export async function getShopProducts() {
  const response = await fetch(`${BASE_URL}/shop/products/`);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return getResults((await response.json()) as PaginatedResponse<MotorbikeProduct>);
}

export async function getShopProduct(id: number) {
  const response = await fetch(`${BASE_URL}/shop/products/${id}/`);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as MotorbikeProduct;
}

export async function createShopOrder(payload: CreateOrderPayload) {
  return apiClient<ShopOrder>("/shop/orders/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMyOrders() {
  return apiClient<PaginatedResponse<ShopOrder>>("/shop/orders/");
}

export async function getAdminOrders() {
  return apiClient<PaginatedResponse<ShopOrder>>("/orders/");
}

export async function getAdminCustomers() {
  return apiClient<PaginatedResponse<AdminCustomer>>("/customers/");
}
