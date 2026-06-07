-- Dominoe Operations Dashboard — D1 Schema

-- ─── Vehicles (Turo fleet + wholesale pipeline) ────────────────────────────
CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year INTEGER NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  vin TEXT,
  status TEXT NOT NULL DEFAULT 'available', -- available | rented | wholesale | sold
  stream TEXT NOT NULL DEFAULT 'turo',       -- turo | wholesale
  purchase_price REAL,
  purchase_source TEXT,                      -- Manheim | ADESA | Local Dealer | Private
  purchase_date TEXT,
  turo_rating REAL,
  turo_review_count INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Turo Payouts ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS turo_payouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id INTEGER REFERENCES vehicles(id),
  gross_amount REAL NOT NULL,
  turo_fee REAL NOT NULL,
  net_amount REAL NOT NULL,
  rental_start TEXT NOT NULL,
  rental_end TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'email', -- email | manual
  raw_email_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Wholesale Transactions ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wholesale_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id INTEGER REFERENCES vehicles(id),
  type TEXT NOT NULL, -- purchase | sale
  amount REAL NOT NULL,
  buyer_seller TEXT,
  buyer_type TEXT,    -- dealer | private | auction
  transaction_date TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'email', -- email | manual
  raw_email_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Carwash (R&A Auto Spa) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS carwash_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entry_date TEXT NOT NULL,
  total_revenue REAL NOT NULL,
  transaction_count INTEGER,
  ash_share_pct REAL NOT NULL DEFAULT 50.0,
  ash_share_amount REAL GENERATED ALWAYS AS (total_revenue * ash_share_pct / 100) STORED,
  -- package breakdown (optional, for days when machine exports are available)
  basic_count INTEGER,    -- $6
  supreme_count INTEGER,  -- $7
  ultimate_count INTEGER, -- $8
  complete_count INTEGER, -- $10
  source TEXT NOT NULL DEFAULT 'manual',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Mobile Detail Jobs (R&A Mobile) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS detail_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_date TEXT NOT NULL,
  customer_name TEXT,
  contractor_id INTEGER REFERENCES contractors(id),
  service_type TEXT NOT NULL, -- full_detail | interior | exterior | other
  amount REAL NOT NULL,
  payment_method TEXT NOT NULL, -- cash | venmo | zelle
  ash_share_pct REAL NOT NULL DEFAULT 50.0,
  ash_share_amount REAL GENERATED ALWAYS AS (amount * ash_share_pct / 100) STORED,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Contractors (1099) ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contractors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contractor_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contractor_id INTEGER NOT NULL REFERENCES contractors(id),
  amount REAL NOT NULL,
  payment_date TEXT NOT NULL,
  payment_method TEXT NOT NULL, -- cash | venmo | zelle | check
  work_category TEXT,           -- detailing | other
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Email Parse Log ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS parsed_emails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email_id TEXT UNIQUE NOT NULL,
  sender TEXT NOT NULL,
  subject TEXT NOT NULL,
  parsed_at TEXT NOT NULL DEFAULT (datetime('now')),
  stream TEXT NOT NULL,   -- turo | manheim | adesa
  status TEXT NOT NULL,   -- success | error | skipped
  error_msg TEXT
);

-- ─── Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_turo_payouts_vehicle ON turo_payouts(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_turo_payouts_date ON turo_payouts(rental_start);
CREATE INDEX IF NOT EXISTS idx_wholesale_vehicle ON wholesale_transactions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_carwash_date ON carwash_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_detail_date ON detail_jobs(job_date);
CREATE INDEX IF NOT EXISTS idx_detail_contractor ON detail_jobs(contractor_id);
CREATE INDEX IF NOT EXISTS idx_contractor_payments_contractor ON contractor_payments(contractor_id);
CREATE INDEX IF NOT EXISTS idx_contractor_payments_date ON contractor_payments(payment_date);
