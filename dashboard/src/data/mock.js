// Ash's real 13-vehicle Turo fleet
export const FLEET = [
  { id: 1, year: 2026, make: 'Nissan', model: 'Sentra', status: 'available', turo_rating: 5.0, turo_review_count: 11 },
  { id: 2, year: 2025, make: 'Jeep', model: 'Grand Cherokee', status: 'rented', turo_rating: 4.96, turo_review_count: 62 },
  { id: 3, year: 2025, make: 'Jeep', model: 'Gladiator High Tide', status: 'available', turo_rating: 5.0, turo_review_count: 40 },
  { id: 4, year: 2025, make: 'Toyota', model: 'Camry Hybrid', status: 'rented', turo_rating: 5.0, turo_review_count: 45 },
  { id: 5, year: 2025, make: 'Mitsubishi', model: 'Outlander Sport', status: 'available', turo_rating: 4.9, turo_review_count: 22 },
  { id: 6, year: 2025, make: 'Hyundai', model: 'Sonata', status: 'rented', turo_rating: 4.67, turo_review_count: 5 },
  { id: 7, year: 2025, make: 'Kia', model: 'K4', status: 'available', turo_rating: 5.0, turo_review_count: 9 },
  { id: 8, year: 2024, make: 'Chrysler', model: 'Pacifica', status: 'available', turo_rating: 4.96, turo_review_count: 28 },
  { id: 9, year: 2023, make: 'Dodge', model: 'Charger', status: 'rented', turo_rating: 5.0, turo_review_count: 58 },
  { id: 10, year: 2023, make: 'INFINITI', model: 'QX60', status: 'available', turo_rating: null, turo_review_count: 0 },
  { id: 11, year: 2023, make: 'Hyundai', model: 'Tucson', status: 'available', turo_rating: 5.0, turo_review_count: 8 },
  { id: 12, year: 2022, make: 'Toyota', model: 'Camry', status: 'rented', turo_rating: 5.0, turo_review_count: 39 },
  { id: 13, year: 2016, make: 'Mazda', model: 'CX-5', status: 'wholesale', turo_rating: 4.83, turo_review_count: 14 },
]

export const CONTRACTORS = [
  { id: 1, name: 'Marcus Johnson', phone: '843-555-0101', ytd_total: 520, threshold_status: 'approaching' },
  { id: 2, name: 'DeAndre Williams', phone: '843-555-0102', ytd_total: 340, threshold_status: 'normal' },
  { id: 3, name: 'James Rivera', phone: '843-555-0103', ytd_total: 680, threshold_status: 'over' },
]

export const RECENT_TRANSACTIONS = [
  { stream: 'turo', amount: 287.50, date: '2026-06-05', label: 'Jeep Grand Cherokee' },
  { stream: 'detail', amount: 180.00, date: '2026-06-04', label: 'Full Detail' },
  { stream: 'turo', amount: 195.00, date: '2026-06-04', label: 'Toyota Camry Hybrid' },
  { stream: 'carwash', amount: 142.00, date: '2026-06-03', label: 'Car Wash' },
  { stream: 'wholesale', amount: 2800.00, date: '2026-06-02', label: '2019 Altima — Sold' },
  { stream: 'turo', amount: 312.00, date: '2026-06-01', label: 'Dodge Charger' },
  { stream: 'detail', amount: 120.00, date: '2026-05-31', label: 'Interior Only' },
  { stream: 'turo', amount: 168.00, date: '2026-05-30', label: 'Kia K4' },
  { stream: 'carwash', amount: 156.00, date: '2026-05-29', label: 'Car Wash' },
  { stream: 'detail', amount: 200.00, date: '2026-05-28', label: 'Full Detail' },
]

export const STREAM_MTD = {
  turo:      { mtd: 4218.50, count: 18, label: 'Turo Rentals', auto: true },
  wholesale: { mtd: 2800.00, count: 1,  label: 'Wholesale',    auto: true },
  carwash:   { mtd: 1284.00, count: 9,  label: 'R&A Auto Spa', auto: false },
  detail:    { mtd: 980.00,  count: 6,  label: 'R&A Mobile',   auto: false },
}

export const OVERVIEW = {
  totalMtd: 9282.50,
  totalExpenses: 3420.00,
  netMtd: 5862.50,
  ytdNet: 42750.00,
  lastMonthNet: 6340.00,
}

export const WHOLESALE_PIPELINE = [
  { id: 20, year: 2020, make: 'Honda', model: 'Accord', status: 'sourced', cost: 8200, source: 'Manheim' },
  { id: 21, year: 2018, make: 'Toyota', model: 'RAV4', status: 'listed', cost: 6800, source: 'ADESA' },
  { id: 22, year: 2021, make: 'Nissan', model: 'Rogue', status: 'pending', cost: 9500, source: 'Manheim' },
]

export const CONTRACTOR_PAYMENTS = [
  { id: 1, contractor_id: 1, contractor_name: 'Marcus Johnson', amount: 72, payment_date: '2026-06-04', payment_method: 'venmo', work_category: 'detailing' },
  { id: 2, contractor_id: 3, contractor_name: 'James Rivera', amount: 90, payment_date: '2026-06-03', payment_method: 'cash', work_category: 'detailing' },
  { id: 3, contractor_id: 2, contractor_name: 'DeAndre Williams', amount: 60, payment_date: '2026-06-01', payment_method: 'zelle', work_category: 'detailing' },
  { id: 4, contractor_id: 1, contractor_name: 'Marcus Johnson', amount: 80, payment_date: '2026-05-29', payment_method: 'cash', work_category: 'detailing' },
]

export const SERVICE_TYPES = [
  { value: 'full_detail', label: 'Full Detail' },
  { value: 'interior', label: 'Interior' },
  { value: 'exterior', label: 'Exterior' },
  { value: 'other', label: 'Other' },
]

export const QUICK_AMOUNTS = [80, 120, 180, 200]

export const PAYMENT_METHODS = ['Cash', 'Venmo', 'Zelle']

export const CARWASH_PACKAGES = [
  { name: 'Basic', price: 6 },
  { name: 'Supreme', price: 7 },
  { name: 'Ultimate', price: 8 },
  { name: 'Complete', price: 10 },
]

export const AUCTION_SOURCES = ['Manheim', 'ADESA', 'Local Dealer', 'Private']

export const BUYER_TYPES = ['Dealer', 'Private', 'Auction']

export function streamColor(stream) {
  return {
    turo: '#4a9eff',
    wholesale: '#d4a843',
    carwash: '#34c759',
    detail: '#af52de',
  }[stream] || '#888'
}

export function statusColor(status) {
  return {
    available: '#34c759',
    rented: '#ff9500',
    wholesale: '#d4a843',
    sold: '#888',
  }[status] || '#888'
}

export function statusLabel(status) {
  return {
    available: 'Available',
    rented: 'Rented',
    wholesale: 'Wholesale',
    sold: 'Sold',
  }[status] || status
}

export function thresholdColor(status) {
  return {
    normal: '#d4a843',
    approaching: '#ff9500',
    over: '#ff3b30',
  }[status] || '#d4a843'
}

export function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
