const mongoose = require('mongoose');

const ClotheSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  collection: {
    type:String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', ClotheSchema);
