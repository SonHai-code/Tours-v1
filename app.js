const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const cookieParser = require('cookie-parser');

const cors = require('cors');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');
const viewRouter = require('./routes/viewRoutes');

const app = express();

// SET SERVER-SIDE RENDERING
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1.MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers - helmet()
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: {
      allowOrigins: '*',
      crossOrigins: 'anonymous',
      accessControlAllowOrigin: '*',
    },
    accessControlAllowHeaders: [
      'Origin',
      'X-Requested-with',
      'Content-Type',
      'Accept',
    ],
    xFrameOptions: 'SAMEORIGIN',
    // contentSecurityPolicy: {
    //   directives: {
    //     defaultSrc: ['*'],
    //     scriptSrc: ["* data: 'unsafe-eval' 'unsafe-inline' blob:"],
    //   },
    // },
    contentSecurityPolicy: false,
  })
);

// CORS enable on the Server
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.header('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// LIMIT REQUESTS NUMBER OF API - GET MAXIMUM REQUESTS FROM A REQUEST
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP. Please try again after 1 hour!',
});

app.use('/api', limiter);

// Body parser, reading data from req,body()
app.use(express.json());

// Cookie parser - Parse the datas from the cookies
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameters polution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// MIDDLEWARE to set time request
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

// 3. ROUTES
app.use('/api/v1/tours', tourRouter); // route is a kind of middleware
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/', viewRouter); // router to view the server

// If there's no valid routers
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Handling Cross-Origin Resource Sharing(CORs) for my API
app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);

app.use(globalErrorHandler);

module.exports = app;
