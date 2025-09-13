import express from 'express';
import { 
  getProductById,
  checkProductAvailability,
  getProductColors,
  getProductSizes,
  createProduct
} from '../controllers/productController.js';

const router = express.Router();

// Get product details
router.get('/products/:id', getProductById);

// Check product availability
router.post('/products/check-availability', checkProductAvailability);

// Get available colors for product
router.get('/products/:id/colors', getProductColors);

// Get available sizes for product
router.get('/products/:id/sizes', getProductSizes);

// Create new product (Admin)
router.post('/products', createProduct);

export default router;