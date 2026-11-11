(() => {
  const form = document.getElementById("case-filters");
  if (!form) return;
  const search = document.getElementById("buscar");
  const status = document.getElementById("estado");
  const program = document.getElementById("programa");
  const results = document.getElementById("case-results");
  const count = document.getElementById("case-count");
  const loading = document.getElementById("filter-loading");
  const error = document.getElementById("filter-error");
  const announcement = document.getElementById("filter-announcement");
  const labels = Object.fromEntries(
    Array.from(status.options, (option) => [option.value, option.textContent]),
  );
  const urgencies = {
    ALTA: [results.dataset.urgencyAlta, "!"],
    MEDIA: [results.dataset.urgencyMedia, "◷"],
    BAJA: [results.dataset.urgencyBaja, "✓"],
  };
  const statuses = Object.fromEntries(
    ["REGISTRADO", "NUEVO", "EN_SEGUIMIENTO", "EN_ESPERA", "CERRADO"].map(
      (status) => [
        status,
        results.dataset[`status-${status.toLowerCase()}`],
      ],
    ),
  );
  const dateFormat = new Intl.DateTimeFormat("es-CO", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Bogota",
  });
  let timer;
  let pending;
  let sequence = 0;

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function card(item) {
    const article = node("article", "case-card");
    const top = node("div", "case-card-top");
    top.append(node("span", "case-id", item.id));
    const urgency = urgencies[item.urgency];
    const chip = node(
      "span",
      `urgency-chip urgency-${item.urgency.toLowerCase()}`,
    );
    const icon = node("span", "", urgency[1]);
    icon.setAttribute("aria-hidden", "true");
    chip.append(icon, document.createTextNode(` Urgencia ${urgency[0]}`));
    top.append(chip);
    const heading = node("h2");
    const link = node("a", "", item.studentName);
    link.href = `/casos/${encodeURIComponent(item.id)}`;
    heading.append(link);
    const footer = node("div", "case-card-footer");
    const time = node(
      "time",
      "",
      dateFormat.format(new Date(item.lastMovement)),
    );
    time.dateTime = item.lastMovement;
    footer.append(node("span", "", "Último movimiento"), time);
    const statusChip = node(
      "span",
      `status-chip status-${item.status.toLowerCase()}`,
    );
    const statusIcon = node("span", "", statuses[item.status]);
    statusIcon.setAttribute("aria-hidden", "true");
    statusChip.append(statusIcon, document.createTextNode(labels[item.status]));
    const markers = Array.isArray(item.markers) ? item.markers : [];
    article.append(
      top,
      heading,
      node("p", "case-program", item.program),
      statusChip,
      ...(item.tieneCorreoInstitucional === false
        ? [node("span", "contact-status-chip", "Sin correo institucional")]
        : []),
      ...(markers.length
        ? []
        : [node("p", "neutral-case-note", "Sin marcadores registrados")]),
      node("p", "case-summary", item.summary),
      footer,
    );
    return article;
  }

  function render(items, total) {
    count.textContent = `${total} ${total === 1 ? "caso" : "casos"}`;
    announcement.textContent = `${total} ${total === 1 ? "caso encontrado" : "casos encontrados"}.`;
    if (items.length) {
      const grid = node("div", "case-grid mt-4");
      items.forEach((item) => grid.append(card(item)));
      results.replaceChildren(grid);
      return;
    }
    const empty = node("section", "empty-state mt-4");
    empty.setAttribute("aria-labelledby", "empty-title");
    const icon = node("span", "empty-mark", "⌕");
    icon.setAttribute("aria-hidden", "true");
    const heading = node("h2", "", "No encontramos casos con esos filtros");
    heading.id = "empty-title";
    const link = node("a", "btn btn-primary-action", "Ver todos los casos");
    link.href = "/casos";
    empty.append(
      icon,
      heading,
      node(
        "p",
        "",
        "Prueba con otro nombre, identificador o estado. Si buscabas empezar de nuevo, puedes ver todos los casos.",
      ),
      link,
    );
    results.replaceChildren(empty);
  }

  async function update(changeUrl = true) {
    clearTimeout(timer);
    if (pending) pending.abort();
    pending = new AbortController();
    const current = ++sequence;
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form))
      if (value) params.set(key, value);
    const query = params.toString();
    if (changeUrl)
      history.replaceState(null, "", `/casos${query ? `?${query}` : ""}`);
    loading.hidden = false;
    error.hidden = true;
    results.setAttribute("aria-busy", "true");
    try {
      const response = await fetch(`/casos/data${query ? `?${query}` : ""}`, {
        signal: pending.signal,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (current === sequence) render(data.items, data.total);
    } catch (err) {
      if (err.name !== "AbortError" && current === sequence) {
        error.textContent =
          "No pudimos actualizar los casos. Inténtalo de nuevo o recarga la página.";
        error.hidden = false;
      }
    } finally {
      if (current === sequence) {
        loading.hidden = true;
        results.removeAttribute("aria-busy");
      }
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    update();
  });
  search.addEventListener("input", () => {
    clearTimeout(timer);
    if (pending) pending.abort();
    sequence++;
    loading.hidden = false;
    results.setAttribute("aria-busy", "true");
    timer = setTimeout(update, 275);
  });
  status.addEventListener("change", () => update());
  program.addEventListener("change", () => update());
  document
    .getElementById("clear-filters")
    .addEventListener("click", (event) => {
      event.preventDefault();
      form.reset();
      search.value = "";
      status.value = "";
      program.value = "";
      update();
    });
  window.addEventListener("popstate", () => {
    const params = new URLSearchParams(location.search);
    search.value = params.get("q") || "";
    status.value = params.get("estado") || "";
    program.value = params.get("carrera") || "";
    update(false);
  });
})();
