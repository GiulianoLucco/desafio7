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
                                <td><img width="50" src=${elemento.codigo} alt="not found"></td>
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
                <strong>${elemento.author}</strong>:
                <em>${elemento.text}</em>
                <em>${elemento.date}</em></div>
        `;
    })
    .join(" ");
  document.getElementById("mensajes").innerHTML = html;
}

function addMessage(e) {
  const mensaje = {
    author: document.getElementById("username").value,
    text: document.getElementById("texto").value,
  };

  socket.emit("new-message", mensaje);
  return false;
}
