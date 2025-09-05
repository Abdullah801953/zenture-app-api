import Address from '../models/addressModel.js';
import Booking from '../models/BookingModel.js';
import Service from '../models/serviceModel.js';

// Calculate price details
const calculatePriceDetails = (basePrice, discountPercent = 0, visitCharges = 0) => {
  const discount = (basePrice * discountPercent) / 100;
  const totalAmount = basePrice - discount + visitCharges;
  
  return {
    basePrice,
    discount,
    visitCharges,
    totalAmount
  };
};

// Add new address
export const addAddress = async (req, res) => {
  try {
    const {
      userId,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      pincode,
      addressType,
      isDefault,
      latitude,
      longitude
    } = req.body;

    if (!userId || !fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Please fill all required address fields'
      });
    }

    // If setting as default, remove default from other addresses
    if (isDefault) {
      await Address.updateMany(
        { userId, isDefault: true },
        { isDefault: false }
      );
    }

    const address = new Address({
      userId,
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2?.trim(),
      landmark: landmark?.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      addressType: addressType || 'home',
      isDefault: isDefault || false,
      location: latitude && longitude ? { latitude, longitude } : undefined
    });

    await address.save();

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      address
    });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add address',
      message: 'Internal server error'
    });
  }
};

// Get user addresses
export const getUserAddresses = async (req, res) => {
  try {
    const { userId } = req.params;

    const addresses = await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      addresses
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch addresses',
      message: 'Internal server error'
    });
  }
};

// Calculate booking price
export const calculateBookingPrice = async (req, res) => {
  try {
    const { serviceId, discountPercent = 0 } = req.body;

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        error: 'Service ID required',
        message: 'Please provide a service ID'
      });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
        message: 'The requested service does not exist'
      });
    }

    const priceDetails = calculatePriceDetails(
      service.price,
      discountPercent,
      0 // Visit charges included in base price as per requirement
    );

    res.status(200).json({
      success: true,
      priceDetails: {
        ...priceDetails,
        currency: service.currency,
        savings: priceDetails.discount,
        message: `You Will Save ${service.currency} ${priceDetails.discount} On This Booking`
      },
      service: {
        id: service._id,
        name: service.name,
        description: service.description
      }
    });
  } catch (error) {
    console.error('Error calculating price:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate price',
      message: 'Internal server error'
    });
  }
};

// Create booking
export const createBooking = async (req, res) => {
  try {
    const {
      userId,
      serviceId,
      addressId,
      bookingDate,
      timeSlot,
      discountPercent = 0,
      specialInstructions,
      paymentMethod = 'card'
    } = req.body;

    // Validate required fields
    if (!userId || !serviceId || !addressId || !bookingDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Please provide all booking details'
      });
    }

    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
        message: 'The requested service does not exist'
      });
    }

    // Check if address exists and belongs to user
    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      return res.status(404).json({
        success: false,
        error: 'Address not found',
        message: 'The specified address does not exist'
      });
    }

    // Calculate price
    const priceDetails = calculatePriceDetails(
      service.price,
      discountPercent,
      0 // Visit charges included
    );

    // Create booking
    const booking = new Booking({
      userId,
      serviceId,
      addressId,
      bookingDate: new Date(bookingDate),
      timeSlot,
      priceDetails: {
        ...priceDetails,
        currency: service.currency
      },
      specialInstructions: specialInstructions?.trim(),
      paymentMethod
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        id: booking._id,
        bookingId: booking.bookingId,
        service: {
          id: service._id,
          name: service.name
        },
        address: {
          id: address._id,
          fullName: address.fullName,
          addressLine1: address.addressLine1,
          city: address.city,
          state: address.state
        },
        bookingDate: booking.bookingDate,
        timeSlot: booking.timeSlot,
        priceDetails: booking.priceDetails,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        specialInstructions: booking.specialInstructions
      }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking',
      message: 'Internal server error'
    });
  }
};

// Process payment
export const processPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod = 'card', paymentDetails } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        error: 'Booking ID required',
        message: 'Please provide a booking ID'
      });
    }

    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
        message: 'The specified booking does not exist'
      });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Payment already processed',
        message: 'This booking has already been paid'
      });
    }

    // Simulate payment processing
    // In real application, integrate with payment gateway like Razorpay, Stripe, etc.
    const paymentSuccess = Math.random() > 0.1; // 90% success rate for simulation

    if (paymentSuccess) {
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      booking.paymentMethod = paymentMethod;
      await booking.save();

      res.status(200).json({
        success: true,
        message: 'Payment processed successfully',
        paymentStatus: 'paid',
        bookingId: booking.bookingId,
        amount: booking.priceDetails.totalAmount,
        currency: booking.priceDetails.currency
      });
    } else {
      booking.paymentStatus = 'failed';
      await booking.save();

      res.status(400).json({
        success: false,
        error: 'Payment failed',
        message: 'Payment processing failed. Please try again.',
        paymentStatus: 'failed'
      });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      error: 'Payment processing error',
      message: 'Internal server error'
    });
  }
};

// Get booking details
export const getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate('serviceId', 'name description price currency')
      .populate('addressId', 'fullName addressLine1 addressLine2 landmark city state pincode phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
        message: 'The specified booking does not exist'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking',
      message: 'Internal server error'
    });
  }
};