const API = (window.LABCD_API_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");
const token = localStorage.getItem("labcd-token");
if (!token) window.location.href = "index.html";

const isLocalDemo = token === "demo-local";

const UPPER_TEETH = ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"];
const LOWER_TEETH = ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"];

const STATUS_META = {
  em_avaliacao: { label: "Em avaliação", clinicaLabel: "Por aceitar", color: "#B29A0E" },
  por_iniciar: { label: "Por iniciar", clinicaLabel: "Em produção", color: "#5C6898" },
  em_processamento: { label: "Em produção", clinicaLabel: "Em produção", color: "#B87A00" },
  em_espera: { label: "Em espera", clinicaLabel: "Em produção", color: "#C86D1F" },
  em_prova: { label: "Em prova", clinicaLabel: "Em produção", color: "#2273A8" },
  concluido: { label: "Concluído", clinicaLabel: "Concluído", color: "#248A5B" },
  entregue: { label: "Entregue", clinicaLabel: "Concluído", color: "#197056" },
  recusado: { label: "Recusado", clinicaLabel: "Recusado", color: "#C93D49" },
  cancelado: { label: "Cancelado", clinicaLabel: "Cancelado", color: "#C93D49" },
  aceite: { label: "Aceite", clinicaLabel: "Aceite", color: "#248A5B" },
  pendente: { label: "Pendente", clinicaLabel: "Pendente", color: "#B87A00" },
  recusada: { label: "Recusada", clinicaLabel: "Recusada", color: "#C93D49" },
};

const ROLE_LABELS = {
  clinica: "Clínica parceira",
  admin: "Direção do laboratório",
  tecnico: "Técnico de prótese",
};

const SOLICITACAO_LABELS = {
  conserto: "Conserto",
  reabertura: "Reabertura",
  cancelamento: "Cancelamento",
};

function createDemoSeed() {
  const now = Date.now();
  const day = (d) => new Date(now + d * 86400000).toISOString();
  const hour = (h) => new Date(now + h * 3600000).toISOString();

  return {
    clinicas: [
      { id: "cli-1", nome: "Clínica Sorriso do Atlântico", email: "clinica@demo.pt", morada: "Rua do Mar, 24, Porto", nif: "501234567", faturacao: "Mensal", ativa: true, validada: true },
      { id: "cli-2", nome: "Clínica Nova Luz", email: "novaluz@demo.pt", morada: "Av. Central, 81, Braga", nif: "509876543", faturacao: "Por trabalho", ativa: false, validada: false },
    ],
    medicos: [
      { id: "med-1", clinicaId: "cli-1", nome: "Dra. Helena Duarte", numeroOrdem: "OMD 10482", ativo: true, especialidade: "Reabilitação oral e estética", email: "helena.duarte@sorrisoatlantico.pt" },
      { id: "med-2", clinicaId: "cli-1", nome: "Dr. Miguel Reis", numeroOrdem: "OMD 11730", ativo: true, especialidade: "Implantologia e cirurgia", email: "miguel.reis@sorrisoatlantico.pt" },
      { id: "med-3", clinicaId: "cli-1", nome: "Dra. Sofia Antunes", numeroOrdem: "OMD 6780", ativo: true, especialidade: "Prótese fixa e oclusão", email: "sofia.antunes@sorrisoatlantico.pt" },
    ],
    colaboradores: [
      { id: "col-1", nome: "Catarina Domingos", email: "admin@demo.pt", funcao: "admin", permissoes: ["trabalhos", "solicitacoes", "configuracao", "clientes"] },
      { id: "col-2", nome: "Rui Martins", email: "tecnico@demo.pt", funcao: "tecnico", permissoes: ["trabalhos", "solicitacoes"] },
    ],
    etapas: [
      { id: "et-1", nome: "Gesso", ordem: 1, ativa: true },
      { id: "et-2", nome: "Impressão 3D", ordem: 2, ativa: true },
      { id: "et-3", nome: "Articulação", ordem: 3, ativa: true },
      { id: "et-4", nome: "CAD CAM", ordem: 4, ativa: true },
      { id: "et-11", nome: "Embalamento e envio p/ prova", ordem: 11, ativa: true },
      { id: "et-19", nome: "Acrilização", ordem: 19, ativa: true },
      { id: "et-21", nome: "Glaze", ordem: 21, ativa: true },
      { id: "et-25", nome: "Faturação", ordem: 25, ativa: true },
      { id: "et-26", nome: "Embalamento e envio final", ordem: 26, ativa: true },
    ],
    tipos: [
      { id: "tip-coroa-zr", nome: "Coroa", descricao: "Coroa cerâmica com fresagem CAD/CAM e acabamento manual.", etapaIds: ["et-1", "et-2", "et-3", "et-4", "et-11", "et-21", "et-26"] },
      { id: "tip-coroa-dissilicato", nome: "Faceta", descricao: "Faceta estética em dissilicato de lítio.", etapaIds: ["et-1", "et-2", "et-4", "et-21", "et-26"] },
      { id: "tip-protese-esqueletico", nome: "Prótese esquelético", descricao: "Prótese removível esquelética com prova clínica.", etapaIds: ["et-1", "et-2", "et-3", "et-11", "et-19", "et-26"] },
      { id: "tip-protese-hibrida", nome: "Prótese híbrida", descricao: "Prótese fixa híbrida sobre implantes.", etapaIds: ["et-1", "et-3", "et-4", "et-11", "et-19", "et-26"] },
      { id: "tip-goteira-bruxismo", nome: "Goteira bruxismo", descricao: "Placa oclusal rígida acrilizada.", etapaIds: ["et-1", "et-2", "et-3", "et-19", "et-26"] },
    ],
    pedidosTrabalho: [
      { id: "ped-trab-1", referencia: "PED-2025-0142", clinicaId: "cli-1", medicoId: "med-1", paciente: "M. A.", estado: "aceite", prazo: day(6), proximaConsulta: day(8), criadoEm: day(-6) },
      { id: "ped-trab-2", referencia: "PED-2025-0143", clinicaId: "cli-1", medicoId: "med-2", paciente: "J. P.", estado: "em_avaliacao", prazo: day(9), proximaConsulta: day(11), criadoEm: day(-1) },
      { id: "ped-trab-3", referencia: "PED-2025-0139", clinicaId: "cli-1", medicoId: "med-1", paciente: "A. C.", estado: "aceite", prazo: day(3), proximaConsulta: null, criadoEm: day(-10) },
      { id: "ped-trab-4", referencia: "PED-2025-0128", clinicaId: "cli-1", medicoId: "med-2", paciente: "R. S.", estado: "aceite", prazo: day(-2), proximaConsulta: null, criadoEm: day(-18) },
    ],
    trabalhos: [
      { id: "trab-1a", pedidoTrabalhoId: "ped-trab-1", referencia: "PED-2025-0142-A", tipoId: "tip-coroa-zr", estado: "em_processamento", etapaAtualId: "et-4", dentes: ["11"], material: "Zircónia translúcida", atribuidoA: "col-2", criadoEm: day(-5), atualizadoEm: hour(-2), etapas: [{ etapaId: "et-1", concluidoEm: day(-4) }, { etapaId: "et-2", concluidoEm: day(-3) }, { etapaId: "et-3", concluidoEm: day(-2) }] },
      { id: "trab-1b", pedidoTrabalhoId: "ped-trab-1", referencia: "PED-2025-0142-B", tipoId: "tip-protese-esqueletico", estado: "em_prova", etapaAtualId: "et-11", dentes: ["35", "36", "37"], material: "Crómio-Cobalto + Acrílico", atribuidoA: "col-2", criadoEm: day(-5), atualizadoEm: hour(-6), etapas: [{ etapaId: "et-1", concluidoEm: day(-4) }, { etapaId: "et-2", concluidoEm: day(-3) }, { etapaId: "et-3", concluidoEm: day(-2) }] },
      { id: "trab-2a", pedidoTrabalhoId: "ped-trab-2", referencia: "PED-2025-0143-A", tipoId: "tip-coroa-dissilicato", estado: "em_avaliacao", etapaAtualId: "et-1", dentes: ["21"], material: "Dissilicato A2", atribuidoA: null, criadoEm: day(-1), atualizadoEm: day(-1), etapas: [] },
      { id: "trab-3a", pedidoTrabalhoId: "ped-trab-3", referencia: "PED-2025-0139-A", tipoId: "tip-protese-hibrida", estado: "em_espera", etapaAtualId: "et-19", dentes: [], material: "Acrílico de alta resistência", atribuidoA: "col-2", motivoEspera: "A aguardar confirmação da cor pela clínica.", criadoEm: day(-10), atualizadoEm: day(-3), etapas: [{ etapaId: "et-1", concluidoEm: day(-9) }, { etapaId: "et-3", concluidoEm: day(-8) }] },
      { id: "trab-3b", pedidoTrabalhoId: "ped-trab-3", referencia: "PED-2025-0139-B", tipoId: "tip-coroa-zr", estado: "concluido", etapaAtualId: "et-25", dentes: ["12"], material: "Zircónia", atribuidoA: "col-1", criadoEm: day(-10), atualizadoEm: hour(-18), etapas: [{ etapaId: "et-1", concluidoEm: day(-9) }, { etapaId: "et-21", concluidoEm: day(-2) }] },
      { id: "trab-4a", pedidoTrabalhoId: "ped-trab-4", referencia: "PED-2025-0128-A", tipoId: "tip-goteira-bruxismo", estado: "entregue", etapaAtualId: "et-26", dentes: ["14", "13", "12", "11", "21", "22", "23", "24"], material: "Resina acrílica rígida", atribuidoA: "col-2", criadoEm: day(-18), atualizadoEm: hour(-40), etapas: [{ etapaId: "et-1", concluidoEm: day(-16) }, { etapaId: "et-26", concluidoEm: hour(-40) }] },
    ],
    materiais: [
      { id: "mat-1", nome: "Zircónia translúcida", unidade: "discos", stock: 8, stockMinimo: 3, lote: "ZR-2408" },
      { id: "mat-2", nome: "Cerâmica de estratificação", unidade: "g", stock: 240, stockMinimo: 100, lote: "CE-1182" },
    ],
    solicitacoes: [
      { id: "sol-1", trabalhoId: "trab-4a", tipo: "conserto", estado: "pendente", motivo: "Ajuste oclusal após controlo clínico.", criadoEm: day(-5) },
    ],
    notificacoes: [
      { id: "not-1", destinatarioId: "cli-1", titulo: "Trabalho em prova", mensagem: "PED-2025-0142-B seguiu para prova clínica.", lida: false, criadoEm: hour(-8), trabalhoId: "trab-1b" },
    ],
    notas: [
      { id: "nota-1", trabalhoId: "trab-1a", autorId: "col-2", conteudo: "Modelação validada e fresagem em curso.", visivelClinica: true, criadoEm: hour(-10) },
    ],
    mensagens: [
      { id: "msg-1", autorId: "col-1", autorNome: "Catarina Domingos", texto: "O caso PED-2025-0142 encontra-se em produção. Prova prevista para a próxima semana.", criadoEm: hour(-20), trabalhoId: "trab-1b" },
    ],
    ficheiros: [
      { id: "stl-1", nome: "scan_superior_MA.stl", trabalhoId: "trab-1a", tamanhoKb: 1840, criadoEm: day(-6) },
    ],
  };
}

const state = {
  page: "resumo",
  user: JSON.parse(localStorage.getItem("labcd-user") || "{}"),
  data: createDemoSeed(),
  search: "",
  statusFilter: "",
  sort: "prazo",
  selectedTeethOrder: [],
  activeWorkId: null,
};

const esc = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "short", year: "numeric" }).format(d);
};

const plural = (n, singular, pluralWord) => `${n} ${n === 1 ? singular : pluralWord}`;

const isClinicaUser = () => state.user?.papel === "clinica";

const statusMeta = (estado) => {
  const meta = STATUS_META[estado] || { label: estado || "—", clinicaLabel: estado || "—", color: "#505672" };
  return {
    text: isClinicaUser() ? meta.clinicaLabel : meta.label,
    color: meta.color,
  };
};

const statusPill = (estado) => {
  const m = statusMeta(estado);
  return `<span class="status-pill" style="color:${m.color};background:${m.color}18;border-color:${m.color}44"><span class="dot" style="background:${m.color}"></span>${esc(m.text)}</span>`;
};

const doctorLabel = (doctor) => {
  if (!doctor) return "Médico não atribuído";
  const name = String(doctor.nome || "").trim();
  const cleanOmd = String(doctor.numeroOrdem || "").replace(/^OMD\s*/i, "").trim();
  const hasPrefix = /^(Dr\.|Dra\.|Dr\(a\)\.)\s/i.test(name);
  const full = hasPrefix ? name : `Dr(a). ${name}`;
  return cleanOmd ? `${full} (OMD ${cleanOmd})` : full;
};

const byId = (list, id) => (list || []).find((x) => x.id === id) || null;

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toast.hidden = true;
  }, 4000);
}

async function api(path, options = {}) {
  if (isLocalDemo) return null;
  const headers = { Accept: "application/json", Authorization: `Token ${token}`, ...(options.headers || {}) };
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const response = await fetch(API + path, { ...options, headers });
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.detail || data?.error || "Erro na comunicação com o servidor.");
  }
  return data;
}

function visibleWorks() {
  const all = state.data.trabalhos || [];
  if (!isClinicaUser()) return all;
  return all.filter((w) => {
    const p = byId(state.data.pedidosTrabalho, w.pedidoTrabalhoId);
    return p?.clinicaId === state.user.utilizadorId;
  });
}

function visibleOrders() {
  const all = state.data.pedidosTrabalho || [];
  if (!isClinicaUser()) return all;
  return all.filter((p) => p.clinicaId === state.user.utilizadorId);
}

function visibleNotifications() {
  const all = state.data.notificacoes || [];
  if (!isLocalDemo) return all;
  if (!state.user?.utilizadorId) return all;
  return all.filter((n) => n.destinatarioId === state.user.utilizadorId);
}

async function downloadStlFile(fileId, filename) {
  if (isLocalDemo) {
    showToast("Ficheiro demonstrativo em modo local.");
    return;
  }
  const response = await fetch(`${API}/ficheiros/${encodeURIComponent(fileId)}/download/`, {
    headers: { Authorization: `Token ${token}` },
  });
  if (!response.ok) {
    throw new Error("Não foi possível descarregar o ficheiro STL.");
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "modelo.stl";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function bindStlDownloadButtons(root = document) {
  if (!root) return;
  root.querySelectorAll("[data-download-stl]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const fileId = btn.dataset.downloadStl;
      const filename = btn.dataset.filename || "modelo.stl";
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = "A descarregar...";
      try {
        await downloadStlFile(fileId, filename);
      } catch (err) {
        showToast(err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = original;
      }
    });
  });
}

function visibleSolicitacoes() {
  const all = state.data.solicitacoes || [];
  if (!isClinicaUser()) return all;
  const ids = new Set(visibleWorks().map((w) => w.id));
  return all.filter((s) => ids.has(s.trabalhoId));
}

function getPages() {
  const base = [
    { id: "resumo", label: "Resumo", subtitle: "Visão geral dos casos e prazos clínicos." },
    { id: "trabalhos", label: "Trabalhos", subtitle: isClinicaUser() ? "Estado de cada caso clínico enviado." : "Gestão de trabalhos, filtros e detalhe técnico." },
    { id: "pedidos", label: "Pedidos", subtitle: "Prescrições submetidas e validação de entrada." },
    { id: "solicitacoes", label: "Solicitações", subtitle: "Pedidos de conserto, reabertura e cancelamento." },
    { id: "mensagens", label: "Mensagens", subtitle: "Canal direto entre a clínica e o laboratório." },
    { id: "notificacoes", label: "Notificações", subtitle: "Alertas de prova, aceitação e entrega." },
    { id: "ficheiros", label: "Ficheiros STL", subtitle: "Modelos tridimensionais e digitalizações associadas." },
  ];
  if (!isClinicaUser()) {
    base.push({ id: "clientes", label: "Clínicas", subtitle: "Clínicas parceiras e respetivo corpo clínico." });
    base.push({ id: "catalogo", label: "Catálogo e Stock", subtitle: "Tipos de trabalho, etapas de produção e materiais." });
  }
  return base;
}

function renderOdontogram(selected, interactive = false) {
  const set = new Set(selected || []);
  const row = (teeth) =>
    `<div class="odon-row">${teeth
      .map((d, idx) => {
        const sep = idx === 8 ? '<span class="odon-sep" aria-hidden="true"></span>' : "";
        const cls = `tooth-btn ${set.has(d) ? "is-selected" : ""}`;
        return `${sep}<button type="button" class="${cls}" data-tooth="${d}" ${interactive ? "" : "disabled"} aria-pressed="${set.has(d)}">${d}</button>`;
      })
      .join("")}</div>`;
  return `<div class="odon-wrap"><span class="odon-label">Arcada superior</span>${row(UPPER_TEETH)}<span class="odon-label">Arcada inferior</span>${row(LOWER_TEETH)}</div>`;
}

function renderPipelineSummary(works) {
  if (!works.length) return "";
  const counts = new Map();
  for (const w of works) {
    const label = statusMeta(w.estado).text;
    const color = statusMeta(w.estado).color;
    const cur = counts.get(label) || { label, color, count: 0 };
    cur.count += 1;
    counts.set(label, cur);
  }
  const items = Array.from(counts.values());
  const total = works.length;
  return `
    <div class="panel">
      <div class="panel__head"><h2>Distribuição atual</h2><span class="subtext">${plural(total, "trabalho registado", "trabalhos registados")}</span></div>
      <div class="pipeline-bar" role="img" aria-label="Distribuição proporcional de trabalhos por estado">
        ${items.map((it) => `<div class="pipeline-seg" style="width:${(it.count / total) * 100}%;background:${it.color}" title="${esc(it.label)}: ${it.count}"></div>`).join("")}
      </div>
      <div class="pipeline-legend">
        ${items.map((it) => `<span class="legend-item"><span class="dot" style="background:${it.color}"></span>${esc(it.label)}: <strong>${it.count}</strong></span>`).join("")}
      </div>
    </div>
  `;
}

function renderSummaryPage() {
  const works = visibleWorks();
  const orders = visibleOrders();
  const unread = visibleNotifications().filter((n) => !n.lida).length;
  const clinica = isClinicaUser();

  const kpis = clinica
    ? [
        { label: "Por aceitar", value: works.filter((w) => w.estado === "em_avaliacao").length, note: "Aguardar validação", page: "trabalhos" },
        { label: "Em produção", value: works.filter((w) => !["em_avaliacao", "concluido", "entregue", "recusado", "cancelado"].includes(w.estado)).length, note: "Na bancada ou prova", page: "trabalhos" },
        { label: "Concluídos", value: works.filter((w) => ["concluido", "entregue"].includes(w.estado)).length, note: "Prontos ou entregues", page: "trabalhos" },
        { label: "Notificações por ler", value: unread, note: "Atualizações recentes", page: "notificacoes" },
      ]
    : [
        { label: "Em produção", value: works.filter((w) => w.estado === "em_processamento").length, note: "Em execução ativa", page: "trabalhos" },
        { label: "Pedidos por aceitar", value: orders.filter((p) => p.estado === "em_avaliacao").length, note: "Aguardar entrada", page: "pedidos" },
        { label: "Em prova ou espera", value: works.filter((w) => ["em_prova", "em_espera"].includes(w.estado)).length, note: "Acompanhar clínica", page: "trabalhos" },
        { label: "Notificações por ler", value: unread, note: "Alertas do sistema", page: "notificacoes" },
      ];

  const recentRows = works.slice(0, 6);

  return `
    <div class="kpi-grid">
      ${kpis
        .map(
          (k) => `<button type="button" class="kpi-card" data-jump="${k.page}">
            <small>${esc(k.label)}</small>
            <strong>${k.value}</strong>
            <span>${esc(k.note)}</span>
          </button>`
        )
        .join("")}
    </div>
    ${renderPipelineSummary(works)}
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Referência</th>
            <th>Tipo e paciente</th>
            ${clinica ? "" : "<th>Etapa atual</th>"}
            <th>Estado</th>
            <th>Consulta / Prazo</th>
          </tr>
        </thead>
        <tbody>
          ${
            recentRows.length
              ? recentRows
                  .map((w) => {
                    const p = byId(state.data.pedidosTrabalho, w.pedidoTrabalhoId);
                    const tipo = byId(state.data.tipos, w.tipoId);
                    const etapa = byId(state.data.etapas, w.etapaAtualId);
                    return `<tr class="is-clickable" data-open-work="${esc(w.id)}">
                      <td class="mono">${esc(w.referencia)}</td>
                      <td><strong>${esc(tipo?.nome || "Trabalho")}</strong><span class="subtext">Paciente ${esc(p?.paciente || "—")}</span></td>
                      ${clinica ? "" : `<td>${esc(etapa?.nome || "—")}</td>`}
                      <td>${statusPill(w.estado)}</td>
                      <td class="mono">${fmtDate(p?.proximaConsulta || p?.prazo)}</td>
                    </tr>`;
                  })
                  .join("")
              : `<tr><td colspan="${clinica ? 4 : 5}" class="empty-state">Sem trabalhos registados.</td></tr>`
          }
        </tbody>
      </table>
    </div>
  `;
}

function filterWorksList() {
  const clinica = isClinicaUser();
  const q = state.search.trim().toLowerCase();

  let list = visibleWorks().filter((w) => {
    const p = byId(state.data.pedidosTrabalho, w.pedidoTrabalhoId);
    const tipo = byId(state.data.tipos, w.tipoId);
    const hay = `${w.referencia} ${p?.referencia || ""} ${p?.paciente || ""} ${w.material || ""} ${tipo?.nome || ""}`.toLowerCase();
    if (q && !hay.includes(q)) return false;
    if (state.statusFilter) {
      if (clinica) {
        if (state.statusFilter === "por_aceitar" && w.estado !== "em_avaliacao") return false;
        if (state.statusFilter === "em_producao" && ["em_avaliacao", "concluido", "entregue", "recusado", "cancelado"].includes(w.estado)) return false;
        if (state.statusFilter === "concluido" && !["concluido", "entregue"].includes(w.estado)) return false;
      } else if (w.estado !== state.statusFilter) {
        return false;
      }
    }
    return true;
  });

  return list.sort((a, b) => {
    if (state.sort === "recente") return new Date(b.criadoEm) - new Date(a.criadoEm);
    const pa = byId(state.data.pedidosTrabalho, a.pedidoTrabalhoId);
    const pb = byId(state.data.pedidosTrabalho, b.pedidoTrabalhoId);
    const da = new Date(pa?.proximaConsulta || pa?.prazo || 0).getTime();
    const db = new Date(pb?.proximaConsulta || pb?.prazo || 0).getTime();
    return da - db;
  });
}

function renderWorksTable() {
  const clinica = isClinicaUser();
  const list = filterWorksList();
  return `
    <table>
      <thead>
        <tr>
          <th>Referência</th>
          <th>Prescrição</th>
          ${clinica ? "" : "<th>Etapa interna</th>"}
          <th>Dentes</th>
          <th>Estado</th>
          <th>Próxima consulta</th>
        </tr>
      </thead>
      <tbody>
        ${
          list.length
            ? list
                .map((w) => {
                  const p = byId(state.data.pedidosTrabalho, w.pedidoTrabalhoId);
                  const tipo = byId(state.data.tipos, w.tipoId);
                  const c = p ? byId(state.data.clinicas, p.clinicaId) : null;
                  const etapa = byId(state.data.etapas, w.etapaAtualId);
                  return `<tr class="is-clickable" data-open-work="${esc(w.id)}">
                    <td class="mono">${esc(w.referencia)}</td>
                    <td><strong>${esc(tipo?.nome || "Trabalho")}</strong> · Paciente ${esc(p?.paciente || "—")}<span class="subtext">${esc(c?.nome || "")}${w.material ? ` · ${esc(w.material)}` : ""}</span></td>
                    ${clinica ? "" : `<td>${esc(etapa?.nome || "—")}</td>`}
                    <td class="mono">${w.dentes?.length ? esc(w.dentes.join(", ")) : "Arcada / Total"}</td>
                    <td>${statusPill(w.estado)}</td>
                    <td class="mono">${fmtDate(p?.proximaConsulta || p?.prazo)}</td>
                  </tr>`;
                })
                .join("")
            : `<tr><td colspan="${clinica ? 5 : 6}" class="empty-state">Nenhum trabalho corresponde aos filtros aplicados.</td></tr>`
        }
      </tbody>
    </table>
  `;
}

function renderWorksPage() {
  const clinica = isClinicaUser();

  const filters = clinica
    ? [
        ["", "Todos"],
        ["por_aceitar", "Por aceitar"],
        ["em_producao", "Em produção"],
        ["concluido", "Concluído"],
      ]
    : [
        ["", "Todos"],
        ["em_avaliacao", "Em avaliação"],
        ["por_iniciar", "Por iniciar"],
        ["em_processamento", "Em produção"],
        ["em_prova", "Em prova"],
        ["em_espera", "Em espera"],
        ["concluido", "Concluído"],
        ["entregue", "Entregue"],
      ];

  return `
    <div class="panel">
      <div class="filter-bar">
        <input id="work-search" type="search" value="${esc(state.search)}" placeholder="Pesquisar por referência, paciente, tipo ou material...">
        <select id="work-sort" aria-label="Ordenar trabalhos">
          <option value="prazo" ${state.sort === "prazo" ? "selected" : ""}>Ordenar por próxima consulta</option>
          <option value="recente" ${state.sort === "recente" ? "selected" : ""}>Ordenar por mais recentes</option>
        </select>
      </div>
      <div class="chip-row" style="margin-top:0.8rem">
        ${filters.map(([val, label]) => `<button type="button" class="filter-chip ${state.statusFilter === val ? "is-active" : ""}" data-status-filter="${val}">${esc(label)}</button>`).join("")}
      </div>
    </div>

    <div class="table-wrap" id="works-table-wrap">
      ${renderWorksTable()}
    </div>
  `;
}

function renderOrdersPage() {
  const orders = visibleOrders();
  const clinica = isClinicaUser();
  if (!orders.length) {
    return `<div class="empty-state"><strong>Sem pedidos registados</strong>Submeta o primeiro pedido utilizando o botão Novo pedido.</div>`;
  }
  return `
    <div class="card-list">
      ${orders
        .map((p) => {
          const c = byId(state.data.clinicas, p.clinicaId);
          const m = byId(state.data.medicos, p.medicoId);
          const items = (state.data.trabalhos || []).filter((w) => w.pedidoTrabalhoId === p.id);
          return `<article class="record-card">
            <div class="record-card__head">
              <div>
                <span class="record-card__title mono">${esc(p.referencia)}</span>
                <span class="record-card__meta"> · Paciente ${esc(p.paciente)} · ${esc(c?.nome || "")}</span>
              </div>
              ${statusPill(p.estado)}
            </div>
            <div class="record-card__meta">${esc(doctorLabel(m))} · Próxima consulta: ${fmtDate(p.proximaConsulta || p.prazo)}</div>
            <div class="tag-row">
              ${items
                .map((w) => `<button type="button" class="tag-btn" data-open-work="${esc(w.id)}">${esc(w.referencia)} · ${esc(byId(state.data.tipos, w.tipoId)?.nome || "Trabalho")}</button>`)
                .join("")}
            </div>
            ${
              !clinica && p.estado === "em_avaliacao"
                ? `<div class="record-card__actions">
                    <button type="button" class="btn btn--primary btn--sm" data-accept-order="${esc(p.id)}">Aceitar pedido</button>
                    <button type="button" class="btn btn--danger btn--sm" data-reject-order="${esc(p.id)}">Recusar pedido</button>
                  </div>`
                : ""
            }
          </article>`;
        })
        .join("")}
    </div>
  `;
}

function renderSolicitacoesPage() {
  const list = visibleSolicitacoes();
  const clinica = isClinicaUser();
  if (!list.length) {
    return `<div class="empty-state"><strong>Sem solicitações especiais</strong>Os pedidos de conserto, reabertura ou cancelamento surgem aqui.</div>`;
  }
  return `
    <div class="card-list">
      ${list
        .map((s) => {
          const w = byId(state.data.trabalhos, s.trabalhoId);
          const p = w ? byId(state.data.pedidosTrabalho, w.pedidoTrabalhoId) : null;
          return `<article class="record-card">
            <div class="record-card__head">
              <div>
                <span class="record-card__title">${esc(SOLICITACAO_LABELS[s.tipo] || s.tipo)}</span>
                <span class="record-card__meta"> · ${esc(w?.referencia || "Trabalho")} · Paciente ${esc(p?.paciente || "—")}</span>
              </div>
              ${statusPill(s.estado)}
            </div>
            <div class="note-box">${esc(s.motivo)}</div>
            <div class="record-card__meta">Submetido em ${fmtDate(s.criadoEm)}</div>
            ${
              !clinica && s.estado === "pendente"
                ? `<div class="record-card__actions">
                    <button type="button" class="btn btn--primary btn--sm" data-decide-sol="${esc(s.id)}" data-decision="true">Aceitar solicitação</button>
                    <button type="button" class="btn btn--danger btn--sm" data-decide-sol="${esc(s.id)}" data-decision="false">Recusar</button>
                  </div>`
                : ""
            }
          </article>`;
        })
        .join("")}
    </div>
  `;
}

function renderMessagesPage() {
  const msgs = state.data.mensagens || [];
  const myId = state.user?.utilizadorId;
  return `
    <div class="panel chat-panel">
      <div class="chat-feed">
        ${
          msgs.length
            ? msgs
                .slice()
                .reverse()
                .map((m) => {
                  const mine = m.autorId === myId;
                  return `<div class="chat-bubble ${mine ? "chat-bubble--mine" : ""}">
                    <div class="chat-bubble__head">
                      <strong>${esc(m.autorNome || "Equipa")}</strong>
                      <span>${fmtDate(m.criadoEm)}</span>
                    </div>
                    <p>${esc(m.texto)}</p>
                  </div>`;
                })
                .join("")
            : `<div class="empty-state"><strong>Ainda sem mensagens</strong>Inicie uma conversa com o laboratório abaixo.</div>`
        }
      </div>
      <form class="chat-composer" id="chat-form">
        <input id="chat-input" type="text" placeholder="${isClinicaUser() ? "Escreva uma instrução para o laboratório..." : "Responder à clínica..."}" required>
        <button class="btn btn--primary" type="submit">Enviar mensagem</button>
      </form>
    </div>
  `;
}

function renderNotificationsPage() {
  const list = visibleNotifications();
  if (!list.length) {
    return `<div class="empty-state"><strong>Sem notificações pendentes</strong>Todas as atualizações foram consultadas.</div>`;
  }
  const hasUnread = list.some((n) => !n.lida);
  return `
    ${hasUnread ? `<div style="display:flex;justify-content:flex-end"><button type="button" class="btn btn--ghost btn--sm" id="mark-all-read">Marcar todas como lidas</button></div>` : ""}
    <div class="card-list">
      ${list
        .map(
          (n) => `<article class="record-card" style="${n.lida ? "" : "border-color:#B29A0E;background:#FFFDF5"}">
            <div class="record-card__head">
              <strong class="record-card__title">${esc(n.titulo)}</strong>
              <span class="record-card__meta">${fmtDate(n.criadoEm)}</span>
            </div>
            <p style="margin:0">${esc(n.mensagem)}</p>
            <div class="record-card__actions">
              ${n.trabalhoId ? `<button type="button" class="btn btn--ghost btn--sm" data-open-work="${esc(n.trabalhoId)}">Ver trabalho</button>` : ""}
              ${!n.lida ? `<button type="button" class="btn btn--primary btn--sm" data-read-notif="${esc(n.id)}">Marcar como lida</button>` : ""}
            </div>
          </article>`
        )
        .join("")}
    </div>
  `;
}

function renderFilesPage() {
  const workIds = new Set(visibleWorks().map((w) => w.id));
  const files = isClinicaUser()
    ? (state.data.ficheiros || []).filter((f) => workIds.has(f.trabalhoId))
    : state.data.ficheiros || [];
  return `
    <div class="panel">
      <div class="panel__head">
        <h2>Modelos digitais recebidos</h2>
        <button type="button" class="btn btn--primary btn--sm" id="open-stl-modal">Carregar ficheiro STL</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ficheiro</th>
              <th>Trabalho</th>
              <th>Tamanho</th>
              <th>Data</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            ${
              files.length
                ? files
                    .map((f) => {
                      const w = byId(state.data.trabalhos, f.trabalhoId);
                      return `<tr>
                        <td class="mono">${esc(f.nome)}</td>
                        <td class="mono">${esc(w?.referencia || "—")}</td>
                        <td class="mono">${esc(f.tamanhoKb || 0)} KB</td>
                        <td>${fmtDate(f.criadoEm)}</td>
                        <td>${isLocalDemo ? '<span class="subtext">Ficheiro local</span>' : `<button type="button" class="link-btn" data-download-stl="${esc(f.id)}" data-filename="${esc(f.nome)}">Descarregar</button>`}</td>
                      </tr>`;
                    })
                    .join("")
                : `<tr><td colspan="5" class="empty-state">Sem ficheiros STL associados.</td></tr>`
            }
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderClinicsPage() {
  const clinics = state.data.clinicas || [];
  return `
    <div class="card-list">
      ${clinics
        .map((c) => {
          const docs = (state.data.medicos || []).filter((m) => m.clinicaId === c.id);
          return `<article class="record-card">
            <div class="record-card__head">
              <div>
                <span class="record-card__title">${esc(c.nome)}</span>
                <span class="record-card__meta"> · NIF ${esc(c.nif)} · ${esc(c.faturacao)}</span>
              </div>
              ${statusPill(c.ativa ? "aceite" : "cancelado")}
            </div>
            <div class="record-card__meta">${esc(c.email)} · ${esc(c.morada)}</div>
            <div class="tag-row">
              ${docs.map((m) => `<span class="tag-btn">${esc(doctorLabel(m))}</span>`).join("")}
            </div>
          </article>`;
        })
        .join("")}
    </div>
  `;
}

function renderCatalogPage() {
  const tipos = state.data.tipos || [];
  const mats = state.data.materiais || [];
  return `
    <div class="panel">
      <div class="panel__head"><h2>Tipos de trabalho configurados</h2></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Tipo</th><th>Descrição</th><th>Etapas no fluxo</th></tr></thead>
          <tbody>
            ${tipos
              .map(
                (t) => `<tr>
                  <td><strong>${esc(t.nome)}</strong></td>
                  <td>${esc(t.descricao || "—")}</td>
                  <td class="mono">${plural(t.etapaIds?.length || 0, "etapa", "etapas")}</td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>

    <div class="panel">
      <div class="panel__head"><h2>Stock de materiais e lotes</h2></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Material</th><th>Lote</th><th>Disponível</th><th>Stock mínimo</th></tr></thead>
          <tbody>
            ${mats
              .map(
                (m) => `<tr>
                  <td><strong>${esc(m.nome)}</strong></td>
                  <td class="mono">${esc(m.lote)}</td>
                  <td class="mono" style="color:${m.stock <= m.stockMinimo ? "#C93D49" : "#21244A"}">${m.stock} ${esc(m.unidade)}</td>
                  <td class="mono">${m.stockMinimo} ${esc(m.unidade)}</td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openWorkDrawer(workId) {
  state.activeWorkId = workId;
  const w = byId(state.data.trabalhos, workId);
  if (!w) return;
  const p = byId(state.data.pedidosTrabalho, w.pedidoTrabalhoId);
  const tipo = byId(state.data.tipos, w.tipoId);
  const clinica = isClinicaUser();
  const c = p ? byId(state.data.clinicas, p.clinicaId) : null;
  const m = p ? byId(state.data.medicos, p.medicoId) : null;
  const notes = (state.data.notas || []).filter((n) => n.trabalhoId === w.id && (!clinica || n.visivelClinica));
  const files = (state.data.ficheiros || []).filter((f) => f.trabalhoId === w.id);

  document.querySelector("#drawer-title").textContent = w.referencia;
  document.querySelector("#drawer-sub").textContent = `${tipo?.nome || "Trabalho"} · Paciente ${p?.paciente || "—"}`;

  let stageHtml = "";
  if (!clinica && tipo?.etapaIds?.length) {
    const doneSet = new Set((w.etapas || []).filter((e) => e.concluidoEm).map((e) => e.etapaId));
    stageHtml = `
      <div class="drawer-section">
        <h3>Fluxo técnico interno</h3>
        <ol class="stage-list">
          ${tipo.etapaIds
            .map((eid, idx) => {
              const et = byId(state.data.etapas, eid);
              const isDone = doneSet.has(eid);
              const isCurrent = eid === w.etapaAtualId && !isDone;
              const cls = isDone ? "is-done" : isCurrent ? "is-current" : "";
              const mark = isDone ? "✓" : isCurrent ? "●" : String(idx + 1);
              return `<li class="${cls}"><span class="mono">${mark}</span><span>${esc(et?.nome || eid)}</span></li>`;
            })
            .join("")}
        </ol>
        ${
          !["entregue", "cancelado", "recusado", "concluido"].includes(w.estado)
            ? `<div style="margin-top:0.5rem"><button type="button" class="btn btn--primary btn--sm" id="drawer-advance-btn">Avançar etapa</button></div>`
            : ""
        }
      </div>
    `;
  }

  document.querySelector("#drawer-body").innerHTML = `
    <div class="drawer-section">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:0.75rem;flex-wrap:wrap">
        ${statusPill(w.estado)}
        <span class="subtext">Próxima consulta: <strong>${fmtDate(p?.proximaConsulta || p?.prazo)}</strong></span>
      </div>
      <div class="record-card__meta">Clínica: ${esc(c?.nome || "—")} · ${esc(doctorLabel(m))}</div>
      ${w.material ? `<div class="record-card__meta">Material: <strong>${esc(w.material)}</strong></div>` : ""}
      ${w.motivoEspera ? `<div class="note-box">Em espera: ${esc(w.motivoEspera)}</div>` : ""}
    </div>

    <div class="drawer-section">
      <h3>Odontograma FDI</h3>
      ${renderOdontogram(w.dentes, false)}
      <span class="subtext">${w.dentes?.length ? `Dentes assinalados: ${esc(w.dentes.join(", "))}` : "Sem seleção unitária (arcada completa ou geral)."}</span>
    </div>

    ${stageHtml}

    <div class="drawer-section">
      <h3>Ficheiros STL (${files.length})</h3>
      ${
        files.length
          ? files
              .map(
                (f) => `<div class="note-box stl-row">
                  <span class="mono">${esc(f.nome)} · ${f.tamanhoKb} KB</span>
                  ${isLocalDemo ? '<span class="subtext">Local</span>' : `<button type="button" class="link-btn" data-download-stl="${esc(f.id)}" data-filename="${esc(f.nome)}">Descarregar</button>`}
                </div>`
              )
              .join("")
          : '<span class="subtext">Ainda sem ficheiros anexados a este trabalho.</span>'
      }
    </div>

    <div class="drawer-section">
      <h3>Notas clínicas e técnicas</h3>
      ${
        notes.length
          ? notes.map((n) => `<div class="note-box">${esc(n.conteudo)}<span class="subtext">${fmtDate(n.criadoEm)}</span></div>`).join("")
          : '<span class="subtext">Sem notas registadas.</span>'
      }
      <form id="drawer-note-form" class="chat-composer" style="margin-top:0.4rem">
        <input id="drawer-note-input" type="text" placeholder="Adicionar nota ao caso..." required>
        <button type="submit" class="btn btn--primary btn--sm">Guardar nota</button>
      </form>
    </div>

    ${
      clinica && w.estado === "entregue"
        ? `<div class="drawer-section">
            <h3>Pós-entrega</h3>
            <button type="button" class="btn btn--ghost" id="drawer-repair-btn">Solicitar conserto ou ajuste</button>
          </div>`
        : ""
    }
  `;

  document.querySelector("#detail-drawer").hidden = false;
  document.body.classList.add("is-locked");
  bindDrawerActions(w);
}

function closeWorkDrawer() {
  document.querySelector("#detail-drawer").hidden = true;
  document.body.classList.remove("is-locked");
  state.activeWorkId = null;
}

function bindDrawerActions(work) {
  bindStlDownloadButtons(document.querySelector("#drawer-body"));
  const advBtn = document.querySelector("#drawer-advance-btn");
  if (advBtn) {
    advBtn.addEventListener("click", async () => {
      try {
        if (isLocalDemo) {
          const tipo = byId(state.data.tipos, work.tipoId);
          const ids = tipo?.etapaIds || [];
          const idx = ids.indexOf(work.etapaAtualId);
          work.etapas = work.etapas || [];
          work.etapas.push({ etapaId: work.etapaAtualId, concluidoEm: new Date().toISOString() });
          if (idx >= 0 && idx < ids.length - 1) {
            work.etapaAtualId = ids[idx + 1];
            const nextStage = byId(state.data.etapas, work.etapaAtualId);
            work.estado = nextStage?.nome.toLowerCase().includes("prova") ? "em_prova" : "em_processamento";
          } else {
            work.estado = "concluido";
          }
        } else {
          await api(`/trabalhos/${encodeURIComponent(work.id)}/advance/`, { method: "POST" });
          await refreshData();
        }
        showToast(`Etapa atualizada em ${work.referencia}.`);
        render();
        openWorkDrawer(work.id);
      } catch (e) {
        showToast(e.message);
      }
    });
  }

  const noteForm = document.querySelector("#drawer-note-form");
  if (noteForm) {
    noteForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = document.querySelector("#drawer-note-input");
      const content = input.value.trim();
      if (!content) return;
      try {
        if (isLocalDemo) {
          state.data.notas.unshift({
            id: `nota-${Date.now()}`,
            trabalhoId: work.id,
            autorId: state.user.utilizadorId,
            conteudo: content,
            visivelClinica: true,
            criadoEm: new Date().toISOString(),
          });
        } else {
          await api("/notas/", {
            method: "POST",
            body: JSON.stringify({
              trabalhoId: work.id,
              conteudo: content,
              visivelClinica: true,
            }),
          });
          await refreshData();
        }
        showToast("Nota registada.");
        openWorkDrawer(work.id);
      } catch (err) {
        showToast(err.message);
      }
    });
  }

  const repairBtn = document.querySelector("#drawer-repair-btn");
  if (repairBtn) {
    repairBtn.addEventListener("click", async () => {
      try {
        if (isLocalDemo) {
          state.data.solicitacoes.unshift({
            id: `sol-${Date.now()}`,
            trabalhoId: work.id,
            tipo: "conserto",
            estado: "pendente",
            motivo: "Pedido de conserto submetido pela Área do Cliente.",
            criadoEm: new Date().toISOString(),
          });
        } else {
          await api("/solicitacoes/", {
            method: "POST",
            body: JSON.stringify({
              trabalhoId: work.id,
              tipo: "conserto",
              motivo: "Pedido de conserto submetido pela Área do Cliente.",
              ...(state.user?.medicoId ? { medicoId: state.user.medicoId } : {}),
              termoAceiteEm: new Date().toISOString(),
              termoVersao: "2026.1",
            }),
          });
          await refreshData();
        }
        showToast("Solicitação de conserto enviada ao laboratório.");
        closeWorkDrawer();
        render();
      } catch (err) {
        showToast(err.message);
      }
    });
  }
}

function render() {
  const pages = getPages();
  if (!pages.some((p) => p.id === state.page)) state.page = "resumo";
  const current = pages.find((p) => p.id === state.page);
  const unreadCount = visibleNotifications().filter((n) => !n.lida).length;

  document.querySelector("#portal-scope").textContent = isClinicaUser() ? "Portal da Clínica" : "Backoffice LAB CD";
  const name = state.user?.nome || state.user?.email || "Utilizador";
  document.querySelector("#user-name").textContent = name;
  document.querySelector("#user-role").textContent = ROLE_LABELS[state.user?.papel] || "Portal";
  document.querySelector("#user-initials").textContent = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0].toUpperCase())
    .join("") || "CD";

  const localBanner = document.querySelector("#local-mode-banner");
  localBanner.hidden = !isLocalDemo;
  if (isLocalDemo) {
    document.querySelector("#local-role-switch").value = state.user?.papel || "clinica";
  }

  document.querySelector("#nav").innerHTML = pages
    .map((p) => {
      const badge = p.id === "notificacoes" && unreadCount > 0 ? `<span class="nav-badge">${unreadCount}</span>` : "";
      return `<button type="button" class="nav-item ${state.page === p.id ? "is-active" : ""}" data-page="${p.id}"><span>${esc(p.label)}</span>${badge}</button>`;
    })
    .join("");

  document.querySelector("#title").textContent = current.label;
  document.querySelector("#subtitle").textContent = current.subtitle;

  const content = document.querySelector("#content");
  content.innerHTML = switchPage(state.page);

  bindDynamicHandlers();
}

function switchPage(pageId) {
  switch (pageId) {
    case "trabalhos":
      return renderWorksPage();
    case "pedidos":
      return renderOrdersPage();
    case "solicitacoes":
      return renderSolicitacoesPage();
    case "mensagens":
      return renderMessagesPage();
    case "notificacoes":
      return renderNotificationsPage();
    case "ficheiros":
      return renderFilesPage();
    case "clientes":
      return renderClinicsPage();
    case "catalogo":
      return renderCatalogPage();
    default:
      return renderSummaryPage();
  }
}

function bindDynamicHandlers() {
  document.querySelectorAll("[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.page = btn.dataset.page;
      setSidebarOpen(false);
      render();
    });
  });

  document.querySelectorAll("[data-jump]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.page = btn.dataset.jump;
      render();
    });
  });

  document.querySelectorAll("[data-open-work]").forEach((el) => {
    el.addEventListener("click", () => openWorkDrawer(el.dataset.openWork));
  });

  const search = document.querySelector("#work-search");
  if (search) {
    search.addEventListener("input", () => {
      state.search = search.value;
      const wrap = document.querySelector("#works-table-wrap");
      if (wrap) {
        wrap.innerHTML = renderWorksTable();
        wrap.querySelectorAll("[data-open-work]").forEach((el) => {
          el.addEventListener("click", () => openWorkDrawer(el.dataset.openWork));
        });
      }
    });
  }

  const sort = document.querySelector("#work-sort");
  if (sort) {
    sort.addEventListener("change", () => {
      state.sort = sort.value;
      render();
    });
  }

  document.querySelectorAll("[data-status-filter]").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.statusFilter = chip.dataset.statusFilter;
      render();
    });
  });

  document.querySelectorAll("[data-accept-order], [data-reject-order]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const isAccept = Boolean(btn.dataset.acceptOrder);
      const id = btn.dataset.acceptOrder || btn.dataset.rejectOrder;
      try {
        if (isLocalDemo) {
          const order = byId(state.data.pedidosTrabalho, id);
          if (order) {
            order.estado = isAccept ? "aceite" : "recusado";
            for (const w of state.data.trabalhos.filter((x) => x.pedidoTrabalhoId === id)) {
              w.estado = isAccept ? "por_iniciar" : "recusado";
            }
          }
        } else {
          await api(`/pedidos-trabalho/${encodeURIComponent(id)}/${isAccept ? "accept" : "reject"}/`, { method: "POST" });
          await refreshData();
        }
        showToast(isAccept ? "Pedido aceite para produção." : "Pedido recusado.");
        render();
      } catch (err) {
        showToast(err.message);
      }
    });
  });

  document.querySelectorAll("[data-decide-sol]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.decideSol;
      const aceite = btn.dataset.decision === "true";
      try {
        if (isLocalDemo) {
          const sol = byId(state.data.solicitacoes, id);
          if (sol) sol.estado = aceite ? "aceite" : "recusada";
        } else {
          await api(`/solicitacoes/${encodeURIComponent(id)}/decide/`, { method: "POST", body: JSON.stringify({ aceite }) });
          await refreshData();
        }
        showToast(aceite ? "Solicitação aceite." : "Solicitação recusada.");
        render();
      } catch (err) {
        showToast(err.message);
      }
    });
  });

  const chatForm = document.querySelector("#chat-form");
  if (chatForm) {
    chatForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = document.querySelector("#chat-input");
      const text = input.value.trim();
      if (!text) return;
      try {
        if (isLocalDemo) {
          state.data.mensagens.unshift({
            id: `msg-${Date.now()}`,
            autorId: state.user.utilizadorId,
            autorNome: state.user.nome || "Utilizador",
            texto: text,
            criadoEm: new Date().toISOString(),
          });
        } else {
          await api("/messages/", { method: "POST", body: JSON.stringify({ texto: text }) });
          await refreshData();
        }
        render();
      } catch (err) {
        showToast(err.message);
      }
    });
  }

  document.querySelectorAll("[data-read-notif]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.readNotif;
      try {
        if (isLocalDemo) {
          const n = byId(state.data.notificacoes, id);
          if (n) n.lida = true;
        } else {
          await api(`/notifications/${encodeURIComponent(id)}/read/`, { method: "POST" });
          await refreshData();
        }
        render();
      } catch (err) {
        showToast(err.message);
      }
    });
  });

  const markAll = document.querySelector("#mark-all-read");
  if (markAll) {
    markAll.addEventListener("click", async () => {
      const unread = visibleNotifications().filter((n) => !n.lida);
      if (isLocalDemo) {
        unread.forEach((n) => (n.lida = true));
      } else {
        await Promise.all(unread.map((n) => api(`/notifications/${encodeURIComponent(n.id)}/read/`, { method: "POST" })));
        await refreshData();
      }
      render();
    });
  }

  const openStlBtn = document.querySelector("#open-stl-modal");
  if (openStlBtn) {
    openStlBtn.addEventListener("click", openStlModal);
  }
  bindStlDownloadButtons(document.querySelector("#content"));
}

function setSidebarOpen(open) {
  document.querySelector("#sidebar").classList.toggle("is-open", open);
  document.querySelector("#sidebar-backdrop").hidden = !open;
}

function openOrderModal() {
  const clinics = state.data.clinicas || [];
  const clinicWrap = document.querySelector("#order-clinic-wrap");
  const clinicSelect = document.querySelector("#order-clinic");
  const doctorSelect = document.querySelector("#order-doctor");
  const typeSelect = document.querySelector("#order-type");

  clinicWrap.hidden = isClinicaUser();
  clinicSelect.innerHTML = clinics.map((c) => `<option value="${esc(c.id)}">${esc(c.nome)}</option>`).join("");
  if (isClinicaUser() && state.user.utilizadorId) {
    clinicSelect.value = state.user.utilizadorId;
  }

  const syncDoctors = () => {
    const cid = isClinicaUser() ? state.user.utilizadorId : clinicSelect.value;
    const docs = (state.data.medicos || []).filter((m) => !cid || m.clinicaId === cid);
    doctorSelect.innerHTML = docs.map((m) => `<option value="${esc(m.id)}">${esc(doctorLabel(m))}</option>`).join("");
  };
  clinicSelect.onchange = syncDoctors;
  syncDoctors();

  typeSelect.innerHTML = (state.data.tipos || []).map((t) => `<option value="${esc(t.id)}">${esc(t.nome)}</option>`).join("");
  const defaultDate = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  document.querySelector("#order-date").value = defaultDate;
  document.querySelector("#order-error").textContent = "";

  state.selectedTeethOrder = [];
  renderOrderOdontogram();

  document.querySelector("#order-modal").hidden = false;
  document.body.classList.add("is-locked");
}

function renderOrderOdontogram() {
  const container = document.querySelector("#order-odontogram");
  container.innerHTML = renderOdontogram(state.selectedTeethOrder, true);
  container.querySelectorAll("[data-tooth]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tooth = btn.dataset.tooth;
      const idx = state.selectedTeethOrder.indexOf(tooth);
      if (idx >= 0) state.selectedTeethOrder.splice(idx, 1);
      else state.selectedTeethOrder.push(tooth);
      renderOrderOdontogram();
    });
  });
}

function openStlModal() {
  const select = document.querySelector("#stl-work");
  const works = visibleWorks();
  select.innerHTML = works.map((w) => `<option value="${esc(w.id)}">${esc(w.referencia)}</option>`).join("");
  document.querySelector("#stl-error").textContent = "";
  document.querySelector("#stl-modal").hidden = false;
  document.body.classList.add("is-locked");
}

function closeDialogs() {
  document.querySelector("#order-modal").hidden = true;
  document.querySelector("#stl-modal").hidden = true;
  if (document.querySelector("#detail-drawer").hidden) {
    document.body.classList.remove("is-locked");
  }
}

async function refreshData() {
  if (isLocalDemo) return;
  const [bootstrap, me] = await Promise.all([api("/bootstrap/"), api("/auth/me/")]);
  if (bootstrap) state.data = bootstrap;
  if (me) {
    state.user = me;
    localStorage.setItem("labcd-user", JSON.stringify(me));
  }
}

// Global static event listeners
document.querySelector("#menu").addEventListener("click", () => {
  setSidebarOpen(!document.querySelector("#sidebar").classList.contains("is-open"));
});
document.querySelector("#sidebar-backdrop").addEventListener("click", () => setSidebarOpen(false));
document.querySelector("#drawer-close").addEventListener("click", closeWorkDrawer);
document.querySelector("#detail-drawer").addEventListener("click", (e) => {
  if (e.target.id === "detail-drawer") closeWorkDrawer();
});

document.querySelector("#new-order-btn").addEventListener("click", openOrderModal);
document.querySelector("#order-clear-teeth").addEventListener("click", () => {
  state.selectedTeethOrder = [];
  renderOrderOdontogram();
});

document.querySelectorAll("[data-close-dialog]").forEach((btn) => btn.addEventListener("click", closeDialogs));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeDialogs();
    closeWorkDrawer();
    setSidebarOpen(false);
  }
});

document.querySelector("#order-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.querySelector("#order-error");
  errorEl.textContent = "";

  const clinicaId = isClinicaUser() ? state.user.utilizadorId : document.querySelector("#order-clinic").value;
  const medicoId = document.querySelector("#order-doctor").value;
  const paciente = document.querySelector("#order-patient").value.trim();
  const tipoId = document.querySelector("#order-type").value;
  const material = document.querySelector("#order-material").value.trim();
  const dateVal = document.querySelector("#order-date").value;
  const notes = document.querySelector("#order-notes").value.trim();

  if (!paciente) {
    errorEl.textContent = "Indique as iniciais ou o código do paciente.";
    return;
  }
  if (!tipoId || !dateVal) {
    errorEl.textContent = "Selecione o tipo de trabalho e a data da próxima consulta.";
    return;
  }

  const isoDate = new Date(`${dateVal}T09:00:00`).toISOString();
  try {
    if (isLocalDemo) {
      const nextNum = (state.data.pedidosTrabalho?.length || 0) + 144;
      const ref = `PED-${new Date().getFullYear()}-${String(nextNum).padStart(4, "0")}`;
      const pid = `ped-${Date.now()}`;
      const wid = `trab-${Date.now()}`;
      const tipo = byId(state.data.tipos, tipoId);
      state.data.pedidosTrabalho.unshift({
        id: pid,
        referencia: ref,
        clinicaId,
        medicoId,
        paciente,
        estado: isClinicaUser() ? "em_avaliacao" : "aceite",
        prazo: isoDate,
        proximaConsulta: isoDate,
        criadoEm: new Date().toISOString(),
      });
      state.data.trabalhos.unshift({
        id: wid,
        pedidoTrabalhoId: pid,
        referencia: `${ref}-A`,
        tipoId,
        estado: isClinicaUser() ? "em_avaliacao" : "por_iniciar",
        etapaAtualId: tipo?.etapaIds?.[0] || "et-1",
        dentes: [...state.selectedTeethOrder],
        material,
        etapas: [],
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      });
      if (notes) {
        state.data.notas.unshift({
          id: `nota-${Date.now()}`,
          trabalhoId: wid,
          autorId: state.user.utilizadorId,
          conteudo: notes,
          visivelClinica: true,
          criadoEm: new Date().toISOString(),
        });
      }
    } else {
      await api("/work-requests/", {
        method: "POST",
        body: JSON.stringify({
          clinicaId,
          medicoId,
          paciente,
          prazo: isoDate,
          proximaConsulta: isoDate,
          ...(notes ? { notas: notes } : {}),
          itens: [{ tipoId, dentes: state.selectedTeethOrder, material }],
        }),
      });
      await refreshData();
    }
    closeDialogs();
    document.querySelector("#order-form").reset();
    showToast("Pedido submetido com sucesso.");
    render();
  } catch (err) {
    errorEl.textContent = err.message;
  }
});

document.querySelector("#stl-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.querySelector("#stl-error");
  errorEl.textContent = "";
  const workId = document.querySelector("#stl-work").value;
  const fileInput = document.querySelector("#stl-file");
  const file = fileInput.files?.[0];

  if (!file) {
    errorEl.textContent = "Selecione um ficheiro com extensão .stl.";
    return;
  }
  if (!file.name.toLowerCase().endsWith(".stl")) {
    errorEl.textContent = "Apenas ficheiros .stl são aceites neste carregamento.";
    return;
  }

  try {
    if (isLocalDemo) {
      state.data.ficheiros.unshift({
        id: `stl-${Date.now()}`,
        nome: file.name,
        trabalhoId: workId,
        tamanhoKb: Math.max(1, Math.round(file.size / 1024)),
        criadoEm: new Date().toISOString(),
      });
    } else {
      const form = new FormData();
      form.append("trabalhoId", workId);
      form.append("nome", file.name);
      form.append("file", file);
      await api("/ficheiros/", { method: "POST", body: form });
      await refreshData();
    }
    closeDialogs();
    fileInput.value = "";
    showToast("Ficheiro STL associado ao trabalho.");
    render();
  } catch (err) {
    errorEl.textContent = err.message;
  }
});

document.querySelector("#local-role-switch").addEventListener("change", (e) => {
  const role = e.target.value;
  const profiles = {
    clinica: { utilizadorId: "cli-1", papel: "clinica", nome: "Clínica Sorriso do Atlântico", medicoId: "med-1" },
    admin: { utilizadorId: "col-1", papel: "admin", nome: "Catarina Domingos" },
    tecnico: { utilizadorId: "col-2", papel: "tecnico", nome: "Rui Martins" },
  };
  state.user = profiles[role] || profiles.clinica;
  localStorage.setItem("labcd-user", JSON.stringify(state.user));
  state.page = "resumo";
  render();
});

document.querySelector("#refresh").addEventListener("click", async () => {
  try {
    await refreshData();
    render();
    showToast("Dados atualizados.");
  } catch (err) {
    showToast(err.message);
  }
});

document.querySelector("#logout").addEventListener("click", async () => {
  try {
    if (!isLocalDemo) await api("/auth/logout/", { method: "POST" });
  } finally {
    localStorage.removeItem("labcd-token");
    localStorage.removeItem("labcd-user");
    window.location.href = "index.html";
  }
});

async function init() {
  if (isLocalDemo) {
    if (!state.user?.papel) {
      state.user = { utilizadorId: "cli-1", papel: "clinica", nome: "Clínica Sorriso do Atlântico" };
    }
    render();
    return;
  }
  try {
    await refreshData();
    render();
  } catch {
    localStorage.removeItem("labcd-token");
    localStorage.removeItem("labcd-user");
    window.location.href = "index.html";
  }
}

init();
