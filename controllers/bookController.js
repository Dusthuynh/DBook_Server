// const { query } = require('express');
const Book = require('../Models/bookModel');
const APIFeatures = require('../utils/apiFeature');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllBooks = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Book.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const books = await features.query;

  res.status(200).json({
    status: 'success',
    reqAt: req.requestTime,
    result: books.length,
    data: {
      books
    }
  });
});

exports.getBook = catchAsync(async (req, res, next) => {
  const book = await Book.findOne({ slug: req.params.slug });
  // .populate('postReview.author');
  if (!book)
    return next(new AppError('No book found with id: ' + req.params.id, 404));

  res.status(200).json({
    message: 'success',
    data: { book }
  });
});

exports.createBook = catchAsync(async (req, res, next) => {
  const book = await Book.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      book
    }
  });
});

exports.updateBook = catchAsync(async (req, res, next) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body);

  if (!book)
    return next(new AppError('No book found with id: ' + req.params.id, 404));

  res.status(200).json({
    status: 'success',
    data: {
      message: book
    }
  });
});

exports.deleteBook = catchAsync(async (req, res, next) => {
  const book = await Book.findByIdAndDelete(req.params.id);

  if (!book)
    return next(new AppError('No book found with id: ' + req.params.id, 404));

  res.status(200).json({
    status: 'success',
    data: {
      message: null
    }
  });
});

exports.searchBook = catchAsync(async (req, res, next) => {
  req.query = {
    $text: { $search: req.params.key }
  };
  next();
});

exports.hotBooks = (req, res, next) => {
  req.query.limit = '4';
  req.query.sort = '-reviewsQuantity';
  next();
};
