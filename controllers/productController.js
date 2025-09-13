import Product from '../models/ProductModel.js';

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: 'The requested product does not exist'
      });
    }

    if (!product.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Product not available',
        message: 'This product is currently unavailable'
      });
    }

    res.status(200).json({
      success: true,
      product: {
        id: product._id,
        name: product.name,
        description: product.description,
        mrp: product.mrp,
        sellingPrice: product.sellingPrice,
        currency: product.currency,
        taxInfo: product.taxInfo,
        colors: product.colors,
        sizes: product.sizes,
        images: product.images,
        category: product.category,
        brand: product.brand,
        rating: product.rating,
        sku: product.sku,
        returnPolicy: product.returnPolicy,
        warranty: product.warranty,
        discount: Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100),
        savings: product.mrp - product.sellingPrice
      }
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID',
        message: 'Please provide a valid product ID'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
      message: 'Internal server error'
    });
  }
};

// Check product availability
export const checkProductAvailability = async (req, res) => {
  try {
    const { productId, colorCode, sizeCode, quantity = 1 } = req.body;

    if (!productId || !colorCode || !sizeCode) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Product ID, color code, and size code are required'
      });
    }

    const product = await Product.findById(productId);
    
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: 'The requested product does not exist'
      });
    }

    const color = product.colors.find(c => c.code === colorCode && c.isAvailable);
    const size = product.sizes.find(s => s.code === sizeCode && s.isAvailable);

    if (!color) {
      return res.status(400).json({
        success: false,
        error: 'Color not available',
        message: 'The selected color is not available'
      });
    }

    if (!size) {
      return res.status(400).json({
        success: false,
        error: 'Size not available',
        message: 'The selected size is not available'
      });
    }

    if (size.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient stock',
        message: `Only ${size.stock} items available in stock`,
        availableStock: size.stock
      });
    }

    // Calculate final price with color/size additional prices
    const finalPrice = product.sellingPrice + (color.additionalPrice || 0) + (size.additionalPrice || 0);

    res.status(200).json({
      success: true,
      available: true,
      product: {
        id: product._id,
        name: product.name,
        color: color.name,
        colorCode: color.code,
        size: size.name,
        sizeCode: size.code,
        basePrice: product.sellingPrice,
        colorAdditionalPrice: color.additionalPrice || 0,
        sizeAdditionalPrice: size.additionalPrice || 0,
        finalPrice: finalPrice,
        currency: product.currency,
        stock: size.stock,
        images: color.images.length > 0 ? color.images : product.images
      }
    });
  } catch (error) {
    console.error('Error checking product availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check availability',
      message: 'Internal server error'
    });
  }
};

// Get available colors for product
export const getProductColors = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: 'The requested product does not exist'
      });
    }

    const availableColors = product.colors.filter(color => color.isAvailable);

    res.status(200).json({
      success: true,
      colors: availableColors.map(color => ({
        name: color.name,
        code: color.code,
        hexCode: color.hexCode,
        images: color.images,
        additionalPrice: color.additionalPrice || 0
      }))
    });
  } catch (error) {
    console.error('Error fetching product colors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch colors',
      message: 'Internal server error'
    });
  }
};

// Get available sizes for product and color
export const getProductSizes = async (req, res) => {
  try {
    const { id } = req.params;
    const { colorCode } = req.query;

    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: 'The requested product does not exist'
      });
    }

    let availableSizes = product.sizes.filter(size => size.isAvailable && size.stock > 0);

    // If color is specified, filter sizes that are available for that color
    if (colorCode) {
      const color = product.colors.find(c => c.code === colorCode && c.isAvailable);
      if (!color) {
        return res.status(400).json({
          success: false,
          error: 'Color not available',
          message: 'The selected color is not available'
        });
      }
    }

    res.status(200).json({
      success: true,
      sizes: availableSizes.map(size => ({
        name: size.name,
        code: size.code,
        stock: size.stock,
        additionalPrice: size.additionalPrice || 0
      }))
    });
  } catch (error) {
    console.error('Error fetching product sizes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sizes',
      message: 'Internal server error'
    });
  }
};

// Create product (Admin only)
export const createProduct = async (req, res) => {
  try {
    const productData = req.body;

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: {
        id: product._id,
        name: product.name,
        sku: product.sku,
        mrp: product.mrp,
        sellingPrice: product.sellingPrice
      }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create product',
      message: 'Internal server error'
    });
  }
};