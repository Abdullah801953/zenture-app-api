import womenModel from '../models/womenModel.js';
import fs from 'fs';


export const createwomen = async (req, res) => {
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
        message: 'women image is required'
      });
    }

    const women = new womenModel({
      name: name.trim(),
      price: parseFloat(price),
      currency: currency || 'Rs',
      duration,
      features: Array.isArray(features) ? features.map(f => f.trim()) : [],
      image: `/uploads/womens/${womenModel.image}`,
      isPopular: Boolean(isPopular),
      order: parseInt(order) || 0
    });

    await women.save();

    res.status(201).json({
      success: true,
      message: 'women created successfully',
      women: formatwomenResponse(women)
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
      error: 'Failed to create women',
      message: 'Internal server error'
    });
  }
};

export const getAllwomen = async (req, res) => {
  try {
    const { limit, popular } = req.query;
    
    let query = { isActive: true };
    
    if (popular === 'true') {
      query.isPopular = true;
    }
    
    let womens = await womenModel.find(query).sort({ order: 1, createdAt: -1 });
    
    if (limit) {
      womens = womens.slice(0, parseInt(limit));
    }
    
    res.status(200).json({
      success: true,
      womens: womens.map(women => formatwomenResponse(women)),
      total: womens.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch womens',
      message: 'Internal server error'
    });
  }
};

export const getwomenId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const women = await womenModel.findById(id);
    
    if (!women) {
      return res.status(404).json({
        error: 'women not found',
        message: 'No women found with this ID'
      });
    }

    res.status(200).json({
      success: true,
      women: formatwomenResponse(women)
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Please provide a valid women ID'
      });
    }
    
    res.status(500).json({
      error: 'Failed to fetch women',
      message: 'Internal server error'
    });
  }
};

const formatwomenResponse = (women) => {
  return {
    id: women._id,
    name: women.name,
    price: women.price,
    currency: women.currency,
    duration: women.duration,
    displayPrice: `${women.currency} ${women.price} ${women.duration}`,
    features: women.features,
    image: `/uploads/women/${women.image}`,
    isPopular: women.isPopular,
    order: women.order,
    isActive: women.isActive,
    createdAt: women.createdAt,
    updatedAt: women.updatedAt
  };
};