const admin = require("firebase-admin");
const serviceAccount = require("./back-end-1a5f6-firebase-adminsdk-jey4z-b394aa2ffc.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

class Messages {
  async addMessage(message) {
    const db = admin.firestore();
    const query = db.collection("messages");
    try {
      let doc = query.doc();
      await doc.create(message);
    } catch (e) {
      console.log(e);
    }
  }

  async getAll() {
    const db = admin.firestore();
    const query = db.collection("messages");
    try {
      const querySnapshot = await query.get();
      let docs = querySnapshot.docs;
      const response = docs.map((doc) => ({
        email: doc.data().email,
        nombre: doc.data().nombre,
        apellido: doc.data().apellido,
        edad: doc.data().edad,
        alias: doc.data().alias,
        avatar: doc.data().avatar,
        date: doc.data().date,
      }));
      return response;
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = { Messages };
