const EVENT = {
  name: "Nilda Sunset",
  whatsapp: "5582998386476"
};

const $ = selector => document.querySelector(selector);

function formatNames(names) {
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} e ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} e ${names.at(-1)}`;
}

function getInviteHash() {
  return new URLSearchParams(window.location.search).get("hash")?.trim() || "";
}

function showStatus(title, text) {
  $("#inviteStatusTitle").textContent = title;
  $("#inviteStatusText").textContent = text;
  $("#inviteStatus").classList.remove("hidden");
}

function showError(text) {
  const error = $("#formError");
  error.textContent = text;
  error.classList.remove("hidden");
}

function clearError() {
  const error = $("#formError");
  error.textContent = "";
  error.classList.add("hidden");
}

function createCompanionInput(index) {
  const row = document.createElement("div");
  const label = document.createElement("label");
  const input = document.createElement("input");
  row.className = "companion-card";
  label.className = "input-label !mt-0";
  label.htmlFor = `companion-${index}`;
  label.textContent = `Acompanhante ${index}`;
  input.id = `companion-${index}`;
  input.className = "input";
  input.type = "text";
  input.placeholder = "Nome completo";
  input.autocomplete = "off";
  input.required = true;
  row.append(label, input);
  return row;
}

function setupRsvp(invite) {
  $("#inviteNames").textContent = formatNames(invite.names);
  $("#inviteMessage").textContent = invite.message || "Informe os nomes dos acompanhantes. O WhatsApp abrirá com a confirmação já escrita.";
  $("#maxCompanionsLabel").textContent = invite.companions;
  $("#companionsSection").classList.toggle("hidden", invite.companions === 0);

  let companionCount = 0;
  const renderCompanions = () => {
    $("#companionCount").textContent = companionCount;
    $("#companionsWrap").classList.toggle("hidden", companionCount === 0);
    const list = $("#companionsList");
    list.replaceChildren();
    for (let index = 1; index <= companionCount; index++) list.append(createCompanionInput(index));
  };

  $("#minusBtn").addEventListener("click", () => {
    if (companionCount > 0) {
      companionCount--;
      clearError();
      renderCompanions();
    }
  });

  $("#plusBtn").addEventListener("click", () => {
    if (companionCount >= invite.companions) {
      showError(`O máximo é de ${invite.companions} acompanhantes.`);
      return;
    }
    companionCount++;
    clearError();
    renderCompanions();
  });

  $("#rsvpForm").addEventListener("submit", event => {
    event.preventDefault();
    clearError();
    const inputs = [...document.querySelectorAll("#companionsList input")];
    const companions = inputs.map(input => input.value.trim());
    const emptyInput = inputs.find(input => !input.value.trim());
    if (emptyInput) {
      showError("Preencha o nome de todos os acompanhantes.");
      emptyInput.focus();
      return;
    }

    let companionPart = "e não levarei acompanhantes";
    if (companions.length === 1) companionPart = `e levarei como acompanhante ${companions[0]}`;
    if (companions.length > 1) companionPart = `e levarei como acompanhantes ${formatNames(companions)}`;
    const message = `Eu, ${formatNames(invite.names)}, confirmo minha presença no ${EVENT.name} ${companionPart}.`;
    window.location.href = `https://wa.me/${EVENT.whatsapp}?text=${encodeURIComponent(message)}`;
  });

  renderCompanions();
}

async function loadInvite() {
  const hash = getInviteHash();
  if (!hash) {
    showStatus("Convite não encontrado", "Use o link individual que você recebeu para acessar seu convite.");
    return;
  }

  try {
    const response = await fetch("convites.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Arquivo de convites indisponível");
    const invites = await response.json();
    if (!Array.isArray(invites)) throw new Error("Formato de convites inválido");
    const matches = invites.filter(item => item && item.hash === hash);
    if (matches.length > 1) throw new Error("Hash duplicado");
    const [invite] = matches;
    if (!invite) {
      showStatus("Convite não encontrado", "Este link é inválido ou não está mais disponível.");
      return;
    }
    if (!Array.isArray(invite.names) || !invite.names.length || !Number.isInteger(invite.companions) || invite.companions < 0) {
      throw new Error("Convite inválido");
    }
    if (invite.confirmed === true) {
      showStatus("Convite já utilizado", "Este convite já foi confirmado. Se precisar de ajuda, entre em contato com a organização.");
      return;
    }
    setupRsvp(invite);
  } catch (error) {
    showStatus("Não foi possível abrir o convite", "Tente novamente mais tarde ou peça um novo link à organização.");
  }
}

document.addEventListener("DOMContentLoaded", loadInvite);
