import menModel from '../models/menModel.js';
import fs from 'fs';


export const createmen = async (req, res) => {
  try {
    const { name, price, currency, duration, features, isPopular, order } = req.body;

    if (!name || !price || !duration) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name, price, and duration are required'
      });
    }

    if (price <= 0) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        error: 'Invalid price',
        message: 'Price must be greater than 0'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'Image required',
        message: 'men image is required'
      });
    }

    const men = new menModel({
      name: name.trim(),
      price: parseFloat(price),
      currency: currency || 'Rs',
      duration,
      features: Array.isArray(features) ? features.map(f => f.trim()) : [],
      image: `/uploads/mens/${menModel.image}`,
      isPopular: Boolean(isPopular),
      order: parseInt(order) || 0
    });

    await men.save();

    res.status(201).json({
      success: true,
      message: 'men created successfully',
      men: formatmenResponse(men)
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'Failed to create men',
      message: 'Internal server error'
    });
  }
};

export const getAllmen = async (req, res) => {
  try {
    const { limit, popular } = req.query;
    
    let query = { isActive: true };
    
    if (popular === 'true') {
      query.isPopular = true;
    }
    
    let mens = await menModel.find(query).sort({ order: 1, createdAt: -1 });
    
    if (limit) {
      mens = mens.slice(0, parseInt(limit));
    }
    
    res.status(200).json({
      success: true,
      mens: mens.map(men => formatmenResponse(men)),
      total: mens.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch mens',
      message: 'Internal server error'
    });
  }
};

export const getmenId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const men = await menModel.findById(id);
    
    if (!men) {
      return res.status(404).json({
        error: 'men not found',
        message: 'No men found with this ID'
      });
    }

    res.status(200).json({
      success: true,
      men: formatmenResponse(men)
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Please provide a valid men ID'
      });
    }
    
    res.status(500).json({
      error: 'Failed to fetch men',
      message: 'Internal server error'
    });
  }
};

const formatmenResponse = (men) => {
  return {
    id: men._id,
    name: men.name,
    price: men.price,
    currency: men.currency,
    duration: men.duration,
    displayPrice: `${men.currency} ${men.price} ${men.duration}`,
    features: men.features,
    image: `/uploads/men/${men.image}`,
    isPopular: men.isPopular,
    order: men.order,
    isActive: men.isActive,
    createdAt: men.createdAt,
    updatedAt: men.updatedAt
  };
};