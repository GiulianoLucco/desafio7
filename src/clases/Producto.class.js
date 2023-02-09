const fs = require("fs");

class Producto {
  instance;
  constructor() {
    this.id = 0;
  }

  async save(producto) {
    try {
      await fs.promises.writeFile(
        "./productos.txt",
        JSON.stringify(producto, null, 2),
        "utf-8"
      );
    } catch (e) {
      console.log(e);
    }
  }
  async addProduct(prod) {
    try {
      prod.id = ++this.id;
      prod.timeStamp = Date.now();
      const contenido = await this.getAll();
      const datos = JSON.parse(contenido);
      const indice = datos.sort((a, b) => b.id - a.id)[0].id;
      prod.id = indice + 1;
      datos.push(prod);
      this.save(datos);
      return prod;
    } catch (e) {
      console.log(e);
    }
  }

  async getAll() {
    try {
      let contenido = await fs.promises.readFile("./productos.txt", "utf-8");
      return contenido || { error: "producto no encotrado" };
    } catch (e) {
      console.log(e);
    }
  }

  async getById(id) {
    try {
      const datosAlmacenados = await this.getAll();
      const datos = JSON.parse(datosAlmacenados);
      console.log(datos);
      const result = datos.find((objeto) => objeto.id == id);
      console.log(result);
      return result;
    } catch (error) {
      console.log("No se encontro el id");
    }
  }

  static returnSingleton() {
    if (!this.instance) {
      this.instance = new Producto();
    }
    return this.instance;
  }
}

module.exports = Producto;
