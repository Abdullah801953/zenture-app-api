import express from 'express';

import { 
  createCategory, 
  getAllCategories, 
  getCategoryById,
} from '../controllers/productCategoryController.js';

import { productCategoryUpload } from '../utils/multerConfig.js';

const productCategoryrouter = express.Router();

// Create category with image upload
productCategoryrouter.post('/create-categories', productCategoryUpload.single('image'), createCategory);

// Get all categories
productCategoryrouter.get('/get-categories', getAllCategories);

// Get category by ID
productCategoryrouter.get('/get-categories-id/:id', getCategoryById);


export default productCategoryrouter;