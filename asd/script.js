const $ = selector => document.querySelector(selector);
let invites = [];

function createHash() { return crypto.randomUUID().replaceAll("-", ""); }
function splitLines(value) { return value.split("\n").map(item => item.trim()).filter(Boolean); }
function inviteUrl(invite) { return new URL(`../?hash=${encodeURIComponent(invite.hash)}`, window.location.href).href; }

function setStatus(message, type = "") {
  const status = $("#saveStatus");
  status.textContent = message;
  status.className = `status ${type}`;
}

function setFormError(message = "") {
  const error = $("#formError");
  error.textContent = message;
  error.hidden = !message;
}

function normalizeInvite(invite) {
  return {
    names: Array.isArray(invite.names) ? invite.names : [],
    note: typeof invite.note === "string" ? invite.note : "",
    companions: Number.isInteger(invite.companions) && invite.companions >= 0 ? invite.companions : 0,
    message: typeof invite.message === "string" ? invite.message : "",
    hash: typeof invite.hash === "string" ? invite.hash : "",
    confirmed: invite.confirmed === true,
    sent: invite.sent === true,
    confirmed_names: Array.isArray(invite.confirmed_names) ? invite.confirmed_names : []
  };
}

async function loadInvites() {
  const response = await fetch("/api/invites", { cache: "no-store" });
  if (!response.ok) throw new Error("Não foi possível carregar os convites.");
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error("O arquivo convites.json não contém uma lista válida.");
  invites = data.map(normalizeInvite);
}

async function saveInvites(message = "Alterações salvas no convites.json.") {
  const response = await fetch("/api/invites", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(invites)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Não foi possível salvar os convites.");
  setStatus(message, "success");
}

function button(label, handler, className = "") {
  const element = document.createElement("button");
  element.type = "button";
  element.textContent = label;
  element.className = className;
  element.addEventListener("click", handler);
  return element;
}

async function shareInvite(invite) {
  const link = inviteUrl(invite);
  const text = `${invite.message}\n\n${link}`.trim();
  try {
    if (navigator.share) {
      await navigator.share({ title: "Nilda Sunset", text, url: link });
      return;
    }
    await navigator.clipboard.writeText(text);
    setStatus("Mensagem e link copiados.", "success");
  } catch (error) {
    if (error.name !== "AbortError") setStatus("Não foi possível compartilhar. Copie o link manualmente.", "error");
  }
}

async function copyLink(invite) {
  try {
    await navigator.clipboard.writeText(inviteUrl(invite));
    setStatus("Link copiado.", "success");
  } catch {
    window.prompt("Copie o link do convite:", inviteUrl(invite));
  }
}

function inviteCard(invite, index, extended) {
  const card = document.createElement("article");
  const details = document.createElement("div");
  const title = document.createElement("h3");
  const summary = document.createElement("p");
  const actions = document.createElement("div");
  card.className = "invite";
  title.textContent = invite.names.join(", ") || "Sem nomes";
  summary.textContent = extended
    ? `Código: ${invite.hash} · ${invite.companions} acompanhante(s) · ${invite.confirmed ? "confirmado" : "não confirmado"}`
    : `${invite.sent ? "Enviado" : "Não enviado"} · ${invite.confirmed ? "Confirmado" : "Disponível"}`;
  details.append(title, summary);
  const sent = document.createElement("label");
  const sentInput = document.createElement("input");
  sent.className = "toggle";
  sentInput.type = "checkbox";
  sentInput.checked = invite.sent;
  sentInput.addEventListener("change", async () => {
    invite.sent = sentInput.checked;
    try { await saveInvites(); render(); } catch (error) { sentInput.checked = !sentInput.checked; setStatus(error.message, "error"); }
  });
  sent.append(sentInput, " Enviado");
  actions.append(sent, button("Compartilhar", () => shareInvite(invite)));
  if (extended) actions.append(button("Abrir convite", () => window.open(inviteUrl(invite), "_blank", "noopener")), button("Copiar link", () => copyLink(invite)), button("Editar", () => openEditor(index), "quiet"));
  card.append(details, actions);
  return card;
}

function filteredInvites() {
  const term = $("#search").value.trim().toLocaleLowerCase();
  const sent = $("#sentFilter").value;
  const confirmed = $("#confirmedFilter").value;
  return invites.map((invite, index) => ({ invite, index })).filter(({ invite }) => {
    const text = `${invite.names.join(" ")} ${invite.note} ${invite.hash}`.toLocaleLowerCase();
    return (!term || text.includes(term)) && (sent === "all" || String(invite.sent) === sent) && (confirmed === "all" || String(invite.confirmed) === confirmed);
  });
}

function renderList(listSelector, emptySelector, entries, extended) {
  const list = $(listSelector);
  list.replaceChildren(...entries.map(({ invite, index }) => inviteCard(invite, index, extended)));
  $(emptySelector).hidden = entries.length > 0;
}

function render() {
  renderList("#simpleList", "#simpleEmpty", invites.map((invite, index) => ({ invite, index })), false);
  renderList("#extendedList", "#extendedEmpty", filteredInvites(), true);
}

function openEditor(index = null) {
  const invite = index === null ? normalizeInvite({ hash: createHash() }) : invites[index];
  $("#editorTitle").textContent = index === null ? "Novo convite" : "Editar convite";
  $("#editingIndex").value = index ?? "";
  $("#names").value = invite.names.join("\n");
  $("#note").value = invite.note;
  $("#companions").value = invite.companions;
  $("#message").value = invite.message;
  $("#hash").value = invite.hash;
  $("#sent").checked = invite.sent;
  $("#confirmed").checked = invite.confirmed;
  $("#confirmedNames").value = invite.confirmed_names.join("\n");
  $("#deleteInvite").hidden = index === null;
  setFormError();
  $("#editor").hidden = false;
  $("#editor").scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeEditor() { $("#editor").hidden = true; setFormError(); }

function formInvite() {
  return {
    names: splitLines($("#names").value),
    note: $("#note").value.trim(),
    companions: Number($("#companions").value),
    message: $("#message").value.trim(),
    hash: $("#hash").value.trim(),
    confirmed: $("#confirmed").checked,
    sent: $("#sent").checked,
    confirmed_names: splitLines($("#confirmedNames").value)
  };
}

$("#inviteForm").addEventListener("submit", async event => {
  event.preventDefault();
  const invite = formInvite();
  const index = $("#editingIndex").value;
  const editingIndex = index === "" ? -1 : Number(index);
  if (!invite.names.length || !invite.message || !/^[A-Za-z0-9_-]{12,}$/.test(invite.hash) || !Number.isInteger(invite.companions) || invite.companions < 0) {
    setFormError("Preencha os campos obrigatórios. O código deve ter ao menos 12 caracteres e usar apenas letras, números, _ ou -.");
    return;
  }
  if (invites.some((item, itemIndex) => item.hash === invite.hash && itemIndex !== editingIndex)) {
    setFormError("Este código já está em uso por outro convite.");
    return;
  }
  if (index === "") invites.push(invite); else invites[Number(index)] = invite;
  try { await saveInvites(); closeEditor(); render(); } catch (error) { setFormError(error.message); setStatus(error.message, "error"); }
});

$("#deleteInvite").addEventListener("click", async () => {
  const index = Number($("#editingIndex").value);
  if (!confirm("Excluir este convite?")) return;
  invites.splice(index, 1);
  try { await saveInvites("Convite excluído do convites.json."); closeEditor(); render(); } catch (error) { setFormError(error.message); setStatus(error.message, "error"); }
});

$("#generateHash").addEventListener("click", () => { $("#hash").value = createHash(); });
$("#newInvite").addEventListener("click", () => openEditor());
$("#closeEditor").addEventListener("click", closeEditor);
document.querySelectorAll(".tab").forEach(tab => tab.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(item => item.classList.toggle("active", item === tab));
  $("#simpleView").hidden = tab.dataset.view !== "simple";
  $("#extendedView").hidden = tab.dataset.view !== "extended";
}));
[$("#search"), $("#sentFilter"), $("#confirmedFilter")].forEach(input => input.addEventListener("input", render));

loadInvites().then(() => { setStatus(`${invites.length} convite(s) carregado(s).`); render(); }).catch(error => setStatus(error.message, "error"));
