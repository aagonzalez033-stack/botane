
// =====================================
// BOTANE - FUNCIONES PRINCIPALES
// =====================================

// CONFIGURACIÓN DEL CARRITO
const CLAVE_CARRITO = "botane_carrito";

let carrito = [];

try {
    carrito = JSON.parse(localStorage.getItem(CLAVE_CARRITO)) || [];
} catch (error) {
    carrito = [];
}

// FORMATO DE PRECIOS
const formatoPrecio = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN"
});

// GUARDAR CARRITO
function guardarCarrito() {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

// =====================================
// CATÁLOGO DE PRODUCTOS
// =====================================

const listaProductos = document.getElementById("listaProductos");
const buscador = document.getElementById("buscador");
const filtros = document.querySelectorAll(".filtro");

let categoriaActual = "todos";

function mostrarProductos() {
    if (!listaProductos || typeof productos === "undefined") return;

    const busqueda = buscador ? buscador.value.toLowerCase() : "";

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

// BUSCADOR Y FILTROS
if (buscador) {
    buscador.addEventListener("input", mostrarProductos);
}

filtros.forEach(boton => {
    boton.addEventListener("click", () => {
        categoriaActual = boton.dataset.categoria;

        filtros.forEach(filtro => filtro.classList.remove("activo"));
        boton.classList.add("activo");

        mostrarProductos();
    });
});

// =====================================
// AGREGAR PRODUCTOS
// =====================================

function agregarAlCarrito(id) {
    if (typeof productos === "undefined") return;

    const producto = productos.find(item => item.id === id);
    if (!producto) return;

    const existente = carrito.find(item => item.id === id);

    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({
            ...producto,
            cantidad: 1
        });
    }

    guardarCarrito();
    actualizarCarrito();
}

// EVENTO PARA AGREGAR
if (listaProductos) {
    listaProductos.addEventListener("click", evento => {
        const boton = evento.target.closest(".agregar-carrito");

        if (!boton) return;

        agregarAlCarrito(Number(boton.dataset.id));
    });
}

// =====================================
// MODIFICAR CANTIDADES Y ELIMINAR
// =====================================

function modificarCantidad(id, cambio) {
    const producto = carrito.find(item => item.id === id);

    if (!producto) return;

    producto.cantidad += cambio;

    if (producto.cantidad <= 0) {
        carrito = carrito.filter(item => item.id !== id);
    }

    guardarCarrito();
    actualizarCarrito();
}

function eliminarProducto(id) {
    carrito = carrito.filter(item => item.id !== id);

    guardarCarrito();
    actualizarCarrito();
}

// =====================================
// ACTUALIZAR CARRITO
// =====================================

function actualizarCarrito() {
    const cantidadTotal = carrito.reduce(
        (total, producto) => total + producto.cantidad, 0
    );

    const precioTotal = carrito.reduce(
        (total, producto) => total + producto.precio * producto.cantidad, 0
    );

    // CONTADOR DEL MENÚ
    const contadores = document.querySelectorAll("#contadorCarrito");

    contadores.forEach(contador => {
        contador.textContent = cantidadTotal;
    });

    // PANEL DEL CARRITO EN INICIO
    const contenidoCarrito = document.getElementById("contenidoCarrito");
    const totalCarrito = document.getElementById("totalCarrito");

    if (contenidoCarrito) {
        contenidoCarrito.innerHTML = "";

        if (carrito.length === 0) {
            contenidoCarrito.innerHTML = "<p>Tu carrito está vacío.</p>";
        }

        carrito.forEach(producto => {
            const elemento = document.createElement("div");
            elemento.className = "d-flex justify-content-between align-items-center gap-2 mb-3";

            elemento.innerHTML = `
                <div>
                    <strong>${producto.nombre}</strong>
                    <p class="mb-0">
                        ${producto.cantidad} x ${formatoPrecio.format(producto.precio)}
                    </p>
                </div>

                <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-outline-success"
                        data-accion="menos" data-id="${producto.id}">−</button>

                    <button class="btn btn-sm btn-outline-success"
                        data-accion="mas" data-id="${producto.id}">+</button>

                    <button class="btn btn-sm btn-outline-danger"
                        data-accion="eliminar" data-id="${producto.id}">×</button>
                </div>
            `;

            contenidoCarrito.appendChild(elemento);
        });
    }

    if (totalCarrito) {
        totalCarrito.textContent = formatoPrecio.format(precioTotal);
    }

    // PÁGINA INDEPENDIENTE DEL CARRITO
    const carritoVacio = document.getElementById("carritoVacio");
    const carritoContenido = document.getElementById("carritoContenido");
    const listaCarrito = document.getElementById("listaCarrito");
    const totalCompra = document.getElementById("totalCompra");

    if (carritoVacio && carritoContenido) {
        carritoVacio.hidden = carrito.length > 0;
        carritoContenido.hidden = carrito.length === 0;
    }

    if (listaCarrito) {
        listaCarrito.innerHTML = "";

        carrito.forEach(producto => {
            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${producto.nombre}</td>
                <td>${formatoPrecio.format(producto.precio)}</td>

                <td>
                    <div class="d-flex align-items-center gap-2">
                        <button class="btn btn-sm btn-outline-success"
                            data-accion="menos" data-id="${producto.id}">−</button>

                        <span>${producto.cantidad}</span>

                        <button class="btn btn-sm btn-outline-success"
                            data-accion="mas" data-id="${producto.id}">+</button>
                    </div>
                </td>

                <td>
                    ${formatoPrecio.format(producto.precio * producto.cantidad)}
                </td>

                <td>
                    <button class="btn btn-sm btn-outline-danger"
                        data-accion="eliminar" data-id="${producto.id}">
                        Eliminar
                    </button>
                </td>
            `;

            listaCarrito.appendChild(fila);
        });
    }

    if (totalCompra) {
        totalCompra.textContent = formatoPrecio.format(precioTotal);
    }
}

// EVENTOS DE LOS BOTONES DEL CARRITO
document.addEventListener("click", evento => {
    const boton = evento.target.closest("[data-accion]");

    if (!boton) return;

    const id = Number(boton.dataset.id);
    const accion = boton.dataset.accion;

    if (accion === "mas") modificarCantidad(id, 1);
    if (accion === "menos") modificarCantidad(id, -1);
    if (accion === "eliminar") eliminarProducto(id);
});

// =====================================
// ABRIR Y CERRAR PANEL DEL CARRITO
// =====================================

const btnCarrito = document.getElementById("btnCarrito");
const panelCarrito = document.getElementById("panelCarrito");
const cerrarCarrito = document.getElementById("cerrarCarrito");

if (btnCarrito && panelCarrito) {
    btnCarrito.addEventListener("click", () => {
        panelCarrito.hidden = !panelCarrito.hidden;
    });
}

if (cerrarCarrito && panelCarrito) {
    cerrarCarrito.addEventListener("click", () => {
        panelCarrito.hidden = true;
    });
}

// =====================================
// FINALIZAR COMPRA
// =====================================

const btnFinalizarCompra = document.getElementById("btnFinalizarCompra");

if (btnFinalizarCompra) {
    btnFinalizarCompra.addEventListener("click", () => {
        if (carrito.length === 0) return;

        alert("¡Tu carrito está listo! Próximamente habilitaremos los datos de entrega y el proceso de compra.");
    });
}

// =====================================
// INICIO
// =====================================

mostrarProductos();
actualizarCarrito();
