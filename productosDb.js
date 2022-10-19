class ProductosC {
  constructor(table, knex) {
    this.db = require("knex")(knex);
    this.table = table;
  }

  async addProduct(product) {
    try {
      return await this.db(this.table).insert(product);
    } catch (error) {
      throw error;
    }
  }

  async getAll() {
    try {
      return await this.db.from(this.table).select("*");
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ProductosC;
