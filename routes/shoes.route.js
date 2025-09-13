import express from 'express';
import { 
  createshoe,
  getAllshoe,
  getshoeId,
} from '../controllers/shoesController.js';
import { shoesUpload } from '../utils/multerConfig.js';

const shoeRouter = express.Router();

// Create shoe 
shoeRouter.post('/create-shoes',shoesUpload.array('images',5), createshoe);

// Get all shoe 
shoeRouter.get('/get-shoes', getAllshoe);

// Get shoe  by ID
shoeRouter.get('/get-shoes-id/:id', getshoeId);


export default shoeRouter;