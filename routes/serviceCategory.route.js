import express from 'express';

import { 
  createCategory, 
  getAllCategories, 
  getCategoryById,
} from '../controllers/serviceCategoryController.js';

import { serviceCategoryUpload } from '../utils/multerConfig.js';

const serviceCategoryrouter = express.Router();

// Create category with image upload
serviceCategoryrouter.post('/create-categories', serviceCategoryUpload.single('image'), createCategory);

// Get all categories
serviceCategoryrouter.get('/get-categories', getAllCategories);

// Get category by ID
serviceCategoryrouter.get('/get-categories-id/:id', getCategoryById);


export default serviceCategoryrouter;