(() => {
  const form = document.getElementById("case-create-form");
  if (!form) return;

  const fields = [
    "studentName",
    "email",
    "contactEmail",
    "program",
    "summary",
    "observacionesAsesor",
  ];
  const errors = {
    studentName: "Escribe un nombre de 3 a 100 caracteres, usando solo letras y espacios.",
    email: "Ingresa un correo válido con el dominio institucional.",
    contactEmail: "Ingresa un correo de contacto válido.",
    program: "Selecciona un programa válido.",
    summary: "Escribe una descripción entre 20 y 1000 caracteres.",
    observacionesAsesor: "Las observaciones no pueden superar 500 caracteres.",
  };
  const email = document.getElementById("email");
  const contactEmail = document.getElementById("contactEmail");
  const noInstitutionalEmail = document.getElementById("sinCorreoInstitucional");
  const emailState = document.getElementById("email-state");
  const contactAlternative = document.getElementById("contact-alternative");
  const markersToggle = document.getElementById("markers-toggle");
  const markersPanel = document.getElementById("markers-panel");
  const markers = Array.from(form.querySelectorAll(".marker-checkbox"));
  const markerError = document.getElementById("markers-error");

  function setError(field, message) {
    const output = document.getElementById(`${field.id}-error`);
    output.textContent = message;
    if (message) {
      field.setAttribute("aria-invalid", "true");
      field.classList.add("is-invalid");
    } else {
      field.removeAttribute("aria-invalid");
      field.classList.remove("is-invalid");
    }
  }

  function isValidEmail(value) {
    const [local, domain, extra] = value.trim().toLowerCase().split("@");
    return Boolean(
      value.trim().length <= 254 &&
      local &&
      local.length <= 64 &&
      /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/.test(
        local,
      ) &&
      domain &&
      !extra &&
      /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(
        domain,
      ),
    );
  }

  function validate(field) {
    const value = field.value.trim();
    let message = "";
    if (field.id === "studentName") {
      if (
        value.length < 3 ||
        value.length > 100 ||
        !/^[\p{L}\p{M} ]+$/u.test(value)
      ) {
        message = errors.studentName;
      }
    } else if (field.id === "email" && !noInstitutionalEmail.checked) {
      if (
        !isValidEmail(value) ||
        value.slice(value.lastIndexOf("@") + 1).toLowerCase() !==
          email.dataset.domain
      ) {
        message = `El correo debe ser válido y terminar en @${email.dataset.domain}.`;
      }
    } else if (field.id === "contactEmail" && value && !isValidEmail(value)) {
      message = errors.contactEmail;
    } else if (
      field.id === "program" &&
      !Array.from(field.options).some(
        (option) => option.value === value && value,
      )
    ) {
      message = errors.program;
    } else if (
      field.id === "summary" &&
      (value.length < 20 || value.length > 1000)
    ) {
      message = errors.summary;
    } else if (field.id === "observacionesAsesor" && value.length > 500) {
      message = errors.observacionesAsesor;
    }
    setError(field, message);
    return !message;
  }

  function updateCount(field, output, maximum) {
    output.textContent = `${field.value.length} / ${maximum} caracteres`;
  }

  function updateEmailAvailability(
    clearFeedback = true,
    clearAlternative = true,
    initialize = false,
  ) {
    const unavailable = noInstitutionalEmail.checked;
    email.disabled = unavailable;
    email.required = !unavailable;
    email.value = unavailable ? "" : email.value;
    emailState.textContent = initialize
      ? unavailable
        ? "El caso se registrará sin correo institucional."
        : ""
      : unavailable
        ? "El caso se registrará sin correo institucional."
        : "El correo institucional vuelve a estar disponible.";
    contactAlternative.hidden = !unavailable;
    contactEmail.disabled = !unavailable;
    if (!unavailable && clearAlternative) contactEmail.value = "";
    if (clearFeedback) {
      setError(email, "");
      setError(contactEmail, "");
    }
  }

  function updateMarkersAvailability(clearFeedback = true) {
    markersPanel.hidden = !markersToggle.checked;
    markersToggle.setAttribute("aria-expanded", String(markersToggle.checked));
    markers.forEach((marker) => {
      marker.disabled = !markersToggle.checked;
      if (!markersToggle.checked) marker.checked = false;
    });
    if (clearFeedback) markerError.textContent = "";
  }

  fields.forEach((id) => {
    const field = document.getElementById(id);
    field.addEventListener("blur", () => validate(field));
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") validate(field);
    });
  });
  document.getElementById("summary").addEventListener("input", (event) => {
    updateCount(event.currentTarget, document.getElementById("summary-count"), 1000);
  });
  document
    .getElementById("observacionesAsesor")
    .addEventListener("input", (event) => {
      updateCount(
        event.currentTarget,
        document.getElementById("observacionesAsesor-count"),
        500,
      );
    });
  noInstitutionalEmail.addEventListener("change", updateEmailAvailability);
  markersToggle.addEventListener("change", updateMarkersAvailability);

  form.addEventListener("submit", (event) => {
    const fieldsValid = fields
      .map((id) => validate(document.getElementById(id)))
      .every(Boolean);
    const markersValid =
      !markersToggle.checked || markers.some((marker) => marker.checked);
    markerError.textContent = markersValid
      ? ""
      : "Selecciona al menos un marcador válido o desactiva esta opción.";
    if (!fieldsValid || !markersValid) {
      event.preventDefault();
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      (firstInvalid || markersToggle).focus();
    }
  });

  updateCount(
    document.getElementById("summary"),
    document.getElementById("summary-count"),
    1000,
  );
  updateCount(
    document.getElementById("observacionesAsesor"),
    document.getElementById("observacionesAsesor-count"),
    500,
  );
  updateEmailAvailability(false, false, true);
  updateMarkersAvailability(false);
})();
