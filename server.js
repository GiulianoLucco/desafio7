require("dotenv").config();
const express = require("express");
const PORT = parseInt(process.argv[2]) || 8082;

const path = require("path");

const config = require("./config.js");
const { Server: IOServer } = require("socket.io");
const { Server: HttpServer } = require("http");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true };
const cookieParser = require("cookie-parser");
const hbs = require("express-handlebars");
const bCrypt = require("bcrypt");
const mongoose = require("mongoose");
const UsuarioSchema = require("./models/estudiantes.model.js");
const multer = require("multer");

const ProductosC = require("./productosDb");
const { options } = require("./options/mariaDb");
const { optionsSqlite } = require("./options/sqlite");
const Messages = require("./menssagesDb");
const Tables = require("./createTable.js");
const passport = require("passport");
const { Strategy } = require("passport-local");

const pino = require("pino");
const Carrito = require("./carrito.js");
const { registroUsuario } = require("./registroUsuario.js");

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
app.set("views", "./views");

app.engine(
  ".hbs",
  hbs.engine({
    defaultLayout: "main",
    layoutsDir: "./views/layouts",
    extname: ".hbs",
  })
);
app.set("view engine", ".hbs");
//rutas
app.get("/login", (req, res) => {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("login", {
    successRedirect: "/datos",
    failureRedirect: "/login-error",
  })
);

app.get("/login-error", (req, res) => {
  //  loggerError.error("error de datos");
  // loggerInfo.error("error de datos");
  res.render("login-error");
});

app.get("/", (req, res) => {
  res.render("register");
});

app.get("/datos", (req, res) => {
  const datos = res.req.user;
  console.log(req.session);

  res.render(path.join(process.cwd(), "/views/datos.hbs"), {
    nombre: datos.nombre || "",
    foto: datos.avatar,
  });
});

let storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "uploads");
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname);
  },
});
const upload = multer({ storage: storage });
/*app.post("/registrar", upload.single("imagen"), async (req, res, next) => {
  const file = await req.body.avatar;
  if (!file) {
    const error = new Error("pleaseUploadFile");
    error.httpStatusCode = 400;
    return next(error);
  }

  res.send(file);
});*/

app.post(
  "/registrar",
  passport.authenticate("register", {
    successRedirect: "/login",
    failureRedirect: "/login-error",
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

const carrito = new Carrito();
app.get("/carrito", async (req, res) => {
  const idList = await carrito.getAll();
  const carr = idList[0];
  const listProd = carr.productos;

  const nombreProd = listProd.forEach((element) => {
    return element.nombre;
  });

  res.render(path.join(process.cwd(), "/views/carrito.hbs"), {
    list: nombreProd,
  });
});

app.post("/addToCarrito", async (req, res) => {
  const idProducto = req.body.idProduct;

  const productoAgregado = await carrito.addProductToCarrito(idProducto);
  res.send(productoAgregado);
});

app.delete("/deleteToCarrito", async (req, res) => {
  const idProduct = req.body.idP;
  const productoDelete = await carrito.producDelete(idProduct);
  res.send(productoDelete);
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

app.get("/info", (req, res) => {
  const idProcess = process.pid;
  const sistOpe = process.platform;
  const useMemori = process.memoryUsage();
  const versionNode = process.version;
  const carpetaProye = process.cwd();
  const pathEjec = process.execPath;
  const numCpus = require("os").cpus().length;

  res.render(path.join(process.cwd(), "/views/info.hbs"), {
    idProcess: idProcess,
    sistOpe: sistOpe,
    useMemori: useMemori,
    carpetaProye: carpetaProye,
    pathEjec: pathEjec,
    versionNode: versionNode,
    numCpus: numCpus,
  });
});

/*app.use("*", (req, res) => {
  loggerWarn.warn("ruta incorrecta");
  loggerInfo.warn("ruta incorrecta");
  res.send("ruta incorrecta");
});*/
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
