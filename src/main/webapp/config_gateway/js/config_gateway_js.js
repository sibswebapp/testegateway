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
    const credentialDefaultObj = JSON.parse(localStorage.getItem('credential_default'));
    const credential_config_variable = JSON.parse(localStorage.getItem('credential_config'))
    const default_Configs = JSON.parse(localStorage.getItem('default'))
    

    function getSelectedPaymentMethods() {
      let selectedOptions = Array.from(document.getElementById("paymentMethods").selectedOptions)
                                .map(opt => opt.value);

      if (selectedOptions.length === 0) {
        if (credential_config_variable && credential_config_variable.paymentMethods && credential_config_variable.paymentMethods.length > 0) {
          try {
            selectedOptions = JSON.parse(credential_config_variable.paymentMethods);
          } catch (e) {
            selectedOptions = credential_config_variable.paymentMethods;
          }
        } else {
          selectedOptions = credential_default_variable.paymentMethods;
        }
      }

      return selectedOptions;
    }

    // handler para os vários métodos de pagamento
    function handlePaymentMethodChange() {
      const selectedOptions = getSelectedPaymentMethods();

      const hasCardSelected = selectedOptions.includes("3") || selectedOptions.includes("CARD");
      const hasMultibancoSelected = selectedOptions.includes("2") || selectedOptions.includes("REFERENCE");
      const terminalDefault = document.getElementById("defaultToggle").checked;

      const toggleContainer = document.getElementById("dummyCustomerToggleContainer");
      const inputEntity = document.getElementById("inputEntity");
      const inputReferenceExpiry = document.getElementById("inputReferenceExpiry");

      toggleContainer.style.display = hasCardSelected ? "block" : "none";

      if (hasMultibancoSelected && !terminalDefault) {
        inputEntity.classList.remove("d-none");
      } else {
        inputEntity.classList.add("d-none");
      }

      if (hasMultibancoSelected) {
        inputReferenceExpiry.classList.remove("d-none");
      } else {
        inputReferenceExpiry.classList.add("d-none");
      }
    }

    // Para selecionar a checkbox do server to server
    function toggleServerToServer(element) {
      const ServerToServer = element.checked ? 1 : 0;

      const paymentMethodsSelect = document.getElementById("paymentMethods");
      const options = paymentMethodsSelect.options;

      for (let i = 0; i < options.length; i++) {
        const option = options[i];

        if (option.value === "3") {
          option.style.display = ServerToServer === 1 ? "none" : "block";

          if (ServerToServer === 1 && option.selected) {
            option.selected = false;
            paymentMethodsSelect.selectedIndex = 0;
          }
        }
      }

      handlePaymentMethodChange();
    }

    //Função caso ele selecione a opção de todos os metodos de pagamento
    function toggleAllMethodsPay(element) {
      const CheckAllMethodsPay = element.checked ? 1 : 0;
      const paymentMethodsContainer = document.getElementById("paymentMethodsContainer");
      const paymentMethodsLabels = document.getElementById("paymentMethodsLabels");
      const paymentMethodsText = document.getElementById("paymentMethodsText");

      if (CheckAllMethodsPay) {
        paymentMethodsContainer.style.display = "none";
        paymentMethodsLabels.style.display = "none";
        paymentMethodsText.style.display = "none";

        document.getElementById("dummyCustomerToggleContainer").style.display = "none";
        document.getElementById("ServerToServerContainer").style.display = "none";
        inputReferenceExpiry.classList.remove("d-none");

      } else {
        paymentMethodsContainer.style.display = "block";
        paymentMethodsLabels.style.display = "block";
        paymentMethodsText.style.display = "block";
        paymentMethods.style.display = "block";

        document.getElementById("dummyCustomerToggleContainer").style.display = "block";
        document.getElementById("ServerToServerContainer").style.display = "block";
        handlePaymentMethodChange();
      }
    }

    function toggleAllMethodsPayRestored(AllMethodsPay) {
      
      const checkbox = document.getElementById("AllMethodsPay");
      const paymentContainer = document.getElementById("paymentMethodsContainer");
      const paymentMethodsLabels = document.getElementById("paymentMethodsLabels");
      const paymentMethodsText = document.getElementById("paymentMethodsText");

      if (AllMethodsPay == 1) {
        checkbox.checked = true;
        paymentContainer.style.display = "none";
        paymentMethodsLabels.style.display = "none";
        paymentMethodsText.style.display = "none";
        document.getElementById("dummyCustomerToggleContainer").style.display = "none";
        document.getElementById("ServerToServerContainer").style.display = "none";
        inputReferenceExpiry.classList.remove("d-none");
      } else {
        checkbox.checked = false;
        paymentContainer.style.display = "block";
        paymentMethodsLabels.style.display = "block";
        paymentMethodsText.style.display = "block";
        document.getElementById("dummyCustomerToggleContainer").style.display = "block";
        document.getElementById("ServerToServerContainer").style.display = "block";
        handlePaymentMethodChange();
      }
    }


    // Para selecionar a checkbox do Customer info personalizado
    function toggleDummyCustomer(element) {
      isDummyCustomer = element.checked ? 1 : 0;
      localStorage.setItem('isDummyCustomer', isDummyCustomer.toString());
    }

    window.addEventListener('DOMContentLoaded', () => {

      const storedDummy = localStorage.getItem('isDummyCustomer');
      if (storedDummy !== null) {
        isDummyCustomer = parseInt(storedDummy);
        const checkbox = document.getElementById('dummyCustomerToggle');
        if (checkbox) checkbox.checked = isDummyCustomer === 1;
      }

      const storedServerToServer = localStorage.getItem('ServerToServer');
      if (storedServerToServer !== null) {
        ServerToServer = parseInt(storedServerToServer);
        const checkbox = document.getElementById('ServerToServerCheckbox');
        if (checkbox) checkbox.checked = ServerToServer === 1;
      }
    });

    //Opções default
    function toggleDefaults(checkbox) {
      const terminal = document.getElementById('terminalId');
      const client = document.getElementById('clientId');
      const token = document.getElementById('bearerToken');
      const entitypag = document.getElementById('entity');

      const inputs = ['inputTerminalId', 'inputClientId', 'inputBearerToken', 'inputEntity'];

      if(checkbox.checked) {

        terminal.value = credentialDefaultObj.terminalId;
        client.value = credentialDefaultObj.clientId;
        token.value = credentialDefaultObj.bearerToken;
        entitypag.value = credentialDefaultObj.entity;
        
        inputs.forEach(id => document.getElementById(id).classList.add('d-none'));
        
      } else {
        terminal.value = '';
        client.value = '';
        token.value = '';
        entitypag.value = '';

        inputs.forEach(id => document.getElementById(id).classList.remove('d-none'));
      }
    }

    //Na mudança de estados do checkout
    function toggleEntityField() {
      const select = document.getElementById('paymentMethods');
      const entityInput = document.getElementById('inputEntity');
      const useDefault = document.getElementById('defaultToggle').checked;

      const selectedValues = Array.from(select.selectedOptions).map(opt => opt.value);
      const showEntity = selectedValues.includes('2') && !useDefault;

      const isDummyCustomer = parseInt(credential_config_variable.isDummyCustomer || '0');
      
      document.getElementById('dummyCustomerToggle').checked = isDummyCustomer === 1;
      entityInput.classList.toggle('d-none', !showEntity);
    }

    //Salvar opções
    function saveConfig() {
      const useDefault = document.getElementById('defaultToggle').checked;
      let terminal = document.getElementById('terminalId').value;
      let client = document.getElementById('clientId').value;
      let token = document.getElementById('bearerToken').value;
      let entity = document.getElementById('entity').value;

      let referenceExpiry = document.getElementById("referenceExpiry").value.trim();
      let referenceExpiryUnit = document.getElementById("referenceExpiryUnit").value;
      let isDummyCustomer = document.getElementById('dummyCustomerToggle').checked ? 1 : 0;
      let ServerToServer = document.getElementById('ServerToServerCheckbox').checked ? 1 : 0;
      let gatewayVersion = document.getElementById("gatewayVersion").value;
      let LayoutVersion = document.getElementById("LayoutVersion").value;
      let MITs = document.getElementById('MITs').checked ? 1 : 0;
      let VersionMITS = document.getElementById('VersionMITS').value;


      const methods = Array.from(document.getElementById('paymentMethods').selectedOptions).map(opt => opt.value);
      const AllMethodsPay = document.getElementById('AllMethodsPay').checked ? 1 : 0;

      if(useDefault){
        terminal = credentialDefaultObj.terminalId;
        client = credentialDefaultObj.clientId;
        token = credentialDefaultObj.bearerToken;
        entity = credentialDefaultObj.entity;
      }
      
      if (!useDefault && (!terminal || !client || !token || methods.length === 0)) {
        showErrorModal("Preencha todos os campos obrigatórios.")
        return;
      }

      if (!useDefault && methods.includes('2') && !entity) {
        showErrorModal("Preencha a Entidade de pagamento para o método de Multibanco.");
        return;
      }
      
      if ((methods.includes('2') || AllMethodsPay) && referenceExpiry === "") {
        showErrorModal("Preencha a data de expiração para o método de Multibanco.");
        return;
      }

      if(AllMethodsPay){
        isDummyCustomer = 0;
        ServerToServer = 0;
      }

      if(!methods.includes('2') && !AllMethodsPay){
        entity = "";
        referenceExpiry = "";
        referenceExpiryUnit = "days";
      }

      const credential_obj = {
        terminalId: terminal,
        entity: entity,
        clientId: client,
        bearerToken: token,
        paymentMethods:JSON.stringify(methods),
        referenceExpiry: referenceExpiry,
        referenceExpiryUnit: referenceExpiryUnit,
        useDefaultConfig: useDefault.toString(),
        isDummyCustomer: isDummyCustomer.toString(),
        ServerToServer: ServerToServer.toString(),
        AllMethodsPay: AllMethodsPay,
        gatewayVersion: gatewayVersion,
        LayoutVersion: LayoutVersion,
        MITs: MITs,
        VersionMITS: VersionMITS
      };

      localStorage.setItem('credential_config', JSON.stringify(credential_obj));
      localStorage.setItem('default', '0');

      showSuccessModal();

    }

    //Ao abrir a pagina ele vai buscar ao LocalStorage as opções certas
    function restoreFromLocalStorage() {
      const useDefault = default_Configs;
      const checkbox = document.getElementById('defaultToggle');

      let checkbox_option
      let savedMethods
      let AllMethodsPay
      let referenceExpiry
      let referenceExpiryUnit
      let ServerToServer
      let gatewayVersion
      let LayoutVersion
      let MITs
      let VersionMITS
    
      if(useDefault == "1"){
        checkbox_option = credentialDefaultObj.useDefaultConfig;
        savedMethods = credentialDefaultObj.paymentMethods;
        AllMethodsPay = credentialDefaultObj.AllMethodsPay;
        referenceExpiry = credentialDefaultObj.referenceExpiry;
        referenceExpiryUnit = credentialDefaultObj.referenceExpiryUnit;
        ServerToServer = credentialDefaultObj.ServerToServer;
        gatewayVersion = credentialDefaultObj.gatewayVersion;
        LayoutVersion = credentialDefaultObj.LayoutVersion;
        MITs = credentialDefaultObj.MITs;
        VersionMITS = credentialDefaultObj.VersionMITS;

      }else{
        checkbox_option = credential_config_variable.useDefaultConfig;
        savedMethods = credential_config_variable.paymentMethods;
        AllMethodsPay = credential_config_variable.AllMethodsPay;
        referenceExpiry = credential_config_variable.referenceExpiry;
        referenceExpiryUnit = credential_config_variable.referenceExpiryUnit;
        ServerToServer = credential_config_variable.ServerToServer;
        gatewayVersion = credential_config_variable.gatewayVersion;
        LayoutVersion = credential_config_variable.LayoutVersion;
        MITs = credential_config_variable.MITs;
        VersionMITS = credential_config_variable.VersionMITS;

      }

      checkbox.checked = checkbox_option === "true" || checkbox_option === true || checkbox_option === 1 || checkbox_option === "1" ;

      toggleDefaults(checkbox);

      if (!useDefault) {
        document.getElementById('terminalId').value = credential_config_variable.terminalId || '';
        document.getElementById('clientId').value = credential_config_variable.clientId || '';
        document.getElementById('bearerToken').value = credential_config_variable.bearerToken || '';
        document.getElementById('entity').value = credential_config_variable.entity || '';
        document.getElementById('referenceExpiry').value = credential_config_variable.referenceExpiry;
        document.getElementById('referenceExpiryUnit').value = credential_config_variable.referenceExpiryUnit;
        document.getElementById('gatewayVersion').value = credential_config_variable.gatewayVersion;
        document.getElementById('LayoutVersion').value = credential_config_variable.LayoutVersion;
        document.getElementById('MITs').value = credential_config_variable.MITs;
        document.getElementById('VersionMITS').value = credential_config_variable.VersionMITS;

      }

      if(useDefault){
        document.getElementById('referenceExpiry').value = credentialDefaultObj.referenceExpiry;
        document.getElementById('referenceExpiryUnit').value = credentialDefaultObj.referenceExpiryUnit;
      }

      document.getElementById("LayoutVersionMITS").style.display = "block";

      if (MITs == "1") {
        document.getElementById('MITs').checked = true;
      } else {
        document.getElementById('MITs').checked = false;
        document.getElementById("LayoutVersionMITS").style.display = "none";
      }

      const select = document.getElementById('paymentMethods');
      Array.from(select.options).forEach(opt => {
        opt.selected = savedMethods.includes(opt.value);
      });

      toggleEntityField();
      handlePaymentMethodChange();
      toggleAllMethodsPayRestored(AllMethodsPay);
      toggleMITS();
    }

    // Caso clicar no botão de voltar para tras, ele valida alguns pontos
    document.querySelectorAll('[data-back-button]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();

        const useDefault = document.getElementById('defaultToggle').checked;
        const terminal = document.getElementById('terminalId').value;
        const client = document.getElementById('clientId').value;
        const token = document.getElementById('bearerToken').value;
        const entity = document.getElementById('entity').value;
        const methods = Array.from(document.getElementById('paymentMethods').selectedOptions).map(opt => opt.value);
        const isDummyCustomer = parseInt(credential_config_variable.isDummyCustomer);
        const ServerToServer = parseInt(credential_config_variable.ServerToServer);

        const baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
        window.location.href = baseUrl + 'index.html';

      });
    });

    window.addEventListener("DOMContentLoaded", () => {
      const checkbox = document.getElementById("ServerToServerCheckbox");
      if (!checkbox) return;

      const storedServerToServer = parseInt(credential_config_variable.ServerToServer, 10) || 0;
      checkbox.checked = storedServerToServer === 1;

      toggleServerToServer(checkbox);
    });

    window.addEventListener('DOMContentLoaded', restoreFromLocalStorage);

     //Função caso ele selecionar as MITs irá aparecer a checkbox
    function toggleMITS(element) {
      const paymentMethodsContainer = document.getElementById("LayoutVersionMITS");
      paymentMethodsContainer.style.display = element.checked ? "block" : "none";
    }