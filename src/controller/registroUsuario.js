const { createTransport } = require("nodemailer");

const TEST_MAIL = "autumn94@ethereal.email";
const transporter = createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: TEST_MAIL,
    pass: "Q317r1pc5JfXDn2AKX",
  },
});

async function registroUsuario(orden) {
  try {
    const info = await transporter.sendMail({
      from: "Servidor Node.js",
      to: TEST_MAIL,
      subject: "Mail de prueba desde Node.js",
      html: `<h1 style="color: blue;">Nuevo usuario registrado <span style="color: green;">Nombre:${orden.numberOrden}</span></h1>`,
    });

    console.log(info);
  } catch (e) {
    console.log(e);
  }
}

async function ordenRealizada(orden) {
  try {
    const info = await transporter.sendMail({
      from: "Servidor Node.js",
      to: TEST_MAIL,
      subject: "Mail de prueba desde Node.js",
      html: `<h1 style="color: blue;">Su compra ha sido procesada con exito!<span style="color: green;">Email:${orden.user}</span></h1>
      <h1 style="color: blue;">El numero de id de su operacion es el  <span style="color: green;">N:${orden._id}</span></h1>,`,
    });

    console.log(info);
  } catch (e) {
    console.log(e);
  }
}
module.exports = { registroUsuario, ordenRealizada };
