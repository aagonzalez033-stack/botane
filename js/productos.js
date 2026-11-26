
let productos = [];

async function cargarProductos() {
    const contenedor = document.getElementById("listaProductos");

    try {
        const { data, error } = await supabaseClient
            .from("productos")
            .select("id, nombre, categoria, descripcion, precio, imagen_url")
            .eq("activo", true)
            .order("nombre");

        if (error) throw error;

        productos = data.map(producto => ({
            id: producto.id,
            nombre: producto.nombre,
            categoria: producto.categoria,
            descripcion: producto.descripcion,
            precio: Number(producto.precio),
            imagen: producto.imagen_url
        }));

        window.productos = productos;

        document.dispatchEvent(new Event("productosCargados"));

    } catch (error) {
        console.error("Error al cargar productos:", error);

        if (contenedor) {
            contenedor.innerHTML = `
                <div class="col-12 text-center">
                    <p>No fue posible cargar los productos. Intenta nuevamente.</p>
                </div>
            `;
        }
    }
}

cargarProductos();
