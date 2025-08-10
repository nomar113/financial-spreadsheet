export const extractDataFromRJ = `
  document.body.style.backgroundColor = 'red';
  setTimeout(function() {
    const merchantName = document.querySelector('.txtTopo').textContent.replace(/\s+/g, ' ').trim();
    const cnpj = document.querySelector('.text').textContent.replace('CNPJ:', '').replace(/\s+/g, '').trim();
    const merchantAddress = document.querySelector('.text').nextElementSibling.textContent
      .replace(/\t/g, '')
      .replace(/\\n/g, '')
      .replace(/\s/g, '')
      .replace(/,,/g, ',')
      .replace(/,/g, ', ')
      .trim();

    const items = [];
    document.querySelectorAll('#tabResult tr[id^="Item"]').forEach((element) => {
      const item = {};
      const td = element.querySelectorAll('td');
      item.productName = td[0].querySelector('.txtTit').textContent;
      item.code = td[0].querySelector('.RCod').textContent.replace('(Código:', '').replace(')', '').trim();
      item.quantity = parseFloat(td[0].querySelector('.Rqtd').textContent.replace('Qtde.:', '').trim().replace(',', '.'));
      item.unit = td[0].querySelector('.RUN').textContent.replace('UN:', '').trim();
      item.unitPrice = parseFloat(td[0].querySelector('.RvlUnit').textContent.replace('Vl. Unit.:', '').trim().replace(',', '.'));
      item.totalPrice = parseFloat(td[1].querySelector('.valor').textContent.replace(',', '.'));
      items.push(item);
    });

    const values = document.querySelectorAll('#totalNota .totalNumb')
    const totalItems = parseFloat(values[0].textContent.replace(',', '.'));
    const discountLabel = 'Descontos R$:';
    const discountElement = Array.from(document.querySelectorAll('#totalNota label')).find(element => element.textContent.trim() === discountLabel);
    let subtotal = 0;
    let discount = 0;
    if (discountElement) {
      subtotal = parseFloat(values[1].textContent.replace(',', '.'));
      discount = parseFloat(discountElement.nextElementSibling.textContent.replace(',', '.'));
    }
    const total = parseFloat(document.querySelector('#totalNota .totalNumb.txtMax').textContent.replace(',', '.'));
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
    
      return {
        type,
        value,
      };
    });

    let date = Array.from(document.querySelectorAll('strong')).find(el => el.outerText === ' Emissão: ').nextSibling.textContent.trim(); 
    date = date.substring(0, ("00/00/0000 00:00:00-00:00").length);

    const result = {
      merchantName,
      cnpj,
      merchantAddress,
      totalItems,
      subtotal,
      discount,
      total,
      taxes,
      date,
      items,
      payments,
    };

    window.ReactNativeWebView.postMessage(JSON.stringify(result));
  }, 2000);
  true;
`;
