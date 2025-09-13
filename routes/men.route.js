import express from 'express';
import { 
  createmen,
  getAllmen,
  getmenId,
} from '../controllers/menController.js';
import { mensUpload } from '../utils/multerConfig.js';

const menRouter = express.Router();

// Create men 
menRouter.post('/create-men', mensUpload.array('images', 5), createmen)

// Get all men 
menRouter.get('/get-men', getAllmen);

// Get men  by ID
menRouter.get('/get-men-id/:id', getmenId);


export default menRouter;