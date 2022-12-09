const express = require('express');
const postController = require('../controllers/postController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/search/:key')
  .get(postController.searchPost, postController.getAllPosts);

router
  .route('/hotPosts')
  .get(postController.hotPosts, postController.getAllPosts);

router
  .route('/postsOfBook/:idBook')
  .get(postController.postsOfBook, postController.getAllPosts);

router
  .route('/postsOfUser/:idUser')
  .get(postController.postsOfUser, postController.getAllPosts);

router
  .route('/')
  .get(postController.getAllPosts)
  .post(authController.protect, postController.createPost);

router
  .route('/:slug')
  .get(postController.getPost)
  .patch(authController.protect, postController.updatePost)
  .delete(authController.protect, postController.deletePost);

router
  .route('/posts-of-me')
  .get(authController.protect, postController.getAllMyPost);

router
  .route('/vote/:id')
  .patch(authController.protect, postController.votePost);

module.exports = router;
