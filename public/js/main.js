const socket = io.connect();

socket.on("productos", (product) => {
  renderProduct(product);
});

function renderProduct(product) {
  console.log(product);
  const html = product
    .map((elemento) => {
      return `  
          
               <div class="card" style="width: 18rem;">
  <img class="card-img-top" src=${elemento.foto} alt="Card image cap">
  <div class="card-body">
    <h5 class="card-title">${elemento.nombre}</h5>
    <h3 class="card-title">Precio: $${elemento.precio}</h3>
    <p class="card-text">${elemento.descripcion}</p>
    <a href="#" class="btn btn-primary">Agregar a carrito</a>
  </div>
</div>
              
        `;
    })
    .join(" ");
  document.getElementById("productos").innerHTML = html;
}

function addProduct() {
  const productos = {
    nombre: document.getElementById("nombre").value,
    precio: document.getElementById("precio").value,
    descripcion: document.getElementById("descripcion").value,
    foto: document.getElementById("foto").value,
    stock: document.getElementById("stock").value,
    codigo: document.getElementById("codigo").value,
  };

  socket.emit("new-productos", productos);
  return false;
}

socket.on("messages", (data) => {
  render(data);
});

function render(data) {
  const html = data
    .map((elemento) => {
      return `<div>
                <strong>${elemento.email}</strong>:
                <em>${elemento.nombre}</em>
                <em>${elemento.date}</em></div>
        `;
    })
    .join(" ");
  document.getElementById("mensajes").innerHTML = html;
}

function addMessage() {
  const message = {
    email: document.getElementById("email").value,
    nombre: document.getElementById("nombre").value,
    apellido: document.getElementById("apellido").value,
    edad: document.getElementById("edad").value,
    alias: document.getElementById("alias").value,
    urlA: document.getElementById("urlA").value,
    text: document.getElementById("text").value,
  };

  socket.emit("new-message", message);
  return false;
}
