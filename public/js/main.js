const socket = io.connect();

socket.on("productos", (product) => {
  renderProduct(product);
});

function renderProduct(product) {
  console.log(product);
  const html = product
    .map((elemento) => {
      return `  
          
                <div class="table-responsive">
                    <table class="table table-dark">               
                        
                            <tr> 
                                <td>${elemento.nombre}</td>
                                <td>${elemento.price}</td>
                                <td>${elemento.description}</td>
                            </tr>
                       
                    </table>
                </div>
              
        `;
    })
    .join(" ");
  document.getElementById("productos").innerHTML = html;
}

function addProduct(e) {
  const productos = {
    nombre: document.getElementById("name").value,
    price: document.getElementById("price").value,
    codigo: document.getElementById("url").value,
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
  };

  socket.emit("new-message", message);
  return false;
}
