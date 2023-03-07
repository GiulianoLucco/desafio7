const express = require("express");
const CarritoMongo = require("../DAOs/carrito-mongo.dao.js");
import("../middlewares/passport.middleware.js");
const passport = require("passport");

const rutasCarrito = express.Router();

const carrito = new CarritoMongo();

rutasCarrito.get(
  "/carrito",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const idUser = req.user[0].username;
    const carritos = await carrito.getAll(idUser);

    res.send(carritos);
  }
);

rutasCarrito.post(
  "/carrito/:id/cant/:cant",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    console.log(req.user[0].username);
    idUser = req.user[0].username;
    direccion = req.user[0].direccion;
    const createCarrito = await carrito.addProductToCart(
      req.params.id,
      req.params.cant,
      idUser,
      direccion
    );
    res.send(createCarrito);
  }
);

rutasCarrito.post(
  "/carrito",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    idUser = req.user[0].username;
    direccion = req.user[0].direccion;
    const ordenRealizada = await carrito.pushOrden(idUser, direccion);
    res.send(ordenRealizada);
  }
);

rutasCarrito.delete("/deleteToCarrito", async (req, res) => {
  const idProduct = req.params.id;
  const productoDelete = await carrito.producDelete(idProduct);
  res.send(productoDelete);
});

module.exports = { rutasCarrito };
