const { Schema, model } = require("mongoose");

const productSchema = new Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  thumbnail: { type: String, required: true },
  descripcion: { type: String, required: true },
  category: { type: String, required: true },
});

const productModel = model("product", productSchema);

module.exports = productModel;
