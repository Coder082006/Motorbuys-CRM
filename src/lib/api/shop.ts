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
  customer_order_number: number;
  motorbike: number;
  motorbike_detail?: MotorbikeProduct;
  motorbike_name?: string;
  customer_name?: string;
  status: string;
  payment_method: string;
  total_amount: string | number;
  amount?: string | number;
  transaction_id?: string;
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

export type CustomerProfile = {
  id: number;
  full_name: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone: string;
  alt_phone?: string | null;
  region?: string | null;
  district?: string | null;
  address?: string | null;
  budget?: string | number | null;
  preferred_bike_type?: string | null;
  notes?: string | null;
  created_at?: string;
  date_joined?: string;
  profile_picture?: string | null;
  has_photo?: boolean;
  initials?: string;
  avatar_color?: string | null;
  onboarding_completed?: boolean | null;
  onboarding_skipped?: boolean | null;
  use_case?: string | null;
  budget_range?: string | null;
  preferred_brands?: string | string[] | null;
  preferred_features?: string[] | null;
  riding_experience?: string | null;
  heard_from?: string | null;
};

export type OnboardingPayload = {
  onboarding_completed: boolean;
  onboarding_skipped?: boolean;
  use_case?: string;
  budget_range?: string;
  preferred_brands?: string;
  preferred_features?: string[];
  riding_experience?: string;
  heard_from?: string;
  alt_phone?: string;
  region?: string;
  district?: string;
  address?: string;
  preferred_bike_type?: string;
  notes?: string;
};

export type CreateOrderPayload = {
  motorbike: number;
  payment_method: "mpesa" | "cash" | "bank_transfer" | "installment" | "demo";
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

export async function completeDemoPayment(orderId: number, phone: string) {
  return apiClient<ShopOrder>(`/shop/orders/${orderId}/complete-demo-payment/`, {
    method: "POST",
    body: JSON.stringify({ phone }),
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

export async function getMyCustomerProfile() {
  return apiClient<CustomerProfile>("/customers/me/");
}

export async function updateMyCustomerProfile(payload: FormData) {
  return apiClient<CustomerProfile>("/customers/me/", {
    method: "PATCH",
    body: payload,
  });
}

export async function saveMyOnboarding(payload: OnboardingPayload) {
  return apiClient<CustomerProfile>("/customers/me/onboarding/", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
