import express from 'express';
import { 
  createLaundry,
  getAllLaundry,
  getLaundryId,
} from '../controllers/laundryController.js';
import { laundryUpload } from '../utils/multerConfig.js';

const laundryRouter = express.Router();

// Create chef 
laundryRouter.post('/create-laundry',laundryUpload.single('image'), createLaundry);

// Get all chef 
laundryRouter.get('/get-laundry', getAllLaundry);

// Get chef  by ID
laundryRouter.get('/get-laundry-id/:id', getLaundryId);


export default laundryRouter;