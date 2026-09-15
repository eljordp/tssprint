import auditLogin from '../../server/admin-audit-login.js'
import contactDelivery from '../../server/contact-delivery.js'
import { sendJson } from '../../server/square-api.js'
export default function handler(req, res) {
  if (req.query?.action === 'audit-login') return auditLogin(req, res)
  if (req.query?.action === 'contact-delivery') return contactDelivery(req, res)
  return sendJson(res, 404, { error: 'Unknown action' })
}
