const { expect } = require("chai");
const axios = require("axios");

describe("verificando  endpoints de productos", () => {
  it("validandno codigo 200 GET /productos/", async () => {
    const productos = await axios.get("http://localhost:8082/productos");
    expect(productos.status).to.eql(200);
  });

  it("validandno estructura de la data de respuesta GET /productos/", async () => {
    const productos = await axios.get("http://localhost:8082/productos");
    console.log(productos);
    expect(productos.data[0]).to.include.keys("idProd", "nombre", "precio");
  });

  it("validando almacenar un nuevo producto POST /productos/", async () => {
    const productoNuevo = {
      codigo: 1,
      descripcion: "Taladro Maquita",
      foto: "https://firebasestorage.googleapis.com/v0/b/ferrimac-react.appspot.com/o/compresor1.webp?alt=media&token=d1996503-db56-4e80-8f36-1092ec97bbb0",
      nombre: "Taladro",
      precio: 400,
      stock: 20,
    };
    const producto = await axios.post(
      "http://localhost:8082/productos",
      productoNuevo
    );
    expect(producto.data).to.include.keys("nombre", "precio");
    expect(producto.data.nombre).to.eql(productoNuevo.nombre);
  });
});
