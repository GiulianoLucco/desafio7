const express = require("express");
const MyConnectionFactory = require("../DAOs/dao-factory.js");

const routerProductos = express.Router();

const connection = new MyConnectionFactory();
const producto = connection.returnDbConnection();

routerProductos.post("/", async (req, res) => {
  const productoCreado = await producto.addProduct(req.body);
  res.send(productoCreado);
});

routerProductos.get("/", async (req, res) => {
  const listaProductos = await producto.getAll();
  res.send(listaProductos);
});

routerProductos.get("/:id", async (req, res) => {
  const productoBuscado = await producto.getById(req.params.id);
  res.send(productoBuscado ?? { error: "id no encontrado" });
});

module.exports = { routerProductos };
