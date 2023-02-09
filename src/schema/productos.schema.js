const { buildSchema } = require("graphql");

const productosSchema = buildSchema(`

    input ProductosInput{
        title: String,
        price: Float,
        thumbnail: String,
        stock: Float,
        timeStamp: Float
    }
    type Producto{
        id:ID!
        title: String,
        price: Float,
        thumbnail: String,
        stock: Float,
        timeStamp: Float
    }
    type Query{
        getId(id:ID!):Producto
        getAllP: [Producto]
    }
    type Mutation{
        addProducto(datos:ProductosInput):Producto
    }
    `);

module.exports = productosSchema;
