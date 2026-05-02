// supabase-config.js
// 📍 Obtenha estas chaves em: https://app.supabase.com/project/SEU_PROJETO/settings/api

const SUPABASE_URL = 'https://vcfxgubbykwepavwghia.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_EjHwVf6A6lMfM8cimy2t6A_6nNNSvwT'; // ✅ Nova chave publishable


// ✅ Inicialização segura do cliente Supabase
(function initSupabase() {
    // Verifica se estamos no browser e se o SDK foi carregado
    if (typeof window === 'undefined' || !window.supabase) {
        console.warn('⚠️ Supabase SDK não encontrado. Verifique se o script foi carregado antes deste arquivo.');
        return;
    }
    
    // Validações básicas das chaves
    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLISHABLE_KEY.includes('SEU_')) {
        console.error('❌ Chaves do Supabase não configuradas corretamente!');
        console.error('→ Edite supabase-config.js e insira suas chaves reais.');
        return;
    }
    
    try {
        // ✅ Cria o cliente com a chave PUBLISHABLE (correto!)
        window.supabaseClient = window.supabase.createClient(
            SUPABASE_URL, 
            SUPABASE_PUBLISHABLE_KEY,  // ✅ Usando a variável correta!
            {
                auth: { 
                    persistSession: true, 
                    autoRefreshToken: true, 
                    detectSessionInUrl: true,
                    flowType: 'pkce' // ✅ Recomendado para SPAs
                },
                global: {
                    headers: { 'X-Client-Info': 'carrinho-compras/v1' }
                }
            }
        );
        
        console.log('✅ Cliente Supabase inicializado com sucesso');
        
        // ✅ Função utilitária para testar conexão (disponível globalmente)
        window.testarConexaoSupabase = async function() {
            try {
                const { data: afiliados, error } = await window.supabaseClient
                    .from('afiliados')
                    .select('id')
                    .limit(1);
                
                if (error) {
                    console.warn('⚠️ Erro ao consultar Supabase:', error.message);
                    return false;
                }
                
                console.log('✅ Supabase conectado! Registros encontrados:', afiliados?.length || 0);
                return true;
                
            } catch (err) {
                console.error('❌ Exceção ao testar conexão:', err);
                return false;
            }
        };
        
        // ✅ Teste automático em desenvolvimento (localhost)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('🔄 Testando conexão com Supabase (ambiente de desenvolvimento)...');
            window.testarConexaoSupabase().then(ok => {
                if (!ok) {
                    console.warn('⚠️ Conexão falhou. Verifique:');
                    console.warn('  1. Chaves no supabase-config.js');
                    console.warn('  2. Políticas RLS da tabela "afiliados"');
                    console.warn('  3. CORS no dashboard do Supabase');
                }
            });
        }
        
    } catch (err) {
        console.error('💥 Erro crítico ao inicializar Supabase:', err);
        window.supabaseClient = null;
    }
})();