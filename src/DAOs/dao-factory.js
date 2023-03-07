const ProductosC = require("./productosDb.js");
const Producto = require("../clases/Producto.class.js");
const ProductMongo = require("../DAOs/Product-mongo.dao.js");

class MyConnectionFactory {
  returnDbConnection() {
    if (process.env.STORE == "MONGO") return ProductMongo.returnSingleton();
    if (process.env.STORE == "FS") return Producto.returnSingleton();
  }
}

module.exports = MyConnectionFactory;
