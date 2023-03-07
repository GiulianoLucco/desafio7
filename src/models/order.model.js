const { Schema, model } = require("mongoose");

const ordenSchema = new Schema({
  items: { _id: false, type: Object, ref: "product" },
  numberOrden: { _id: false, type: Number },
  timeStamp: { type: Date, default: Date.now },
  user: { _id: false, type: String },
  direccion: { _id: false, type: String },
  estado: { type: String, default: "generada" },
});

const ordenModel = model("orden", ordenSchema);

module.exports = ordenModel;
