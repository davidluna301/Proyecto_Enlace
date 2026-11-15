(() => {
  const root = document.getElementById("report-flow");
  if (!root) return;

  const statusLabels = JSON.parse(root.dataset.statusLabels);
  const urgencyLabels = JSON.parse(root.dataset.urgencyLabels);
  const sections = JSON.parse(root.dataset.sections);
  const search = document.getElementById("report-search");
  const results = document.getElementById("report-case-results");
  const searchLoading = document.getElementById("report-search-loading");
  const selectedCaseLabel = document.getElementById("selected-case-label");
  const continueButton = document.getElementById("report-continue");
  const errorMessage = document.getElementById("report-error");
  const announcement = document.getElementById("report-announcement");
  const configCount = document.getElementById("configuration-count");
  const emptySelectionWarning = document.getElementById(
    "empty-selection-warning",
  );
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

  function goToStep(stepNumber) {
    document.querySelectorAll("[data-step]").forEach((panel) => {
      panel.hidden = Number(panel.dataset.step) !== stepNumber;
    });
    document.querySelectorAll("[data-step-indicator]").forEach((step) => {
      const current = Number(step.dataset.stepIndicator) === stepNumber;
      step.classList.toggle("is-current", current);
      if (current) step.setAttribute("aria-current", "step");
      else step.removeAttribute("aria-current");
    });
    document
      .querySelector(`[data-step="${stepNumber}"] h2`)
      .focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateSectionCount() {
    const activeCount = document.querySelectorAll(
      "[data-section-id]:checked",
    ).length;
    configCount.textContent = `Se incluirán ${activeCount} de ${sections.length} secciones.`;
    emptySelectionWarning.hidden = activeCount > 0;
    document.getElementById("toggle-all-sections").textContent =
      activeCount === sections.length ? "Desmarcar todas" : "Marcar todas";
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
    document.getElementById("report-case-context").textContent =
      `${selectedCase.studentName} · ${selectedCase.id} · ${statusLabels[selectedCase.status]}`;
    goToStep(2);
  });

  document.querySelectorAll("[data-section-id]").forEach((checkbox) => {
    checkbox.addEventListener("change", updateSectionCount);
  });

  document
    .getElementById("toggle-all-sections")
    .addEventListener("click", () => {
      const checkboxes = Array.from(
        document.querySelectorAll("[data-section-id]"),
      );
      const shouldCheck = checkboxes.some((checkbox) => !checkbox.checked);
      checkboxes.forEach((checkbox) => {
        checkbox.checked = shouldCheck;
      });
      updateSectionCount();
    });

  document.querySelectorAll("[data-go-to]").forEach((button) => {
    button.addEventListener("click", () => {
      goToStep(Number(button.dataset.goTo));
    });
  });

  updateSectionCount();
})();
