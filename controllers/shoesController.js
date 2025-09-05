import shoeModel from "../models/shoeModel.js";
import fs from "fs";

export const createshoe = async (req, res) => {
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
        message: "shoe image is required",
      });
    }

    const shoe = new shoeModel({
      name: name.trim(),
      price: parseFloat(price),
      currency: currency || "Rs",
      duration,
      features: Array.isArray(features) ? features.map((f) => f.trim()) : [],
      image: `/uploads/shoes/${shoeModel.image}`,
      isPopular: Boolean(isPopular),
      order: parseInt(order) || 0,
    });

    await shoe.save();

    res.status(201).json({
      success: true,
      message: "shoe created successfully",
      shoe: formatshoeResponse(shoe),
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
      error: "Failed to create shoe",
      message: "Internal server error",
    });
  }
};

export const getAllshoe = async (req, res) => {
  try {
    const { limit, popular } = req.query;

    let query = { isActive: true };

    if (popular === "true") {
      query.isPopular = true;
    }

    let shoes = await shoeModel.find(query).sort({ order: 1, createdAt: -1 });

    if (limit) {
      shoes = shoes.slice(0, parseInt(limit));
    }

    res.status(200).json({
      success: true,
      shoes: shoes.map((shoe) => formatshoeResponse(shoe)),
      total: shoes.length,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch shoes",
      message: "Internal server error",
    });
  }
};

export const getshoeId = async (req, res) => {
  try {
    const { id } = req.params;

    const shoe = await shoeModel.findById(id);

    if (!shoe) {
      return res.status(404).json({
        error: "shoe not found",
        message: "No shoe found with this ID",
      });
    }

    res.status(200).json({
      success: true,
      shoe: formatshoeResponse(shoe),
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        error: "Invalid ID",
        message: "Please provide a valid shoe ID",
      });
    }

    res.status(500).json({
      error: "Failed to fetch shoe",
      message: "Internal server error",
    });
  }
};

const formatshoeResponse = (shoe) => {
  return {
    id: shoe._id,
    name: shoe.name,
    price: shoe.price,
    currency: shoe.currency,
    duration: shoe.duration,
    displayPrice: `${shoe.currency} ${shoe.price} ${shoe.duration}`,
    features: shoe.features,
    image: `/uploads/shoe/${shoe.image}`,
    isPopular: shoe.isPopular,
    order: shoe.order,
    isActive: shoe.isActive,
    createdAt: shoe.createdAt,
    updatedAt: shoe.updatedAt,
  };
};
