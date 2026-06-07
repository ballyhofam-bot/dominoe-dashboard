const THRESHOLD_1099 = 600

export async function handleContractors({ env, request, id, json, notFound }) {
  const { DB } = env
  const method = request.method
  const url = new URL(request.url)

  // GET /api/contractors — list with YTD totals
  if (method === 'GET' && !id) {
    const year = url.searchParams.get('year') ?? new Date().getFullYear()
    const rows = await DB.prepare(`
      SELECT c.*,
        COALESCE(SUM(p.amount), 0) AS ytd_total,
        CASE
          WHEN COALESCE(SUM(p.amount), 0) >= ${THRESHOLD_1099} THEN 'over'
          WHEN COALESCE(SUM(p.amount), 0) >= ${THRESHOLD_1099} * 0.75 THEN 'approaching'
          ELSE 'normal'
        END AS threshold_status
      FROM contractors c
      LEFT JOIN contractor_payments p
        ON p.contractor_id = c.id AND strftime('%Y', p.payment_date) = ?
      WHERE c.active = 1
      GROUP BY c.id
      ORDER BY ytd_total DESC
    `).bind(String(year)).all()
    return json({ threshold: THRESHOLD_1099, contractors: rows.results })
  }

  // GET /api/contractors/:id/payments
  if (method === 'GET' && id) {
    const payments = await DB.prepare(
      `SELECT * FROM contractor_payments WHERE contractor_id = ? ORDER BY payment_date DESC`
    ).bind(id).all()
    return json(payments.results)
  }

  // POST /api/contractors — add contractor
  if (method === 'POST' && !id) {
    const body = await request.json()
    const { meta } = await DB.prepare(
      `INSERT INTO contractors (name, email, phone) VALUES (?, ?, ?)`
    ).bind(body.name, body.email ?? null, body.phone ?? null).run()
    return json({ id: meta.last_row_id }, 201)
  }

  // POST /api/contractors/:id/pay — log payment
  if (method === 'POST' && id) {
    const body = await request.json()
    const { amount, payment_date, payment_method, work_category, notes } = body
    const { meta } = await DB.prepare(`
      INSERT INTO contractor_payments (contractor_id, amount, payment_date, payment_method, work_category, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(id, amount, payment_date, payment_method, work_category ?? null, notes ?? null).run()

    // check threshold after insert
    const { ytd } = await DB.prepare(`
      SELECT COALESCE(SUM(amount),0) AS ytd FROM contractor_payments
      WHERE contractor_id = ? AND strftime('%Y', payment_date) = strftime('%Y', ?)
    `).bind(id, payment_date).first()

    return json({ id: meta.last_row_id, ytd, alert: ytd >= THRESHOLD_1099 }, 201)
  }

  return notFound()
}
