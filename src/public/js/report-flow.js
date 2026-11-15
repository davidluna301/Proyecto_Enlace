(() => {
  const root = document.getElementById("report-flow");
  if (!root) return;

  const statusLabels = JSON.parse(root.dataset.statusLabels);
  const urgencyLabels = JSON.parse(root.dataset.urgencyLabels);
  const search = document.getElementById("report-search");
  const results = document.getElementById("report-case-results");
  const searchLoading = document.getElementById("report-search-loading");
  const selectedCaseLabel = document.getElementById("selected-case-label");
  const continueButton = document.getElementById("report-continue");
  const errorMessage = document.getElementById("report-error");
  const announcement = document.getElementById("report-announcement");
  let selectedCase = null;
  let timer;
  let pending;
  let sequence = 0;

  function makeNode(tagName, className, text) {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function updateSelection() {
    results.querySelectorAll("[data-case-id]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        button.dataset.caseId === selectedCase?.id ? "true" : "false",
      );
    });
    continueButton.disabled = !selectedCase;
    selectedCaseLabel.textContent = selectedCase
      ? `Caso seleccionado: ${selectedCase.studentName} · ${selectedCase.id}`
      : "Selecciona un caso para continuar.";
  }

  function renderCases(items, query) {
    results.replaceChildren();
    if (!items.length) {
      const empty = makeNode("div", "report-empty");
      empty.append(
        makeNode(
          "h3",
          "",
          query
            ? "No encontramos coincidencias"
            : "No tienes casos disponibles",
        ),
        makeNode(
          "p",
          "",
          query
            ? "Prueba con otro nombre, correo o identificador."
            : "Registra un caso para poder generar un reporte.",
        ),
      );
      if (!query) {
        const link = makeNode(
          "a",
          "btn btn-primary-action",
          "Registrar un caso",
        );
        link.href = "/casos/nuevo";
        empty.append(link);
      }
      results.append(empty);
      return;
    }

    items.forEach((item) => {
      const button = makeNode("button", "report-case-option");
      button.type = "button";
      button.dataset.caseId = item.id;
      button.dataset.caseName = item.studentName;
      button.dataset.caseProgram = item.program;
      button.dataset.caseStatus = item.status;
      button.dataset.caseUrgency = item.urgency;
      button.setAttribute(
        "aria-pressed",
        item.id === selectedCase?.id ? "true" : "false",
      );
      const top = makeNode("span", "report-case-top");
      top.append(makeNode("span", "case-id", item.id));
      const urgency = makeNode(
        "span",
        `urgency-chip urgency-${item.urgency.toLowerCase()}`,
      );
      const icon = makeNode(
        "span",
        "",
        item.urgency === "ALTA" ? "!" : item.urgency === "MEDIA" ? "◷" : "✓",
      );
      icon.setAttribute("aria-hidden", "true");
      urgency.append(
        icon,
        document.createTextNode(` Urgencia ${urgencyLabels[item.urgency]}`),
      );
      top.append(urgency);
      const status = makeNode(
        "span",
        `status-chip status-${item.status.toLowerCase()}`,
      );
      status.append(
        document.createTextNode(statusLabels[item.status] || item.status),
      );
      button.append(
        top,
        makeNode("strong", "", item.studentName),
        makeNode("span", "", item.program),
        status,
      );
      results.append(button);
    });
  }

  async function searchCases(query) {
    if (pending) pending.abort();
    pending = new AbortController();
    const current = ++sequence;
    searchLoading.hidden = false;
    results.setAttribute("aria-busy", "true");
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      const response = await fetch(`/reportes/casos?${params}`, {
        signal: pending.signal,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("search");
      const data = await response.json();
      if (current !== sequence) return;
      renderCases(data.items, query);
      announcement.textContent = `${data.total} ${data.total === 1 ? "caso encontrado" : "casos encontrados"}.`;
    } catch (error) {
      if (error.name !== "AbortError" && current === sequence) {
        errorMessage.textContent =
          "No pudimos buscar casos. Inténtalo de nuevo o recarga la página.";
        errorMessage.hidden = false;
      }
    } finally {
      if (current === sequence) {
        searchLoading.hidden = true;
        results.removeAttribute("aria-busy");
      }
    }
  }

  results.addEventListener("click", (event) => {
    const button = event.target.closest("[data-case-id]");
    if (!button) return;
    selectedCase = {
      id: button.dataset.caseId,
      studentName: button.dataset.caseName,
      status: button.dataset.caseStatus,
    };
    updateSelection();
  });

  search.addEventListener("input", () => {
    clearTimeout(timer);
    if (pending) pending.abort();
    sequence += 1;
    searchLoading.hidden = false;
    results.setAttribute("aria-busy", "true");
    timer = setTimeout(() => searchCases(search.value.trim()), 275);
  });

  continueButton.addEventListener("click", () => {
    if (!selectedCase) return;
    document.querySelector('[data-step="1"]').hidden = true;
    document.querySelector('[data-step="2"]').hidden = false;
    document.getElementById("report-case-context").textContent =
      `Caso seleccionado: ${selectedCase.studentName} · ${statusLabels[selectedCase.status]}`;
    document.getElementById("report-config-title").focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.querySelector('[data-go-to="1"]').addEventListener("click", () => {
    document.querySelector('[data-step="2"]').hidden = true;
    document.querySelector('[data-step="1"]').hidden = false;
    document.getElementById("report-case-title").focus();
  });
})();
