const express = require("express");
const PORT = 8081;
const { Server: IOServer } = require("socket.io");
const { Server: HttpServer } = require("http");
const ProductosC = require("./productosDb.js");
const { Messages } = require("./DAOs/mensajesDaos.js");
const Tables = require("./createTable.js");

const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

let prod = new ProductosC();
const mens = new Messages();

app.use(express.static("./public"));
app.get("/", (req, res) => {
  res.sendFile("index.html");
});

app.get("/api/productos-test", async (req, res) => {
  const productosFaker = await prod.getAll();
  res.json(productosFaker);
});

io.on("connection", async (socket) => {
  console.log("Usuario conectado");

  let productos = await prod.getAll();
  let messages = await mens.getAll();
  socket.emit("productos", productos);

  socket.on("new-productos", async (data) => {
    await prod.addProduct(data);
    io.sockets.emit("productos", productos);
  });

  socket.emit("messages", messages);

  socket.on("new-message", async (data) => {
    data.date = new Date().toLocaleDateString();

    messages.push(data);

    await mens.addMessage(data);
    console.log("nuevo mensaje");
  });
});

async function inicio() {
  const createT = new Tables();
  await createT.tableProd();
  await createT.tableMessa();
}
if (Tables.tableProd && Tables.tableMessa) {
  inicio();
}

httpServer.listen(PORT, () => console.log("servidor Levantado"));
