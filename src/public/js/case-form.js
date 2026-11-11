(() => {
  const form = document.getElementById("case-create-form");
  if (!form) return;
  const summary = document.getElementById("summary");
  const count = document.getElementById("summary-count");
  const markers = Array.from(form.querySelectorAll(".marker-checkbox"));
  const error = document.getElementById("markers-error");
  const updateCount = () => {
    count.textContent = `${summary.value.length} / 1000 caracteres`;
  };
  const updateMarkers = () => {
    const valid = markers.some((marker) => marker.checked);
    markers[0].setCustomValidity(valid ? "" : "Selecciona al menos un marcador.");
    if (valid) error.textContent = "";
    return valid;
  };
  summary.addEventListener("input", updateCount);
  markers.forEach((marker) => marker.addEventListener("change", updateMarkers));
  form.addEventListener("submit", (event) => {
    if (!updateMarkers()) {
      event.preventDefault();
      error.textContent = "Selecciona al menos un marcador.";
      markers[0].reportValidity();
    }
  });
  updateCount();
})();
