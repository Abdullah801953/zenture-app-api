import kidModel from "../models/kidsModel.js";
import fs from "fs";

export const createkid = async (req, res) => {
  try {
    const { name, price, currency, duration, features, isPopular, order } =
      req.body;

    if (!name || !price || !duration) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        error: "Missing required fields",
        message: "Name, price, and duration are required",
      });
    }

    if (price <= 0) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        error: "Invalid price",
        message: "Price must be greater than 0",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "Image required",
        message: "kid image is required",
      });
    }

    const kid = new kidModel({
      name: name.trim(),
      price: parseFloat(price),
      currency: currency || "Rs",
      duration,
      features: Array.isArray(features) ? features.map((f) => f.trim()) : [],
      image: `/uploads/kids/${kidModel.image}`,
      isPopular: Boolean(isPopular),
      order: parseInt(order) || 0,
    });

    await kid.save();

    res.status(201).json({
      success: true,
      message: "kid created successfully",
      kid: formatkidResponse(kid),
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation error",
        message: error.message,
      });
    }

    res.status(500).json({
      error: "Failed to create kid",
      message: "Internal server error",
    });
  }
};

export const getAllkid = async (req, res) => {
  try {
    const { limit, popular } = req.query;

    let query = { isActive: true };

    if (popular === "true") {
      query.isPopular = true;
    }

    let kids = await kidModel.find(query).sort({ order: 1, createdAt: -1 });

    if (limit) {
      kids = kids.slice(0, parseInt(limit));
    }

    res.status(200).json({
      success: true,
      kids: kids.map((kid) => formatkidResponse(kid)),
      total: kids.length,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch kids",
      message: "Internal server error",
    });
  }
};

export const getkidId = async (req, res) => {
  try {
    const { id } = req.params;

    const kid = await kidModel.findById(id);

    if (!kid) {
      return res.status(404).json({
        error: "kid not found",
        message: "No kid found with this ID",
      });
    }

    res.status(200).json({
      success: true,
      kid: formatkidResponse(kid),
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        error: "Invalid ID",
        message: "Please provide a valid kid ID",
      });
    }

    res.status(500).json({
      error: "Failed to fetch kid",
      message: "Internal server error",
    });
  }
};

const formatkidResponse = (kid) => {
  return {
    id: kid._id,
    name: kid.name,
    price: kid.price,
    currency: kid.currency,
    duration: kid.duration,
    displayPrice: `${kid.currency} ${kid.price} ${kid.duration}`,
    features: kid.features,
    image: `/uploads/kid/${kid.image}`,
    isPopular: kid.isPopular,
    order: kid.order,
    isActive: kid.isActive,
    createdAt: kid.createdAt,
    updatedAt: kid.updatedAt,
  };
};
