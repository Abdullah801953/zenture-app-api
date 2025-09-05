import laundryModel from '../models/laundryModel.js';
import fs from 'fs';


export const createLaundry = async (req, res) => {
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
        message: 'laundry image is required'
      });
    }

    const laundry = new laundryModel({
      name: name.trim(),
      price: parseFloat(price),
      currency: currency || 'Rs',
      duration,
      features: Array.isArray(features) ? features.map(f => f.trim()) : [],
      image: `/uploads/laundrys/${laundryModel.image}`,
      isPopular: Boolean(isPopular),
      order: parseInt(order) || 0
    });

    await laundry.save();

    res.status(201).json({
      success: true,
      message: 'laudry created successfully',
      laundry: formatLaundryResponse(laundry)
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
      error: 'Failed to create laundry',
      message: 'Internal server error'
    });
  }
};

export const getAllLaundry = async (req, res) => {
  try {
    const { limit, popular } = req.query;
    
    let query = { isActive: true };
    
    if (popular === 'true') {
      query.isPopular = true;
    }
    
    let laundry = await laundryModel.find(query).sort({ order: 1, createdAt: -1 });
    
    if (limit) {
      laundry = laundry.slice(0, parseInt(limit));
    }
    
    res.status(200).json({
      success: true,
      laundry: laundry.map(laundry => formatLaundryResponse(laundry)),
      total: laundry.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch laundry',
      message: 'Internal server error'
    });
  }
};

export const getLaundryId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const laudry = await laundryModel.findById(id);
    
    if (!laudry) {
      return res.status(404).json({
        error: 'laundry not found',
        message: 'No laundry found with this ID'
      });
    }

    res.status(200).json({
      success: true,
      laundry: formatLaundryResponse(laudry)
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Please provide a valid laundry ID'
      });
    }
    
    res.status(500).json({
      error: 'Failed to fetch laundry',
      message: 'Internal server error'
    });
  }
};

const formatLaundryResponse = (laundry) => {
  return {
    id: laundry._id,
    name: laundry.name,
    price: laundry.price,
    currency: laundry.currency,
    duration: laundry.duration,
    displayPrice: `${laundry.currency} ${laundry.price} ${laundry.duration}`,
    features: laundry.features,
    image: `/uploads/laundrys/${laundry.image}`,
    isPopular: laundry.isPopular,
    order: laundry.order,
    isActive: laundry.isActive,
    createdAt: laundry.createdAt,
    updatedAt: laundry.updatedAt
  };
};