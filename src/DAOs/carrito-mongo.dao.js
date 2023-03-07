const { connect } = require("mongoose");
require("dotenv").config();
const cartModel = require("../models/cartModel.js");
const ProductModel = require("../models/productsModel.js");
const ordenModel = require("../models/order.model.js");
const { ordenRealizada } = require("../controller/registroUsuario.js");

class CarritoMongo {
  instance;
  constructor() {
    this.url = process.env.DB_MONGO;
    this.mongodb = connect;
  }

  async save(prod) {
    try {
      console.log(`guardando en Mongo`);
      await this.mongodb(this.url);
      const result = await prod.save();
      console.log(`result ${result}`);
      return result;
    } catch (err) {
      return err;
    }
  }
  async addProductToCart(idProd, cant, idUser, direc) {
    try {
      await this.mongodb(this.url);
      const producAdd = await ProductModel.find({ _id: idProd });
      console.log(producAdd);

      const carritByUser = await cartModel.findOneAndUpdate(
        { user: idUser },
        { $push: { productos: [{ producto: { producAdd }, cantidad: cant }] } }
      );
      if (!carritByUser) {
        const addProdToCarrito = await this.save(
          new cartModel({
            productos: [{ producto: producAdd, cantidad: cant }],
            user: idUser,
            direccion: direc,
          })
        );
        return addProdToCarrito;
      }
      return carritByUser;
    } catch (err) {
      console.log(err);
    }
  }

  async getAll(idUser) {
    try {
      console.log("leyendo en mongo");
      await this.mongodb(this.url);
      const carrito = await cartModel.find({ user: idUser });
      return carrito;
    } catch (err) {
      console.log(err);
      return { error: "No existen carritos" };
    }
  }

  async pushOrden(idUser, direc) {
    try {
      const cartBuscado = await this.getAll(idUser);
      console.log(cartBuscado[0].productos);
      const ordenNueva = await this.save(
        new ordenModel({
          items: cartBuscado[0].productos,
          direccion: direc,
          user: idUser,
          numberOrden: (await cartModel.find()).length,
        })
      );
      await ordenRealizada(ordenNueva);
      return ordenNueva;
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = CarritoMongo;
