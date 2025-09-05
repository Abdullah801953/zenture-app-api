import Category from '../models/productCategoryModel.js';
import fs from 'fs';

// Create new category
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        error: 'Name is required',
        message: 'Please enter category name'
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        error: 'Image is required',
        message: 'Please upload a category image'
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingCategory) {
      // Delete uploaded file if category exists
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        error: 'Category exists',
        message: 'Category with this name already exists'
      });
    }

    // Create new category
    const category = new Category({
      name: name.trim(),
      image: req.file.filename
    });

    await category.save();

    res.status(201).json({ 
      success: true,
      message: 'Category created successfully',
      category: {
        id: category._id,
        name: category.name,
        image: `/uploads/product_categories/${category.image}`,
        isActive: category.isActive,
        createdAt: category.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating category:', error);
    
    // Delete uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Failed to create category',
      message: 'Internal server error'
    });
  }
};

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    
    const categoriesWithFullImagePath = categories.map(category => ({
      id: category._id,
      name: category.name,
      image: `/uploads/product_categories/${category.image}`,
      isActive: category.isActive,
      createdAt: category.createdAt
    }));
    
    res.status(200).json({ 
      success: true,
      categories: categoriesWithFullImagePath
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      message: 'Internal server error'
    });
  }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({ 
        error: 'Category not found',
        message: 'No category found with this ID'
      });
    }

    res.status(200).json({ 
      success: true,
      category: {
        id: category._id,
        name: category.name,
        image: `/uploads/product_categories/${category.image}`,
        isActive: category.isActive,
        createdAt: category.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid ID',
        message: 'Please provide a valid category ID'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch category',
      message: 'Internal server error'
    });
  }
};

