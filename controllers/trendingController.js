import trendingsModel from "../models/trendingModel.js"
import fs from "fs"

const parseListField = (val, req, keyBase) => {
  if (val === undefined || val === null || val === "") {
    const bracketKey = `${keyBase}[]`
    if (req.body[bracketKey]) {
      return Array.isArray(req.body[bracketKey])
        ? req.body[bracketKey].map(v => String(v).trim()).filter(Boolean)
        : String(req.body[bracketKey]).split(",").map(v => v.trim()).filter(Boolean)
    }
    const indexed = Object.keys(req.body)
      .filter(k => k.startsWith(`${keyBase}[`))
      .map(k => req.body[k])
    if (indexed.length) return indexed.map(v => String(v).trim()).filter(Boolean)
    return []
  }

  if (Array.isArray(val)) return val.map(v => String(v).trim()).filter(Boolean)
  if (typeof val === "string") {
    const s = val.trim()
    if (!s) return []
    try {
      const parsed = JSON.parse(s)
      if (Array.isArray(parsed)) return parsed.map(v => String(v).trim()).filter(Boolean)
    } catch (e) {}
    return s.split(",").map(v => v.trim()).filter(Boolean)
  }
  return []
}

const getBaseUrl = (req) => {
  if (!req) return ""
  return `${req.protocol}://${req.get("host")}`
}

const formattrendingsResponse = (trendings, req) => {
  const base = getBaseUrl(req)
  return {
    id: trendings._id,
    name: trendings.name,
    price: trendings.price,
    currency: trendings.currency,
    duration: trendings.duration,
    displayPrice: `${trendings.currency} ${trendings.price} ${trendings.duration}`,
    features: trendings.features || [],
    images: (trendings.images || []).map(i => i && i.startsWith("http") ? i : `${base}${i}`),
    colors: trendings.colors || [],
    sizes: trendings.sizes || [],
    description: trendings.description || "",
    isPopular: trendings.isPopular,
    order: trendings.order,
    isActive: trendings.isActive,
    createdAt: trendings.createdAt,
    updatedAt: trendings.updatedAt
  }
}

const cleanupFiles = (files) => {
  if (!files || !files.length) return
  files.forEach(f => {
    try { fs.unlinkSync(f.path) } catch (e) {}
  })
}

export const createtrending = async (req, res) => {
  try {
    const {
      name,
      price,
      currency,
      duration,
      features,
      colors,
      sizes,
      description,
      isPopular,
      order
    } = req.body

    if (!name || !price || !duration) {
      cleanupFiles(req.files)
      return res.status(400).json({ error: "Missing required fields", message: "Name, price, and duration are required" })
    }

    const parsedPrice = parseFloat(price)
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      cleanupFiles(req.files)
      return res.status(400).json({ error: "Invalid price", message: "Price must be greater than 0" })
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "Image required", message: "at least one trendings image is required" })
    }

    const uploadedImages = req.files.map(f => `/uploads/trendingss/${f.filename}`)

    const featuresArr = parseListField(features, req, "features")
    const colorsArr = parseListField(colors, req, "colors")
    const sizesArr = parseListField(sizes, req, "sizes")

    const trendings = new trendingsModel({
      name: name.trim(),
      price: parsedPrice,
      currency: currency || "Rs",
      duration,
      features: featuresArr,
      images: [
        ...uploadedImages,
        ...(Array.isArray(req.body.images) ? req.body.images.map(i => String(i).trim()).filter(Boolean) : [])
      ],
      colors: colorsArr,
      sizes: sizesArr,
      description: description ? String(description).trim() : "",
      isPopular: Boolean(isPopular),
      order: parseInt(order) || 0
    })

    await trendings.save()

    res.status(201).json({
      success: true,
      message: "trendings created successfully",
      trendings: formattrendingsResponse(trendings, req)
    })
  } catch (error) {
    cleanupFiles(req.files)
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: "Validation error", message: error.message })
    }
    res.status(500).json({ error: "Failed to create trendings", message: "Internal server error" })
  }
}

export const getAlltrending = async (req, res) => {
  try {
    const { limit, popular } = req.query
    let query = { isActive: true }
    if (popular === "true") query.isPopular = true
    let trendingss = await trendingsModel.find(query).sort({ order: 1, createdAt: -1 })
    if (limit) trendingss = trendingss.slice(0, parseInt(limit))
    res.status(200).json({ success: true, trendingss: trendingss.map(m => formattrendingsResponse(m, req)), total: trendingss.length })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trendingss", message: "Internal server error" })
  }
}

export const gettrendingId = async (req, res) => {
  try {
    const { id } = req.params
    const trendings = await trendingsModel.findById(id)
    if (!trendings) return res.status(404).json({ error: "trendings not found", message: "No trendings found with this ID" })
    res.status(200).json({ success: true, trendings: formattrendingsResponse(trendings, req) })
  } catch (error) {
    if (error.name === "CastError") return res.status(400).json({ error: "Invalid ID", message: "Please provide a valid trendings ID" })
    res.status(500).json({ error: "Failed to fetch trendings", message: "Internal server error" })
  }
}
