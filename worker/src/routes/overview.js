export async function handleOverview({ env, json }) {
  const { DB } = env
  const now = new Date().toISOString().slice(0, 7) // YYYY-MM

  const [turo, wholesale, carwash, detail] = await Promise.all([
    DB.prepare(`
      SELECT COALESCE(SUM(net_amount),0) AS mtd, COUNT(*) AS count
      FROM turo_payouts WHERE strftime('%Y-%m', rental_start) = ?
    `).bind(now).first(),

    DB.prepare(`
      SELECT COALESCE(SUM(amount),0) AS revenue, COALESCE(SUM(CASE WHEN type='purchase' THEN amount ELSE 0 END),0) AS cogs
      FROM wholesale_transactions WHERE strftime('%Y-%m', transaction_date) = ?
    `).bind(now).first(),

    DB.prepare(`
      SELECT COALESCE(SUM(ash_share_amount),0) AS mtd
      FROM carwash_entries WHERE strftime('%Y-%m', entry_date) = ?
    `).bind(now).first(),

    DB.prepare(`
      SELECT COALESCE(SUM(ash_share_amount),0) AS mtd, COUNT(*) AS count
      FROM detail_jobs WHERE strftime('%Y-%m', job_date) = ?
    `).bind(now).first(),
  ])

  const wholesaleNet = (wholesale?.revenue ?? 0) - (wholesale?.cogs ?? 0)

  const streams = {
    turo:      { mtd: turo?.mtd ?? 0,       count: turo?.count ?? 0 },
    wholesale: { mtd: wholesaleNet,           count: 0 },
    carwash:   { mtd: carwash?.mtd ?? 0 },
    detail:    { mtd: detail?.mtd ?? 0,      count: detail?.count ?? 0 },
  }

  const totalMtd = Object.values(streams).reduce((s, v) => s + v.mtd, 0)

  const recent = await DB.prepare(`
    SELECT 'turo' AS stream, net_amount AS amount, rental_start AS date, v.make || ' ' || v.model AS label
    FROM turo_payouts p JOIN vehicles v ON v.id = p.vehicle_id
    UNION ALL
    SELECT 'detail', amount, job_date, service_type FROM detail_jobs
    UNION ALL
    SELECT 'carwash', ash_share_amount, entry_date, 'Car Wash' FROM carwash_entries
    ORDER BY date DESC LIMIT 20
  `).all()

  return json({ totalMtd, streams, recent: recent.results })
}
