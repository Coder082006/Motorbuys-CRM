import apiClient from "./client";

// Fetches the dashboard report summary.
export async function getDashboard() {
  return apiClient("/reports/dashboard/");
}

// Fetches the sales report data.
export async function getSalesReport() {
  return apiClient("/reports/sales/");
}

// Fetches the inventory report data.
export async function getInventoryReport() {
  return apiClient("/reports/inventory/");
}

// Fetches the financing report data.
export async function getFinancingReport() {
  return apiClient("/reports/financing/");
}

// Fetches the advertising report data.
export async function getAdvertisingReport() {
  return apiClient("/reports/advertising/");
}

// Fetches the marketing report data.
export async function getMarketingReport() {
  return apiClient("/reports/marketing/");
}
