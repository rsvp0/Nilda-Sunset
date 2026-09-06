const EVENT = {
  name: "Nilda Sunset",
  dateISO: "2026-10-10",
  dateLabel: "10 de outubro",
  time: "15h30",
  location: "Studio29",
  address: "Rua Santa Isabel, 29 · Barro Duro · Maceió, AL · 57045-310",

  whatsapp: "5582998386476",

  maxCompanions: 4,

  mapUrl: "https://www.google.com/maps/place/Studio29+-+Festas+e+Eventos/@-9.6201872,-35.7201473,17z/data=!4m6!3m5!1s0x70147a68d86d84f:0x18915ba332182bb1!8m2!3d-9.6201872!4d-35.7201473!16s%2Fg%2F11wn029h_q?entry=ttu"
};

const $ = (s) => document.querySelector(s);

document.addEventListener("DOMContentLoaded", () => {
  const eventName = $("#eventName");
  const maxCompanionsLabel = $("#maxCompanionsLabel");

  if (eventName) {
    eventName.textContent = EVENT.name
      .replace(/^Nilda\s*/i, "")
      .toLowerCase();
  }

  if (maxCompanionsLabel) {
    maxCompanionsLabel.textContent = EVENT.maxCompanions;
  }

  let companionCount = 0;

  function showError(text) {
    const el = $("#formError");

    if (!el) return;

    el.textContent = text;
    el.classList.remove("hidden");
  }

  function clearError() {
    const el = $("#formError");

    if (!el) return;

    el.textContent = "";
    el.classList.add("hidden");
  }

  function renderCompanions() {
    const countEl = $("#companionCount");
    const wrap = $("#companionsWrap");
    const list = $("#companionsList");

    if (countEl) {
      countEl.textContent = companionCount;
    }

    if (wrap) {
      wrap.classList.toggle("hidden", companionCount === 0);
    }

    if (!list) return;

    list.innerHTML = "";

    for (let i = 1; i <= companionCount; i++) {
      const row = document.createElement("div");

      row.className = "companion-card";

      row.innerHTML = `
        <label for="companion-${i}" class="input-label !mt-0">
          Acompanhante ${i}
        </label>

        <input
          id="companion-${i}"
          class="input"
          type="text"
          placeholder="Nome completo"
          autocomplete="off"
          required
        >
      `;

      list.appendChild(row);
    }
  }

  const minusBtn = $("#minusBtn");
  const plusBtn = $("#plusBtn");
  const form = $("#rsvpForm");

  if (minusBtn) {
    minusBtn.addEventListener("click", () => {
      if (companionCount > 0) {
        companionCount--;
        clearError();
        renderCompanions();
      }
    });
  }

  if (plusBtn) {
    plusBtn.addEventListener("click", () => {
      if (companionCount < EVENT.maxCompanions) {
        companionCount++;
        clearError();
        renderCompanions();
      } else {
        showError(
          `O máximo é de ${EVENT.maxCompanions} acompanhantes.`
        );
      }
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      clearError();

      const guestNameInput = $("#guestName");

      if (!guestNameInput) {
        showError("Campo de nome não encontrado.");
        return;
      }

      const guestName = guestNameInput.value.trim();

      if (!guestName) {
        showError("Digite seu nome.");
        guestNameInput.focus();
        return;
      }

      const inputs = [
        ...document.querySelectorAll("#companionsList input")
      ];

      const companions = inputs.map(input =>
        input.value.trim()
      );

      if (companions.some(name => !name)) {
        showError(
          "Preencha o nome de todos os acompanhantes."
        );

        const emptyInput = inputs.find(
          input => !input.value.trim()
        );

        emptyInput?.focus();

        return;
      }

      let companionPart = "e não levarei acompanhantes";

      if (companions.length === 1) {
        companionPart =
          `e levarei como acompanhante ${companions[0]}`;
      }

      if (companions.length > 1) {
        companionPart =
          `e levarei como acompanhantes ${formatNames(companions)}`;
      }

      const message =
        `Eu, ${guestName}, confirmo minha presença no ${EVENT.name} ${companionPart}.`;

      const url =
        `https://wa.me/${EVENT.whatsapp}?text=${encodeURIComponent(message)}`;

      console.log("Mensagem:", message);
      console.log("WhatsApp:", url);

      window.location.href = url;
    });
  }

  function formatNames(names) {
    if (names.length === 1) {
      return names[0];
    }

    if (names.length === 2) {
      return `${names[0]} e ${names[1]}`;
    }

    return `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`;
  }

  renderCompanions();
});