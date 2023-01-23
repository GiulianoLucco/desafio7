const { Producto } = require("./Producto.class.js");
const fs = require("fs");

class Carrito {
  constructor() {
    this.producto = new Producto();
    this.carritos = [];
    this.id = 1;
  }
  async save() {
    try {
      await fs.promises.writeFile(
        "./carrito.txt",
        JSON.stringify(this.carritos, null, 2),
        "utf-8"
      );
    } catch (e) {
      console.log(e);
    }
  }

  async listar(id) {
    try {
      const prod = await this.listarAll();
      const datos = JSON.parse(prod);

      const carritoID = datos.find((objeto) => objeto.id === id);

      return carritoID ?? { error: "carrito no encontrado" };
    } catch (e) {
      console.log(e);
    }
  }

  async listarAll() {
    try {
      let contenido = await fs.promises.readFile("./carrito.txt", "utf-8");
      return contenido || { error: "producto no encotrado" };
    } catch (e) {
      console.log(e);
    }
  }

  crearCarrito() {
    const carr = { id: this.id++, timeStamp: Date.now(), productos: [] };
    this.carritos.push(carr);
    this.save(carr);
    return carr;
  }

  async guardarProductoEnCarrito(idProd, id) {
    const producto = await this.producto.listar(idProd);
    const listarAll = await this.listarAll();
    const listaCarrito = JSON.parse(listarAll);

    listaCarrito.forEach((carro) => {
      carro.id === id ? carro.productos.push(producto) : null;
    });
    console.log(listaCarrito);
    this.carritos = listaCarrito;
    this.save();
    return this.carritos;
  }

  async borrar(id) {
    const numberId = Number(id);
    const listarAll = await this.listarAll();
    const listaCarrito = JSON.parse(listarAll);
    console.log(listaCarrito);
    let carritoFilter = listaCarrito.filter((carr) => carr.id !== numberId);

    if (carritoFilter.length) {
      this.carritos = carritoFilter;
      await this.save();
    }

    return this.carritos;
  }
}

module.exports = { Carrito };
