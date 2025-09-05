import chefModel from '../models/chefModel.js';
import fs from 'fs';


export const createChef = async (req, res) => {
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
        message: 'Chef image is required'
      });
    }

    const chef = new chefModel({
      name: name.trim(),
      price: parseFloat(price),
      currency: currency || 'Rs',
      duration,
      features: Array.isArray(features) ? features.map(f => f.trim()) : [],
      image: `/uploads/chefs/${chefModel.image}`,
      isPopular: Boolean(isPopular),
      order: parseInt(order) || 0
    });

    await chef.save();

    res.status(201).json({
      success: true,
      message: 'Chef created successfully',
      chef: formatChefResponse(chef)
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
      error: 'Failed to create chef',
      message: 'Internal server error'
    });
  }
};

export const getAllChef = async (req, res) => {
  try {
    const { limit, popular } = req.query;
    
    let query = { isActive: true };
    
    if (popular === 'true') {
      query.isPopular = true;
    }
    
    let chefs = await chefModel.find(query).sort({ order: 1, createdAt: -1 });
    
    if (limit) {
      chefs = chefs.slice(0, parseInt(limit));
    }
    
    res.status(200).json({
      success: true,
      chefs: chefs.map(chef => formatChefResponse(chef)),
      total: chefs.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch chefs',
      message: 'Internal server error'
    });
  }
};

export const getChefId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const chef = await chefModel.findById(id);
    
    if (!chef) {
      return res.status(404).json({
        error: 'Chef not found',
        message: 'No chef found with this ID'
      });
    }

    res.status(200).json({
      success: true,
      chef: formatChefResponse(chef)
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Please provide a valid chef ID'
      });
    }
    
    res.status(500).json({
      error: 'Failed to fetch chef',
      message: 'Internal server error'
    });
  }
};

const formatChefResponse = (chef) => {
  return {
    id: chef._id,
    name: chef.name,
    price: chef.price,
    currency: chef.currency,
    duration: chef.duration,
    displayPrice: `${chef.currency} ${chef.price} ${chef.duration}`,
    features: chef.features,
    image: `/uploads/chef/${chef.image}`,
    isPopular: chef.isPopular,
    order: chef.order,
    isActive: chef.isActive,
    createdAt: chef.createdAt,
    updatedAt: chef.updatedAt
  };
};