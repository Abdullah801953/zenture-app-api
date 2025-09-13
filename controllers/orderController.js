import Order from '../models/orderModel.js'

const getBaseUrl = (req) => {
  if (!req) return ''
  return `${req.protocol}://${req.get('host')}`
}

const formatOrder = (o, req) => {
  const base = getBaseUrl(req)
  return {
    id: o._id,
    userId: o.userId,
    providerName: o.providerName,
    providerImage: o.providerImage && o.providerImage.startsWith('http') ? o.providerImage : (o.providerImage ? `${base}${o.providerImage}` : ''),
    title: o.title,
    description: o.description,
    serviceDate: o.serviceDate,
    rating: o.rating,
    price: o.price,
    isRepeatable: o.isRepeatable,
    meta: o.meta,
    status: o.status,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt
  }
}

export const createOrder = async (req, res) => {
  try {
    const {
      userId,
      providerName,
      providerImage,
      title,
      description,
      serviceDate,
      rating,
      price,
      isRepeatable,
      meta,
      status
    } = req.body

    if (!userId || !providerName || !serviceDate) {
      return res.status(400).json({ error: 'Missing required fields', message: 'userId, providerName and serviceDate required' })
    }

    const order = new Order({
      userId,
      providerName: String(providerName).trim(),
      providerImage: providerImage ? String(providerImage).trim() : '',
      title: title ? String(title).trim() : '',
      description: description ? String(description).trim() : '',
      serviceDate: new Date(serviceDate),
      rating: rating ? Number(rating) : 0,
      price: price ? Number(price) : 0,
      isRepeatable: isRepeatable === undefined ? true : (isRepeatable === 'false' ? false : Boolean(isRepeatable)),
      meta: typeof meta === 'string' ? (() => { try { return JSON.parse(meta) } catch(e){ return {} } })() : (meta || {}),
      status: status || 'completed'
    })

    await order.save()
    res.status(201).json({ success: true, message: 'order created', order: formatOrder(order, req) })
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ error: 'Validation error', message: err.message })
    res.status(500).json({ error: 'Failed to create order', message: 'Internal server error' })
  }
}

export const getOrders = async (req, res) => {
  try {
    const { userId, limit, skip, status } = req.query
    const q = {}
    if (userId) q.userId = userId
    if (status) q.status = status
    let items = await Order.find(q).sort({ serviceDate: -1, createdAt: -1 })
    if (skip) items = items.slice(parseInt(skip))
    if (limit) items = items.slice(0, parseInt(limit))
    res.status(200).json({ success: true, orders: items.map(o => formatOrder(o, req)), total: items.length })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders', message: 'Internal server error' })
  }
}

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params
    const o = await Order.findById(id)
    if (!o) return res.status(404).json({ error: 'Order not found' })
    res.status(200).json({ success: true, order: formatOrder(o, req) })
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid ID' })
    res.status(500).json({ error: 'Failed to fetch order', message: 'Internal server error' })
  }
}

export const repeatOrder = async (req, res) => {
  try {
    const { id } = req.params
    const existing = await Order.findById(id)
    if (!existing) return res.status(404).json({ error: 'Order not found' })
    if (!existing.isRepeatable) return res.status(400).json({ error: 'Order not repeatable' })
    const copy = new Order({
      userId: existing.userId,
      providerName: existing.providerName,
      providerImage: existing.providerImage,
      title: existing.title,
      description: existing.description,
      serviceDate: new Date(), 
      rating: 0,
      price: existing.price,
      isRepeatable: existing.isRepeatable,
      meta: existing.meta,
      status: 'pending'
    })
    await copy.save()
    res.status(201).json({ success: true, message: 'order repeated', order: formatOrder(copy, req) })
  } catch (err) {
    res.status(500).json({ error: 'Failed to repeat order', message: 'Internal server error' })
  }
}
