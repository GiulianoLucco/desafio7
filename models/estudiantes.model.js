const { Schema, model } = require("mongoose");

const UsuariosSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nombre: { type: String, required: true },
  direccion: { type: String, required: true },
  edad: { type: Number, required: true },
  telefono: { type: Number, required: true },
});

module.exports = model("Usuarios", UsuariosSchema);
