// A small helper so every price in the app looks the same ("$1,234.50").
// Intl.NumberFormat is built into JavaScript and handles commas, decimals and the currency sign.
// We create the formatter ONCE (outside the function) because creating it is slow-ish.
const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

// Takes a number and returns a string. The `: string` after () is the RETURN type.
export function formatPrice(price: number): string {
  return formatter.format(price)
}
