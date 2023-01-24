const express = require("express");
const Carrito = require("../DAOs/carrito.js");
const path = require("path");

const rutasCarrito = express.Router();

const carrito = new Carrito();
rutasCarrito.get("/carrito", async (req, res) => {
  const idList = await carrito.getAll();
  const carr = idList[0];
  const listProd = carr.productos;

  const nombreProd = listProd.forEach((element) => {
    return element.nombre;
  });

  res.render(path.join(process.cwd(), "/public/views/carrito.hbs"), {
    list: nombreProd,
  });
});

rutasCarrito.post("/addToCarrito", async (req, res) => {
  const idProducto = req.body.idProduct;

  const productoAgregado = await carrito.addProductToCarrito(idProducto);
  res.send(productoAgregado);
});

rutasCarrito.delete("/deleteToCarrito", async (req, res) => {
  const idProduct = req.body.idProduct;
  const productoDelete = await carrito.producDelete(idProduct);
  res.send(productoDelete);
});

module.exports = { rutasCarrito };
