import express from "express";
import cors from "cors";
import {connectDb} from './lib/db.js';
import 'dotenv/config.js'
import otpRoutes from './routes/otp.route.js';
import userNamerouter from "./routes/userName.route.js";
import serviceCategoryrouter from "./routes/serviceCategory.route.js";
import chefRouter from "./routes/chef.route.js";
import cleanerRouter from "./routes/cleaner.route.js";
import laundryRouter from "./routes/laundry.route.js";
import plumberRouter from "./routes/plumber.route.js";
import electricianRouter from "./routes/electrician.route.js";
import serviceRouter from "./routes/service.route.js";
import bookingRouter from "./routes/booking.route.js";
import productCategoryrouter from "./routes/productCategory.route.js";
import menRouter from "./routes/men.route.js";
import womenRouter from "./routes/women.route.js";
import kidRouter from "./routes/kids.route.js";
import trendingRouter from "./routes/trending.route.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json()); 
app.use(cors());

// db connection
connectDb();

// api endpoints
app.use('/api/auth', otpRoutes);
app.use('/api/user',userNamerouter)
app.use('/api/service',serviceCategoryrouter)
app.use('/api/chef',chefRouter)
app.use('/api/cleaner',cleanerRouter)
app.use('/api/laundry',laundryRouter)
app.use('/api/plumber',plumberRouter)
app.use('/api/electrician',electricianRouter)
app.use('/api/service',serviceRouter)
app.use('/api/booking',bookingRouter)
app.use('/api/product',productCategoryrouter)
app.use('/api/men',menRouter)
app.use('/api/women',womenRouter)
app.use('/api/kid',kidRouter)
app.use('/api/trending',trendingRouter)


app.get("/", (req, res) => {
  res.send("API Working");
}); 


app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`);
});