const express = require('express');
const bookController = require('../controllers/bookController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/hotbooks')
  .get(bookController.hotBooks, bookController.getAllBooks);

router.route('/').get(bookController.getAllBooks);

router.route('/:slug').get(bookController.getBook);

router
  .route('/search/:key')
  .get(bookController.searchBook, bookController.getAllBooks);

// Routes for admin
router.use(authController.protect, authController.restrictTo('admin'));

router.route('/').post(bookController.createBook);

router
  .route('/:id')
  .patch(bookController.updateBook)
  .delete(bookController.deleteBook);

module.exports = router;
