export const extractDataFromGO = `
  document.body.style.backgroundColor = 'red';
  setTimeout(function() {
    const iframe = document.querySelector('.iframe-danfe-nfce');
    if (iframe) {
      location.href = iframe.src
    } else {
      merchantName = document.querySelector('#u20').textContent.replace(/\s+/g, ' ').trim();
      cnpj = document.querySelector('.text').textContent.replace('CNPJ:', '').replace(/\s+/g, '').trim();
      merchantAddress = document.querySelector('.text').nextElementSibling.textContent
        .replace(/\s*,\s*/g, ', ')
        .trim();
    

      values = document.querySelectorAll('#totalNota .totalNumb')
      totalItems = parseFloat(values[0].textContent.replace(',', '.'));

      const discountLabel = 'Descontos R$:';
      const discountElement = Array.from(document.querySelectorAll('#totalNota label')).find(element => element.textContent.trim() === discountLabel);
      let subtotal = 0;
      let discount = 0;
      if (discountElement) {
        subtotal = parseFloat(values[1].textContent.replace(',', '.'));
        discount = parseFloat(discountElement.nextElementSibling.textContent.replace(',', '.'));
      }

      total = parseFloat(document.querySelector('#totalNota .totalNumb.txtMax').textContent.replace(',', '.'));
      let taxesElement = document.querySelector('#totalNota .totalNumb.txtObs');
      let taxes = 0;
      if (taxesElement) {
        taxes = taxesElement.textContent.replace(',', '.');
        taxes = parseFloat(taxes);
      
        if (isNaN(taxes)) {
          taxes = 0;
        }
      } 

      const paymentValueElements = Array.from(document.querySelectorAll('#linhaTotal span.totalNumb'));
      const totalIndex = paymentValueElements.findIndex(element => element.classList.contains('txtMax'));
      const taxesIndex = paymentValueElements.findIndex(element => element.classList.contains('txtObs'));
      const paymentMethodElements = Array.from(document.querySelectorAll('#linhaTotal label.tx'));
      const payments = paymentMethodElements.map((element, index) => {
        const type = element.textContent.trim();
        const value = parseFloat(paymentValueElements[totalIndex + index + 1].textContent.replace(',', '.'));
        if (type === 'Troco' && (isNaN(value) || value === 0)) {
          return null;
        }
        return {
          type,
          value,
        };
      }).filter(payment => payment !== null);

      let date = Array.from(document.querySelectorAll('strong')).find(el => el.outerText === ' Emissão: ').nextSibling.textContent.trim(); 
      date = date.substring(0, ("00/00/0000 00:00:00-00:00").length);
      date = date.replace(/\\n/g, '').trim();

      result = {
        merchantName,
        cnpj,
        merchantAddress,
        totalItems,
        subtotal,
        discount,
        total,
        taxes,
        date,
        payments,
      };
    }
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
  }, 2000);
  true;
`;
