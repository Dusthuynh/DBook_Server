const express = require('express');
const morgan = require('morgan');
const path = require('path');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const postRouter = require('./routes/postRoutes');
const userRouter = require('./routes/userRoutes');
const bookRouter = require('./routes/bookRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//routes
var serveStatic = require('serve-static');
app.use(serveStatic(__dirname + '../DBook_client/dist'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../DBook_client/dist/index.html'));
});
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/books', bookRouter);

app.all('*', (req, res, next) => {
  console.log(req.originalUrl);
  next(new AppError(`Can not find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
