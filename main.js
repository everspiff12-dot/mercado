// ============ DADOS LOCAIS ============
const listaAfiliados = [
    { id: 1, nome: "João Silva", cidade: "São Paulo", estado: "SP", regiao: "Sudeste", comercio: "pedreiro", telefone: "(11) 99999-9999", email: "joao@pedreiro.com" },
    { id: 2, nome: "Maria Santos", cidade: "Rio de Janeiro", estado: "RJ", regiao: "Sudeste", comercio: "mercado", telefone: "(21) 98888-8888", email: "maria@mercado.com" },
    { id: 3, nome: "Carlos Lima", cidade: "Belo Horizonte", estado: "MG", regiao: "Sudeste", comercio: "barbeiro", telefone: "(31) 97777-7777", email: "carlos@barbearia.com" },
    { id: 4, nome: "Ana Souza", cidade: "Porto Alegre", estado: "RS", regiao: "Sul", comercio: "jardineiro", telefone: "(51) 96666-6666", email: "ana@jardins.com" },
    { id: 5, nome: "Pedro Oliveira", cidade: "Salvador", estado: "BA", regiao: "Nordeste", comercio: "marceneiro", telefone: "(71) 95555-5555", email: "pedro@marcenaria.com" },
    { id: 6, nome: "Fernanda Costa", cidade: "Brasília", estado: "DF", regiao: "Centro-Oeste", comercio: "posto", telefone: "(61) 94444-4444", email: "fernanda@posto.com" },
    { id: 7, nome: "Ricardo Alves", cidade: "Curitiba", estado: "PR", regiao: "Sul", comercio: "eletronicos", telefone: "(41) 93333-3333", email: "ricardo@eletronicos.com" },
    { id: 8, nome: "Juliana Ferreira", cidade: "Fortaleza", estado: "CE", regiao: "Nordeste", comercio: "conserto-celular", telefone: "(85) 92222-2222", email: "juli@conserto.com" },
    { id: 9, nome: "Marcos Pereira", cidade: "Recife", estado: "PE", regiao: "Nordeste", comercio: "vidracaria", telefone: "(81) 91111-1111", email: "marcos@vidros.com" },
    { id: 10, nome: "Patricia Mendes", cidade: "Manaus", estado: "AM", regiao: "Norte", comercio: "mecanico", telefone: "(92) 90000-0000", email: "patricia@oficina.com" },
    { id: 11, nome: "Roberto Dias", cidade: "Goiânia", estado: "GO", regiao: "Centro-Oeste", comercio: "diarista", telefone: "(62) 99999-8888", email: "roberto@limpeza.com" },
    { id: 12, nome: "Camila Rocha", cidade: "Florianópolis", estado: "SC", regiao: "Sul", comercio: "eletricista", telefone: "(48) 98888-7777", email: "camila@eletrica.com" }
];

// ✅ Mapeamento de duração dos planos em dias
const MAPA_PLANOS_DIAS = {
    'site mais adesão por 6 meses': 180,
    'criação de site mais um ano de adesão': 365,
    'Cadastro Simples': 30,
    'Cadastro Destaque': 180,
    'Cadastro Premium': 365
};

function calcularDiasRestantes(perfil) {
    if (!MAPA_PLANOS_DIAS[perfil.plano_escolhido]) {
        return Infinity; // Indica que não é um plano com duração definida (ex: site sem adesão)
    }
    const dataInicio = new Date(perfil.data_pagamento || perfil.created_at);
    const duracao = MAPA_PLANOS_DIAS[perfil.plano_escolhido];
    const dataFim = new Date(dataInicio);
    dataFim.setDate(dataFim.getDate() + duracao);
    const hoje = new Date();
    const diffTime = dataFim - hoje;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// ✅ Função auxiliar para validar formato de e-mail localmente
function validarEmailFormato(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ✅ Função para Reenviar E-mail de Confirmação
async function reenviarEmailConfirmacao(email) {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
            options: {
                emailRedirectTo: window.location.origin
            }
        });

        if (error) throw error;
        alert(`📧 Novo e-mail enviado!\n\nVerifique sua caixa de entrada (e a pasta de SPAM) para o endereço: ${email}`);
    } catch (err) {
        console.error('Erro ao reenviar:', err);
        alert('❌ Não foi possível reenviar o e-mail: ' + (err.message || 'Tente novamente em alguns minutos devido ao limite de envios do servidor.'));
    }
}

function preencherFormularioAfiliado(perfil) {
    if (!perfil) return;
    const mapeamento = {
        'afiliadoNome': perfil.nome_contato,
        'afiliadoEmpresa': perfil.nome_empresa,
        'afiliadoEmail': perfil.email_contato,
        'afiliadoTelefone': perfil.telefone,
        'afiliadoEstado': perfil.estado,
        'afiliadoLogradouro': perfil.logradouro,
        'afiliadoNumero': perfil.numero,
        'afiliadoBairro': perfil.bairro,
        'afiliadoComercio': perfil.tipo_servico,
        'afiliadoEmailComercial': perfil.email_comercial || perfil.email_contato || '', // ✅ Fallback: usa e-mail de contato se o comercial estiver vazio
        'afiliadoAreaAtendimento': perfil.area_cobertura_km ? String(perfil.area_cobertura_km) : '25', // ✅ Fallback: define 25km como padrão se estiver vazio
        'afiliadoEstilo': perfil.descricao_servico,
        'afiliadoUrlSite': perfil.url_site_existente,
        'afiliadoWhatsapp': perfil.whatsapp
    };

    Object.keys(mapeamento).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.value = mapeamento[id] || '';
            el.dispatchEvent(new Event('input')); // Dispara validação
        }
    });
    
    if (perfil.estado) {
        popularCidades(perfil.estado, 'afiliadoCidade').then(() => {
            const elCidade = document.getElementById('afiliadoCidade');
            if (elCidade) elCidade.value = perfil.cidade || '';
            if (elCidade) elCidade.dispatchEvent(new Event('input')); // ✅ Notifica a validação que a cidade foi preenchida
        });
    }
}

const produtosComSite = [
    { id: 1, imagem: 'Preço_01.png', nome: 'criação de site sem adesão', preco: 'R$ 2.499', descricao: 'Ideal para começar a divulgar seu serviço' },
    { id: 2, imagem: 'Preço_02.png', nome: 'site mais adesão por 6 meses', preco: 'R$ 2.699', descricao: 'Site completo + 6 meses de adesão' },
    { id: 3, imagem: 'Preço_03.png', nome: 'criação de site mais um ano de adesão', preco: 'R$ 2.899', descricao: 'Site completo + 1 ano de adesão' }
];

const produtosSemSite = [
    { id: 4, imagem: 'Preço_04.png', nome: 'Cadastro Simples', preco: 'R$ 59/mês', descricao: 'Teste por um mês' },
    { id: 5, imagem: 'Preço_05.png', nome: 'Cadastro Destaque', preco: 'R$ 199/mês', descricao: 'Plano de 6 meses.' },
    { id: 6, imagem: 'Preço_06.png', nome: 'Cadastro Premium', preco: 'R$ 399/mês', descricao: 'Plano de um ano. Melhor preço!' }
];

// ============ ESTADO GLOBAL ============
let afiliadosFiltrados = [...listaAfiliados];
let paginaAtual = 1;
const itensPorPagina = 8;
let planoAtual = 'com-site';
let produtoSelecionado = null;
let clienteLogado = false;
let afiliadoLogado = false;

// ✅ Carregar Estados do IBGE para a Cascata
async function popularEstados(selectId, cidadeSelectId) {
    const inputEstado = document.getElementById(selectId);
    const dataListEstado = document.querySelector(`datalist[id="${inputEstado?.getAttribute('list')}"]`);
    
    if (!inputEstado || !dataListEstado) return;

    try {
        const res = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
        const estados = await res.json();
        
        // Criar um mapa de Nome -> Sigla para facilitar a busca de cidades depois
        const mapaEstados = {};
        
        dataListEstado.innerHTML = '';
        estados.forEach(uf => {
            const option = document.createElement('option');
            option.value = uf.sigla; // Usamos a sigla como valor principal
            option.textContent = uf.nome;
            dataListEstado.appendChild(option);
            mapaEstados[uf.sigla] = uf.nome;
            mapaEstados[uf.nome.toLowerCase()] = uf.sigla;
        });
        
        // ✅ Alterado de 'change' para 'input' para disparar instantaneamente ao selecionar
        inputEstado.addEventListener('input', (e) => {
            const valor = e.target.value.trim().toUpperCase();
            
            // Se o que foi digitado/selecionado for uma sigla válida ou nome, buscamos as cidades
            const siglaValida = estados.find(uf => uf.sigla === valor || uf.nome.toUpperCase() === valor);
            
            if (siglaValida) {
                popularCidades(siglaValida.sigla, cidadeSelectId);
            } else {
                // ✅ Se o estado for limpo ou inválido, desabilita e limpa a cidade
                const inputCidade = document.getElementById(cidadeSelectId);
                if (inputCidade) {
                    inputCidade.value = '';
                    inputCidade.disabled = true;
                }
            }
        });
    } catch (e) { console.error('Erro ao carregar estados:', e); }
}

async function popularCidades(uf, selectId) {
    const inputCidade = document.getElementById(selectId);
    const dataListCidade = document.querySelector(`datalist[id="${inputCidade?.getAttribute('list')}"]`);
    
    if (!inputCidade || !dataListCidade || !uf) return;

    // ✅ Normalização: Se receber o nome por extenso, tenta converter para Sigla (apenas 2 letras)
    // Isso evita o erro 500 da API do IBGE
    let ufBusca = uf.trim();
    if (ufBusca.length > 2) {
        const inputEstado = document.getElementById(selectId.replace('Cidade', 'Estado'));
        const dataListEstado = document.querySelector(`datalist[id="${inputEstado?.getAttribute('list')}"]`);
        const opcao = Array.from(dataListEstado?.options || []).find(opt => opt.textContent.toLowerCase() === ufBusca.toLowerCase());
        if (opcao) ufBusca = opcao.value;
    }
    
    inputCidade.disabled = true;
    dataListCidade.innerHTML = '';

    try {
        const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufBusca}/municipios?orderBy=nome`);
        if (!res.ok) throw new Error('Erro na resposta do IBGE');
        const cidades = await res.json();
        
        if (!Array.isArray(cidades)) throw new Error('Resposta do IBGE não é uma lista');

        cidades.forEach(c => {
            const option = document.createElement('option');
            option.value = c.nome;
            dataListCidade.appendChild(option);
        });
        inputCidade.disabled = false;
    } catch (e) { console.error('Erro ao carregar cidades:', e); }
}

// ✅ Supabase - Acesso seguro ao cliente global
const getSupabase = () => (typeof window !== 'undefined' && window.supabaseClient) || null;

const SessionManager = (() => {
    let cachedUser = null;
    let lastFetch = 0;
    const CACHE_TTL = 5 * 60 * 1000;
    
    async function getUser(forceRefresh = false) {
        const now = Date.now();
        if (!forceRefresh && cachedUser && (now - lastFetch) < CACHE_TTL) {
            return cachedUser;
        }
        
        const supabase = getSupabase();
        if (!supabase) return null;
        
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error || !session?.user) {
                const { data: { user } } = await supabase.auth.getUser();
                cachedUser = user || null;
            } else {
                cachedUser = session.user;
            }
            lastFetch = now;
            return cachedUser;
        } catch (e) {
            console.warn('⚠️ [SessionManager] Erro:', e);
            return null;
        }
    }
    
    function setUser(user) { 
        cachedUser = user; 
        lastFetch = Date.now(); 
    }
    
    function clearCache() { 
        cachedUser = null; 
        lastFetch = 0; 
    }
    
    // ✅ NOVO: Obter usuário do cache sem chamada ao Supabase
    function getCachedUser() {
        return cachedUser;
    }
    
    return { getUser, setUser, clearCache, getCachedUser };
})();

// ============ FUNÇÕES DE UI E VALIDAÇÃO ============

function destacarErroTermos(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.classList.add('erro');
    const mensagemErro = container.querySelector('.termos-mensagem-erro');
    if (mensagemErro) mensagemErro.style.display = 'block';
    
    const checkbox = container.querySelector('input[type="checkbox"]');
    if (checkbox) {
        checkbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        checkbox.focus();
        checkbox.addEventListener('change', () => {
            container.classList.remove('erro');
            if (mensagemErro) mensagemErro.style.display = 'none';
        }, { once: true });
    }
    setTimeout(() => {
        container.classList.remove('erro');
        if (mensagemErro) mensagemErro.style.display = 'none';
    }, 5000);
}

async function emailConfirmado(user) {
    if (!user) return false;
    if (user.email_confirmed_at) return true;
    if (user.app_metadata?.email_verified === true) return true;
    if (user.user_metadata?.email_verified === true) return true;
    
    try {
        const supabase = getSupabase();
        if (supabase) {
            const { data: { user: freshUser } } = await supabase.auth.getUser();
            if (freshUser?.email_confirmed_at || freshUser?.app_metadata?.email_verified) {
                return true;
            }
        }
    } catch (e) {
        console.warn('Erro ao verificar confirmação:', e);
    }
    return false;
}

// ✅ Função para Upload de Imagens no Storage
async function uploadArquivosAfiliado(userId, inputId) {
    const supabase = getSupabase();
    const fileInput = document.getElementById(inputId);
    if (!supabase || !fileInput || !fileInput.files.length) return { logo: null, fotos: [] };

    const urls = [];
    const files = Array.from(fileInput.files);

    for (const file of files) {
        // Criar um nome de arquivo único para evitar sobrescrita
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `logos/${fileName}`;

        const { data, error } = await supabase.storage
            .from('afiliados')
            .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (error) {
            console.error(`Erro upload no arquivo ${file.name}:`, error.message);
            continue;
        }

        // Pegar a URL pública
        const { data: { publicUrl } } = supabase.storage.from('afiliados').getPublicUrl(filePath);
        urls.push(publicUrl);
    }

    // Retorna a primeira imagem como logo e o resto como array de fotos
    return { logo: urls[0] || null, fotos: urls };
}

// ============ FUNÇÃO: Atualizar Header com Status de Auth (NÃO-BLOQUEANTE) ============
function atualizarHeaderAuth() {
    const headerNaoLogado = document.getElementById('headerNaoLogado');
    const headerLogado = document.getElementById('headerLogado');
    const mensagemBoasVindas = document.getElementById('mensagemBoasVindas');
    
    // ✅ Verificar elementos do DOM
    if (!headerNaoLogado || !headerLogado) return;
    
    // ✅ 1. Verificar cache do SessionManager PRIMEIRO (síncrono - instantâneo)
    const cachedUser = SessionManager.getCachedUser?.();
    
    if (cachedUser) {
        // ✅ Usuário já em cache: atualizar UI IMEDIATAMENTE (sem await)
        if (cachedUser.user_metadata?.tipo === 'cliente') {
            garantirPerfilClienteCriado(cachedUser);
        }
        _renderHeaderUI(cachedUser, headerNaoLogado, headerLogado, mensagemBoasVindas);
        return; // ✅ Sai aqui - UI já atualizada
    }
    
    // ✅ 2. Se não tem cache, buscar do Supabase EM BACKGROUND (não bloqueia UI)
    const supabase = getSupabase();
    if (!supabase) {
        // Fallback: mostrar não-logado
        headerNaoLogado.style.display = 'flex';
        headerNaoLogado.classList.remove('oculto');
        headerLogado.style.display = 'none';
        headerLogado.classList.remove('ativo');
        return;
    }
    
    // ✅ Buscar usuário em background e atualizar UI quando pronto
    SessionManager.getUser().then(user => {
        if (user) {
            if (user.user_metadata?.tipo === 'cliente') {
                garantirPerfilClienteCriado(user);
            }
            _renderHeaderUI(user, headerNaoLogado, headerLogado, mensagemBoasVindas);
        } else {
            // Usuário não logado
            headerNaoLogado.style.display = 'flex';
            headerNaoLogado.classList.remove('oculto');
            headerLogado.style.display = 'none';
            headerLogado.classList.remove('ativo');
            clienteLogado = false;
            afiliadoLogado = false;
        }
    }).catch(err => {
        console.warn('Erro ao obter usuário para header:', err);
        // Fallback de emergência
        headerNaoLogado.style.display = 'flex';
        headerNaoLogado.classList.remove('oculto');
        headerLogado.style.display = 'none';
        headerLogado.classList.remove('ativo');
    });
    
    // ✅ Enquanto aguarda, manter estado atual (não pisca)
    // O header só muda quando a Promise resolver
}

// ✅ Nova função para garantir que o registro na tabela 'clientes' exista
async function garantirPerfilClienteCriado(user) {
    const supabase = getSupabase();
    if (!supabase || !user || user.user_metadata?.tipo !== 'cliente') return;

    try {
        // 1. Verifica se já existe na tabela
        const { data: perfilExistente, error: fetchError } = await supabase
            .from('clientes')
            .select('id')
            .eq('usuario_id', user.id)
            .maybeSingle();

        if (fetchError) throw fetchError;

        // 2. Se não existir, cria o registro usando os metadados salvos no Auth
        if (!perfilExistente && user.user_metadata) {
            const m = user.user_metadata;
            let coords = { lat: m.latitude, lng: m.longitude };

            // 📍 Fallback robusto caso as coordenadas não estejam no metadata
            if (!coords.lat || !coords.lng) {
                coords = await obterCoordenadasComFallback({
                    logradouro: m.logradouro,
                    numero: m.numero,
                    bairro: m.bairro,
                    cidade: m.cidade,
                    estado: m.estado
                });
            }

            // ✅ Usando UPSERT com onConflict para evitar o erro 409 de duplicidade
            const { data: novoPerfil, error: insertError } = await supabase.from('clientes').upsert({
                nome: m.nome || 'Usuário',
                email: user.email,
                estado: m.estado || '',
                cidade: m.cidade || '',
                logradouro: m.logradouro || '',
                numero: m.numero || '',
                bairro: m.bairro || '',
                latitude: coords?.lat ? Number(coords.lat) : null,
                longitude: coords?.lng ? Number(coords.lng) : null,
                usuario_id: user.id,
                ativo: true
            }, { 
                onConflict: 'usuario_id',
                ignoreDuplicates: false 
            }).select();

            if (insertError) {
                console.error('❌ Erro real do Banco de Dados:', insertError);
                // Se o erro for de geolocalização, podemos alertar ou apenas logar
                if (insertError.message.includes('geography')) {
                    alert('Aviso: Cadastro realizado, mas houve um erro no processamento da sua localização.');
                }
                throw insertError;
            }
            console.log('✅ Perfil do cliente e geolocalização persistidos com sucesso na tabela clientes.');
        }
    } catch (err) {
        console.error('❌ Erro na persistência de localização:', err.message);
    }
}

// ✅ Função auxiliar para renderizar UI do header (síncrona)
function _renderHeaderUI(user, headerNaoLogado, headerLogado, mensagemBoasVindas) {
    headerNaoLogado.style.display = 'none';
    headerNaoLogado.classList.add('oculto');
    headerLogado.style.display = 'flex';
    headerLogado.classList.add('ativo');
    
    if (mensagemBoasVindas) {
        const nome = user.user_metadata?.nome || 
                    user.user_metadata?.full_name || 
                    user.email?.split('@')[0] || 
                    'Usuário';
        mensagemBoasVindas.textContent = `Bem-vindo, ${nome}`;
    }
    
    clienteLogado = true;
    afiliadoLogado = user.user_metadata?.tipo === 'afiliado';
    
    // ✅ Verificar notificações para qualquer tipo de usuário (Cliente ou Afiliado)
    verificarNotificacoesUsuario(user);
}

async function verificarNotificacoesUsuario(user) {
    const container = document.getElementById('notificacaoAfiliado');
    if (!container) return;
    
    if (!user) {
        container.style.display = 'none';
        return;
    }

    const supabase = getSupabase();
    if (!supabase) return;

    const { data: perfil } = await supabase
        .from('afiliados')
        .select('data_pagamento, created_at, plano_escolhido')
        .eq('usuario_id', user.id)
        .maybeSingle();

    if (perfil) {
        const dias = calcularDiasRestantes(perfil);
        if (dias === Infinity) {
            // Não é um plano com adesão, então não há notificação de expiração
            container.style.display = 'none';
        } else if (dias <= 7) {
            container.textContent = `Sua adesão como afiliado termina em ${dias} dias, renove o contrato para permanecer na lista`;
            container.style.display = 'block';
        } else {
            container.style.display = 'none'; // Esconde se não estiver perto de expirar
        }
    }
}

// ============ NAVEGAÇÃO ============
function mostrarPagina(pagina) {
    const paginas = {
        'afiliados': 'paginaAfiliados',
        'seja-afiliado': 'paginaSejaAfiliado',
        'login-cliente': 'paginaLoginCliente',
        'cadastro-completo': 'paginaCadastroCompleto',
        'recuperar-senha': 'paginaRecuperarSenha',
        'atualizar-afiliado': 'paginaAtualizarAfiliado',
        'perfil-cliente': 'paginaPerfilCliente'
    };
    
    Object.values(paginas).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = 'none';
            el.classList.remove('ativa');
        }
    });
    
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    const seletor = document.getElementById('seletorPlanos');
    seletor.style.display = (pagina === 'seja-afiliado') ? 'block' : 'none';
    
    if (paginas[pagina]) {
        const el = document.getElementById(paginas[pagina]);
        if (el) {
            el.style.display = 'block';
            el.classList.add('ativa');
        }

        // ✅ Ao entrar na página de afiliados, já carrega o plano "Com Site" automaticamente
        if (pagina === 'seja-afiliado') {
            cancelarCadastroAfiliado();
            alternarPlano('com-site');
        }

        // ✅ Ao entrar no perfil, carrega os dados do banco
        if (pagina === 'perfil-cliente') {
            carregarDadosPerfilCliente();
        }
    }
    
    const links = document.querySelectorAll('.nav-link');
    if (pagina === 'afiliados' && links[0]) links[0].classList.add('active');
    if (pagina === 'atualizar-afiliado' && links[2]) links[2].classList.add('active');
    
    if (pagina === 'afiliados') {
        afiliadosFiltrados = [...listaAfiliados];
        carregarAfiliados();
    }
}

// ✅ Função para carregar dados do cliente na página de perfil
async function carregarDadosPerfilCliente() {
    const user = await SessionManager.getUser();
    if (!user) {
        mostrarPagina('login-cliente');
        return;
    }

    const supabase = getSupabase();
    const { data: perfil, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('usuario_id', user.id)
        .maybeSingle();

    if (error) {
        console.error('Erro ao carregar perfil:', error);
        return;
    }

    if (perfil) {
        document.getElementById('perfilNome').value = perfil.nome || '';
        document.getElementById('perfilEmail').value = perfil.email || '';
        document.getElementById('perfilLogradouro').value = perfil.logradouro || '';
        document.getElementById('perfilNumero').value = perfil.numero || '';
        document.getElementById('perfilBairro').value = perfil.bairro || '';
        document.getElementById('perfilEstado').value = perfil.estado || '';
        
        // Popular cidades baseado no estado carregado
        await popularCidades(perfil.estado, 'perfilCidade');
        document.getElementById('perfilCidade').value = perfil.cidade || '';
    }
}

// ✅ Listener para atualizar dados do cliente
async function configurarUpdatePerfil() {
    document.getElementById('formPerfilCliente')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const supabase = getSupabase();
        const user = await SessionManager.getUser(); // ✅ Obter o usuário mais recente
        const btn = document.getElementById('btnAtualizarPerfil');

        if (!supabase || !user) return;

        const novosDados = {
            nome: document.getElementById('perfilNome').value.trim(),
            logradouro: document.getElementById('perfilLogradouro').value.trim(),
            numero: document.getElementById('perfilNumero').value.trim(),
            bairro: document.getElementById('perfilBairro').value.trim(),
            estado: document.getElementById('perfilEstado').value.trim(),
            cidade: document.getElementById('perfilCidade').value.trim(),
            latitude: user.user_metadata?.latitude ? Number(user.user_metadata.latitude) : null,
            longitude: user.user_metadata?.longitude ? Number(user.user_metadata.longitude) : null
        };

        if (btn) { btn.disabled = true; btn.textContent = 'Salvando...'; }

        try {
            // Tentar geocodificar o novo endereço para manter a precisão do mapa
            const endereco = `${novosDados.logradouro}, ${novosDados.numero}, ${novosDados.bairro}, ${novosDados.cidade}, ${novosDados.estado}, Brasil`;
            const coords = await geocodificarEnderecoFull(endereco);
            if (coords) {
                novosDados.latitude = Number(coords.lat);
                novosDados.longitude = Number(coords.lng);
            }

            // 1. Atualizar a tabela 'clientes' no banco de dados
            // Isso dispara a trigger trg_sincronizar_localizacao_cliente que calcula a coluna 'localizacao'
            const { error: dbError } = await supabase
                .from('clientes')
                .update(novosDados)
                .eq('usuario_id', user.id);

            if (dbError) throw dbError;

            // 2. Atualizar os metadados do usuário no Auth para manter a sessão sincronizada
            // e evitar que a função "garantirPerfilClienteCriado" use dados obsoletos
            const { data: { user: updatedUser }, error: authError } = await supabase.auth.updateUser({
                data: {
                    nome: novosDados.nome,
                    logradouro: novosDados.logradouro,
                    numero: novosDados.numero,
                    bairro: novosDados.bairro,
                    estado: novosDados.estado,
                    cidade: novosDados.cidade,
                    latitude: novosDados.latitude,
                    longitude: novosDados.longitude
                }
            });

            if (authError) throw authError;

            // Atualizar cache local
            SessionManager.setUser(updatedUser);
            console.log('✅ Metadados do usuário atualizados no Auth:', updatedUser.user_metadata);

            alert('✅ Seus dados foram atualizados com sucesso!');
        } catch (err) {
            alert('❌ Erro ao atualizar: ' + err.message);
        } finally {
            if (btn) { btn.disabled = false; btn.textContent = 'Atualizar Meus Dados'; }
        }
    });
}

// ============ LISTA DE AFILIADOS ============
function carregarAfiliados() {
    const container = document.getElementById('listaAfiliados');
    if (!container) return;
    
    if (afiliadosFiltrados.length === 0 && !container.classList.contains('loading')) { // ✅ Adicionado verificação de loading
        container.innerHTML = '<div style="text-align:center; grid-column:1/-1; padding:40px;">Nenhum profissional encontrado.</div>';
        const paginacao = document.getElementById('paginacaoAfiliados');
        if (paginacao) paginacao.innerHTML = '';
        return;
    }

    // ✅ Lógica de Paginação: fatiar o array conforme a página atual
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const itensExibidos = afiliadosFiltrados.slice(inicio, fim);
    
    const emojis = {
        'pedreiro':'🧱','mercado':'🛒','barbeiro':'✂️','jardineiro':'🌿','marceneiro':'🪚',
        'posto':'⛽','eletronicos':'📱','conserto-celular':'🔧','vidracaria':'🪟',
        'mecanico':'🚗','diarista':'🧹','eletricista':'⚡','encanador':'🚰','pintor':'🎨'
    };
    const nomes = {
        'pedreiro':'Pedreiro','mercado':'Mercado','barbeiro':'Barbeiro','jardineiro':'Jardineiro',
        'marceneiro':'Marceneiro','posto':'Posto','eletronicos':'Eletrônicos','conserto-celular':'Conserto',
        'vidracaria':'Vidraçaria','mecanico':'Mecânico','diarista':'Diarista','eletricista':'Eletricista',
        'encanador':'Encanador','pintor':'Pintor'
    };
    
    container.innerHTML = itensExibidos.map(a => `
        <div class="product-card">
            <div class="card-content">
                <div style="font-size:28px; margin-bottom:2px;">${emojis[a.tipo_servico] || emojis[a.comercio] || '🏪'}</div>
                <h3>${a.nome_empresa || a.nome}</h3>
                
                <div class="card-info" style="text-align: center; margin: 2px 0;">
                    <p>${nomes[a.tipo_servico] || nomes[a.comercio] || 'Profissional'}</p>
                    ${a.distancia_km ? `<p>📍 ${a.distancia_km.toFixed(1)} km</p>` : ''}
                </div>
            </div>

            <div class="card-actions-grid">
                <!-- ✅ Apenas Site e WhatsApp são públicos. E-mail e Telefone são para uso interno. -->
                ${(a.url_site_existente && a.url_site_existente.trim() !== '') ? `
                    <button class="btn-primary btn-card" onclick="window.open('${a.url_site_existente}', '_blank')">
                        Ver Site
                    </button>
                ` : (a.whatsapp && a.whatsapp.trim() !== '') ? `
                    <button class="btn-primary btn-card" onclick="window.open('https://wa.me/${(a.whatsapp + '').replace(/\D/g,'')}', '_blank')">
                        WhatsApp
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');

    // ✅ Lógica para adicionar blocos invisíveis e manter a simetria
    const gridComputedStyle = window.getComputedStyle(container);
    const gridTemplateColumns = gridComputedStyle.getPropertyValue('grid-template-columns');
    // ✅ Garante que numColumns seja ao menos 1 para evitar erro de cálculo
    const numColumns = Math.max(1, gridTemplateColumns.split(' ').filter(v => v.includes('px') || v.includes('%') || v.includes('fr')).length || 4);

    const itensNaUltimaLinha = itensExibidos.length % numColumns;
    if (itensNaUltimaLinha !== 0) {
        const placeholdersParaAdicionar = numColumns - itensNaUltimaLinha;
        let placeholderHtml = '';
        for (let i = 0; i < placeholdersParaAdicionar; i++) {
            placeholderHtml += '<div class="product-card placeholder-card"></div>'; // ✅ Adiciona classe placeholder
        }
        container.innerHTML += placeholderHtml;
    }

    renderizarPaginacao();
}

function renderizarPaginacao() {
    const totalPaginas = Math.ceil(afiliadosFiltrados.length / itensPorPagina);
    const container = document.getElementById('paginacaoAfiliados');
    
    if (!container || totalPaginas <= 1) {
        if (container) container.innerHTML = '';
        return;
    }

    let html = '';
    for (let i = 1; i <= totalPaginas; i++) {
        const classeAtiva = (i === paginaAtual) ? 'active' : '';
        html += `<button class="btn-pagination ${classeAtiva}" onclick="irParaPagina(${i})">${i}</button>`;
    }
    container.innerHTML = html;
}

function irParaPagina(numero) {
    paginaAtual = numero;
    carregarAfiliados();
    // Scroll suave para o início da lista ao trocar de página
    const lista = document.getElementById('listaAfiliados');
    if (lista) {
        lista.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

async function filtrarAfiliados() {
    const estado = document.getElementById('filtroEstado')?.value || '';
    const cidade = document.getElementById('filtroCidade')?.value || '';
    const rua = document.getElementById('filtroRua')?.value || '';
    const numero = document.getElementById('filtroNumero')?.value || '';
    const comercio = document.getElementById('filtroComercio')?.value || '';
    
    const supabase = getSupabase();
    if (!supabase) return;

    // 1. Mostrar estado de carregamento
    const container = document.getElementById('listaAfiliados');
    if (container) {
        container.innerHTML = '<div style="text-align:center; grid-column:1/-1; padding:40px;">Buscando profissionais na sua região...</div>';
        container.classList.add('loading'); // ✅ Adiciona classe de loading
    }

    try {
        let resultados = [];

        // 2. Se houver endereço (pelo menos Cidade), tentamos a busca inteligente por PostGIS
        if (cidade) {
            const enderecoBusca = `${rua} ${numero}, ${cidade}, ${estado}, Brasil`;
            const coords = await geocodificarEnderecoFull(enderecoBusca);

            if (coords) {
                // Chama a função SQL buscar_afiliados_disponiveis via RPC
                const { data, error } = await supabase.rpc('buscar_afiliados_disponiveis', {
                    user_lat: coords.lat,
                    user_long: coords.lng
                });

                if (error) throw error;
                resultados = data || [];
                
                // Filtro adicional por tipo de comércio (caso selecionado)
                if (comercio) {
                    resultados = resultados.filter(a => a.tipo_servico === comercio);
                }
                
                // ✅ Filtro Público Estrito: Apenas ativos e com contato disponível
                resultados = resultados.filter(a => a.ativo === true);
                resultados = resultados.map(a => ({ ...a, nome: a.nome_empresa }));
            }
        } else {
            // 3. Fallback: Busca textual simples se o usuário não preencheu endereço completo
            let query = supabase.from('afiliados').select('*').eq('ativo', true);
            if (comercio) query = query.eq('tipo_servico', comercio);
            
            const { data, error } = await query;
            if (error) throw error;
            // ✅ Filtro Público Estrito: Apenas ativos
            resultados = (data || []).filter(a => a.ativo === true).map(a => ({ ...a, nome: a.nome_empresa }));
        }

        // 4. Refinamento de exibição: Somente quem o usuário pode contatar agora
        afiliadosFiltrados = resultados.filter(a => 
            (a.url_site_existente && a.url_site_existente.trim() !== '') || 
            (a.whatsapp && (a.whatsapp + '').trim() !== '')
        );

        paginaAtual = 1;
        carregarAfiliados();
        container.classList.remove('loading'); // ✅ Remove classe de loading

        // 4b. ✅ ATUALIZAR RECOMENDAÇÃO: Agora garante o reset se nada for encontrado
        atualizarRecomendacao(resultados.length > 0 ? resultados[0] : null);

        // 5. Scroll automático
        setTimeout(() => {
            const target = document.getElementById('listaAfiliados');
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);

        // 6. Atualizar Mapa se estiver visível
        if (document.getElementById('mapaContainer')?.style.display !== 'none') {
            carregarAfiliadosNoMapa({ estado, cidade, tipo_servico: comercio });
        }

    } catch (err) {
        console.error('❌ Erro na busca:', err);
        alert('Erro ao realizar busca. Tente novamente.');
    }
}

// ✅ Nova função para atualizar o card de recomendação dinamicamente
function atualizarRecomendacao(afiliado) {
    const containerRec = document.getElementById('cardRecomendado');
    if (!containerRec) return;

    if (!afiliado) {
        containerRec.innerHTML = '<p style="margin-top:20px; font-size:14px;">Busque um serviço para ver recomendações.</p>';
        return;
    }

    // Lógica de ícone
    const emojis = { 'pedreiro':'🧱','mercado':'🛒','barbeiro':'✂️','jardineiro':'🌿','marceneiro':'🪚' };
    const emoji = emojis[afiliado.tipo_servico] || '🏪';

    // Lógica de prioridade: apenas Site ou WhatsApp para o público
    let acaoBotao = '';
    let textoBotao = '';

    if (afiliado.url_site_existente && afiliado.url_site_existente.trim() !== '') { 
        acaoBotao = `window.open('${afiliado.url_site_existente}', '_blank')`; 
        textoBotao = 'Ver Site'; 
    }
    else if (afiliado.whatsapp && (afiliado.whatsapp + '').trim() !== '') { 
        acaoBotao = `window.open('https://wa.me/${(afiliado.whatsapp + '').replace(/\D/g,'')}', '_blank')`; 
        textoBotao = 'WhatsApp'; 
    }
    else { 
        textoBotao = 'Contato via Portal'; 
    }

    containerRec.innerHTML = `
        <div class="mini-card-rec">
            <div class="rec-icon">${emoji}</div>
            <h4>${afiliado.nome_empresa || afiliado.nome}</h4>
            <p>${afiliado.tipo_servico ? afiliado.tipo_servico.toUpperCase() : 'Profissional'}</p>
            ${afiliado.distancia_km ? `<span class="rec-distancia">a ${afiliado.distancia_km.toFixed(1)}km de você</span>` : ''}
            <button class="btn-contato-rec" onclick="${acaoBotao}" ${textoBotao === 'Contato via Portal' ? 'disabled style="opacity:0.6; cursor:not-allowed;"' : ''}>${textoBotao}</button>
        </div>
    `;
}

function limparFiltros() {
    ['filtroEstado','filtroCidade','filtroRegiao','filtroComercio'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const buscarArea = document.getElementById('buscarMinhaArea');
    if (buscarArea) buscarArea.checked = false;
    afiliadosFiltrados = [...listaAfiliados];
    carregarAfiliados();
}

function contatarAfiliado(nome, email) {
    alert(`Contate ${nome}:\n${email}\n\nCadastre-se para facilitar o contato!`);
}

// ============ GEOLOCALIZAÇÃO ============
async function toggleBuscaArea() {
    const checkbox = document.getElementById('buscarMinhaArea');
    const msgLogin = document.getElementById('msgLoginNecessario');
    
    if (!checkbox.checked) return;
    
    const sessao = await SessionManager.getUser();
    if (!sessao) {
        checkbox.checked = false;
        if (msgLogin) {
            msgLogin.style.display = 'block';
            setTimeout(() => msgLogin.style.display = 'none', 3000);
        }
        alert('Faça login para usar a busca na sua área');
        mostrarPagina('login-cliente');
        return;
    }
    
    if (!navigator.geolocation) {
        alert('Seu navegador não suporta geolocalização.');
        checkbox.checked = false;
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        async (posicao) => {
            const lat = posicao.coords.latitude;
            const lng = posicao.coords.longitude;
            const afiliadosProximos = await buscarAfiliadosPorRaio(lat, lng, 100);
            
            if (afiliadosProximos?.length > 0) {
                afiliadosFiltrados = afiliadosProximos;
                carregarAfiliados();
                if (document.getElementById('mapaContainer')?.style.display !== 'none') {
                    carregarAfiliadosNoMapa();
                }
                alert(`Encontramos ${afiliadosProximos.length} profissionais perto de você!`);
            } else {
                alert('Nenhum profissional encontrado num raio de 100km.');
                checkbox.checked = false;
            }
        },
        (erro) => {
            console.error('Erro na geolocalização:', erro);
            alert('Não foi possível obter sua localização. Verifique as permissões.');
            checkbox.checked = false;
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

// ============ PRODUTOS ============
function carregarProdutos() {
    const container = document.getElementById('produtosContainer');
    if (!container) return;
    
    const produtos = planoAtual === 'com-site' ? produtosComSite : produtosSemSite;
    
    container.innerHTML = produtos.map(p => `
        <div class="plan-card">
            <img src="${p.imagem}" alt="${p.nome}" onerror="this.src='placeholder.png'">
            <h3>${p.nome}</h3>
            <p style="color:#666; margin:10px 0;">${p.descricao}</p>
            <p class="preco">${p.preco}</p>
            <button class="btn-primary" onclick="escolherProduto('${p.nome}','${p.preco}')">Contratar</button>
        </div>
    `).join('');
}

function alternarPlano(tipo) {
    planoAtual = tipo;
    document.getElementById('btnComSite')?.classList.toggle('active', tipo==='com-site');
    document.getElementById('btnSemSite')?.classList.toggle('active', tipo==='sem-site');
    atualizarCamposConformePlano();
    carregarProdutos();
}

function atualizarCamposConformePlano() {
    const grupoDescricaoSite = document.getElementById('grupoDescricaoSite');
    const grupoUrlSite = document.getElementById('grupoUrlSite');
    
    if (planoAtual === 'com-site') {
        if (grupoDescricaoSite) grupoDescricaoSite.style.display = 'block';
        if (grupoUrlSite) grupoUrlSite.style.display = 'none';
    } else {
        if (grupoDescricaoSite) grupoDescricaoSite.style.display = 'none';
        if (grupoUrlSite) grupoUrlSite.style.display = 'block';
    }
}

// ============ FLUXO AFILIADO ============
function mostrarFormularioDadosAfiliado() {
    const authAfiliado = document.getElementById('authAfiliado');
    if (authAfiliado) authAfiliado.style.display = 'none';
    
    const form = document.getElementById('formCadastroAfiliado');
    if (form) {
        form.style.display = 'block';
        form.classList.add('ativa');
        atualizarCamposConformePlano();
        form.scrollIntoView({ behavior: 'smooth' });
    }
}

async function escolherProduto(nome, preco) {
    produtoSelecionado = { nome, preco };
    const produtoInfo = document.getElementById('produtoSelecionadoInfo');
    if (produtoInfo) produtoInfo.textContent = `Plano: ${nome} - ${preco}`;
    
    ['produtosContainer', 'seletorPlanos', 'tituloPlanos'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    
    const user = await SessionManager.getUser();
    
    if (user) {
        // Verificar se já é um afiliado antes de permitir novo cadastro
        const supabase = getSupabase();
        const { data: perfil } = await supabase.from('afiliados').select('*').eq('usuario_id', user.id).maybeSingle();
        
        if (perfil) {
            const diasAtuais = calcularDiasRestantes(perfil);
            const duracaoNova = MAPA_PLANOS_DIAS[nome];
            
            preencherFormularioAfiliado(perfil);
            const formTitle = document.querySelector('#formCadastroAfiliado .form-title');
            const btnSubmit = document.getElementById('btnEnviarAfiliado');

            if (!duracaoNova) {
                // Caso selecionou "criação de site sem adesão" (não estende plano)
                if (formTitle) formTitle.textContent = `Crie seu site conosco!`;
                if (btnSubmit) btnSubmit.textContent = 'prosseguir para pagamento';
            } else {
                // Caso selecionou um dos outros 5 planos (estende o período)
                const xAtuais = diasAtuais === Infinity ? "cadastro ativo" : `${diasAtuais} dias`;
                if (formTitle) formTitle.textContent = `Você já está cadastrado e ainda terá ${xAtuais} como afiliado. Continue para estender seu cadastro por mais ${duracaoNova} dias.`;
                if (btnSubmit) btnSubmit.textContent = 'Estender Plano e Atualizar';
            }
        } else {
            // Reset para novo cadastro
            const formTitle = document.querySelector('#formCadastroAfiliado .form-title');
            if (formTitle) formTitle.textContent = 'Complete seu cadastro';
            
            const btnSubmit = document.getElementById('btnEnviarAfiliado');
            if (btnSubmit) btnSubmit.textContent = 'Enviar e Ir para Pagamento';
        }

        const confirmado = await emailConfirmado(user);
        if (confirmado) {
            mostrarFormularioDadosAfiliado();
        } else {
            alert(`E-mail não confirmado!\n\nVerifique sua caixa de entrada em:\n${user.email}`);
            ['produtosContainer', 'seletorPlanos', 'tituloPlanos'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = (id === 'produtosContainer') ? 'grid' : 'block';
            });
            produtoSelecionado = null;
        }
    } else {
        alert('Para se cadastrar como afiliado, você precisa ter uma conta.');
        mostrarPagina('login-cliente');
    }
}

function cancelarCadastroAfiliado() {
    const form = document.getElementById('formCadastroAfiliado');
    if (form) {
        form.style.display = 'none';
        form.classList.remove('ativa');
    }
    
    ['produtosContainer', 'seletorPlanos', 'tituloPlanos'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = (id === 'produtosContainer') ? 'grid' : 'block';
    });
    
    produtoSelecionado = null;
}

// Validação em tempo real
function validarFormAfiliado() {
    const camposObrigatorios = [
        'afiliadoNome', 'afiliadoEmpresa', 'afiliadoEmail', 'afiliadoTelefone',
        'afiliadoEstado', 'afiliadoCidade', 'afiliadoLogradouro', 'afiliadoNumero',
        'afiliadoBairro', 'afiliadoComercio', 'afiliadoAreaAtendimento', 'afiliadoEmailComercial'
    ];
    
    const btn = document.getElementById('btnEnviarAfiliado');
    
    let camposFaltantes = [];
    const todosPreenchidos = camposObrigatorios.every(id => {
        const el = document.getElementById(id);
        const preenchido = el && el.value.trim() !== '';
        if (!preenchido) camposFaltantes.push(id);
        return preenchido;
    });

    if (btn) {
        // ✅ O botão agora habilita se os campos obrigatórios estiverem preenchidos.
        // O checkbox de termos NÃO bloqueia mais o clique (o alerta aparecerá ao clicar).
        const estadoFinal = !todosPreenchidos;

        if (btn.disabled !== estadoFinal) {
            if (estadoFinal) {
                console.warn('🛠️ Validação: Botão bloqueado. Campos obrigatórios vazios:', camposFaltantes);
                // ✅ Adiciona uma dica no botão para ajudar a identificar o que falta
                btn.title = "Campos obrigatórios faltando: " + camposFaltantes.join(', ');
            } else {
                console.log('🛠️ Validação: Todos os campos preenchidos. Botão liberado!');
                btn.title = "";
            }
        }
        // ✅ Garantimos que o botão esteja habilitado para o clique, mudando apenas a aparência
        btn.disabled = false;
        btn.style.opacity = estadoFinal ? "0.6" : "1";
    }
}

function validarFormCadastro() {
    const campos = ['cadNome','cadEmail','cadSenha','cadLogradouro','cadNumero', 'cadBairro', 'cadEstado','cadCidade'];
    const termos = document.getElementById('cadTermos')?.checked;
    const btn = document.getElementById('btnEnviarCadastro');
    const ok = campos.every(c => {
        const el = document.getElementById(c);
        return el && el.value.trim() !== '';
    }) && termos;
    if (btn) btn.disabled = !ok;
}

// ✅ Função para mostrar avisos rápidos (Toast)
function mostrarToast(mensagem, duracao = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast-mensagem';
    toast.textContent = mensagem;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, duracao);
}

// Modal de Termos
function mostrarTermos() { 
    const modal = document.getElementById('modalTermos');
    if (modal) modal.style.display = 'block'; 
}
function fecharModalTermos() { 
    const modal = document.getElementById('modalTermos');
    if (modal) modal.style.display = 'none'; 
}

// Alerta de Termos
function mostrarAlertaTermos() {
    const alerta = document.getElementById('alertaTermos');
    const overlay = document.getElementById('overlayAlerta');
    
    if (alerta && overlay) {
        alerta.classList.add('ativo');
        overlay.classList.add('ativo');
        
        const containerTermos = document.getElementById('containerAfiliadoTermos');
        if (containerTermos) {
            containerTermos.scrollIntoView({ behavior: 'smooth', block: 'center' });
            containerTermos.classList.add('erro');
            setTimeout(() => containerTermos.classList.remove('erro'), 3000);
        }
    }
}

function fecharAlertaTermos() {
    const alerta = document.getElementById('alertaTermos');
    const overlay = document.getElementById('overlayAlerta');
    
    if (alerta) alerta.classList.remove('ativo');
    if (overlay) overlay.classList.remove('ativo');
    
    const checkbox = document.getElementById('afiliadoTermos');
    if (checkbox) {
        checkbox.focus();
        checkbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// ============ EVENTOS ============
function configurarEventos() {
    document.getElementById('btnComSite')?.addEventListener('click', () => alternarPlano('com-site'));
    document.getElementById('btnSemSite')?.addEventListener('click', () => alternarPlano('sem-site'));
    
    const camposAfiliado = [
        'afiliadoNome', 'afiliadoEmpresa', 'afiliadoEmail', 'afiliadoTelefone', 'afiliadoWhatsapp',
        'afiliadoEstado', 'afiliadoCidade', 'afiliadoLogradouro', 'afiliadoNumero', 
        'afiliadoBairro', 'afiliadoComercio', 'afiliadoAreaAtendimento', 'afiliadoEmailComercial', 'afiliadoTermos'
    ];

    camposAfiliado.forEach(id => {
        document.getElementById(id)?.addEventListener('input', validarFormAfiliado);
        document.getElementById(id)?.addEventListener('change', validarFormAfiliado);
    });
    
    ['cadNome','cadEmail','cadSenha','cadLogradouro','cadNumero','cadBairro','cadEstado','cadCidade','cadTermos'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', validarFormCadastro);
        document.getElementById(id)?.addEventListener('change', validarFormCadastro);
    });

// === Submit do formulário de DADOS do afiliado ===
    document.getElementById('formAfiliado')?.addEventListener('submit', async function(e) {
        e.preventDefault();

        const btnSubmit = document.getElementById('btnEnviarAfiliado');
        const originalText = btnSubmit ? btnSubmit.textContent : '';

        // ✅ Evita cliques duplos se já estiver processando
        if (btnSubmit && btnSubmit.textContent === 'Processando...') {
            console.warn('⏳ Já existe um processamento em curso...');
            return;
        }

        // ✅ Validação manual ao clicar (UX melhorada)
        const camposObrigatorios = [
            'afiliadoNome', 'afiliadoEmpresa', 'afiliadoEmail', 'afiliadoTelefone',
            'afiliadoEstado', 'afiliadoCidade', 'afiliadoLogradouro', 'afiliadoNumero',
            'afiliadoBairro', 'afiliadoComercio', 'afiliadoAreaAtendimento', 'afiliadoEmailComercial'
        ];
        const camposFaltantes = camposObrigatorios.filter(id => !document.getElementById(id)?.value.trim());

        if (camposFaltantes.length > 0) {
            console.warn('⚠️ Tentativa de envio com campos vazios:', camposFaltantes);
            mostrarToast('⚠️ Todos os campos marcados com * devem ser preenchidos.');
            return;
        }

        console.log('🚀 Botão clicado! Iniciando processamento...');
        console.log('🔄 Verificando autenticação...');

        // ✅ Início do bloco de proteção total
        try {
            if (btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.textContent = 'Processando...';
            }
        
        const supabase = getSupabase();
        if (!supabase) {
            alert('⚠️ Conexão com servidor indisponível.');
            if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.textContent = originalText; }
            return;
        }
        
        // ✅ VALIDAÇÃO DE TERMOS
        const termosCheckbox = document.getElementById('afiliadoTermos');
        if (!termosCheckbox?.checked) {
            mostrarAlertaTermos();
            destacarErroTermos('containerAfiliadoTermos');
            if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.textContent = originalText; }
            return;
        }
        
        // ✅ VERIFICAÇÃO DE USUÁRIO LOGADO (USANDO SESSION MANAGER - ÚNICO PONTO)
        const user = await SessionManager.getUser();
        
        if (!user) {
            alert('🔐 Você precisa estar logado para continuar.');
            mostrarPagina('login-cliente');
            if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.textContent = originalText; }
            return;
        }

        console.log('✅ Usuário autenticado:', user.email);
        mostrarToast('📤 Enviando imagens...');
        
        const inputImagens = document.getElementById('afiliadoLogo');
        let resultadoUpload = { logo: null, fotos: [] };

        if (inputImagens && inputImagens.files.length > 0) {
            console.log('📸 Iniciando upload de %d imagens...', inputImagens.files.length);
            resultadoUpload = await uploadArquivosAfiliado(user.id, 'afiliadoLogo');
            console.log('✅ Resultado do upload:', resultadoUpload);
            if (!resultadoUpload.logo && inputImagens.files.length > 0) {
                if (!confirm('Falha ao carregar as imagens. Deseja continuar o cadastro sem fotos?')) {
                    if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.textContent = originalText; }
                    console.log('🛑 Cadastro cancelado pelo usuário devido a falha no upload.');
                    return;
                }
            }
        }

        // === COLETAR DADOS DO FORMULÁRIO ===
        const dadosAfiliado = {
            nome_contato: document.getElementById('afiliadoNome')?.value?.trim() || '',
            nome_empresa: document.getElementById('afiliadoEmpresa')?.value?.trim() || '',
            email_contato: document.getElementById('afiliadoEmail')?.value?.trim() || '', // Dado comum
            telefone: document.getElementById('afiliadoTelefone')?.value?.trim() || '',
            whatsapp: document.getElementById('afiliadoWhatsapp')?.value?.trim() || '',
            email_comercial: document.getElementById('afiliadoEmailComercial')?.value?.trim() || '',
            estado: document.getElementById('afiliadoEstado')?.value?.trim() || '',
            cidade: document.getElementById('afiliadoCidade')?.value?.trim() || '',
            logradouro: document.getElementById('afiliadoLogradouro')?.value?.trim() || '',
            numero: document.getElementById('afiliadoNumero')?.value?.trim() || '',
            bairro: document.getElementById('afiliadoBairro')?.value?.trim() || '',
            tipo_servico: document.getElementById('afiliadoComercio')?.value || '',
            plano_escolhido: produtoSelecionado?.nome || '',
            regiao: null,
            area_cobertura_km: (() => {
                const val = parseInt(document.getElementById('afiliadoAreaAtendimento')?.value);
                return [10, 25, 50, 100].includes(val) ? val : null;
            })(),
            descricao_servico: document.getElementById('afiliadoEstilo')?.value?.trim() || '',
            url_site_existente: document.getElementById('afiliadoUrlSite')?.value?.trim() || '',
            preco_plano: produtoSelecionado?.preco || '',
            // ✅ URLs vindas do Storage
            logo_url: resultadoUpload.logo,
            fotos_urls: resultadoUpload.fotos, 
            // ✅ usuario_id SEMPRE vem do SessionManager
            usuario_id: user.id,
            ativo: false,
            status_pagamento: 'pendente',
            data_pagamento: null,
            id_transacao_mercadopago: null
        };
        
        // Geocodificar com Fallback
        mostrarToast('📍 Localizando endereço...');
        const coords = await obterCoordenadasComFallback(dadosAfiliado);

        if (coords) {
            console.log('📍 Coordenadas encontradas:', coords);
            dadosAfiliado.latitude = coords.lat;
            dadosAfiliado.longitude = coords.lng;
        }
        else {
            console.error('📍 Falha total na geocodificação.');
            alert("⚠️ Não conseguimos localizar seu endereço automaticamente. Por favor, confira se o nome da cidade e bairro estão escritos corretamente.");
            if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.textContent = originalText; }
            return;
        }

            mostrarToast('💾 Salvando dados...');
            
            // ✅ UPSERT no Supabase (Atualiza se já existir, insere se for novo)
            // Usamos 'usuario_id' como critério de conflito para garantir 1 perfil por conta
            const { data: registroSalvo, error: insertError } = await supabase
                .from('afiliados')
                .upsert(dadosAfiliado, { 
                    onConflict: 'usuario_id',
                    ignoreDuplicates: false 
                })
                .select()
                .single();
            
            if (insertError) throw insertError;
            console.log('✅ Registro persistido:', registroSalvo?.id);
            
            mostrarToast('💳 Gerando pagamento...');
            
            const precoNumerico = parseFloat(dadosAfiliado.preco_plano.replace('R$', '').replace('.', '').replace(',', '.').trim());
            if (isNaN(precoNumerico) || precoNumerico <= 0) {
                throw new Error('Preço do plano inválido: ' + dadosAfiliado.preco_plano);
            }

            const payloadMP = {
                items: [{
                    title: dadosAfiliado.plano_escolhido,
                    unit_price: precoNumerico,
                    quantity: 1,
                    currency_id: 'BRL'
                }],
                payer: { email: dadosAfiliado.email_contato },
                external_reference: registroSalvo.id,
                back_urls: {
                    success: `${window.location.origin}/index.html`,
                    failure: `${window.location.origin}/index.html`,
                    pending: `${window.location.origin}/index.html`
                },
                auto_return: "approved"
            };

            console.log('📤 Enviando payload para Lambda:', payloadMP);

            // ✅ Corrigido: O endpoint deve coincidir com o nome do arquivo (stats_b.js)
            const response = await fetch('/.netlify/functions/stats_b', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payloadMP)
            });

            console.log('📥 Resposta do Servidor (Status):', response.status);
            
            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Erro desconhecido');
                if (response.status === 404) {
                    throw new Error(`A função "stats_b" não foi encontrada (404). Verifique se o arquivo está em netlify/functions/stats_b.js e se o deploy foi concluído.`);
                }
                console.error('❌ Detalhes do erro no servidor:', errorText);
                throw new Error(`Erro no servidor de pagamento (${response.status}): ${errorText}`);
            }

            const preference = await response.json();
            console.log('✅ Preferência MP criada:', preference);

            // ✅ CORREÇÃO: Usamos o init_point (que serve para teste e produção)
            // e forçamos o redirecionamento no nível superior (window.top)
            const checkoutUrl = preference.init_point;

            if (checkoutUrl) {
                console.log('🚀 Redirecionando para o Mercado Pago...');
                // window.top garante que sairemos de qualquer iframe de visualização (como o do Netlify ou VS Code)
                window.top.location.href = checkoutUrl;
            } else {
                throw new Error('Falha ao gerar link de pagamento.');
            }
            
        } catch (err) {
            console.error('❌ Erro no fluxo de pagamento:', err);
            
            if (err.code === '42501' || err.message?.includes('row-level security')) {
                alert('Erro de permissão (RLS):\n\n' + 
                    '1. Execute o SQL de limpeza e recriação de políticas\n' +
                    '2. Aguarde 30 segundos para o cache do PostgREST atualizar\n' +
                    '3. Tente novamente.');
            } else {
                alert('Erro: ' + err.message);
            }
        } finally {
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = originalText;
            }
        }
    });
    
    // === Login Cliente ===
    document.getElementById('formLogin')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const supabase = getSupabase();
        if (!supabase) { alert('Conexão indisponível.'); return; }
        
        const email = document.getElementById('loginEmail')?.value?.trim();
        const senha = document.getElementById('loginSenha')?.value;
        
        if (!email || !senha) { alert('Preencha e-mail e senha.'); return; }
        
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
            
            if (error) {
                if (error.message?.includes('Email not confirmed') || error.message?.includes('confirme')) {
                    const querReenviar = confirm('📧 E-mail ainda não confirmado!\n\nDeseja que enviemos um novo link de confirmação para sua caixa de entrada?');
                    if (querReenviar) {
                        await reenviarEmailConfirmacao(email);
                    }
                    return;
                }
                throw error;
            }
            
            const user = data?.user;
            
            if (user && !await emailConfirmado(user)) {
                alert('E-mail ainda não confirmado!\n\nVerifique sua caixa de entrada e clique no link de confirmação.');
                await supabase.auth.signOut();
                return;
            }
            
            // ✅ Atualizar cache e UI
            SessionManager.setUser(user);
            await atualizarHeaderAuth();
            clienteLogado = true;
            
            alert('✅ Login realizado!');
            mostrarPagina('afiliados');
            
        } catch (err) {
            console.error('❌ Erro no login:', err);
            if (err.message?.includes('Invalid login credentials')) {
                alert('E-mail ou senha incorretos. Verifique e tente novamente.');
            } else if (err.message?.includes('Email not confirmed')) {
                alert('Confirme seu e-mail antes de fazer login.');
            } else {
                alert('Erro: ' + err.message);
            }
        }
    });
    
    // === Cadastro Cliente (único ponto de cadastro) ===
    document.getElementById('formCadastroCompleto')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const supabase = getSupabase();
        const btn = document.getElementById('btnEnviarCadastro');
        const originalText = btn ? btn.textContent : 'Cadastrar';

        if (!supabase) { alert('Conexão indisponível.'); return; }
        
        // ✅ Limpa cache e sessão local para garantir uma tentativa limpa
        SessionManager.clearCache();
        await supabase.auth.signOut({ scope: 'local' });

        const dados = {
            nome: document.getElementById('cadNome')?.value?.trim() || '',
            email: document.getElementById('cadEmail')?.value?.trim() || '',
            logradouro: document.getElementById('cadLogradouro')?.value?.trim() || '',
            numero: document.getElementById('cadNumero')?.value?.trim() || '',
            bairro: document.getElementById('cadBairro')?.value?.trim() || '',
            estado: document.getElementById('cadEstado')?.value?.trim() || '',
            cidade: document.getElementById('cadCidade')?.value?.trim() || '',
            senha: document.getElementById('cadSenha')?.value || ''
        };
        
        if (!dados.nome || !dados.email || !dados.senha) { alert('Preencha nome, e-mail e senha.'); return; }
        
        // ✅ Validação local rigorosa antes de enviar ao servidor
        if (!validarEmailFormato(dados.email)) {
            alert('O formato do e-mail digitado parece incorreto. Verifique se não há espaços ou caracteres extras.');
            if (btn) { btn.disabled = false; btn.textContent = originalText; }
            return;
        }

        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Processando...';
        }

        try {
            // 📍 Usar a função de geocodificação com fallback para o cadastro inicial
            const coords = await obterCoordenadasComFallback({
                logradouro: dados.logradouro || '',
                numero: dados.numero,
                bairro: dados.bairro,
                cidade: dados.cidade || '',
                estado: dados.estado || ''
            });
            console.log('📍 Coordenadas obtidas para cadastro:', coords);

            // ✅ Criar conta no Supabase Auth
            const { data, error: authError } = await supabase.auth.signUp({
                email: dados.email, 
                password: dados.senha,
                options: { 
                    data: { 
                        tipo: 'cliente', // 🛡️ Distinção clara no Auth
                        nome: dados.nome,
                        logradouro: dados.logradouro,
                        numero: dados.numero,
                        bairro: dados.bairro,
                        estado: dados.estado,
                        cidade: dados.cidade,
                        // ✅ Garante persistência como Number nos metadados
                        latitude: coords?.lat ? Number(coords.lat) : null,
                        longitude: coords?.lng ? Number(coords.lng) : null
                    }
                }
            });
            
            if (authError) throw authError;
            
            const user = data?.user;
            alert(`Cadastro iniciado!\n\nVerifique sua caixa de entrada em:\n${dados.email}\n\nClique no link de confirmação para ativar sua conta.`);
            
            mostrarPagina('afiliados');
            
        } catch (err) {
            console.error('❌ Erro no cadastro:', err);
            const msg = err.message?.toLowerCase() || '';
            
            if (msg.includes('already registered') || err.status === 422) {
                const querReenviar = confirm('⚠️ Este e-mail já possui um cadastro pendente.\n\nDeseja reenviar o e-mail de confirmação agora?');
                if (querReenviar) {
                    await reenviarEmailConfirmacao(dados.email);
                }
                mostrarPagina('login-cliente');
            } else {
                alert('Erro: ' + (err.message || 'Erro desconhecido no servidor.'));
            }
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        }
    });
    
    // === Recuperar Senha ===
    document.getElementById('formRecuperar')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const supabase = getSupabase();
        if (!supabase) { alert('Conexão indisponível.'); return; }
        
        const email = document.getElementById('recEmail')?.value?.trim();
        if (!email) { alert('Informe seu e-mail.'); return; }
        
        try {
            await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/recuperar-senha'
            });
            alert('Instruções enviadas para: ' + email);
            mostrarPagina('login-cliente');
        } catch (err) {
            alert('Erro: ' + err.message);
        }
    });
    
    // === Atualizar Afiliado ===
    document.getElementById('formAtualizarAfiliado')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        alert('Dados atualizados com sucesso!');
        this.reset();
        mostrarPagina('afiliados');
    });
    
    // Uploads
    ['afiliadoLogo', 'atualizaLogo'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', function() {
            if (this.files?.length > 5) { alert('⚠️ Máximo de 5 imagens.'); this.value = ''; }
        });
    });
}

// ============ INICIALIZAÇÃO ============
document.addEventListener('DOMContentLoaded', function() { // ✅ Removido async
    // Inicializa cascatas para busca e para cadastro
    popularEstados('filtroEstado', 'filtroCidade');
    popularEstados('afiliadoEstado', 'afiliadoCidade');
    popularEstados('cadEstado', 'cadCidade'); // ✅ Adicionado para o cadastro de cliente
    popularEstados('perfilEstado', 'perfilCidade'); // ✅ Adicionado para a página de perfil
    
    document.querySelectorAll('.pagina-oculta, .form-oculta').forEach(el => {
        if (el) { el.style.display = 'none'; el.classList.remove('ativa'); }
    });
    
    // ✅ Atualizar header IMEDIATAMENTE (não-bloqueante)
    // Usa cache se disponível, ou busca em background
    atualizarHeaderAuth();
    
    const authAfiliado = document.getElementById('authAfiliado');
    if (authAfiliado) authAfiliado.style.display = 'none';
    
    mostrarPagina('afiliados');
    configurarEventos();
    configurarUpdatePerfil(); // ✅ Ativa o listener de atualização
    
    if (getSupabase() && window.location.hostname === 'localhost') {
        window.testarConexaoSupabase?.();
    }
    
    // ✅ Listener de auth state - NÃO usa await para não bloquear
    const supabase = getSupabase();
    if (supabase) {
        supabase.auth.onAuthStateChange((event, session) => { // ✅ Removido async
            console.log('🔔 [AUTH EVENT]', event, session?.user?.email);
            
            // ✅ Atualizar cache IMEDIATAMENTE (síncrono)
            if (event === 'SIGNED_IN') {
                SessionManager.setUser(session?.user);
                clienteLogado = true;
                afiliadoLogado = session?.user?.user_metadata?.tipo === 'afiliado';
            } else if (event === 'SIGNED_OUT') {
                SessionManager.clearCache();
                clienteLogado = false;
                afiliadoLogado = false;
            } else if (event === 'TOKEN_REFRESHED' && session?.user) {
                SessionManager.setUser(session.user);
            }
            
            // ✅ Atualizar UI IMEDIATAMENTE (não-bloqueante)
            if (document.getElementById('headerLogado') && document.getElementById('headerNaoLogado')) {
                atualizarHeaderAuth(); // ✅ Sem await
            }
        });
    }
});

// Fechar modal ao clicar fora
window.onclick = function(e) {
    const modal = document.getElementById('modalTermos');
    if (e.target === modal && modal) modal.style.display = 'none';
}

// Fechar alerta de termos ao clicar no overlay
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('overlayAlerta');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) fecharAlertaTermos();
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const alerta = document.getElementById('alertaTermos');
            if (alerta?.classList.contains('ativo')) fecharAlertaTermos();
        }
    });
});

// ============ FUNÇÕES AUXILIARES ============
async function logoutUsuario() {
    const supabase = getSupabase();
    
    if (!supabase) {
        alert('⚠️ Conexão indisponível.');
        return;
    }
    
    try {
        console.log('🔄 [LOGOUT] Iniciando...');
        
        // ✅ 1. Limpar cache ANTES do signOut
        SessionManager.clearCache();
        
        // ✅ 2. Executar signOut
        const { error } = await supabase.auth.signOut({ scope: 'local' });
        if (error) throw error;
        
        // ✅ 3. Atualizar UI imediatamente
        const headerNaoLogado = document.getElementById('headerNaoLogado');
        const headerLogado = document.getElementById('headerLogado');
        
        if (headerNaoLogado && headerLogado) {
            headerLogado.style.display = 'none';
            headerLogado.classList.remove('ativo');
            headerNaoLogado.style.display = 'flex';
            headerNaoLogado.classList.remove('oculto');
        }
        
        clienteLogado = false;
        afiliadoLogado = false;
        produtoSelecionado = null;
        
        alert('👋 Você saiu da sua conta.');
        
        // ✅ 4. Redirecionar com refresh limpo
        const baseUrl = window.location.origin + window.location.pathname;
        window.location.href = baseUrl;
        
        console.log('✅ [LOGOUT] Concluído');
        
    } catch (err) {
        console.error('❌ [LOGOUT] Erro:', err);
        SessionManager.clearCache();
        alert('⚠️ Erro ao sair: ' + err.message);
        window.location.reload();
    }
}

// ============ MAPAS ============
let mapa = null;
let marcadoresAfiliados = [];

function inicializarMapa() {
    if (mapa) return mapa;
    mapa = L.map('mapa').setView([-14.2350, -51.9253], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors', maxZoom: 18
    }).addTo(mapa);
    return mapa;
}

// ✅ Função de Geocodificação com Fallback para cidades do interior
async function obterCoordenadasComFallback(d) {
    if (!d.cidade || !d.estado) return null;

    // Tentativa 1: Endereço completo
    let query = `${d.logradouro || ''}, ${d.numero || ''}, ${d.bairro || ''}, ${d.cidade}, ${d.estado}, Brasil`;
    let res = await geocodificarEnderecoFull(query);
    if (res) return res;

    // Tentativa 2: Apenas Bairro, Cidade e Estado
    if (d.bairro) {
        console.warn("⚠️ Falha no endereço exato. Tentando Bairro...");
        query = `${d.bairro}, ${d.cidade}, ${d.estado}, Brasil`;
        res = await geocodificarEnderecoFull(query);
        if (res) return res;
    }

    // Tentativa 3: Apenas Cidade e Estado (Último recurso)
    console.warn("⚠️ Falha no bairro. Tentando apenas Cidade...");
    query = `${d.cidade}, ${d.estado}, Brasil`;
    res = await geocodificarEnderecoFull(query);
    
    if (!res) {
        console.error("❌ Geocodificação falhou completamente para:", d.cidade);
    }
    
    return res;
}

async function geocodificarEnderecoFull(endereco) {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco.trim())}&limit=1`);
        const dados = await res.json();
        if (dados?.[0]) {
            return { lat: parseFloat(dados[0].lat), lng: parseFloat(dados[0].lon) };
        }
        return null;
    } catch (e) { return null; }
}

// Mantido para compatibilidade legado, mas usa a nova lógica
async function geocodificarEndereco(cidade, estado) {
    return geocodificarEnderecoFull(`${cidade}, ${estado}, Brasil`);
}

async function carregarAfiliadosNoMapa(filtros = {}) {
    const supabase = getSupabase();
    if (!supabase) return;
    if (!mapa) inicializarMapa();
    
    marcadoresAfiliados.forEach(m => mapa?.removeLayer(m));
    marcadoresAfiliados = [];
    
    let query = supabase.from('afiliados').select('*').eq('ativo', true);
    if (filtros.estado) query = query.ilike('estado', `%${filtros.estado}%`);
    if (filtros.cidade) query = query.ilike('cidade', `%${filtros.cidade}%`);
    if (filtros.tipo_servico) query = query.eq('tipo_servico', filtros.tipo_servico);
    
    let { data: afiliados, error } = await query;
    if (error) { console.error('Map error:', error); return; }
    
    // ✅ Filtro Público para o Mapa: Apenas ativos e com contato
    afiliados = afiliados.filter(a => 
        a.ativo === true && (
        (a.url_site_existente && a.url_site_existente.trim() !== '') || 
        (a.whatsapp && (a.whatsapp + '').trim() !== ''))
    );

    for (const a of afiliados) {
        let lat = a.latitude, lng = a.longitude;
        if (!lat || !lng) {
            const coords = await geocodificarEndereco(a.cidade, a.estado);
            if (coords) {
                lat = coords.lat; lng = coords.lng;
                await supabase.from('afiliados').update({ latitude: lat, longitude: lng }).eq('id', a.id);
            }
        }
        if (lat && lng && mapa) {
            const icone = L.divIcon({
                className: 'custom-marker',
                html: `<div style="background:#720FE5;color:white;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid white;">📍</div>`,
                iconSize: [30,30], iconAnchor: [15,30]
            });
            const marcador = L.marker([lat, lng], { icon: icone }).addTo(mapa);
            const emojis = { 'pedreiro':'🧱','mercado':'🛒','barbeiro':'✂️','jardineiro':'🌿','marceneiro':'🪚','posto':'⛽','eletronicos':'📱','conserto-celular':'🔧','vidracaria':'🪟','mecanico':'🚗','diarista':'🧹','eletricista':'⚡' };
            
            let popupHtml = `
                <h4>${a.nome_empresa || 'Sem nome'}</h4>
                <p><strong>${emojis[a.tipo_servico] || '🏪'} ${a.tipo_servico || 'Serviço'}</strong></p>
                <p>📍 ${a.cidade || ''} - ${a.estado || ''}</p>
                <p>📏 Área: ${a.area_cobertura_km || 'N/A'} km</p>
            `;

            if (a.url_site_existente && a.url_site_existente.trim() !== '') {
                popupHtml += `<button onclick="window.open('${a.url_site_existente}', '_blank')" style="background:#720FE5;color:white;border:none;padding:5px 15px;border-radius:4px;cursor:pointer;margin-top:5px;width:100%;">Ver Site</button>`;
            } else if (a.whatsapp && (a.whatsapp + '').trim() !== '') {
                popupHtml += `<button onclick="window.open('https://wa.me/${(a.whatsapp + '').replace(/\D/g,'')}', '_blank')" style="background:#720FE5;color:white;border:none;padding:5px 15px;border-radius:4px;cursor:pointer;margin-top:5px;width:100%;">WhatsApp</button>`;
            } else {
                popupHtml += `<p style="font-size:12px; color:#666; margin-top:5px;">Contato via Administração.</p>`;
            }

            marcador.bindPopup(popupHtml);
            marcadoresAfiliados.push(marcador);
            if (a.area_cobertura_km) {
                L.circle([lat, lng], { color:'#720FE5', fillColor:'#720FE5', fillOpacity:0.1, radius: a.area_cobertura_km*1000 }).addTo(mapa);
            }
        }
    }
    
    if (marcadoresAfiliados.length > 0 && mapa) {
        mapa.fitBounds(new L.featureGroup(marcadoresAfiliados).getBounds().pad(0.1));
    }
}

function alternarVistaMapa() {
    const container = document.getElementById('mapaContainer');
    const btn = document.getElementById('btnAlternarMapa');
    const lista = document.getElementById('listaAfiliados');
    if (!container || !btn || !lista) return;
    
    if (container.style.display === 'none' || !container.style.display) {
        container.style.display = 'block';
        lista.style.display = 'none';
        btn.textContent = '📋 Ver como lista';
        carregarAfiliadosNoMapa({
            estado: document.getElementById('filtroEstado')?.value,
            cidade: document.getElementById('filtroCidade')?.value,
            tipo_servico: document.getElementById('filtroComercio')?.value
        });
        setTimeout(() => mapa?.invalidateSize(), 300);
    } else {
        container.style.display = 'none';
        lista.style.display = 'grid';
        btn.textContent = '🗺️ Ver no mapa';
    }
}

async function buscarAfiliadosPorRaio(lat, lng, raio) {
    const supabase = getSupabase();
    if (!supabase) return [];
    try {
        const { data, error } = await supabase.rpc('buscar_afiliados_disponiveis', { 
            user_lat: lat, 
            user_long: lng 
        });
        if (error) throw error;

        // ✅ Garante que a busca por geolocalização só retorne profissionais ativos
        return (data || []).filter(a => a.ativo === true).map(a => ({ ...a, nome: a.nome_empresa }));
    } catch (e) { console.error('Raio error:', e); return []; }
}