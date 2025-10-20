(function projetoComponentsModule(global) {
  const { ComponentRegistry: registry, Utils, I18N } = global;

  if (!registry || !Utils || !I18N) {
    return;
  }

  registry.register("projeto.item", {
    render({ projeto, config = {}, codigoPais = null } = {}) {
      if (!projeto) return "";

      return `
          <div class="projeto-item avoid-break">
            <div class="item-topo">
              <div class="item-imagem">
                <img src="${projeto.imagem}" alt="Imagem projeto ${
        projeto.ordem
      }" class="imagem-projeto" />
              </div>
              <div class="item-info">
                <div class="item-info-header">
                  <h4>${projeto.nome}</h4>
                  <p><strong>${I18N.t(codigoPais, "profile")}:</strong> ${projeto.perfil}</p>
                  <p><strong>${I18N.t(codigoPais, "accessories")}:</strong> ${projeto.acessorios}</p>
                  <p><strong>${I18N.t(codigoPais, "glass")}:</strong> ${projeto.vidro}</p>
                  <p><strong>${I18N.t(codigoPais, "location")}:</strong> ${projeto.localizacao}</p>
                </div>
                <div class="item-tabela allow-break">
                  <div class="tabela-item-linha">
                    <div class="tabela-item-numero">${projeto.ordem}</div>
                    <div class="tabela-item-valores">
                      <div class="tabela-item-header">
                        <span class="col-tipo"><strong>${I18N.t(codigoPais, "type")}:</strong></span>
                        <span class="col-qtd"><strong>${I18N.t(codigoPais, "qty")}:</strong></span>
                        ${
                          config.imprimirMedidas
                            ? `
                          <span class="col-qtd"><strong>M2:</strong></span>
                          <span class="col-l"><strong>${I18N.t(codigoPais, "width")}:</strong></span>
                          <span class="col-h"><strong>${I18N.t(codigoPais, "height")}:</strong></span>`
                            : ""
                        }
                        ${
                          config.imprimirValorUnitario
                            ? `
                          <span class="col-vlr-unt"><strong>${I18N.t(codigoPais, "unitValue")}:</strong></span>
                          <span class="col-vlr-total"><strong>${I18N.t(codigoPais, "totalValue")}:</strong></span>`
                            : ""
                        }
                      </div>
                      <div class="tabela-item-dados">
                        <span class="col-tipo">${projeto.tipo}</span>
                        <span class="col-qtd">${projeto.qtd}</span>
                        ${
                          config.imprimirMedidas
                            ? `
                          <span class="col-qtd">${projeto.m2}</span>
                          <span class="col-l">${projeto.largura}</span>
                          <span class="col-h">${projeto.altura}</span>`
                            : ""
                        }
                        ${
                          config.imprimirValorUnitario
                            ? `
                          <span class="col-vlr-unt">${Utils.formatarValor(
                            projeto.valorUnt,
                            false,
                            codigoPais
                          )}</span>
                          <span class="col-vlr-total">${Utils.formatarValor(
                            projeto.valorTotal,
                            false,
                            codigoPais
                          )}</span>`
                            : ""
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            ${
              ""
            }
          </div>
      `;
    },
  });

  registry.register("projeto.variaveis", {
    render({ variaveis, config = {} } = {}) {
      if (!variaveis || !variaveis.length || !config.imprimirVariaveis) return "";

      return `
        <div class="item-variaveis">
          <span class="variaveis-titulo">Lista de variáveis</span>
          <table class="tabela-variaveis">
            <tbody>
              ${variaveis
                .map(
                  (variavel) => `
                  <tr>
                    <td>${variavel.nome}</td>
                    <td>${variavel.valor}</td>
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
})(window);
