import express from 'express';
import { 
  createUserName, 
} from '../controllers/userNameController.js';

const userNamerouter = express.Router();

// Save user name
userNamerouter.post('/user-name', createUserName);

export default userNamerouter;