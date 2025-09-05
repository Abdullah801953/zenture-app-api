import express from 'express';
import { 
  createelectrician,
  getAllelectrician,
  getelectricianId,
} from '../controllers/electricianController.js';
import { electriciansUpload } from '../utils/multerConfig.js';

const electricianRouter = express.Router();

// Create chef 
electricianRouter.post('/create-electrician',electriciansUpload.single('image'), createelectrician);

// Get all chef 
electricianRouter.get('/get-electrician', getAllelectrician);

// Get chef  by ID
electricianRouter.get('/get-electrician-id/:id', getelectricianId);


export default electricianRouter;