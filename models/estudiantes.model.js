const { Schema, model } = require("mongoose");

const UsuariosSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  direccion: { type: String, required: true },
});

module.exports = model("Usuarios", UsuariosSchema);
