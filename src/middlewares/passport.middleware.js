const passport = require("passport");
const { Strategy } = require("passport-local");
const mongoose = require("mongoose");
const UsuarioSchema = require("../models/estudiantes.model.js");
const bCrypt = require("bcrypt");
const { registroUsuario } = require("../controller/registroUsuario.js");
const passportJwt = require("passport-jwt");

const localStrategy = Strategy;

const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

const jwtOptions = {
  secretOrKey: process.env.JWT_SIGN,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      console.log("validando");
      await mongoose.connect(process.env.DB_MONGO);
      const user = await UsuarioSchema.find({ username: payload.name });
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (e) {
      console.log(e);
      return done(e, false);
    }
  })
);

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
          await registroUsuario(username);
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
  (function (req, res, next) {
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
