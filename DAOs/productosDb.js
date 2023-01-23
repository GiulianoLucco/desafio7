const admin = require("firebase-admin");

class ProductosC {
  constructor() {}

  async addProduct(producto) {
    const db = admin.firestore();
    const query = db.collection("productos");
    try {
      let doc = query.doc();
      await doc.create(producto);
      return producto;
    } catch (error) {
      throw error;
    }
  }

  async getAll() {
    try {
      const db = admin.firestore();
      const query = db.collection("productos");
      const querySnapshot = await query.get();
      let docs = querySnapshot.docs;
      const response = docs.map((doc) => ({
        codigo: doc.data().codigo,
        descripcion: doc.data().descripcion,
        foto: doc.data().foto,
        nombre: doc.data().nombre,
        precio: doc.data().precio,
        stock: doc.data().stock,
        idProd: doc.id,
      }));
      return response;
    } catch (error) {
      console.log(error);
    }
  }
  async getById(id) {
    const db = admin.firestore();
    const query = db.collection("productos");
    try {
      const doc = query.doc(String(id));
      const findId = await doc.get();
      return findId.data();
    } catch (error) {
      console.log("No se encontro el id");
    }
  }
  static returnSingleton() {
    if (!this.instance) {
      this.instance = new ProductosC();
    }
    return this.instance;
  }
}
module.exports = ProductosC;
