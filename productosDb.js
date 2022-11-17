const { faker } = require("@faker-js/faker");

function generarRandomObj(id) {
  return {
    id: id,
    nombre: faker.commerce.productName(),
    price: faker.commerce.price(100, 1000, 0, "$"),
    description: faker.commerce.productDescription(),
  };
}

class ProductosC {
  constructor() {}

  async addProduct(product) {
    try {
      return await this.db(this.table).insert(product);
    } catch (error) {
      throw error;
    }
  }

  async getAll() {
    try {
      let objetos = [];
      const cantidadDatos = 5;

      for (let i = 0; i < cantidadDatos; i++) {
        objetos.push(generarRandomObj(i + 1));
      }

      return objetos;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = ProductosC;
