require("dotenv").config();
const express = require("express");
const PORT = parseInt(process.argv[2]) || 8082;

const config = require("./src/config/config.js");
const { Server: IOServer } = require("socket.io");
const { Server: HttpServer } = require("http");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true };
const cookieParser = require("cookie-parser");
const hbs = require("express-handlebars");

const Producto = require("./src/clases/Producto.class.js");
const Carrito = require("./src/DAOs/carrito.js");
const ProductosC = require("./src/DAOs/productosDb");
const { options } = require("./src/options/mariaDb");
const { optionsSqlite } = require("./src/options/sqlite");
const Messages = require("./src/DAOs/menssagesDb");
const messageMongo = require("./src/DAOs/menssages-mongo.dao.js");
const Tables = require("./src/models/createTable.js");
const passport = require("passport");

const { graphqlHTTP } = require("express-graphql");

const pino = require("pino");

const { rutasUsuario } = require("./src/Routes/rutasUsuario.js");
const { rutasCarrito } = require("./src/Routes/rutasCarrito.js");
const { rutasInfo } = require("./src/Routes/rutasInfo.js");
const { routerProductos } = require("./src/Routes/rutas.Producto.js");
const productosSchema = require("./src/schema/productos.schema.js");
const productosController = require("./src/controller/productoController.js");

const loggerError = pino("error.log");
const loggerWarn = pino("warning.log");
const loggerInfo = pino();

loggerError.level = "error";
loggerWarn.leve = "warn";
loggerInfo.level = "info";

const app = express();

const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

let prod = new ProductosC("articulos", options);
let mens = new messageMongo("mensajes", config);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
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
      maxAge: 10000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
// motor de vistas
app.set("views", "./public/views");

app.engine(
  ".hbs",
  hbs.engine({
    defaultLayout: "main",
    layoutsDir: "./public/views/layouts",
    extname: ".hbs",
  })
);
app.set("view engine", ".hbs");
//rutas

app.get("/login-error", (req, res) => {
  //  loggerError.error("error de datos");
  // loggerInfo.error("error de datos");
  res.render("login-error");
});

app.use("/", rutasUsuario);
app.use("/", rutasCarrito);
app.use("/", rutasInfo);
app.use("/productos", routerProductos);
app.use(
  "/graphql",
  graphqlHTTP({
    schema: productosSchema,
    rootValue: {
      getAllP: productosController.getAllP,
      getId: productosController.getId,
      addProducto: productosController.addProducto,
    },
    graphiql: true,
  })
);

app.use(express.static("public"));

/*app.use("*", (req, res) => {
  loggerWarn.warn("ruta incorrecta");
  loggerInfo.warn("ruta incorrecta");
  res.send("ruta incorrecta");
});*/

const carrito = new Carrito();
io.on("connection", async (socket) => {
  console.log("Usuario conectado");

  let productos = await prod.getAll();
  let messages = await mens.getAll();
  let pCarrito = await carrito.getAll();

  socket.emit("pCarrito", pCarrito);

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
if (Tables.tableProd && Tables.tableMessa) {
  inicio();
}

httpServer.listen(PORT, () => console.log("servidor Levantado"));
