const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slugify = require('slugify');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A book must have a title']
  },
  slug: String,
  description: {
    type: String
  },
  authors: {
    type: [String],
    required: [true, 'A book must have a author']
  },
  publisher: {
    type: String
  },
  categories: {
    type: [String]
  },
  imageLinks: {
    smallThumbnail: { type: String },
    thumbnail: { type: String }
  },
  reviewsQuantity: {
    type: Number,
    default: 0
  },
  postReview: {
    type: [Schema.Types.ObjectId],
    ref: 'Post'
  }
});

bookSchema.index({ title: 'text', authors: 'text', categories: 'text' });

bookSchema.pre('save', function (next) {
  let id = new String(this._id);
  id = id.substring(id.length - 5); // lay 12 ky tu cuoi trong id
  this.slug = slugify(`${this.title}-${id}`, {
    lower: true,
    locale: 'vi',
    remove: /[*+~.()'"!:@]/g
  });
  next();
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
