import shoessModel from "../models/shoesModel.js"
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

const formatshoesResponse = (shoess, req) => {
  const base = getBaseUrl(req)
  return {
    id: shoess._id,
    name: shoess.name,
    price: shoess.price,
    currency: shoess.currency,
    duration: shoess.duration,
    displayPrice: `${shoess.currency} ${shoess.price} ${shoess.duration}`,
    features: shoess.features || [],
    images: (shoess.images || []).map(i => i && i.startsWith("http") ? i : `${base}${i}`),
    colors: shoess.colors || [],
    sizes: shoess.sizes || [],
    description: shoess.description || "",
    isPopular: shoess.isPopular,
    order: shoess.order,
    isActive: shoess.isActive,
    createdAt: shoess.createdAt,
    updatedAt: shoess.updatedAt
  }
}

const cleanupFiles = (files) => {
  if (!files || !files.length) return
  files.forEach(f => {
    try { fs.unlinkSync(f.path) } catch (e) {}
  })
}

export const createshoe = async (req, res) => {
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
      return res.status(400).json({ error: "Image required", message: "at least one shoess image is required" })
    }

    const uploadedImages = req.files.map(f => `/uploads/shoesss/${f.filename}`)

    const featuresArr = parseListField(features, req, "features")
    const colorsArr = parseListField(colors, req, "colors")
    const sizesArr = parseListField(sizes, req, "sizes")

    const shoess = new shoessModel({
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

    await shoess.save()

    res.status(201).json({
      success: true,
      message: "shoess created successfully",
      shoess: formatshoessResponse(shoess, req)
    })
  } catch (error) {
    cleanupFiles(req.files)
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: "Validation error", message: error.message })
    }
    res.status(500).json({ error: "Failed to create shoess", message: "Internal server error" })
  }
}

export const getAllshoe = async (req, res) => {
  try {
    const { limit, popular } = req.query
    let query = { isActive: true }
    if (popular === "true") query.isPopular = true
    let shoesss = await shoessModel.find(query).sort({ order: 1, createdAt: -1 })
    if (limit) shoesss = shoesss.slice(0, parseInt(limit))
    res.status(200).json({ success: true, shoesss: shoesss.map(m => formatshoesResponse(m, req)), total: shoesss.length })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch shoesss", message: "Internal server error" })
  }
}

export const getshoeId = async (req, res) => {
  try {
    const { id } = req.params
    const shoess = await shoessModel.findById(id)
    if (!shoess) return res.status(404).json({ error: "shoess not found", message: "No shoess found with this ID" })
    res.status(200).json({ success: true, shoess: formatshoessResponse(shoess, req) })
  } catch (error) {
    if (error.name === "CastError") return res.status(400).json({ error: "Invalid ID", message: "Please provide a valid shoess ID" })
    res.status(500).json({ error: "Failed to fetch shoess", message: "Internal server error" })
  }
}
