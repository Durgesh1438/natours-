const express = require('express');
const path=require('path')
const morgan = require('morgan');
const appError=require('./utils/appError')
const ratelimit=require('express-rate-limit')
const globalerrorhandler=require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes')
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
const helmet=require('helmet')
const mongosanitize=require('express-mongo-sanitize')
const xss=require('xss-clean')
const hpp=require('hpp')
const cookieParser=require('cookie-parser')
const app = express();
app.set('view engine','pug')
app.set('views',path.join(__dirname,'views'))
app.use(helmet())
app.use(hpp())

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
const limiter=ratelimit({
  max:100,
  windowMs:60*60*1000,
  message:'try after one hour too many requests from this IP'
})
app.use('/api',limiter)

app.use(express.json({limit:'10kb'}));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser())
app.use(mongosanitize())
app.use(xss())

app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*',(req,res,next)=>{
  next(new appError(`can't find ${req.originalUrl} on this server`,404))
})
app.use(globalerrorhandler)
// 3) ROUTES


module.exports = app;