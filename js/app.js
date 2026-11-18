
// =====================================
// BOTANE - FUNCIONES PRINCIPALES
// =====================================

// Elementos HTML
const listaProductos = document.getElementById("listaProductos");
const buscador = document.getElementById("buscador");
const filtros = document.querySelectorAll(".filtro");

const btnCarrito = document.getElementById("btnCarrito");
const panelCarrito = document.getElementById("panelCarrito");
const contenidoCarrito = document.getElementById("contenidoCarrito");
const contadorCarrito = document.getElementById("contadorCarrito");
const totalCarrito = document.getElementById("totalCarrito");
const cerrarCarrito = document.getElementById("cerrarCarrito");

// Variables
let categoriaActual = "todos";
let carrito = [];

// Formato de precios
const formatoPrecio = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN"
});

// Mostrar productos
function mostrarProductos() {
    const busqueda = buscador.value.toLowerCase();

    const productosFiltrados = productos.filter(producto => {
        const coincideCategoria =
            categoriaActual === "todos" ||
            producto.categoria === categoriaActual;

        const coincideBusqueda =
            producto.nombre.toLowerCase().includes(busqueda) ||
            producto.descripcion.toLowerCase().includes(busqueda);

        return coincideCategoria && coincideBusqueda;
    });

    listaProductos.innerHTML = "";

    if (productosFiltrados.length === 0) {
        listaProductos.innerHTML = `
            <div class="col-12 text-center">
                <p>No encontramos productos.</p>
            </div>
        `;
        return;
    }

    productosFiltrados.forEach(producto => {
        const tarjeta = document.createElement("div");

        tarjeta.className = "col-12 col-sm-6 col-lg-4";

        tarjeta.innerHTML = `
            <div class="card h-100">
                <img src="${producto.imagen}"
                     class="card-img-top"
                     alt="${producto.nombre}"
                     loading="lazy"
                     onerror="this.style.display='none'">

                <div class="card-body d-flex flex-column">
                    <h3 class="card-title h5">${producto.nombre}</h3>

                    <p class="card-text">${producto.descripcion}</p>

                    <p class="fw-bold mt-auto">
                        ${formatoPrecio.format(producto.precio)}
                    </p>

                    <button class="btn btn-success agregar-carrito"
                            data-id="${producto.id}">
                        Agregar al carrito
                    </button>
                </div>
            </div>
        `;

        listaProductos.appendChild(tarjeta);
    });
}

// Agregar productos al carrito
function agregarAlCarrito(id) {
    const producto = productos.find(producto => producto.id === id);

    if (!producto) return;

    const productoExistente = carrito.find(item => item.id === id);

    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        carrito.push({
            ...producto,
            cantidad: 1
        });
    }

    actualizarCarrito();
}

// Actualizar carrito
function actualizarCarrito() {
    contenidoCarrito.innerHTML = "";

    if (carrito.length === 0) {
        contenidoCarrito.innerHTML = "<p>Tu carrito está vacío.</p>";
    }

    carrito.forEach(producto => {
        const elemento = document.createElement("p");

        elemento.textContent =
            `${producto.nombre} x ${producto.cantidad} - ` +
            formatoPrecio.format(producto.precio * producto.cantidad);

        contenidoCarrito.appendChild(elemento);
    });

    const cantidadTotal = carrito.reduce(
        (total, producto) => total + producto.cantidad, 0
    );

    const precioTotal = carrito.reduce(
        (total, producto) => total + producto.precio * producto.cantidad, 0
    );

    contadorCarrito.textContent = cantidadTotal;
    totalCarrito.textContent = formatoPrecio.format(precioTotal);
}

// Eventos del catálogo
buscador.addEventListener("input", mostrarProductos);

filtros.forEach(boton => {
    boton.addEventListener("click", () => {
        categoriaActual = boton.dataset.categoria;

        filtros.forEach(filtro => filtro.classList.remove("activo"));
        boton.classList.add("activo");

        mostrarProductos();
    });
});

// Evento para agregar productos
listaProductos.addEventListener("click", evento => {
    const boton = evento.target.closest(".agregar-carrito");

    if (!boton) return;

    agregarAlCarrito(Number(boton.dataset.id));
});

// Abrir y cerrar carrito
btnCarrito.addEventListener("click", () => {
    panelCarrito.hidden = !panelCarrito.hidden;
});

cerrarCarrito.addEventListener("click", () => {
    panelCarrito.hidden = true;
});

// Inicio
mostrarProductos();
actualizarCarrito();
