import express from 'express';
import { 
  createshoe,
  getAllshoe,
  getshoeId,
} from '../controllers/shoeController.js';
import { shoesUpload } from '../utils/multerConfig.js';

const shoeRouter = express.Router();

// Create shoe 
shoeRouter.post('/create-shoe',shoesUpload.single('image'), createshoe);

// Get all shoe 
shoeRouter.get('/get-shoe', getAllshoe);

// Get shoe  by ID
shoeRouter.get('/get-shoe-id/:id', getshoeId);


export default shoeRouter;