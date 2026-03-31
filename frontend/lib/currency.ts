export interface CountryCurrencyMap {
  code: string          // e.g., 'KE'
  prefix: string        // e.g., '+254'
  name: string          // e.g., 'Kenya'
  currency: string      // e.g., 'KES'
  symbol: string        // e.g., 'KSh '
  pricePer10: number    // Price for 10 AI credits in this currency
  smsCost: number       // Estimated cost for 1 SMS unit
  paymentMethod: string // e.g., 'M-Pesa', 'MTN MoMo', 'Bank Transfer'
}

export const COUNTRIES: CountryCurrencyMap[] = [
  { code: 'KE', prefix: '+254', name: 'Kenya',         currency: 'KES', symbol: 'KSh ', pricePer10: 100,  smsCost: 0.5,  paymentMethod: 'M-Pesa' },
  { code: 'UG', prefix: '+256', name: 'Uganda',        currency: 'UGX', symbol: 'UGX ', pricePer10: 3000, smsCost: 15,   paymentMethod: 'MTN MoMo' },
  { code: 'NG', prefix: '+234', name: 'Nigeria',       currency: 'NGN', symbol: '₦',    pricePer10: 1200, smsCost: 4,    paymentMethod: 'Bank Transfer' },
  { code: 'GH', prefix: '+233', name: 'Ghana',         currency: 'GHS', symbol: 'GH₵',  pricePer10: 15,   smsCost: 0.05, paymentMethod: 'Mobile Money' },
  { code: 'ZA', prefix: '+27',  name: 'South Africa',  currency: 'ZAR', symbol: 'R ',   pricePer10: 15,   smsCost: 0.20, paymentMethod: 'Card / EFT' },
  { code: 'TZ', prefix: '+255', name: 'Tanzania',      currency: 'TZS', symbol: 'TSh ', pricePer10: 2000, smsCost: 10,   paymentMethod: 'Tigo/Vodacom' },
  { code: 'RW', prefix: '+250', name: 'Rwanda',        currency: 'RWF', symbol: 'FRw ', pricePer10: 1000, smsCost: 5,    paymentMethod: 'MTN MoMo' },
]

export const DEFAULT_COUNTRY = COUNTRIES[0] // Kenya (KES)

/** Format a number as currency using the active country's formatting */
export function formatCurrency(amount: number, country: CountryCurrencyMap = DEFAULT_COUNTRY): string {
  // Use Intl.NumberFormat to handle commas (e.g., 3,000)
  const formattedAmount = new Intl.NumberFormat('en-US').format(amount)
  
  // Custom fallback string formats based on our data
  return `${country.symbol}${formattedAmount}`
}

/** Given a phone number (e.g. +25677...), find the best matching country settings */
export function getCountryByPrefix(phone: string): CountryCurrencyMap {
  const p = phone.trim()
  if (!p) return DEFAULT_COUNTRY
  
  // Find longest matching prefix
  let match = DEFAULT_COUNTRY
  let longestMatch = 0
  
  for (const c of COUNTRIES) {
    if (p.startsWith(c.prefix) && c.prefix.length > longestMatch) {
      match = c
      longestMatch = c.prefix.length
    }
  }
  return match
}
