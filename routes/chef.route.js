import express from 'express';
import { 
  createChef,
  getAllChef,
  getChefId,
} from '../controllers/chefController.js';
import { chefUpload } from '../utils/multerConfig.js';

const chefRouter = express.Router();

// Create chef 
chefRouter.post('/create-chef',chefUpload.single('image'), createChef);

// Get all chef 
chefRouter.get('/get-chef', getAllChef);

// Get chef  by ID
chefRouter.get('/get-chef-id/:id', getChefId);


export default chefRouter;