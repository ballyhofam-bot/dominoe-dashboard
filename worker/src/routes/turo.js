export async function handleTuro({ env, request, id, json, notFound }) {
  const { DB } = env
  const method = request.method

  if (method === 'GET' && !id) {
    const month = new URL(request.url).searchParams.get('month') // YYYY-MM
    const where = month ? `WHERE strftime('%Y-%m', rental_start) = '${month}'` : ''
    const rows = await DB.prepare(`
      SELECT p.*, v.year, v.make, v.model
      FROM turo_payouts p JOIN vehicles v ON v.id = p.vehicle_id
      ${where} ORDER BY p.rental_start DESC
    `).all()
    return json(rows.results)
  }

  if (method === 'POST') {
    const body = await request.json()
    const { vehicle_id, gross_amount, turo_fee, rental_start, rental_end } = body
    const net_amount = gross_amount - turo_fee
    const { meta } = await DB.prepare(`
      INSERT INTO turo_payouts (vehicle_id, gross_amount, turo_fee, net_amount, rental_start, rental_end, source)
      VALUES (?, ?, ?, ?, ?, ?, 'manual')
    `).bind(vehicle_id, gross_amount, turo_fee, net_amount, rental_start, rental_end).run()
    return json({ id: meta.last_row_id, net_amount }, 201)
  }

  if (method === 'DELETE' && id) {
    await DB.prepare('DELETE FROM turo_payouts WHERE id = ?').bind(id).run()
    return json({ ok: true })
  }

  return notFound()
}
