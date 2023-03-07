const { Schema, model } = require("mongoose");

const cartSchema = new Schema({
  productos: [
    {
      producto: { _id: false, type: Object, ref: "product" },
      cantidad: { _id: false, type: Number, required: true },
      _id: false,
    },
  ],
  timeStamp: { type: Date, default: Date.now },
  user: { _id: false, type: String },
  direccion: { _id: false, type: String },
});

const cartModel = model("carrito", cartSchema);

module.exports = cartModel;
