const { connect } = require("mongoose");
const ProductModel = require("../models/productsModel.js");
require("dotenv").config();

class ProductMongo {
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

  async addProduct(prod) {
    try {
      await this.mongodb(this.url);
      const newProduct = await this.save(
        new ProductModel({
          title: prod.title,
          price: prod.price,
          thumbnail: prod.thumbnail,
          stock: prod.stock,
          category: prod.category,
          descripcion: prod.descripcion,
        })
      );
      console.log(`newProduct ${newProduct}`);
      return await newProduct;
    } catch (err) {
      console.log(err);
    }
  }

  async getById(id) {
    try {
      console.log(id);
      await this.mongodb(this.url);
      const prodId = await ProductModel.find({ _id: id });
      return prodId;
    } catch (error) {
      return { error: "Producto no existe" };
    }
  }
  async getByCategory(id) {
    try {
      console.log(id);
      await this.mongodb(this.url);
      const prodId = await ProductModel.find({ category: id });
      return prodId;
    } catch (error) {
      return { error: "Producto no existe" };
    }
  }

  async getAll() {
    try {
      console.log("leyendo en mongo");
      await this.mongodb(this.url);
      return await ProductModel.find();
    } catch (err) {
      console.log(err);
      return { error: "No existen productos" };
    }
  }

  async put(id, prod) {
    try {
      await this.mongodb(this.url);
      return await ProductModel.findByIdAndUpdate({ _id: id }, prod);
    } catch (err) {
      console.log(err);
    }
  }

  async deleteById(id) {
    try {
      await this.mongodb(this.url);
      return await ProductModel.findByIdAndDelete({ _id: id });
    } catch (err) {
      return { error: "No existen productos" };
    }
  }

  async deleteAll() {
    try {
      await this.mongodb(this.url);
      return await ProductModel.deleteMany();
    } catch (err) {
      console.log(err);
    }
  }

  static returnSingleton() {
    if (!this.instance) {
      this.instance = new ProductMongo();
    }
    return this.instance;
  }
}

module.exports = ProductMongo;
