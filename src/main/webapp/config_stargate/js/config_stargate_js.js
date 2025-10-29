 // PopUP de sucesso chamada
    const successModal = document.getElementById("successModal"),
          overlay = successModal.querySelector(".overlay"),
          closeBtn = successModal.querySelector(".close-btn");

    function showSuccessModal() {
      successModal.classList.add("active");
    }

    overlay.addEventListener("click", () => successModal.classList.remove("active"));
    closeBtn.addEventListener("click", () => successModal.classList.remove("active"));


    // PopUP de erro chamada
    const errorModal = document.getElementById("errorModal"),
          errorOverlay = errorModal.querySelector(".overlay"),
          errorCloseBtn = errorModal.querySelector(".close-btn");

    function showErrorModal(message) {
      errorMessage.textContent = message;
      errorModal.classList.add("active");
    }

    errorOverlay.addEventListener("click", () => errorModal.classList.remove("active"));
    errorCloseBtn.addEventListener("click", () => errorModal.classList.remove("active"));


    //Função para mascarar string
    function maskValue(value) {
      if (!value) return "";
      value = String(value);
      return value.substring(0, 4) + "****";
    }

    //Buscar localStorage arrays
    const credentialDefaultObj = JSON.parse(localStorage.getItem('credential_default_stargate'));
    const credential_config_variable = JSON.parse(localStorage.getItem('credential_config_stargate'))
    const default_Configs = JSON.parse(localStorage.getItem('default_stargate'))


    function toggleDefaults(checkbox) {
      const terminal = document.getElementById('terminalId_stargate');
      const client = document.getElementById('clientId_stargate');
      const token = document.getElementById('bearerToken_stargate');

      const inputs = ['inputTerminalId_stargate', 'inputClientId_stargate', 'inputBearerToken_stargate'];

      if(checkbox.checked) {

        terminal.value = credentialDefaultObj.terminalId;
        client.value = credentialDefaultObj.clientId;
        token.value = credentialDefaultObj.bearerToken;
        
        inputs.forEach(id => document.getElementById(id).classList.add('d-none'));
        
      } else {
        terminal.value = '';
        client.value = '';
        token.value = '';

        inputs.forEach(id => document.getElementById(id).classList.remove('d-none'));
      }

    }

    function saveConfig() {
      const useDefault = document.getElementById('defaultToggle').checked;
      const AllMethodsPay = document.getElementById('AllMethodsPay').checked ? 1 : 0;

      let terminal = document.getElementById('terminalId_stargate').value;
      let client = document.getElementById('clientId_stargate').value;
      let token = document.getElementById('bearerToken_stargate').value;

      if (!terminal) {
        showErrorModal("Preencha o campo do Terminal.");
        return;
      }

      if (!client) {
        showErrorModal("Preencha o campo do Client ID.");
        return;
      }

      if (!token) {
        showErrorModal("Preencha o campo do Bearer Token.");
        return;
      }
      
      if (!useDefault && (!terminal || !client || !token)) {
        showErrorModal("Preencha todos os campos obrigatórios.");
        return;
      }

      if(useDefault){
        terminal = credentialDefaultObj.terminalId;
        client = credentialDefaultObj.clientId;
        token = credentialDefaultObj.bearerToken;
      }

      const credential_obj = {
        terminalId: terminal,
        clientId: client,
        bearerToken: token,
        useDefaultConfig: useDefault.toString(),
        AllMethodsPay: AllMethodsPay,
      };

      localStorage.setItem('credential_config_stargate', JSON.stringify(credential_obj));
      localStorage.setItem('default_stargate', '0');

      showSuccessModal();
    }

    function restoreFromLocalStorage() {
      const useDefault = default_Configs;
      const checkbox = document.getElementById('defaultToggle');

      let checkbox_option
      let AllMethodsPay


      if(useDefault == "1"){
        checkbox_option = credentialDefaultObj.useDefaultConfig;
        AllMethodsPay = credentialDefaultObj.AllMethodsPay;
      }else{
        checkbox_option = credential_config_variable.useDefaultConfig;
        AllMethodsPay = credential_config_variable.AllMethodsPay;
      }

      checkbox.checked = checkbox_option === "true" || checkbox_option === true || checkbox_option === 1 || checkbox_option === "1" ;

      toggleDefaults(checkbox);

      if (!useDefault) {
        document.getElementById('terminalId_stargate').value = credential_config_variable.terminalId || '';
        document.getElementById('clientId_stargate').value = credential_config_variable.clientId || '';
        document.getElementById('bearerToken_stargate').value = credential_config_variable.bearerToken || '';
      }

      if (AllMethodsPay == 1) {
        document.getElementById("AllMethodsPay").checked = true;
      } else {
        document.getElementById("AllMethodsPay").checked = false;
      }

    }

    document.querySelectorAll('[data-back-button]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();

        const useDefault = document.getElementById('defaultToggle').checked;
        const terminal = document.getElementById('terminalId_stargate').value;
        const client = document.getElementById('clientId_stargate').value;
        const token = document.getElementById('bearerToken_stargate').value;
      
        const baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');

        window.location.href = window.location.pathname.replace(/[^/]*$/, '') + 'Stargate.html';

      });
    });

    window.addEventListener('DOMContentLoaded', restoreFromLocalStorage);


    document.addEventListener("DOMContentLoaded", async function () {

      let baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, ''); 

      window.addEventListener("popstate", function () {
        baseUrl = "Stargate.html" + novaURL;
      });

    });