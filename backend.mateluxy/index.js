import express from 'express';
import mongoose from 'mongoose'; 
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';

// Routes
import agentsRouter from './Routes/agents.routes.js';
import addAgents from './Routes/addAgents.routes.js';
import adminsRouter from './Routes/admins.routes.js';
import addAdmins from './Routes/addAdmins.route.js';
import adminSignIn from './Routes/adminSignIn.route.js';
import authRouter from './Routes/authStatus.js';
import notificationsRouter from './Routes/notifications.routes.js';
import contactRouter from './Routes/contact.routes.js';
import messagesRouter from './Routes/messages.routes.js';
import passwordResetRouter from './Routes/passwordReset.route.js';
import propertyRoutes from './Routes/propertyRoutes.js';
import bannerRouter from './Routes/banner.route.js';
import propertyRequestRouter from './Routes/propertyRequests.routes.js';
import newsRouter from './Routes/news.routes.js';
import s3UploadRouter from './Routes/s3Upload.routes.js';
import s3ProxyRouter from './Routes/s3Proxy.routes.js';

dotenv.config();

const app = express();
const allowedOrigins = [
    'http://localhost:5173',
    'https://mateluxy-frontend-sudw.vercel.app',
    'https://real-state-frontend-sigma.vercel.app',
    'https://frontend-mateluxy.vercel.app'
  ];
  
app.use(cors({
    origin: function(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // if you're using cookies/auth
  }));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Extend timeout for large requests
app.use((req, res, next) => {
  // Set timeout to 5 minutes
  req.setTimeout(300000);
  res.setTimeout(300000);
  next();
});

mongoose.connect(process.env.MONGO).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});


app.use('/api', agentsRouter);
app.use('/api/agents', addAgents);
app.use('/api', adminsRouter);
app.use('/api/admins', addAdmins);
app.use('/api', adminSignIn);
app.use('/api', passwordResetRouter);
app.use('/api/admin', authRouter);
app.use('/api/properties', propertyRoutes);
app.use('/api/notifications', notificationsRouter);
// Contact routes
console.log('Registering contact routes at /api/contact');
app.use('/api/contact', contactRouter);
// Messages routes - new system
console.log('Registering messages routes at /api/messages');
app.use('/api/messages', messagesRouter);
// Banner routes
console.log('Registering banner routes at /api/banners');
app.use('/api/banners', bannerRouter);
// Property Request routes
console.log('Registering property request routes at /api/property-requests');
app.use('/api/property-requests', propertyRequestRouter);
// News routes
console.log('Registering news routes at /api/news');
app.use('/api/news', newsRouter);

// S3 Upload routes
console.log('Registering S3 upload routes at /api/upload-to-s3');
app.use('/api/upload-to-s3', s3UploadRouter);

// S3 Proxy routes for serving images
console.log('Registering S3 proxy routes at /api/s3-proxy');
app.use('/api/s3-proxy', s3ProxyRouter);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({ 
        success: false,
        status: statusCode,
        message
     });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on  ${PORT}`);
});




