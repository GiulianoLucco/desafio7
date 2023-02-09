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
const bCrypt = require("bcrypt");
const mongoose = require("mongoose");
const UsuarioSchema = require("./src/models/estudiantes.model.js");

const Producto = require("./src/clases/Producto.class.js");
const Carrito = require("./src/DAOs/carrito.js");
const ProductosC = require("./src/DAOs/productosDb");
const { options } = require("./src/options/mariaDb");
const { optionsSqlite } = require("./src/options/sqlite");
const Messages = require("./src/DAOs/menssagesDb");
const Tables = require("./src/models/createTable.js");
const passport = require("passport");
const { Strategy } = require("passport-local");
const { graphqlHTTP } = require("express-graphql");

const pino = require("pino");

const { registroUsuario } = require("./src/controller/registroUsuario.js");
const { rutasUsuario } = require("./src/Routes/rutasUsuario.js");
const { rutasCarrito } = require("./src/Routes/rutasCarrito.js");
const { rutasInfo } = require("./src/Routes/rutasInfo.js");
const { routerProductos } = require("./src/Routes/rutas.Producto.js");
const productosSchema = require("./src/schema/productos.schema.js");
const { graphql } = require("graphql");

const loggerError = pino("error.log");
const loggerWarn = pino("warning.log");
const loggerInfo = pino();

loggerError.level = "error";
loggerWarn.leve = "warn";
loggerInfo.level = "info";

const localStrategy = Strategy;

const app = express();

const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

let prod = new ProductosC("articulos", options);
let mens = new Messages("mensajes", optionsSqlite);

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

passport.use(
  "register",
  new localStrategy(
    { passReqToCallback: true },
    async (req, username, password, done) => {
      console.log("register", username + password);
      mongoose.connect(
        "mongodb+srv://Giuliano22:Dinero10@cluster0.d1wcvpe.mongodb.net/?retryWrites=true&w=majority"
      );

      try {
        UsuarioSchema.create({
          username: req.body.username,
          password: createHash(password),
          nombre: req.body.nombre,
          direccion: req.body.direccion,
          edad: req.body.edad,
          telefono: req.body.telefono,
        });
        if (UsuarioSchema) {
          await registroUsuario(UsuarioSchema);
          return done(null, UsuarioSchema);
        }
      } catch (e) {
        return done(e, null);
      }
    }
  )
);

passport.use(
  "login",
  new localStrategy((username, password, done) => {
    mongoose.connect(
      "mongodb+srv://Giuliano22:Dinero10@cluster0.d1wcvpe.mongodb.net/?retryWrites=true&w=majority"
    );
    try {
      UsuarioSchema.findOne(
        {
          username,
        },
        (err, user) => {
          if (err) {
            return done(err, null);
          }

          if (!user) {
            return done(null, false);
          }

          if (!isValidPassword(user, password)) {
            return done(null, false);
          }

          return done(null, user);
        }
      );
    } catch (e) {
      return done(e, null);
    }
  })
);

/*app.use((req, res, next) => {
  loggerInfo.info(
    `Peticion entrante---> Ruta: ${req.url}, metodo: ${req.method}`
  );
  next();
});*/

//serializar y deserializar
let datos = null;

passport.serializeUser((usuario, done) => {
  datos = usuario;
  app.use(function (req, res, next) {
    res.locals.currentUser = req.usuario;
    next();
  });
  done(null, usuario._id);
});

passport.deserializeUser((id, done) => {
  UsuarioSchema.findById(id, done);
});

//
function createHash(password) {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

function isValidPassword(user, password) {
  return bCrypt.compareSync(password, user.password);
}

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
  routerProductos,
  graphqlHTTP({
    schema: productosSchema,
    rootValue: {
      getAllP: Producto.getAll,
      getId: Producto.getById,
      addProducto: Producto.addProduct,
    },
    graphql: true,
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
