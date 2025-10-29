function initPopups() {

  // Pega os elementos após o layout estar no DOM
  const successModal = document.getElementById("successModal");
  const overlay = successModal.querySelector(".overlay");
  const closeBtn = successModal.querySelector(".close-btn");

  const errorModal = document.getElementById("errorModal");
  const errorOverlay = errorModal.querySelector(".overlay");
  const errorCloseBtn = errorModal.querySelector(".close-btn");

  // Funções globais para outros scripts chamarem
  window.showSuccessModal = function() {
    successModal.classList.add("active");
  };

  window.showErrorModal = function() {
    errorModal.classList.add("active");
  };

  // Listeners para fechar
  overlay.addEventListener("click", () => successModal.classList.remove("active"));
  closeBtn.addEventListener("click", () => successModal.classList.remove("active"));

  errorOverlay.addEventListener("click", () => errorModal.classList.remove("active"));
  errorCloseBtn.addEventListener("click", () => errorModal.classList.remove("active"));
}

fetch("/popups/popups_layout.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("popups").innerHTML = html;
    initPopups(); // chama aqui
  });