(function financeiroComponentsModule(global) {
  const { ComponentRegistry: registry, Utils, I18N } = global;

  if (!registry || !Utils || !I18N) {
    return;
  }

  registry.register("financeiro.parcelas", {
    render({ parcelas, codigoPais = null } = {}) {
      if (!parcelas) return "";

      return `
        <div id="parcela" class="parcela-container">
          <table id="parcela-lista" class="parcela-tabela">
            <thead>
              <tr class="parcela-cabecalho">
                <th class="al-left pd">${I18N.t(codigoPais, "installment")}</th>
                <th class="al-left pd">${I18N.t(codigoPais, "dueDate")}</th>
                <th class="al-right pd">${I18N.t(codigoPais, "value")}</th>
                <th class="al-left pd">${I18N.t(codigoPais, "paymentMethod")}</th>
                <th class="al-left pd">${I18N.t(codigoPais, "status")}</th>
              </tr>
            </thead>
            <tbody>
              ${parcelas
                .map(
                  (parcela) => `
                <tr>
                  <td class="pd">${parcela.numero}</td>
                  <td class="pd">${parcela.vencimento}</td>
                  <td class="al-right pd">${Utils.formatarValor(
                    parcela.valor,
                    false,
                    codigoPais
                  )}</td>
                  <td class="pd">${parcela.formaPagamento}</td>
                  <td class="pd">${parcela.status}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `;
    },
  });

  registry.register("financeiro.totais", {
    render({ dados, config = {}, codigoPais = null } = {}) {
      if (!dados) return "";
      return `
          <div id="totais" class="totais-container">
            <div class="logo-tempera">
              ${
                dados.logoTempera
                  ? `
                <img src="${dados.logoTempera}" style="height: 150px" alt="logo-tempera"/>`
                  : ""
              }
            </div>
            <div class="totais-valores">
                ${
                  config.imprimirDesconto
                    ? `
                <p><strong>${I18N.t(codigoPais, "totalValue")}:</strong> ${Utils.formatarValor(
                  dados.valorTotal, true, codigoPais
                )}</p>
                <p><strong>${I18N.t(codigoPais, "discountValue")}:</strong> ${Utils.formatarValor(
                  dados.desconto, true, codigoPais
                )}</p>`
                    : ""
                } 
                <div class="valor-final-destaque">
                    ${I18N.t(codigoPais, "finalValue")}: ${Utils.formatarValor(dados.valorFinal, true, codigoPais)}
                </div>
            </div>
        </div>
      `;
    },
  });

  registry.register("financeiro.condicoes", {
    render({ condicoes, codigoPais = null } = {}) {
      if (!condicoes || condicoes.trim() === "") return "";
      return `
        <div id="condicoes" class="condicoes-pagamento">
            <p><h3>${I18N.t(codigoPais, "paymentConditions")}: </h3>${condicoes}</p>
        </div>
      `;
    },
  });

  registry.register("financeiro.promissoria", {
    render({ dados } = {}) {
      if (!dados || !dados.promissoria) return "";

      return `
        <div class="promissoria-container">
          <div class="promissoria-left">
            <span>AVALISTA(S)</span>
            <p>NOME__________________________________________</p>
            <p>CPF/CNPJ______________________________________</p>
            <p>ENDEREÇO_____________________________________</p>
          </div>
          <div class="promissoria-right ">

            <div style="display: flex;justify-content: space-between;margin-bottom: 20px;font-size: 9pt;">
              <div><strong>Nº:</strong> <span style="border: 1px solid black;border-radius: 8px;padding: 5px 18px;">${
                dados.promissoria.documento
              }</span></div>
              <div>${dados.promissoria.vencimento}</div>
              <div><strong>R$</strong> <span style="border: 1px solid black;border-radius: 8px;padding: 5px 18px;">${Utils.formatarValor(
                dados.promissoria.valor, false, dados.licenca.pais
              )}</span></div>
            </div>

            <p>${dados.promissoria.descricao}</p>

            <div style="display: flex; justify-content: flex-end">
              <span style="background: #ccc;padding: 3px 10px">por esta via de:</span>
              <span style="letter-spacing: 10px; padding: 4px 10px; font-weight: bold;">NOTA PROMISSÓRIA</span>
            </div>

            <p>${dados.licenca.nome} | CNPJ: ${dados.licenca.cnpj}</p>

            <p style="display: flex;margin: 2px;">
              <span style="width: 131px">ou à sua ordem, a quantia de</span>
              <span style="background: #ccc; padding: 7px; width: 100%">${
                dados.promissoria.valorExtenso1
              }</span>
            </p>

            <div style="display: flex; gap: 5px">
               <span style="background: #ccc; padding: 7px; width: 75%">${
                 dados.promissoria.valorExtenso2
               }</span>
              <span style="text-align: left;">EM MOEDA CORRENTE<br />DESTE PAÍS</span>
            </div>
           

            <p>Pagável em ${dados.cliente.cidade}</p>
            <div style="margin-top: 20px">
              <p>EMITENTE: ${dados.cliente.contato}</p>
              <p>CPF/CNPJ: ${dados.cliente.cpfcnpj}</p>
              <p>Endereço: ${dados.cliente.endereco}</p>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 20px;">
              <div>${dados.cliente.cidade}, ${new Date().toLocaleDateString()}</div>
              <div style="text-align: center;">
                _______________________________________________________<br/>
                Assinatura
              </div>
            </div>
          </div>
        </div>
      `;
    },
  });

  registry.register("financeiro.contrato", {
    render({ contratoHtml } = {}) {
      if (!contratoHtml) return "";

      return `

        <div id="contrato" class="contrato-content">${contratoHtml}</div>
      `;
    },
  });
})(window);
