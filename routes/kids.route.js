import express from 'express';
import { 
  createkid,
  getAllkid,
  getkidId,
} from '../controllers/kidsController.js';
import { kidsUpload } from '../utils/multerConfig.js';

const kidRouter = express.Router();

// Create kid 
kidRouter.post('/create-kid',kidsUpload.array('images', 5), createkid);

// Get all kid 
kidRouter.get('/get-kid', getAllkid);

// Get kid  by ID
kidRouter.get('/get-kid-id/:id', getkidId);


export default kidRouter;