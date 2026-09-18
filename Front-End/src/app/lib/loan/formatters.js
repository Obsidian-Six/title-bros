export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(
    Number(value) || 0
  );
}

export function parseNumber(value) {
  return (
    Number(
      String(value ?? "").replace(/\D/g, "")
    ) || 0
  );
}