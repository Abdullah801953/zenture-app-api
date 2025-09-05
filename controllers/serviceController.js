import Service from '../models/serviceModel.js';
import {calculateDistance} from '../utils/location.js'

// Get services near you with filtering and sorting
export const getServicesNearYou = async (req, res) => {
  try {
    const { 
      latitude, 
      longitude, 
      category, 
      sortBy = 'distance', 
      maxDistance = 50,
      minRating = 0,
      page = 1,
      limit = 10
    } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Location required',
        message: 'Latitude and longitude are required'
      });
    }

    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);
    const maxDist = parseFloat(maxDistance);
    const minRate = parseFloat(minRating);

    // Build query
    let query = { isAvailable: true };
    
    if (category && category !== 'all') {
      query.category = new RegExp(category, 'i');
    }

    if (minRate > 0) {
      query.rating = { $gte: minRate };
    }

    // Find services within max distance
    const services = await Service.find(query);

    // Calculate distance for each service and filter by max distance
    const servicesWithDistance = services
      .map(service => {
        const distance = calculateDistance(
          userLat,
          userLon,
          service.location.coordinates.latitude,
          service.location.coordinates.longitude
        );
        return {
          ...service.toObject(),
          distance
        };
      })
      .filter(service => service.distance <= maxDist);

    // Sort services
    let sortedServices;
    switch (sortBy) {
      case 'date':
        sortedServices = servicesWithDistance.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case 'time':
        // Assuming availability time - you might need to add time field to model
        sortedServices = servicesWithDistance.sort((a, b) => a.distance - b.distance);
        break;
      case 'rating':
        sortedServices = servicesWithDistance.sort((a, b) => b.rating - a.rating);
        break;
      case 'price':
        sortedServices = servicesWithDistance.sort((a, b) => a.price - b.price);
        break;
      case 'distance':
      default:
        sortedServices = servicesWithDistance.sort((a, b) => a.distance - b.distance);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedServices = sortedServices.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      total: servicesWithDistance.length,
      page: parseInt(page),
      totalPages: Math.ceil(servicesWithDistance.length / limit),
      services: paginatedServices.map(service => ({
        id: service._id,
        name: service.name,
        category: service.category,
        description: service.description,
        rating: service.rating,
        reviewCount: service.reviewCount,
        location: service.location,
        distance: service.distance,
        price: service.price,
        currency: service.currency,
        displayPrice: `${service.currency} ${service.price}`,
        images: service.images,
        provider: service.provider,
        tags: service.tags,
        isAvailable: service.isAvailable,
        createdAt: service.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      error: 'Failed to fetch services',
      message: 'Internal server error'
    });
  }
};

// Get service by ID
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.query;

    const service = await Service.findById(id);
    
    if (!service) {
      return res.status(404).json({
        error: 'Service not found',
        message: 'No service found with this ID'
      });
    }

    let distance = 0;
    if (latitude && longitude) {
      distance = calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        service.location.coordinates.latitude,
        service.location.coordinates.longitude
      );
    }

    const serviceWithDistance = {
      ...service.toObject(),
      distance
    };

    res.status(200).json({
      success: true,
      service: serviceWithDistance
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Please provide a valid service ID'
      });
    }
    
    res.status(500).json({
      error: 'Failed to fetch service',
      message: 'Internal server error'
    });
  }
};

// Create new service
export const createService = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      rating,
      reviewCount,
      location,
      price,
      currency,
      images,
      provider,
      tags
    } = req.body;

    const service = new Service({
      name,
      category,
      description,
      rating: rating || 0,
      reviewCount: reviewCount || 0,
      location,
      price,
      currency: currency || 'Rs',
      images: images || [],
      provider,
      tags: tags || [],
      distance: 0
    });

    await service.save();

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'Failed to create service',
      message: 'Internal server error'
    });
  }
};

// Get service categories
export const getServiceCategories = async (req, res) => {
  try {
    const categories = await Service.distinct('category');
    
    res.status(200).json({
      success: true,
      categories: categories.filter(cat => cat).sort()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch categories',
      message: 'Internal server error'
    });
  }
};