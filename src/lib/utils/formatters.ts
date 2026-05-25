export function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "-";

  return `TSh ${new Intl.NumberFormat("en-TZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num)}`;
}

export function formatNumber(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "-";
  return new Intl.NumberFormat("en-TZ").format(num);
}
