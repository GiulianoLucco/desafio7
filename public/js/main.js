const socket = io.connect();

socket.on("productos", (product) => {
  renderProduct(product);
});

function addProductToCart(id) {
  const idProd = { idProduct: id };

  fetch("http://localhost:8082/addToCarrito", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(idProd),
  })
    .then((response) => response.json())
    .then((data) => console.log(data));
}

function deleteProduct(id) {
  const idProd = { idProduct: id };
  fetch("http://localhost:8082/deleteToCarrito", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(idProd),
  }).then((data) => console.log(data));
}

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
    <button class="btn btn-primary" onClick="addProductToCart('${elemento.idProd}')">Agregar a carrito</button>
  </div>
</div>
              
        `;
    })
    .join(" ");
  document.getElementById("productos").innerHTML = html;
}
socket.on("pCarrito", (pCarrito) => {
  renderCarrito(pCarrito);
});
function renderCarrito(pCarrito) {
  const cartL = pCarrito[0];
  console.log(cartL);
  const lista1 = cartL.productos;
  console.log(lista1);
  const html = lista1
    .map((elemento) => {
      return `  
          
               <div class="card" style="width: 18rem;">
  <img class="card-img-top" src=${elemento.foto} alt="Card image cap">
  <div class="card-body">
    <h5 class="card-title">${elemento.nombre}</h5>
    <h3 class="card-title">Precio: $${elemento.precio}</h3>
    <p class="card-text">${elemento.descripcion}</p>
     <p class="card-text">Stock: ${elemento.stock}</p>

    <button class="btn btn-primary" onClick="deleteProduct('${elemento.idP}')">Eliminar del carrito</button>
  </div>
</div>
              
        `;
    })
    .join(" ");
  document.getElementById("carrito").innerHTML = html;
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
                <em>${elemento.tipo}</em>
                <em>${elemento.cuerpo}</em></div>
        `;
    })
    .join(" ");
  document.getElementById("mensajes").innerHTML = html;
}

function addMessage() {
  const message = {
    email: document.getElementById("email").value,
    tipo: document.getElementById("tipo").value,
    cuerpo: document.getElementById("cuerpo").value,
  };

  socket.emit("new-message", message);
  return false;
}
