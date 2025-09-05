import express from 'express';
import { 
  createplumber,
  getAllplumber,
  getplumberId,
} from '../controllers/plumberController.js';
import { plumbersUpload } from '../utils/multerConfig.js';

const plumberRouter = express.Router();

// Create chef 
plumberRouter.post('/create-plumber',plumbersUpload.single('image'), createplumber);

// Get all chef 
plumberRouter.get('/get-plumber', getAllplumber);

// Get chef  by ID
plumberRouter.get('/get-plumber-id/:id', getplumberId);


export default plumberRouter;