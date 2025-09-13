import express from 'express';
import { 
  createtrending,
  getAlltrending,
  gettrendingId,
} from '../controllers/trendingController.js';
import { trendingsUpload } from '../utils/multerConfig.js';

const trendingRouter = express.Router();

// Create trending 
trendingRouter.post('/create-trending',trendingsUpload.array('images', 5), createtrending);

// Get all trending 
trendingRouter.get('/get-trending', getAlltrending);

// Get trending  by ID
trendingRouter.get('/get-trending-id/:id', gettrendingId);


export default trendingRouter;