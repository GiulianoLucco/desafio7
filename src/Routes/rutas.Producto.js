const express = require("express");
const passport = require("passport");
const MyConnectionFactory = require("../DAOs/dao-factory.js");
import("../middlewares/passport.middleware.js");

const routerProductos = express.Router();

const connection = new MyConnectionFactory();
const producto = connection.returnDbConnection();

routerProductos.post("/", async (req, res) => {
  const productoCreado = await producto.addProduct(req.body);
  res.send(productoCreado);
});

routerProductos.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const listaProductos = await producto.getAll();
    res.send(listaProductos);
  }
);

routerProductos.get(
  "/id/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const productoBuscado = await producto.getById(req.params.id);
    res.send(productoBuscado ?? { error: "id no encontrado" });
  }
);

routerProductos.get(
  "/categoria/:categoria",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const productosBuscado = await producto.getByCategory(req.params.categoria);
    console.log(req.params.categoria);
    res.send(
      productosBuscado ?? {
        error: "No se encuentra esa categoria de productos",
      }
    );
  }
);

routerProductos.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const productoBorrado = await producto.deleteById(req.params.id);
    res.send(productoBorrado ?? { error: "id no encontrado" });
  }
);

routerProductos.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const productosBorrados = await producto.deleteAll();
    res.send(`Se han Borrado ${productosBorrados} productos`);
  }
);

routerProductos.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const productoModificado = await producto.put(req.params.id, req.body);
    res.send(productoModificado ?? { error: "id no encontrado" });
  }
);

module.exports = { routerProductos };
