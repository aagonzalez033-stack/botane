
// ==========================================
// BOTANE | REGISTRO E INICIO DE SESIÓN
// ==========================================

// REGISTRO DE CLIENTES
const formRegistro = document.getElementById("formRegistro");

if (formRegistro) {
    formRegistro.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const nombre = document.getElementById("registroNombre").value.trim();
        const telefono = document.getElementById("registroTelefono").value.trim();
        const correo = document.getElementById("registroCorreo").value.trim();
        const password = document.getElementById("registroPassword").value;
        const mensaje = document.getElementById("mensajeRegistro");

        mensaje.textContent = "Creando tu cuenta...";

        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email: correo,
                password: password,
                options: {
                    emailRedirectTo: `${window.location.origin}/cuenta.html`,
                    data: {
                        nombre_completo: nombre,
                        telefono: telefono
                    }
                }
            });

            if (error) throw error;

            if (data.session) {
                mensaje.textContent = "¡Tu cuenta fue creada correctamente!";
                formRegistro.reset();
            } else {
                mensaje.textContent = "Revisa tu correo electrónico para confirmar tu cuenta.";
                formRegistro.reset();
            }

        } catch (error) {
            console.error("Error en el registro:", error);
            mensaje.textContent = "No se pudo crear la cuenta: " + error.message;
        }
    });
}


// INICIO DE SESIÓN
const formLogin = document.getElementById("formLogin");

if (formLogin) {
    formLogin.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const correo = document.getElementById("loginCorreo").value.trim();
        const password = document.getElementById("loginPassword").value;
        const mensaje = document.getElementById("mensajeLogin");

        mensaje.textContent = "Iniciando sesión...";

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: correo,
                password: password
            });

            if (error) throw error;

            mensaje.textContent = "¡Bienvenido a Botane! Sesión iniciada correctamente.";
            formLogin.reset();

        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            mensaje.textContent = "No se pudo iniciar sesión: " + error.message;
        }
    });
}
