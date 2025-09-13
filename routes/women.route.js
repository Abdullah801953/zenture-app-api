import express from 'express';
import { 
  createwomen,
  getAllwomen,
  getwomenId,
} from '../controllers/womenController.js';
import { womensUpload } from '../utils/multerConfig.js';

const womenRouter = express.Router();

// Create women 
womenRouter.post('/create-women',womensUpload.array('images', 5), createwomen);

// Get all women 
womenRouter.get('/get-women', getAllwomen);

// Get women  by ID
womenRouter.get('/get-women-id/:id', getwomenId);


export default womenRouter;