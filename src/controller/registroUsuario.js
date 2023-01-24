const { createTransport } = require("nodemailer");

const TEST_MAIL = "green.murazik@ethereal.email";
const transporter = createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: TEST_MAIL,
    pass: "AaYrMJYBPwGX2eGngs",
  },
});

async function registroUsuario(user) {
  try {
    const info = await transporter.sendMail({
      from: "Servidor Node.js",
      to: TEST_MAIL,
      subject: "Mail de prueba desde Node.js",
      html: `<h1 style="color: blue;">Nuevo usuario registrado <span style="color: green;">Nombre:${user.nombre}</span></h1>`,
    });

    console.log(info);
  } catch (e) {
    console.log(e);
  }
}

module.exports = { registroUsuario };
