'use strict';

// ═══════════════════════════════════════════════════════════
//  DADOS DOS CARGOS
// ═══════════════════════════════════════════════════════════

const CARGOS = [
  {
    id: 'admin_principal',
    label: 'Administrador Principal',
    nivel: 100,
    icone: '🕶️',
    cor: '#7c3aed',
    descricao: 'Acesso irrestrito ao sistema. Gerencia todas as lojas, usuários, operações financeiras e configurações.',
    responsabilidades: [
      { icone: '🏛️', titulo: 'Supervisão geral',         desc: 'Acesso e gestão de todas as lojas cadastradas no sistema.' },
      { icone: '👤', titulo: 'Gestão de usuários',       desc: 'Cria, ativa, bloqueia e configura contas de usuários.' },
      { icone: '📋', titulo: 'Aprovação de contratos',   desc: 'Aprova, rejeita e ativa contratos de qualquer loja.' },
      { icone: '💰', titulo: 'Controle financeiro',      desc: 'Autoriza reembolsos, gera cobranças e acompanha pagamentos.' },
      { icone: '🔍', titulo: 'Auditoria',                desc: 'Visualiza trilha de auditoria de todas as operações.' },
    ],
    funcionalidades: ['tarefas','ver_contratos','criar_contrato','enviar_contrato','decidir_contrato','ativar_contrato',
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
    funcionalidades: ['tarefas','ver_contratos','criar_contrato','enviar_contrato','decidir_contrato','ativar_contrato',
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
    funcionalidades: ['tarefas','decidir_contrato','criar_mensagem','criar_caso','criar_reembolso',
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
    funcionalidades: ['tarefas','criar_mensagem','criar_caso','upload_arquivo'],
  },
  {
    id: 'financeiro',
    label: 'Tesoureiro',
    nivel: 60,
    icone: '💼',
    cor: '#059669',
    descricao: 'Responsável pela tesouraria da loja: controla reembolsos, cobranças e pagamentos.',
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
    funcionalidades: ['ver_contratos','criar_contrato','enviar_contrato','criar_mensagem','criar_caso',
                      'criar_reembolso','upload_arquivo'],
  },
  {
    id: 'orador',
    label: 'Orador',
    nivel: 60,
    icone: '⚖️',
    cor: '#0f766e',
    descricao: 'Defende a Constituição e os Regulamentos da loja, emite pareceres e fiscaliza a legalidade das propostas.',
    responsabilidades: [
      { icone: '⚖️', titulo: 'Fiscalização normativa', desc: 'Garante que as deliberações respeitem a Constituição e os Regulamentos.' },
      { icone: '📢', titulo: 'Pareceres e tribuna',     desc: 'Emite pareceres técnicos e usa a palavra em defesa da legalidade.' },
      { icone: '📋', titulo: 'Análise de propostas',    desc: 'Examina propostas de admissão, filiação e regularização de irmãos.' },
      { icone: '📁', titulo: 'Livro de proposta',        desc: 'Registra e acompanha as propostas submetidas à loja.' },
    ],
    funcionalidades: ['criar_mensagem','upload_arquivo'],
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
    funcionalidades: ['inventario_loja','upload_arquivo'],
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
    id: 'mestre_banquete',
    label: 'Mestre de Banquete',
    nivel: 55,
    icone: '🍽️',
    cor: '#c2410c',
    descricao: 'Responsável pelo Ágape e eventos gastronômicos da loja. Coordena orçamentos, compras e logística das refeições nas sessões.',
    responsabilidades: [
      { icone: '🍽️', titulo: 'Organização do Ágape',  desc: 'Planeja e coordena ágapes e refeições nas sessões.' },
      { icone: '🛒', titulo: 'Compras e orçamentos',   desc: 'Solicita orçamentos e registra compras de insumos.' },
      { icone: '💰', titulo: 'Controle de gastos',     desc: 'Acompanha despesas com alimentação e eventos.' },
      { icone: '📁', titulo: 'Documentação',           desc: 'Envia notas fiscais, cardápios e registros de eventos.' },
    ],
    funcionalidades: ['criar_reembolso','aprovar_reembolso','upload_arquivo'],
  },
  {
    id: 'irmao_operacional',
    label: 'Irmão do Quadro',
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
    acao: async (campos) => api('POST', '/contracts', {
      loja_id: +campos.f_loja, templo_id: +campos.f_templo,
      regra_recorrencia: campos.f_regra,
      hora_inicio_sessao: campos.f_inicio, hora_fim_sessao: campos.f_fim,
      vigencia_inicio: campos.f_vig_ini, vigencia_fim: campos.f_vig_fim || null,
    }),
  },
  enviar_contrato: {
    icone: '📤', titulo: 'Enviar para Aprovação',
    desc: 'Submete um contrato já criado para a análise e aprovação dos responsáveis.',
    quem: 'admin_principal, veneravel_mestre, secretario',
    cor: '#0891b2',
    campos: [
      { id: 'f_contrato_id', label: 'ID do Contrato', tipo: 'number', valor: '' },
    ],
    acao: async (c) => api('POST', `/contracts/${c.f_contrato_id}/submit`),
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
    acao: async (c) => api('POST', `/contracts/${c.f_contrato_id}/decision`, { decisao: c.f_decisao, observacao: c.f_obs || null }),
  },
  ativar_contrato: {
    icone: '🟢', titulo: 'Ativar Contrato',
    desc: 'Coloca um contrato aprovado em vigor, permitindo o uso do recurso.',
    quem: 'admin_principal, veneravel_mestre',
    cor: '#059669',
    campos: [
      { id: 'f_contrato_id', label: 'ID do Contrato', tipo: 'number', valor: '' },
    ],
    acao: async (c) => api('POST', '/contracts/activate', { contrato_id: +c.f_contrato_id }),
  },
  criar_mensagem: {
    icone: '✉️', titulo: 'Criar Mensagem',
    desc: 'Registra uma nova mensagem ou comunicado no sistema.',
    quem: 'admin, veneravel, 1º/2º vigilante, secretário, financeiro',
    cor: '#7c3aed',
    campos: [
      { id: 'f_loja',     label: 'ID da Loja',   tipo: 'number', valor: '1' },
      { id: 'f_tipo',     label: 'Tipo',         tipo: 'text',   valor: 'texto' },
      { id: 'f_contexto', label: 'Contexto',     tipo: 'text',   valor: 'geral' },
      { id: 'f_conteudo', label: 'Conteúdo',     tipo: 'text',   valor: '' },
    ],
    acao: async (c) => api('POST', '/messages', {
      loja_id: +c.f_loja, tipo: c.f_tipo, contexto: c.f_contexto, texto: c.f_conteudo,
    }),
  },
  criar_caso: {
    icone: '📂', titulo: 'Abrir Caso Operacional',
    desc: 'Cria um caso operacional a partir de mensagens existentes.',
    quem: 'admin, veneravel, 1º/2º vigilante, secretário, financeiro',
    cor: '#d97706',
    campos: [
      { id: 'f_loja',  label: 'ID da Loja',     tipo: 'number', valor: '1' },
      { id: 'f_tipo',  label: 'Tipo do Caso',   tipo: 'text',   valor: 'operacional' },
      { id: 'f_titulo',label: 'Título do Caso', tipo: 'text',   valor: '' },
      { id: 'f_msgs',  label: 'IDs de Mensagens (vírgula)', tipo: 'text', valor: '' },
    ],
    acao: async (c) => api('POST', '/cases/from-messages', {
      loja_id_alvo: +c.f_loja, tipo_caso: c.f_tipo, titulo: c.f_titulo,
      mensagem_ids: c.f_msgs.split(',').map(s => +s.trim()).filter(Boolean),
    }),
  },
  criar_reembolso: {
    icone: '💸', titulo: 'Solicitar Reembolso de Ágape',
    desc: 'Solicita reembolso para irmão que bancou um ágape.',
    quem: 'todos os cargos',
    cor: '#059669',
    customOnClick: 'abrirSolicitarReembolso()',
  },
  aprovar_reembolso: {
    icone: '✔️', titulo: 'Aprovar / Rejeitar Reembolso',
    desc: 'Analisa as solicitações de reembolso pendentes e decide aprovação ou rejeição.',
    quem: 'admin, veneravel, 1º vigilante, financeiro, mestre de banquete',
    cor: '#059669',
    customOnClick: 'abrirAprovarReembolsoLista()',
  },
  pagar_reembolso: {
    icone: '💳', titulo: 'Marcar como Pago',
    desc: 'Confirma o pagamento de um reembolso aprovado.',
    quem: 'admin_principal, veneravel_mestre, financeiro',
    cor: '#059669',
    campos: [
      { id: 'f_reemb',  label: 'ID do Reembolso', tipo: 'number', valor: '' },
      { id: 'f_valor',  label: 'Valor Pago',       tipo: 'text',   valor: '' },
      { id: 'f_obs',    label: 'Observação',        tipo: 'text',   valor: '' },
    ],
    acao: async (c) => api('POST', `/reimbursements/${c.f_reemb}/pay`, {
      valor_aprovado: c.f_valor || null, observacao_financeiro: c.f_obs || null,
    }),
  },
  upload_arquivo: {
    icone: '📁', titulo: 'Enviar Arquivo',
    desc: 'Envia documentos, fotos ou comprovantes para o repositório da loja. O sistema identifica automaticamente comprovantes de compra.',
    quem: 'admin, veneravel, 1º/2º vigilante, secretário, tesoureiro',
    cor: '#475569',
    customOnClick: 'abrirUploadArquivoRapido()',
  },
  gerar_cobranca: {
    icone: '🧾', titulo: 'Gerar Cobrança',
    desc: 'Emite uma cobrança vinculada a um contrato ativo.',
    quem: 'admin_principal, veneravel_mestre, financeiro',
    cor: '#b45309',
    campos: [
      { id: 'f_contrato', label: 'ID do Contrato',    tipo: 'number', valor: '' },
      { id: 'f_comp',     label: 'Competência (YYYY-MM)', tipo: 'text', valor: '' },
      { id: 'f_valor',    label: 'Valor (R$)',         tipo: 'text',   valor: '' },
      { id: 'f_venc',     label: 'Vencimento (YYYY-MM-DD)', tipo: 'text', valor: '' },
    ],
    acao: async (c) => api('POST', '/billings', {
      contrato_id: +c.f_contrato, competencia: c.f_comp,
      valor: c.f_valor, data_vencimento: c.f_venc,
    }),
  },
  inventario_loja: {
    icone: '📋', titulo: 'Inventário Digital',
    desc: 'Gerencie o inventário físico da loja: itens, quantidades, condições e necessidades de compra.',
    quem: 'arquiteto, almoxarife',
    cor: '#475569',
    customOnClick: "abrirModulo('inventario')",
  },
  tarefas: {
    icone: '✅', titulo: 'Tarefas',
    desc: 'Crie, atribua e acompanhe tarefas da loja com prioridade, vencimento e status em tempo real.',
    quem: 'admin_principal, veneravel_mestre, secretario, financeiro, chanceler, primeiro_vigilante, segundo_vigilante',
    cor: '#16a34a',
    customOnClick: "abrirModulo('tarefas')",
  },
  ver_contratos: {
    icone: '📄', titulo: 'Ver Contratos',
    desc: 'Lista todos os contratos da loja com vigência, situação financeira e acesso ao arquivo para leitura.',
    quem: 'admin_principal, veneravel_mestre, secretario',
    cor: '#0369a1',
    customOnClick: "abrirModulo('ver_contratos')",
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
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), 35000);
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
    signal: controller.signal,
  };
  if (state.token) opts.headers['Authorization'] = 'Basic ' + state.token;
  if (body)        opts.body = JSON.stringify(body);
  try {
    const res = await fetch(apiBase() + path, opts);
    clearTimeout(tid);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.detail || `Erro ${res.status}`), { data });
    return data;
  } catch (e) {
    clearTimeout(tid);
    if (e.name === 'AbortError')
      throw new Error('Servidor demorou para responder. O sistema pode estar iniciando — aguarde 30s e tente novamente.');
    throw e;
  }
}

async function downloadComAuth(url, nome) {
  try {
    const opts = { headers: {} };
    if (state.token) opts.headers['Authorization'] = 'Basic ' + state.token;
    const res = await fetch(apiBase() + url, opts);
    if (!res.ok) { alert('Arquivo não encontrado ou indisponível.'); return; }
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nome || 'arquivo';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  } catch(e) { alert('Erro ao baixar: ' + e.message); }
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
    const r = await api('POST', '/registrar', { nome, nome_usuario: usuario, email, senha });
    if (r.status === 'active') {
      document.getElementById('cadastroForm').style.display       = 'none';
      document.getElementById('cadastroConfirmado').style.display = 'block';
      document.getElementById('cadastroEmailEnviado').textContent = email;
      document.querySelector('#cadastroConfirmado .modal-body div[style]').innerHTML =
        `<div style="font-size:32px">✅</div>
         <div style="font-size:16px;font-weight:700;margin-top:10px">Conta criada com sucesso!</div>
         <div style="color:#64748b;margin-top:6px;font-size:13px;line-height:1.5">
           Sua conta está ativa.<br/>Faça login com <strong>${email}</strong>.
         </div>`;
    } else {
      document.getElementById('cadastroEmailEnviado').textContent = email;
      document.getElementById('cadastroForm').style.display       = 'none';
      document.getElementById('cadastroConfirmado').style.display = 'block';
    }
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
  const btn   = document.getElementById('loginBtn');

  if (!email || !pass) { msg.textContent = 'Preencha e-mail e senha.'; return; }

  state.token = btoa(email + ':' + pass);
  msg.textContent = 'Conectando…';
  btn.disabled = true;

  try {
    const me = await api('GET', '/auth/me');
    state.usuario = me;
    localStorage.setItem('sd_token', state.token);
    localStorage.setItem('sd_usuario', JSON.stringify(me));
    renderAutenticado(me);
    msg.textContent = '';
  } catch (e) {
    state.token = null;
    msg.className = 'sb-msg';
    msg.style.color = '#ef4444';
    msg.textContent = e.message || 'Credenciais inválidas.';
  } finally {
    btn.disabled = false;
  }
}

function mostrarView(id) {
  ['preLoginView','homeView','cargoView','irmaoView','comprasView','rateioView',
   'relatoriosView','permissoesView','comissoesView','repositorioView',
   'agendaView','irmaoDetalheView','usuariosView','inventarioView','whatsappView',
   'contratosView','tarefasView','lojasView','complexoView','tenantsView',
   'auditView'].forEach(v => {
    const el = document.getElementById(v);
    if (el) el.style.display = v === id ? 'block' : 'none';
  });
}

function logout() {
  localStorage.removeItem('sd_token');
  localStorage.removeItem('sd_usuario');
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
  renderSidebar();
  const ini = (me.nome || me.email || '?')[0].toUpperCase();
  document.getElementById('userAvatar').textContent = ini;
  mostrarView('homeView');
  atualizarNavAtivo();
  atualizarBadgeNotif();
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
    <div class="sidebar-nav-module" id="nav-presencas" onclick="abrirModulo('presencas')">
      <span style="font-size:15px">✅</span><span>Presenças</span>
    </div>
    <div class="sidebar-nav-module" id="nav-mensalidades" onclick="abrirModulo('mensalidades')">
      <span style="font-size:15px">💰</span><span>Mensalidades</span>
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
    <div class="sidebar-nav-module" id="nav-repositorio" onclick="abrirModulo('repositorio')">
      <span style="font-size:15px">🗄️</span><span>Repositório</span>
    </div>
    ${state.usuario?.cargo === 'admin_principal' ? `
    <div class="sidebar-nav-module" id="nav-lojas" onclick="abrirModulo('lojas')">
      <span style="font-size:15px">🏛️</span><span>Lojas & Complexos</span>
    </div>
    <div class="sidebar-nav-module" id="nav-tenants" onclick="abrirModulo('tenants')">
      <span style="font-size:15px">💳</span><span>Assinantes SaaS</span>
    </div>` : ''}
    ${['admin_principal','veneravel_mestre'].includes(state.usuario?.cargo) || state.usuario?.loja_tipo === 'complexo' ? `
    <div class="sidebar-nav-module" id="nav-complexo_dash" onclick="abrirModulo('complexo_dash')">
      <span style="font-size:15px">📊</span><span>Dashboard Complexo</span>
    </div>` : ''}
    ${['admin_principal','veneravel_mestre'].includes(state.usuario?.cargo) ? `
    <div class="sidebar-nav-module" id="nav-permissoes" onclick="abrirModulo('permissoes')">
      <span style="font-size:15px">🔐</span><span>Permissões</span>
    </div>` : ''}
    <div class="sidebar-nav-module" id="nav-usuarios" onclick="abrirModulo('usuarios')">
      <span style="font-size:15px">🔑</span><span>Usuários</span>
    </div>
    <div class="sidebar-nav-module" id="nav-inventario" onclick="abrirModulo('inventario')">
      <span style="font-size:15px">📋</span><span>Inventário</span>
    </div>
    <div class="sidebar-nav-module" id="nav-notificacoes" onclick="abrirInbox()">
      <span style="font-size:15px">🔔</span><span>Notificações</span>
      <span id="notifBadge" style="display:none;background:#dc2626;color:#fff;border-radius:9px;padding:1px 6px;font-size:10px;margin-left:auto"></span>
    </div>
    ${['admin_principal','veneravel_mestre'].includes(state.usuario?.cargo) ? `
    <div class="sidebar-nav-module" id="nav-whatsapp" onclick="abrirModulo('whatsapp')">
      <span style="font-size:15px">💬</span><span>WhatsApp</span>
      <span id="wppStatusDot" style="width:8px;height:8px;border-radius:50%;background:#94a3b8;display:inline-block;margin-left:auto"></span>
    </div>` : ''}
    ${state.usuario?.cargo === 'admin_principal' ? `
    <div class="sidebar-nav-module" id="nav-auditoria" onclick="abrirModulo('auditoria')">
      <span style="font-size:15px">📋</span><span>Trilha de Auditoria</span>
    </div>` : ''}
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
    mensalidades:   () => { mostrarView('irmaoView');     renderMensalidadesView(); },
    boletos:        () => { mostrarView('irmaoView');     renderBoletosView(); },
    aniversarios:   () => { mostrarView('irmaoView');     renderAniversariosView(); },
    agenda:         () => { mostrarView('agendaView');    renderAgendaView(); },
    presencas:      () => { mostrarView('irmaoView');     renderPresencasView(); },
    compras:        () => { mostrarView('comprasView');    renderComprasView(); },
    rateio:         () => { mostrarView('rateioView');     renderRateioView(); },
    relatorios:     () => { mostrarView('relatoriosView'); renderRelatoriosView(); },
    comissoes:      () => { mostrarView('comissoesView');   renderComissoesView(); },
    permissoes:     () => { mostrarView('permissoesView');  renderPermissoesView(); },
    repositorio:    () => { mostrarView('repositorioView'); renderRepositorioView(); },
    usuarios:       () => { mostrarView('usuariosView');   renderUsuariosView(); },
    inventario:     () => { mostrarView('inventarioView'); renderInventarioView(); },
    whatsapp:       () => { mostrarView('whatsappView');   renderWhatsAppView(); },
    ver_contratos:  () => { mostrarView('contratosView');  renderContratosView(); },
    tarefas:        () => { mostrarView('tarefasView');    renderTarefasView(); },
    lojas:          () => { mostrarView('lojasView');      renderLojasView(); },
    complexo_dash:  () => { mostrarView('complexoView');   renderComplexoDashView(); },
    tenants:        () => { mostrarView('tenantsView');    renderTenantsView(); },
    auditoria:      () => { mostrarView('auditView');      renderAuditoriaView(); },
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

    const onclick = f.customOnClick || `abrirModal('${fid}')`;
    const btns = autenticado
      ? `<div class="func-card-actions">
           <button class="func-btn primary" onclick="${onclick}">Executar ação</button>
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
//  HOME VIEW — DASHBOARD
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
  carregarDashboard();
}

async function carregarDashboard() {
  const hero = document.querySelector('.home-hero');
  if (!hero || !state.usuario?.loja_id) return;
  try {
    const d = await api('GET', '/dashboard');
    const anivHtml = d.aniversariantes?.length
      ? d.aniversariantes.slice(0,5).map(a =>
          `<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #f1f5f9">
            <span>🎂</span>
            <div style="font-size:13px"><strong>${a.nome}</strong>
              ${a.data_nascimento?`<span style="color:#94a3b8;font-size:11px"> · dia ${a.data_nascimento.split('-')[2]}</span>`:''}
            </div>
          </div>`).join('')
      : '<div style="color:#94a3b8;font-size:13px">Nenhum este mês.</div>';

    const proxHtml = d.proximo_evento
      ? `<div style="font-size:14px;font-weight:600">${d.proximo_evento.titulo}</div>
         <div style="font-size:12px;color:#64748b;margin-top:2px">${formatData(d.proximo_evento.data)}${d.proximo_evento.hora_inicio ? ' · ' + String(d.proximo_evento.hora_inicio).substring(0,5) : ''}</div>`
      : '<div style="color:#94a3b8;font-size:13px">Nenhum evento próximo.</div>';

    hero.insertAdjacentHTML('afterend', `
      <div id="dashboardPanel" style="margin-bottom:24px">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:16px">
          <div class="form-card" style="text-align:center;padding:18px 12px;cursor:pointer" onclick="abrirModulo('cadastro_irmao')">
            <div style="font-size:30px;font-weight:700;color:#2563eb">${d.total_irmaos}</div>
            <div style="font-size:12px;color:#64748b;margin-top:3px">Irmãos Ativos</div>
          </div>
          <div class="form-card" style="text-align:center;padding:18px 12px;cursor:pointer" onclick="abrirModulo('mensalidades')">
            <div style="font-size:30px;font-weight:700;color:${d.inadimplentes>0?'#dc2626':'#16a34a'}">${d.inadimplentes}</div>
            <div style="font-size:12px;color:#64748b;margin-top:3px">Mensalidades em Atraso</div>
          </div>
          <div class="form-card" style="text-align:center;padding:18px 12px;cursor:pointer" onclick="abrirModulo('tarefas')">
            <div style="font-size:30px;font-weight:700;color:${d.tarefas_pendentes>0?'#f59e0b':'#16a34a'}">${d.tarefas_pendentes}</div>
            <div style="font-size:12px;color:#64748b;margin-top:3px">Tarefas Pendentes</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-card">
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;margin-bottom:10px">📅 Próximo Evento</div>
            ${proxHtml}
          </div>
          <div class="form-card">
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;margin-bottom:10px">🎂 Aniversariantes do Mês</div>
            ${anivHtml}
          </div>
        </div>
      </div>
    `);
  } catch(_) {}
}

// ═══════════════════════════════════════════════════════════
//  MÓDULO — CADASTRO DE IRMÃOS
// ═══════════════════════════════════════════════════════════

const GRAUS = [
  { v: 1, label: '1° Aprendiz',    cor: '#3b82f6', bg: '#eff6ff' },
  { v: 2, label: '2° Companheiro', cor: '#16a34a', bg: '#f0fdf4' },
  { v: 3, label: '3° Mestre',      cor: '#b45309', bg: '#fffbeb' },
];
const STATUS_IRMAO = [
  { v: 'ativo',      label: 'Ativo',      cor: '#16a34a', bg: '#f0fdf4' },
  { v: 'irregular',  label: 'Irregular',  cor: '#d97706', bg: '#fffbeb' },
  { v: 'licenca',    label: 'Licença',    cor: '#0891b2', bg: '#f0f9ff' },
  { v: 'suspenso',   label: 'Suspenso',   cor: '#dc2626', bg: '#fef2f2' },
  { v: 'falecido',   label: 'Falecido',   cor: '#6b7280', bg: '#f9fafb' },
];
function tagGrau(g) {
  const gr = GRAUS.find(x => x.v == g) || GRAUS[0];
  return `<span style="background:${gr.bg};color:${gr.cor};border:1px solid ${gr.cor}33;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600">${gr.label}</span>`;
}
function tagStatus(s) {
  if (!s || s === 'ativo') return '';
  const st = STATUS_IRMAO.find(x => x.v === s);
  if (!st) return '';
  return `<span style="background:${st.bg};color:${st.cor};border:1px solid ${st.cor}33;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600">${st.label}</span>`;
}

// Cargos da loja para o cadastro de irmãos
const CARGOS_LOJA_OPCOES = [
  '', 'Venerável Mestre', '1º Vigilante', '2º Vigilante', 'Secretário',
  'Tesoureiro', 'Orador', 'Chanceler', 'Hospitaleiro', 'Guarda do Templo',
  'Mestre de Cerimônias', 'Mestre de Banquete', 'Almoxarife', 'Arquiteto',
  'Obreiro', 'Irmão do Quadro',
];

// Categorias dinâmicas — carregadas da API (fallback para fixas)
let _categoriasMensalidade = [];

async function carregarCategoriasMensalidade(loja) {
  try {
    const lista = await api('GET', `/categorias-mensalidade?loja_id=${loja}`);
    _categoriasMensalidade = lista.filter(c => c.ativo);
  } catch(_) {
    _categoriasMensalidade = [
      { id: 'regular',  nome: 'Regular',      descricao: 'Mensalidade padrão da loja' },
      { id: 'idoso',    nome: 'Idoso',         descricao: 'Valor reduzido para irmãos com 65 anos ou mais' },
      { id: 'potencia', nome: 'Com Potência',  descricao: 'Mensalidade + taxa da Potência' },
      { id: 'especial', nome: 'Especial',      descricao: 'Regra personalizada por irmão' },
    ];
  }
}

function tagMensalidade(cat) {
  const c = _categoriasMensalidade.find(x => (x.id || x.nome?.toLowerCase()) === cat);
  return c ? `<span class="tag tag-regular">${c.nome || c.id}</span>` : (cat ? `<span class="tag tag-regular">${cat}</span>` : '');
}

async function renderIrmaoView() {
  const view = document.getElementById('irmaoView');
  const loja = state.usuario?.loja_id || 1;

  await carregarCategoriasMensalidade(loja);

  const isAdmin = ['admin_principal','veneravel_mestre'].includes(state.usuario?.cargo);

  let lojasList = [];
  try { lojasList = await api('GET', '/lojas'); } catch(_) {}
  const categoriaCards = _categoriasMensalidade.map(c => `
    <div class="cat-card">
      <div class="cat-card-titulo">${c.nome || c.id}</div>
      <div class="cat-card-desc">${c.descricao || ''}</div>
      ${isAdmin ? `<div style="display:flex;gap:6px;margin-top:8px">
        <button class="btn-sm neutral" onclick="editarCategoriaMens(${c.id},'${(c.nome||'').replace(/'/g,"\\'")}','${(c.descricao||'').replace(/'/g,"\\'")}')">Editar</button>
        <button class="btn-sm danger"  onclick="excluirCategoriaMens(${c.id})">Excluir</button>
      </div>` : ''}
    </div>
  `).join('');

  let irmaos = [];
  try { irmaos = await api('GET', `/irmaos?loja_id=${loja}`); } catch(_) {}
  _todosIrmaos = irmaos;
  _filtroStatus = 'ativo';
  _irmaoPage = 0;

  const irmaoCards = irmaos.filter(ir => (ir.status||'ativo') === 'ativo').map(ir => {
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
      <div class="irmao-card" onclick="abrirIrmao(${ir.id})" style="cursor:pointer" title="Ver perfil completo">
        <div class="irmao-card-top">
          <div class="irmao-avatar">${ini}</div>
          <div style="flex:1;min-width:0">
            <div class="irmao-card-name">${ir.nome}</div>
            <div class="irmao-card-cim">CIM ${ir.cim || '—'} &nbsp;·&nbsp; ${ir.potencia || '—'}</div>
            <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">
              ${tagGrau(ir.grau)}
              ${tagStatus(ir.status)}
            </div>
          </div>
        </div>
        <div class="irmao-card-body">
          ${ir.cargo_loja ? `<div>⚒️ <strong>Cargo:</strong> ${ir.cargo_loja}</div>` : ''}
          <div>📱 <strong>WhatsApp:</strong> ${ir.tel || '—'}</div>
          <div>🎂 <strong>Nascimento:</strong> ${formatData(ir.nascimento)}</div>
        </div>
        <div class="irmao-card-tags">
          ${tagMensalidade(ir.mensalidade_categoria || ir.mensalidade)}
          ${anivProximo(ir.nascimento) ? '<span class="tag tag-aniv">🎂 Aniversário próximo</span>' : ''}
        </div>
        <div class="irmao-card-actions" onclick="event.stopPropagation()">
          <button class="func-btn neutral" onclick="editarIrmao(${ir.id})">✏ Editar</button>
          <button class="func-btn danger"  onclick="excluirIrmao(${ir.id})">🗑 Excluir</button>
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
            <option selected>GOE</option><option>GLEMT</option><option>GOB</option><option>COMAB</option><option>COMOB</option><option>Outra</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Loja</label>
          <select class="form-select" id="fi_loja" ${!isAdmin ? 'disabled' : ''}>
            ${lojasList.length
              ? lojasList.map(l => `<option value="${l.id}" ${l.id === loja ? 'selected' : ''}>${l.nome}${l.numero ? ' nº' + l.numero : ''}</option>`).join('')
              : `<option value="${loja}">Loja #${loja}</option>`}
          </select>
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
          <label class="form-label">Cargo / Função na Loja</label>
          <select class="form-select" id="fi_cargo_loja">
            ${CARGOS_LOJA_OPCOES.map(c => `<option value="${c}">${c || '— sem cargo —'}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Grau Maçônico</label>
          <select class="form-select" id="fi_grau">
            ${GRAUS.map(g => `<option value="${g.v}">${g.label}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Data de Elevação</label>
          <input class="form-input" id="fi_elevacao" type="date" />
        </div>
        <div class="form-group">
          <label class="form-label">Regra de Mensalidade</label>
          <select class="form-select" id="fi_mensalidade">
            ${_categoriasMensalidade.length
              ? _categoriasMensalidade.map(c => `<option value="${c.nome}">${c.nome}</option>`).join('')
              : '<option value="regular">Regular</option><option value="idoso">Idoso</option><option value="potencia">Com Potência</option><option value="especial">Especial</option>'}
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
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px">
        <h2 style="margin:0">💰 Categorias de Mensalidade</h2>
        ${isAdmin ? `<button class="btn-primary" style="font-size:12px;padding:4px 14px" onclick="novaCategoriaMens()">+ Nova Categoria</button>` : ''}
      </div>
      <div class="mensalidade-categorias">${categoriaCards}</div>
    </div>

    <!-- Busca + filtro -->
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
      <input class="form-input" id="irmaoSearch" type="search" placeholder="Buscar por nome ou CIM…"
        style="flex:1;min-width:180px;max-width:320px"
        oninput="filtrarIrmaos()" />
      <div style="display:flex;gap:4px;flex-wrap:wrap">
        ${['todos','ativo','irregular','licenca','suspenso','falecido'].map(s => `
          <button class="relat-tab${s==='ativo'?' active':''}" id="filtro-${s}"
            onclick="setFiltroStatus('${s}')">${s==='todos'?'Todos':STATUS_IRMAO.find(x=>x.v===s)?.label||s}</button>`).join('')}
      </div>
    </div>
    <div class="section-title" style="margin-bottom:16px" id="irmaoContador">Irmãos cadastrados (${irmaos.length})</div>
    <div class="irmao-grid" id="irmaoGrid">${irmaoCards}</div>
    <div id="irmaoPaginator" style="display:flex;justify-content:center;gap:8px;margin-top:16px;flex-wrap:wrap"></div>
  `;
}

let _todosIrmaos = [];
let _filtroStatus = 'ativo';
let _irmaoPage = 0;
const _PER_PAGE = 20;

function setFiltroStatus(s) {
  _filtroStatus = s;
  _irmaoPage = 0;
  document.querySelectorAll('[id^="filtro-"]').forEach(b => b.classList.remove('active'));
  document.getElementById('filtro-' + s)?.classList.add('active');
  renderIrmaoGrid();
}

function filtrarIrmaos() {
  _irmaoPage = 0;
  renderIrmaoGrid();
}

function renderIrmaoGrid() {
  const q = (document.getElementById('irmaoSearch')?.value || '').toLowerCase();
  const filtered = _todosIrmaos.filter(ir => {
    const statusOk = _filtroStatus === 'todos' || (ir.status || 'ativo') === _filtroStatus;
    const searchOk = !q || ir.nome.toLowerCase().includes(q) || (ir.cim || '').toLowerCase().includes(q);
    return statusOk && searchOk;
  });
  const total = filtered.length;
  const pages = Math.ceil(total / _PER_PAGE);
  const slice = filtered.slice(_irmaoPage * _PER_PAGE, (_irmaoPage + 1) * _PER_PAGE);

  const grid = document.getElementById('irmaoGrid');
  const contador = document.getElementById('irmaoContador');
  const paginator = document.getElementById('irmaoPaginator');
  if (!grid) return;

  contador.textContent = `Irmãos encontrados (${total})`;
  grid.innerHTML = slice.map(ir => {
    ir.filhos = ir.filhos || [];
    ir.tel = ir.telefone || '';
    ir.nascimento = ir.data_nascimento || '';
    const ini = ir.nome[0].toUpperCase();
    return `
      <div class="irmao-card" onclick="abrirIrmao(${ir.id})" style="cursor:pointer">
        <div class="irmao-card-top">
          <div class="irmao-avatar">${ini}</div>
          <div style="flex:1;min-width:0">
            <div class="irmao-card-name">${ir.nome}</div>
            <div class="irmao-card-cim">CIM ${ir.cim || '—'} &nbsp;·&nbsp; ${ir.potencia || '—'}</div>
            <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">
              ${tagGrau(ir.grau)} ${tagStatus(ir.status)}
            </div>
          </div>
        </div>
        <div class="irmao-card-body">
          ${ir.cargo_loja ? `<div>⚒️ <strong>Cargo:</strong> ${ir.cargo_loja}</div>` : ''}
          <div>📱 ${ir.tel || '—'}</div>
          <div>🎂 ${formatData(ir.nascimento)}</div>
        </div>
        <div class="irmao-card-tags">
          ${tagMensalidade(ir.mensalidade_categoria)}
          ${anivProximo(ir.nascimento) ? '<span class="tag tag-aniv">🎂 Próx.</span>' : ''}
        </div>
        <div class="irmao-card-actions" onclick="event.stopPropagation()">
          <button class="func-btn neutral" onclick="editarIrmao(${ir.id})">✏ Editar</button>
          <button class="func-btn danger"  onclick="excluirIrmao(${ir.id})">🗑</button>
        </div>
      </div>`;
  }).join('') || '<div style="color:#94a3b8;padding:24px;text-align:center">Nenhum irmão encontrado.</div>';

  paginator.innerHTML = pages > 1
    ? `${_irmaoPage > 0 ? `<button class="func-btn neutral" onclick="_irmaoPage--;renderIrmaoGrid()">← Anterior</button>` : ''}
       <span style="font-size:13px;color:#64748b;align-self:center">Página ${_irmaoPage+1} de ${pages}</span>
       ${_irmaoPage < pages-1 ? `<button class="func-btn neutral" onclick="_irmaoPage++;renderIrmaoGrid()">Próximo →</button>` : ''}`
    : '';
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
    loja_id:              parseInt(document.getElementById('fi_loja').value) || state.usuario?.loja_id || 1,
    nome:                 document.getElementById('fi_nome').value.trim(),
    cim:                  document.getElementById('fi_cim').value.trim() || null,
    potencia:             document.getElementById('fi_potencia').value.trim() || null,
    telefone:             document.getElementById('fi_tel').value.trim() || null,
    data_nascimento:      document.getElementById('fi_nasc').value || null,
    nome_esposa:          document.getElementById('fi_esposa').value.trim() || null,
    mensalidade_categoria: document.getElementById('fi_mensalidade').value || null,
    cargo_loja:           document.getElementById('fi_cargo_loja').value || null,
    grau:                 parseInt(document.getElementById('fi_grau').value) || 1,
    data_elevacao:        document.getElementById('fi_elevacao').value || null,
    filhos,
  };

  try {
    const r = await api('POST', '/irmaos', dados);
    res.className = 'modal-result ok';
    res.textContent = 'Irmão cadastrado com sucesso!';
    // Limpa o formulário
    ['fi_nome','fi_cim','fi_tel','fi_nasc','fi_esposa','fi_filhos']
      .forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
    const potenciaInput = document.getElementById('fi_potencia');
    if (potenciaInput) potenciaInput.value = 'GOE';
    setTimeout(() => renderIrmaoView(), 800);
  } catch (e) {
    res.className = 'modal-result error';
    res.textContent = '⚠ ' + (e.data?.detail || e.message);
  }
}

async function editarIrmao(id) {
  let ir, lojasList = [];
  try { ir = await api('GET', `/irmaos/${id}`); }
  catch(e) { alert('Erro ao carregar: ' + e.message); return; }
  const isAdmin = ['admin_principal','veneravel_mestre'].includes(state.usuario?.cargo);
  if (isAdmin) {
    try { lojasList = await api('GET', '/lojas'); } catch(_) {}
  }
  const filhosStr = (ir.filhos || []).map(f =>
    f.nome + (f.data_nascimento ? ' / ' + f.data_nascimento : '')
  ).join('\n');
  const lojaField = isAdmin && lojasList.length
    ? `<div class="form-group" style="grid-column:1/-1"><label>Loja</label>
        <select class="modal-input" id="ei_loja_id">
          ${lojasList.map(l=>`<option value="${l.id}" ${l.id===ir.loja_id?'selected':''}>${l.nome}${l.numero?' nº'+l.numero:''}</option>`).join('')}
        </select></div>`
    : `<input type="hidden" id="ei_loja_id" value="${ir.loja_id}" />`;
  abrirModal(`Editar — ${ir.nome}`, `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div class="form-group" style="grid-column:1/-1"><label>Nome completo</label>
        <input class="modal-input" id="ei_nome" value="${(ir.nome||'').replace(/"/g,'&quot;')}" /></div>
      <div class="form-group"><label>CIM</label>
        <input class="modal-input" id="ei_cim" value="${ir.cim||''}" /></div>
      <div class="form-group"><label>Potência</label>
        <select class="modal-input" id="ei_potencia">
          ${['GOE','GLEMT','GOB','COMAB','COMOB','Outra'].map(p=>`<option${ir.potencia===p?' selected':''}>${p}</option>`).join('')}
        </select></div>
      <div class="form-group"><label>WhatsApp / Celular</label>
        <input class="modal-input" id="ei_tel" value="${ir.telefone||''}" /></div>
      <div class="form-group"><label>Data de Nascimento</label>
        <input class="modal-input" type="date" id="ei_nasc" value="${ir.data_nascimento||''}" /></div>
      <div class="form-group" style="grid-column:1/-1"><label>Nome da Esposa</label>
        <input class="modal-input" id="ei_esposa" value="${ir.nome_esposa||''}" /></div>
      ${lojaField}
      <div class="form-group"><label>Grau Maçônico</label>
        <select class="modal-input" id="ei_grau">
          ${GRAUS.map(g => `<option value="${g.v}" ${(ir.grau||1)==g.v?'selected':''}>${g.label}</option>`).join('')}
        </select></div>
      <div class="form-group"><label>Data de Elevação</label>
        <input class="modal-input" type="date" id="ei_elevacao" value="${ir.data_elevacao||''}" /></div>
      <div class="form-group"><label>Cargo / Função na Loja</label>
        <select class="modal-input" id="ei_cargo_loja">
          ${CARGOS_LOJA_OPCOES.map(c => `<option value="${c}" ${(ir.cargo_loja||'')===c?'selected':''}>${c||'— sem cargo —'}</option>`).join('')}
        </select></div>
      <div class="form-group"><label>Status</label>
        <select class="modal-input" id="ei_status">
          ${STATUS_IRMAO.map(s => `<option value="${s.v}" ${(ir.status||'ativo')===s.v?'selected':''}>${s.label}</option>`).join('')}
        </select></div>
      <div class="form-group" style="grid-column:1/-1"><label>Filhos (nome / data — um por linha)</label>
        <textarea class="modal-input" id="ei_filhos" rows="3">${filhosStr}</textarea></div>
    </div>
    <div class="sb-msg" id="eiMsg"></div>
  `, [
    { label: 'Cancelar', cls: 'neutral', action: 'fecharModal()' },
    { label: 'Salvar',   cls: 'primary', action: `salvarEdicaoIrmao(${id})` },
  ]);
}

async function salvarEdicaoIrmao(id) {
  const lojaId = parseInt(document.getElementById('ei_loja_id')?.value) || state.usuario?.loja_id || 1;
  const filhosRaw = (document.getElementById('ei_filhos').value||'').trim();
  const filhos = filhosRaw
    ? filhosRaw.split('\n').filter(l=>l.trim()).map(l=>{
        const [nome,nasc] = l.split('/').map(s=>s.trim());
        return { nome, data_nascimento: nasc||null };
      })
    : [];
  const dados = {
    loja_id:           lojaId,
    nome:              document.getElementById('ei_nome').value.trim(),
    cim:               document.getElementById('ei_cim').value.trim()||null,
    potencia:          document.getElementById('ei_potencia').value||null,
    telefone:          document.getElementById('ei_tel').value.trim()||null,
    data_nascimento:   document.getElementById('ei_nasc').value||null,
    nome_esposa:       document.getElementById('ei_esposa').value.trim()||null,
    cargo_loja:        document.getElementById('ei_cargo_loja').value||null,
    grau:              parseInt(document.getElementById('ei_grau')?.value)||1,
    status:            document.getElementById('ei_status')?.value||'ativo',
    data_elevacao:     document.getElementById('ei_elevacao')?.value||null,
    filhos,
  };
  try {
    await api('PUT', `/irmaos/${id}`, dados);
    fecharModal();
    renderIrmaoView();
  } catch(e) { document.getElementById('eiMsg').textContent = '⚠ ' + e.message; }
}

async function excluirIrmao(id) {
  if (!confirm('Excluir este irmão? Esta ação não pode ser desfeita.')) return;
  try {
    await api('DELETE', `/irmaos/${id}`);
    renderIrmaoView();
  } catch(e) { alert('Erro ao excluir: ' + e.message); }
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
//  MÓDULO — PRESENÇAS
// ═══════════════════════════════════════════════════════════

function renderPresencasView() {
  const view = document.getElementById('irmaoView');
  const hoje = new Date().toISOString().split('T')[0];
  view.innerHTML = `
    <div class="irmao-header"><h1>✅ Presenças</h1></div>
    <div class="form-card" style="display:flex;align-items:flex-end;gap:12px;flex-wrap:wrap">
      <div class="form-group" style="margin:0">
        <label class="form-label">Data da Sessão</label>
        <input class="form-input" id="pres_data" type="date" value="${hoje}" style="width:180px" />
      </div>
      <button class="func-btn primary" onclick="carregarPresencas()">Carregar</button>
    </div>
    <div id="presStats" style="display:none;margin-bottom:4px">
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px" id="presStatCards"></div>
    </div>
    <div id="presLista"></div>
  `;
  carregarPresencas();
}

let _presencasState = {};

async function carregarPresencas() {
  const loja = state.usuario?.loja_id || 1;
  const data = document.getElementById('pres_data')?.value || '';
  const lista = document.getElementById('presLista');
  const stats = document.getElementById('presStats');
  if (!lista || !data) return;
  lista.innerHTML = '<div class="loading">Carregando…</div>';
  try {
    const rows = await api('GET', `/presencas?loja_id=${loja}&data=${data}`);
    _presencasState = {};
    rows.forEach(r => {
      _presencasState[r.id] = r.presente !== null ? r.presente : true;
    });

    const jaRegistrado = rows.some(r => r.presenca_id !== null);
    const presentes = rows.filter(r => r.presente === true).length;
    const ausentes  = rows.filter(r => r.presente === false).length;
    const total     = rows.length;

    stats.style.display = 'block';
    document.getElementById('presStatCards').innerHTML = `
      <div class="form-card" style="padding:14px 18px;display:inline-flex;align-items:center;gap:10px">
        <span style="font-size:22px;font-weight:700;color:#2563eb">${total}</span>
        <span style="font-size:13px;color:#64748b">Total</span>
      </div>
      <div class="form-card" style="padding:14px 18px;display:inline-flex;align-items:center;gap:10px">
        <span style="font-size:22px;font-weight:700;color:#16a34a">${presentes}</span>
        <span style="font-size:13px;color:#64748b">Presentes</span>
      </div>
      <div class="form-card" style="padding:14px 18px;display:inline-flex;align-items:center;gap:10px">
        <span style="font-size:22px;font-weight:700;color:#dc2626">${ausentes}</span>
        <span style="font-size:13px;color:#64748b">Ausentes</span>
      </div>
    `;

    const podeEditar = ['admin_principal','veneravel_mestre','secretario','financeiro'].includes(state.usuario?.cargo);
    if (!rows.length) {
      lista.innerHTML = '<div class="form-card" style="color:#64748b;text-align:center;padding:24px">Nenhum irmão ativo cadastrado.</div>';
      return;
    }

    lista.innerHTML = `
      <div class="form-card" style="padding:0 0 12px">
        ${podeEditar ? `<div style="display:flex;justify-content:flex-end;gap:8px;padding:12px 16px 0">
          <button class="func-btn neutral" onclick="marcarTodosPresentes()">✓ Todos presentes</button>
          <button class="func-btn primary"  onclick="salvarPresencas()">Salvar lista</button>
        </div>` : ''}
        <div style="padding:0 8px">
          ${rows.map(r => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px 8px;border-bottom:1px solid #f1f5f9">
              <div style="flex:1;min-width:0">
                <div style="font-weight:600;font-size:14px">${r.nome}</div>
                <div style="font-size:12px;color:#64748b">${r.cim?'CIM '+r.cim+' · ':''} ${r.cargo_loja||''} ${tagGrau(r.grau)}</div>
              </div>
              ${podeEditar ? `
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none">
                <input type="checkbox" id="pres_${r.id}"
                  ${_presencasState[r.id] !== false ? 'checked' : ''}
                  onchange="_presencasState[${r.id}]=this.checked;_atualizarPresStats()"
                  style="width:18px;height:18px;accent-color:#2563eb;cursor:pointer" />
                <span style="font-size:13px;color:#374151" id="pres_label_${r.id}">
                  ${_presencasState[r.id] !== false ? 'Presente' : 'Ausente'}
                </span>
              </label>` : `
              <span style="${r.presente===true?'color:#16a34a':r.presente===false?'color:#dc2626':'color:#94a3b8'};font-size:13px;font-weight:600">
                ${r.presente===true?'✓ Presente':r.presente===false?'✗ Ausente':'—'}
              </span>`}
            </div>`).join('')}
        </div>
      </div>
    `;
    if (podeEditar) _atualizarPresStats();
  } catch(e) {
    lista.innerHTML = `<div class="form-card" style="color:#dc2626;padding:20px">Erro: ${e.message}</div>`;
  }
}

function _atualizarPresStats() {
  const total = Object.keys(_presencasState).length;
  const presentes = Object.values(_presencasState).filter(Boolean).length;
  const ausentes  = total - presentes;
  document.querySelectorAll('#presStatCards .form-card span:first-child').forEach((el,i) => {
    if (i===0) el.textContent = total;
    if (i===2) el.textContent = presentes;
    if (i===4) el.textContent = ausentes;
  });
  Object.keys(_presencasState).forEach(id => {
    const lbl = document.getElementById('pres_label_'+id);
    if (lbl) lbl.textContent = _presencasState[id] ? 'Presente' : 'Ausente';
  });
}

function marcarTodosPresentes() {
  Object.keys(_presencasState).forEach(id => {
    _presencasState[id] = true;
    const cb = document.getElementById('pres_'+id);
    if (cb) cb.checked = true;
  });
  _atualizarPresStats();
}

async function salvarPresencas() {
  const loja = state.usuario?.loja_id || 1;
  const data = document.getElementById('pres_data')?.value || '';
  const btn = event.target;
  btn.disabled = true; btn.textContent = 'Salvando…';
  try {
    const presencas = Object.entries(_presencasState).map(([irmao_id, presente]) =>
      ({ irmao_id: parseInt(irmao_id), presente })
    );
    await api('POST', '/presencas/registrar', { loja_id: loja, data, presencas });
    btn.textContent = '✓ Salvo!';
    btn.style.background = '#16a34a';
    setTimeout(() => { btn.disabled=false; btn.textContent='Salvar lista'; btn.style.background=''; carregarPresencas(); }, 1800);
  } catch(e) {
    btn.disabled=false; btn.textContent='Salvar lista';
    alert('Erro: ' + e.message);
  }
}

// ═══════════════════════════════════════════════════════════
//  MÓDULO — MENSALIDADES
// ═══════════════════════════════════════════════════════════

function renderMensalidadesView() {
  const view = document.getElementById('irmaoView');
  const hoje = new Date();
  const compAtual = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}`;
  view.innerHTML = `
    <div class="irmao-header">
      <h1>💰 Mensalidades</h1>
    </div>
    <div class="form-card" style="display:flex;align-items:flex-end;gap:12px;flex-wrap:wrap">
      <div class="form-group" style="margin:0">
        <label class="form-label">Competência (mês)</label>
        <input class="form-input" id="mens_comp" type="month" value="${compAtual}" style="width:160px" />
      </div>
      <button class="func-btn primary" onclick="carregarMensalidades()">Carregar</button>
    </div>
    <div id="mensStats" style="display:none;margin-bottom:12px">
      <div class="cards-grid" id="mensStatsCards" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px"></div>
    </div>
    <div id="mensLista" style="margin-top:4px"></div>
  `;
  carregarMensalidades();
}

async function carregarMensalidades() {
  const loja  = state.usuario?.loja_id || 1;
  const comp  = document.getElementById('mens_comp')?.value || '';
  const lista = document.getElementById('mensLista');
  const stats = document.getElementById('mensStats');
  if (!lista) return;
  lista.innerHTML = '<div class="loading">Carregando…</div>';
  try {
    const rows = await api('GET', `/mensalidades/status?loja_id=${loja}&competencia=${comp}`);
    const total      = rows.length;
    const pagos      = rows.filter(r => r.pagamento_id).length;
    const pendentes  = total - pagos;
    const arrecadado = rows.filter(r => r.pagamento_id).reduce((s,r) => s + Number(r.valor_pago||0), 0);
    const esperado   = rows.reduce((s,r) => s + Number(r.valor||0), 0);

    stats.style.display = 'block';
    document.getElementById('mensStatsCards').innerHTML = `
      <div class="form-card" style="text-align:center;padding:16px 12px">
        <div style="font-size:28px;font-weight:700;color:#2563eb">${total}</div>
        <div style="font-size:12px;color:#64748b;margin-top:2px">Total de Irmãos</div>
      </div>
      <div class="form-card" style="text-align:center;padding:16px 12px">
        <div style="font-size:28px;font-weight:700;color:#16a34a">${pagos}</div>
        <div style="font-size:12px;color:#64748b;margin-top:2px">Pagos</div>
      </div>
      <div class="form-card" style="text-align:center;padding:16px 12px">
        <div style="font-size:28px;font-weight:700;color:#dc2626">${pendentes}</div>
        <div style="font-size:12px;color:#64748b;margin-top:2px">Pendentes</div>
      </div>
      <div class="form-card" style="text-align:center;padding:16px 12px">
        <div style="font-size:22px;font-weight:700;color:#0891b2">R$ ${arrecadado.toFixed(2)}</div>
        <div style="font-size:12px;color:#64748b;margin-top:2px">Arrecadado / R$ ${esperado.toFixed(2)}</div>
      </div>
    `;

    const podeMarcar = ['admin_principal','financeiro','veneravel_mestre','secretario'].includes(state.usuario?.cargo);
    if (!rows.length) {
      lista.innerHTML = '<div class="form-card" style="color:#64748b;text-align:center;padding:24px">Nenhum irmão ativo encontrado.</div>';
      return;
    }
    lista.innerHTML = `
      <div class="form-card" style="padding:0;overflow:hidden">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0">
              <th style="padding:10px 14px;text-align:left;font-weight:600">Irmão</th>
              <th style="padding:10px 14px;text-align:left;font-weight:600">Categoria</th>
              <th style="padding:10px 14px;text-align:right;font-weight:600">Valor</th>
              <th style="padding:10px 14px;text-align:center;font-weight:600">Status</th>
              ${podeMarcar ? '<th style="padding:10px 14px;text-align:center;font-weight:600">Ação</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr style="border-bottom:1px solid #f1f5f9">
                <td style="padding:10px 14px">
                  <div style="font-weight:600">${r.nome}</div>
                  ${r.cim ? `<div style="font-size:11px;color:#94a3b8">CIM ${r.cim}</div>` : ''}
                  ${r.cargo_loja ? `<div style="font-size:11px;color:#64748b">${r.cargo_loja}</div>` : ''}
                </td>
                <td style="padding:10px 14px;color:#64748b">${r.categoria || '—'}</td>
                <td style="padding:10px 14px;text-align:right">${r.valor ? 'R$ '+Number(r.valor).toFixed(2) : '—'}</td>
                <td style="padding:10px 14px;text-align:center">
                  ${r.pagamento_id
                    ? `<span style="background:#dcfce7;color:#16a34a;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600">✓ Pago</span>`
                    : `<span style="background:#fee2e2;color:#dc2626;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600">Pendente</span>`
                  }
                  ${r.pagamento_id && r.pago_em ? `<div style="font-size:10px;color:#94a3b8;margin-top:2px">${new Date(r.pago_em).toLocaleDateString('pt-BR')}</div>` : ''}
                </td>
                ${podeMarcar ? `<td style="padding:10px 14px;text-align:center">
                  ${r.pagamento_id
                    ? `<button class="func-btn neutral" style="font-size:12px;padding:4px 10px" onclick="cancelarMensalidade(${r.pagamento_id})">Cancelar</button>`
                    : `<button class="func-btn primary" style="font-size:12px;padding:4px 10px" onclick="marcarMensalidadePaga(${r.id},'${comp}',${r.valor||0})">Marcar pago</button>`
                  }
                </td>` : ''}
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch(e) {
    lista.innerHTML = `<div class="form-card" style="color:#dc2626;padding:20px">Erro: ${e.message}</div>`;
  }
}

async function marcarMensalidadePaga(irmaoId, competencia, valor) {
  const loja = state.usuario?.loja_id || 1;
  try {
    await api('POST', '/mensalidades/pagar', {
      loja_id: loja, irmao_id: irmaoId,
      competencia, valor: valor || undefined,
    });
    carregarMensalidades();
  } catch(e) { alert('Erro: ' + e.message); }
}

async function cancelarMensalidade(pagamentoId) {
  if (!confirm('Cancelar este pagamento?')) return;
  try {
    await api('DELETE', `/mensalidades/pagar/${pagamentoId}`);
    carregarMensalidades();
  } catch(e) { alert('Erro: ' + e.message); }
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
          <input class="form-input" id="b_loja" type="number" value="${state.usuario?.loja_id || 1}" />
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
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <h2 style="margin:0">Histórico de processamento</h2>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="func-btn neutral" onclick="carregarBoletos()">↻ Atualizar</button>
          <button class="func-btn primary" onclick="dispararTodosBoletos()" title="Envia via WhatsApp ou e-mail para todos os irmãos identificados ainda não notificados">📤 Disparar Todos</button>
        </div>
      </div>
      <div id="boletoLista" style="margin-top:12px;color:#64748b;font-size:14px">
        <button class="func-btn neutral" onclick="carregarBoletos()">Carregar histórico</button>
      </div>
    </div>
  `;
  carregarBoletos();
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
  if (!el) return;
  el.textContent = 'Carregando…';
  try {
    const loja = document.getElementById('b_loja')?.value || state.usuario?.loja_id || 1;
    const data = await api('GET', `/boletos?loja_id=${loja}`);
    if (!data.length) { el.innerHTML = '<p style="color:#64748b;font-size:14px">Nenhum boleto processado ainda.</p>'; return; }
    el.innerHTML = data.map(b => {
      const icone = b.status === 'enviado' ? '✅' : b.status === 'nao_identificado' ? '❓' : '⚠️';
      const notif = b.notificado_em
        ? `<span style="color:#16a34a;font-size:11px">✅ Enviado via ${b.notificado_canal} em ${new Date(b.notificado_em).toLocaleString('pt-BR')}</span>`
        : (b.irmao_nome
          ? `<button class="btn-sm primary" id="btn-enviar-${b.id}" onclick="enviarBoleto(${b.id})">📤 Enviar</button>`
          : '');
      return `
      <div style="display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px solid #e2e8f0">
        <span style="font-size:20px;flex-shrink:0">${icone}</span>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:14px">${b.irmao_nome || 'Não identificado'}</div>
          <div style="font-size:12px;color:#64748b">${b.status} · ${new Date(b.created_at).toLocaleString('pt-BR')}${b.erro ? ' · ' + b.erro : ''}</div>
          <div style="margin-top:4px">${notif}</div>
        </div>
      </div>`;
    }).join('');
  } catch (e) { el.textContent = 'Erro: ' + e.message; }
}

async function enviarBoleto(boletoId) {
  const btn = document.getElementById(`btn-enviar-${boletoId}`);
  if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }
  try {
    const r = await api('POST', `/boletos/${boletoId}/enviar`);
    if (r.enviado) {
      if (btn) btn.closest('div[style*="border-bottom"]')?.querySelector('div:last-child')
        ?.replaceWith(Object.assign(document.createElement('div'), {
          innerHTML: `<span style="color:#16a34a;font-size:11px">✅ Enviado via ${r.canal}</span>`,
          style: 'margin-top:4px'
        }));
      await carregarBoletos();
    } else {
      if (btn) { btn.disabled = false; btn.textContent = '📤 Enviar'; }
      alert('Falha: ' + (r.erro || 'sem canal disponível'));
    }
  } catch(e) {
    if (btn) { btn.disabled = false; btn.textContent = '📤 Enviar'; }
    alert('Erro: ' + e.message);
  }
}

async function dispararTodosBoletos() {
  const loja = document.getElementById('b_loja')?.value || state.usuario?.loja_id || 1;
  if (!confirm('Disparar boletos para todos os irmãos identificados ainda não notificados?\n\nWill tenta WhatsApp primeiro, e-mail como fallback.')) return;
  try {
    const r = await api('POST', `/boletos/disparar-todos?loja_id=${loja}`);
    alert(`Disparo concluído!\n✅ Enviados: ${r.enviados}\n❌ Falhas: ${r.falhas}\nTotal: ${r.total}`);
    await carregarBoletos();
  } catch(e) { alert('Erro: ' + e.message); }
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
//  MÓDULO — AGENDA (CALENDÁRIO LOCAL)
// ═══════════════════════════════════════════════════════════

const MESES_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DIAS_PT_CURTO = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

let agendaState = {
  ano: new Date().getFullYear(),
  mes: new Date().getMonth() + 1,
  diaSelecionado: null,
  dados: null,
};

function feriadosBR(ano) {
  function pascoa(y) {
    const c = Math.floor(y/100), n = y - 19*Math.floor(y/19);
    const k = Math.floor((c-17)/25);
    let i = c - Math.floor(c/4) - Math.floor((c-k)/3) + 19*n + 15;
    i = i - 30*Math.floor(i/30);
    i = i - Math.floor(i/28)*(1 - Math.floor(i/28)*Math.floor(29/(i+1))*Math.floor((21-n)/11));
    let j = y + Math.floor(y/4) + i + 2 - c + Math.floor(c/4);
    j = j - 7*Math.floor(j/7);
    const l = i - j, m = 3 + Math.floor((l+40)/44), d = l + 28 - 31*Math.floor(m/4);
    return new Date(y, m-1, d);
  }
  const p = pascoa(ano);
  const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const add = (dt, dias) => { const d = new Date(dt); d.setDate(d.getDate()+dias); return d; };
  return {
    [`${ano}-01-01`]: 'Confraternização Universal',
    [fmt(add(p,-48))]: 'Carnaval',
    [fmt(add(p,-47))]: 'Carnaval',
    [fmt(add(p,-2))]:  'Sexta-feira Santa',
    [`${ano}-04-21`]: 'Tiradentes',
    [`${ano}-05-01`]: 'Dia do Trabalho',
    [fmt(add(p, 60))]: 'Corpus Christi',
    [`${ano}-09-07`]: 'Independência do Brasil',
    [`${ano}-10-12`]: 'N.Sra. Aparecida',
    [`${ano}-11-02`]: 'Finados',
    [`${ano}-11-15`]: 'Proclamação da República',
    [`${ano}-12-25`]: 'Natal',
  };
}

function renderAgendaView() {
  const view = document.getElementById('agendaView');
  const pad = n => String(n).padStart(2,'0');
  const hoje = new Date();
  view.innerHTML = `
    <div class="agenda-container">
      <div class="irmao-header" style="margin-bottom:0">
        <h1>📅 Agenda</h1>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="func-btn primary" onclick="agendaToggleNovoEvento()">+ Evento avulso</button>
          <button class="func-btn neutral" onclick="agendaToggleSessoes()">⚙ Sessões recorrentes</button>
        </div>
      </div>

      <div class="agenda-mes-nav">
        <button class="agenda-nav-btn" onclick="agendaMesAnterior()">◀</button>
        <span class="agenda-mes-titulo" id="agendaMesTitulo">—</span>
        <button class="agenda-nav-btn" onclick="agendaMesProximo()">▶</button>
      </div>

      <div class="agenda-grid-wrap">
        <div class="agenda-dias-semana">
          ${DIAS_PT_CURTO.map(d => `<div>${d}</div>`).join('')}
        </div>
        <div class="agenda-dias" id="agendaDias">
          <div class="agenda-loading">Carregando…</div>
        </div>
      </div>

      <div class="agenda-dia-detalhe" id="agendaDiaDetalhe" style="display:none">
        <div class="agenda-dia-detalhe-titulo" id="agendaDiaDetalheTitulo"></div>
        <div id="agendaDiaEventos"></div>
      </div>

      <div class="form-card" id="agendaFormEvento" style="display:none">
        <h2>Novo Evento Avulso</h2>
        <div class="form-grid">
          <div class="form-group" style="grid-column:1/-1">
            <label class="form-label">Título</label>
            <input class="form-input" id="ae_titulo" type="text" placeholder="Ex: Reunião de Comissão" />
          </div>
          <div class="form-group"><label class="form-label">Data</label><input class="form-input" id="ae_data" type="date" value="${hoje.getFullYear()}-${pad(hoje.getMonth()+1)}-${pad(hoje.getDate())}" /></div>
          <div class="form-group"><label class="form-label">Hora início</label><input class="form-input" id="ae_inicio" type="time" value="20:00" /></div>
          <div class="form-group"><label class="form-label">Hora fim</label><input class="form-input" id="ae_fim" type="time" value="22:00" /></div>
          <div class="form-group">
            <label class="form-label">Tipo</label>
            <select class="form-select" id="ae_tipo">
              <option value="evento">Evento</option><option value="sessao">Sessão</option>
              <option value="especial">Especial</option><option value="agape">Ágape</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">Cor</label><input class="form-input" id="ae_cor" type="color" value="#7c3aed" /></div>
          <div class="form-group" style="grid-column:1/-1"><label class="form-label">Local (opcional)</label><input class="form-input" id="ae_local" type="text" /></div>
          <div class="form-group" style="grid-column:1/-1"><label class="form-label">Descrição (opcional)</label><input class="form-input" id="ae_desc" type="text" /></div>
        </div>
        <div class="form-actions">
          <button class="func-btn primary" onclick="agendaSalvarEvento()">Salvar evento</button>
          <button class="func-btn neutral" onclick="agendaToggleNovoEvento()">Cancelar</button>
        </div>
        <pre class="modal-result" id="agendaEventoResult" style="display:none"></pre>
      </div>

      <div class="form-card" id="agendaPanelSessoes" style="display:none">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h2>Sessões Recorrentes</h2>
          <button class="func-btn primary" onclick="agendaToggleFormSessao()">+ Nova sessão</button>
        </div>

        <div id="agendaFormSessao" style="display:none;margin-bottom:20px;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0">
          <div class="form-grid">
            <div class="form-group" style="grid-column:1/-1"><label class="form-label">Título</label><input class="form-input" id="ss_titulo" type="text" placeholder="Ex: Sessão Ordinária" /></div>
            <div class="form-group">
              <label class="form-label">Tipo</label>
              <select class="form-select" id="ss_tipo">
                <option value="sessao">Sessão</option><option value="agape">Ágape</option>
                <option value="administrativa">Administrativa</option><option value="especial">Especial</option>
              </select>
            </div>
            <div class="form-group"><label class="form-label">Cor</label><input class="form-input" id="ss_cor" type="color" value="#2563eb" /></div>
            <div class="form-group" style="grid-column:1/-1">
              <label class="form-label">Frequência</label>
              <select class="form-select" id="ss_freq" onchange="agendaAtualizarCamposFreq()">
                <option value="semanal">Toda semana</option>
                <option value="quinzenal">A cada 2 semanas</option>
                <option value="mensal_dia_semana">Mensal — dia da semana (ex: 1ª Segunda)</option>
                <option value="mensal_dia_numero">Mensal — dia fixo (ex: dia 15)</option>
              </select>
            </div>
            <div class="form-group" id="ss_campo_dia_semana">
              <label class="form-label">Dia da semana</label>
              <select class="form-select" id="ss_dia_semana">
                <option value="0">Domingo</option><option value="1">Segunda</option>
                <option value="2">Terça</option><option value="3">Quarta</option>
                <option value="4">Quinta</option><option value="5">Sexta</option><option value="6">Sábado</option>
              </select>
            </div>
            <div class="form-group" id="ss_campo_semana_mes" style="display:none">
              <label class="form-label">Semana do mês</label>
              <select class="form-select" id="ss_semana_mes">
                <option value="1">1ª semana</option><option value="2">2ª semana</option>
                <option value="3">3ª semana</option><option value="4">4ª semana</option>
              </select>
            </div>
            <div class="form-group" id="ss_campo_dia_mes" style="display:none">
              <label class="form-label">Dia do mês</label>
              <input class="form-input" id="ss_dia_mes" type="number" min="1" max="31" value="1" />
            </div>
            <div class="form-group"><label class="form-label">Hora início</label><input class="form-input" id="ss_inicio" type="time" value="20:00" /></div>
            <div class="form-group"><label class="form-label">Hora fim</label><input class="form-input" id="ss_fim" type="time" value="22:00" /></div>
            <div class="form-group"><label class="form-label">Vigência início</label><input class="form-input" id="ss_vig_ini" type="date" value="${hoje.getFullYear()}-${pad(hoje.getMonth()+1)}-${pad(hoje.getDate())}" /></div>
            <div class="form-group"><label class="form-label">Vigência fim (opcional)</label><input class="form-input" id="ss_vig_fim" type="date" /></div>
          </div>
          <div class="form-actions">
            <button class="func-btn primary" onclick="agendaSalvarSessao()">Salvar sessão</button>
            <button class="func-btn neutral" onclick="agendaToggleFormSessao()">Cancelar</button>
          </div>
          <pre class="modal-result" id="agendaSessaoResult" style="display:none"></pre>
        </div>

        <div id="agendaListaSessoes"><div style="color:#94a3b8;font-size:14px">Carregando…</div></div>
      </div>
    </div>
  `;
  agendaCarregarMes();
}

async function agendaCarregarMes() {
  const loja = state.usuario?.loja_id || 1;
  const titulo = document.getElementById('agendaMesTitulo');
  if (titulo) titulo.textContent = `${MESES_PT[agendaState.mes - 1]} ${agendaState.ano}`;
  const el = document.getElementById('agendaDias');
  if (!el) return;
  el.innerHTML = '<div class="agenda-loading">Carregando…</div>';
  try {
    const dados = await api('GET', `/agenda/mes?loja_id=${loja}&ano=${agendaState.ano}&mes=${agendaState.mes}`);
    agendaState.dados = dados;
    agendaRenderGrid(dados);
  } catch (e) {
    el.innerHTML = `<div style="color:#dc2626;padding:20px;font-size:14px">Erro: ${e.message}</div>`;
  }
}

function agendaRenderGrid(dados) {
  const el = document.getElementById('agendaDias');
  if (!el) return;
  const { num_dias, primeiro_dia_semana, dias } = dados;
  const hoje = new Date();
  const feriados = feriadosBR(agendaState.ano);
  let html = '';
  for (let i = 0; i < primeiro_dia_semana; i++) html += '<div class="agenda-cel vazio"></div>';
  for (let d = 1; d <= num_dias; d++) {
    const eventos = dias[String(d)] || [];
    const sel = agendaState.diaSelecionado === d;
    const isHoje = d === hoje.getDate() && agendaState.mes === (hoje.getMonth()+1) && agendaState.ano === hoje.getFullYear();
    const isoDate = `${agendaState.ano}-${String(agendaState.mes).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const feriado = feriados[isoDate];
    const temCancelado = eventos.some(ev => ev.cancelado);
    const ativos = eventos.filter(ev => !ev.cancelado);
    const cores = [...new Set(ativos.map(ev => ev.cor || '#2563eb'))].slice(0,3);
    const dots = [
      ...cores.map(c => `<span class="agenda-dot" style="background:${c}"></span>`),
      ...(temCancelado ? [`<span class="agenda-dot" style="background:#94a3b8"></span>`] : []),
      ...(feriado ? [`<span style="font-size:8px">🇧🇷</span>`] : []),
    ].join('');
    html += `<div class="agenda-cel${sel?' selecionado':''}${isHoje?' hoje':''}${feriado?' feriado':''}"
      onclick="agendaClicarDia(${d})" title="${feriado||''}">
      <span class="agenda-cel-num">${d}</span>
      <div class="agenda-dots">${dots}</div>
    </div>`;
  }
  el.innerHTML = html;
  if (agendaState.diaSelecionado) agendaRenderDiaDetalhe(agendaState.diaSelecionado);
}

function agendaClicarDia(d) {
  agendaState.diaSelecionado = agendaState.diaSelecionado === d ? null : d;
  agendaRenderGrid(agendaState.dados);
  const det = document.getElementById('agendaDiaDetalhe');
  if (agendaState.diaSelecionado) {
    agendaRenderDiaDetalhe(d);
    det.scrollIntoView({ behavior:'smooth', block:'nearest' });
  } else { det.style.display = 'none'; }
}

function agendaRenderDiaDetalhe(d) {
  const det = document.getElementById('agendaDiaDetalhe');
  if (!det) return;
  const isoDate = `${agendaState.ano}-${String(agendaState.mes).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const feriado = feriadosBR(agendaState.ano)[isoDate];
  document.getElementById('agendaDiaDetalheTitulo').textContent =
    `${d} de ${MESES_PT[agendaState.mes - 1]} de ${agendaState.ano}`;
  const eventos = agendaState.dados?.dias?.[String(d)] || [];
  const eventoEl = document.getElementById('agendaDiaEventos');
  const podeEditar = ['admin_principal','veneravel_mestre','secretario'].includes(state.usuario?.cargo);
  const feriadoHtml = feriado
    ? `<div style="background:#fffbeb;border:1px solid #fbbf24;border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:13px;display:flex;align-items:center;gap:8px">
         🇧🇷 <strong>Feriado Nacional:</strong> ${feriado}
       </div>` : '';
  if (!eventos.length) {
    eventoEl.innerHTML = feriadoHtml + '<div style="color:#94a3b8;font-size:14px;padding:8px 0">Nenhum evento neste dia.</div>';
  } else {
    eventoEl.innerHTML = feriadoHtml + eventos.map(ev => `
      <div class="agenda-evento-item" style="border-left:3px solid ${ev.cancelado ? '#94a3b8' : ev.cor||'#2563eb'};${ev.cancelado ? 'opacity:0.6' : ''}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div class="agenda-evento-hora">${ev.hora_inicio}–${ev.hora_fim}</div>
            <div class="agenda-evento-titulo" style="${ev.cancelado ? 'text-decoration:line-through;color:#94a3b8' : ''}">${ev.titulo}</div>
            ${ev.cancelado ? `<div style="font-size:12px;color:#dc2626;margin-top:2px">⊘ Sessão cancelada${ev.cancelamento_motivo ? ' · ' + ev.cancelamento_motivo : ''}</div>` : ''}
            ${ev.descricao ? `<div class="agenda-evento-desc">${ev.descricao}</div>` : ''}
            ${ev.local     ? `<div class="agenda-evento-desc">📍 ${ev.local}</div>` : ''}
            ${ev.freq_label? `<div class="agenda-evento-desc">🔄 ${ev.freq_label}</div>` : ''}
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
            <span class="tag" style="background:${ev.cor||'#2563eb'}18;color:${ev.cor||'#2563eb'};border-color:${ev.cor||'#2563eb'}33">
              ${ev.tipo_fonte==='recorrente'?'Recorrente':'Avulso'}
            </span>
            ${ev.tipo_fonte==='avulso' ? `<button class="func-btn danger" style="font-size:11px;padding:2px 8px" onclick="agendaDeletarEvento(${ev.id})">Remover</button>` : ''}
            ${ev.tipo_fonte==='recorrente' && podeEditar ? (
              ev.cancelado
                ? `<button class="func-btn primary" style="font-size:11px;padding:2px 8px;background:#16a34a" onclick="restaurarSessao(${ev.cancelamento_id})">Restaurar</button>`
                : `<button class="func-btn neutral" style="font-size:11px;padding:2px 8px;color:#dc2626" onclick="cancelarSessaoNaData(${ev.id},'${isoDate}')">Cancelar data</button>`
            ) : ''}
          </div>
        </div>
      </div>
    `).join('');
  }
  det.style.display = 'block';
}

async function cancelarSessaoNaData(sessaoId, data) {
  const loja = state.usuario?.loja_id || 1;
  const motivo = prompt('Motivo do cancelamento (opcional):') ?? '';
  if (motivo === null) return;
  try {
    await api('POST', `/agenda/cancelamentos?loja_id=${loja}`, { sessao_id: sessaoId, data, motivo: motivo || null });
    agendaCarregarMes();
  } catch(e) { alert('Erro: ' + e.message); }
}

async function restaurarSessao(cancelamentoId) {
  try {
    await api('DELETE', `/agenda/cancelamentos/${cancelamentoId}`);
    agendaCarregarMes();
  } catch(e) { alert('Erro: ' + e.message); }
}

function agendaMesAnterior() {
  if (agendaState.mes===1){agendaState.mes=12;agendaState.ano--;}else agendaState.mes--;
  agendaState.diaSelecionado = null;
  agendaCarregarMes();
}
function agendaMesProximo() {
  if (agendaState.mes===12){agendaState.mes=1;agendaState.ano++;}else agendaState.mes++;
  agendaState.diaSelecionado = null;
  agendaCarregarMes();
}
function agendaToggleNovoEvento() {
  const el = document.getElementById('agendaFormEvento');
  el.style.display = el.style.display==='none' ? 'block' : 'none';
}
function agendaToggleSessoes() {
  const el = document.getElementById('agendaPanelSessoes');
  const show = el.style.display==='none';
  el.style.display = show ? 'block' : 'none';
  if (show) agendaCarregarSessoes();
}
function agendaToggleFormSessao() {
  const el = document.getElementById('agendaFormSessao');
  el.style.display = el.style.display==='none' ? 'block' : 'none';
}
function agendaAtualizarCamposFreq() {
  const freq = document.getElementById('ss_freq').value;
  document.getElementById('ss_campo_dia_semana').style.display = freq==='mensal_dia_numero' ? 'none' : 'block';
  document.getElementById('ss_campo_semana_mes').style.display = freq==='mensal_dia_semana' ? 'block' : 'none';
  document.getElementById('ss_campo_dia_mes').style.display    = freq==='mensal_dia_numero' ? 'block' : 'none';
}

async function agendaSalvarEvento() {
  const res = document.getElementById('agendaEventoResult');
  res.style.display='block'; res.className='modal-result'; res.textContent='Salvando…';
  const loja = state.usuario?.loja_id || 1;
  try {
    await api('POST', `/agenda/eventos-locais?loja_id=${loja}`, {
      titulo:      document.getElementById('ae_titulo').value.trim(),
      descricao:   document.getElementById('ae_desc').value.trim() || null,
      tipo:        document.getElementById('ae_tipo').value,
      data:        document.getElementById('ae_data').value,
      hora_inicio: document.getElementById('ae_inicio').value,
      hora_fim:    document.getElementById('ae_fim').value,
      local:       document.getElementById('ae_local').value.trim() || null,
      cor:         document.getElementById('ae_cor').value,
    });
    res.className='modal-result ok'; res.textContent='Evento salvo!';
    agendaCarregarMes();
    setTimeout(()=>{ agendaToggleNovoEvento(); res.style.display='none'; }, 1200);
  } catch(e) { res.className='modal-result error'; res.textContent='⚠ '+(e.data?.detail||e.message); }
}

async function agendaSalvarSessao() {
  const res = document.getElementById('agendaSessaoResult');
  res.style.display='block'; res.className='modal-result'; res.textContent='Salvando…';
  const loja = state.usuario?.loja_id || 1;
  const freq = document.getElementById('ss_freq').value;
  try {
    await api('POST', `/agenda/sessoes?loja_id=${loja}`, {
      titulo:          document.getElementById('ss_titulo').value.trim(),
      tipo:            document.getElementById('ss_tipo').value,
      frequencia:      freq,
      dia_semana:      freq!=='mensal_dia_numero' ? +document.getElementById('ss_dia_semana').value : null,
      semana_mes:      freq==='mensal_dia_semana' ? +document.getElementById('ss_semana_mes').value : null,
      dia_mes:         freq==='mensal_dia_numero' ? +document.getElementById('ss_dia_mes').value : null,
      hora_inicio:     document.getElementById('ss_inicio').value,
      hora_fim:        document.getElementById('ss_fim').value,
      cor:             document.getElementById('ss_cor').value,
      vigencia_inicio: document.getElementById('ss_vig_ini').value || null,
      vigencia_fim:    document.getElementById('ss_vig_fim').value || null,
    });
    res.className='modal-result ok'; res.textContent='Sessão salva!';
    agendaCarregarSessoes();
    agendaCarregarMes();
    setTimeout(()=>{ agendaToggleFormSessao(); res.style.display='none'; }, 1200);
  } catch(e) { res.className='modal-result error'; res.textContent='⚠ '+(e.data?.detail||e.message); }
}

async function agendaCarregarSessoes() {
  const el = document.getElementById('agendaListaSessoes');
  if (!el) return;
  const loja = state.usuario?.loja_id || 1;
  el.innerHTML = '<div style="color:#94a3b8;font-size:14px">Carregando…</div>';
  try {
    const sessoes = await api('GET', `/agenda/sessoes?loja_id=${loja}&apenas_ativas=false`);
    if (!sessoes.length) {
      el.innerHTML = '<div style="color:#94a3b8;font-size:14px">Nenhuma sessão recorrente cadastrada.</div>';
      return;
    }
    el.innerHTML = sessoes.map(s => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f1f5f9">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="width:10px;height:10px;border-radius:50%;background:${s.cor};flex-shrink:0;display:inline-block"></span>
          <div>
            <div style="font-weight:600;font-size:14px">${s.titulo}</div>
            <div style="font-size:12px;color:#64748b">${agendaFreqLabel(s)} · ${String(s.hora_inicio).slice(0,5)}–${String(s.hora_fim).slice(0,5)}</div>
          </div>
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          <span style="font-size:11px;padding:2px 8px;border-radius:12px;background:${s.ativo?'#dcfce7':'#fee2e2'};color:${s.ativo?'#16a34a':'#dc2626'}">${s.ativo?'Ativa':'Inativa'}</span>
          <button class="func-btn danger" style="font-size:11px;padding:2px 8px" onclick="agendaDeletarSessao(${s.id})">Remover</button>
        </div>
      </div>
    `).join('');
  } catch(e) { el.innerHTML = `<div style="color:#dc2626;font-size:14px">Erro: ${e.message}</div>`; }
}

function agendaFreqLabel(s) {
  const dias = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const dw = s.dia_semana != null ? dias[s.dia_semana] : '';
  if (s.frequencia==='semanal') return `Toda ${dw}`;
  if (s.frequencia==='quinzenal') return `A cada 2 ${dw}s`;
  if (s.frequencia==='mensal_dia_semana') { const o=['1ª','2ª','3ª','4ª','5ª']; return `${o[(s.semana_mes||1)-1]} ${dw} do mês`; }
  if (s.frequencia==='mensal_dia_numero') return `Todo dia ${s.dia_mes}`;
  return s.frequencia;
}

async function agendaDeletarEvento(id) {
  if (!confirm('Remover este evento?')) return;
  try { await api('DELETE', `/agenda/eventos-locais/${id}`); agendaState.diaSelecionado=null; agendaCarregarMes(); }
  catch(e) { alert('Erro: '+e.message); }
}
async function agendaDeletarSessao(id) {
  if (!confirm('Remover esta sessão recorrente?')) return;
  try { await api('DELETE', `/agenda/sessoes/${id}`); agendaCarregarSessoes(); agendaCarregarMes(); }
  catch(e) { alert('Erro: '+e.message); }
}

// ═══════════════════════════════════════════════════════════
//  PERFIL DO IRMÃO
// ═══════════════════════════════════════════════════════════

async function abrirIrmao(id) {
  mostrarView('irmaoDetalheView');
  const view = document.getElementById('irmaoDetalheView');
  view.innerHTML = '<div style="padding:40px;text-align:center;color:#64748b">Carregando perfil…</div>';
  try {
    const ir = await api('GET', `/irmaos/${id}`);
    renderIrmaoDetalhe(ir);
  } catch(e) {
    view.innerHTML = `<div style="padding:40px;color:#dc2626">Erro ao carregar: ${e.message}</div>`;
  }
}

function renderIrmaoDetalhe(ir) {
  const view = document.getElementById('irmaoDetalheView');
  const ini = (ir.nome || '?')[0].toUpperCase();
  const cargo = CARGOS.find(c => c.id === ir.cargo);
  const podeMensalidade = ['admin_principal','financeiro','veneravel_mestre','secretario'].includes(state.usuario?.cargo);

  const filhosHtml = (ir.filhos || []).length
    ? (ir.filhos).map(f => `
        <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f1f5f9">
          <span>👶</span>
          <div>
            <div style="font-weight:600;font-size:13px">${f.nome}</div>
            ${f.data_nascimento ? `<div style="font-size:12px;color:#64748b">${formatData(f.data_nascimento)}${anivProximo(f.data_nascimento)?' 🎂':''}</div>` : ''}
          </div>
        </div>`).join('')
    : '<div style="color:#94a3b8;font-size:13px;padding:6px 0">—</div>';

  const comissoesHtml = (ir.comissoes || []).length
    ? ir.comissoes.map(c => `<span class="tag" style="background:#e0e7ff;color:#3730a3;border-color:#c7d2fe">${c.nome}${c.funcao?' · '+c.funcao:''}</span>`).join('')
    : '<span style="color:#94a3b8;font-size:13px">—</span>';

  const today = new Date().toISOString().split('T')[0];

  view.innerHTML = `
    <div style="max-width:900px;margin:0 auto;padding:24px 16px">
      <button class="func-btn neutral" style="margin-bottom:20px" onclick="abrirModulo('cadastro_irmao')">← Voltar à lista</button>

      <div style="display:flex;align-items:center;gap:20px;margin-bottom:24px;padding:24px;background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid #e2e8f0">
        <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;font-size:28px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">${ini}</div>
        <div style="flex:1;min-width:0">
          <h1 style="font-size:22px;font-weight:700;margin:0 0 6px">${ir.nome}</h1>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${ir.cim ? `<span class="tag tag-regular">CIM ${ir.cim}</span>` : ''}
            ${ir.potencia ? `<span class="tag tag-regular">${ir.potencia}</span>` : ''}
            ${tagGrau(ir.grau)}
            ${tagStatus(ir.status)}
            ${cargo ? `<span class="tag" style="background:${cargo.cor}18;color:${cargo.cor};border-color:${cargo.cor}33">${cargo.icone} ${cargo.label}</span>` : ir.cargo ? `<span class="tag tag-regular">${ir.cargo}</span>` : ''}
            ${ir.cargo_loja ? `<span class="tag" style="background:#f0fdf4;color:#166534;border-color:#bbf7d0">🏛️ ${ir.cargo_loja}</span>` : ''}
          </div>
          ${ir.data_elevacao ? `<div style="font-size:12px;color:#64748b;margin-top:6px">Elevado ao 3° grau em ${formatData(ir.data_elevacao)}</div>` : ''}
        </div>
      </div>

      <div class="irmao-detalhe-grid">
        <div class="form-card">
          <h2>Dados Pessoais</h2>
          <div class="irmao-detalhe-campos">
            <div class="irmao-detalhe-campo"><span class="irmao-campo-label">📱 WhatsApp</span><span>${ir.telefone || '—'}</span></div>
            <div class="irmao-detalhe-campo"><span class="irmao-campo-label">🎂 Nascimento</span><span>${formatData(ir.data_nascimento)}${anivProximo(ir.data_nascimento)?' 🎂':''}</span></div>
            <div class="irmao-detalhe-campo"><span class="irmao-campo-label">💍 Esposa</span><span>${ir.nome_esposa || '—'}${ir.data_nascimento_esposa ? ` <span style="color:#64748b;font-size:12px">(${formatData(ir.data_nascimento_esposa)}${anivProximo(ir.data_nascimento_esposa)?' 🎂':''})</span>` : ''}</span></div>
            <div class="irmao-detalhe-campo"><span class="irmao-campo-label">📧 E-mail</span><span>${ir.usuario_email || '—'}</span></div>
          </div>
        </div>

        <div class="form-card">
          <h2>Filhos (${(ir.filhos||[]).length})</h2>
          ${filhosHtml}
        </div>

        <div class="form-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <h2 style="margin:0">Mensalidade</h2>
            ${podeMensalidade ? `<button class="func-btn primary" style="font-size:12px;padding:5px 12px" onclick="abrirModalMensalidade(${ir.id})">Definir regra</button>` : ''}
          </div>
          ${ir.mensalidade ? `
            <div class="irmao-detalhe-campos">
              <div class="irmao-detalhe-campo"><span class="irmao-campo-label">Categoria</span><span>${ir.mensalidade.categoria}</span></div>
              <div class="irmao-detalhe-campo"><span class="irmao-campo-label">Valor</span><span>R$ ${Number(ir.mensalidade.valor||0).toFixed(2)}</span></div>
              <div class="irmao-detalhe-campo"><span class="irmao-campo-label">Vigência</span><span>${formatData(ir.mensalidade.vigencia_inicio)}${ir.mensalidade.vigencia_fim?' – '+formatData(ir.mensalidade.vigencia_fim):''}</span></div>
            </div>` : '<div style="color:#94a3b8;font-size:13px">Nenhuma regra definida.</div>'}
        </div>

        <div class="form-card">
          <h2>Comissões</h2>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px">${comissoesHtml}</div>
        </div>
      </div>

      <!-- Histórico de pagamentos -->
      <div class="form-card" style="margin-top:16px">
        <h2>Histórico de Pagamentos</h2>
        <div id="historicoMensalidades" style="color:#64748b;font-size:13px;margin-top:8px">
          <button class="func-btn neutral" onclick="carregarHistoricoMensalidades(${ir.id})">Carregar histórico</button>
        </div>
      </div>
    </div>
  `;
}

function abrirModalMensalidade(irmaoId) {
  const today = new Date().toISOString().split('T')[0];
  abrirModal('Definir Regra de Mensalidade', `
    <div>
      <div class="modal-label">Categoria</div>
      <select class="modal-input" id="dm_cat">
        <option value="regular">Regular</option>
        <option value="fundador">Fundador</option>
        <option value="honorario">Honorário</option>
        <option value="isento">Isento</option>
        <option value="contribuinte">Contribuinte</option>
      </select>
    </div>
    <div>
      <div class="modal-label">Valor (R$)</div>
      <input class="modal-input" id="dm_valor" type="number" step="0.01" min="0" placeholder="0.00" />
    </div>
    <div>
      <div class="modal-label">Vigência início</div>
      <input class="modal-input" id="dm_inicio" type="date" value="${today}" />
    </div>
    <div>
      <div class="modal-label">Vigência fim (opcional)</div>
      <input class="modal-input" id="dm_fim" type="date" />
    </div>
    <div>
      <div class="modal-label">Observação</div>
      <input class="modal-input" id="dm_obs" type="text" placeholder="Opcional" />
    </div>
    <pre class="modal-result" id="dmResult" style="display:none"></pre>
  `, [
    { label: 'Cancelar', cls: 'neutral', action: 'fecharModal()' },
    { label: 'Salvar', cls: 'primary', action: `_salvarMensalidade(${irmaoId})` },
  ]);
}

async function _salvarMensalidade(irmaoId) {
  const res = document.getElementById('dmResult');
  res.style.display = 'block'; res.className = 'modal-result'; res.textContent = 'Salvando…';
  try {
    await api('POST', `/irmaos/${irmaoId}/mensalidade`, {
      categoria:       document.getElementById('dm_cat').value,
      valor:           parseFloat(document.getElementById('dm_valor').value || '0'),
      vigencia_inicio: document.getElementById('dm_inicio').value,
      vigencia_fim:    document.getElementById('dm_fim').value || undefined,
      observacao:      document.getElementById('dm_obs').value || undefined,
    });
    fecharModal();
    abrirIrmao(irmaoId);
  } catch(e) {
    res.className = 'modal-result error'; res.textContent = e.message;
  }
}

async function carregarHistoricoMensalidades(irmaoId) {
  const el = document.getElementById('historicoMensalidades');
  if (!el) return;
  el.textContent = 'Carregando…';
  try {
    const rows = await api('GET', `/mensalidades/historico/${irmaoId}`);
    if (!rows.length) { el.textContent = 'Nenhum pagamento registrado.'; return; }
    el.innerHTML = `
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr style="background:#f8fafc;border-bottom:1px solid #e2e8f0">
            <th style="padding:8px 12px;text-align:left">Competência</th>
            <th style="padding:8px 12px;text-align:right">Valor</th>
            <th style="padding:8px 12px;text-align:left">Forma</th>
            <th style="padding:8px 12px;text-align:left">Data</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr style="border-bottom:1px solid #f1f5f9">
              <td style="padding:8px 12px;font-weight:600">${r.competencia}</td>
              <td style="padding:8px 12px;text-align:right">R$ ${Number(r.valor).toFixed(2)}</td>
              <td style="padding:8px 12px;color:#64748b">${r.forma_pagamento || '—'}</td>
              <td style="padding:8px 12px;color:#64748b">${new Date(r.pago_em).toLocaleDateString('pt-BR')}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    `;
  } catch(e) {
    el.innerHTML = `<span style="color:#dc2626">Erro: ${e.message}</span>`;
  }
}

// ═══════════════════════════════════════════════════════════
//  MODAL DE AÇÃO
// ═══════════════════════════════════════════════════════════

let modalFuncId = null;

// abrirModal suporta dois modos:
//   abrirModal(fid)                    → modal de funcionalidade de cargo
//   abrirModal(titulo, corpo, botoes)  → modal genérico (comissões, etc.)
function abrirModal(fidOuTitulo, corpo, botoes) {
  if (corpo !== undefined) {
    // Modo genérico
    modalFuncId = null;
    document.getElementById('modalTitle').textContent = fidOuTitulo;
    document.getElementById('modalBody').innerHTML = corpo;
    document.getElementById('modalFooter').innerHTML = (botoes || []).map(b =>
      `<button class="func-btn ${b.cls}" onclick="${b.action}">${b.label}</button>`
    ).join('');
  } else {
    // Modo funcionalidade de cargo
    const f = FUNCIONALIDADES[fidOuTitulo];
    if (!f) return;
    modalFuncId = fidOuTitulo;
    document.getElementById('modalTitle').textContent = `${f.icone} ${f.titulo}`;
    document.getElementById('modalBody').innerHTML = f.campos.map(campo => `
      <div>
        <div class="modal-label">${campo.label}</div>
        <input class="modal-input" id="${campo.id}" type="${campo.tipo}" value="${campo.valor}" placeholder="${campo.label}" />
      </div>
    `).join('') + `<pre class="modal-result" id="modalResult" style="display:none"></pre>`;
    document.getElementById('modalFooter').innerHTML = `
      <button class="func-btn neutral" onclick="fecharModal()">Cancelar</button>
      <button class="func-btn primary" id="modalExecBtn" onclick="executarModal()">Executar</button>
    `;
  }
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
  // Lê estado ANTES de re-renderizar para preservar filtros
  const statusAtual = document.getElementById('filtroStatus')?.value || '';
  const inclAtual   = document.getElementById('filtroOcultos')?.checked || false;

  el.innerHTML = `
    <div class="view-header">
      <h1>Compras & Reembolsos</h1>
      <button class="btn-primary" onclick="abrirNovaCompra()">+ Nova compra</button>
    </div>
    <div class="filtros-row">
      <select id="filtroStatus" onchange="renderComprasView()">
        <option value="" ${!statusAtual?'selected':''}>Todos os status</option>
        <option value="pendente" ${statusAtual==='pendente'?'selected':''}>Pendente</option>
        <option value="aprovado" ${statusAtual==='aprovado'?'selected':''}>Aprovado</option>
        <option value="rejeitado" ${statusAtual==='rejeitado'?'selected':''}>Rejeitado</option>
      </select>
      <label style="display:flex;align-items:center;gap:6px;font-size:13px">
        <input type="checkbox" id="filtroOcultos" ${inclAtual?'checked':''} onchange="renderComprasView()"> Incluir ocultos
      </label>
    </div>
    <div id="comprasLista"><div class="loading">Carregando…</div></div>
  `;

  const status = statusAtual;
  const incl   = inclAtual ? 'true' : 'false';
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
          ${c.arquivos.map(a => `
            <span class="arq-link-wrap">
              <button class="arq-link" onclick="downloadComAuth('/compras/${c.id}/arquivo/${a.id}','${(a.nome_original||a.tipo||'arquivo').replace(/'/g,"\\'")}')">📎 ${a.nome_original || a.tipo}</button>
              ${['admin_principal','veneravel_mestre'].includes(state.usuario?.cargo)
                ? `<button class="btn-sm danger" style="padding:1px 6px;font-size:11px" onclick="excluirArquivoCompra(${c.id},${a.id})">🗑</button>`
                : ''}
            </span>`).join('')}
        </div>` : ''}
        ${c.observacao ? `<div class="compra-obs">💬 ${c.observacao}</div>` : ''}
        <div class="compra-acoes">
          ${c.status === 'pendente' ? `
            <button class="btn-sm success" onclick="aprovarCompra(${c.id})">Aprovar</button>
            <button class="btn-sm danger"  onclick="rejeitarCompra(${c.id})">Rejeitar</button>
          ` : ''}
          <button class="btn-sm neutral" onclick="toggleVisibilidade(${c.id}, ${!c.visivel})">${c.visivel ? 'Ocultar' : 'Mostrar'}</button>
          ${['admin_principal','veneravel_mestre'].includes(state.usuario?.cargo)
            ? `<button class="btn-sm danger" onclick="excluirCompra(${c.id})">🗑 Excluir</button>`
            : ''}
        </div>
      </div>
    `).join('');
  } catch(e) {
    document.getElementById('comprasLista').innerHTML = `<p class="error-msg">${e.message}</p>`;
  }
}

async function abrirNovaCompra() {
  const loja = state.usuario?.loja_id || 1;
  let regras = [], irmaos = [];
  try { regras = await api('GET', `/regras-rateio?loja_id=${loja}`); } catch(_) {}
  try { irmaos = await api('GET', `/irmaos?loja_id=${loja}`); } catch(_) {}

  abrirModal('Nova Compra / Ágape', `
    <div class="form-group"><label>Categoria</label>
      <select class="modal-input" id="nc_categoria" onchange="toggleBancadoPor()">
        <option value="geral">Compra geral</option>
        <option value="agape">Ágape</option>
      </select></div>
    <div class="form-group"><label>Evento / Descrição</label>
      <input class="modal-input" id="nc_evento" placeholder="Ex: Ágape - Sessão Magna" /></div>
    <div class="form-group"><label>Valor (R$)</label>
      <input class="modal-input" id="nc_valor" type="number" step="0.01" placeholder="0,00" /></div>
    <div class="form-group" id="nc_bancado_group" style="display:none"><label>Quem bancou (irmão que pagou do próprio bolso)</label>
      <select class="modal-input" id="nc_bancado">
        <option value="">— Nenhum / não se aplica —</option>
        ${irmaos.map(i=>`<option value="${i.id}">${i.nome}</option>`).join('')}
      </select></div>
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

function toggleBancadoPor() {
  const cat = document.getElementById('nc_categoria')?.value;
  const grp = document.getElementById('nc_bancado_group');
  if (grp) grp.style.display = cat === 'agape' ? 'block' : 'none';
}

async function submitNovaCompra() {
  const loja      = state.usuario?.loja_id || 1;
  const evento    = document.getElementById('nc_evento').value.trim();
  const valor     = parseFloat(document.getElementById('nc_valor').value);
  const regra     = document.getElementById('nc_regra').value;
  const categoria = document.getElementById('nc_categoria')?.value || 'geral';
  const bancado   = document.getElementById('nc_bancado')?.value || '';
  const msg       = document.getElementById('ncMsg');

  if (!evento || isNaN(valor)) { msg.textContent = 'Preencha evento e valor.'; return; }

  const fd = new FormData();
  fd.append('loja_id', loja);
  fd.append('evento', evento);
  fd.append('valor', valor);
  fd.append('categoria', categoria);
  if (bancado) fd.append('bancado_por_irmao_id', bancado);
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

async function excluirArquivoCompra(compraId, arquivoId) {
  if (!confirm('Excluir este arquivo permanentemente?')) return;
  try {
    await api('DELETE', `/compras/${compraId}/arquivo/${arquivoId}`);
    renderComprasView();
  } catch(e) { alert('Erro: ' + e.message); }
}

async function excluirCompra(id) {
  if (!confirm('Excluir esta compra permanentemente?\n\nTodos os arquivos anexados também serão removidos. Esta ação não pode ser desfeita.')) return;
  try {
    await api('DELETE', `/compras/${id}`);
    renderComprasView();
  } catch(e) { alert('Erro: ' + e.message); }
}


async function abrirSolicitarReembolso() {
  const loja = state.usuario?.loja_id || 1;
  let agapes = [];
  try { agapes = await api('GET', `/compras?loja_id=${loja}&categoria=agape&incluir_ocultos=false`); } catch(_) {}

  abrirModal('Solicitar Reembolso de Ágape', `
    <div class="form-group"><label>Selecione o ágape</label>
      <select class="modal-input" id="sr_agape" onchange="_preencherReembolso()">
        <option value="">— Selecione um ágape registrado —</option>
        ${agapes.length ? agapes.map(a => `<option value="${a.id}"
          data-valor="${a.valor}"
          data-irmao="${a.bancado_por_irmao_id||''}"
          data-irmao-nome="${(a.bancado_por_nome||'').replace(/"/g,'&quot;')}">
          ${a.evento} — R$ ${parseFloat(a.valor).toFixed(2)} (${new Date(a.criado_em).toLocaleDateString('pt-BR')})
        </option>`).join('') : '<option disabled>Nenhum ágape registrado ainda</option>'}
      </select></div>
    <div id="sr_info" style="display:none">
      <div class="form-group"><label>Valor a reembolsar (R$)</label>
        <input class="modal-input" id="sr_valor" type="number" step="0.01" /></div>
      <div class="form-group"><label>Irmão a receber</label>
        <input class="modal-input" id="sr_irmao_nome" readonly style="background:var(--bg-secondary,#f1f5f9)" /></div>
    </div>
    <div class="sb-msg" id="srMsg"></div>
  `, [
    { label: 'Cancelar', cls: 'neutral', action: 'fecharModal()' },
    { label: 'Solicitar', cls: 'primary', action: 'submitSolicitarReembolso()' },
  ]);
}

function _preencherReembolso() {
  const sel = document.getElementById('sr_agape');
  const opt = sel.options[sel.selectedIndex];
  const info = document.getElementById('sr_info');
  if (!sel.value) { info.style.display = 'none'; return; }
  info.style.display = 'block';
  document.getElementById('sr_valor').value = opt.getAttribute('data-valor') || '';
  const nomeIrmao = opt.getAttribute('data-irmao-nome') || '';
  document.getElementById('sr_irmao_nome').value = nomeIrmao || '(nenhum irmão vinculado)';
}

async function submitSolicitarReembolso() {
  const compra_id = document.getElementById('sr_agape').value;
  const msg = document.getElementById('srMsg');
  if (!compra_id) { msg.textContent = 'Selecione um ágape.'; return; }
  try {
    msg.textContent = 'Enviando…';
    await api('POST', `/compras/${compra_id}/solicitar-reembolso`);
    fecharModal();
    alert('Reembolso solicitado com sucesso!');
  } catch(e) {
    msg.textContent = e.message;
  }
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

let _chartInstances = [];

function _destruirCharts() {
  _chartInstances.forEach(c => { try { c.destroy(); } catch(_) {} });
  _chartInstances = [];
}

async function gerarRelatorio() {
  const loja  = state.usuario?.loja_id || 1;
  const ini   = document.getElementById('relat_inicio')?.value || '';
  const fim   = document.getElementById('relat_fim')?.value || '';
  const ocultos = document.getElementById('relat_ocultos')?.checked ? 'true' : 'false';
  const el    = document.getElementById('relatConteudo');
  if (!el) return;
  _destruirCharts();
  el.innerHTML = '<div class="loading">Gerando relatório…</div>';

  try {
    let html = '';
    let dados = null;
    if (_relatAtivo === 'tesouraria') {
      dados = await api('GET', `/relatorios/tesouraria?loja_id=${loja}&incluir_ocultos=${ocultos}&data_inicio=${ini}&data_fim=${fim}`);
      html = renderRelatTesouraria(dados);
    } else if (_relatAtivo === 'mensalidades') {
      dados = await api('GET', `/relatorios/mensalidades?loja_id=${loja}&data_inicio=${ini}&data_fim=${fim}`);
      html = renderRelatMensalidades(dados);
    } else {
      dados = await api('GET', `/relatorios/agenda?loja_id=${loja}&data_inicio=${ini}&data_fim=${fim}`);
      html = renderRelatAgenda(dados);
    }
    el.innerHTML = html;
    _renderCharts(_relatAtivo, dados);
  } catch(e) {
    el.innerHTML = `<p class="error-msg">${e.message}</p>`;
  }
}

function _renderCharts(tipo, dados) {
  if (typeof Chart === 'undefined' || !dados) return;
  Chart.defaults.font.family = "'Inter', 'Segoe UI', sans-serif";
  Chart.defaults.font.size = 12;

  if (tipo === 'tesouraria') {
    // Gráfico 1: Aprovado / Pendente / Rejeitado (doughnut)
    const c1 = document.getElementById('chartStatus');
    if (c1) {
      const totAprov = parseFloat(dados.resumo_status?.find(s => s.status === 'aprovado')?.total || 0);
      const totPend  = parseFloat(dados.resumo_status?.find(s => s.status === 'pendente')?.total || 0);
      const totRej   = parseFloat(dados.resumo_status?.find(s => s.status === 'rejeitado')?.total || 0);
      _chartInstances.push(new Chart(c1, {
        type: 'doughnut',
        data: {
          labels: ['Aprovado', 'Pendente', 'Rejeitado'],
          datasets: [{ data: [totAprov, totPend, totRej],
            backgroundColor: ['#16a34a','#ca8a04','#dc2626'],
            borderWidth: 2, borderColor: '#fff' }],
        },
        options: { plugins: { legend: { position: 'bottom' } }, cutout: '60%' },
      }));
    }
    // Gráfico 2: Por centro de custo (bar)
    const c2 = document.getElementById('chartCentros');
    if (c2 && dados.resumo_centros_custo?.length) {
      _chartInstances.push(new Chart(c2, {
        type: 'bar',
        data: {
          labels: dados.resumo_centros_custo.map(c => c.centro_nome),
          datasets: [{ label: 'Total aprovado (R$)',
            data: dados.resumo_centros_custo.map(c => parseFloat(c.total)),
            backgroundColor: '#2563eb88', borderColor: '#2563eb', borderWidth: 1 }],
        },
        options: { plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } } },
      }));
    }
  } else if (tipo === 'mensalidades') {
    const c1 = document.getElementById('chartMens');
    if (c1 && dados.length) {
      const contagem = {};
      dados.forEach(r => { contagem[r.categoria] = (contagem[r.categoria] || 0) + 1; });
      _chartInstances.push(new Chart(c1, {
        type: 'bar',
        data: {
          labels: Object.keys(contagem),
          datasets: [{ label: 'Irmãos por categoria',
            data: Object.values(contagem),
            backgroundColor: ['#2563eb88','#7c3aed88','#059669880','#ca8a0488'],
            borderWidth: 1 }],
        },
        options: { plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } },
      }));
    }
  } else if (tipo === 'agenda') {
    const c1 = document.getElementById('chartAgenda');
    if (c1 && dados.length) {
      const contagem = {};
      dados.forEach(r => { const t = r.tipo || 'outros'; contagem[t] = (contagem[t] || 0) + 1; });
      const cores = { sessao:'#2563eb88', agape:'#dc262688', administrativa:'#ca8a0488',
                      especial:'#7c3aed88', evento:'#05966988' };
      _chartInstances.push(new Chart(c1, {
        type: 'bar',
        data: {
          labels: Object.keys(contagem),
          datasets: [{ label: 'Eventos por tipo',
            data: Object.values(contagem),
            backgroundColor: Object.keys(contagem).map(t => cores[t] || '#94a3b888'),
            borderWidth: 1 }],
        },
        options: { plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } },
      }));
    }
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
    ${r.agape_eventos?.length ? `
    <h3 style="margin:20px 0 8px">🍽️ Ágapes no Período (${r.agape_eventos.length})</h3>
    <table class="relat-table">
      <thead><tr><th>Data</th><th>Título</th><th>Horário</th></tr></thead>
      <tbody>${r.agape_eventos.map(e => `
        <tr>
          <td>${new Date(e.data+'T12:00:00').toLocaleDateString('pt-BR')}</td>
          <td>${e.titulo}</td>
          <td>${String(e.hora_inicio||'').slice(0,5)} – ${String(e.hora_fim||'').slice(0,5)}</td>
        </tr>`).join('')}
      </tbody>
    </table>` : ''}
    <div class="relat-charts-row">
      <div class="relat-chart-wrap">
        <h4>Distribuição por status</h4>
        <canvas id="chartStatus" style="max-height:260px"></canvas>
      </div>
      <div class="relat-chart-wrap">
        <h4>Por centro de custo</h4>
        <canvas id="chartCentros" style="max-height:260px"></canvas>
      </div>
    </div>
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
    <div class="relat-charts-row">
      <div class="relat-chart-wrap">
        <h4>Irmãos por categoria</h4>
        <canvas id="chartMens" style="max-height:260px"></canvas>
      </div>
    </div>
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
    <div class="relat-charts-row">
      <div class="relat-chart-wrap">
        <h4>Eventos por tipo</h4>
        <canvas id="chartAgenda" style="max-height:260px"></canvas>
      </div>
    </div>
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
              <td>
                <span class="badge-ctx ${a.contexto}">${a.contexto === 'compra' ? (a.compra_categoria === 'agape' ? 'Ágape' : 'Compra') : a.contexto}</span>
              </td>
              <td>
                <div>${a.descricao || '—'}</div>
                ${a.bancado_por_nome ? `<div style="font-size:11px;color:#64748b;margin-top:2px">💰 Bancado por: ${a.bancado_por_nome}</div>` : ''}
              </td>
              <td>${a.nome_original || a.tipo || '—'}</td>
              <td>${a.tamanho_bytes ? (a.tamanho_bytes / 1024).toFixed(1) + ' KB' : '—'}</td>
              <td style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
                ${a.download_url
                  ? `<button class="btn-sm success" onclick="downloadComAuth('${a.download_url}','${(a.nome_original||'arquivo').replace(/'/g,"\\'")}')">⬇ Baixar</button>`
                  : '<span style="color:#94a3b8;font-size:12px">indisponível</span>'}
                ${['admin_principal','veneravel_mestre'].includes(state.usuario?.cargo)
                  ? `<button class="btn-sm danger" onclick="excluirArquivoUniversal('${a.contexto}',${a.contexto_id||0},${a.id})">🗑</button>`
                  : ''}
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
      'guarda_templo','mestre_cerimonias','mestre_banquete',
      'almoxarife','arquiteto','obreiro','irmao_loja'
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
  financeiro:          'Tesoureiro',
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


// ═══════════════════════════════════════════════════════════
//  APROVAR REEMBOLSO (lista interativa)
// ═══════════════════════════════════════════════════════════

async function abrirAprovarReembolsoLista() {
  const loja = state.usuario?.loja_id || 1;
  let lista = [];
  try { lista = await api('GET', `/reimbursements?loja_id=${loja}&status=pendente`); }
  catch(e) { alert('Erro ao carregar reembolsos: ' + e.message); return; }

  if (!lista.length) {
    abrirModal('Aprovar / Rejeitar Reembolso',
      '<p style="color:#64748b;padding:12px 0">Nenhum reembolso pendente no momento.</p>',
      [{ label: 'Fechar', cls: 'neutral', action: 'fecharModal()' }]);
    return;
  }

  abrirModal('Reembolsos Pendentes', `
    <div style="max-height:380px;overflow-y:auto;display:flex;flex-direction:column;gap:8px">
      ${lista.map(r => `
        <div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px">
          <div style="font-weight:600">ID ${r.id} — ${r.categoria}</div>
          <div style="font-size:12px;color:#64748b;margin-top:2px">
            Valor solicitado: <strong>R$ ${parseFloat(r.valor_solicitado||0).toFixed(2)}</strong>
            · Caso: ${r.caso_id}
          </div>
          <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
            <button class="func-btn primary" style="font-size:12px;padding:4px 12px"
              onclick="aprovarReembolsoItem(${r.id},'aprovado')">✓ Aprovar</button>
            <button class="func-btn danger" style="font-size:12px;padding:4px 12px"
              onclick="aprovarReembolsoItem(${r.id},'rejeitado')">✗ Rejeitar</button>
          </div>
        </div>`).join('')}
    </div>
    <div class="sb-msg" id="reembolsoMsg" style="margin-top:8px"></div>
  `, [{ label: 'Fechar', cls: 'neutral', action: 'fecharModal()' }]);
}

async function aprovarReembolsoItem(id, decisao) {
  try {
    await api('POST', '/approvals', {
      entidade_tipo: 'reembolso', entidade_id: id,
      decisao, valor: null, observacao: null,
    });
    const msg = document.getElementById('reembolsoMsg');
    if (msg) { msg.style.color='#16a34a'; msg.textContent = `Reembolso #${id} ${decisao}.`; }
    setTimeout(abrirAprovarReembolsoLista, 900);
  } catch(e) {
    const msg = document.getElementById('reembolsoMsg');
    if (msg) { msg.style.color='#dc2626'; msg.textContent = '⚠ ' + e.message; }
  }
}

// ═══════════════════════════════════════════════════════════
//  GESTÃO DE USUÁRIOS
// ═══════════════════════════════════════════════════════════

async function renderUsuariosView() {
  const el = document.getElementById('usuariosView');
  const isAdmin = state.usuario?.cargo === 'admin_principal';
  el.innerHTML = `
    <div class="view-header">
      <h1>Usuários</h1>
    </div>
    <div id="usuariosLista"><div class="loading">Carregando…</div></div>`;
  await carregarUsuarios();
}

async function carregarUsuarios() {
  const isAdmin = state.usuario?.cargo === 'admin_principal';
  const url = isAdmin ? '/usuarios' : `/usuarios?loja_id=${state.usuario?.loja_id || 0}`;
  try {
    const [lista, lojas] = await Promise.all([
      api('GET', url),
      isAdmin ? api('GET', '/lojas') : Promise.resolve([]),
    ]);
    const lojaMap = Object.fromEntries(lojas.map(l => [l.id, l]));
    const el = document.getElementById('usuariosLista');
    if (!lista.length) { el.innerHTML = '<p class="empty-msg">Nenhum usuário cadastrado.</p>'; return; }
    el.innerHTML = lista.map(u => {
      const lj = lojaMap[u.loja_id];
      const lojaInfo = lj
        ? `<span style="background:var(--border);border-radius:10px;padding:1px 8px;font-size:11px">
             🏛 ${lj.nome}${lj.numero?' nº'+lj.numero:''}</span>`
        : `<span style="background:#fee2e2;color:#991b1b;border-radius:10px;padding:1px 8px;font-size:11px">
             ⚠ Sem loja</span>`;
      return `
      <div class="rateio-item" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
        <div>
          <div style="font-weight:700;font-size:14px">${u.nome}</div>
          <div style="font-size:12px;color:var(--muted);margin-top:2px">${u.email} · ${(u.cargo||'').replace(/_/g,' ')}</div>
          <div style="display:flex;gap:6px;align-items:center;margin-top:4px;flex-wrap:wrap">
            ${lojaInfo}
            ${u.ativo
              ? `<span style="font-size:11px;color:#16a34a">● Ativo</span>`
              : `<span style="font-size:11px;color:#dc2626">● Inativo</span>`}
          </div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${isAdmin ? `<button class="func-btn neutral" style="font-size:12px;padding:4px 12px"
            onclick="vincularUsuarioLoja(${u.id})">🏛 Vincular Loja</button>` : ''}
          ${!u.ativo ? `<button class="func-btn primary" style="font-size:12px;padding:4px 12px"
            onclick="ativarUsuario(${u.id})">✓ Ativar</button>` : ''}
          <button class="func-btn danger" style="font-size:12px;padding:4px 12px"
            onclick="excluirUsuario(${u.id},'${(u.nome||'').replace(/'/g,'')}')">🗑 Excluir</button>
        </div>
      </div>`;
    }).join('');
  } catch(e) {
    document.getElementById('usuariosLista').innerHTML = `<p class="error-msg">${e.message}</p>`;
  }
}

async function ativarUsuario(id) {
  try { await api('PUT', `/usuarios/${id}/ativar`); carregarUsuarios(); }
  catch(e) { alert('Erro: ' + e.message); }
}

async function excluirUsuario(id, nome) {
  if (!confirm(`Excluir o usuário "${nome}"? Esta ação não pode ser desfeita.`)) return;
  try { await api('DELETE', `/usuarios/${id}`); carregarUsuarios(); }
  catch(e) { alert('Erro: ' + e.message); }
}

// Fecha sidebar ao navegar (mobile)
function _navClick() {
  if (window.innerWidth <= 768) toggleSidebar(true);
}

// ═══════════════════════════════════════════════════════════
//  UPLOAD RÁPIDO DE ARQUIVO (botão em qualquer cargo)
// ═══════════════════════════════════════════════════════════

function abrirUploadArquivoRapido() {
  abrirModal('📁 Enviar Arquivo', `
    <div class="form-group">
      <label>Sobre o que são estes arquivos?</label>
      <select class="modal-input" id="ur_ctx">
        <option value="geral">Geral</option>
        <option value="agape">Ágape</option>
        <option value="comprovante">Comprovante de Compra / Nota Fiscal</option>
        <option value="ata">Ata de Sessão</option>
        <option value="contrato">Contrato</option>
        <option value="outro">Outro</option>
      </select>
    </div>
    <div class="form-group">
      <label>Descrição</label>
      <input class="modal-input" id="ur_desc" placeholder="Ex: Nota fiscal do ágape de abril/2026" />
    </div>
    <div class="form-group">
      <label>Arquivo(s)</label>
      <input type="file" id="ur_arqs" multiple class="modal-input"
             accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png,.csv,.xls,.xlsx" />
    </div>
    <div class="sb-msg" id="urMsg"></div>
  `, [
    { label: 'Cancelar', cls: 'neutral', action: 'fecharModal()' },
    { label: '⬆ Enviar', cls: 'primary', action: 'enviarArquivoRapido()' },
  ]);
}

async function enviarArquivoRapido() {
  const loja = state.usuario?.loja_id || 1;
  const ctx  = document.getElementById('ur_ctx').value;
  const desc = document.getElementById('ur_desc').value.trim();
  const arqs = document.getElementById('ur_arqs').files;
  const msg  = document.getElementById('urMsg');

  if (!desc) { msg.textContent = 'Informe uma descrição.'; return; }
  if (!arqs.length) { msg.textContent = 'Selecione ao menos um arquivo.'; return; }

  msg.style.color = '#64748b'; msg.textContent = 'Enviando…';
  const fd = new FormData();
  fd.append('loja_id', loja);
  fd.append('descricao', desc);
  fd.append('contexto', ctx);
  for (const f of arqs) fd.append('arquivos', f);

  try {
    const opts = { method: 'POST', body: fd };
    if (state.token) opts.headers = { Authorization: 'Basic ' + state.token };
    const res = await fetch(apiBase() + '/repositorio/upload', opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || 'Erro ao enviar');

    fecharModal();

    // Verificar se algum arquivo sugere reembolso
    const sugerem = (data.salvos || []).filter(s => s.sugere_reembolso);
    if (sugerem.length) {
      const nomes = sugerem.map(s => s.nome).join(', ');
      if (confirm(`📋 O sistema identificou que "${nomes}" pode ser um comprovante de compra.\n\nDeseja criar um pedido de reembolso para este valor?`)) {
        abrirModal('✔️ Aprovar / Rejeitar Reembolso', '', []);
        abrirAprovarReembolsoLista();
      }
    } else {
      alert(`✅ ${data.salvos?.length || 0} arquivo(s) enviado(s) com sucesso!`);
    }
  } catch(e) {
    msg.style.color = '#dc2626'; msg.textContent = '⚠ ' + e.message;
  }
}

// ═══════════════════════════════════════════════════════════
//  EXCLUIR ARQUIVO (repositório e compras)
// ═══════════════════════════════════════════════════════════

async function excluirArquivoRepo(id) {
  return excluirArquivoUniversal('geral', 0, id);
}

async function excluirArquivoUniversal(contexto, contextoId, arquivoId) {
  if (!confirm('Excluir este arquivo permanentemente?')) return;
  try {
    if (contexto === 'compra') {
      await api('DELETE', `/compras/${contextoId}/arquivo/${arquivoId}`);
    } else {
      await api('DELETE', `/repositorio/${arquivoId}`);
    }
    carregarRepositorio();
  } catch(e) { alert('Erro: ' + e.message); }
}

// ═══════════════════════════════════════════════════════════
//  CATEGORIAS DE MENSALIDADE
// ═══════════════════════════════════════════════════════════

async function novaCategoriaMens() {
  const loja = state.usuario?.loja_id || 1;
  abrirModal('Nova Categoria de Mensalidade', `
    <div class="form-group"><label>Nome</label>
      <input class="modal-input" id="cm_nome" placeholder="Ex: Isento" /></div>
    <div class="form-group"><label>Descrição</label>
      <input class="modal-input" id="cm_desc" placeholder="Opcional" /></div>
    <div class="sb-msg" id="cmMsg"></div>
  `, [
    { label: 'Cancelar', cls: 'neutral', action: 'fecharModal()' },
    { label: 'Salvar', cls: 'primary', action: `salvarNovaCategoriaMens(${loja})` },
  ]);
}

async function salvarNovaCategoriaMens(loja) {
  const nome = document.getElementById('cm_nome').value.trim();
  const desc = document.getElementById('cm_desc').value.trim();
  if (!nome) { document.getElementById('cmMsg').textContent = 'Informe o nome.'; return; }
  try {
    await api('POST', '/categorias-mensalidade', { loja_id: loja, nome, descricao: desc || null });
    fecharModal(); renderIrmaoView();
  } catch(e) { document.getElementById('cmMsg').textContent = e.message; }
}

async function editarCategoriaMens(id, nome, desc) {
  abrirModal('Editar Categoria', `
    <div class="form-group"><label>Nome</label>
      <input class="modal-input" id="cm_nome" value="${nome}" /></div>
    <div class="form-group"><label>Descrição</label>
      <input class="modal-input" id="cm_desc" value="${desc}" /></div>
    <div class="sb-msg" id="cmMsg"></div>
  `, [
    { label: 'Cancelar', cls: 'neutral', action: 'fecharModal()' },
    { label: 'Salvar', cls: 'primary', action: `atualizarCategoriaMens(${id})` },
  ]);
}

async function atualizarCategoriaMens(id) {
  const nome = document.getElementById('cm_nome').value.trim();
  const desc = document.getElementById('cm_desc').value.trim();
  if (!nome) { document.getElementById('cmMsg').textContent = 'Informe o nome.'; return; }
  try {
    await api('PUT', `/categorias-mensalidade/${id}`, { nome, descricao: desc || null, ativo: true });
    fecharModal(); renderIrmaoView();
  } catch(e) { document.getElementById('cmMsg').textContent = e.message; }
}

async function excluirCategoriaMens(id) {
  if (!confirm('Excluir esta categoria?')) return;
  try { await api('DELETE', `/categorias-mensalidade/${id}`); renderIrmaoView(); }
  catch(e) { alert(e.message); }
}

// ═══════════════════════════════════════════════════════════
//  INVENTÁRIO DA LOJA
// ═══════════════════════════════════════════════════════════

const CONDICAO_LABELS = { novo: 'Novo', bom: 'Bom', usado: 'Usado', precisa_reforma: 'Precisa Reforma' };

async function renderInventarioView() {
  const el   = document.getElementById('inventarioView');
  const loja = state.usuario?.loja_id || 1;
  el.innerHTML = `
    <div class="view-header">
      <h1>📋 Inventário da Loja</h1>
      <button class="btn-primary" onclick="abrirNovoItemInventario()">+ Novo Item</button>
    </div>
    <div id="invLista"><div class="loading">Carregando…</div></div>
  `;
  await carregarInventario();
}

async function carregarInventario() {
  const loja = state.usuario?.loja_id || 1;
  const el   = document.getElementById('invLista');
  if (!el) return;
  try {
    const lista = await api('GET', `/inventario?loja_id=${loja}`);
    if (!lista.length) { el.innerHTML = '<p class="empty-msg">Nenhum item cadastrado.</p>'; return; }

    const precisa = lista.filter(i => i.precisa_comprar);
    el.innerHTML = `
      ${precisa.length ? `<div style="background:#fff7ed;border:1px solid #fb923c;border-radius:8px;padding:12px;margin-bottom:16px;color:#9a3412">
        ⚠️ <strong>${precisa.length} item(s) precisam ser comprados:</strong> ${precisa.map(i => i.nome).join(', ')}
      </div>` : ''}
      <table class="relat-table">
        <thead>
          <tr><th>Item</th><th>Qtd</th><th>Condição</th><th>Precisa Comprar</th><th>Ações</th></tr>
        </thead>
        <tbody>
          ${lista.map(i => `
            <tr>
              <td>
                <div style="font-weight:600">${i.nome}</div>
                ${i.descricao ? `<div style="font-size:12px;color:#64748b">${i.descricao}</div>` : ''}
              </td>
              <td>${i.quantidade}</td>
              <td><span class="badge-status ${i.condicao === 'precisa_reforma' ? 'pendente' : i.condicao === 'novo' ? 'aprovado' : ''}">${CONDICAO_LABELS[i.condicao] || i.condicao}</span></td>
              <td>${i.precisa_comprar ? '<span style="color:#dc2626;font-weight:600">Sim</span>' : 'Não'}</td>
              <td style="display:flex;gap:6px;flex-wrap:wrap">
                <button class="btn-sm neutral" onclick="editarItemInventario(${i.id},'${i.nome.replace(/'/g,"\\'")}','${(i.descricao||'').replace(/'/g,"\\'")}',${i.quantidade},'${i.condicao}',${i.precisa_comprar})">Editar</button>
                <button class="btn-sm danger"  onclick="excluirItemInventario(${i.id})">🗑</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    `;
  } catch(e) {
    el.innerHTML = `<p class="error-msg">${e.message}</p>`;
  }
}

function _formInventario(vals = {}) {
  return `
    <div class="form-group"><label>Nome do item</label>
      <input class="modal-input" id="iv_nome" value="${vals.nome||''}" placeholder="Ex: Projetor Epson" /></div>
    <div class="form-group"><label>Descrição</label>
      <input class="modal-input" id="iv_desc" value="${vals.desc||''}" placeholder="Opcional" /></div>
    <div class="form-group"><label>Quantidade</label>
      <input class="modal-input" type="number" id="iv_qtd" value="${vals.qtd||1}" min="0" /></div>
    <div class="form-group"><label>Condição</label>
      <select class="modal-input" id="iv_cond">
        ${Object.entries(CONDICAO_LABELS).map(([k,v]) => `<option value="${k}" ${(vals.cond||'bom')===k?'selected':''}>${v}</option>`).join('')}
      </select></div>
    <div class="form-group"><label style="display:flex;gap:8px;align-items:center">
      <input type="checkbox" id="iv_comprar" ${vals.comprar?'checked':''}> Precisa comprar</label></div>
    <div class="sb-msg" id="ivMsg"></div>
  `;
}

async function abrirNovoItemInventario() {
  abrirModal('Novo Item de Inventário', _formInventario(), [
    { label: 'Cancelar', cls: 'neutral', action: 'fecharModal()' },
    { label: 'Salvar', cls: 'primary', action: 'salvarNovoItemInventario()' },
  ]);
}

async function salvarNovoItemInventario() {
  const loja = state.usuario?.loja_id || 1;
  const nome = document.getElementById('iv_nome').value.trim();
  if (!nome) { document.getElementById('ivMsg').textContent = 'Informe o nome.'; return; }
  try {
    await api('POST', '/inventario', {
      loja_id: loja, nome,
      descricao: document.getElementById('iv_desc').value.trim() || null,
      quantidade: +document.getElementById('iv_qtd').value || 1,
      condicao: document.getElementById('iv_cond').value,
      precisa_comprar: document.getElementById('iv_comprar').checked,
    });
    fecharModal(); carregarInventario();
  } catch(e) { document.getElementById('ivMsg').textContent = e.message; }
}

async function editarItemInventario(id, nome, desc, qtd, cond, comprar) {
  abrirModal('Editar Item', _formInventario({ nome, desc, qtd, cond, comprar }), [
    { label: 'Cancelar', cls: 'neutral', action: 'fecharModal()' },
    { label: 'Salvar', cls: 'primary', action: `atualizarItemInventario(${id})` },
  ]);
}

async function atualizarItemInventario(id) {
  const nome = document.getElementById('iv_nome').value.trim();
  if (!nome) { document.getElementById('ivMsg').textContent = 'Informe o nome.'; return; }
  try {
    await api('PUT', `/inventario/${id}`, {
      nome,
      descricao: document.getElementById('iv_desc').value.trim() || null,
      quantidade: +document.getElementById('iv_qtd').value || 1,
      condicao: document.getElementById('iv_cond').value,
      precisa_comprar: document.getElementById('iv_comprar').checked,
    });
    fecharModal(); carregarInventario();
  } catch(e) { document.getElementById('ivMsg').textContent = e.message; }
}

async function excluirItemInventario(id) {
  if (!confirm('Excluir este item do inventário?')) return;
  try { await api('DELETE', `/inventario/${id}`); carregarInventario(); }
  catch(e) { alert(e.message); }
}

// ═══════════════════════════════════════════════════════════
//  NOTIFICAÇÕES INBOX
// ═══════════════════════════════════════════════════════════

async function atualizarBadgeNotif() {
  if (!state.token) return;
  const loja = state.usuario?.loja_id || 1;
  try {
    const lista = await api('GET', `/notificacoes/inbox?loja_id=${loja}`);
    const nLidas = lista.filter(n => !n.lido).length;
    const badge = document.getElementById('notifBadge');
    if (!badge) return;
    if (nLidas > 0) {
      badge.textContent = nLidas;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  } catch(_) {}
}

async function abrirInbox() {
  const loja = state.usuario?.loja_id || 1;
  let lista = [];
  try { lista = await api('GET', `/notificacoes/inbox?loja_id=${loja}`); } catch(_) {}

  const html = lista.length ? lista.map(n => `
    <div style="border:1px solid ${n.lido ? '#e2e8f0' : '#bfdbfe'};border-radius:8px;padding:12px;background:${n.lido ? '#fff' : '#eff6ff'}">
      <div style="font-weight:${n.lido ? 400 : 700};font-size:14px">${n.titulo}</div>
      ${n.mensagem ? `<div style="font-size:12px;color:#64748b;margin-top:4px">${n.mensagem}</div>` : ''}
      <div style="font-size:11px;color:#94a3b8;margin-top:6px">${new Date(n.criado_em).toLocaleString('pt-BR')}</div>
    </div>`).join('')
  : '<p style="color:#94a3b8;padding:12px 0">Nenhuma notificação.</p>';

  abrirModal('🔔 Notificações', `
    <div style="max-height:400px;overflow-y:auto;display:flex;flex-direction:column;gap:8px">
      ${html}
    </div>
  `, [
    { label: 'Marcar todas como lidas', cls: 'neutral', action: `marcarTodasNotifLidas(${loja})` },
    { label: 'Fechar', cls: 'primary', action: 'fecharModal()' },
  ]);
}

async function marcarTodasNotifLidas(loja) {
  try {
    await api('PUT', `/notificacoes/inbox/todas-lidas?loja_id=${loja}`);
    atualizarBadgeNotif();
    fecharModal();
  } catch(e) { alert(e.message); }
}

// ═══════════════════════════════════════════════════════════
//  WHATSAPP — painel de controle da instância
// ═══════════════════════════════════════════════════════════

async function renderWhatsAppView() {
  const el = document.getElementById('whatsappView');
  el.innerHTML = `
    <div class="view-header">
      <h1>💬 WhatsApp</h1>
    </div>
    <div id="wppPainel"><div class="loading">Verificando conexão…</div></div>
  `;
  await _wppCarregarStatus();
}

async function _wppCarregarStatus() {
  const el = document.getElementById('wppPainel');
  if (!el) return;
  try {
    const r = await api('GET', '/whatsapp/status');
    const state_wpp = r?.instance?.state || r?.state || 'unknown';
    const connected = state_wpp === 'open';

    // Atualiza ponto verde/vermelho no sidebar
    const dot = document.getElementById('wppStatusDot');
    if (dot) dot.style.background = connected ? '#16a34a' : '#dc2626';

    if (connected) {
      const numero = r?.instance?.profileName || r?.profileName || '';
      el.innerHTML = `
        <div class="wpp-status-card connected">
          <div class="wpp-status-icon">✅</div>
          <div>
            <div class="wpp-status-title">WhatsApp conectado</div>
            ${numero ? `<div class="wpp-status-sub">${numero}</div>` : ''}
          </div>
        </div>
        <div class="wpp-actions">
          <button class="btn-primary" onclick="_wppConfigurarWebhook()">⚙️ Configurar Webhook</button>
          <button class="func-btn neutral" onclick="_wppDesconectar()">Desconectar</button>
        </div>
        <div class="wpp-info-box">
          <strong>Bot ativo</strong> — os irmãos podem mandar mensagem para o número e receber:
          <ul>
            <li>Menu de opções (1, 2, 3)</li>
            <li>Fotos/PDFs de comprovantes → registrados como reembolso automaticamente</li>
            <li>Próximas sessões e eventos</li>
            <li>Status da mensalidade</li>
          </ul>
          <p style="margin-top:8px;color:#64748b;font-size:12px">
            Para que o número de cada irmão seja reconhecido, cadastre o WhatsApp dele na tela de <strong>Cadastro de Irmãos</strong>.
          </p>
        </div>
      `;
    } else {
      el.innerHTML = `
        <div class="wpp-status-card disconnected">
          <div class="wpp-status-icon">📵</div>
          <div>
            <div class="wpp-status-title">WhatsApp desconectado</div>
            <div class="wpp-status-sub">Clique em Conectar para gerar o QR Code</div>
          </div>
        </div>
        <div class="wpp-actions">
          <button class="btn-primary" onclick="_wppConectar()">📲 Conectar / Gerar QR Code</button>
        </div>
        <div id="wppQrArea"></div>
      `;
    }
  } catch(e) {
    el.innerHTML = `
      <div class="wpp-status-card disconnected">
        <div class="wpp-status-icon">⚠️</div>
        <div>
          <div class="wpp-status-title">Evolution API não encontrada</div>
          <div class="wpp-status-sub">Verifique se EVOLUTION_API_URL está configurada no Railway</div>
        </div>
      </div>
      <div class="wpp-actions">
        <button class="btn-primary" onclick="_wppConectar()">📲 Tentar conectar</button>
      </div>
      <div id="wppQrArea"></div>
      <div class="wpp-info-box" style="margin-top:16px">
        <strong>Como configurar a Evolution API no Railway:</strong>
        <ol>
          <li>Acesse <strong>railway.app</strong> → seu projeto → <em>+ New Service</em> → <em>Docker Image</em></li>
          <li>Imagem: <code>atendai/evolution-api:v2.2.3</code></li>
          <li>Adicione as variáveis de ambiente:<br>
            <code>AUTHENTICATION_TYPE=apikey</code><br>
            <code>AUTHENTICATION_API_KEY=sua-chave-aqui</code><br>
            <code>WEBHOOK_GLOBAL_ENABLED=true</code><br>
            <code>WEBHOOK_GLOBAL_URL=https://SEU-BACKEND.railway.app/whatsapp/webhook</code><br>
            <code>WEBHOOK_GLOBAL_WEBHOOK_BASE64=true</code>
          </li>
          <li>No backend, adicione:<br>
            <code>EVOLUTION_API_URL=https://sua-evolution.railway.app</code><br>
            <code>EVOLUTION_API_KEY=sua-chave-aqui</code><br>
            <code>EVOLUTION_INSTANCE=secretaria</code><br>
            <code>WEBHOOK_URL=https://SEU-BACKEND.railway.app</code>
          </li>
          <li>Volte aqui e clique em <strong>Conectar</strong></li>
        </ol>
      </div>
    `;
  }
}

async function _wppConectar() {
  const area = document.getElementById('wppQrArea');
  if (area) area.innerHTML = '<div class="loading">Conectando…</div>';
  try {
    const r = await api('POST', '/whatsapp/conectar');
    const qr = r?.qrcode?.base64 || r?.base64 || r?.qr || '';
    if (qr && area) {
      const src = qr.startsWith('data:') ? qr : `data:image/png;base64,${qr}`;
      area.innerHTML = `
        <div class="wpp-qr-wrap">
          <p style="font-weight:600;margin-bottom:12px">Escaneie o QR Code com o WhatsApp do número da loja:</p>
          <img src="${src}" class="wpp-qr-img" alt="QR Code WhatsApp" />
          <p style="font-size:12px;color:#64748b;margin-top:8px">O QR Code expira em ~60 segundos. Atualize se necessário.</p>
          <button class="func-btn neutral" style="margin-top:8px" onclick="_wppCarregarQR()">🔄 Novo QR Code</button>
          <button class="btn-primary" style="margin-top:8px" onclick="_wppCarregarStatus()">✅ Já escanei</button>
        </div>
      `;
    } else {
      if (area) area.innerHTML = '<p class="empty-msg">Instância criada. Aguarde e clique em "Gerar QR Code".</p>';
      setTimeout(_wppCarregarQR, 2000);
    }
  } catch(e) {
    if (area) area.innerHTML = `<p class="error-msg">Erro: ${e.message}</p>`;
  }
}

async function _wppCarregarQR() {
  const area = document.getElementById('wppQrArea');
  if (area) area.innerHTML = '<div class="loading">Buscando QR Code…</div>';
  try {
    const r = await api('GET', '/whatsapp/qrcode');
    const qr = r?.qrcode?.base64 || r?.base64 || r?.qr || '';
    if (qr && area) {
      const src = qr.startsWith('data:') ? qr : `data:image/png;base64,${qr}`;
      area.innerHTML = `
        <div class="wpp-qr-wrap">
          <p style="font-weight:600;margin-bottom:12px">Escaneie com o WhatsApp do número da loja:</p>
          <img src="${src}" class="wpp-qr-img" alt="QR Code WhatsApp" />
          <p style="font-size:12px;color:#64748b;margin-top:8px">QR Code expira em ~60 segundos.</p>
          <button class="func-btn neutral" style="margin-top:8px" onclick="_wppCarregarQR()">🔄 Novo QR Code</button>
          <button class="btn-primary" style="margin-top:8px" onclick="_wppCarregarStatus()">✅ Já escanei</button>
        </div>
      `;
    } else {
      if (area) area.innerHTML = '<p class="empty-msg">QR Code não disponível ainda. Tente novamente.</p>';
    }
  } catch(e) {
    if (area) area.innerHTML = `<p class="error-msg">Erro: ${e.message}</p>`;
  }
}

async function _wppConfigurarWebhook() {
  try {
    await api('POST', '/whatsapp/configurar-webhook');
    alert('Webhook configurado com sucesso!');
  } catch(e) {
    alert('Erro ao configurar webhook: ' + e.message);
  }
}

async function _wppDesconectar() {
  if (!confirm('Desconectar o WhatsApp? O bot deixará de funcionar até reconectar.')) return;
  try {
    await api('DELETE', '/whatsapp/desconectar');
    await _wppCarregarStatus();
  } catch(e) {
    alert('Erro: ' + e.message);
  }
}

// ═══════════════════════════════════════════════════════════
//  MÓDULO — TAREFAS
// ═══════════════════════════════════════════════════════════

const PRIORIDADE_CFG = {
  urgente: { label:'Urgente', cor:'#dc2626' },
  alta:    { label:'Alta',    cor:'#ea580c' },
  normal:  { label:'Normal',  cor:'#0369a1' },
  baixa:   { label:'Baixa',   cor:'#64748b' },
};
const STATUS_TAREFA_CFG = {
  pendente:     { label:'Pendente',     cor:'#64748b' },
  em_andamento: { label:'Em andamento', cor:'#0369a1' },
  concluida:    { label:'Concluída',    cor:'#16a34a' },
  cancelada:    { label:'Cancelada',    cor:'#94a3b8' },
};

let _tarefasFiltroStatus = '';
let _tarefasFiltroprior  = '';

async function renderTarefasView() {
  const view = document.getElementById('tarefasView');
  view.innerHTML = `<div style="padding:32px;color:#64748b">Carregando tarefas…</div>`;
  try {
    let url = '/tarefas';
    const qs = [];
    if (_tarefasFiltroStatus) qs.push(`status=${_tarefasFiltroStatus}`);
    if (_tarefasFiltroprior)  qs.push(`prioridade=${_tarefasFiltroprior}`);
    if (qs.length) url += '?' + qs.join('&');

    const lista = await api('GET', url);
    const hoje = new Date().toISOString().substring(0,10);

    const cards = lista.length ? lista.map(t => {
      const pr = PRIORIDADE_CFG[t.prioridade] || PRIORIDADE_CFG.normal;
      const st = STATUS_TAREFA_CFG[t.status]  || STATUS_TAREFA_CFG.pendente;
      const venc = t.vencimento ? t.vencimento.substring(0,10) : null;
      const atrasada = venc && venc < hoje && t.status !== 'concluida' && t.status !== 'cancelada';
      const vencTxt = venc
        ? `<span style="color:${atrasada?'#dc2626':'#64748b'};font-size:12px">
             ${atrasada?'⚠️ ':''} Vence ${venc}</span>`
        : '';
      const resp = t.responsavel_nome || t.irmao_nome || '—';
      const badge = (txt,cor) =>
        `<span style="background:${cor}18;color:${cor};border:1px solid ${cor}33;
                padding:2px 9px;border-radius:10px;font-size:11px;font-weight:600">${txt}</span>`;
      const concluida = t.status === 'concluida';
      return `
        <div style="background:#fff;border:1px solid ${atrasada?'#fca5a5':'#e2e8f0'};
                    border-left:4px solid ${pr.cor};border-radius:10px;
                    padding:14px 16px;display:flex;gap:12px;align-items:flex-start">
          <input type="checkbox" ${concluida?'checked':''} style="margin-top:3px;cursor:pointer;width:16px;height:16px"
            onchange="toggleTarefaConcluida(${t.id}, this.checked)">
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <span style="font-weight:600;font-size:15px;${concluida?'text-decoration:line-through;color:#94a3b8':''}">${t.titulo}</span>
              ${badge(pr.label, pr.cor)} ${badge(st.label, st.cor)}
            </div>
            ${t.descricao ? `<div style="color:#64748b;font-size:13px;margin-top:4px">${t.descricao}</div>` : ''}
            <div style="display:flex;gap:16px;margin-top:6px;flex-wrap:wrap">
              <span style="color:#64748b;font-size:12px">👤 ${resp}</span>
              ${vencTxt}
            </div>
          </div>
          <div style="display:flex;gap:6px;flex-shrink:0">
            <button onclick="abrirEditarTarefa(${t.id})"
              style="background:#f1f5f9;border:none;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:13px">✏️</button>
            <button onclick="confirmarDeletarTarefa(${t.id})"
              style="background:#fef2f2;border:none;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:13px">🗑️</button>
          </div>
        </div>`;
    }).join('') : `<div style="color:#94a3b8;text-align:center;padding:40px">Nenhuma tarefa encontrada.</div>`;

    view.innerHTML = `
      <div style="padding:24px">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:16px">
          <h2 style="font-size:20px;font-weight:700;margin:0">Tarefas</h2>
          <button onclick="abrirNovaTarefa()"
            style="background:#16a34a;color:#fff;border:none;padding:8px 18px;
                   border-radius:8px;cursor:pointer;font-weight:600;font-size:14px">+ Nova Tarefa</button>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px">
          <select onchange="_tarefasFiltroStatus=this.value;renderTarefasView()"
            style="padding:6px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px">
            <option value="">Todos os status</option>
            <option value="pendente" ${_tarefasFiltroStatus==='pendente'?'selected':''}>Pendente</option>
            <option value="em_andamento" ${_tarefasFiltroStatus==='em_andamento'?'selected':''}>Em andamento</option>
            <option value="concluida" ${_tarefasFiltroStatus==='concluida'?'selected':''}>Concluída</option>
            <option value="cancelada" ${_tarefasFiltroStatus==='cancelada'?'selected':''}>Cancelada</option>
          </select>
          <select onchange="_tarefasFiltroprior=this.value;renderTarefasView()"
            style="padding:6px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px">
            <option value="">Todas as prioridades</option>
            <option value="urgente" ${_tarefasFiltroprior==='urgente'?'selected':''}>Urgente</option>
            <option value="alta"    ${_tarefasFiltroprior==='alta'?'selected':''}>Alta</option>
            <option value="normal"  ${_tarefasFiltroprior==='normal'?'selected':''}>Normal</option>
            <option value="baixa"   ${_tarefasFiltroprior==='baixa'?'selected':''}>Baixa</option>
          </select>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">${cards}</div>
      </div>
      ${_modalTarefa()}`;
  } catch(e) {
    view.innerHTML = `<div style="padding:24px;color:#dc2626">Erro: ${e.message}</div>`;
  }
}

function _modalTarefa(t = null) {
  const id = t ? t.id : '';
  return `
    <div id="modalTarefaOverlay" class="modal-overlay" onclick="fecharModalTarefa()" style="display:none">
      <div class="modal-box" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-title">${t ? 'Editar Tarefa' : 'Nova Tarefa'}</div>
          <button class="modal-close" onclick="fecharModalTarefa()">✕</button>
        </div>
        <div class="modal-body">
          <div><div class="modal-label">Título *</div>
            <input class="modal-input" id="tf_titulo" value="${t?.titulo||''}" placeholder="Título da tarefa" /></div>
          <div><div class="modal-label">Descrição</div>
            <textarea class="modal-input" id="tf_desc" rows="3"
              style="resize:vertical">${t?.descricao||''}</textarea></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div><div class="modal-label">Prioridade</div>
              <select class="modal-input" id="tf_prior">
                ${['urgente','alta','normal','baixa'].map(p=>
                  `<option value="${p}" ${(t?.prioridade||'normal')===p?'selected':''}>${PRIORIDADE_CFG[p].label}</option>`
                ).join('')}
              </select></div>
            <div><div class="modal-label">Vencimento</div>
              <input class="modal-input" id="tf_venc" type="date" value="${t?.vencimento?t.vencimento.substring(0,10):''}" /></div>
          </div>
          <div id="tf_msg" class="modal-result" style="display:none"></div>
        </div>
        <div class="modal-footer">
          <button class="func-btn neutral" onclick="fecharModalTarefa()">Cancelar</button>
          <button class="func-btn primary" onclick="salvarTarefa('${id}')">Salvar</button>
        </div>
      </div>
    </div>`;
}

function abrirNovaTarefa() {
  const view = document.getElementById('tarefasView');
  const old = document.getElementById('modalTarefaOverlay');
  if (old) old.remove();
  view.insertAdjacentHTML('beforeend', _modalTarefa());
  document.getElementById('modalTarefaOverlay').style.display = 'flex';
}

async function abrirEditarTarefa(id) {
  try {
    const lista = await api('GET', `/tarefas?status=`);
    const t = lista.find(x => x.id === id);
    if (!t) return;
    const view = document.getElementById('tarefasView');
    const old = document.getElementById('modalTarefaOverlay');
    if (old) old.remove();
    view.insertAdjacentHTML('beforeend', _modalTarefa(t));
    document.getElementById('modalTarefaOverlay').style.display = 'flex';
  } catch(e) { alert('Erro: ' + e.message); }
}

function fecharModalTarefa() {
  const el = document.getElementById('modalTarefaOverlay');
  if (el) el.style.display = 'none';
}

async function salvarTarefa(id) {
  const titulo = document.getElementById('tf_titulo').value.trim();
  const msg    = document.getElementById('tf_msg');
  if (!titulo) { msg.style.display='block'; msg.className='modal-result error'; msg.textContent='Título obrigatório.'; return; }
  const payload = {
    titulo,
    descricao:  document.getElementById('tf_desc').value.trim() || null,
    prioridade: document.getElementById('tf_prior').value,
    vencimento: document.getElementById('tf_venc').value || null,
  };
  try {
    if (id) await api('PUT', `/tarefas/${id}`, payload);
    else    await api('POST', '/tarefas', payload);
    fecharModalTarefa();
    renderTarefasView();
  } catch(e) {
    msg.style.display='block'; msg.className='modal-result error'; msg.textContent=e.message;
  }
}

async function toggleTarefaConcluida(id, concluida) {
  await api('PATCH', `/tarefas/${id}/status`, { status: concluida ? 'concluida' : 'pendente' });
  renderTarefasView();
}

async function confirmarDeletarTarefa(id) {
  if (!confirm('Excluir esta tarefa?')) return;
  await api('DELETE', `/tarefas/${id}`);
  renderTarefasView();
}

// ═══════════════════════════════════════════════════════════
//  MÓDULO — LOJAS & COMPLEXOS
// ═══════════════════════════════════════════════════════════

let _lojasFiltro  = 'todos';
const _lojasCache = {};

async function renderLojasView() {
  const view = document.getElementById('lojasView');
  view.innerHTML = `<div class="loading">Carregando lojas…</div>`;
  try {
    const lista = await api('GET', '/lojas');
    lista.forEach(l => { _lojasCache[l.id] = l; });
    const isAdmin = state.usuario?.cargo === 'admin_principal';
    const complexos = lista.filter(l => l.tipo === 'complexo');
    const filhas    = lista.filter(l => l.tipo === 'loja');
    const filtradas = _lojasFiltro === 'complexo' ? complexos
                    : _lojasFiltro === 'loja'     ? filhas
                    : lista;

    view.innerHTML = `
      <div class="view-header">
        <h1>Lojas & Complexos</h1>
        ${isAdmin ? `<button class="btn-primary" onclick="abrirModalLoja(null)">+ Nova Loja</button>` : ''}
      </div>

      <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:22px">
        ${_ljaStatCard('🏛️', complexos.length, 'Complexos')}
        ${_ljaStatCard('🕍', filhas.length, 'Lojas filhas')}
        ${_ljaStatCard('👥', lista.reduce((s,l) => s + (+l.total_irmaos||0), 0), 'Irmãos cadastrados')}
      </div>

      <div style="display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap">
        ${['todos','complexo','loja'].map(f => `
          <button onclick="_lojasFiltro='${f}';renderLojasView()"
            class="func-btn ${_lojasFiltro===f?'primary':'neutral'}">
            ${{ todos:'Todos', complexo:'Complexos', loja:'Lojas Filhas' }[f]}
          </button>`).join('')}
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:16px">
        ${filtradas.length ? filtradas.map(l => _ljaCard(l, isAdmin)).join('') :
          '<p class="empty-msg">Nenhuma loja encontrada.</p>'}
      </div>

      <div id="modalLojaOverlay" class="modal-overlay" onclick="fecharModalLoja()" style="display:none">
        <div class="modal-box" onclick="event.stopPropagation()" style="max-width:560px"></div>
      </div>`;
  } catch(e) {
    view.innerHTML = `<div class="error-msg">Erro: ${e.message}</div>`;
  }
}

function _ljaStatCard(icon, val, label) {
  return `<div style="background:var(--white);border:1px solid var(--border);border-radius:12px;
    padding:16px 24px;box-shadow:var(--shadow);min-width:120px;text-align:center">
    <div style="font-size:26px">${icon}</div>
    <div style="font-size:22px;font-weight:800;color:var(--text);margin:4px 0">${val}</div>
    <div style="font-size:12px;color:var(--muted)">${label}</div>
  </div>`;
}

function _ljaCard(l, isAdmin) {
  const tipoCor = l.tipo === 'complexo' ? '#7c3aed' : '#0369a1';
  const stCor   = {ativa:'#16a34a',pendente:'#d97706',inativa:'#64748b',bloqueada:'#dc2626'}[l.status] || '#64748b';
  return `
    <div style="background:var(--white);border:1px solid var(--border);border-radius:14px;
                padding:20px;box-shadow:var(--shadow);border-top:3px solid ${tipoCor}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
        <span style="background:${tipoCor}18;color:${tipoCor};font-size:11px;font-weight:700;
                     padding:2px 10px;border-radius:20px;text-transform:uppercase">
          ${l.tipo === 'complexo' ? '🏛 Complexo' : '🕍 Loja'}
        </span>
        <span style="background:${stCor}18;color:${stCor};font-size:11px;font-weight:700;
                     padding:2px 10px;border-radius:20px;text-transform:uppercase">${l.status}</span>
      </div>
      <div style="font-size:17px;font-weight:800;color:var(--text);margin-bottom:4px">
        ${l.nome}${l.numero ? ` <span style="color:var(--muted);font-size:13px;font-weight:400">nº ${l.numero}</span>` : ''}
      </div>
      ${l.potencia     ? `<div style="font-size:12px;color:var(--muted);margin-top:2px">⚡ ${l.potencia}</div>` : ''}
      ${l.cidade       ? `<div style="font-size:12px;color:var(--muted);margin-top:2px">📍 ${l.cidade}</div>` : ''}
      ${l.complexo_nome ? `<div style="font-size:12px;color:var(--muted);margin-top:2px">↗ ${l.complexo_nome}</div>` : ''}
      ${l.tenant_nome   ? `<div style="font-size:12px;color:var(--muted);margin-top:2px">💳 ${l.tenant_nome}</div>` : ''}
      <div style="display:flex;align-items:center;gap:8px;margin-top:14px;padding-top:12px;
                  border-top:1px solid var(--border);flex-wrap:wrap">
        <span style="font-size:12px;color:var(--muted);margin-right:auto">👥 ${l.total_irmaos||0} irmãos</span>
        ${l.tipo==='complexo'?`<button class="func-btn primary" style="font-size:12px;padding:5px 12px"
          onclick="abrirModulo('complexo_dash')">Dashboard</button>`:''}
        ${isAdmin?`<button class="func-btn neutral" style="font-size:12px;padding:5px 12px"
          onclick="abrirModalLoja(${l.id})">Editar</button>`:''}
        ${isAdmin?`<button class="func-btn danger" style="font-size:12px;padding:5px 12px"
          onclick="confirmarDeletarLoja(${l.id},'${l.nome.replace(/'/g,'\\u0027')}')">Excluir</button>`:''}
      </div>
    </div>`;
}

async function abrirModalLoja(id) {
  const overlay = document.getElementById('modalLojaOverlay');
  if (!overlay) { await renderLojasView(); return abrirModalLoja(id); }
  const l = id ? _lojasCache[id] : null;

  // Carrega lista de complexos e tenants para os dropdowns
  let complexos = [], tenants = [];
  try { complexos = (await api('GET', '/lojas?tipo=complexo')); } catch(_) {}
  try { tenants   = (await api('GET', '/tenants')); } catch(_) {}

  const CARGOS_LOJAS = ['GOE','GLEMT','GOEB','GOB','GONMB','Outra'];

  overlay.querySelector('.modal-box').innerHTML = `
    <div class="modal-header">
      <div class="modal-title">${l ? 'Editar Loja' : 'Nova Loja'}</div>
      <button class="modal-close" onclick="fecharModalLoja()">✕</button>
    </div>
    <div class="modal-body">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="form-group" style="grid-column:1/-1">
          <label>Nome *</label>
          <input class="modal-input" id="lj_nome" value="${l?.nome||''}" placeholder="Nome da loja" />
        </div>
        <div class="form-group">
          <label>Número</label>
          <input class="modal-input" id="lj_num" value="${l?.numero||''}" placeholder="Ex: 36" />
        </div>
        <div class="form-group">
          <label>Tipo *</label>
          <select class="modal-input" id="lj_tipo" onchange="_ljaToggleComplexo()">
            <option value="loja"    ${(!l||l.tipo==='loja')   ?'selected':''}>Loja (unidade subordinada)</option>
            <option value="complexo"${l?.tipo==='complexo'?'selected':''}>Complexo (organização mãe)</option>
          </select>
        </div>
        <div class="form-group" id="lj_complexo_wrap" style="${(l?.tipo==='complexo')?'display:none':''};grid-column:1/-1">
          <label>Complexo ao qual esta loja pertence</label>
          <select class="modal-input" id="lj_complexo_id">
            <option value="">— Sem complexo —</option>
            ${complexos.map(c=>`<option value="${c.id}" ${l?.complexo_id===c.id?'selected':''}>${c.nome}${c.numero?' nº'+c.numero:''}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select class="modal-input" id="lj_status">
            ${['ativa','pendente','inativa','bloqueada'].map(s=>`<option value="${s}" ${(l?.status||'ativa')===s?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Potência</label>
          <select class="modal-input" id="lj_potencia">
            <option value="">— Selecione —</option>
            ${CARGOS_LOJAS.map(p=>`<option value="${p}" ${l?.potencia===p?'selected':''}>${p}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Cidade</label>
          <input class="modal-input" id="lj_cidade" value="${l?.cidade||''}" placeholder="Cidade" />
        </div>
        <div class="form-group">
          <label>Telefone WhatsApp</label>
          <input class="modal-input" id="lj_wpp" value="${l?.telefone_whatsapp||''}" placeholder="+5511999999999" />
        </div>
        <div class="form-group" style="grid-column:1/-1">
          <label>Endereço</label>
          <input class="modal-input" id="lj_end" value="${l?.endereco||''}" placeholder="Endereço completo" />
        </div>
        ${tenants.length ? `
        <div class="form-group" style="grid-column:1/-1">
          <label>Assinante SaaS (conta que paga pelo sistema)</label>
          <select class="modal-input" id="lj_tenant_id">
            <option value="">— Sem tenant —</option>
            ${tenants.map(t=>`<option value="${t.id}" ${l?.tenant_id===t.id?'selected':''}>${t.nome} (${t.tipo})</option>`).join('')}
          </select>
        </div>` : ''}
      </div>
      <div id="lj_msg" class="modal-result" style="display:none"></div>
    </div>
    <div class="modal-footer">
      <button class="func-btn neutral" onclick="fecharModalLoja()">Cancelar</button>
      <button class="func-btn primary" onclick="salvarLoja(${id||0})">Salvar</button>
    </div>`;
  overlay.style.display = 'flex';
}

function _ljaToggleComplexo() {
  const tipo = document.getElementById('lj_tipo')?.value;
  const wrap = document.getElementById('lj_complexo_wrap');
  if (wrap) wrap.style.display = tipo === 'complexo' ? 'none' : '';
}

function fecharModalLoja() {
  const overlay = document.getElementById('modalLojaOverlay');
  if (overlay) overlay.style.display = 'none';
}

async function salvarLoja(id) {
  const nome = document.getElementById('lj_nome').value.trim();
  const msg  = document.getElementById('lj_msg');
  if (!nome) {
    msg.style.display='block'; msg.className='modal-result error';
    msg.textContent='Nome obrigatório.'; return;
  }
  const complexo_id = +document.getElementById('lj_complexo_id')?.value || null;
  const tenant_id   = +document.getElementById('lj_tenant_id')?.value  || null;
  const payload = {
    nome, numero:  document.getElementById('lj_num').value.trim() || null,
    tipo:          document.getElementById('lj_tipo').value,
    status:        document.getElementById('lj_status').value,
    potencia:      document.getElementById('lj_potencia').value || null,
    cidade:        document.getElementById('lj_cidade').value.trim() || null,
    telefone_whatsapp: document.getElementById('lj_wpp').value.trim() || null,
    endereco:      document.getElementById('lj_end').value.trim() || null,
    complexo_id,
    limpar_complexo: !complexo_id && !!id,
    tenant_id,
    limpar_tenant: !tenant_id && !!id,
  };
  try {
    if (id) await api('PUT', `/lojas/${id}`, payload);
    else    await api('POST', '/lojas', payload);
    fecharModalLoja();
    renderLojasView();
  } catch(e) {
    msg.style.display='block'; msg.className='modal-result error'; msg.textContent=e.message;
  }
}

async function confirmarDeletarLoja(id, nome) {
  if (!confirm(`Excluir a loja "${nome}"? Esta ação não pode ser desfeita.`)) return;
  try {
    await api('DELETE', `/lojas/${id}`);
    renderLojasView();
  } catch(e) { alert('Erro: ' + e.message); }
}

// ── Dashboard do Complexo ─────────────────────────────────────────────────

async function renderComplexoDashView() {
  const view = document.getElementById('complexoView');
  view.innerHTML = `<div class="loading">Carregando dashboard…</div>`;
  try {
    const d = await api('GET', '/complexo/dashboard');
    if (!d.complexo) {
      view.innerHTML = `
        <div class="view-header"><h1>Dashboard do Complexo</h1></div>
        <div style="background:var(--white);border:1px solid var(--border);border-radius:14px;
                    padding:32px;text-align:center;color:var(--muted)">
          <div style="font-size:40px;margin-bottom:12px">🏛️</div>
          <div style="font-weight:700;font-size:16px;margin-bottom:8px">Nenhum complexo cadastrado</div>
          <p>Acesse <strong>Lojas & Complexos</strong> e crie um complexo primeiro.</p>
          <button class="btn-primary" style="margin-top:16px" onclick="abrirModulo('lojas')">Ir para Lojas</button>
        </div>`;
      return;
    }
    const { complexo, lojas, proximas_sessoes: prox, stats } = d;
    const lojasFilhas = lojas.filter(l => l.id !== complexo.id);

    view.innerHTML = `
      <div class="view-header">
        <div>
          <h1>${complexo.nome}${complexo.numero?' <span style="font-size:14px;font-weight:400;color:var(--muted)">nº '+complexo.numero+'</span>':''}</h1>
          <div style="font-size:13px;color:var(--muted);margin-top:2px">Dashboard do Complexo</div>
        </div>
        <button class="btn-primary" onclick="abrirModulo('lojas')">Gerenciar Lojas</button>
      </div>

      <!-- Stats -->
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;margin-bottom:24px">
        ${_dashCard('🕍', stats.total_lojas_filhas, 'Lojas no complexo', '#0369a1')}
        ${_dashCard('👥', stats.total_irmaos, 'Irmãos no quadro', '#7c3aed')}
        ${_dashCard('📅', stats.proximas_sessoes, 'Próximos eventos (60d)', '#059669')}
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start">

        <!-- Lojas filhas -->
        <div style="background:var(--white);border:1px solid var(--border);border-radius:14px;overflow:hidden;box-shadow:var(--shadow)">
          <div style="padding:16px 20px;border-bottom:1px solid var(--border);font-weight:700;font-size:14px">
            🕍 Lojas no complexo
          </div>
          ${lojasFilhas.length ? `
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            <thead><tr style="background:var(--bg)">
              <th style="padding:8px 16px;text-align:left;font-weight:600;color:var(--muted)">Loja</th>
              <th style="padding:8px 16px;text-align:center;font-weight:600;color:var(--muted)">Irmãos</th>
              <th style="padding:8px 16px;text-align:center;font-weight:600;color:var(--muted)">Status</th>
            </tr></thead>
            <tbody>
              ${lojasFilhas.map(l => {
                const stCor = {ativa:'#16a34a',pendente:'#d97706',inativa:'#64748b',bloqueada:'#dc2626'}[l.status]||'#64748b';
                return `<tr style="border-top:1px solid var(--border)">
                  <td style="padding:10px 16px;font-weight:600">
                    ${l.nome}${l.numero?` <span style="color:var(--muted);font-weight:400">nº${l.numero}</span>`:''}
                  </td>
                  <td style="padding:10px 16px;text-align:center">${l.total_irmaos||0}</td>
                  <td style="padding:10px 16px;text-align:center">
                    <span style="background:${stCor}18;color:${stCor};font-size:11px;font-weight:700;
                                 padding:2px 8px;border-radius:20px">${l.status}</span>
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>` :
          `<div class="empty-msg">Nenhuma loja filha cadastrada ainda.</div>`}
        </div>

        <!-- Próximos eventos -->
        <div style="background:var(--white);border:1px solid var(--border);border-radius:14px;overflow:hidden;box-shadow:var(--shadow)">
          <div style="padding:16px 20px;border-bottom:1px solid var(--border);font-weight:700;font-size:14px">
            📅 Próximos eventos (todas as lojas)
          </div>
          ${prox.length ? `
          <div style="max-height:360px;overflow-y:auto">
            ${prox.map(e => `
              <div style="padding:12px 16px;border-bottom:1px solid var(--border)">
                <div style="font-weight:600;font-size:13px">${e.titulo}</div>
                <div style="font-size:12px;color:var(--muted);margin-top:2px">
                  📅 ${e.data}${e.hora_inicio?' às '+e.hora_inicio:''} &middot;
                  ${e.loja_nome}${e.loja_numero?' nº'+e.loja_numero:''}
                </div>
              </div>`).join('')}
          </div>` :
          `<div class="empty-msg">Nenhum evento nos próximos 60 dias.</div>`}
        </div>
      </div>`;
  } catch(e) {
    view.innerHTML = `<div class="error-msg">Erro ao carregar dashboard: ${e.message}</div>`;
  }
}

function _dashCard(icon, val, label, cor) {
  return `<div style="background:var(--white);border:1px solid var(--border);border-radius:12px;
    padding:18px;box-shadow:var(--shadow);border-top:3px solid ${cor}">
    <div style="font-size:24px">${icon}</div>
    <div style="font-size:26px;font-weight:800;color:${cor};margin:6px 0">${val}</div>
    <div style="font-size:12px;color:var(--muted)">${label}</div>
  </div>`;
}

// ── Vincular usuário a loja (chamado de renderUsuariosView) ───────────────

async function vincularUsuarioLoja(usuarioId) {
  try {
    const lojas = await api('GET', '/lojas');
    const CARGOS_SISTEMA = [
      {id:'admin_principal',     label:'Administrador Principal'},
      {id:'veneravel_mestre',    label:'Venerável Mestre'},
      {id:'primeiro_vigilante',  label:'1º Vigilante'},
      {id:'segundo_vigilante',   label:'2º Vigilante'},
      {id:'secretario',          label:'Secretário'},
      {id:'orador',              label:'Orador'},
      {id:'financeiro',          label:'Tesoureiro'},
      {id:'chanceler',           label:'Chanceler'},
      {id:'arquiteto',           label:'Arquiteto'},
      {id:'almoxarife',          label:'Almoxarife'},
      {id:'mestre_banquete',     label:'Mestre de Banquete'},
      {id:'irmao_operacional',   label:'Irmão Operacional'},
    ];

    const modal  = document.getElementById('modalOverlay');
    const title  = document.getElementById('modalTitle');
    const body   = document.getElementById('modalBody');
    const footer = document.getElementById('modalFooter');

    title.textContent = 'Vincular Loja & Cargo';
    body.innerHTML = `
      <div class="form-group">
        <label>Loja</label>
        <select class="modal-input" id="vl_loja">
          <option value="0">— Sem loja —</option>
          ${lojas.map(l=>`<option value="${l.id}">${l.nome}${l.numero?' nº'+l.numero:''} (${l.tipo})</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Cargo</label>
        <select class="modal-input" id="vl_cargo">
          <option value="">— Manter atual —</option>
          ${CARGOS_SISTEMA.map(c=>`<option value="${c.id}">${c.label}</option>`).join('')}
        </select>
      </div>
      <div id="vl_msg" class="modal-result" style="display:none"></div>`;
    footer.innerHTML = `
      <button class="func-btn neutral" onclick="fecharModal()">Cancelar</button>
      <button class="func-btn primary" onclick="_salvarVinculo(${usuarioId})">Salvar</button>`;
    modal.style.display = 'flex';
  } catch(e) { alert('Erro: ' + e.message); }
}

async function _salvarVinculo(usuarioId) {
  const loja_id = +document.getElementById('vl_loja').value;
  const cargo   =  document.getElementById('vl_cargo').value;
  const msg     =  document.getElementById('vl_msg');
  const payload = {};
  if (loja_id >= 0) payload.loja_id = loja_id || null;
  if (cargo)        payload.cargo   = cargo;
  try {
    await api('PUT', `/usuarios/${usuarioId}/loja`, payload);
    fecharModal();
    renderUsuariosView();
  } catch(e) {
    msg.style.display='block'; msg.className='modal-result error'; msg.textContent=e.message;
  }
}

// ═══════════════════════════════════════════════════════════
//  MÓDULO — CONTRATOS
// ═══════════════════════════════════════════════════════════

const STATUS_CONTRATO = {
  rascunho:  { label: 'Rascunho',  cor: '#64748b' },
  enviado:   { label: 'Enviado',   cor: '#0369a1' },
  aprovado:  { label: 'Aprovado',  cor: '#059669' },
  ativo:     { label: 'Ativo',     cor: '#16a34a' },
  recusado:  { label: 'Recusado',  cor: '#dc2626' },
  encerrado: { label: 'Encerrado', cor: '#94a3b8' },
};

async function renderContratosView() {
  const view = document.getElementById('contratosView');
  view.innerHTML = `<div style="padding:32px;color:#64748b">Carregando contratos…</div>`;
  try {
    const lista = await api('GET', '/contracts');
    if (!lista.length) {
      view.innerHTML = `
        <div style="padding:24px">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 16px">Contratos</h2>
          <p style="color:#64748b">Nenhum contrato cadastrado ainda.</p>
        </div>`;
      return;
    }
    const rows = lista.map(c => {
      const st = STATUS_CONTRATO[c.status] || { label: c.status, cor: '#64748b' };
      const badge = (txt, cor) =>
        `<span style="background:${cor}18;color:${cor};border:1px solid ${cor}33;
                padding:2px 10px;border-radius:12px;font-size:12px;font-weight:600">${txt}</span>`;
      const pagto = c.inadimplente ? badge('Em atraso','#dc2626') : badge('Em dia','#16a34a');
      const arq   = c.arquivo_url
        ? `<button onclick="verArquivoContrato('${c.arquivo_url}')"
              style="background:#0369a1;color:#fff;border:none;padding:4px 12px;
                     border-radius:6px;cursor:pointer;font-size:13px">📄 Abrir</button>`
        : '<span style="color:#94a3b8;font-size:13px">—</span>';
      const ini = c.vigencia_inicio ? c.vigencia_inicio.substring(0,10) : '—';
      const fim = c.vigencia_fim    ? c.vigencia_fim.substring(0,10)    : '—';
      return `<tr style="border-bottom:1px solid #f1f5f9">
        <td style="padding:10px 14px;font-weight:500">${c.loja_nome}</td>
        <td style="padding:10px 14px">${ini}</td>
        <td style="padding:10px 14px">${fim}</td>
        <td style="padding:10px 14px">${badge(st.label, st.cor)}</td>
        <td style="padding:10px 14px">${pagto}</td>
        <td style="padding:10px 14px">${arq}</td>
      </tr>`;
    }).join('');
    view.innerHTML = `
      <div style="padding:24px">
        <h2 style="font-size:20px;font-weight:700;margin:0 0 16px">Contratos</h2>
        <div style="overflow-x:auto;border-radius:10px;border:1px solid #e2e8f0">
          <table style="width:100%;border-collapse:collapse;background:#fff">
            <thead>
              <tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0">
                <th style="padding:10px 14px;text-align:left;font-size:13px;color:#475569">Loja</th>
                <th style="padding:10px 14px;text-align:left;font-size:13px;color:#475569">Início</th>
                <th style="padding:10px 14px;text-align:left;font-size:13px;color:#475569">Término</th>
                <th style="padding:10px 14px;text-align:left;font-size:13px;color:#475569">Status</th>
                <th style="padding:10px 14px;text-align:left;font-size:13px;color:#475569">Pagamento</th>
                <th style="padding:10px 14px;text-align:left;font-size:13px;color:#475569">Arquivo</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
  } catch(e) {
    view.innerHTML = `<div style="padding:24px;color:#dc2626">Erro ao carregar contratos: ${e.message}</div>`;
  }
}

async function verArquivoContrato(url) {
  try {
    const opts = { headers: {} };
    if (state.token) opts.headers['Authorization'] = 'Basic ' + state.token;
    const res = await fetch(apiBase() + url, opts);
    if (!res.ok) { alert('Arquivo não disponível.'); return; }
    const blob = await res.blob();
    window.open(URL.createObjectURL(blob), '_blank');
  } catch(e) { alert('Erro ao abrir arquivo: ' + e.message); }
}

// ═══════════════════════════════════════════════════════════
//  MÓDULO — GESTÃO SAAS (TENANTS & ASSINATURAS)
// ═══════════════════════════════════════════════════════════

const _TENANT_STATUS_COR = {
  ativo:     '#16a34a',
  teste:     '#0369a1',
  bloqueado: '#dc2626',
  cancelado: '#94a3b8',
};

function _tenantBadge(status) {
  const cor = _TENANT_STATUS_COR[status] || '#64748b';
  const label = { ativo:'Ativo', teste:'Teste', bloqueado:'Bloqueado', cancelado:'Cancelado' }[status] || status;
  return `<span style="background:${cor}18;color:${cor};border:1px solid ${cor}33;
    padding:2px 9px;border-radius:12px;font-size:11px;font-weight:700">${label}</span>`;
}

async function renderTenantsView() {
  const view = document.getElementById('tenantsView');
  view.innerHTML = `<div class="loading">Carregando…</div>`;
  try {
    const lista = await api('GET', '/tenants');
    const stats = {
      total:    lista.length,
      ativos:   lista.filter(t => t.status === 'ativo').length,
      bloq:     lista.filter(t => t.status === 'bloqueado').length,
      teste:    lista.filter(t => t.status === 'teste').length,
    };

    const rows = lista.map(t => `
      <tr style="border-top:1px solid var(--border)">
        <td style="padding:10px 14px;font-weight:600">
          ${t.nome}
          ${t.tipo === 'interno' ? '<span style="font-size:10px;background:#7c3aed18;color:#7c3aed;border-radius:8px;padding:1px 6px;margin-left:6px">interno</span>' : ''}
        </td>
        <td style="padding:10px 14px;font-size:13px;color:var(--muted)">${t.plano || '—'}</td>
        <td style="padding:10px 14px;text-align:right;font-size:13px">
          ${t.valor_mensalidade ? 'R$ ' + Number(t.valor_mensalidade).toFixed(2).replace('.',',') : '—'}
        </td>
        <td style="padding:10px 14px;text-align:center">${t.total_lojas || 0}</td>
        <td style="padding:10px 14px;text-align:center">${t.total_usuarios || 0}</td>
        <td style="padding:10px 14px;text-align:center">${t.ultima_competencia || '—'}</td>
        <td style="padding:10px 14px;text-align:center">${_tenantBadge(t.status)}</td>
        <td style="padding:10px 14px;white-space:nowrap;text-align:right">
          <button class="func-btn neutral" style="padding:3px 10px;font-size:12px"
            onclick="renderAssView(${t.id},'${t.nome.replace(/'/g,"\\'")}')">Assinaturas</button>
          <button class="func-btn neutral" style="padding:3px 10px;font-size:12px"
            onclick="abrirModalTenant(${t.id})">Editar</button>
          ${t.status === 'bloqueado'
            ? `<button class="func-btn primary" style="padding:3px 10px;font-size:12px;background:#16a34a"
                onclick="alterarStatusTenant(${t.id},'ativo')">Ativar</button>`
            : t.status === 'ativo' || t.status === 'teste'
              ? `<button class="func-btn primary" style="padding:3px 10px;font-size:12px;background:#dc2626"
                  onclick="alterarStatusTenant(${t.id},'bloqueado')">Bloquear</button>`
              : ''}
          ${t.tipo !== 'interno' ? `
          <button class="func-btn neutral" style="padding:3px 10px;font-size:12px;color:#dc2626"
            onclick="confirmarDeletarTenant(${t.id},'${t.nome.replace(/'/g,"\\'")}')">✕</button>` : ''}
        </td>
      </tr>`).join('');

    view.innerHTML = `
      <div class="view-header" style="margin-bottom:20px">
        <div>
          <h1>Gestão SaaS</h1>
          <div style="font-size:13px;color:var(--muted)">Assinantes — cada organização que usa o sistema</div>
        </div>
        <button class="btn-primary" onclick="abrirModalTenant(null)">+ Novo Assinante</button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin-bottom:24px">
        ${_dashCard('🏢', stats.total,  'Total de assinantes', '#0369a1')}
        ${_dashCard('✅', stats.ativos, 'Ativos',            '#16a34a')}
        ${_dashCard('🚫', stats.bloq,   'Bloqueados',        '#dc2626')}
        ${_dashCard('🧪', stats.teste,  'Em teste',          '#7c3aed')}
      </div>

      <div id="assSubPanel"></div>

      <div style="background:var(--white);border:1px solid var(--border);border-radius:14px;overflow:hidden;box-shadow:var(--shadow)">
        <div style="padding:14px 20px;border-bottom:1px solid var(--border);font-weight:700;font-size:14px">
          📋 Assinantes cadastrados
        </div>
        ${lista.length ? `
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            <thead><tr style="background:var(--bg)">
              <th style="padding:8px 14px;text-align:left;color:var(--muted);font-weight:600">Nome</th>
              <th style="padding:8px 14px;text-align:left;color:var(--muted);font-weight:600">Plano</th>
              <th style="padding:8px 14px;text-align:right;color:var(--muted);font-weight:600">Mensalidade</th>
              <th style="padding:8px 14px;text-align:center;color:var(--muted);font-weight:600">Lojas</th>
              <th style="padding:8px 14px;text-align:center;color:var(--muted);font-weight:600">Usuários</th>
              <th style="padding:8px 14px;text-align:center;color:var(--muted);font-weight:600">Ult. competência</th>
              <th style="padding:8px 14px;text-align:center;color:var(--muted);font-weight:600">Status</th>
              <th style="padding:8px 14px;text-align:right;color:var(--muted);font-weight:600">Ações</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>` :
        `<div class="empty-msg">Nenhum assinante cadastrado ainda.</div>`}
      </div>`;
  } catch(e) {
    view.innerHTML = `<div class="error-msg">Erro ao carregar tenants: ${e.message}</div>`;
  }
}

async function renderAssView(tenantId, tenantNome) {
  const panel = document.getElementById('assSubPanel');
  if (!panel) return;
  panel.innerHTML = `<div class="loading" style="margin-bottom:16px">Carregando assinaturas…</div>`;
  try {
    const lista = await api('GET', `/assinaturas-saas?tenant_id=${tenantId}`);
    const _stCor = { pendente:'#d97706', pago:'#16a34a', vencido:'#dc2626', cancelado:'#94a3b8' };
    const _stLbl = { pendente:'Pendente', pago:'Pago', vencido:'Vencido', cancelado:'Cancelado' };
    panel.innerHTML = `
      <div style="background:var(--white);border:1px solid var(--border);border-radius:14px;
                  overflow:hidden;box-shadow:var(--shadow);margin-bottom:20px">
        <div style="padding:14px 20px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
          <span style="font-weight:700;font-size:14px">💳 Assinaturas — ${tenantNome}</span>
          <div style="display:flex;gap:8px">
            <button class="func-btn neutral" style="font-size:12px;padding:4px 12px"
              onclick="abrirModalAssCreate(${tenantId})">+ Lançar cobrança</button>
            <button class="func-btn primary" style="font-size:12px;padding:4px 12px"
              onclick="gerarMensalidade(${tenantId})">⟳ Gerar mês atual</button>
            <button class="func-btn neutral" style="font-size:12px;padding:4px 12px"
              onclick="document.getElementById('assSubPanel').innerHTML=''">✕ Fechar</button>
          </div>
        </div>
        ${lista.length ? `
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            <thead><tr style="background:var(--bg)">
              <th style="padding:8px 14px;text-align:left;color:var(--muted)">Competência</th>
              <th style="padding:8px 14px;text-align:right;color:var(--muted)">Valor</th>
              <th style="padding:8px 14px;text-align:center;color:var(--muted)">Vencimento</th>
              <th style="padding:8px 14px;text-align:center;color:var(--muted)">Status</th>
              <th style="padding:8px 14px;text-align:center;color:var(--muted)">Pago em</th>
              <th style="padding:8px 14px;text-align:center;color:var(--muted)">Forma</th>
              <th style="padding:8px 14px;text-align:right;color:var(--muted)">Ação</th>
            </tr></thead>
            <tbody>
              ${lista.map(a => {
                const cor = _stCor[a.status] || '#64748b';
                const lbl = _stLbl[a.status] || a.status;
                const badge = `<span style="background:${cor}18;color:${cor};border:1px solid ${cor}33;
                  padding:2px 9px;border-radius:12px;font-size:11px;font-weight:700">${lbl}</span>`;
                const pagoEm = a.pago_em ? a.pago_em.substring(0,10) : '—';
                return `<tr style="border-top:1px solid var(--border)">
                  <td style="padding:10px 14px;font-weight:600">${a.competencia}</td>
                  <td style="padding:10px 14px;text-align:right">R$ ${Number(a.valor).toFixed(2).replace('.',',')}</td>
                  <td style="padding:10px 14px;text-align:center">${a.vencimento ? a.vencimento.substring(0,10) : '—'}</td>
                  <td style="padding:10px 14px;text-align:center">${badge}</td>
                  <td style="padding:10px 14px;text-align:center;color:var(--muted)">${pagoEm}</td>
                  <td style="padding:10px 14px;text-align:center;color:var(--muted)">${a.forma_pagamento || '—'}</td>
                  <td style="padding:10px 14px;text-align:right">
                    ${a.status !== 'pago' ? `<button class="func-btn primary" style="padding:3px 10px;font-size:12px"
                      onclick="marcarAssNPaga(${a.id},${tenantId},'${tenantNome.replace(/'/g,"\\'")}')">✓ Pago</button>` : ''}
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>` :
        `<div class="empty-msg">Nenhuma assinatura lançada para este tenant.</div>`}
      </div>`;
  } catch(e) {
    panel.innerHTML = `<div class="error-msg" style="margin-bottom:16px">Erro ao carregar assinaturas: ${e.message}</div>`;
  }
}

async function marcarAssNPaga(assId, tenantId, tenantNome) {
  const modal  = document.getElementById('modalOverlay');
  const title  = document.getElementById('modalTitle');
  const body   = document.getElementById('modalBody');
  const footer = document.getElementById('modalFooter');
  title.textContent = 'Registrar Pagamento';
  body.innerHTML = `
    <div class="form-group">
      <label class="modal-label">Forma de pagamento</label>
      <select class="modal-input" id="ass_forma">
        <option value="">— selecione —</option>
        <option value="pix">Pix</option>
        <option value="boleto">Boleto</option>
        <option value="transferencia">Transferência</option>
        <option value="dinheiro">Dinheiro</option>
      </select>
    </div>
    <div class="form-group">
      <label class="modal-label">Observação</label>
      <input class="modal-input" id="ass_obs" placeholder="Opcional" />
    </div>
    <div id="ass_msg" class="modal-result" style="display:none"></div>`;
  footer.innerHTML = `
    <button class="func-btn neutral" onclick="fecharModal()">Cancelar</button>
    <button class="func-btn primary" onclick="_confirmarAssNPaga(${assId},${tenantId},'${tenantNome.replace(/'/g,"\\'")}')">Confirmar pagamento</button>`;
  modal.classList.add('open');
}

async function _confirmarAssNPaga(assId, tenantId, tenantNome) {
  const forma = document.getElementById('ass_forma').value;
  const obs   = document.getElementById('ass_obs').value.trim();
  const msg   = document.getElementById('ass_msg');
  try {
    await api('PATCH', `/assinaturas-saas/${assId}/pagar`, { forma_pagamento: forma || null, observacao: obs || null });
    fecharModal();
    renderAssView(tenantId, tenantNome);
  } catch(e) {
    msg.style.display='block'; msg.className='modal-result error'; msg.textContent=e.message;
  }
}

async function gerarMensalidade(tenantId) {
  try {
    const r = await api('POST', `/tenants/${tenantId}/gerar-mensalidade`, {});
    if (r.status === 'already_exists') alert('Já existe cobrança para o mês atual.');
    else renderTenantsView();
  } catch(e) { alert('Erro: ' + e.message); }
}

async function abrirModalAssCreate(tenantId) {
  const modal  = document.getElementById('modalOverlay');
  const title  = document.getElementById('modalTitle');
  const body   = document.getElementById('modalBody');
  const footer = document.getElementById('modalFooter');
  const hoje = new Date();
  const comp  = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}`;
  const venc  = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}-10`;
  title.textContent = 'Lançar Cobrança Manual';
  body.innerHTML = `
    <div class="form-group">
      <label class="modal-label">Competência (YYYY-MM)</label>
      <input class="modal-input" id="ac_comp" value="${comp}" />
    </div>
    <div class="form-group">
      <label class="modal-label">Valor (R$)</label>
      <input class="modal-input" id="ac_valor" type="number" step="0.01" placeholder="0,00" />
    </div>
    <div class="form-group">
      <label class="modal-label">Vencimento (YYYY-MM-DD)</label>
      <input class="modal-input" id="ac_venc" value="${venc}" />
    </div>
    <div class="form-group">
      <label class="modal-label">Observação</label>
      <input class="modal-input" id="ac_obs" placeholder="Opcional" />
    </div>
    <div id="ac_msg" class="modal-result" style="display:none"></div>`;
  footer.innerHTML = `
    <button class="func-btn neutral" onclick="fecharModal()">Cancelar</button>
    <button class="func-btn primary" onclick="_salvarAssCreate(${tenantId})">Lançar</button>`;
  modal.classList.add('open');
}

async function _salvarAssCreate(tenantId) {
  const comp  = document.getElementById('ac_comp').value.trim();
  const valor = parseFloat(document.getElementById('ac_valor').value);
  const venc  = document.getElementById('ac_venc').value.trim();
  const obs   = document.getElementById('ac_obs').value.trim();
  const msg   = document.getElementById('ac_msg');
  if (!comp || isNaN(valor) || !venc) {
    msg.style.display='block'; msg.className='modal-result error'; msg.textContent='Preencha todos os campos obrigatórios.'; return;
  }
  try {
    await api('POST', '/assinaturas-saas', { tenant_id: tenantId, competencia: comp, valor, vencimento: venc, observacao: obs || null });
    fecharModal();
    renderTenantsView();
  } catch(e) {
    msg.style.display='block'; msg.className='modal-result error'; msg.textContent=e.message;
  }
}

async function abrirModalTenant(id) {
  let tenant = null;
  if (id) {
    const lista = await api('GET', '/tenants').catch(() => []);
    tenant = lista.find(t => t.id === id);
  }
  const modal  = document.getElementById('modalOverlay');
  const title  = document.getElementById('modalTitle');
  const body   = document.getElementById('modalBody');
  const footer = document.getElementById('modalFooter');
  title.textContent = id ? 'Editar Assinante' : 'Novo Assinante';
  body.innerHTML = `
    <div class="form-group">
      <label class="modal-label">Nome *</label>
      <input class="modal-input" id="tn_nome" value="${tenant?.nome||''}" placeholder="Nome do complexo/loja" />
    </div>
    <div class="form-group">
      <label class="modal-label">Tipo</label>
      <select class="modal-input" id="tn_tipo">
        <option value="externo" ${(tenant?.tipo||'externo')==='externo'?'selected':''}>Externo</option>
        <option value="interno" ${tenant?.tipo==='interno'?'selected':''}>Interno (próprio)</option>
      </select>
    </div>
    <div class="form-group">
      <label class="modal-label">Plano</label>
      <input class="modal-input" id="tn_plano" value="${tenant?.plano||''}" placeholder="ex: basico, premium" />
    </div>
    <div class="form-group">
      <label class="modal-label">Mensalidade (R$)</label>
      <input class="modal-input" id="tn_valor" type="number" step="0.01"
        value="${tenant?.valor_mensalidade||''}" placeholder="0,00" />
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div class="form-group">
        <label class="modal-label">Dia vencimento</label>
        <input class="modal-input" id="tn_dia" type="number" min="1" max="28"
          value="${tenant?.vencimento_dia||10}" />
      </div>
      <div class="form-group">
        <label class="modal-label">Dias tolerância</label>
        <input class="modal-input" id="tn_tol" type="number" min="0"
          value="${tenant?.dias_tolerancia||5}" />
      </div>
    </div>
    <div class="form-group">
      <label class="modal-label">Status</label>
      <select class="modal-input" id="tn_status">
        <option value="ativo"     ${(tenant?.status||'ativo')==='ativo'?'selected':''}>Ativo</option>
        <option value="teste"     ${tenant?.status==='teste'?'selected':''}>Teste</option>
        <option value="bloqueado" ${tenant?.status==='bloqueado'?'selected':''}>Bloqueado</option>
        <option value="cancelado" ${tenant?.status==='cancelado'?'selected':''}>Cancelado</option>
      </select>
    </div>
    <div id="tn_msg" class="modal-result" style="display:none"></div>`;
  footer.innerHTML = `
    <button class="func-btn neutral" onclick="fecharModal()">Cancelar</button>
    <button class="func-btn primary" onclick="_salvarTenant(${id||'null'})">Salvar</button>`;
  modal.style.display = 'flex';
}

async function _salvarTenant(id) {
  const nome   = document.getElementById('tn_nome').value.trim();
  const tipo   = document.getElementById('tn_tipo').value;
  const plano  = document.getElementById('tn_plano').value.trim();
  const valor  = document.getElementById('tn_valor').value;
  const dia    = parseInt(document.getElementById('tn_dia').value);
  const tol    = parseInt(document.getElementById('tn_tol').value);
  const status = document.getElementById('tn_status').value;
  const msg    = document.getElementById('tn_msg');
  if (!nome) { msg.style.display='block'; msg.className='modal-result error'; msg.textContent='Nome é obrigatório.'; return; }
  const payload = {
    nome,
    tipo,
    plano: plano || null,
    valor_mensalidade: valor ? parseFloat(valor) : null,
    vencimento_dia: dia,
    dias_tolerancia: tol,
    status,
  };
  try {
    if (id) await api('PUT',  `/tenants/${id}`, payload);
    else    await api('POST', '/tenants',       payload);
    fecharModal();
    renderTenantsView();
  } catch(e) {
    msg.style.display='block'; msg.className='modal-result error'; msg.textContent=e.message;
  }
}

async function alterarStatusTenant(id, novoStatus) {
  const label = novoStatus === 'bloqueado' ? 'bloquear' : 'ativar';
  if (!confirm(`Confirma ${label} este tenant?`)) return;
  try {
    await api('PATCH', `/tenants/${id}/status`, { status: novoStatus });
    renderTenantsView();
  } catch(e) { alert('Erro: ' + e.message); }
}

async function confirmarDeletarTenant(id, nome) {
  if (!confirm(`Cancelar o tenant "${nome}"? Esta ação não pode ser desfeita.`)) return;
  try {
    await api('DELETE', `/tenants/${id}`);
    renderTenantsView();
  } catch(e) { alert('Erro: ' + e.message); }
}

// ═══════════════════════════════════════════════════════════
//  TRILHA DE AUDITORIA
// ═══════════════════════════════════════════════════════════

async function renderAuditoriaView() {
  const el = document.getElementById('auditView');
  if (!el) return;
  const hoje = new Date().toISOString().split('T')[0];
  const m1   = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
  el.innerHTML = `
    <div class="view-header">
      <h1>📋 Trilha de Auditoria</h1>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn-primary" onclick="exportarAuditTxt()">⬇ Exportar TXT</button>
        <button class="btn-primary" onclick="imprimirAuditoria()">🖨️ Gerar PDF</button>
      </div>
    </div>
    <div class="filtros-row" style="flex-wrap:wrap;gap:8px">
      <input type="date" id="aud_ini" value="${m1}" />
      <input type="date" id="aud_fim" value="${hoje}" />
      <select id="aud_mod" class="form-input" style="min-width:140px">
        <option value="">Todos os módulos</option>
        <option value="contrato">Contrato</option>
        <option value="financeiro">Financeiro</option>
        <option value="reembolso">Reembolso</option>
        <option value="compra">Compra</option>
        <option value="irmao">Irmão</option>
        <option value="usuario">Usuário</option>
        <option value="agenda">Agenda</option>
        <option value="mensalidade">Mensalidade</option>
      </select>
      <button class="btn-primary" onclick="carregarAuditoria()">Filtrar</button>
    </div>
    <div id="auditLista" style="margin-top:16px"><div class="loading">Carregando…</div></div>
  `;
  await carregarAuditoria();
}

let _auditData = [];

async function carregarAuditoria() {
  const el = document.getElementById('auditLista');
  if (!el) return;
  el.innerHTML = '<div class="loading">Carregando…</div>';
  const ini = document.getElementById('aud_ini')?.value || '';
  const fim = document.getElementById('aud_fim')?.value || '';
  const mod = document.getElementById('aud_mod')?.value || '';
  const loja = state.usuario?.loja_id || '';
  let q = `limit=500`;
  if (ini) q += `&data_inicio=${ini}`;
  if (fim) q += `&data_fim=${fim}`;
  if (mod) q += `&modulo=${mod}`;
  if (loja) q += `&loja_id=${loja}`;
  try {
    _auditData = await api('GET', `/auditoria?${q}`);
    if (!_auditData.length) { el.innerHTML = '<p class="empty-msg">Nenhum evento encontrado.</p>'; return; }
    el.innerHTML = `
      <div style="font-size:12px;color:#64748b;margin-bottom:8px">${_auditData.length} evento(s) encontrado(s)</div>
      <div style="overflow-x:auto">
      <table class="relat-table" id="auditTabela">
        <thead><tr>
          <th>Data / Hora</th><th>Usuário</th><th>Cargo</th><th>Loja</th>
          <th>Módulo</th><th>Ação</th><th>Entidade</th><th>Detalhes</th><th>Origem</th>
        </tr></thead>
        <tbody>
          ${_auditData.map(e => {
            let detalhes = '';
            try { detalhes = JSON.stringify(e.detalhes_json || {}).replace(/[{}"]/g,'').slice(0,80); } catch(_) {}
            return `<tr>
              <td style="white-space:nowrap;font-size:12px">${new Date(e.ocorreu_em).toLocaleString('pt-BR')}</td>
              <td style="font-size:12px">${e.usuario_nome || e.usuario_email || '—'}</td>
              <td style="font-size:11px;color:#64748b">${e.cargo_snapshot || '—'}</td>
              <td style="font-size:12px">${e.loja_nome || '—'}</td>
              <td><span class="badge-ctx ${e.modulo||''}">${e.modulo || '—'}</span></td>
              <td style="font-size:12px;font-weight:600">${e.acao || '—'}</td>
              <td style="font-size:11px;color:#64748b">${e.entidade_tipo||''}${e.entidade_id?' #'+e.entidade_id:''}</td>
              <td style="font-size:11px;color:#64748b;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${detalhes}">${detalhes || '—'}</td>
              <td style="font-size:11px">${e.origem || '—'}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
      </div>`;
  } catch(e) { el.innerHTML = `<p class="error-msg">${e.message}</p>`; }
}

function exportarAuditTxt() {
  if (!_auditData.length) { alert('Carregue os dados antes de exportar.'); return; }
  const linhas = ['TRILHA DE AUDITORIA — Secretaria Digital', '='.repeat(60), ''];
  for (const e of _auditData) {
    linhas.push(`Data    : ${new Date(e.ocorreu_em).toLocaleString('pt-BR')}`);
    linhas.push(`Usuário : ${e.usuario_nome || e.usuario_email || '—'} (${e.cargo_snapshot || '—'})`);
    linhas.push(`Loja    : ${e.loja_nome || '—'}`);
    linhas.push(`Módulo  : ${e.modulo || '—'}  |  Ação: ${e.acao || '—'}`);
    linhas.push(`Entidade: ${e.entidade_tipo || '—'} #${e.entidade_id || '—'}`);
    linhas.push(`Origem  : ${e.origem || '—'}`);
    try { if (e.detalhes_json) linhas.push(`Detalhes: ${JSON.stringify(e.detalhes_json)}`); } catch(_) {}
    linhas.push('-'.repeat(60));
  }
  const blob = new Blob([linhas.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `auditoria_${new Date().toISOString().split('T')[0]}.txt`;
  a.click(); URL.revokeObjectURL(url);
}

function imprimirAuditoria() {
  if (!_auditData.length) { alert('Carregue os dados antes de gerar PDF.'); return; }
  window.print();
}

// ═══════════════════════════════════════════════════════════
//  DARK / LIGHT MODE
// ═══════════════════════════════════════════════════════════

function toggleDarkMode() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('sd-theme', next);
  _syncThemeBtn();
}

function _syncThemeBtn() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  btn.textContent = isDark ? '☀️  Modo Claro' : '🌙  Modo Escuro';
}

document.addEventListener('DOMContentLoaded', () => {
  renderSidebar();
  renderHome();

  // Aplicar tema salvo e sincronizar botão
  const savedTheme = localStorage.getItem('sd-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  _syncThemeBtn();

  // Estado inicial: mostrar símbolo, esconder tudo mais
  mostrarView('preLoginView');

  document.getElementById('loginBtn').addEventListener('click', login);
  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.getElementById('abrirCadastroBtn').addEventListener('click', abrirCadastro);

  document.getElementById('password').addEventListener('keydown', e => {
    if (e.key === 'Enter') login();
  });

  // Auto-restaurar sessão salva
  const savedToken = localStorage.getItem('sd_token');
  if (savedToken) {
    state.token = savedToken;
    api('GET', '/auth/me').then(me => {
      state.usuario = me;
      localStorage.setItem('sd_usuario', JSON.stringify(me));
      renderAutenticado(me);
    }).catch(() => {
      localStorage.removeItem('sd_token');
      localStorage.removeItem('sd_usuario');
      state.token = null;
    });
  }
});
