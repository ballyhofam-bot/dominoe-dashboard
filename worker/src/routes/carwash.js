export async function handleCarwash({ env, request, id, json, notFound }) {
  const { DB } = env
  const method = request.method

  if (method === 'GET') {
    const month = new URL(request.url).searchParams.get('month')
    const where = month ? `WHERE strftime('%Y-%m', entry_date) = '${month}'` : ''
    const rows = await DB.prepare(`SELECT * FROM carwash_entries ${where} ORDER BY entry_date DESC`).all()
    return json(rows.results)
  }

  if (method === 'POST') {
    const body = await request.json()
    const { entry_date, total_revenue, transaction_count, ash_share_pct = 50,
            basic_count, supreme_count, ultimate_count, complete_count } = body
    const { meta } = await DB.prepare(`
      INSERT INTO carwash_entries
        (entry_date, total_revenue, transaction_count, ash_share_pct,
         basic_count, supreme_count, ultimate_count, complete_count, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'manual')
    `).bind(entry_date, total_revenue, transaction_count ?? null, ash_share_pct,
            basic_count ?? null, supreme_count ?? null, ultimate_count ?? null,
            complete_count ?? null).run()
    return json({ id: meta.last_row_id }, 201)
  }

  if (method === 'DELETE' && id) {
    await DB.prepare('DELETE FROM carwash_entries WHERE id = ?').bind(id).run()
    return json({ ok: true })
  }

  return notFound()
}
