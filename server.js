const express = require("express");
const PORT = 8081;

const path = require("path");
const config = require("./config.js");
const { Server: IOServer } = require("socket.io");
const { Server: HttpServer } = require("http");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true };

const ProductosC = require("./productosDb");
const { options } = require("./options/mariaDb");
const { optionsSqlite } = require("./options/sqlite");
const Messages = require("./menssagesDb");
const Tables = require("./createTable.js");

const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

let prod = new ProductosC("articulos", options);
let mens = new Messages("mensajes", optionsSqlite);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: config.mongoRemote.cnxStr,
      mongoOptions: advancedOptions,
    }),
    secret: "shhhhhhhhhhhhhhhhhhhh",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      maxAge: 150000,
    },
  })
);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render(path.join(process.cwd(), "/views/index.ejs"), {
    nombre: req.session.nombre,
  });
});

app.get("/login", (req, res) => {
  const nombre = req.session?.nombre;
  if (nombre) {
    res.redirect("/");
  } else {
    res.sendFile(path.join(process.cwd(), "./public/login.html"));
  }
});

app.post("/login", (req, res) => {
  const usuario = req.body?.nombre;
  req.session.nombre = usuario;
  res.redirect("/");
});

app.get("/logout", (req, res) => {
  const nombre = req.session?.nombre;
  if (nombre) {
    req.session.destroy((err) => {
      if (!err) {
        res.render(path.join(process.cwd(), "/views/logout.ejs"), {
          nombre,
        });
      } else {
        res.redirect("/login");
      }
    });
  } else {
    res.redirect("/login");
  }
});
io.on("connection", async (socket) => {
  console.log("Usuario conectado");

  let productos = await prod.getAll();
  let messages = await mens.getAll();

  socket.emit("productos", productos);

  socket.on("new-productos", async (data) => {
    await prod.addProduct(data);
    io.sockets.emit("productos", productos);
    console.log(data);
  });

  socket.emit("messages", messages);

  socket.on("new-message", async (data) => {
    data.date = new Date().toLocaleDateString();
    messages.push(data);
    mens.addMessage(data);
    console.log(data);
  });
});

async function inicio() {
  const createT = new Tables();
  await createT.tableProd();
  await createT.tableMessa();
}

inicio();

httpServer.listen(PORT, () => console.log("servidor Levantado"));
