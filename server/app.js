


import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import authRouter from './router/user.route.js';
import adminRouter from './router/admin.route.js';
import studentRouter from './router/student.route.js';
import teacherRouter from './router/teacher.route.js';
import connectionRouter from './router/connection.route.js';
import chatRouter from './router/chat.route.js';
import { errorMiddleware } from './middlewares/error.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument, swaggerUiOptions } from './config/swagger.js';





const app = express();

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Data sanitization against NoSQL query injection
app.use((req, res, next) => {
    if (req.body) mongoSanitize.sanitize(req.body);
    if (req.params) mongoSanitize.sanitize(req.params);
    if (req.query) mongoSanitize.sanitize(req.query);
    next();
});

// Gzip compression
app.use(compression());

// Body parser & cookie parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate Limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000, // Limit each IP to 2000 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes',
    },
});

// CORS
const allowedOrigins = [
    (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, ''),
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        return callback(null, origin);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
}));







// Routes
app.use('/api', apiLimiter);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/student', studentRouter);
app.use('/api/v1/teacher', teacherRouter);
app.use('/api/v1/connections', connectionRouter);
app.use('/api/v1/connection', connectionRouter); 
app.use('/api/v1/chat', chatRouter);

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'EduNexus API is running smoothly',
        timestamp: new Date().toISOString(),
    });
});

// API Documentation (Swagger UI)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerUiOptions));
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerUiOptions));
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
});

// Centralized error middleware
app.use(errorMiddleware);





export default app;

