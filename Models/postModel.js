const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Book = require('./bookModel');
const slugify = require('slugify');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A post must have a title'],
      minlength: [10, 'A post title must have more or equal then 10 characters']
    },
    slug: String,
    imageCover: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80'
    },
    content: {
      type: String,
      required: [true, 'A post must have a content']
    },
    viewsQuantity: {
      type: Number,
      default: 0
    },
    vote: {
      type: Number,
      default: 0
    },
    voters: [
      {
        voter_id: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        },
        action: {
          type: String,
          enum: ['like', 'hate', 'none']
        }
      }
    ],
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    book: {
      type: Schema.Types.ObjectId,
      ref: 'Book'
    }
  },
  { timestamps: true }
);

postSchema.index({ title: 'text', _id: 'text' });

// DOCUMENT MIDDLEWARE
postSchema.pre('save', function (next) {
  let id = new String(this._id);
  id = id.substring(id.length - 12); // lay 12 ky tu cuoi trong id
  this.slug = slugify(`${this.title}-${id}`, {
    lower: true,
    locale: 'vi',
    remove: /[*+~.()'"!:@?]/g
  });
  next();
});

postSchema.post('save', async function (doc, next) {
  const book = await Book.findByIdAndUpdate(this.book, {
    $push: { postReview: this._id },
    $inc: { reviewsQuantity: 1 }
  });
  console.log(book);
  next();
});

postSchema.post('findOneAndDelete', async function (doc, next) {
  console.log(doc);
  const book = await Book.findByIdAndUpdate(doc.book, {
    $pull: { postReview: doc._id },
    $inc: { reviewsQuantity: -1 }
  });
  console.log(book);
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
