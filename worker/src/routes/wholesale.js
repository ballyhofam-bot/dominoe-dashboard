export async function handleWholesale({ env, request, id, json, notFound }) {
  const { DB } = env
  const method = request.method
  const url = new URL(request.url)

  // GET /api/wholesale/vehicles — vehicles in the wholesale pipeline
  if (method === 'GET' && id === 'vehicles') {
    const rows = await DB.prepare(`
      SELECT v.*,
        (SELECT amount FROM wholesale_transactions WHERE vehicle_id = v.id AND type='purchase' LIMIT 1) AS cost,
        (SELECT amount FROM wholesale_transactions WHERE vehicle_id = v.id AND type='sale' LIMIT 1) AS sale_price
      FROM vehicles v WHERE v.stream = 'wholesale' AND v.status != 'sold'
      ORDER BY v.created_at DESC
    `).all()
    return json(rows.results)
  }

  // GET /api/wholesale — all wholesale transactions
  if (method === 'GET' && !id) {
    const month = url.searchParams.get('month')
    const where = month ? `AND strftime('%Y-%m', transaction_date) = '${month}'` : ''
    const rows = await DB.prepare(`
      SELECT t.*, v.year, v.make, v.model, v.vin
      FROM wholesale_transactions t JOIN vehicles v ON v.id = t.vehicle_id
      WHERE 1=1 ${where} ORDER BY t.transaction_date DESC
    `).all()
    return json(rows.results)
  }

  // POST /api/wholesale/purchase — log auction purchase (creates vehicle + purchase record)
  if (method === 'POST' && id === 'purchase') {
    const body = await request.json()
    const { year, make, model, vin, purchase_price, purchase_source, purchase_date } = body
    const { meta: vMeta } = await DB.prepare(`
      INSERT INTO vehicles (year, make, model, vin, status, stream, purchase_price, purchase_source, purchase_date)
      VALUES (?, ?, ?, ?, 'wholesale', 'wholesale', ?, ?, ?)
    `).bind(year, make, model, vin ?? null, purchase_price, purchase_source, purchase_date).run()

    const vehicle_id = vMeta.last_row_id
    await DB.prepare(`
      INSERT INTO wholesale_transactions (vehicle_id, type, amount, transaction_date, source)
      VALUES (?, 'purchase', ?, ?, 'manual')
    `).bind(vehicle_id, purchase_price, purchase_date).run()

    return json({ vehicle_id }, 201)
  }

  // POST /api/wholesale/sale — log sale, mark vehicle sold
  if (method === 'POST' && id === 'sale') {
    const body = await request.json()
    const { vehicle_id, sale_price, buyer_type, transaction_date } = body
    const vehicle = await DB.prepare('SELECT purchase_price FROM vehicles WHERE id = ?').bind(vehicle_id).first()
    const profit = sale_price - (vehicle?.purchase_price ?? 0)

    await DB.prepare(`
      INSERT INTO wholesale_transactions (vehicle_id, type, amount, buyer_type, transaction_date, source)
      VALUES (?, 'sale', ?, ?, ?, 'manual')
    `).bind(vehicle_id, sale_price, buyer_type, transaction_date).run()

    await DB.prepare(`UPDATE vehicles SET status = 'sold' WHERE id = ?`).bind(vehicle_id).run()

    return json({ profit }, 201)
  }

  return notFound()
}
