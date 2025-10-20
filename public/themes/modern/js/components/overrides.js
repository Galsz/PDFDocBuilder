(function modernThemeOverrides(global) {
  const { ComponentRegistry: registry, Utils, I18N } = global;

  if (!registry || !Utils || !I18N) {
    return;
  }

  const formatMoney = (valor, codigoPais, comSimbolo = true) =>
    Utils.formatarValor(valor, comSimbolo, codigoPais);

  registry.register("projeto.item", {
    render({ projeto, config = {}, codigoPais = null } = {}) {
      if (!projeto) return "";

      const mostrarMedidas = config.imprimirMedidas !== false;
      const mostrarValorUnitario = config.imprimirValorUnitario !== false;

      const medidas = mostrarMedidas
        ? `
          <div class="projeto-item__metric">
            <span>${I18N.t(codigoPais, "width")} × ${I18N.t(codigoPais, "height")}</span>
            <strong>${projeto.largura || "-"} × ${projeto.altura || "-"}</strong>
          </div>
          <div class="projeto-item__metric">
            <span>M²</span>
            <strong>${projeto.m2 || "-"}</strong>
          </div>
        `
        : "";

      const valores = mostrarValorUnitario
        ? `
          <div class="projeto-item__metric">
            <span>${I18N.t(codigoPais, "unitValue")}</span>
            <strong>${formatMoney(projeto.valorUnt, codigoPais, false)}</strong>
          </div>
        `
        : "";

      const total = mostrarValorUnitario
        ? `
          <div class="projeto-item__metric projeto-item__metric--highlight">
            <span>${I18N.t(codigoPais, "totalValue")}</span>
            <strong>${formatMoney(projeto.valorTotal, codigoPais)}</strong>
          </div>
        `
        : "";

      const variaveis = Array.isArray(projeto.variaveis) && projeto.variaveis.length
        ? `
          <div class="projeto-item__chips">
            ${projeto.variaveis
              .map((variavel) => `
                <span class="projeto-item__chip">
                  <strong>${variavel.nome}:</strong> ${variavel.valor || "-"}
                </span>
              `)
              .join("")}
          </div>
        `
        : "";

      return `
        <section class="projeto-item projeto-item--modern avoid-break">
          <header class="projeto-item__header">
            <div class="projeto-item__meta">
              <span class="projeto-item__badge">${projeto.ordem || "-"}</span>
              <h3>${projeto.nome || "Projeto"}</h3>
              <p>${projeto.localizacao || ""}</p>
            </div>
            ${
              projeto.imagem
                ? `<img src="${projeto.imagem}" alt="${projeto.nome}" class="projeto-item__image" />`
                : ""
            }
          </header>

          <div class="projeto-item__details">
            <dl>
              <div>
                <dt>${I18N.t(codigoPais, "profile")}</dt>
                <dd>${projeto.perfil || "-"}</dd>
              </div>
              <div>
                <dt>${I18N.t(codigoPais, "accessories")}</dt>
                <dd>${projeto.acessorios || "-"}</dd>
              </div>
              <div>
                <dt>${I18N.t(codigoPais, "glass")}</dt>
                <dd>${projeto.vidro || "-"}</dd>
              </div>
            </dl>
          </div>

          <div class="projeto-item__metrics">
            <div class="projeto-item__metric">
              <span>${I18N.t(codigoPais, "qty")}</span>
              <strong>${projeto.qtd || "-"}</strong>
            </div>
            ${medidas}
            ${valores}
            ${total}
          </div>

          ${variaveis}

          ${
            projeto.observacoes
              ? `
                <footer class="projeto-item__footer">
                  <h4>${I18N.t(codigoPais, "observations")}</h4>
                  <p>${projeto.observacoes}</p>
                </footer>
              `
              : ""
          }
        </section>
      `;
    },
  });

  registry.register("financeiro.totais", {
    render({ dados, config = {}, codigoPais = null } = {}) {
      if (!dados) return "";

      const cards = [];

      cards.push(`
        <div class="totais-modern__card">
          <span>${I18N.t(codigoPais, "totalValue")}</span>
          <strong>${formatMoney(dados.valorTotal, codigoPais)}</strong>
        </div>
      `);

      if (config.imprimirDesconto && Number(dados.desconto)) {
        cards.push(`
          <div class="totais-modern__card">
            <span>${I18N.t(codigoPais, "discountValue")}</span>
            <strong>- ${formatMoney(dados.desconto, codigoPais)}</strong>
          </div>
        `);
      }

      cards.push(`
        <div class="totais-modern__card totais-modern__card--highlight">
          <span>${I18N.t(codigoPais, "finalValue")}</span>
          <strong>${formatMoney(dados.valorFinal, codigoPais)}</strong>
        </div>
      `);

      const logo = dados.logoTempera
        ? `<div class="totais-modern__logo"><img src="${dados.logoTempera}" alt="Logo Tempera" /></div>`
        : "";

      return `
        <section class="totais-modern">
          ${logo}
          <div class="totais-modern__grid">
            ${cards.join("")}
          </div>
        </section>
      `;
    },
  });
})(window);
