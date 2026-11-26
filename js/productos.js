
// =====================================
// BOTANE - CARGA DE PRODUCTOS
// =====================================

let productos = [];

// =====================================
// CONSULTAR PRODUCTOS EN SUPABASE
// =====================================

async function cargarProductos() {
    const contenedor = document.getElementById("listaProductos");

    try {
        if (typeof supabaseClient === "undefined") {
            throw new Error("No se pudo inicializar la conexión con Supabase.");
        }

        const { data, error } = await supabaseClient
            .from("productos")
            .select("id, nombre, categoria, descripcion, precio, imagen_url")
            .eq("activo", true)
            .order("nombre");

        if (error) throw error;

        productos = (data || []).map(producto => ({
            id: producto.id,
            nombre: producto.nombre,
            categoria: producto.categoria,
            descripcion: producto.descripcion,
            precio: Number(producto.precio),
            imagen: producto.imagen_url || ""
        }));

        // COMPARTIR PRODUCTOS CON LOS DEMÁS ARCHIVOS
        window.productos = productos;

        // AVISAR QUE LA CARGA TERMINÓ
        document.dispatchEvent(new Event("productosCargados"));

        if (productos.length === 0 && contenedor) {
            contenedor.innerHTML = `
                <div class="col-12 text-center">
                    <p>Por el momento no hay productos disponibles.</p>
                </div>
            `;
        }

    } catch (error) {
        console.error("Error al cargar productos:", error);

        productos = [];
        window.productos = productos;

        if (contenedor) {
            contenedor.innerHTML = `
                <div class="col-12 text-center">
                    <p>No fue posible cargar los productos.</p>
                    <p>Intenta nuevamente más tarde.</p>
                </div>
            `;
        }
    }
}

// =====================================
// INICIAR CARGA
// =====================================

cargarProductos();
