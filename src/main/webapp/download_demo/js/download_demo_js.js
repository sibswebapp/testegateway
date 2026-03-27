window.addEventListener("DOMContentLoaded", () => {
  const basePath = window.location.pathname.split('/')[1];
  const prefix = basePath === 'SimuladorSIBS' ? '/SimuladorSIBS' : '';
  document.getElementById('downloadBtn').href = `${prefix}/download`;
});
