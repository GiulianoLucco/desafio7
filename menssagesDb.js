class Messages {
  constructor(table, knex) {
    this.db = require("knex")(knex);
    this.table = table;
  }

  async getAll() {
    try {
      return await this.db.from(this.table).select("*");
    } catch (err) {
      throw err;
    }
  }

  async addMessage(message) {
    try {
      return await this.db.from(this.table).insert(message);
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Messages;
