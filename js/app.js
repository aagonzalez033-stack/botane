
// =====================================
// BOTANE - FUNCIONES PRINCIPALES
// =====================================

// CONFIGURACIÓN DEL CARRITO
const CLAVE_CARRITO = "botane_carrito";

let carrito = [];

try {
    carrito = JSON.parse(localStorage.getItem(CLAVE_CARRITO)) || [];

    if (!Array.isArray(carrito)) {
        carrito = [];
    }
} catch (error) {
    carrito = [];
}

// FORMATO DE PRECIOS
const formatoPrecio = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN"
});

// FUNCIONES AUXILIARES
function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caracter]);
}

function obtenerProductos() {
    return typeof productos !== "undefined" && Array.isArray(productos)
        ? productos
        : [];
}

function normalizarTexto(texto) {
    return String(texto ?? "").trim().toLowerCase();
}

// GUARDAR CARRITO
function guardarCarrito() {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

// =====================================
// SINCRONIZAR CARRITO CON SUPABASE
// =====================================

function sincronizarCarritoConProductos() {
    const productosDisponibles = obtenerProductos();

    if (productosDisponibles.length === 0 || carrito.length === 0) {
        return;
    }

    const carritoActualizado = [];

    carrito.forEach(item => {
        const productoActual = productosDisponibles.find(
            producto => String(producto.id) === String(item.id)
        ) || productosDisponibles.find(
            producto => normalizarTexto(producto.nombre) === normalizarTexto(item.nombre)
        );

        const cantidad = Math.max(1, parseInt(item.cantidad, 10) || 1);

        if (productoActual) {
            const existente = carritoActualizado.find(
                producto => String(producto.id) === String(productoActual.id)
            );

            if (existente) {
                existente.cantidad += cantidad;
            } else {
                carritoActualizado.push({
                    ...productoActual,
                    cantidad
                });
            }
        } else {
            carritoActualizado.push({
                ...item,
                id: String(item.id),
                cantidad
            });
        }
    });

    carrito = carritoActualizado;
    guardarCarrito();
}

// =====================================
// CATÁLOGO DE PRODUCTOS
// =====================================

const listaProductos = document.getElementById("listaProductos");
const buscador = document.getElementById("buscador");
const filtros = document.querySelectorAll(".filtro");

let categoriaActual = "todos";

// MOSTRAR PRODUCTOS
function mostrarProductos() {
    if (!listaProductos) return;

    const productosDisponibles = obtenerProductos();

    if (productosDisponibles.length === 0) {
        listaProductos.innerHTML = `
            <div class="col-12 text-center">
                <p>No encontramos productos disponibles.</p>
            </div>
        `;
        return;
    }

    const busqueda = buscador
        ? normalizarTexto(buscador.value)
        : "";

    const productosFiltrados = productosDisponibles.filter(producto => {
        const coincideCategoria =
            categoriaActual === "todos" ||
            producto.categoria === categoriaActual;

        const coincideBusqueda =
            normalizarTexto(producto.nombre).includes(busqueda) ||
            normalizarTexto(producto.descripcion).includes(busqueda);

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
                <img src="${escaparHTML(producto.imagen)}"
                     class="card-img-top"
                     alt="${escaparHTML(producto.nombre)}"
                     loading="lazy"
                     onerror="this.style.display='none'">

                <div class="card-body d-flex flex-column">
                    <h3 class="card-title h5">
                        ${escaparHTML(producto.nombre)}
                    </h3>

                    <p class="card-text">
                        ${escaparHTML(producto.descripcion)}
                    </p>

                    <p class="fw-bold mt-auto">
                        ${formatoPrecio.format(Number(producto.precio) || 0)}
                    </p>

                    <a href="detalle.html?id=${encodeURIComponent(producto.id)}"
                       class="btn btn-outline-success mb-2">
                        Ver detalles
                    </a>

                    <button class="btn btn-success agregar-carrito"
                            data-id="${escaparHTML(producto.id)}">
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
    const productosDisponibles = obtenerProductos();

    const producto = productosDisponibles.find(
        item => String(item.id) === String(id)
    );

    if (!producto) return;

    const existente = carrito.find(
        item => String(item.id) === String(producto.id)
    );

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

// EVENTO PARA AGREGAR DESDE EL CATÁLOGO
if (listaProductos) {
    listaProductos.addEventListener("click", evento => {
        const boton = evento.target.closest(".agregar-carrito");

        if (!boton) return;

        agregarAlCarrito(boton.dataset.id);
    });
}

// =====================================
// DETALLE INDIVIDUAL DEL PRODUCTO
// =====================================

function mostrarDetalleProducto() {
    const contenedor = document.getElementById("detalleProducto");

    if (!contenedor) return;

    const parametros = new URLSearchParams(window.location.search);
    const idProducto = parametros.get("id");

    const producto = obtenerProductos().find(
        item => String(item.id) === String(idProducto)
    );

    if (!producto) {
        contenedor.innerHTML = `
            <div class="text-center py-5">
                <h2>Producto no encontrado</h2>
                <p>El producto que buscas no está disponible.</p>
                <a href="productos.html" class="btn btn-success">
                    Volver al catálogo
                </a>
            </div>
        `;
        return;
    }

    const categorias = {
        extractos: "Extractos botánicos",
        aceites: "Aceites vegetales",
        botanicos: "Aguas botánicas",
        infusiones: "Infusiones"
    };

    const nombreCategoria = Object.prototype.hasOwnProperty.call(
        categorias,
        producto.categoria
    ) ? categorias[producto.categoria] : "Producto Botane";

    contenedor.innerHTML = `
        <div class="row align-items-center g-5">

            <div class="col-md-6">
                <img
                    src="${escaparHTML(producto.imagen)}"
                    alt="${escaparHTML(producto.nombre)}"
                    class="img-fluid detalle-imagen"
                    onerror="this.style.display='none'"
                >
            </div>

            <div class="col-md-6">

                <span class="badge text-bg-light mb-3">
                    ${escaparHTML(nombreCategoria)}
                </span>

                <h1 class="detalle-titulo">
                    ${escaparHTML(producto.nombre)}
                </h1>

                <p class="detalle-descripcion">
                    ${escaparHTML(producto.descripcion)}
                </p>

                <h2 class="detalle-precio">
                    ${formatoPrecio.format(Number(producto.precio) || 0)}
                </h2>

                <p>
                    Descubre nuestra selección de productos
                    botánicos Botane.
                </p>

                <button
                    type="button"
                    class="btn btn-success"
                    id="agregarDetalle">
                    Agregar al carrito
                </button>

                <a href="carrito.html"
                   class="btn btn-outline-success ms-2">
                    Ver carrito
                </a>

            </div>
        </div>
    `;

    const botonAgregar = document.getElementById("agregarDetalle");

    botonAgregar.addEventListener("click", () => {
        agregarAlCarrito(producto.id);
        alert("Producto agregado al carrito.");
    });
}

// =====================================
// MODIFICAR CANTIDADES Y ELIMINAR
// =====================================

function modificarCantidad(id, cambio) {
    const producto = carrito.find(
        item => String(item.id) === String(id)
    );

    if (!producto) return;

    producto.cantidad += cambio;

    if (producto.cantidad <= 0) {
        carrito = carrito.filter(
            item => String(item.id) !== String(id)
        );
    }

    guardarCarrito();
    actualizarCarrito();
}

function eliminarProducto(id) {
    carrito = carrito.filter(
        item => String(item.id) !== String(id)
    );

    guardarCarrito();
    actualizarCarrito();
}

// =====================================
// ACTUALIZAR CARRITO
// =====================================

function actualizarCarrito() {
    const cantidadTotal = carrito.reduce(
        (total, producto) => total + producto.cantidad,
        0
    );

    const precioTotal = carrito.reduce(
        (total, producto) =>
            total + (Number(producto.precio) || 0) * producto.cantidad,
        0
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
                    <strong>${escaparHTML(producto.nombre)}</strong>
                    <p class="mb-0">
                        ${producto.cantidad} x
                        ${formatoPrecio.format(Number(producto.precio) || 0)}
                    </p>
                </div>

                <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-outline-success"
                        data-accion="menos" data-id="${escaparHTML(producto.id)}">−</button>

                    <button class="btn btn-sm btn-outline-success"
                        data-accion="mas" data-id="${escaparHTML(producto.id)}">+</button>

                    <button class="btn btn-sm btn-outline-danger"
                        data-accion="eliminar" data-id="${escaparHTML(producto.id)}">×</button>
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
                <td>${escaparHTML(producto.nombre)}</td>

                <td>
                    ${formatoPrecio.format(Number(producto.precio) || 0)}
                </td>

                <td>
                    <div class="d-flex align-items-center gap-2">
                        <button class="btn btn-sm btn-outline-success"
                            data-accion="menos" data-id="${escaparHTML(producto.id)}">−</button>

                        <span>${producto.cantidad}</span>

                        <button class="btn btn-sm btn-outline-success"
                            data-accion="mas" data-id="${escaparHTML(producto.id)}">+</button>
                    </div>
                </td>

                <td>
                    ${formatoPrecio.format(
                        (Number(producto.precio) || 0) * producto.cantidad
                    )}
                </td>

                <td>
                    <button class="btn btn-sm btn-outline-danger"
                        data-accion="eliminar" data-id="${escaparHTML(producto.id)}">
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

    actualizarResumenCheckout();
}

// EVENTOS DE LOS BOTONES DEL CARRITO
document.addEventListener("click", evento => {
    const boton = evento.target.closest("[data-accion]");

    if (!boton) return;

    const id = boton.dataset.id;
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
// FINALIZAR COMPRA DESDE EL CARRITO
// =====================================

const btnFinalizarCompra = document.getElementById("btnFinalizarCompra");

if (btnFinalizarCompra) {
    btnFinalizarCompra.addEventListener("click", () => {
        if (carrito.length === 0) {
            alert("Agrega productos antes de continuar.");
            return;
        }

        window.location.href = "checkout.html";
    });
}

// =====================================
// RESUMEN DEL PROCESO DE COMPRA
// =====================================

function actualizarResumenCheckout() {
    const resumen = document.getElementById("resumenCheckout");
    const totalCheckout = document.getElementById("totalCheckout");
    const formulario = document.getElementById("formCheckout");

    if (!resumen || !totalCheckout) return;

    const botonConfirmar = formulario
        ? formulario.querySelector('button[type="submit"]')
        : null;

    if (carrito.length === 0) {
        resumen.innerHTML = `
            <p>Tu carrito está vacío.</p>
            <a href="productos.html" class="btn btn-outline-success">
                Explorar productos
            </a>
        `;

        totalCheckout.textContent = formatoPrecio.format(0);

        if (botonConfirmar) {
            botonConfirmar.disabled = true;
        }

        return;
    }

    if (botonConfirmar) {
        botonConfirmar.disabled = false;
    }

    resumen.innerHTML = "";

    carrito.forEach(producto => {
        const elemento = document.createElement("div");
        elemento.className = "d-flex justify-content-between gap-3 mb-3";

        elemento.innerHTML = `
            <div>
                <strong>${escaparHTML(producto.nombre)}</strong>
                <p class="text-muted mb-0">
                    Cantidad: ${producto.cantidad}
                </p>
            </div>

            <span>
                ${formatoPrecio.format(
                    (Number(producto.precio) || 0) * producto.cantidad
                )}
            </span>
        `;

        resumen.appendChild(elemento);
    });

    const total = carrito.reduce(
        (suma, producto) =>
            suma + (Number(producto.precio) || 0) * producto.cantidad,
        0
    );

    totalCheckout.textContent = formatoPrecio.format(total);
}

// =====================================
// DATOS DEL CLIENTE EN CHECKOUT
// =====================================

async function cargarDatosClienteCheckout() {
    const formulario = document.getElementById("formCheckout");

    if (!formulario) return;

    const campoCorreo = document.getElementById("correo");

    try {
        const { data, error } = await supabaseClient.auth.getUser();

        if (error) throw error;

        if (!data.user) {
            alert("Debes iniciar sesión para realizar una compra.");
            window.location.href = "cuenta.html";
            return;
        }

        if (campoCorreo) {
            campoCorreo.value = data.user.email || "";
            campoCorreo.readOnly = true;
        }

    } catch (error) {
        console.error("Error al obtener los datos del cliente:", error);

        alert("No se pudo verificar tu sesión. Inicia sesión nuevamente.");
        window.location.href = "cuenta.html";
    }
}

cargarDatosClienteCheckout();

// =====================================
// CONFIRMAR Y REGISTRAR PEDIDO
// =====================================

const formCheckout = document.getElementById("formCheckout");

if (formCheckout) {
    formCheckout.addEventListener("submit", async evento => {
        evento.preventDefault();

        if (!formCheckout.checkValidity()) {
            formCheckout.reportValidity();
            return;
        }

        if (carrito.length === 0) {
            alert("Tu carrito está vacío. Agrega productos antes de continuar.");
            return;
        }

        const metodoPago = document.getElementById("metodoPago")?.value;

        if (!metodoPago) {
            alert("Selecciona un método de pago.");
            return;
        }

        const botonConfirmar = formCheckout.querySelector(
            'button[type="submit"]'
        );

        try {
            if (botonConfirmar) {
                botonConfirmar.disabled = true;
                botonConfirmar.textContent = "Registrando pedido...";
            }

            // 1. Verificar sesión del cliente
            const { data: sesion, error: errorSesion } =
                await supabaseClient.auth.getUser();

            if (errorSesion) throw errorSesion;

            if (!sesion.user) {
                alert("Tu sesión no está activa. Inicia sesión nuevamente.");
                window.location.href = "cuenta.html";
                return;
            }

            // 2. Preparar productos para Supabase
            // Solo enviamos identificador y cantidad.
            // Los precios se consultan directamente en la base de datos.
            const productosPedido = carrito.map(producto => ({
                id: producto.id,
                cantidad: Math.max(1, parseInt(producto.cantidad, 10) || 1)
            }));

            // 3. Registrar pedido mediante la función segura
            const { data: pedidoId, error } = await supabaseClient.rpc(
                "crear_pedido",
                {
                    p_nombre_entrega: document.getElementById("nombre").value.trim(),
                    p_telefono_entrega: document.getElementById("telefono").value.trim(),
                    p_direccion: document.getElementById("direccion").value.trim(),
                    p_ciudad: document.getElementById("ciudad").value.trim(),
                    p_codigo_postal: document.getElementById("codigoPostal").value.trim(),
                    p_referencias: document.getElementById("referencias").value.trim(),
                    p_metodo_pago: metodoPago,
                    p_productos: productosPedido
                }
            );

            if (error) throw error;

            if (!pedidoId) {
                throw new Error("No se recibió el identificador del pedido.");
            }

            // 4. Limpiar carrito solamente si se registró correctamente
            carrito = [];
            guardarCarrito();
            actualizarCarrito();

            // 5. Confirmar registro
            alert(
                "¡Tu pedido fue registrado correctamente en Botane!\n\n" +
                "Número de pedido: " + pedidoId + "\n\n" +
                "Estado: Pendiente\n" +
                "Pago: Pendiente"
            );

            formCheckout.reset();

            // Conservar el correo de la cuenta
            const campoCorreo = document.getElementById("correo");

            if (campoCorreo) {
                campoCorreo.value = sesion.user.email || "";
                campoCorreo.readOnly = true;
            }

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        } catch (error) {
            console.error("Error al registrar el pedido:", error);

            alert(
                "No se pudo registrar tu pedido.\n\n" +
                error.message +
                "\n\nTu carrito se conserva para que puedas intentarlo nuevamente."
            );

        } finally {
            if (botonConfirmar) {
                botonConfirmar.disabled = carrito.length === 0;
                botonConfirmar.textContent = "Confirmar pedido";
            }
        }
    });
}

// =====================================
// CARGA DE PRODUCTOS DESDE SUPABASE
// =====================================

document.addEventListener("productosCargados", () => {
    sincronizarCarritoConProductos();
    mostrarProductos();
    mostrarDetalleProducto();
    actualizarCarrito();
});

// =====================================
// INICIO
// =====================================

actualizarCarrito();

// Por si los productos ya estaban cargados
// antes de registrar el evento.
if (obtenerProductos().length > 0) {
    sincronizarCarritoConProductos();
    mostrarProductos();
    mostrarDetalleProducto();
    actualizarCarrito();
}
