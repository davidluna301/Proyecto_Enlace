(() => {
  const form = document.getElementById("case-create-form");
  if (!form) return;
  const summary = document.getElementById("summary");
  const count = document.getElementById("summary-count");
  const markers = Array.from(form.querySelectorAll(".marker-checkbox"));
  const error = document.getElementById("markers-error");
  const messages = {
    studentName: "Escribe un nombre entre 3 y 100 caracteres.",
    email: "Ingresa un correo válido terminado en @campusucc.edu.co.",
    program: "Selecciona un programa válido.",
    summary: "Escribe una descripción entre 20 y 1000 caracteres.",
  };
  for (const [name, message] of Object.entries(messages)) {
    const field = document.getElementById(name);
    const output = document.getElementById(`${name}-error`);
    field.addEventListener("invalid", () => {
      output.textContent = message;
      field.setAttribute("aria-invalid", "true");
    });
    field.addEventListener("input", () => {
      if (field.validity.valid) {
        output.textContent = "";
        field.removeAttribute("aria-invalid");
      }
    });
  }
  const updateCount = () => {
    count.textContent = `${summary.value.length} / 1000 caracteres`;
  };
  const updateMarkers = () => {
    const valid = markers.some((marker) => marker.checked);
    markers[0].setCustomValidity(
      valid ? "" : "Selecciona al menos un marcador.",
    );
    if (valid) error.textContent = "";
    return valid;
  };
  summary.addEventListener("input", updateCount);
  markers.forEach((marker) => marker.addEventListener("change", updateMarkers));
  markers[0].addEventListener("invalid", () => {
    error.textContent = "Selecciona al menos un marcador.";
  });
  form.addEventListener("submit", (event) => {
    if (!updateMarkers()) {
      event.preventDefault();
      error.textContent = "Selecciona al menos un marcador.";
      markers[0].reportValidity();
    }
  });
  updateCount();
  updateMarkers();
})();
