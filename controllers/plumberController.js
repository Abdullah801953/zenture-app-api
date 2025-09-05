import plumberModel from '../models/plumberModel.js';
import fs from 'fs';


export const createplumber = async (req, res) => {
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
        message: 'plumber image is required'
      });
    }

    const plumber = new plumberModel({
      name: name.trim(),
      price: parseFloat(price),
      currency: currency || 'Rs',
      duration,
      features: Array.isArray(features) ? features.map(f => f.trim()) : [],
      image: `/uploads/plumbers/${plumberModel.image}`,
      isPopular: Boolean(isPopular),
      order: parseInt(order) || 0
    });

    await plumber.save();

    res.status(201).json({
      success: true,
      message: 'laudry created successfully',
      plumber: formatPlumberResponse(plumber)
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
      error: 'Failed to create plumber',
      message: 'Internal server error'
    });
  }
};

export const getAllplumber = async (req, res) => {
  try {
    const { limit, popular } = req.query;
    
    let query = { isActive: true };
    
    if (popular === 'true') {
      query.isPopular = true;
    }
    
    let plumber = await plumberModel.find(query).sort({ order: 1, createdAt: -1 });
    
    if (limit) {
      plumber = plumber.slice(0, parseInt(limit));
    }
    
    res.status(200).json({
      success: true,
      plumber: plumber.map(plumber => formatPlumberResponse(plumber)),
      total: plumber.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch plumber',
      message: 'Internal server error'
    });
  }
};

export const getplumberId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const laudry = await plumberModel.findById(id);
    
    if (!laudry) {
      return res.status(404).json({
        error: 'plumber not found',
        message: 'No plumber found with this ID'
      });
    }

    res.status(200).json({
      success: true,
      plumber: formatPlumberResponse(laudry)
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Please provide a valid plumber ID'
      });
    }
    
    res.status(500).json({
      error: 'Failed to fetch plumber',
      message: 'Internal server error'
    });
  }
};

const formatPlumberResponse = (plumber) => {
  return {
    id: plumber._id,
    name: plumber.name,
    price: plumber.price,
    currency: plumber.currency,
    duration: plumber.duration,
    displayPrice: `${plumber.currency} ${plumber.price} ${plumber.duration}`,
    features: plumber.features,
    image: `/uploads/plumbers/${plumber.image}`,
    isPopular: plumber.isPopular,
    order: plumber.order,
    isActive: plumber.isActive,
    createdAt: plumber.createdAt,
    updatedAt: plumber.updatedAt
  };
};