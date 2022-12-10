const mongoose = require('mongoose');
require('dotenv').config({
  path: './config.env'
});

const app = require('./app');

//  DATABASE CLOUD
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DB conection successful!');
  })
  .catch(e => {
    console.log(e);
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
