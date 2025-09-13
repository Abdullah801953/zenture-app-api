import kidsModel from "../models/kidsModel.js"
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

const formatkidsResponse = (kids, req) => {
  const base = getBaseUrl(req)
  return {
    id: kids._id,
    name: kids.name,
    price: kids.price,
    currency: kids.currency,
    duration: kids.duration,
    displayPrice: `${kids.currency} ${kids.price} ${kids.duration}`,
    features: kids.features || [],
    images: (kids.images || []).map(i => i && i.startsWith("http") ? i : `${base}${i}`),
    colors: kids.colors || [],
    sizes: kids.sizes || [],
    description: kids.description || "",
    isPopular: kids.isPopular,
    order: kids.order,
    isActive: kids.isActive,
    createdAt: kids.createdAt,
    updatedAt: kids.updatedAt
  }
}

const cleanupFiles = (files) => {
  if (!files || !files.length) return
  files.forEach(f => {
    try { fs.unlinkSync(f.path) } catch (e) {}
  })
}

export const createkid = async (req, res) => {
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
      return res.status(400).json({ error: "Image required", message: "at least one kids image is required" })
    }

    const uploadedImages = req.files.map(f => `/uploads/kidss/${f.filename}`)

    const featuresArr = parseListField(features, req, "features")
    const colorsArr = parseListField(colors, req, "colors")
    const sizesArr = parseListField(sizes, req, "sizes")

    const kids = new kidsModel({
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

    await kids.save()

    res.status(201).json({
      success: true,
      message: "kids created successfully",
      kids: formatkidsResponse(kids, req)
    })
  } catch (error) {
    cleanupFiles(req.files)
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: "Validation error", message: error.message })
    }
    res.status(500).json({ error: "Failed to create kids", message: "Internal server error" })
  }
}

export const getAllkid = async (req, res) => {
  try {
    const { limit, popular } = req.query
    let query = { isActive: true }
    if (popular === "true") query.isPopular = true
    let kidss = await kidsModel.find(query).sort({ order: 1, createdAt: -1 })
    if (limit) kidss = kidss.slice(0, parseInt(limit))
    res.status(200).json({ success: true, kidss: kidss.map(m => formatkidsResponse(m, req)), total: kidss.length })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch kidss", message: "Internal server error" })
  }
}

export const getkidId = async (req, res) => {
  try {
    const { id } = req.params
    const kids = await kidsModel.findById(id)
    if (!kids) return res.status(404).json({ error: "kids not found", message: "No kids found with this ID" })
    res.status(200).json({ success: true, kids: formatkidsResponse(kids, req) })
  } catch (error) {
    if (error.name === "CastError") return res.status(400).json({ error: "Invalid ID", message: "Please provide a valid kids ID" })
    res.status(500).json({ error: "Failed to fetch kids", message: "Internal server error" })
  }
}
