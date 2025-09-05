import electricianModel from '../models/electricianModel.js';
import fs from 'fs';


export const createelectrician = async (req, res) => {
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
        message: 'electrician image is required'
      });
    }

    const electrician = new electricianModel({
      name: name.trim(),
      price: parseFloat(price),
      currency: currency || 'Rs',
      duration,
      features: Array.isArray(features) ? features.map(f => f.trim()) : [],
      image: `/uploads/electricians/${electricianModel.image}`,
      isPopular: Boolean(isPopular),
      order: parseInt(order) || 0
    });

    await electrician.save();

    res.status(201).json({
      success: true,
      message: 'laudry created successfully',
      electrician: formatelectricianResponse(electrician)
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
      error: 'Failed to create electrician',
      message: 'Internal server error'
    });
  }
};

export const getAllelectrician = async (req, res) => {
  try {
    const { limit, popular } = req.query;
    
    let query = { isActive: true };
    
    if (popular === 'true') {
      query.isPopular = true;
    }
    
    let electrician = await electricianModel.find(query).sort({ order: 1, createdAt: -1 });
    
    if (limit) {
      electrician = electrician.slice(0, parseInt(limit));
    }
    
    res.status(200).json({
      success: true,
      electrician: electrician.map(electrician => formatelectricianResponse(electrician)),
      total: electrician.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch electrician',
      message: 'Internal server error'
    });
  }
};

export const getelectricianId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const laudry = await electricianModel.findById(id);
    
    if (!laudry) {
      return res.status(404).json({
        error: 'electrician not found',
        message: 'No electrician found with this ID'
      });
    }

    res.status(200).json({
      success: true,
      electrician: formatelectricianResponse(laudry)
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Please provide a valid electrician ID'
      });
    }
    
    res.status(500).json({
      error: 'Failed to fetch electrician',
      message: 'Internal server error'
    });
  }
};

const formatelectricianResponse = (electrician) => {
  return {
    id: electrician._id,
    name: electrician.name,
    price: electrician.price,
    currency: electrician.currency,
    duration: electrician.duration,
    displayPrice: `${electrician.currency} ${electrician.price} ${electrician.duration}`,
    features: electrician.features,
    image: `/uploads/electricians/${electrician.image}`,
    isPopular: electrician.isPopular,
    order: electrician.order,
    isActive: electrician.isActive,
    createdAt: electrician.createdAt,
    updatedAt: electrician.updatedAt
  };
};