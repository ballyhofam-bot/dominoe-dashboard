export async function handleDetail({ env, request, id, json, notFound }) {
  const { DB } = env
  const method = request.method

  if (method === 'GET') {
    const month = new URL(request.url).searchParams.get('month')
    const where = month ? `WHERE strftime('%Y-%m', job_date) = '${month}'` : ''
    const rows = await DB.prepare(`
      SELECT d.*, c.name AS contractor_name
      FROM detail_jobs d LEFT JOIN contractors c ON c.id = d.contractor_id
      ${where} ORDER BY d.job_date DESC
    `).all()
    return json(rows.results)
  }

  if (method === 'POST') {
    const body = await request.json()
    const { job_date, customer_name, contractor_id, service_type,
            amount, payment_method, ash_share_pct = 50, notes } = body

    const { meta } = await DB.prepare(`
      INSERT INTO detail_jobs
        (job_date, customer_name, contractor_id, service_type, amount, payment_method, ash_share_pct, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(job_date, customer_name ?? null, contractor_id ?? null,
            service_type, amount, payment_method, ash_share_pct, notes ?? null).run()

    // auto-log contractor payment
    if (contractor_id) {
      await DB.prepare(`
        INSERT INTO contractor_payments (contractor_id, amount, payment_date, payment_method, work_category)
        VALUES (?, ?, ?, ?, 'detailing')
      `).bind(contractor_id, amount * (1 - ash_share_pct / 100), job_date, payment_method).run()
    }

    return json({ id: meta.last_row_id }, 201)
  }

  return notFound()
}
