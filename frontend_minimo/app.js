const state = {
  apiBaseUrl: 'http://127.0.0.1:8001',
  email: '',
  password: '',
  loggedIn: false,
  contractStatus: null,
  reimbursementStatus: null,
};

function byId(id) {
  return document.getElementById(id);
}

function getAuthHeader() {
  const token = btoa(`${state.email}:${state.password}`);
  return { Authorization: `Basic ${token}` };
}

async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.auth === false ? {} : getAuthHeader()),
    ...(options.headers || {}),
  };

  const response = await fetch(`${state.apiBaseUrl}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = { raw: await response.text() };
  }

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}

function render(outputId, payload) {
  byId(outputId).textContent = typeof payload === 'string'
    ? payload
    : JSON.stringify(payload, null, 2);
}

function setCardState(cardId, stateName) {
  const card = byId(cardId);
  if (!card) return;
  card.classList.remove('success', 'error');
  if (stateName) card.classList.add(stateName);
}

function setStatus(text, meta) {
  byId('authStatusChip').textContent = text;
  byId('authStatusMeta').textContent = meta;
}

function setLastAction(text) {
  byId('lastActionBox').textContent = `Última ação: ${text}`;
}

function buildStatusPill(status) {
  const normalized = String(status || '').toLowerCase();
  let css = 'pending';
  if (['aceito', 'ativo'].includes(normalized)) css = normalized === 'ativo' ? 'active' : 'approved';
  if (['aprovado'].includes(normalized)) css = 'approved';
  if (['recusado', 'rejeitado'].includes(normalized)) css = 'rejected';
  if (['pago'].includes(normalized)) css = 'paid';
  return `<span class="status-pill ${css}">${status || 'sem status'}</span>`;
}

function updateGuideSteps() {
  byId('guideStepLogin').classList.toggle('active', !state.loggedIn);
  byId('guideStepContract').classList.toggle('active', state.loggedIn && !state.reimbursementStatus);
  byId('guideStepReimbursement').classList.toggle('active', state.loggedIn && !!state.reimbursementStatus);
}

function updateNextAction() {
  let text = 'Faça login para começar.';

  if (state.loggedIn && !state.contractStatus) {
    text = 'Agora crie ou consulte um contrato.';
  } else if (state.contractStatus === 'rascunho') {
    text = 'Agora envie o contrato para análise.';
  } else if (state.contractStatus === 'enviado') {
    text = 'Agora escolha aprovar ou rejeitar o contrato.';
  } else if (state.contractStatus === 'aceito') {
    text = 'Agora ative o contrato.';
  } else if (state.contractStatus === 'ativo' && !state.reimbursementStatus) {
    text = 'Se quiser, agora você pode trabalhar no reembolso.';
  } else if (state.reimbursementStatus === 'pendente') {
    text = 'Agora escolha aprovar ou rejeitar o reembolso.';
  } else if (state.reimbursementStatus === 'aprovado') {
    text = 'Agora marque o reembolso como pago.';
  } else if (state.reimbursementStatus === 'pago') {
    text = 'Fluxo concluído com sucesso.';
  }

  byId('nextActionText').textContent = text;
  updateGuideSteps();
}

function updateContractSummary(value, status = 'Sem status') {
  state.contractStatus = status;
  byId('currentContractSummary').textContent = value || '-';
  byId('currentContractStatus').innerHTML = buildStatusPill(status);
  byId('contractBadge').textContent = status || 'Aguardando';
  updateNextAction();
}

function updateReimbursementSummary(value, status = 'Sem status') {
  state.reimbursementStatus = status;
  byId('currentReimbursementSummary').textContent = value || '-';
  byId('currentReimbursementStatus').innerHTML = buildStatusPill(status);
  byId('reimbursementBadge').textContent = status || 'Aguardando';
  updateNextAction();
}

function updateContractVisual(data) {
  byId('contractSummaryVisual').innerHTML = `
    <div><strong>Número:</strong> ${data.id ?? '-'}</div>
    <div><strong>Loja:</strong> ${data.loja_id ?? '-'}</div>
    <div><strong>Situação:</strong> ${buildStatusPill(data.status)}</div>
    <div><strong>Regra:</strong> ${data.regra_recorrencia ?? '-'}</div>
  `;
}

function updateReimbursementVisual(data) {
  byId('reimbursementSummaryVisual').innerHTML = `
    <div><strong>Número:</strong> ${data.id ?? '-'}</div>
    <div><strong>Loja:</strong> ${data.loja_id ?? '-'}</div>
    <div><strong>Situação:</strong> ${buildStatusPill(data.status)}</div>
    <div><strong>Valor:</strong> ${data.valor_solicitado ?? data.valor_aprovado ?? '-'}</div>
  `;
}

function syncState() {
  state.apiBaseUrl = byId('apiBaseUrl').value.trim();
  state.email = byId('email').value.trim();
  state.password = byId('password').value;
}

async function handleLogin() {
  syncState();
  const data = await apiRequest('/auth/login', { method: 'POST' });
  state.loggedIn = true;
  setStatus(`Autenticado: ${data.cargo}`, `Usuário ${data.user_id} | Loja ${data.loja_id ?? '-'}`);
  setLastAction('login realizado');
  setCardState('authResponseCard', 'success');
  updateNextAction();
  render('authOutput', 'Entrada realizada com sucesso.');
}

async function handleMe() {
  syncState();
  const data = await apiRequest('/auth/me');
  state.loggedIn = true;
  setStatus(`Autenticado: ${data.cargo}`, `Usuário ${data.user_id} | Loja ${data.loja_id ?? '-'}`);
  setLastAction('dados do usuário consultados');
  setCardState('authResponseCard', 'success');
  updateNextAction();
  render('authOutput', data);
}

async function handleCreateContract() {
  syncState();
  const body = {
    loja_id: Number(byId('lojaId').value),
    templo_id: Number(byId('temploId').value),
    regra_recorrencia: byId('regraRecorrencia').value.trim(),
    hora_inicio_sessao: byId('horaInicioSessao').value.trim(),
    hora_fim_sessao: byId('horaFimSessao').value.trim(),
    vigencia_inicio: byId('vigenciaInicio').value.trim(),
    vigencia_fim: byId('vigenciaFim').value.trim() || null,
  };
  const data = await apiRequest('/contracts', { method: 'POST', body });
  if (data.contract_id) {
    byId('contractId').value = data.contract_id;
    updateContractSummary(`#${data.contract_id}`, 'rascunho');
  }
  updateContractVisual({ id: data.contract_id, loja_id: body.loja_id, status: 'rascunho', regra_recorrencia: body.regra_recorrencia });
  setLastAction('contrato criado');
  setCardState('contractCreateCard', 'success');
  render('createContractOutput', 'Contrato criado com sucesso. Agora envie para análise.');
}

function getContractId() {
  return Number(byId('contractId').value);
}

async function handleGetContract() {
  syncState();
  const data = await apiRequest(`/contracts/${getContractId()}`);
  updateContractSummary(`#${data.id}`, data.status);
  updateContractVisual(data);
  setLastAction('contrato consultado');
  setCardState('contractResponseCard', 'success');
  render('contractOutput', data);
}

async function handleSubmitContract() {
  syncState();
  const data = await apiRequest(`/contracts/${getContractId()}/submit`, { method: 'POST' });
  updateContractSummary(`#${getContractId()}`, 'enviado');
  updateContractVisual({ id: getContractId(), loja_id: byId('lojaId').value, status: 'enviado', regra_recorrencia: byId('regraRecorrencia').value.trim() });
  setLastAction('contrato enviado para análise');
  setCardState('contractResponseCard', 'success');
  render('contractOutput', 'Contrato enviado para análise com sucesso.');
}

async function handleDecision(decisao) {
  syncState();
  const data = await apiRequest(`/contracts/${getContractId()}/decision`, {
    method: 'POST',
    body: {
      decisao,
      observacao: byId('contractObservation').value.trim() || null,
    },
  });
  const status = decisao === 'aprovado' ? 'aceito' : 'rejeitado';
  updateContractSummary(`#${getContractId()}`, status);
  updateContractVisual({ id: getContractId(), loja_id: byId('lojaId').value, status, regra_recorrencia: byId('regraRecorrencia').value.trim() });
  setLastAction(`contrato ${decisao}`);
  setCardState('contractResponseCard', decisao === 'aprovado' ? 'success' : 'error');
  render('contractOutput', decisao === 'aprovado' ? 'Contrato aprovado com sucesso.' : 'Contrato rejeitado.');
}

async function handleActivateContract() {
  syncState();
  const data = await apiRequest('/contracts/activate', {
    method: 'POST',
    body: { contrato_id: getContractId() },
  });
  updateContractSummary(`#${getContractId()}`, 'ativo');
  updateContractVisual({ id: getContractId(), loja_id: byId('lojaId').value, status: 'ativo', regra_recorrencia: byId('regraRecorrencia').value.trim() });
  setLastAction('contrato ativado');
  setCardState('contractResponseCard', 'success');
  render('contractOutput', 'Contrato ativado com sucesso.');
}

async function handleValidateConflict() {
  syncState();
  const body = {
    recurso_id: Number(byId('temploId').value),
    regra: byId('regraRecorrencia').value.trim(),
    hora_inicio: byId('horaInicioSessao').value.trim(),
    hora_fim: byId('horaFimSessao').value.trim(),
    vigencia_inicio: byId('vigenciaInicio').value.trim(),
    vigencia_fim: byId('vigenciaFim').value.trim() || null,
  };
  const data = await apiRequest('/schedule/validate-conflict', { method: 'POST', body });
  setLastAction('conflito verificado');
  setCardState('contractResponseCard', 'success');
  render('contractOutput', 'Não foi encontrado conflito para este contrato.');
}

function getReimbursementId() {
  return Number(byId('reimbursementId').value);
}

async function handleCreateReimbursement() {
  syncState();
  const body = {
    caso_id: Number(byId('caseId').value),
    categoria: byId('reimbursementCategory').value.trim(),
    valor_solicitado: byId('reimbursementAmount').value.trim(),
    irmao_id: byId('reimbursementIrmaoId').value ? Number(byId('reimbursementIrmaoId').value) : null,
  };
  const data = await apiRequest('/reimbursements', { method: 'POST', body });
  if (data.reimbursement_id) {
    byId('reimbursementId').value = data.reimbursement_id;
    updateReimbursementSummary(`#${data.reimbursement_id}`, 'pendente');
  }
  updateReimbursementVisual({ id: data.reimbursement_id, loja_id: byId('lojaId').value, status: 'pendente', valor_solicitado: body.valor_solicitado });
  setLastAction('reembolso criado');
  setCardState('reimbursementResponseCard', 'success');
  render('reimbursementOutput', 'Reembolso criado com sucesso. Agora escolha aprovar ou rejeitar.');
}

async function handleGetReimbursement() {
  syncState();
  const data = await apiRequest(`/reimbursements/${getReimbursementId()}`);
  updateReimbursementSummary(`#${data.id}`, data.status);
  updateReimbursementVisual(data);
  setLastAction('reembolso consultado');
  setCardState('reimbursementResponseCard', 'success');
  render('reimbursementOutput', data);
}

async function handleReimbursementDecision(decisao) {
  syncState();
  const data = await apiRequest('/approvals', {
    method: 'POST',
    body: {
      entidade_tipo: 'reembolso',
      entidade_id: getReimbursementId(),
      decisao,
      observacao: byId('reimbursementObservation').value.trim() || null,
      valor: byId('reimbursementApprovedAmount').value.trim() || null,
    },
  });
  const status = decisao === 'aprovado' ? 'aprovado' : 'rejeitado';
  updateReimbursementSummary(`#${getReimbursementId()}`, status);
  updateReimbursementVisual({ id: getReimbursementId(), loja_id: byId('lojaId').value, status, valor_solicitado: byId('reimbursementAmount').value.trim() });
  setLastAction(`reembolso ${decisao}`);
  setCardState('reimbursementResponseCard', decisao === 'aprovado' ? 'success' : 'error');
  render('reimbursementOutput', decisao === 'aprovado' ? 'Reembolso aprovado com sucesso.' : 'Reembolso rejeitado.');
}

async function handlePayReimbursement() {
  syncState();
  const data = await apiRequest(`/reimbursements/${getReimbursementId()}/pay`, {
    method: 'POST',
    body: {
      valor_aprovado: byId('reimbursementApprovedAmount').value.trim() || null,
      observacao_financeiro: byId('reimbursementObservation').value.trim() || null,
      data_pagamento: null,
    },
  });
  updateReimbursementSummary(`#${getReimbursementId()}`, 'pago');
  updateReimbursementVisual({ id: getReimbursementId(), loja_id: byId('lojaId').value, status: 'pago', valor_aprovado: byId('reimbursementApprovedAmount').value.trim() });
  setLastAction('reembolso pago');
  setCardState('reimbursementResponseCard', 'success');
  render('reimbursementOutput', 'Pagamento do reembolso registrado com sucesso.');
}

function bind(id, handler) {
  byId(id).addEventListener('click', async () => {
    try {
      await handler();
    } catch (error) {
      const target = ['loginBtn', 'meBtn'].includes(id)
        ? 'authOutput'
        : ['createContractBtn'].includes(id)
          ? 'createContractOutput'
          : ['createReimbursementBtn', 'getReimbursementBtn', 'approveReimbursementBtn', 'rejectReimbursementBtn', 'payReimbursementBtn'].includes(id)
            ? 'reimbursementOutput'
            : 'contractOutput';
      const cardMap = {
        authOutput: 'authResponseCard',
        createContractOutput: 'contractCreateCard',
        contractOutput: 'contractResponseCard',
        reimbursementOutput: 'reimbursementResponseCard',
      };
      setCardState(cardMap[target], 'error');
      render(target, 'Algo deu errado. Tente novamente.\n\n' + error.message);
      setLastAction('ocorreu um erro');
    }
  });
}

bind('loginBtn', handleLogin);
bind('meBtn', handleMe);
bind('createContractBtn', handleCreateContract);
bind('getContractBtn', handleGetContract);
bind('submitContractBtn', handleSubmitContract);
bind('approveContractBtn', () => handleDecision('aprovado'));
bind('rejectContractBtn', () => handleDecision('rejeitado'));
bind('activateContractBtn', handleActivateContract);
bind('validateConflictBtn', handleValidateConflict);
bind('createReimbursementBtn', handleCreateReimbursement);
bind('getReimbursementBtn', handleGetReimbursement);
bind('approveReimbursementBtn', () => handleReimbursementDecision('aprovado'));
bind('rejectReimbursementBtn', () => handleReimbursementDecision('rejeitado'));
bind('payReimbursementBtn', handlePayReimbursement);
updateNextAction();
