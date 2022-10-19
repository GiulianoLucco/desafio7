const express = require("express");
const PORT = 8081;
const { Server: IOServer } = require("socket.io");
const { Server: HttpServer } = require("http");
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

app.use(express.static("./public"));
app.get("/", (req, res) => {
  res.sendFile("index.html");
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
