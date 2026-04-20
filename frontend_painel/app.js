'use strict';

// ═══════════════════════════════════════════════════════════
//  DADOS DOS CARGOS
// ═══════════════════════════════════════════════════════════

const CARGOS = [
  {
    id: 'admin_principal',
    label: 'Administrador Principal',
    nivel: 100,
    icone: '👑',
    cor: '#7c3aed',
    descricao: 'Acesso irrestrito ao sistema. Gerencia todas as lojas, usuários, operações financeiras e configurações.',
    responsabilidades: [
      { icone: '🏛️', titulo: 'Supervisão geral',         desc: 'Acesso e gestão de todas as lojas cadastradas no sistema.' },
      { icone: '👤', titulo: 'Gestão de usuários',       desc: 'Cria, ativa, bloqueia e configura contas de usuários.' },
      { icone: '📋', titulo: 'Aprovação de contratos',   desc: 'Aprova, rejeita e ativa contratos de qualquer loja.' },
      { icone: '💰', titulo: 'Controle financeiro',      desc: 'Autoriza reembolsos, gera cobranças e acompanha pagamentos.' },
      { icone: '🔍', titulo: 'Auditoria',                desc: 'Visualiza trilha de auditoria de todas as operações.' },
    ],
    funcionalidades: ['criar_contrato','enviar_contrato','decidir_contrato','ativar_contrato',
                      'criar_mensagem','criar_caso','criar_reembolso','aprovar_reembolso',
                      'pagar_reembolso','upload_arquivo','gerar_cobranca'],
  },
  {
    id: 'veneravel_mestre',
    label: 'Venerável Mestre',
    nivel: 90,
    icone: '⚒️',
    cor: '#b45309',
    descricao: 'Máxima autoridade da loja. Preside as sessões, aprova contratos, autoriza gastos e conduz as operações.',
    responsabilidades: [
      { icone: '🪑', titulo: 'Presidência da loja',     desc: 'Dirige as sessões e representa a loja institucionalmente.' },
      { icone: '📝', titulo: 'Gestão de contratos',     desc: 'Cria, envia para aprovação e ativa contratos da loja.' },
      { icone: '💸', titulo: 'Autorização financeira',  desc: 'Aprova reembolsos e gera cobranças para a loja.' },
      { icone: '📣', titulo: 'Comunicação oficial',     desc: 'Cria e monitora mensagens e casos operacionais.' },
    ],
    funcionalidades: ['criar_contrato','enviar_contrato','decidir_contrato','ativar_contrato',
                      'criar_mensagem','criar_caso','criar_reembolso','aprovar_reembolso',
                      'pagar_reembolso','upload_arquivo','gerar_cobranca'],
  },
  {
    id: 'primeiro_vigilante',
    label: '1º Vigilante',
    nivel: 80,
    icone: '🔦',
    cor: '#0369a1',
    descricao: 'Substitui o Venerável Mestre em sua ausência e coordena a coluna do Sul.',
    responsabilidades: [
      { icone: '🔦', titulo: 'Supervisão da coluna Sul', desc: 'Coordena os irmãos da coluna do Sul nas sessões.' },
      { icone: '🔄', titulo: 'Substituição do VM',       desc: 'Assume a presidência na ausência do Venerável Mestre.' },
      { icone: '📋', titulo: 'Decisão de contratos',     desc: 'Pode aprovar ou rejeitar contratos quando delegado.' },
    ],
    funcionalidades: ['decidir_contrato','criar_mensagem','criar_caso','criar_reembolso',
                      'aprovar_reembolso','upload_arquivo'],
  },
  {
    id: 'segundo_vigilante',
    label: '2º Vigilante',
    nivel: 70,
    icone: '🕯️',
    cor: '#0891b2',
    descricao: 'Coordena a coluna do Norte e auxilia o 1º Vigilante na gestão das sessões.',
    responsabilidades: [
      { icone: '🕯️', titulo: 'Supervisão da coluna Norte', desc: 'Coordena os irmãos da coluna do Norte nas sessões.' },
      { icone: '📩', titulo: 'Registro de ocorrências',    desc: 'Cria mensagens e abre casos operacionais.' },
      { icone: '📁', titulo: 'Gestão de arquivos',         desc: 'Envia e organiza documentos relacionados à loja.' },
    ],
    funcionalidades: ['criar_mensagem','criar_caso','upload_arquivo'],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    nivel: 60,
    icone: '💼',
    cor: '#059669',
    descricao: 'Responsável pelo controle financeiro da loja: reembolsos, cobranças e pagamentos.',
    responsabilidades: [
      { icone: '💰', titulo: 'Gestão de reembolsos',  desc: 'Cria, aprova e registra pagamento de reembolsos.' },
      { icone: '🧾', titulo: 'Emissão de cobranças',  desc: 'Gera cobranças vinculadas a contratos da loja.' },
      { icone: '📊', titulo: 'Controle de caixa',     desc: 'Acompanha entradas e saídas financeiras da loja.' },
      { icone: '📁', titulo: 'Documentação fiscal',   desc: 'Envia comprovantes e documentos financeiros.' },
    ],
    funcionalidades: ['criar_mensagem','criar_caso','criar_reembolso','aprovar_reembolso',
                      'pagar_reembolso','upload_arquivo','gerar_cobranca'],
  },
  {
    id: 'secretario',
    label: 'Secretário',
    nivel: 60,
    icone: '📜',
    cor: '#d97706',
    descricao: 'Registra atas, cuida da correspondência oficial e administra os contratos da loja.',
    responsabilidades: [
      { icone: '📜', titulo: 'Registro de atas',      desc: 'Documenta as sessões e deliberações da loja.' },
      { icone: '✉️', titulo: 'Correspondência',       desc: 'Gerencia mensagens e comunicações oficiais.' },
      { icone: '📋', titulo: 'Gestão de contratos',   desc: 'Cria e submete contratos para aprovação.' },
      { icone: '📁', titulo: 'Arquivo da loja',       desc: 'Organiza e mantém os documentos oficiais.' },
    ],
    funcionalidades: ['criar_contrato','enviar_contrato','criar_mensagem','criar_caso',
                      'criar_reembolso','upload_arquivo'],
  },
  {
    id: 'chanceler',
    label: 'Chanceler',
    nivel: 60,
    icone: '🖋️',
    cor: '#9333ea',
    descricao: 'Cuida do cerimonial, do protocolo e da comunicação formal entre lojas.',
    responsabilidades: [
      { icone: '🖋️', titulo: 'Cerimonial',         desc: 'Conduz o protocolo e o cerimonial das sessões.' },
      { icone: '🤝', titulo: 'Relações externas',  desc: 'Intermediação com outras lojas e entidades.' },
      { icone: '📝', titulo: 'Comunicados formais',desc: 'Elabora e assina correspondências oficiais.' },
    ],
    funcionalidades: ['criar_mensagem','upload_arquivo'],
  },
  {
    id: 'arquiteto',
    label: 'Arquiteto',
    nivel: 60,
    icone: '📐',
    cor: '#475569',
    descricao: 'Responsável pelo projeto e manutenção do templo e dos recursos físicos da loja.',
    responsabilidades: [
      { icone: '📐', titulo: 'Gestão do templo',    desc: 'Supervisiona obras, reparos e melhorias no templo.' },
      { icone: '🔧', titulo: 'Manutenção',          desc: 'Coordena serviços de manutenção dos recursos físicos.' },
      { icone: '📁', titulo: 'Documentação técnica',desc: 'Mantém projetos, plantas e laudos arquivados.' },
    ],
    funcionalidades: ['upload_arquivo'],
  },
  {
    id: 'almoxarife',
    label: 'Almoxarife',
    nivel: 60,
    icone: '📦',
    cor: '#b45309',
    descricao: 'Controla o estoque, os materiais e os equipamentos da loja.',
    responsabilidades: [
      { icone: '📦', titulo: 'Controle de estoque',  desc: 'Gerencia entradas e saídas de materiais da loja.' },
      { icone: '🛒', titulo: 'Compras',              desc: 'Solicita e registra aquisição de materiais.' },
      { icone: '📋', titulo: 'Inventário',           desc: 'Mantém inventário atualizado de bens da loja.' },
    ],
    funcionalidades: ['upload_arquivo'],
  },
  {
    id: 'irmao_operacional',
    label: 'Irmão Operacional',
    nivel: 10,
    icone: '🔵',
    cor: '#64748b',
    descricao: 'Membro ativo com acesso básico ao sistema para consulta e participação nas atividades da loja.',
    responsabilidades: [
      { icone: '🔵', titulo: 'Participação nas sessões', desc: 'Presença e participação ativa nas sessões da loja.' },
      { icone: '👁️', titulo: 'Consulta de informações',  desc: 'Visualiza comunicados e avisos da loja.' },
    ],
    funcionalidades: [],
  },
];

// ═══════════════════════════════════════════════════════════
//  MAPA DE FUNCIONALIDADES
// ═══════════════════════════════════════════════════════════

const FUNCIONALIDADES = {
  criar_contrato: {
    icone: '📋', titulo: 'Criar Contrato',
    desc: 'Registra um novo contrato de uso de recursos (templo/sala) para a loja, definindo datas, horários e regra de recorrência.',
    quem: 'admin_principal, veneravel_mestre, secretario',
    cor: '#2563eb',
    campos: [
      { id: 'f_loja',     label: 'Número da Loja',   tipo: 'number', valor: '1' },
      { id: 'f_templo',   label: 'Número do Templo', tipo: 'number', valor: '1' },
      { id: 'f_regra',    label: 'Regra de Recorrência', tipo: 'text', valor: 'primeira segunda' },
      { id: 'f_inicio',   label: 'Hora de Início', tipo: 'text', valor: '20:00' },
      { id: 'f_fim',      label: 'Hora de Fim',    tipo: 'text', valor: '22:00' },
      { id: 'f_vig_ini',  label: 'Data de Início', tipo: 'text', valor: '2026-04-01' },
      { id: 'f_vig_fim',  label: 'Data de Fim',    tipo: 'text', valor: '2026-12-31' },
    ],
    acao: async (campos) => {
      const r = await api('POST', '/contratos', {
        loja_id: +campos.f_loja, recurso_id: +campos.f_templo,
        regra_recorrencia: campos.f_regra,
        hora_inicio_sessao: campos.f_inicio, hora_fim_sessao: campos.f_fim,
        vigencia_inicio: campos.f_vig_ini, vigencia_fim: campos.f_vig_fim,
      });
      return r;
    },
  },
  enviar_contrato: {
    icone: '📤', titulo: 'Enviar para Aprovação',
    desc: 'Submete um contrato já criado para a análise e aprovação dos responsáveis.',
    quem: 'admin_principal, veneravel_mestre, secretario',
    cor: '#0891b2',
    campos: [
      { id: 'f_contrato_id', label: 'ID do Contrato', tipo: 'number', valor: '' },
    ],
    acao: async (c) => api('POST', `/contratos/${c.f_contrato_id}/enviar`),
  },
  decidir_contrato: {
    icone: '✅', titulo: 'Aprovar / Rejeitar Contrato',
    desc: 'Analisa um contrato enviado e toma a decisão de aprovação ou rejeição.',
    quem: 'admin_principal, veneravel_mestre, 1º vigilante',
    cor: '#059669',
    campos: [
      { id: 'f_contrato_id', label: 'ID do Contrato',  tipo: 'number', valor: '' },
      { id: 'f_decisao',     label: 'Decisão (aprovado/recusado)', tipo: 'text', valor: 'aprovado' },
      { id: 'f_obs',         label: 'Observação',      tipo: 'text',   valor: '' },
    ],
    acao: async (c) => api('POST', `/contratos/${c.f_contrato_id}/decidir`, { decisao: c.f_decisao, observacao: c.f_obs || null }),
  },
  ativar_contrato: {
    icone: '🟢', titulo: 'Ativar Contrato',
    desc: 'Coloca um contrato aprovado em vigor, permitindo o uso do recurso.',
    quem: 'admin_principal, veneravel_mestre',
    cor: '#059669',
    campos: [
      { id: 'f_contrato_id', label: 'ID do Contrato', tipo: 'number', valor: '' },
    ],
    acao: async (c) => api('POST', `/contratos/${c.f_contrato_id}/ativar`),
  },
  criar_mensagem: {
    icone: '✉️', titulo: 'Criar Mensagem',
    desc: 'Registra uma nova mensagem ou comunicado no sistema, podendo estar vinculada a um contexto específico.',
    quem: 'admin, veneravel, 1º/2º vigilante, secretário, financeiro',
    cor: '#7c3aed',
    campos: [
      { id: 'f_loja',     label: 'ID da Loja',   tipo: 'number', valor: '1' },
      { id: 'f_tipo',     label: 'Tipo',         tipo: 'text',   valor: 'texto' },
      { id: 'f_contexto', label: 'Contexto',     tipo: 'text',   valor: 'geral' },
      { id: 'f_conteudo', label: 'Conteúdo',     tipo: 'text',   valor: '' },
    ],
    acao: async (c) => api('POST', '/mensagens', {
      loja_id: +c.f_loja, tipo: c.f_tipo, contexto: c.f_contexto, conteudo: c.f_conteudo,
    }),
  },
  criar_caso: {
    icone: '📂', titulo: 'Abrir Caso Operacional',
    desc: 'Cria um caso operacional a partir de mensagens existentes, registrando ocorrências para acompanhamento.',
    quem: 'admin, veneravel, 1º/2º vigilante, secretário, financeiro',
    cor: '#d97706',
    campos: [
      { id: 'f_loja',  label: 'ID da Loja',     tipo: 'number', valor: '1' },
      { id: 'f_tipo',  label: 'Tipo do Caso',   tipo: 'text',   valor: 'operacional' },
      { id: 'f_titulo',label: 'Título do Caso', tipo: 'text',   valor: '' },
      { id: 'f_msgs',  label: 'IDs de Mensagens (vírgula)', tipo: 'text', valor: '' },
    ],
    acao: async (c) => api('POST', '/casos', {
      loja_id: +c.f_loja, tipo_caso: c.f_tipo, titulo: c.f_titulo,
      mensagem_ids: c.f_msgs.split(',').map(s => +s.trim()).filter(Boolean),
    }),
  },
  criar_reembolso: {
    icone: '💸', titulo: 'Solicitar Reembolso',
    desc: 'Abre uma solicitação de reembolso vinculada a um caso operacional.',
    quem: 'admin, veneravel, 1º vigilante, financeiro, secretário',
    cor: '#059669',
    campos: [
      { id: 'f_caso',      label: 'ID do Caso',       tipo: 'number', valor: '' },
      { id: 'f_categoria', label: 'Categoria',         tipo: 'text',   valor: 'agape' },
      { id: 'f_valor',     label: 'Valor Solicitado',  tipo: 'text',   valor: '0.00' },
      { id: 'f_irmao',     label: 'ID do Irmão',       tipo: 'number', valor: '' },
    ],
    acao: async (c) => api('POST', '/reembolsos', {
      caso_id: +c.f_caso, categoria: c.f_categoria,
      valor_solicitado: c.f_valor, irmao_id: c.f_irmao ? +c.f_irmao : null,
    }),
  },
  aprovar_reembolso: {
    icone: '✔️', titulo: 'Aprovar / Rejeitar Reembolso',
    desc: 'Analisa uma solicitação de reembolso e decide se será aprovada ou rejeitada.',
    quem: 'admin, veneravel, 1º vigilante, financeiro',
    cor: '#059669',
    campos: [
      { id: 'f_reemb',  label: 'ID do Reembolso',           tipo: 'number', valor: '' },
      { id: 'f_dec',    label: 'Decisão (aprovado/rejeitado)', tipo: 'text', valor: 'aprovado' },
      { id: 'f_valor',  label: 'Valor Aprovado',             tipo: 'text',   valor: '' },
      { id: 'f_obs',    label: 'Observação',                 tipo: 'text',   valor: '' },
    ],
    acao: async (c) => api('POST', '/aprovacoes', {
      entidade_tipo: 'reembolso', entidade_id: +c.f_reemb,
      decisao: c.f_dec, valor: c.f_valor || null, observacao: c.f_obs || null,
    }),
  },
  pagar_reembolso: {
    icone: '💳', titulo: 'Marcar como Pago',
    desc: 'Confirma o pagamento de um reembolso aprovado e registra o valor efetivamente pago.',
    quem: 'admin_principal, veneravel_mestre, financeiro',
    cor: '#059669',
    campos: [
      { id: 'f_reemb',  label: 'ID do Reembolso', tipo: 'number', valor: '' },
      { id: 'f_valor',  label: 'Valor Pago',       tipo: 'text',   valor: '' },
      { id: 'f_obs',    label: 'Observação',        tipo: 'text',   valor: '' },
    ],
    acao: async (c) => api('POST', `/reembolsos/${c.f_reemb}/pagar`, {
      valor_aprovado: c.f_valor || null, observacao_financeiro: c.f_obs || null,
    }),
  },
  upload_arquivo: {
    icone: '📁', titulo: 'Enviar Arquivo',
    desc: 'Faz o upload de documentos e comprovantes, gerando hash SHA-256 para garantir integridade.',
    quem: 'admin, veneravel, 1º/2º vigilante, secretário, financeiro',
    cor: '#475569',
    campos: [
      { id: 'f_loja',     label: 'ID da Loja',     tipo: 'number', valor: '1' },
      { id: 'f_nome',     label: 'Nome do Arquivo', tipo: 'text',   valor: '' },
      { id: 'f_tipo',     label: 'Tipo MIME',       tipo: 'text',   valor: 'application/pdf' },
      { id: 'f_tamanho',  label: 'Tamanho (bytes)', tipo: 'number', valor: '0' },
    ],
    acao: async (c) => api('POST', '/arquivos', {
      loja_id: +c.f_loja, nome_original: c.f_nome,
      mime_type: c.f_tipo, tamanho_bytes: +c.f_tamanho,
    }),
  },
  gerar_cobranca: {
    icone: '🧾', titulo: 'Gerar Cobrança',
    desc: 'Emite uma cobrança vinculada a um contrato ativo, com competência e data de vencimento.',
    quem: 'admin_principal, veneravel_mestre, financeiro',
    cor: '#b45309',
    campos: [
      { id: 'f_contrato', label: 'ID do Contrato',    tipo: 'number', valor: '' },
      { id: 'f_comp',     label: 'Competência (YYYY-MM)', tipo: 'text', valor: '' },
      { id: 'f_valor',    label: 'Valor (R$)',         tipo: 'text',   valor: '' },
      { id: 'f_venc',     label: 'Vencimento (YYYY-MM-DD)', tipo: 'text', valor: '' },
    ],
    acao: async (c) => api('POST', `/contratos/${c.f_contrato}/cobrancas`, {
      competencia: c.f_comp, valor: c.f_valor, data_vencimento: c.f_venc,
    }),
  },
};

// ═══════════════════════════════════════════════════════════
//  ESTADO
// ═══════════════════════════════════════════════════════════

let state = { token: null, usuario: null, cargoAtivo: null };

function apiBase() {
  const custom = document.getElementById('apiUrl')?.value?.trim();
  if (custom) return custom.replace(/\/$/, '');
  // When served from the same Railway host, use relative origin
  return window.location.origin.replace(/\/$/, '');
}

async function api(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (state.token) opts.headers['Authorization'] = 'Basic ' + state.token;
  if (body)        opts.body = JSON.stringify(body);
  const res = await fetch(apiBase() + path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.detail || 'Erro na API'), { data });
  return data;
}

// ═══════════════════════════════════════════════════════════
//  AUTENTICAÇÃO E CADASTRO
// ═══════════════════════════════════════════════════════════

function abrirCadastro() {
  document.getElementById('modalCadastroOverlay').classList.add('open');
}
function fecharCadastro() {
  document.getElementById('modalCadastroOverlay').classList.remove('open');
  document.getElementById('cadastroForm').style.display      = 'block';
  document.getElementById('cadastroConfirmado').style.display = 'none';
  document.getElementById('cadastroMsg').style.display = 'none';
  ['reg_nome','reg_usuario','reg_email','reg_senha','reg_confirma'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
}

async function registrar() {
  const nome     = document.getElementById('reg_nome').value.trim();
  const usuario  = document.getElementById('reg_usuario').value.trim();
  const email    = document.getElementById('reg_email').value.trim();
  const senha    = document.getElementById('reg_senha').value;
  const confirma = document.getElementById('reg_confirma').value;
  const msg      = document.getElementById('cadastroMsg');
  const btn      = document.getElementById('cadastroBtn');

  msg.style.display = 'block';
  msg.className = 'modal-result';

  if (!nome || !usuario || !email || !senha) {
    msg.className = 'modal-result error'; msg.textContent = 'Preencha todos os campos.'; return;
  }
  if (senha !== confirma) {
    msg.className = 'modal-result error'; msg.textContent = 'As senhas não coincidem.'; return;
  }
  if (senha.length < 8) {
    msg.className = 'modal-result error'; msg.textContent = 'A senha deve ter ao menos 8 caracteres.'; return;
  }

  btn.disabled = true; btn.textContent = 'Aguarde…';
  msg.textContent = 'Criando conta…';

  try {
    await api('POST', '/registrar', { nome, nome_usuario: usuario, email, senha });
    document.getElementById('cadastroEmailEnviado').textContent = email;
    document.getElementById('cadastroForm').style.display       = 'none';
    document.getElementById('cadastroConfirmado').style.display = 'block';
  } catch (e) {
    msg.className = 'modal-result error';
    msg.textContent = e.message || 'Erro ao criar conta.';
  } finally {
    btn.disabled = false; btn.textContent = 'Criar conta';
  }
}

async function login() {
  const email = document.getElementById('email').value.trim();
  const pass  = document.getElementById('password').value;
  const msg   = document.getElementById('loginMsg');

  if (!email || !pass) { msg.textContent = 'Preencha e-mail e senha.'; return; }

  state.token = btoa(email + ':' + pass);
  msg.textContent = 'Conectando…';

  try {
    const me = await api('GET', '/auth/me');
    state.usuario = me;
    renderAutenticado(me);
    msg.textContent = '';
  } catch (e) {
    state.token = null;
    msg.textContent = e.message || 'Credenciais inválidas.';
  }
}

function mostrarView(id) {
  ['preLoginView','homeView','cargoView','irmaoView','comprasView','rateioView',
   'relatoriosView','permissoesView','comissoesView','repositorioView'].forEach(v => {
    const el = document.getElementById(v);
    if (el) el.style.display = v === id ? 'block' : 'none';
  });
}

function logout() {
  state = { token: null, usuario: null, cargoAtivo: null };
  document.getElementById('blocoUsuario').style.display = 'none';
  document.getElementById('formLogin').style.display    = 'block';
  document.getElementById('cargoSection').style.display = 'none';
  document.getElementById('email').value    = '';
  document.getElementById('password').value = '';
  document.getElementById('loginMsg').textContent = '';
  mostrarView('preLoginView');
  atualizarNavAtivo();
}

function renderAutenticado(me) {
  document.getElementById('formLogin').style.display    = 'none';
  document.getElementById('blocoUsuario').style.display = 'block';
  document.getElementById('cargoSection').style.display = 'block';
  document.getElementById('userName').textContent       = me.nome || me.email;
  const cargo = CARGOS.find(c => c.id === me.cargo) || { label: me.cargo };
  document.getElementById('userCargoLabel').textContent = cargo.label;
  const ini = (me.nome || me.email || '?')[0].toUpperCase();
  document.getElementById('userAvatar').textContent = ini;
  mostrarView('homeView');
  atualizarNavAtivo();
}

// ═══════════════════════════════════════════════════════════
//  NAVEGAÇÃO E RENDER
// ═══════════════════════════════════════════════════════════

function renderSidebar() {
  // Módulos
  const modNav = document.getElementById('modulosNav');
  modNav.innerHTML = `
    <div class="sidebar-nav-module" id="nav-cadastro_irmao" onclick="abrirModulo('cadastro_irmao')">
      <span style="font-size:15px">👥</span><span>Cadastro de Irmãos</span>
    </div>
    <div class="sidebar-nav-module" id="nav-boletos" onclick="abrirModulo('boletos')">
      <span style="font-size:15px">📄</span><span>Boletos</span>
    </div>
    <div class="sidebar-nav-module" id="nav-aniversarios" onclick="abrirModulo('aniversarios')">
      <span style="font-size:15px">🎂</span><span>Aniversários</span>
    </div>
    <div class="sidebar-nav-module" id="nav-agenda" onclick="abrirModulo('agenda')">
      <span style="font-size:15px">📅</span><span>Agenda</span>
    </div>
    <div class="sidebar-nav-module" id="nav-compras" onclick="abrirModulo('compras')">
      <span style="font-size:15px">🧾</span><span>Compras / Reembolsos</span>
    </div>
    <div class="sidebar-nav-module" id="nav-rateio" onclick="abrirModulo('rateio')">
      <span style="font-size:15px">⚖️</span><span>Centros de Custo</span>
    </div>
    <div class="sidebar-nav-module" id="nav-relatorios" onclick="abrirModulo('relatorios')">
      <span style="font-size:15px">📊</span><span>Relatórios</span>
    </div>
    <div class="sidebar-nav-module" id="nav-comissoes" onclick="abrirModulo('comissoes')">
      <span style="font-size:15px">👥</span><span>Comissões</span>
    </div>
    <div class="sidebar-nav-module" id="nav-permissoes" onclick="abrirModulo('permissoes')">
      <span style="font-size:15px">🔐</span><span>Permissões</span>
    </div>
    <div class="sidebar-nav-module" id="nav-repositorio" onclick="abrirModulo('repositorio')">
      <span style="font-size:15px">🗄️</span><span>Repositório</span>
    </div>
  `;

  // Cargos
  const nav = document.getElementById('cargoNav');
  nav.innerHTML = CARGOS.map(c => `
    <div class="cargo-nav-item" id="nav-${c.id}" onclick="selecionarCargo('${c.id}')">
      <span class="dot" style="background:${c.cor}"></span>
      <span>${c.label}</span>
      <span class="nivel-badge">Nv ${c.nivel}</span>
    </div>
  `).join('');
}

function atualizarNavAtivo() {
  document.querySelectorAll('.cargo-nav-item, .sidebar-nav-module').forEach(el => el.classList.remove('active'));
  if (state.cargoAtivo) {
    document.getElementById('nav-' + state.cargoAtivo)?.classList.add('active');
  }
}

function abrirModulo(id) {
  state.cargoAtivo = id;
  atualizarNavAtivo();

  const handlers = {
    cadastro_irmao: () => { mostrarView('irmaoView');     renderIrmaoView(); },
    boletos:        () => { mostrarView('irmaoView');     renderBoletosView(); },
    aniversarios:   () => { mostrarView('irmaoView');     renderAniversariosView(); },
    agenda:         () => { mostrarView('irmaoView');     renderAgendaView(); },
    compras:        () => { mostrarView('comprasView');    renderComprasView(); },
    rateio:         () => { mostrarView('rateioView');     renderRateioView(); },
    relatorios:     () => { mostrarView('relatoriosView'); renderRelatoriosView(); },
    comissoes:      () => { mostrarView('comissoesView');   renderComissoesView(); },
    permissoes:     () => { mostrarView('permissoesView');  renderPermissoesView(); },
    repositorio:    () => { mostrarView('repositorioView'); renderRepositorioView(); },
  };
  handlers[id]?.();
  _navClick();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function selecionarCargo(id) {
  state.cargoAtivo = id;
  atualizarNavAtivo();
  _navClick();

  const cargo = CARGOS.find(c => c.id === id);
  if (!cargo) return;

  mostrarView('cargoView');
  renderCargoHeader(cargo);
  renderResponsabilidades(cargo);
  renderFuncionalidades(cargo);

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderCargoHeader(cargo) {
  const el = document.getElementById('cargoHeader');
  el.style.setProperty('--cargo-cor', cargo.cor);
  el.innerHTML = `
    <div class="cargo-header-icon">${cargo.icone}</div>
    <div class="cargo-header-info">
      <h1>${cargo.label}</h1>
      <p>${cargo.descricao}</p>
      <div class="nivel-tag">
        <span class="nivel-dot" style="background:${cargo.cor}"></span>
        Nível hierárquico: <strong>${cargo.nivel}</strong>
      </div>
    </div>
  `;
}

function renderResponsabilidades(cargo) {
  const grid = document.getElementById('responsCards');
  grid.innerHTML = cargo.responsabilidades.map(r => `
    <div class="resp-card">
      <div class="resp-card-icon">${r.icone}</div>
      <div class="resp-card-title">${r.titulo}</div>
      <div class="resp-card-desc">${r.desc}</div>
    </div>
  `).join('');
}

function renderFuncionalidades(cargo) {
  const grid = document.getElementById('funcsCards');

  if (!cargo.funcionalidades.length) {
    grid.innerHTML = `<div class="resp-card" style="grid-column:1/-1">
      <div class="resp-card-icon">🔵</div>
      <div class="resp-card-title">Acesso básico</div>
      <div class="resp-card-desc">Este cargo tem acesso apenas de consulta e participação nas sessões. As funcionalidades operacionais são executadas pelos cargos com maior responsabilidade.</div>
    </div>`;
    return;
  }

  const autenticado = !!state.token;

  grid.innerHTML = cargo.funcionalidades.map(fid => {
    const f = FUNCIONALIDADES[fid];
    if (!f) return '';

    const btns = autenticado
      ? `<div class="func-card-actions">
           <button class="func-btn primary" onclick="abrirModal('${fid}')">Executar ação</button>
         </div>`
      : `<div class="badge-locked">🔒 Faça login para executar</div>`;

    return `
      <div class="func-card">
        <div class="func-card-top">
          <div class="func-card-icon" style="background:${f.cor}22; color:${f.cor}">${f.icone}</div>
          <div>
            <div class="func-card-title">${f.titulo}</div>
            <div class="func-card-desc">${f.desc}</div>
          </div>
        </div>
        <div class="func-card-quem"><strong>Quem pode:</strong> ${f.quem}</div>
        ${btns}
      </div>
    `;
  }).join('');
}

// ═══════════════════════════════════════════════════════════
//  HOME VIEW
// ═══════════════════════════════════════════════════════════

function renderHome() {
  const grid = document.getElementById('homeCargoGrid');
  grid.innerHTML = CARGOS.map(c => `
    <div class="home-cargo-card" style="--card-color:${c.cor}" onclick="selecionarCargo('${c.id}')">
      <div class="card-icon">${c.icone}</div>
      <div class="card-title">${c.label}</div>
      <div class="card-nivel"><span>Nível ${c.nivel}</span></div>
    </div>
  `).join('');
}

// ═══════════════════════════════════════════════════════════
//  MÓDULO — CADASTRO DE IRMÃOS
// ═══════════════════════════════════════════════════════════

const CATEGORIAS_MENSALIDADE = [
  {
    id: 'regular',
    titulo: 'Regular',
    desc: 'Mensalidade padrão da loja',
    valor: 'A definir',
    tag: 'tag-regular',
  },
  {
    id: 'idoso',
    titulo: 'Idoso',
    desc: 'Valor reduzido para irmãos com 65 anos ou mais',
    valor: 'A definir',
    tag: 'tag-idoso',
  },
  {
    id: 'potencia',
    titulo: 'Com Potência',
    desc: 'Mensalidade da loja + taxa da Potência (GOB/COMAB) no mesmo boleto',
    valor: 'A definir',
    tag: 'tag-potencia',
  },
  {
    id: 'especial',
    titulo: 'Especial',
    desc: 'Regra personalizada por irmão — a ser detalhada com o Financeiro',
    valor: 'A definir',
    tag: 'tag-especial',
  },
];

// Dados de exemplo (serão substituídos por dados da API)
function tagMensalidade(cat) {
  const c = CATEGORIAS_MENSALIDADE.find(x => x.id === cat);
  return c ? `<span class="tag ${c.tag}">${c.titulo}</span>` : '';
}

async function renderIrmaoView() {
  const view = document.getElementById('irmaoView');
  const loja = state.usuario?.loja_id || 1;

  const categoriaCards = CATEGORIAS_MENSALIDADE.map(c => `
    <div class="cat-card ${c.id}">
      <div class="cat-card-titulo">${c.titulo}</div>
      <div class="cat-card-desc">${c.desc}</div>
      <div class="cat-card-valor">${c.valor}</div>
    </div>
  `).join('');

  let irmaos = [];
  try { irmaos = await api('GET', `/irmaos?loja_id=${loja}`); } catch(_) {}

  const irmaoCards = irmaos.map(ir => {
    // normalise field names from API
    ir.filhos = ir.filhos || [];
    ir.tel = ir.telefone || ir.whatsapp || '';
    ir.nascimento = ir.data_nascimento || '';
    ir.esposa = ir.nome_esposa || null;
    const ini = ir.nome[0].toUpperCase();
    const filhosHtml = ir.filhos.length
      ? ir.filhos.map(f => `${f.nome} <span style="color:#94a3b8;font-size:11px">(${formatData(f.nasc)})</span>`).join(', ')
      : '—';
    return `
      <div class="irmao-card">
        <div class="irmao-card-top">
          <div class="irmao-avatar">${ini}</div>
          <div>
            <div class="irmao-card-name">${ir.nome}</div>
            <div class="irmao-card-cim">CIM ${ir.cim} &nbsp;·&nbsp; ${ir.potencia} &nbsp;·&nbsp; ${ir.loja}</div>
          </div>
        </div>
        <div class="irmao-card-body">
          <div>📱 <strong>WhatsApp:</strong> ${ir.tel}</div>
          <div>🎂 <strong>Nascimento:</strong> ${formatData(ir.nascimento)}</div>
          <div>💍 <strong>Esposa:</strong> ${ir.esposa || '—'}</div>
          <div>👶 <strong>Filhos:</strong> ${filhosHtml}</div>
        </div>
        <div class="irmao-card-tags">
          ${tagMensalidade(ir.mensalidade)}
          ${anivProximo(ir.nascimento) ? '<span class="tag tag-aniv">🎂 Aniversário próximo</span>' : ''}
        </div>
      </div>
    `;
  }).join('');

  view.innerHTML = `
    <div class="irmao-header">
      <h1>👥 Cadastro de Irmãos</h1>
      <button class="func-btn primary" onclick="toggleFormIrmao()">+ Novo Irmão</button>
    </div>

    <!-- Formulário de cadastro -->
    <div class="form-card" id="formIrmaoCard" style="display:none">
      <h2>Novo Irmão</h2>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Nome completo</label>
          <input class="form-input" id="fi_nome" type="text" placeholder="Nome do irmão" />
        </div>
        <div class="form-group">
          <label class="form-label">CIM</label>
          <input class="form-input" id="fi_cim" type="text" placeholder="Nº CIM" />
        </div>
        <div class="form-group">
          <label class="form-label">Potência</label>
          <select class="form-select" id="fi_potencia">
            <option>GOB</option><option>COMAB</option><option>COMOB</option><option>Outra</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Loja</label>
          <input class="form-input" id="fi_loja" type="text" placeholder="Nome ou nº da loja" />
        </div>
        <div class="form-group">
          <label class="form-label">WhatsApp / Celular</label>
          <input class="form-input" id="fi_tel" type="text" placeholder="(DDD) 9xxxx-xxxx" />
        </div>
        <div class="form-group">
          <label class="form-label">Data de Nascimento</label>
          <input class="form-input" id="fi_nasc" type="date" />
        </div>
        <div class="form-group">
          <label class="form-label">Nome da Esposa</label>
          <input class="form-input" id="fi_esposa" type="text" placeholder="Se houver" />
        </div>
        <div class="form-group">
          <label class="form-label">Regra de Mensalidade</label>
          <select class="form-select" id="fi_mensalidade">
            <option value="regular">Regular</option>
            <option value="idoso">Idoso</option>
            <option value="potencia">Com Potência</option>
            <option value="especial">Especial</option>
          </select>
        </div>
      </div>
      <div class="form-group" style="margin-top:14px">
        <label class="form-label">Filhos (nome / data de nasc. — um por linha)</label>
        <textarea class="form-input" id="fi_filhos" rows="3" placeholder="Carlos Silva / 1995-07-20&#10;Ana Silva / 1998-11-03"></textarea>
      </div>
      <div class="form-actions">
        <button class="func-btn primary" onclick="salvarIrmao()">Salvar</button>
        <button class="func-btn neutral" onclick="toggleFormIrmao()">Cancelar</button>
      </div>
      <pre class="modal-result" id="formIrmaoResult" style="display:none"></pre>
    </div>

    <!-- Categorias de mensalidade -->
    <div class="mensalidade-info">
      <h2>💰 Categorias de Mensalidade</h2>
      <div class="mensalidade-categorias">${categoriaCards}</div>
    </div>

    <!-- Cards dos irmãos -->
    <div class="section-title" style="margin-bottom:16px">Irmãos cadastrados (${irmaos.length})</div>
    <div class="irmao-grid">${irmaoCards}</div>
  `;
}

function toggleFormIrmao() {
  const card = document.getElementById('formIrmaoCard');
  card.style.display = card.style.display === 'none' ? 'block' : 'none';
}

async function salvarIrmao() {
  const res = document.getElementById('formIrmaoResult');
  res.style.display = 'block';
  res.className = 'modal-result';
  res.textContent = 'Salvando…';

  // Parseia filhos: "Nome / AAAA-MM-DD" por linha
  const filhosRaw = (document.getElementById('fi_filhos').value || '').trim();
  const filhos = filhosRaw
    ? filhosRaw.split('\n').filter(l => l.trim()).map(l => {
        const [nome, nasc] = l.split('/').map(s => s.trim());
        return { nome, data_nascimento: nasc || null };
      })
    : [];

  const dados = {
    loja_id:              state.usuario?.loja_id || 1,
    nome:                 document.getElementById('fi_nome').value.trim(),
    cim:                  document.getElementById('fi_cim').value.trim() || null,
    potencia:             document.getElementById('fi_potencia').value.trim() || null,
    telefone:             document.getElementById('fi_tel').value.trim() || null,
    data_nascimento:      document.getElementById('fi_nasc').value || null,
    nome_esposa:          document.getElementById('fi_esposa').value.trim() || null,
    mensalidade_categoria: document.getElementById('fi_mensalidade').value || null,
    filhos,
  };

  try {
    const r = await api('POST', '/irmaos', dados);
    res.className = 'modal-result ok';
    res.textContent = 'Irmão cadastrado com sucesso!';
    // Limpa o formulário
    ['fi_nome','fi_cim','fi_potencia','fi_loja','fi_tel','fi_nasc','fi_esposa','fi_filhos']
      .forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
    setTimeout(() => renderIrmaoView(), 800);
  } catch (e) {
    res.className = 'modal-result error';
    res.textContent = '⚠ ' + (e.data?.detail || e.message);
  }
}

function formatData(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function anivProximo(iso) {
  if (!iso) return false;
  const hoje = new Date();
  const [, mes, dia] = iso.split('-').map(Number);
  const prox = new Date(hoje.getFullYear(), mes - 1, dia);
  if (prox < hoje) prox.setFullYear(hoje.getFullYear() + 1);
  return (prox - hoje) / 86400000 <= 30;
}

// ═══════════════════════════════════════════════════════════
//  MÓDULO — BOLETOS
// ═══════════════════════════════════════════════════════════

function renderBoletosView() {
  const view = document.getElementById('irmaoView');
  view.innerHTML = `
    <div class="irmao-header">
      <h1>📄 Boletos</h1>
    </div>

    <div class="form-card">
      <h2>Como funciona</h2>
      <div class="cards-grid" style="margin-top:12px">
        <div class="resp-card"><div class="resp-card-icon">1️⃣</div><div class="resp-card-title">Receba os boletos</div><div class="resp-card-desc">O banco envia os PDFs via WhatsApp para o número da Secretaria Digital.</div></div>
        <div class="resp-card"><div class="resp-card-icon">2️⃣</div><div class="resp-card-title">Identificação automática</div><div class="resp-card-desc">O sistema lê o PDF, identifica o irmão pelo nome ou CIM e cruza com o cadastro.</div></div>
        <div class="resp-card"><div class="resp-card-icon">3️⃣</div><div class="resp-card-title">Envio automático</div><div class="resp-card-desc">O boleto é encaminhado para o WhatsApp do irmão com uma mensagem personalizada.</div></div>
      </div>
    </div>

    <div class="form-card">
      <h2>Upload manual de boleto</h2>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">ID da Loja</label>
          <input class="form-input" id="b_loja" type="number" value="1" />
        </div>
        <div class="form-group">
          <label class="form-label">Arquivo PDF</label>
          <input class="form-input" id="b_arquivo" type="file" accept=".pdf" />
        </div>
      </div>
      <div class="form-actions">
        <button class="func-btn primary" onclick="uploadBoleto()">Processar boleto</button>
      </div>
      <pre class="modal-result" id="boletoResult" style="display:none"></pre>
    </div>

    <div class="form-card" id="boletoListaCard">
      <h2>Histórico de processamento</h2>
      <div id="boletoLista" style="margin-top:12px;color:#64748b;font-size:14px">
        <button class="func-btn neutral" onclick="carregarBoletos()">Carregar histórico</button>
      </div>
    </div>
  `;
}

async function uploadBoleto() {
  const res = document.getElementById('boletoResult');
  const file = document.getElementById('b_arquivo').files[0];
  const loja = document.getElementById('b_loja').value;
  res.style.display = 'block'; res.className = 'modal-result'; res.textContent = 'Processando…';
  if (!file) { res.className = 'modal-result error'; res.textContent = 'Selecione um PDF.'; return; }
  try {
    const fd = new FormData();
    fd.append('loja_id', loja);
    fd.append('arquivo', file);
    const opts = { method: 'POST', body: fd };
    if (state.token) opts.headers = { 'Authorization': 'Basic ' + state.token };
    const r = await fetch(apiBase() + '/boletos/upload', opts);
    const d = await r.json();
    res.className = r.ok ? 'modal-result ok' : 'modal-result error';
    res.textContent = JSON.stringify(d, null, 2);
  } catch (e) { res.className = 'modal-result error'; res.textContent = e.message; }
}

async function carregarBoletos() {
  const el = document.getElementById('boletoLista');
  el.textContent = 'Carregando…';
  try {
    const loja = document.getElementById('b_loja')?.value || 1;
    const data = await api('GET', `/boletos?loja_id=${loja}`);
    if (!data.length) { el.textContent = 'Nenhum boleto processado ainda.'; return; }
    el.innerHTML = data.map(b => `
      <div style="display:flex;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid #e2e8f0">
        <span style="font-size:20px">${b.status === 'enviado' ? '✅' : b.status === 'nao_identificado' ? '❓' : '⚠️'}</span>
        <div>
          <div style="font-weight:600;font-size:14px">${b.irmao_nome || 'Não identificado'}</div>
          <div style="font-size:12px;color:#64748b">${b.status} · ${new Date(b.created_at).toLocaleString('pt-BR')}${b.erro ? ' · ' + b.erro : ''}</div>
        </div>
      </div>
    `).join('');
  } catch (e) { el.textContent = 'Erro: ' + e.message; }
}

// ═══════════════════════════════════════════════════════════
//  MÓDULO — ANIVERSÁRIOS
// ═══════════════════════════════════════════════════════════

function renderAniversariosView() {
  const view = document.getElementById('irmaoView');
  view.innerHTML = `
    <div class="irmao-header">
      <h1>🎂 Aniversários</h1>
      <div style="display:flex;gap:10px">
        <select class="form-select" id="anivDias" style="width:auto">
          <option value="7">Próximos 7 dias</option>
          <option value="30" selected>Próximos 30 dias</option>
          <option value="90">Próximos 90 dias</option>
        </select>
        <button class="func-btn primary" onclick="carregarAniversarios()">Atualizar</button>
        <button class="func-btn success" onclick="notificarHoje()">📲 Notificar hoje</button>
      </div>
    </div>
    <div id="anivLista" class="irmao-grid"></div>
    <pre class="modal-result" id="anivResult" style="display:none;margin-top:16px"></pre>
  `;
  carregarAniversarios();
}

async function carregarAniversarios() {
  const el   = document.getElementById('anivLista');
  const dias = document.getElementById('anivDias')?.value || 30;
  const loja = state.usuario?.loja_id || 1;
  el.innerHTML = '<div style="color:#64748b;padding:20px">Carregando…</div>';
  try {
    const data = await api('GET', `/aniversarios?loja_id=${loja}&dias=${dias}`);
    if (!data.length) { el.innerHTML = '<div style="color:#64748b;padding:20px">Nenhum aniversário nos próximos ' + dias + ' dias.</div>'; return; }
    el.innerHTML = data.map(ev => {
      const hoje = ev.dias_falta === 0;
      const tipo_icon = ev.tipo === 'irmao' ? '🔵' : ev.tipo === 'esposa' ? '🌹' : '🎈';
      return `
        <div class="irmao-card" style="${hoje ? 'border-color:#f59e0b;background:#fffbeb' : ''}">
          <div class="irmao-card-top">
            <div class="irmao-avatar" style="background:${hoje ? '#f59e0b' : '#2563eb'}">${tipo_icon}</div>
            <div>
              <div class="irmao-card-name">${ev.nome}</div>
              <div class="irmao-card-cim">${ev.tipo === 'filho' ? 'Filho de ' + ev.pai_nome : ev.tipo === 'esposa' ? 'Esposa do Ir.·.' : 'Irmão'}</div>
            </div>
          </div>
          <div class="irmao-card-body">
            <div>📅 <strong>${formatData(String(ev.data))}</strong></div>
            <div>📱 ${ev.telefone || '(sem telefone)'}</div>
          </div>
          <div class="irmao-card-tags">
            ${hoje
              ? '<span class="tag tag-aniv">🎂 HOJE!</span>'
              : `<span class="tag tag-regular">em ${ev.dias_falta} dias</span>`}
          </div>
        </div>
      `;
    }).join('');
  } catch (e) { el.innerHTML = '<div style="color:#dc2626;padding:20px">Erro: ' + e.message + '</div>'; }
}

async function notificarHoje() {
  const res  = document.getElementById('anivResult');
  const loja = state.usuario?.loja_id || 1;
  res.style.display = 'block'; res.className = 'modal-result'; res.textContent = 'Enviando…';
  try {
    const d = await api('POST', `/aniversarios/notificar-hoje`, { loja_id: +loja });
    res.className = 'modal-result ok';
    res.textContent = `${d.notificados} notificação(ões) enviada(s)\n` + JSON.stringify(d.detalhes, null, 2);
  } catch (e) { res.className = 'modal-result error'; res.textContent = e.message; }
}

// ═══════════════════════════════════════════════════════════
//  MÓDULO — AGENDA
// ═══════════════════════════════════════════════════════════

function renderAgendaView() {
  const view = document.getElementById('irmaoView');
  view.innerHTML = `
    <div class="irmao-header">
      <h1>📅 Agenda</h1>
      <button class="func-btn primary" onclick="document.getElementById('formEventoCard').style.display='block'">+ Novo evento</button>
    </div>

    <div class="form-card" id="formEventoCard" style="display:none">
      <h2>Novo Evento</h2>
      <div class="form-grid">
        <div class="form-group" style="grid-column:1/-1"><label class="form-label">Título</label><input class="form-input" id="ev_titulo" type="text" placeholder="Ex: Sessão Magna" /></div>
        <div class="form-group" style="grid-column:1/-1"><label class="form-label">Descrição</label><input class="form-input" id="ev_desc" type="text" /></div>
        <div class="form-group"><label class="form-label">Início</label><input class="form-input" id="ev_inicio" type="datetime-local" /></div>
        <div class="form-group"><label class="form-label">Fim</label><input class="form-input" id="ev_fim" type="datetime-local" /></div>
      </div>
      <div class="form-actions">
        <button class="func-btn primary" onclick="criarEvento()">Criar no Google Calendar</button>
        <button class="func-btn neutral" onclick="document.getElementById('formEventoCard').style.display='none'">Cancelar</button>
      </div>
      <pre class="modal-result" id="eventoResult" style="display:none"></pre>
    </div>

    <div class="form-card">
      <h2>Próximos eventos</h2>
      <div id="agendaLista" style="margin-top:12px">
        <button class="func-btn neutral" onclick="carregarAgenda()">Carregar agenda</button>
      </div>
    </div>

    <div class="resp-card" style="margin-top:0;border-color:#fde68a;background:#fffbeb">
      <div class="resp-card-icon">⚙️</div>
      <div class="resp-card-title">Configuração necessária</div>
      <div class="resp-card-desc">Para usar a agenda, configure <strong>google_credentials.json</strong> na raiz do projeto. Veja as instruções em <code>backend_services/calendar_service.py</code>.</div>
    </div>
  `;
}

async function criarEvento() {
  const res = document.getElementById('eventoResult');
  res.style.display = 'block'; res.className = 'modal-result'; res.textContent = 'Criando…';
  const tz = '-03:00';
  try {
    const d = await api('POST', '/agenda', {
      titulo:   document.getElementById('ev_titulo').value,
      descricao:document.getElementById('ev_desc').value,
      inicio:   document.getElementById('ev_inicio').value + ':00' + tz,
      fim:      document.getElementById('ev_fim').value + ':00' + tz,
    });
    res.className = 'modal-result ok';
    res.textContent = 'Evento criado!\n' + JSON.stringify(d, null, 2);
  } catch (e) { res.className = 'modal-result error'; res.textContent = e.message; }
}

async function carregarAgenda() {
  const el = document.getElementById('agendaLista');
  el.textContent = 'Carregando…';
  try {
    const data = await api('GET', '/agenda?dias=60');
    if (!data.length) { el.textContent = 'Nenhum evento nos próximos 60 dias.'; return; }
    el.innerHTML = data.map(ev => {
      const inicio = ev.start?.dateTime || ev.start?.date || '';
      return `
        <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #e2e8f0">
          <div style="font-size:22px">📅</div>
          <div>
            <div style="font-weight:700;font-size:14px">${ev.summary}</div>
            <div style="font-size:12px;color:#64748b">${inicio ? new Date(inicio).toLocaleString('pt-BR') : ''}</div>
            ${ev.description ? `<div style="font-size:12px;color:#475569;margin-top:3px">${ev.description}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');
  } catch (e) { el.textContent = 'Erro: ' + e.message; }
}

// ═══════════════════════════════════════════════════════════
//  MODAL DE AÇÃO
// ═══════════════════════════════════════════════════════════

let modalFuncId = null;

function abrirModal(fid) {
  const f = FUNCIONALIDADES[fid];
  if (!f) return;
  modalFuncId = fid;

  document.getElementById('modalTitle').textContent = `${f.icone} ${f.titulo}`;

  const body = document.getElementById('modalBody');
  body.innerHTML = f.campos.map(campo => `
    <div>
      <div class="modal-label">${campo.label}</div>
      <input class="modal-input" id="${campo.id}" type="${campo.tipo}" value="${campo.valor}" placeholder="${campo.label}" />
    </div>
  `).join('') + `<pre class="modal-result" id="modalResult" style="display:none"></pre>`;

  const footer = document.getElementById('modalFooter');
  footer.innerHTML = `
    <button class="func-btn neutral" onclick="fecharModal()">Cancelar</button>
    <button class="func-btn primary" id="modalExecBtn" onclick="executarModal()">Executar</button>
  `;

  document.getElementById('modalOverlay').style.display = 'flex';
}

async function executarModal() {
  const f = FUNCIONALIDADES[modalFuncId];
  if (!f) return;

  const campos = {};
  f.campos.forEach(c => { campos[c.id] = document.getElementById(c.id)?.value || ''; });

  const btn    = document.getElementById('modalExecBtn');
  const result = document.getElementById('modalResult');
  btn.disabled = true;
  btn.textContent = 'Aguarde…';
  result.style.display = 'block';
  result.className = 'modal-result';
  result.textContent = 'Executando…';

  try {
    const data = await f.acao(campos);
    result.className = 'modal-result ok';
    result.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    result.className = 'modal-result error';
    result.textContent = e.message + (e.data ? '\n\n' + JSON.stringify(e.data, null, 2) : '');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Executar';
  }
}

function fecharModal() {
  document.getElementById('modalOverlay').style.display = 'none';
  modalFuncId = null;
}

// ═══════════════════════════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════════════════════════

function toggleSidebar(forceClose) {
  const sb  = document.getElementById('sidebar');
  const ov  = document.getElementById('sidebarOverlay');
  const btn = document.getElementById('hamburger');
  const open = forceClose ? false : !sb.classList.contains('open');
  sb.classList.toggle('open', open);
  ov.classList.toggle('open', open);
  btn.classList.toggle('open', open);
}

// ═══════════════════════════════════════════════════════════
//  COMPRAS / REEMBOLSOS
// ═══════════════════════════════════════════════════════════

async function renderComprasView() {
  const el = document.getElementById('comprasView');
  const loja = state.usuario?.loja_id || 1;
  el.innerHTML = `
    <div class="view-header">
      <h1>Compras & Reembolsos</h1>
      <button class="btn-primary" onclick="abrirNovaCompra()">+ Nova compra</button>
    </div>
    <div class="filtros-row">
      <select id="filtroStatus" onchange="renderComprasView()">
        <option value="">Todos os status</option>
        <option value="pendente">Pendente</option>
        <option value="aprovado">Aprovado</option>
        <option value="rejeitado">Rejeitado</option>
      </select>
      <label style="display:flex;align-items:center;gap:6px;font-size:13px">
        <input type="checkbox" id="filtroOcultos" onchange="renderComprasView()"> Incluir ocultos
      </label>
    </div>
    <div id="comprasLista"><div class="loading">Carregando…</div></div>
  `;

  const status = document.getElementById('filtroStatus')?.value || '';
  const incl   = document.getElementById('filtroOcultos')?.checked ? 'true' : 'false';
  try {
    const params = `loja_id=${loja}&incluir_ocultos=${incl}` + (status ? `&status=${status}` : '');
    const compras = await api('GET', `/compras?${params}`);
    const lista = document.getElementById('comprasLista');
    if (!compras.length) { lista.innerHTML = '<p class="empty-msg">Nenhuma compra encontrada.</p>'; return; }

    lista.innerHTML = compras.map(c => `
      <div class="compra-card status-${c.status}">
        <div class="compra-top">
          <span class="compra-evento">${c.evento}</span>
          <span class="badge-status ${c.status}">${c.status}</span>
          ${!c.visivel ? '<span class="badge-oculto">oculto</span>' : ''}
        </div>
        <div class="compra-meta">
          <span>👤 ${c.usuario_nome}</span>
          <span>💰 R$ ${parseFloat(c.valor).toFixed(2)}</span>
          <span>📅 ${new Date(c.criado_em).toLocaleDateString('pt-BR')}</span>
          ${c.regra_nome ? `<span>⚖️ ${c.regra_nome}</span>` : ''}
        </div>
        ${c.arquivos?.length ? `<div class="compra-arquivos">
          ${c.arquivos.map(a => `<a href="${apiBase()}/compras/${c.id}/arquivo/${a.id}" target="_blank" class="arq-link">📎 ${a.nome_original || a.tipo}</a>`).join('')}
        </div>` : ''}
        ${c.observacao ? `<div class="compra-obs">💬 ${c.observacao}</div>` : ''}
        <div class="compra-acoes">
          ${c.status === 'pendente' ? `
            <button class="btn-sm success" onclick="aprovarCompra(${c.id})">Aprovar</button>
            <button class="btn-sm danger"  onclick="rejeitarCompra(${c.id})">Rejeitar</button>
          ` : ''}
          <button class="btn-sm neutral" onclick="toggleVisibilidade(${c.id}, ${!c.visivel})">${c.visivel ? 'Ocultar' : 'Mostrar'}</button>
        </div>
      </div>
    `).join('');
  } catch(e) {
    document.getElementById('comprasLista').innerHTML = `<p class="error-msg">${e.message}</p>`;
  }
}

async function abrirNovaCompra() {
  const loja = state.usuario?.loja_id || 1;
  let regras = [];
  try { regras = await api('GET', `/regras-rateio?loja_id=${loja}`); } catch(_) {}

  abrirModal('Nova Compra / Reembolso', `
    <div class="form-group"><label>Evento / Descrição</label>
      <input class="modal-input" id="nc_evento" placeholder="Ex: Ágape - Sessão Magna" /></div>
    <div class="form-group"><label>Valor (R$)</label>
      <input class="modal-input" id="nc_valor" type="number" step="0.01" placeholder="0,00" /></div>
    <div class="form-group"><label>Regra de rateio (opcional)</label>
      <select class="modal-input" id="nc_regra">
        <option value="">Sem rateio</option>
        ${regras.map(r => `<option value="${r.id}">${r.nome}</option>`).join('')}
      </select></div>
    <div class="form-group"><label>Arquivos (fotos, cupons)</label>
      <input type="file" id="nc_arquivos" multiple accept="image/*,application/pdf" class="modal-input" /></div>
    <div class="sb-msg" id="ncMsg"></div>
  `, [
    { label: 'Cancelar', cls: 'neutral', action: 'fecharModal()' },
    { label: 'Enviar', cls: 'primary', action: 'submitNovaCompra()' },
  ]);
}

async function submitNovaCompra() {
  const loja   = state.usuario?.loja_id || 1;
  const evento = document.getElementById('nc_evento').value.trim();
  const valor  = parseFloat(document.getElementById('nc_valor').value);
  const regra  = document.getElementById('nc_regra').value;
  const msg    = document.getElementById('ncMsg');

  if (!evento || isNaN(valor)) { msg.textContent = 'Preencha evento e valor.'; return; }

  const fd = new FormData();
  fd.append('loja_id', loja);
  fd.append('evento', evento);
  fd.append('valor', valor);
  if (regra) fd.append('regra_rateio_id', regra);
  const arqs = document.getElementById('nc_arquivos').files;
  for (const f of arqs) fd.append('arquivos', f);

  try {
    msg.textContent = 'Enviando…';
    const opts = { method: 'POST', body: fd };
    if (state.token) opts.headers = { Authorization: 'Basic ' + state.token };
    const res = await fetch(apiBase() + '/compras', opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || 'Erro ao enviar');
    fecharModal();
    renderComprasView();
  } catch(e) {
    msg.textContent = e.message;
  }
}

async function aprovarCompra(id) {
  const obs = prompt('Observação (opcional):') || '';
  try {
    await api('PATCH', `/compras/${id}/status`, { status: 'aprovado', observacao: obs });
    renderComprasView();
  } catch(e) { alert(e.message); }
}

async function rejeitarCompra(id) {
  const obs = prompt('Motivo da rejeição:') || '';
  try {
    await api('PATCH', `/compras/${id}/status`, { status: 'rejeitado', observacao: obs });
    renderComprasView();
  } catch(e) { alert(e.message); }
}

async function toggleVisibilidade(id, visivel) {
  try {
    await api('PATCH', `/compras/${id}/visibilidade`, { visivel });
    renderComprasView();
  } catch(e) { alert(e.message); }
}


// ═══════════════════════════════════════════════════════════
//  CENTROS DE CUSTO & RATEIO
// ═══════════════════════════════════════════════════════════

async function renderRateioView() {
  const el   = document.getElementById('rateioView');
  const loja = state.usuario?.loja_id || 1;
  el.innerHTML = `
    <div class="view-header"><h1>Centros de Custo & Rateio</h1></div>
    <div class="rateio-grid">
      <section>
        <div class="section-header">
          <h2>Centros de Custo</h2>
          <button class="btn-primary small" onclick="abrirNovoCentro()">+ Novo</button>
        </div>
        <div id="centrosLista"><div class="loading">Carregando…</div></div>
      </section>
      <section>
        <div class="section-header">
          <h2>Regras de Rateio</h2>
          <button class="btn-primary small" onclick="abrirNovaRegra()">+ Nova</button>
        </div>
        <div id="regrasLista"><div class="loading">Carregando…</div></div>
      </section>
    </div>
  `;
  await Promise.all([carregarCentros(loja), carregarRegras(loja)]);
}

async function carregarCentros(loja) {
  try {
    const centros = await api('GET', `/centros-custo?loja_id=${loja}&apenas_ativos=false`);
    const el = document.getElementById('centrosLista');
    el.innerHTML = centros.length
      ? centros.map(c => `
          <div class="rateio-item ${c.ativo ? '' : 'inativo'}">
            <div class="ri-nome">${c.nome} ${!c.ativo ? '<span class="badge-inativo">inativo</span>' : ''}</div>
            ${c.descricao ? `<div class="ri-desc">${c.descricao}</div>` : ''}
            <div class="ri-acoes">
              <button class="btn-sm neutral" onclick="editarCentro(${c.id},'${c.nome.replace(/'/g,"\\'")}','${(c.descricao||'').replace(/'/g,"\\'")}',${c.ativo})">Editar</button>
              <button class="btn-sm danger"  onclick="deletarCentro(${c.id})">Excluir</button>
            </div>
          </div>`).join('')
      : '<p class="empty-msg">Nenhum centro cadastrado.</p>';
  } catch(e) {
    document.getElementById('centrosLista').innerHTML = `<p class="error-msg">${e.message}</p>`;
  }
}

async function carregarRegras(loja) {
  try {
    const regras = await api('GET', `/regras-rateio?loja_id=${loja}&apenas_ativas=false`);
    const el = document.getElementById('regrasLista');
    el.innerHTML = regras.length
      ? regras.map(r => `
          <div class="rateio-item ${r.ativo ? '' : 'inativo'}">
            <div class="ri-nome">${r.nome} ${!r.ativo ? '<span class="badge-inativo">inativo</span>' : ''}</div>
            ${r.descricao ? `<div class="ri-desc">${r.descricao}</div>` : ''}
            <div class="ri-itens">
              ${(r.itens||[]).map(i => `<span class="rateio-tag">${i.centro_nome}: ${i.percentual}%</span>`).join('')}
            </div>
            <div class="ri-acoes">
              <button class="btn-sm danger" onclick="deletarRegra(${r.id})">Excluir</button>
            </div>
          </div>`).join('')
      : '<p class="empty-msg">Nenhuma regra cadastrada.</p>';
  } catch(e) {
    document.getElementById('regrasLista').innerHTML = `<p class="error-msg">${e.message}</p>`;
  }
}

async function abrirNovoCentro() {
  abrirModal('Novo Centro de Custo', `
    <div class="form-group"><label>Nome</label>
      <input class="modal-input" id="cc_nome" placeholder="Ex: Loja Principal" /></div>
    <div class="form-group"><label>Descrição</label>
      <input class="modal-input" id="cc_desc" placeholder="Opcional" /></div>
    <div class="sb-msg" id="ccMsg"></div>
  `, [
    { label: 'Cancelar', cls: 'neutral', action: 'fecharModal()' },
    { label: 'Salvar', cls: 'primary', action: 'salvarCentro()' },
  ]);
}

async function salvarCentro() {
  const loja = state.usuario?.loja_id || 1;
  const nome = document.getElementById('cc_nome').value.trim();
  const desc = document.getElementById('cc_desc').value.trim();
  if (!nome) { document.getElementById('ccMsg').textContent = 'Informe o nome.'; return; }
  try {
    await api('POST', '/centros-custo', { loja_id: loja, nome, descricao: desc || null });
    fecharModal(); renderRateioView();
  } catch(e) { document.getElementById('ccMsg').textContent = e.message; }
}

async function editarCentro(id, nome, desc, ativo) {
  abrirModal('Editar Centro de Custo', `
    <div class="form-group"><label>Nome</label>
      <input class="modal-input" id="cc_nome" value="${nome}" /></div>
    <div class="form-group"><label>Descrição</label>
      <input class="modal-input" id="cc_desc" value="${desc}" /></div>
    <div class="form-group"><label style="display:flex;gap:8px;align-items:center">
      <input type="checkbox" id="cc_ativo" ${ativo ? 'checked' : ''}> Ativo</label></div>
    <div class="sb-msg" id="ccMsg"></div>
  `, [
    { label: 'Cancelar', cls: 'neutral', action: 'fecharModal()' },
    { label: 'Salvar', cls: 'primary', action: `atualizarCentro(${id})` },
  ]);
}

async function atualizarCentro(id) {
  const nome  = document.getElementById('cc_nome').value.trim();
  const desc  = document.getElementById('cc_desc').value.trim();
  const ativo = document.getElementById('cc_ativo').checked;
  try {
    await api('PUT', `/centros-custo/${id}`, { nome, descricao: desc || null, ativo });
    fecharModal(); renderRateioView();
  } catch(e) { document.getElementById('ccMsg').textContent = e.message; }
}

async function deletarCentro(id) {
  if (!confirm('Excluir este centro de custo?')) return;
  try { await api('DELETE', `/centros-custo/${id}`); renderRateioView(); }
  catch(e) { alert(e.message); }
}

async function abrirNovaRegra() {
  const loja = state.usuario?.loja_id || 1;
  let centros = [];
  try { centros = await api('GET', `/centros-custo?loja_id=${loja}`); } catch(_) {}

  if (!centros.length) {
    alert('Cadastre ao menos um centro de custo antes de criar uma regra.');
    return;
  }

  abrirModal('Nova Regra de Rateio', `
    <div class="form-group"><label>Nome</label>
      <input class="modal-input" id="rr_nome" placeholder="Ex: Rateio Padrão" /></div>
    <div class="form-group"><label>Descrição</label>
      <input class="modal-input" id="rr_desc" placeholder="Opcional" /></div>
    <div class="form-group"><label>Distribuição (deve somar 100%)</label>
      <div id="rr_itens">
        ${centros.map(c => `
          <div class="rateio-input-row">
            <span class="rateio-cc-label">${c.nome}</span>
            <input type="number" class="modal-input rr-pct" data-id="${c.id}"
                   placeholder="0" min="0" max="100" step="0.01" style="width:80px" />
            <span>%</span>
          </div>`).join('')}
      </div>
      <div id="rr_total" class="rateio-total">Total: 0%</div>
    </div>
    <div class="sb-msg" id="rrMsg"></div>
  `, [
    { label: 'Cancelar', cls: 'neutral', action: 'fecharModal()' },
    { label: 'Salvar', cls: 'primary', action: 'salvarRegra()' },
  ]);

  document.querySelectorAll('.rr-pct').forEach(inp => {
    inp.addEventListener('input', () => {
      const t = [...document.querySelectorAll('.rr-pct')].reduce((s,i) => s + (parseFloat(i.value)||0), 0);
      document.getElementById('rr_total').textContent = `Total: ${t.toFixed(2)}%`;
      document.getElementById('rr_total').style.color = Math.abs(t - 100) < 0.01 ? 'green' : '#dc2626';
    });
  });
}

async function salvarRegra() {
  const loja = state.usuario?.loja_id || 1;
  const nome = document.getElementById('rr_nome').value.trim();
  const desc = document.getElementById('rr_desc').value.trim();
  const itens = [...document.querySelectorAll('.rr-pct')]
    .map(i => ({ centro_custo_id: parseInt(i.dataset.id), percentual: parseFloat(i.value) || 0 }))
    .filter(i => i.percentual > 0);

  if (!nome) { document.getElementById('rrMsg').textContent = 'Informe o nome.'; return; }
  try {
    await api('POST', '/regras-rateio', { loja_id: loja, nome, descricao: desc || null, itens });
    fecharModal(); renderRateioView();
  } catch(e) { document.getElementById('rrMsg').textContent = e.message; }
}

async function deletarRegra(id) {
  if (!confirm('Excluir esta regra de rateio?')) return;
  try { await api('DELETE', `/regras-rateio/${id}`); renderRateioView(); }
  catch(e) { alert(e.message); }
}


// ═══════════════════════════════════════════════════════════
//  RELATÓRIOS
// ═══════════════════════════════════════════════════════════

async function renderRelatoriosView() {
  const el   = document.getElementById('relatoriosView');
  const loja = state.usuario?.loja_id || 1;
  const hoje = new Date().toISOString().split('T')[0];
  const m1   = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];

  el.innerHTML = `
    <div class="view-header"><h1>Relatórios</h1></div>
    <div class="relat-tabs">
      <button class="relat-tab active" onclick="mudarRelat('tesouraria', this)">Tesouraria</button>
      <button class="relat-tab" onclick="mudarRelat('mensalidades', this)">Mensalidades</button>
      <button class="relat-tab" onclick="mudarRelat('agenda', this)">Agenda</button>
    </div>
    <div class="relat-filtros">
      <div class="form-group inline"><label>De</label>
        <input type="date" id="relat_inicio" value="${m1}" /></div>
      <div class="form-group inline"><label>Até</label>
        <input type="date" id="relat_fim" value="${hoje}" /></div>
      <label style="display:flex;align-items:center;gap:6px;font-size:13px">
        <input type="checkbox" id="relat_ocultos"> Incluir ocultos</label>
      <button class="btn-primary" onclick="gerarRelatorio()">Gerar</button>
      <button class="btn-neutral print-only-btn" onclick="window.print()">⎙ Imprimir</button>
    </div>
    <div id="relatConteudo"></div>
  `;
  await gerarRelatorio();
}

let _relatAtivo = 'tesouraria';
function mudarRelat(tipo, btn) {
  _relatAtivo = tipo;
  document.querySelectorAll('.relat-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  gerarRelatorio();
}

async function gerarRelatorio() {
  const loja  = state.usuario?.loja_id || 1;
  const ini   = document.getElementById('relat_inicio')?.value || '';
  const fim   = document.getElementById('relat_fim')?.value || '';
  const ocultos = document.getElementById('relat_ocultos')?.checked ? 'true' : 'false';
  const el    = document.getElementById('relatConteudo');
  if (!el) return;
  el.innerHTML = '<div class="loading">Gerando relatório…</div>';

  try {
    let html = '';
    if (_relatAtivo === 'tesouraria') {
      const r = await api('GET', `/relatorios/tesouraria?loja_id=${loja}&incluir_ocultos=${ocultos}&data_inicio=${ini}&data_fim=${fim}`);
      html = renderRelatTesouraria(r);
    } else if (_relatAtivo === 'mensalidades') {
      const r = await api('GET', `/relatorios/mensalidades?loja_id=${loja}&data_inicio=${ini}&data_fim=${fim}`);
      html = renderRelatMensalidades(r);
    } else {
      const r = await api('GET', `/relatorios/agenda?loja_id=${loja}&data_inicio=${ini}&data_fim=${fim}`);
      html = renderRelatAgenda(r);
    }
    el.innerHTML = html;
  } catch(e) {
    el.innerHTML = `<p class="error-msg">${e.message}</p>`;
  }
}

function renderRelatTesouraria(r) {
  const totalAprov = r.resumo_status?.find(s => s.status === 'aprovado')?.total || 0;
  const totalPend  = r.resumo_status?.find(s => s.status === 'pendente')?.total || 0;
  const totalRej   = r.resumo_status?.find(s => s.status === 'rejeitado')?.total || 0;

  return `
    <div class="relat-resumo">
      <div class="relat-card green"><div class="relat-val">R$ ${parseFloat(totalAprov).toFixed(2)}</div><div>Aprovado</div></div>
      <div class="relat-card yellow"><div class="relat-val">R$ ${parseFloat(totalPend).toFixed(2)}</div><div>Pendente</div></div>
      <div class="relat-card red"><div class="relat-val">R$ ${parseFloat(totalRej).toFixed(2)}</div><div>Rejeitado</div></div>
    </div>
    ${r.resumo_centros_custo?.length ? `
    <h3 style="margin:20px 0 8px">Por centro de custo</h3>
    <table class="relat-table">
      <thead><tr><th>Centro</th><th>Total aprovado</th></tr></thead>
      <tbody>${r.resumo_centros_custo.map(c => `<tr><td>${c.centro_nome}</td><td>R$ ${parseFloat(c.total).toFixed(2)}</td></tr>`).join('')}</tbody>
    </table>` : ''}
    <h3 style="margin:20px 0 8px">Lançamentos</h3>
    <table class="relat-table">
      <thead><tr><th>Data</th><th>Irmão</th><th>Evento</th><th>Valor</th><th>Status</th><th>Aprovado por</th></tr></thead>
      <tbody>${(r.compras||[]).map(c => `
        <tr class="${c.visivel ? '' : 'row-oculto'}">
          <td>${new Date(c.criado_em).toLocaleDateString('pt-BR')}</td>
          <td>${c.usuario_nome}</td>
          <td>${c.evento}</td>
          <td>R$ ${parseFloat(c.valor).toFixed(2)}</td>
          <td><span class="badge-status ${c.status}">${c.status}</span></td>
          <td>${c.aprovado_por_nome || '—'}</td>
        </tr>
        ${c.rateio?.length ? `<tr class="row-rateio"><td colspan="6">
          <small>⚖️ Rateio: ${c.rateio.map(i => `${i.centro_nome} ${i.percentual}% = R$ ${parseFloat(i.valor_rateado).toFixed(2)}`).join(' | ')}</small>
        </td></tr>` : ''}
      `).join('')}</tbody>
    </table>
  `;
}

function renderRelatMensalidades(rows) {
  if (!rows.length) return '<p class="empty-msg">Nenhuma mensalidade no período.</p>';
  return `
    <table class="relat-table">
      <thead><tr><th>Irmão</th><th>CIM</th><th>Categoria</th><th>Valor/mês</th><th>Vigência</th></tr></thead>
      <tbody>${rows.map(r => `
        <tr>
          <td>${r.nome}</td>
          <td>${r.cim || '—'}</td>
          <td>${r.categoria}</td>
          <td>R$ ${parseFloat(r.valor_mensal).toFixed(2)}</td>
          <td>${r.vigencia_inicio ? new Date(r.vigencia_inicio).toLocaleDateString('pt-BR') : '—'} → ${r.vigencia_fim ? new Date(r.vigencia_fim).toLocaleDateString('pt-BR') : 'Indefinido'}</td>
        </tr>`).join('')}
      </tbody>
    </table>`;
}

function renderRelatAgenda(rows) {
  if (!rows.length) return '<p class="empty-msg">Nenhum evento no período.</p>';
  return `
    <table class="relat-table">
      <thead><tr><th>Data</th><th>Horário</th><th>Título</th><th>Tipo</th><th>Status</th></tr></thead>
      <tbody>${rows.map(r => `
        <tr>
          <td>${new Date(r.data_evento + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
          <td>${r.hora_inicio} – ${r.hora_fim}</td>
          <td>${r.titulo}</td>
          <td>${r.tipo}</td>
          <td>${r.status}</td>
        </tr>`).join('')}
      </tbody>
    </table>`;
}


// ═══════════════════════════════════════════════════════════
//  REPOSITÓRIO DE ARQUIVOS
// ═══════════════════════════════════════════════════════════

async function renderRepositorioView() {
  const el   = document.getElementById('repositorioView');
  const loja = state.usuario?.loja_id || 1;
  const hoje = new Date().toISOString().split('T')[0];
  const m3   = new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0];

  el.innerHTML = `
    <div class="view-header">
      <h1>Repositório de Arquivos</h1>
      <button class="btn-primary" onclick="abrirUploadRepositorio()">+ Enviar arquivo</button>
    </div>
    <div class="filtros-row">
      <input type="date" id="rep_ini" value="${m3}" />
      <input type="date" id="rep_fim" value="${hoje}" />
      <select id="rep_ctx">
        <option value="">Todos os tipos</option>
        <option value="compra">Compras</option>
        <option value="geral">Geral</option>
      </select>
      <button class="btn-primary" onclick="carregarRepositorio()">Filtrar</button>
    </div>
    <div id="repLista"><div class="loading">Carregando…</div></div>
  `;
  await carregarRepositorio();
}

async function carregarRepositorio() {
  const loja = state.usuario?.loja_id || 1;
  const ini  = document.getElementById('rep_ini')?.value || '';
  const fim  = document.getElementById('rep_fim')?.value || '';
  const ctx  = document.getElementById('rep_ctx')?.value || '';
  const el   = document.getElementById('repLista');
  if (!el) return;
  el.innerHTML = '<div class="loading">Carregando…</div>';

  try {
    let q = `loja_id=${loja}`;
    if (ini) q += `&data_inicio=${ini}`;
    if (fim) q += `&data_fim=${fim}`;
    if (ctx) q += `&contexto=${ctx}`;

    const lista = await api('GET', `/repositorio?${q}`);

    if (!lista.length) { el.innerHTML = '<p class="empty-msg">Nenhum arquivo encontrado.</p>'; return; }

    el.innerHTML = `
      <table class="relat-table">
        <thead>
          <tr>
            <th>Data / Hora</th>
            <th>Enviado por</th>
            <th>Contexto</th>
            <th>Descrição</th>
            <th>Arquivo</th>
            <th>Tamanho</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          ${lista.map(a => `
            <tr>
              <td style="white-space:nowrap">${new Date(a.criado_em).toLocaleString('pt-BR')}</td>
              <td>${a.enviado_por || '—'}</td>
              <td><span class="badge-ctx ${a.contexto}">${a.contexto}</span></td>
              <td>${a.descricao || '—'}</td>
              <td>${a.nome_original || a.tipo || '—'}</td>
              <td>${a.tamanho_bytes ? (a.tamanho_bytes / 1024).toFixed(1) + ' KB' : '—'}</td>
              <td>
                ${a.download_url
                  ? `<a href="${apiBase()}${a.download_url}" target="_blank" class="btn-sm success" style="text-decoration:none">⬇ Baixar</a>`
                  : '<span style="color:#94a3b8;font-size:12px">indisponível</span>'}
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    `;
  } catch(e) {
    el.innerHTML = `<p class="error-msg">${e.message}</p>`;
  }
}

async function abrirUploadRepositorio() {
  abrirModal('Enviar arquivo ao repositório', `
    <div class="form-group"><label>Descrição / Motivo</label>
      <input class="modal-input" id="ru_desc" placeholder="Ex: Ata da Sessão Magna de Abril/2026" /></div>
    <div class="form-group"><label>Categoria</label>
      <select class="modal-input" id="ru_ctx">
        <option value="geral">Geral</option>
        <option value="ata">Ata</option>
        <option value="contrato">Contrato</option>
        <option value="comprovante">Comprovante</option>
        <option value="outro">Outro</option>
      </select></div>
    <div class="form-group"><label>Arquivo(s)</label>
      <input type="file" id="ru_arquivos" multiple class="modal-input" /></div>
    <div class="sb-msg" id="ruMsg"></div>
  `, [
    { label: 'Cancelar', cls: 'neutral', action: 'fecharModal()' },
    { label: 'Enviar', cls: 'primary', action: 'submitUploadRepositorio()' },
  ]);
}

async function submitUploadRepositorio() {
  const loja = state.usuario?.loja_id || 1;
  const desc = document.getElementById('ru_desc').value.trim();
  const ctx  = document.getElementById('ru_ctx').value;
  const arqs = document.getElementById('ru_arquivos').files;
  const msg  = document.getElementById('ruMsg');

  if (!desc) { msg.textContent = 'Informe uma descrição.'; return; }
  if (!arqs.length) { msg.textContent = 'Selecione ao menos um arquivo.'; return; }

  const fd = new FormData();
  fd.append('loja_id', loja);
  fd.append('descricao', desc);
  fd.append('contexto', ctx);
  for (const f of arqs) fd.append('arquivos', f);

  try {
    msg.textContent = 'Enviando…';
    const opts = { method: 'POST', body: fd };
    if (state.token) opts.headers = { Authorization: 'Basic ' + state.token };
    const res = await fetch(apiBase() + '/repositorio/upload', opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || 'Erro ao enviar');
    fecharModal();
    carregarRepositorio();
  } catch(e) {
    msg.textContent = e.message;
  }
}


// ═══════════════════════════════════════════════════════════
//  HELPER: modal genérico com botões
// ═══════════════════════════════════════════════════════════

function abrirModal(titulo, corpo, botoes) {
  document.getElementById('modalTitle').textContent = titulo;
  document.getElementById('modalBody').innerHTML   = corpo;
  document.getElementById('modalFooter').innerHTML = botoes.map(b =>
    `<button class="func-btn ${b.cls}" onclick="${b.action}">${b.label}</button>`
  ).join('');
  document.getElementById('modalOverlay').style.display = 'flex';
}

function fecharModal() {
  document.getElementById('modalOverlay').style.display = 'none';
}


// ═══════════════════════════════════════════════════════════
//  COMISSÕES
// ═══════════════════════════════════════════════════════════

async function renderComissoesView() {
  const el   = document.getElementById('comissoesView');
  const loja = state.usuario?.loja_id || 1;
  el.innerHTML = `
    <div class="view-header">
      <h1>Comissões & Cargos</h1>
    </div>
    <div class="rateio-grid">
      <section>
        <div class="section-header">
          <h2>Comissões</h2>
          <button class="btn-primary small" onclick="abrirNovaComissao()">+ Nova</button>
        </div>
        <div id="comissoesLista"><div class="loading">Carregando…</div></div>
      </section>
      <section>
        <div class="section-header">
          <h2>Cargos dos Irmãos</h2>
          <small style="color:var(--muted);font-size:11px">Vínculo irmão ↔ cargo no sistema</small>
        </div>
        <div id="cargosLista"><div class="loading">Carregando…</div></div>
      </section>
    </div>
  `;
  await Promise.all([carregarComissoes(loja), carregarCargosIrmaos(loja)]);
}

async function carregarComissoes(loja) {
  try {
    const lista = await api('GET', `/comissoes?loja_id=${loja}&apenas_ativas=false`);
    const el = document.getElementById('comissoesLista');
    el.innerHTML = lista.length ? lista.map(c => `
      <div class="rateio-item ${c.ativo ? '' : 'inativo'}">
        <div class="ri-nome">${c.nome} ${!c.ativo ? '<span class="badge-inativo">inativa</span>' : ''}
          <span class="badge-count">${c.total_membros} membro(s)</span>
        </div>
        ${c.descricao ? `<div class="ri-desc">${c.descricao}</div>` : ''}
        <div class="ri-itens">
          ${(c.membros||[]).map(m => `
            <span class="rateio-tag">
              ${m.irmao_nome}${m.funcao ? ' — ' + m.funcao : ''}
              <button class="tag-remove" onclick="removerMembroComissao(${c.id},${m.irmao_id})" title="Remover">✕</button>
            </span>`).join('')}
        </div>
        <div class="ri-acoes">
          <button class="btn-sm success" onclick="abrirAdicionarMembro(${c.id},'${c.nome.replace(/'/g,"\\'")}')">+ Membro</button>
          <button class="btn-sm neutral" onclick="editarComissao(${c.id},'${c.nome.replace(/'/g,"\\'")}','${(c.descricao||'').replace(/'/g,"\\'")}',${c.ativo})">Editar</button>
          <button class="btn-sm danger"  onclick="deletarComissao(${c.id})">Excluir</button>
        </div>
      </div>`).join('')
    : '<p class="empty-msg">Nenhuma comissão cadastrada.</p>';
  } catch(e) {
    document.getElementById('comissoesLista').innerHTML = `<p class="error-msg">${e.message}</p>`;
  }
}

async function carregarCargosIrmaos(loja) {
  try {
    const irmaos = await api('GET', `/irmaos/cargos?loja_id=${loja}`);
    const CARGOS_SISTEMA = [
      'veneravel_mestre','primeiro_vigilante','segundo_vigilante',
      'financeiro','secretario','orador','chanceler','hospitaleiro',
      'guarda_templo','mestre_cerimonias'
    ];
    const el = document.getElementById('cargosLista');
    el.innerHTML = irmaos.length ? irmaos.map(i => `
      <div class="cargo-irmao-row">
        <div class="ci-nome">${i.nome}${i.cim ? ` <span class="cim-badge">${i.cim}</span>` : ''}</div>
        <select class="ci-select" data-id="${i.id}" onchange="salvarCargoIrmao(${i.id}, this.value, ${loja})">
          <option value="">— sem cargo —</option>
          ${CARGOS_SISTEMA.map(c => `<option value="${c}" ${i.cargo_sistema===c?'selected':''}>${c.replace(/_/g,' ')}</option>`).join('')}
        </select>
      </div>`).join('')
    : '<p class="empty-msg">Nenhum irmão cadastrado.</p>';
  } catch(e) {
    document.getElementById('cargosLista').innerHTML = `<p class="error-msg">${e.message}</p>`;
  }
}

async function salvarCargoIrmao(irmaoId, cargo, loja) {
  try {
    await api('PUT', `/irmaos/cargos?loja_id=${loja}`, { irmao_id: irmaoId, cargo: cargo || '' });
  } catch(e) { alert(e.message); carregarCargosIrmaos(loja); }
}

async function abrirNovaComissao() {
  abrirModal('Nova Comissão', `
    <div class="form-group"><label>Nome</label>
      <input class="modal-input" id="nc2_nome" placeholder="Ex: Comissão de Iniciação" /></div>
    <div class="form-group"><label>Descrição</label>
      <input class="modal-input" id="nc2_desc" placeholder="Opcional" /></div>
    <div class="sb-msg" id="nc2Msg"></div>
  `, [
    { label: 'Cancelar', cls: 'neutral', action: 'fecharModal()' },
    { label: 'Salvar', cls: 'primary', action: 'salvarNovaComissao()' },
  ]);
}

async function salvarNovaComissao() {
  const loja = state.usuario?.loja_id || 1;
  const nome = document.getElementById('nc2_nome').value.trim();
  const desc = document.getElementById('nc2_desc').value.trim();
  if (!nome) { document.getElementById('nc2Msg').textContent = 'Informe o nome.'; return; }
  try {
    await api('POST', '/comissoes', { loja_id: loja, nome, descricao: desc || null });
    fecharModal(); renderComissoesView();
  } catch(e) { document.getElementById('nc2Msg').textContent = e.message; }
}

async function editarComissao(id, nome, desc, ativo) {
  abrirModal('Editar Comissão', `
    <div class="form-group"><label>Nome</label>
      <input class="modal-input" id="ec_nome" value="${nome}" /></div>
    <div class="form-group"><label>Descrição</label>
      <input class="modal-input" id="ec_desc" value="${desc}" /></div>
    <div class="form-group"><label style="display:flex;gap:8px;align-items:center">
      <input type="checkbox" id="ec_ativo" ${ativo?'checked':''}> Ativa</label></div>
    <div class="sb-msg" id="ecMsg"></div>
  `, [
    { label: 'Cancelar', cls: 'neutral', action: 'fecharModal()' },
    { label: 'Salvar', cls: 'primary', action: `atualizarComissao(${id})` },
  ]);
}

async function atualizarComissao(id) {
  const nome  = document.getElementById('ec_nome').value.trim();
  const desc  = document.getElementById('ec_desc').value.trim();
  const ativo = document.getElementById('ec_ativo').checked;
  try {
    await api('PUT', `/comissoes/${id}`, { nome, descricao: desc || null, ativo });
    fecharModal(); renderComissoesView();
  } catch(e) { document.getElementById('ecMsg').textContent = e.message; }
}

async function deletarComissao(id) {
  if (!confirm('Excluir esta comissão e todos os seus membros?')) return;
  try { await api('DELETE', `/comissoes/${id}`); renderComissoesView(); }
  catch(e) { alert(e.message); }
}

async function abrirAdicionarMembro(comissaoId, comissaoNome) {
  const loja = state.usuario?.loja_id || 1;
  let irmaos = [];
  try { irmaos = await api('GET', `/irmaos?loja_id=${loja}`); } catch(_) {}
  abrirModal(`Adicionar membro — ${comissaoNome}`, `
    <div class="form-group"><label>Irmão</label>
      <select class="modal-input" id="am_irmao">
        <option value="">Selecione…</option>
        ${irmaos.map(i => `<option value="${i.id}">${i.nome}</option>`).join('')}
      </select></div>
    <div class="form-group"><label>Função na comissão</label>
      <input class="modal-input" id="am_funcao" placeholder="Ex: Presidente, Relator…" /></div>
    <div class="form-group inline"><label>Início</label>
      <input type="date" class="modal-input" id="am_inicio" /></div>
    <div class="form-group inline"><label>Fim</label>
      <input type="date" class="modal-input" id="am_fim" /></div>
    <div class="sb-msg" id="amMsg"></div>
  `, [
    { label: 'Cancelar', cls: 'neutral', action: 'fecharModal()' },
    { label: 'Adicionar', cls: 'primary', action: `salvarMembro(${comissaoId})` },
  ]);
}

async function salvarMembro(comissaoId) {
  const irmaoId = parseInt(document.getElementById('am_irmao').value);
  const funcao  = document.getElementById('am_funcao').value.trim() || null;
  const inicio  = document.getElementById('am_inicio').value || null;
  const fim     = document.getElementById('am_fim').value || null;
  if (!irmaoId) { document.getElementById('amMsg').textContent = 'Selecione um irmão.'; return; }
  try {
    await api('POST', `/comissoes/${comissaoId}/membros`,
      { irmao_id: irmaoId, funcao, data_inicio: inicio, data_fim: fim });
    fecharModal(); renderComissoesView();
  } catch(e) { document.getElementById('amMsg').textContent = e.message; }
}

async function removerMembroComissao(comissaoId, irmaoId) {
  try {
    await api('DELETE', `/comissoes/${comissaoId}/membros/${irmaoId}`);
    renderComissoesView();
  } catch(e) { alert(e.message); }
}


// ═══════════════════════════════════════════════════════════
//  PERMISSÕES POR CARGO
// ═══════════════════════════════════════════════════════════

async function renderPermissoesView() {
  const el   = document.getElementById('permissoesView');
  const loja = state.usuario?.loja_id || 1;
  el.innerHTML = `
    <div class="view-header">
      <h1>Permissões por Cargo</h1>
      <small style="color:var(--muted);font-size:12px">Configure o que cada cargo pode fazer no sistema</small>
    </div>
    <div id="permissoesConteudo"><div class="loading">Carregando…</div></div>
  `;
  try {
    const data = await api('GET', `/permissoes?loja_id=${loja}`);
    renderMatrizPermissoes(data.permissoes, data.recursos, loja);
  } catch(e) {
    document.getElementById('permissoesConteudo').innerHTML = `<p class="error-msg">${e.message}</p>`;
  }
}

const CARGOS_LABELS = {
  veneravel_mestre:    'Venerável Mestre',
  primeiro_vigilante:  '1º Vigilante',
  segundo_vigilante:   '2º Vigilante',
  financeiro:          'Financeiro',
  secretario:          'Secretário',
  orador:              'Orador',
  chanceler:           'Chanceler',
  hospitaleiro:        'Hospitaleiro',
  guarda_templo:       'Guarda do Templo',
  mestre_cerimonias:   'Mestre de Cerimônias',
};

function renderMatrizPermissoes(permissoes, recursos, loja) {
  const cargos = Object.keys(CARGOS_LABELS);
  const html = cargos.map(cargo => {
    const perm = permissoes[cargo] || {};
    return `
      <div class="perm-card">
        <div class="perm-cargo-titulo">${CARGOS_LABELS[cargo] || cargo}</div>
        <div class="perm-recursos">
          ${Object.entries(recursos).map(([recurso, acoes]) => `
            <div class="perm-recurso">
              <div class="perm-recurso-nome">${recurso}</div>
              <div class="perm-acoes">
                ${acoes.map(acao => {
                  const checked = (perm[recurso] || []).includes(acao) ? 'checked' : '';
                  return `<label class="perm-check">
                    <input type="checkbox" ${checked}
                      onchange="togglePermissao('${cargo}','${recurso}','${acao}',this.checked,${loja})">
                    ${acao}
                  </label>`;
                }).join('')}
              </div>
            </div>`).join('')}
        </div>
      </div>`;
  }).join('');
  document.getElementById('permissoesConteudo').innerHTML =
    `<div class="perm-grid">${html}</div>`;
}

async function togglePermissao(cargo, recurso, acao, checked, loja) {
  try {
    // Lê o estado atual do DOM para montar a lista completa de ações
    const checks = document.querySelectorAll(
      `input[onchange*="'${cargo}','${recurso}'"]`
    );
    const acoes = [...checks].filter(c => c.checked).map(c => {
      const m = c.getAttribute('onchange').match(/'([^']+)'\s*,this/);
      return m ? m[1] : null;
    }).filter(Boolean);
    await api('PUT', `/permissoes?loja_id=${loja}`, { cargo, recurso, acoes });
  } catch(e) {
    alert('Erro ao salvar: ' + e.message);
    renderPermissoesView();
  }
}


// Fecha sidebar ao navegar (mobile)
function _navClick() {
  if (window.innerWidth <= 768) toggleSidebar(true);
}

document.addEventListener('DOMContentLoaded', () => {
  renderSidebar();
  renderHome();

  // Estado inicial: mostrar símbolo, esconder tudo mais
  mostrarView('preLoginView');

  document.getElementById('loginBtn').addEventListener('click', login);
  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.getElementById('abrirCadastroBtn').addEventListener('click', abrirCadastro);

  document.getElementById('password').addEventListener('keydown', e => {
    if (e.key === 'Enter') login();
  });
});
