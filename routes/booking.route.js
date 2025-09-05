import express from 'express';
import { 
  addAddress,
  getUserAddresses,
  calculateBookingPrice,
  createBooking,
  processPayment,
  getBookingDetails
} from '../controllers/bookingController.js';

const bookingRouter = express.Router();

// Address routes
bookingRouter.post('/addresses', addAddress);
bookingRouter.get('/addresses/:userId', getUserAddresses);

// Booking routes
bookingRouter.post('/calculate-price', calculateBookingPrice);
bookingRouter.post('/create-booking', createBooking);
bookingRouter.post('/payment', processPayment);
bookingRouter.get('/booking/:bookingId', getBookingDetails);

export default bookingRouter;