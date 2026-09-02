const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export const dateFormatters = {
  short: new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }),
  monthYear: new Intl.DateTimeFormat("id-ID", {
    month: "short",
    year: "numeric",
  }),
};

export function formatCurrencyIDR(value: number) {
  return currencyFormatter.format(value);
}

export function formatCompactCurrencyIDR(value: number) {
  return compactCurrencyFormatter.format(value).replace("Rp", "").trim();
}

export function formatDateID(
  value: string | number | Date,
  variant: keyof typeof dateFormatters = "short",
) {
  return dateFormatters[variant].format(new Date(value));
}
