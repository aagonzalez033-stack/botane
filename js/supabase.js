
// Conexión de Botane con Supabase

const SUPABASE_URL = "https://kexqdmctieywvndocomr.supabase.co";

const SUPABASE_KEY = "sb_publishable_oQ_lwO_BQEM5-YSiQM_Hmw_BGIlERgS";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
