const admin = require("firebase-admin");
const serviceAccount = require("./back-end-1a5f6-firebase-adminsdk-jey4z-b394aa2ffc.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

class Messages {
  constructor() {}

  async getAll() {
    try {
      const db = admin.firestore();
      const query = db.collection("messages");
      const querySnapshot = await query.get();
      let docs = querySnapshot.docs;
      const response = docs.map((doc) => ({
        email: doc.data().email,
        nombre: doc.data().nombre,
        apellido: doc.data().apellido,
        edad: doc.data().edad,
        urlAL: doc.data().urlAL,
        alias: doc.data().alias,
        date: doc.data().date,
        text: doc.data().text,
      }));
      return response;
    } catch (err) {
      throw err;
    }
  }

  async addMessage(mensaje) {
    const db = admin.firestore();
    const query = db.collection("messages");
    try {
      let doc = query.doc();
      await doc.create(mensaje);
      return mensaje;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Messages;
