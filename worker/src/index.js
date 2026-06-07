import { handleTuro } from './routes/turo.js'
import { handleWholesale } from './routes/wholesale.js'
import { handleCarwash } from './routes/carwash.js'
import { handleDetail } from './routes/detail.js'
import { handleContractors } from './routes/contractors.js'
import { handleOverview } from './routes/overview.js'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })
}

function notFound() {
  return json({ error: 'Not found' }, 404)
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS })
    }

    const url = new URL(request.url)
    const [, , resource, id] = url.pathname.split('/') // /api/{resource}/{id?}

    if (url.pathname === '/api/health') {
      return json({ ok: true, ts: new Date().toISOString() })
    }

    const ctx = { env, request, url, id, json, notFound }

    try {
      switch (resource) {
        case 'overview':     return handleOverview(ctx)
        case 'turo':         return handleTuro(ctx)
        case 'wholesale':    return handleWholesale(ctx)
        case 'carwash':      return handleCarwash(ctx)
        case 'detail':       return handleDetail(ctx)
        case 'contractors':  return handleContractors(ctx)
        default:             return notFound()
      }
    } catch (err) {
      return json({ error: err.message }, 500)
    }
  },
}
