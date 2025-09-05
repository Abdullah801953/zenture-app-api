import cleanerModel from '../models/cleanerModel.js';
import fs from 'fs';


export const createCleaner = async (req, res) => {
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
        message: 'cleaner image is required'
      });
    }

    const cleaner = new cleanerModel({
      name: name.trim(),
      price: parseFloat(price),
      currency: currency || 'Rs',
      duration,
      features: Array.isArray(features) ? features.map(f => f.trim()) : [],
      image: `/uploads/cleaners/${cleanerModel.image}`,
      isPopular: Boolean(isPopular),
      order: parseInt(order) || 0
    });

    await cleaner.save();

    res.status(201).json({
      success: true,
      message: 'cleaner created successfully',
      cleaner: formatCleanerResponse(cleaner)
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
      error: 'Failed to create cleaner',
      message: 'Internal server error'
    });
  }
};

export const getAllCleaner = async (req, res) => {
  try {
    const { limit, popular } = req.query;
    
    let query = { isActive: true };
    
    if (popular === 'true') {
      query.isPopular = true;
    }
    
    let cleaner = await cleanerModel.find(query).sort({ order: 1, createdAt: -1 });
    
    if (limit) {
      cleaner = cleaner.slice(0, parseInt(limit));
    }
    
    res.status(200).json({
      success: true,
      cleaner: cleaner.map(cleaner => formatCleanerResponse(cleaner)),
      total: cleaner.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch cleaner',
      message: 'Internal server error'
    });
  }
};

export const getCleanerId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cleaner = await cleanerModel.findById(id);
    
    if (!cleaner) {
      return res.status(404).json({
        error: 'cleaner not found',
        message: 'No cleaner found with this ID'
      });
    }

    res.status(200).json({
      success: true,
      cleaner: formatCleanerResponse(cleaner)
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Please provide a valid cleaner ID'
      });
    }
    
    res.status(500).json({
      error: 'Failed to fetch cleaner',
      message: 'Internal server error'
    });
  }
};

const formatCleanerResponse = (cleaner) => {
  return {
    id: cleaner._id,
    name: cleaner.name,
    price: cleaner.price,
    currency: cleaner.currency,
    duration: cleaner.duration,
    displayPrice: `${cleaner.currency} ${cleaner.price} ${cleaner.duration}`,
    features: cleaner.features,
    image: `/uploads/cleaners/${cleaner.image}`,
    isPopular: cleaner.isPopular,
    order: cleaner.order,
    isActive: cleaner.isActive,
    createdAt: cleaner.createdAt,
    updatedAt: cleaner.updatedAt
  };
};