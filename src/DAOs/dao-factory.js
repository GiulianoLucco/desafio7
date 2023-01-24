const ProductosC = require("./productosDb.js");
const Producto = require("../clases/Producto.class.js");

class MyConnectionFactory {
  returnDbConnection() {
    if (process.env.STORE == "MONGO") return ProductosC.returnSingleton();
    if (process.env.STORE == "FS") return Producto.returnSingleton();
  }
}

module.exports = MyConnectionFactory;
