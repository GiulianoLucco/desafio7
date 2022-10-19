const { options } = require("./options/mariaDb");
const { optionsSqlite } = require("./options/sqlite");
const knex = require("knex")(options);
const knexSql = require("knex")(optionsSqlite);

class Tables {
  async tableProd() {
    await knex.schema
      .createTable("articulos", (table) => {
        table.increments("id");
        table.string("nombre", 15).notNullable();
        table.float("price", 10);
        table.string("codigo", 100).notNullable();
      })
      .then(() => {
        console.log("table created");
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        knex.destroy();
      });
  }
  async tableMessa() {
    await knexSql.schema.dropTableIfExists("mensajes").then(() => {
      knexSql.schema
        .createTable("mensajes", (table) => {
          table.increments("id");
          table.string("author");
          table.string("text");
          table.string("date");
        })
        .then(() => {
          console.log("table message created");
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          knexSql.destroy();
        });
    });
  }
}

module.exports = Tables;
