const express = require("express");
const passport = require("passport");
const path = require("path");

const rutasUsuario = express.Router();

rutasUsuario.get("/", (req, res) => {
  res.render("register");
});

rutasUsuario.get("/datos", (req, res) => {
  const datos = res.req.user;

  res.render(path.join(process.cwd(), "/views/datos.hbs"), {
    nombre: datos.nombre,
    foto: datos.avatar,
  });
});

rutasUsuario.get("/login", (req, res) => {
  res.render("login");
});

rutasUsuario.post(
  "/login",
  passport.authenticate("login", {
    successRedirect: "/datos",
    failureRedirect: "/login-error",
  })
);

module.exports = { rutasUsuario };
