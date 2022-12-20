require("dotenv").config();
const express = require("express");
const PORT = parseInt(process.argv[2]) || 8082;
const cluster = require("cluster");

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

const ProductosC = require("./productosDb");
const { options } = require("./options/mariaDb");
const { optionsSqlite } = require("./options/sqlite");
const Messages = require("./menssagesDb");
const Tables = require("./createTable.js");
const passport = require("passport");
const { Strategy } = require("passport-local");
const { fork } = require("child_process");
const pino = require("pino");

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

const forked = fork("child.js");
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
        UsuarioSchema.create(
          {
            username,
            password: createHash(password),
            direccion: req.body.direccion,
          },
          (err, userWithId) => {
            if (err) {
              console.log(err);
              return done(err, null);
            }
            return done(null, userWithId);
          }
        );
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

app.use((req, res, next) => {
  loggerInfo.info(
    `Peticion entrante---> Ruta: ${req.url}, metodo: ${req.method}`
  );
  next();
});

//serializar y deserializar
let datos = null;

passport.serializeUser((usuario, done) => {
  datos = usuario;
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
  loggerError.error("error de datos");
  loggerInfo.error("error de datos");
  res.render("login-error");
});

app.get("/", (req, res) => {
  res.render("register");
});

app.get("/datos", (req, res) => {
  console.log(datos);
  res.render(path.join(process.cwd(), "/views/datos.hbs"), {
    nombre: datos.username,
    direccion: datos.direccion,
  });
});

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
app.get("/api/productos-test", async (req, res) => {
  const productosFaker = await prod.getAll();
  res.json(productosFaker);
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

app.get("/api/randoms", (req, res) => {
  const random = req.query.cant || 100;
  forked.send(random);
  forked.on("message", (msg) => {
    res.end(msg);
  });
});

app.use("*", (req, res) => {
  loggerWarn.warn("ruta incorrecta");
  loggerInfo.warn("ruta incorrecta");
  res.send("ruta incorrecta");
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
if (Tables.tableProd && Tables.tableMessa) {
  inicio();
}

httpServer.listen(PORT, () => console.log("servidor Levantado"));
