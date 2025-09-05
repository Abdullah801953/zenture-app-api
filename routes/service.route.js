import express from 'express';
import { 
  getServicesNearYou, 
  getServiceById, 
  createService,
  getServiceCategories
} from '../controllers/serviceController.js';

const serviceRouter = express.Router();

serviceRouter.get('/services/near-you', getServicesNearYou);
serviceRouter.get('/services/categories', getServiceCategories);
serviceRouter.get('/services/:id', getServiceById);
serviceRouter.post('/services', createService);

export default serviceRouter;