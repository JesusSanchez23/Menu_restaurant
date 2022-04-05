let cliente = {
  mesa: "",
  hora: "",
  pedido: [],
};

const categorias = {
  1: "comida",
  2: "bebida",
  3: "postres",
};

const btnGuardarCliente = document.querySelector("#guardar-cliente");
const contenido = document.querySelector("#resumen .contenido");

btnGuardarCliente.addEventListener("click", guardarCliente);

function guardarCliente() {
  const mesa = document.querySelector("#mesa").value;
  const hora = document.querySelector("#hora").value;

  // revisar si hay campos vacios
  const camposVacios = [mesa, hora].some((campo) => campo === "");

  if (camposVacios) {
    const existeAlerta = document.querySelector(".alerta");

    if (!existeAlerta) {
      const alerta = document.createElement("div");
      alerta.classList.add(
        "invalid-feedback",
        "d-block",
        "text-center",
        "alerta"
      );
      alerta.textContent = "Todos los campos son obligatorios";
      document.querySelector(".modal-body form").appendChild(alerta);

      setTimeout(() => {
        alerta.remove();
      }, 2000);
    }
    return;
  }

  // asignar valores a clientre
  cliente = {
    ...cliente,
    mesa,
    hora,
  };

  // ocultar modal
  const modalFormulario = document.querySelector("#formulario");
  const modalBoostrap = bootstrap.Modal.getInstance(modalFormulario);
  modalBoostrap.hide();

  //mostrar secciones
  mostrarSecciones();

  // ontener platillos de la API de json Sever

  obtenerPlatillos();
}

function mostrarSecciones() {
  const seccionesOcultas = document.querySelectorAll(".d-none");
  seccionesOcultas.forEach((seccion) => seccion.classList.remove("d-none"));
}

function obtenerPlatillos() {
  const url = "http://localhost:4000/platillos";
  fetch(url)
    .then((respuesta) => respuesta.json())
    .then((data) => mostrarPlatillos(data))
    .catch((err) => console.log(err));
}

function mostrarPlatillos(data) {
  const contenido = document.querySelector("#platillos .contenido");
  data.forEach((platillo) => {
    const { id, nombre, precio, categoria } = platillo;
    const row = document.createElement("div");
    row.classList.add("row", "py-3", "border-top");

    const nombreDiv = document.createElement("div");
    nombreDiv.classList.add("col-md-4");
    nombreDiv.textContent = nombre;

    const precioDiv = document.createElement("div");
    precioDiv.classList.add("col-md-3", "fw-bold");
    precioDiv.textContent = `$${precio}`;

    const categoriaDiv = document.createElement("div");
    categoriaDiv.classList.add("col-md-3");
    categoriaDiv.textContent = categorias[categoria];

    const inputConsumo = document.createElement("input");
    inputConsumo.type = "number";
    inputConsumo.min = 0;
    inputConsumo.value = 0;
    inputConsumo.id = `producto-${id}`;
    inputConsumo.classList.add("form-control");

    // funcion que detecta la cantidad y el platillo que estamos agregando
    inputConsumo.onchange = () => {
      const cantidad = parseInt(inputConsumo.value);
      agregarPlatillo({ ...platillo, cantidad });
    };

    const agregar = document.createElement("div");
    agregar.classList.add("col-md-2");

    agregar.appendChild(inputConsumo);

    row.appendChild(nombreDiv);
    row.appendChild(precioDiv);
    row.appendChild(categoriaDiv);
    row.appendChild(agregar);

    contenido.appendChild(row);
  });
}

function agregarPlatillo(producto) {
  let { pedido } = cliente;
  // revisar que la cantidad sea mayor a 0
  if (producto.cantidad > 0) {
    if (pedido.some((articulo) => articulo.id === producto.id)) {
      // actualizar la cantidad
      const pedidoActualizado = pedido.map((articulo) => {
        if (articulo.id === producto.id) {
          articulo.cantidad = producto.cantidad;
        }
        return articulo;
      });
      // se asigna el nuevo array a cliente.pedido
      cliente.pedido = [...pedidoActualizado];
    } else {
      // el articulo se agrega al array
      cliente.pedido = [...pedido, producto];
    }
  } else {
    // eliminar elementos cuando la cantidad es 0
    const resultado = pedido.filter((articulo) => articulo.id !== producto.id);
    cliente.pedido = [...resultado];
  }

  // limpiar el HTML previo
  limpiarHTML();

  if (cliente.pedido.length) {
    //mostrar el resumen

    actualizarResumen();
  } else {
    mensajePedidoVacio();
  }
}

function actualizarResumen() {
  const resumen = document.createElement("DIV");
  resumen.classList.add("col-md-6", "card", "py-5", "px-3", "shadow");

  // informacion de la mesa
  const mesa = document.createElement("p");
  mesa.textContent = "Mesa: ";
  mesa.classList.add("fw-bold");

  const mesaSpan = document.createElement("span");
  mesaSpan.textContent = cliente.mesa;
  mesaSpan.classList.add("fw-normal");

  // informacion de la hora
  const hora = document.createElement("p");
  hora.textContent = "Hora: ";
  hora.classList.add("fw-bold");

  const horaSpan = document.createElement("span");
  horaSpan.textContent = cliente.hora;
  horaSpan.classList.add("fw-normal");

  mesa.appendChild(mesaSpan);
  hora.appendChild(horaSpan);

  // titulo de la seccion
  const heading = document.createElement("H3");
  heading.textContent = "Platillos consumidos";
  heading.classList.add("my-4");

  //iterar sobre el array de pedidos
  const grupo = document.createElement("ul");
  grupo.classList.add("list-group");
  const { pedido } = cliente;

  pedido.forEach((platillo) => {
    const { nombre, cantidad, precio, id } = platillo;
    const lista = document.createElement("li");
    lista.classList.add("list-group-item");

    const nombreEl = document.createElement("h4");
    nombreEl.classList.add("my-4");
    nombreEl.textContent = nombre;

    const cantidadEl = document.createElement("p");
    cantidadEl.classList.add("fw-bold");
    cantidadEl.textContent = "Cantidad: ";

    const cantidadValor = document.createElement("span");
    cantidadValor.classList.add("fw-normal");
    cantidadValor.textContent = cantidad;

    const precioEl = document.createElement("p");
    precioEl.classList.add("fw-bold");
    precioEl.textContent = "Precio: ";

    const precioValor = document.createElement("span");
    precioValor.classList.add("fw-normal");
    precioValor.textContent = `$${precio}`;

    const subtotalEl = document.createElement("p");
    subtotalEl.classList.add("fw-bold");
    subtotalEl.textContent = "Subtotal: ";

    const subtotalValor = document.createElement("span");
    subtotalValor.classList.add("fw-normal");
    subtotalValor.textContent = calcularSubtotal(precio, cantidad);

    // crear boton para eliminar
    const btnEliminar = document.createElement("button");
    btnEliminar.classList.add("btn", "btn-danger");
    btnEliminar.textContent = "Eliminar pedido";

    // function para eliminar del pedido
    btnEliminar.onclick = function () {
      eliminarProducto(id);
    };

    // agregar valores a sus contenedores
    cantidadEl.appendChild(cantidadValor);
    precioEl.appendChild(precioValor);
    subtotalEl.appendChild(subtotalValor);

    // agregar elementos al li
    lista.appendChild(nombreEl);
    lista.appendChild(cantidadEl);
    lista.appendChild(precioEl);
    lista.appendChild(subtotalEl);
    lista.appendChild(btnEliminar);

    // agregar lista al grupo
    grupo.appendChild(lista);
  });

  resumen.appendChild(heading);
  resumen.appendChild(mesa);
  resumen.appendChild(hora);
  resumen.appendChild(grupo);

  contenido.appendChild(resumen);

  // mostrar formulario de propinas
  formularioPropinas();
}

function limpiarHTML() {
  while (contenido.firstChild) {
    contenido.removeChild(contenido.firstChild);
  }
}

function calcularSubtotal(precio, cantidad) {
  return `$${precio * cantidad}`;
}

function eliminarProducto(id) {
  const { pedido } = cliente;

  const platillosRestantes = pedido.filter((platillo) => platillo.id !== id);
  cliente.pedido = [...platillosRestantes];

  console.log(cliente.pedido);

  // limpiar el HTML previo
  limpiarHTML();

  if (cliente.pedido.length) {
    //mostrar el resumen
    actualizarResumen();
  } else {
    mensajePedidoVacio();
  }

  // el producto se elimino por lo tanto regresamos la cantidad a 0 en el form
  const productoEliminado = `#producto-${id}`;
  const resetearProducto = (document.querySelector(
    productoEliminado
  ).value = 0);
}

function mensajePedidoVacio() {
  const mensaje = document.createElement("p");
  mensaje.classList.add("text-center");
  mensaje.textContent = "Añade los elementos a tu pedido";
  contenido.appendChild(mensaje);
}

function formularioPropinas() {
  const contenido = document.querySelector("#resumen .contenido");

  const formulario = document.createElement("div");
  formulario.classList.add("col-md-6", "formulario");

  const divFormulario = document.createElement("DIV");
  divFormulario.classList.add("card", "py-5", "px-3", "shadow");

  const heading = document.createElement("H3");
  heading.classList.add("my-4", "text-center");
  heading.textContent = "Propina";

  // radiobotton

  const radio10 = document.createElement("input");
  radio10.type = "radio";
  radio10.name = "propina";
  radio10.value = "10";
  radio10.classList.add("form-check-input");

  radio10.onclick = calcularPropina;

  const radio10Label = document.createElement("LABEL");
  radio10Label.textContent = "10%";
  radio10Label.classList.add("form-check-label");

  const radio10Div = document.createElement("DIV");
  radio10Div.classList.add("form-check");

  const radio25 = document.createElement("input");
  radio25.type = "radio";
  radio25.name = "propina";
  radio25.value = "25";
  radio25.classList.add("form-check-input");

  radio25.onclick = calcularPropina;

  const radio25Label = document.createElement("LABEL");
  radio25Label.textContent = "25%";
  radio25Label.classList.add("form-check-label");

  const radio25Div = document.createElement("DIV");
  radio25Div.classList.add("form-check");

  const radio50 = document.createElement("input");
  radio50.type = "radio";
  radio50.name = "propina";
  radio50.value = "50";
  radio50.classList.add("form-check-input");

  radio50.onclick = calcularPropina;

  const radio50Label = document.createElement("LABEL");
  radio50Label.textContent = "50%";
  radio50Label.classList.add("form-check-label");

  const radio50Div = document.createElement("DIV");
  radio50Div.classList.add("form-check");

  radio10Div.appendChild(radio10);
  radio10Div.appendChild(radio10Label);

  radio25Div.appendChild(radio25);
  radio25Div.appendChild(radio25Label);

  radio50Div.appendChild(radio50);
  radio50Div.appendChild(radio50Label);

  // divFormulario.appendChild(heading);
  divFormulario.appendChild(radio10Div);
  divFormulario.appendChild(radio25Div);
  divFormulario.appendChild(radio50Div);

  // AGREGADO AL FORMULARIO
  formulario.appendChild(divFormulario);

  contenido.appendChild(formulario);
}

function calcularPropina() {
  const { pedido } = cliente;
  let subtotal = 0;

  pedido.forEach((articulo) => {
    subtotal += articulo.cantidad * articulo.precio;
  });

  const propinaSeleccionada = parseInt(
    document.querySelector('[name="propina"]:checked').value
  );

  // calcular la propina
  const propina = subtotal * (propinaSeleccionada / 100);
  const totalAPagar = subtotal + propina;

  mostrarTotalHTML(subtotal, totalAPagar, propina);
}

function mostrarTotalHTML(subtotal, total, propina) {
  const divAPagar = document.createElement("div");
  divAPagar.classList.add("total-pagar", "my-5");

  // subtotal
  const subTotalParrafo = document.createElement("p");
  subTotalParrafo.classList.add("fs-4", "fw-bold", "mt-2");
  subTotalParrafo.textContent = "Subtotal Consumo: ";

  const subtotalSpan = document.createElement("span");
  subtotalSpan.classList.add("fw-normal");
  subtotalSpan.textContent = `$${subtotal}`;

  // propina
  const propinaParrafo = document.createElement("p");
  propinaParrafo.classList.add("fs-4", "fw-bold", "mt-2");
  propinaParrafo.textContent = "Propina: ";

  const propinaSpan = document.createElement("span");
  propinaSpan.classList.add("fw-normal");
  propinaSpan.textContent = `$${propina}`;

  const totalParrafo = document.createElement("p");
  totalParrafo.classList.add("fs-4", "fw-bold", "mt-2");
  totalParrafo.textContent = "Subtotal Consumo: ";

  const totalSpan = document.createElement("span");
  totalSpan.classList.add("fw-normal");
  totalSpan.textContent = `$${total}`;

  subTotalParrafo.appendChild(subtotalSpan);
  propinaParrafo.appendChild(propinaSpan);
  totalParrafo.appendChild(totalSpan);

  // eliminar el último resultado
  const totalDiv = document.querySelector(".total-pagar");
  if (totalDiv) {
    totalDiv.remove();
  }

  divAPagar.appendChild(subTotalParrafo);
  divAPagar.appendChild(propinaParrafo);
  divAPagar.appendChild(totalParrafo);

  const formulario = document.querySelector(".formulario > div");
  formulario.appendChild(divAPagar);
}
