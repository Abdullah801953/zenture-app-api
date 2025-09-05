import User from '../models/userNameModel.js';

// Save user name
export const createUserName = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Name is required',
        message: 'Please enter your full name'
      });
    }

    // Create new user with only name
    const user = new User({ name: name.trim() });
    await user.save();

    res.status(201).json({ 
      success: true,
      message: 'User name saved successfully',
      user: {
        id: user._id,
        name: user.name,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error saving user name:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Duplicate name',
        message: 'This name already exists'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to save user name',
      message: 'Internal server error'
    });
  }
};