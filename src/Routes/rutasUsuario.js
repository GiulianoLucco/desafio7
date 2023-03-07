const express = require("express");
const passport = require("passport");
const path = require("path");
const upload = require("../controller/multerController.js");
import("../middlewares/passport.middleware.js");
const jwt = require("jsonwebtoken");
const messageMongo = require("../DAOs/menssages-mongo.dao.js");

const mens = new messageMongo();
const rutasUsuario = express.Router();

rutasUsuario.get("/", (req, res) => {
  res.render("register");
});

rutasUsuario.get(
  "/datos",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const datos = req.user;
    res.render(path.join(process.cwd(), "/public/views/datos.hbs"), {
      nombre: datos[0].nombre,
    });
  }
);

rutasUsuario.get("/logout", (req, res) => {
  const datos = payload;
  res.render(path.join(process.cwd(), "/public/views/logout.hbs"), {
    nombre: datos.username,
  });
});

rutasUsuario.get("/login", (req, res) => {
  res.render("login");
});

rutasUsuario.post(
  "/login",
  passport.authenticate("login", {
    failureRedirect: "/login-error",
  }),
  (req, res) => {
    const payload = {
      name: req.body.username,
      iat: Math.floor(Date.now() / 10000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    };
    const token = jwt.sign(payload, process.env.JWT_SIGN);
    res.json({ token });
  }
);

rutasUsuario.post(
  "/registrar",
  upload.single("avatar"),
  passport.authenticate("register", {
    successRedirect: "/login",
    failureRedirect: "/login-error",
  })
);

rutasUsuario.get("/chat", (req, res) => {
  res.render("chat");
});

rutasUsuario.get("/chat/:email", async (req, res) => {
  const mensajesEmail = await mens.getMenssageEmail(req.params.email);
  res.send(mensajesEmail);
});

module.exports = { rutasUsuario };
