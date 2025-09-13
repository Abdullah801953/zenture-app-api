import womenModel from "../models/womenModel.js"
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

const formatwomenResponse = (women, req) => {
  const base = getBaseUrl(req)
  return {
    id: women._id,
    name: women.name,
    price: women.price,
    currency: women.currency,
    duration: women.duration,
    displayPrice: `${women.currency} ${women.price} ${women.duration}`,
    features: women.features || [],
    images: (women.images || []).map(i => i && i.startsWith("http") ? i : `${base}${i}`),
    colors: women.colors || [],
    sizes: women.sizes || [],
    description: women.description || "",
    isPopular: women.isPopular,
    order: women.order,
    isActive: women.isActive,
    createdAt: women.createdAt,
    updatedAt: women.updatedAt
  }
}

const cleanupFiles = (files) => {
  if (!files || !files.length) return
  files.forEach(f => {
    try { fs.unlinkSync(f.path) } catch (e) {}
  })
}

export const createwomen = async (req, res) => {
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
      return res.status(400).json({ error: "Image required", message: "at least one women image is required" })
    }

    const uploadedImages = req.files.map(f => `/uploads/womens/${f.filename}`)

    const featuresArr = parseListField(features, req, "features")
    const colorsArr = parseListField(colors, req, "colors")
    const sizesArr = parseListField(sizes, req, "sizes")

    const women = new womenModel({
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

    await women.save()

    res.status(201).json({
      success: true,
      message: "women created successfully",
      women: formatwomenResponse(women, req)
    })
  } catch (error) {
    cleanupFiles(req.files)
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: "Validation error", message: error.message })
    }
    res.status(500).json({ error: "Failed to create women", message: "Internal server error" })
  }
}

export const getAllwomen = async (req, res) => {
  try {
    const { limit, popular } = req.query
    let query = { isActive: true }
    if (popular === "true") query.isPopular = true
    let womens = await womenModel.find(query).sort({ order: 1, createdAt: -1 })
    if (limit) womens = womens.slice(0, parseInt(limit))
    res.status(200).json({ success: true, womens: womens.map(m => formatwomenResponse(m, req)), total: womens.length })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch womens", message: "Internal server error" })
  }
}

export const getwomenId = async (req, res) => {
  try {
    const { id } = req.params
    const women = await womenModel.findById(id)
    if (!women) return res.status(404).json({ error: "women not found", message: "No women found with this ID" })
    res.status(200).json({ success: true, women: formatwomenResponse(women, req) })
  } catch (error) {
    if (error.name === "CastError") return res.status(400).json({ error: "Invalid ID", message: "Please provide a valid women ID" })
    res.status(500).json({ error: "Failed to fetch women", message: "Internal server error" })
  }
}
