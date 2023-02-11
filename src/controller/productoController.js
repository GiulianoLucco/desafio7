const productos = [];

const productosController = {
  getAllP() {
    return productos;
  },

  addProducto({ datos }) {
    console.log(datos);

    const nuevosDatos = productos.push(datos);
    return nuevosDatos;
  },

  getId({ id }) {
    const prod = productos.find((r) => r.id == id);
    if (!prod) {
      throw new Error("Producto not fount");
    }
    return prod;
  },
};

module.exports = productosController;
