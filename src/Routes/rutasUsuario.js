const express = require("express");
const passport = require("passport");
const path = require("path");
const upload = require("../controller/multerController.js");

const rutasUsuario = express.Router();

rutasUsuario.get("/", (req, res) => {
  res.render("register");
});

rutasUsuario.get("/datos", (req, res) => {
  const datos = res.req.user;

  res.render(path.join(process.cwd(), "/public/views/datos.hbs"), {
    nombre: datos.nombre,
    foto: datos.avatar,
  });
});

rutasUsuario.get("/logout", (req, res) => {
  res.render(path.join(process.cwd(), "/public/views/logout.hbs"), {
    nombre: datos.nombre,
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

rutasUsuario.post(
  "/registrar",
  upload.single("avatar"),
  passport.authenticate("register", {
    successRedirect: "/login",
    failureRedirect: "/login-error",
  })
);

module.exports = { rutasUsuario };
