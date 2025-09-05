import express from 'express';
import { 
  createCleaner,
  getAllCleaner,
  getCleanerId,
} from '../controllers/cleanerController.js';
import { cleanerUpload } from '../utils/multerConfig.js';

const cleanerRouter = express.Router();

// Create cleaner 
cleanerRouter.post('/create-cleaner',cleanerUpload.single('image'), createCleaner);

// Get all cleaner 
cleanerRouter.get('/get-cleaner', getAllCleaner);

// Get cleaner by ID
cleanerRouter.get('/get-cleaner-id/:id', getCleanerId);


export default cleanerRouter;