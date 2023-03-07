const { connect } = require("mongoose");
const messageModel = require("../models/message.model.js");
require("dotenv").config();

class messageMongo {
  instance;
  constructor() {
    this.url = process.env.DB_MONGO;
    this.mongodb = connect;
  }
  async save(mens) {
    try {
      console.log(`guardando en Mongo`);
      await this.mongodb(this.url);
      const result = await mens.save();
      console.log(`result ${result}`);
      return result;
    } catch (err) {
      return err;
    }
  }
  async getAll() {
    try {
      console.log("leyendo en mongo");
      await this.mongodb(this.url);
      return await messageModel.find();
    } catch (err) {
      console.log(err);
      return { error: "No existen mensajes" };
    }
  }

  async addMessage(message) {
    try {
      await this.mongodb(this.url);
      const newMeesage = await this.save(
        new messageModel({
          email: message.email,
          tipo: message.tipo,
          cuerpo: message.cuerpo,
        })
      );
      console.log(`nuevo mensaje ${newMeesage}`);
      return await newMeesage;
    } catch (err) {
      console.log(err);
    }
  }

  async getMenssageEmail(emailId) {
    try {
      console.log(emailId);
      await this.mongodb(this.url);
      const mensEmail = await messageModel.find({ email: emailId });
      return mensEmail;
    } catch (error) {
      return { error: "Email incorrecto" };
    }
  }
  catch(e) {
    console.log(e);
  }
}

module.exports = messageMongo;
