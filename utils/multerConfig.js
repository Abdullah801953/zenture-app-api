import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createMulterConfig = (folderName) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, `../uploads/${folderName}/`));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `${folderName}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  });

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  };

  return multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 7 * 1024 * 1024
    }
  });
};

export const serviceCategoryUpload = createMulterConfig('service_categories');
export const chefUpload = createMulterConfig('chefs');
export const cleanerUpload = createMulterConfig('cleaners');
export const laundryUpload = createMulterConfig('Laundrys');
export const electriciansUpload = createMulterConfig('electricians');
export const kidsUpload = createMulterConfig('kids');
export const mensUpload = createMulterConfig('mens');
export const plumbersUpload = createMulterConfig('plumbers');
export const shoesUpload = createMulterConfig('shoes');
export const trendingsUpload = createMulterConfig('trendings');
export const womensUpload = createMulterConfig('womens');
export const productCategoryUpload=createMulterConfig('product_categories')

export default createMulterConfig;