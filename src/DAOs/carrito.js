const admin = require("firebase-admin");
const ProductosC = require("./productosDb");

const product = new ProductosC();

class Carrito {
  async getAll() {
    try {
      const db = admin.firestore();
      const query = db.collection("carritos");
      const querySnapshot = await query.get();
      let docs = querySnapshot.docs;
      const response = docs.map((doc) => ({
        id: doc.id,
        productos: doc.data().productos,
      }));
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  deleteAll() {
    try {
    } catch (e) {
      console.log(e);
    }
  }
  async delete(id) {
    const db = admin.firestore();
    const query = db.collection("carritos");
    try {
      let doc = query.doc(id);
      const deleteCarr = await doc.delete();
      return deleteCarr;
    } catch (e) {
      console.log(e);
    }
  }

  async addProductToCarrito(idProd) {
    const db = admin.firestore();
    const query = db.collection("carritos");
    try {
      let id = "H7nohfJXZTiXU0Dhfb0H";
      let produc = await product.getById(idProd);

      let doc = query.doc(id);
      produc.idP = idProd;
      let update = await doc.update({
        productos: admin.firestore.FieldValue.arrayUnion(produc),
      });

      console.log(update);

      return update;
    } catch (e) {
      console.log(e);
    }
  }

  async producDelete(idProd) {
    console.log(idProd);
    const db = admin.firestore();
    const query = db.collection("carritos");

    try {
      let id = "H7nohfJXZTiXU0Dhfb0H";
      const carrito = await this.listar(id);
      let doc = query.doc(id);
      const productoFilter = carrito.productos.filter((element) => {
        return element.idP !== idProd;
      });

      let update = await doc.update({
        productos: productoFilter,
      });

      return update;
    } catch (e) {
      console.log(e);
    }
  }
  async listar(id) {
    const db = admin.firestore();
    const query = db.collection("carritos");
    try {
      const doc = query.doc(String(id));
      const finded = await doc.get(id);
      const contCarr = finded.data();
      const idCarr = doc.id;
      const contenido = { ...contCarr, idCarr };
      return contenido;
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Carrito;
