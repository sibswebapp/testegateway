window.addEventListener("DOMContentLoaded", () => {
  const prefix = window.location.hostname === '127.0.0.1' ? '' : '/SimuladorSIBS';
  document.getElementById('downloadBtn').href = `${prefix}/download`;
});
