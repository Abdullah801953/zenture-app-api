import trendingModel from "../models/trendingModel.js";
import fs from "fs";

export const createtrending = async (req, res) => {
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
        message: "trending image is required",
      });
    }

    const trending = new trendingModel({
      name: name.trim(),
      price: parseFloat(price),
      currency: currency || "Rs",
      duration,
      features: Array.isArray(features) ? features.map((f) => f.trim()) : [],
      image: `/uploads/trendings/${trendingModel.image}`,
      isPopular: Boolean(isPopular),
      order: parseInt(order) || 0,
    });

    await trending.save();

    res.status(201).json({
      success: true,
      message: "trending created successfully",
      trending: formattrendingResponse(trending),
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
      error: "Failed to create trending",
      message: "Internal server error",
    });
  }
};

export const getAlltrending = async (req, res) => {
  try {
    const { limit, popular } = req.query;

    let query = { isActive: true };

    if (popular === "true") {
      query.isPopular = true;
    }

    let trendings = await trendingModel.find(query).sort({ order: 1, createdAt: -1 });

    if (limit) {
      trendings = trendings.slice(0, parseInt(limit));
    }

    res.status(200).json({
      success: true,
      trendings: trendings.map((trending) => formattrendingResponse(trending)),
      total: trendings.length,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch trendings",
      message: "Internal server error",
    });
  }
};

export const gettrendingId = async (req, res) => {
  try {
    const { id } = req.params;

    const trending = await trendingModel.findById(id);

    if (!trending) {
      return res.status(404).json({
        error: "trending not found",
        message: "No trending found with this ID",
      });
    }

    res.status(200).json({
      success: true,
      trending: formattrendingResponse(trending),
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        error: "Invalid ID",
        message: "Please provide a valid trending ID",
      });
    }

    res.status(500).json({
      error: "Failed to fetch trending",
      message: "Internal server error",
    });
  }
};

const formattrendingResponse = (trending) => {
  return {
    id: trending._id,
    name: trending.name,
    price: trending.price,
    currency: trending.currency,
    duration: trending.duration,
    displayPrice: `${trending.currency} ${trending.price} ${trending.duration}`,
    features: trending.features,
    image: `/uploads/trending/${trending.image}`,
    isPopular: trending.isPopular,
    order: trending.order,
    isActive: trending.isActive,
    createdAt: trending.createdAt,
    updatedAt: trending.updatedAt,
  };
};
