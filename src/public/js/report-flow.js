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
  const confirmation = document.getElementById("report-confirmation");
  const reviewed = document.getElementById("report-reviewed");
  const confirmButton = document.getElementById("confirm-download");
  const downloadStatus = document.getElementById("report-download-status");
  const dateFormat = new Intl.DateTimeFormat("es-CO", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Bogota",
  });
  let selectedCase = null;
  let timer;
  let pending;
  let sequence = 0;
  let caseSequence = 0;
  let confirmationTrigger;

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
    document.getElementById("preview-count").textContent =
      `Se incluirán ${activeCount} de ${sections.length} secciones.`;
    emptySelectionWarning.hidden = activeCount > 0;
    document.getElementById("toggle-all-sections").textContent =
      activeCount === sections.length ? "Desmarcar todas" : "Marcar todas";
  }

  function activeSectionIds() {
    return Array.from(document.querySelectorAll("[data-section-id]"))
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.dataset.sectionId);
  }

  function sectionText(sectionId) {
    switch (sectionId) {
      case "DATOS_ESTUDIANTE":
        return [
          `Nombre: ${selectedCase.studentName}`,
          selectedCase.email
            ? `Correo institucional: ${selectedCase.email}`
            : "Sin correo institucional",
          `Carrera: ${selectedCase.program}`,
        ];
      case "DESCRIPCION_CASO":
        return [selectedCase.summary];
      case "MARCADORES_CRITICOS":
        return selectedCase.markers.length
          ? selectedCase.markers.flatMap((group) => [
              `${group.name}:`,
              ...group.items.map((item) => `- ${item}`),
            ])
          : ["Sin marcadores registrados."];
      case "OBSERVACIONES_ASESOR":
        return [
          selectedCase.observacionesAsesor ||
            "No hay observaciones registradas.",
        ];
      case "ESTADO_URGENCIA":
        return [
          `Estado: ${statusLabels[selectedCase.status]}`,
          `Urgencia: ${urgencyLabels[selectedCase.urgency]}`,
        ];
      case "FECHAS_CLAVE":
        return [
          `Creación: ${dateFormat.format(new Date(selectedCase.createdAt))}`,
          `Último movimiento: ${dateFormat.format(new Date(selectedCase.lastMovement))}`,
        ];
      case "LINEA_TIEMPO":
        return selectedCase.events.length
          ? selectedCase.events.flatMap((item) => [
              `${dateFormat.format(new Date(item.date))} - ${item.type}`,
              item.description,
              "",
            ])
          : ["No hay eventos registrados."];
      default:
        return [];
    }
  }

  function renderPreview() {
    const preview = document.getElementById("preview-sections");
    preview.replaceChildren();
    const selectedIds = new Set(activeSectionIds());
    sections.forEach((section) => {
      const included = selectedIds.has(section.id);
      const block = makeNode(
        "section",
        `report-preview-section${included ? "" : " is-excluded"}`,
      );
      block.setAttribute("aria-describedby", `preview-state-${section.id}`);
      const label = makeNode("label", "report-preview-toggle");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = included;
      checkbox.setAttribute("aria-label", `Incluir ${section.nombre}`);
      checkbox.addEventListener("change", () => {
        document.querySelector(`[data-section-id="${section.id}"]`).checked =
          checkbox.checked;
        updateSectionCount();
        renderPreview();
      });
      label.append(checkbox, document.createTextNode(section.nombre));
      const state = makeNode(
        "span",
        "report-preview-state",
        included ? "Se incluirá" : "No se incluirá (excluido)",
      );
      state.id = `preview-state-${section.id}`;
      const heading = makeNode("h4", "", section.nombre);
      const content = makeNode("div", "report-preview-content");
      sectionText(section.id).forEach((line) => {
        content.append(makeNode(line ? "p" : "div", "", line));
      });
      block.append(label, state, heading, content);
      preview.append(block);
    });
  }

  function openConfirmation() {
    const included = document.getElementById("confirmation-included");
    const excluded = document.getElementById("confirmation-excluded");
    const excludedContainer = document.getElementById(
      "confirmation-excluded-container",
    );
    const activeIds = new Set(activeSectionIds());
    included.replaceChildren();
    excluded.replaceChildren();
    sections.forEach((section) => {
      const item = makeNode("li", "", section.nombre);
      (activeIds.has(section.id) ? included : excluded).append(item);
    });
    if (!activeIds.size) included.append(makeNode("li", "", "Ninguna"));
    excludedContainer.hidden = excluded.childElementCount === 0;
    reviewed.checked = false;
    confirmButton.disabled = true;
    confirmationTrigger = document.activeElement;
    confirmation.showModal();
    reviewed.focus();
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

  results.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-case-id]");
    if (!button) return;
    selectedCase = {
      id: button.dataset.caseId,
      studentName: button.dataset.caseName,
      status: button.dataset.caseStatus,
    };
    const current = ++caseSequence;
    continueButton.disabled = true;
    selectedCaseLabel.textContent = "Cargando los datos del caso…";
    updateSelection();
    try {
      const response = await fetch(
        `/reportes/casos/${encodeURIComponent(selectedCase.id)}`,
        { headers: { Accept: "application/json" } },
      );
      if (!response.ok) throw new Error("case");
      const details = await response.json();
      if (current !== caseSequence) return;
      selectedCase = details;
      updateSelection();
    } catch {
      if (current !== caseSequence) return;
      continueButton.disabled = true;
      selectedCaseLabel.textContent =
        "No pudimos cargar el caso. Vuelve a seleccionarlo.";
      errorMessage.textContent =
        "No pudimos cargar ese caso. Inténtalo de nuevo.";
      errorMessage.hidden = false;
    }
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
      const target = Number(button.dataset.goTo);
      if (target === 3 && !selectedCase?.events) return;
      if (target === 3) {
        document.getElementById("preview-generated-date").textContent =
          `Generado el ${dateFormat.format(new Date())}`;
        document.getElementById("preview-case-heading").textContent =
          `Vista previa del caso: ${selectedCase.studentName} · ${selectedCase.id}`;
        updateSectionCount();
        renderPreview();
      }
      goToStep(target);
    });
  });

  document
    .getElementById("open-confirmation")
    .addEventListener("click", openConfirmation);
  document
    .getElementById("cancel-confirmation")
    .addEventListener("click", () => confirmation.close());
  confirmation.addEventListener("close", () => {
    if (confirmationTrigger instanceof HTMLElement) confirmationTrigger.focus();
  });
  confirmation.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      confirmation.close();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      confirmation.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.hidden);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  reviewed.addEventListener("change", () => {
    confirmButton.disabled = !reviewed.checked;
  });
  confirmButton.addEventListener("click", async () => {
    let fileHandle;
    confirmButton.disabled = true;
    if (typeof window.showSaveFilePicker === "function") {
      try {
        fileHandle = await window.showSaveFilePicker({
          suggestedName: suggestedFilename(),
          types: [
            {
              description: "Documento PDF",
              accept: { "application/pdf": [".pdf"] },
            },
          ],
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          errorMessage.textContent =
            "No pudimos abrir el selector de archivos. Inténtalo de nuevo.";
          errorMessage.hidden = false;
        }
        confirmButton.disabled = !reviewed.checked;
        return;
      }
    }

    confirmButton.textContent = "Generando reporte…";
    downloadStatus.textContent = "Generando el PDF…";
    downloadStatus.hidden = false;
    errorMessage.hidden = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(
        `/reportes/${encodeURIComponent(selectedCase.id)}/pdf`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/pdf",
          },
          signal: controller.signal,
          body: JSON.stringify({
            confirmado: true,
            secciones: activeSectionIds(),
          }),
        },
      );
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "No pudimos generar el reporte.");
      }
      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") || "";
      const filename =
        disposition.match(/filename="([^"]+)"/)?.[1] || suggestedFilename();
      if (fileHandle) {
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else {
        const url = URL.createObjectURL(blob);
        const link = makeNode("a");
        link.href = url;
        link.download = filename;
        document.body.append(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      confirmation.close();
      downloadStatus.textContent = "El reporte se descargó correctamente.";
      announcement.textContent = "El reporte se descargó correctamente.";
    } catch (error) {
      errorMessage.textContent =
        error.name === "AbortError"
          ? "La generación tardó demasiado. Inténtalo de nuevo."
          : error.message ||
            "No pudimos generar el reporte. Inténtalo de nuevo.";
      errorMessage.hidden = false;
      downloadStatus.hidden = true;
    } finally {
      window.clearTimeout(timeout);
      confirmButton.textContent = "Confirmar y descargar";
      confirmButton.disabled = !reviewed.checked;
    }
  });

  function suggestedFilename() {
    const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `reporte-${selectedCase.id.replace(/[^A-Za-z0-9-]/g, "")}-${day}.pdf`;
  }

  updateSectionCount();
})();
