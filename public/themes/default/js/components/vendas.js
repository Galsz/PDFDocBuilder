(function vendasComponentsModule(global) {
  const { ComponentRegistry: registry, Utils } = global;

  if (!registry || !Utils) {
    return;
  }

  registry.register("venda.cabecalho", {
    render() {
      return `
        <div id="venda-itens" class="venda-itens">
          <span class="item-venda-titulo">Venda de materiais</span>
          <table class="item-venda-lista">
            <thead>
              <tr class="item-venda-cabecalho">
                <th class="col-produto">Produto</th>
                <th class="col-un">Un.</th>
                <th class="col-larg">Larg.</th>
                <th class="col-alt">Alt.</th>
                <th class="col-qtde">Qtde.</th>
                <th class="col-unt">Vlr unt.</th>
                <th class="col-total">Vlr. Total</th>
              </tr>
            </thead>
          </table>
        </div>
      `;
    },
  });

  registry.register("venda.item", {
    render({ item } = {}) {
      if (!item) return "";

      return `
        <div class="venda-itens avoid-break">
          <div class="item-venda-lista">
      
              <div class="venda-item-linha" style="display: flex; align-items: center; justify-content: space-between;">
                <div class="item-venda-produto">
                  <img src="${
                    item.imagem
                  }" alt="Imagem Produto" class="produto-imagem">
                  <div>
                    <div class="produto-cor"><strong>Cor:</strong> ${
                      item.cor
                    }</div>
                    <div>${item.descricao}</div>
                  </div>
                </div>
                <div class="center col-un">${item.unidade}</div>
                <div class="center col-larg">${item.largura}</div>
                <div class="center col-alt">${item.altura}</div>
                <div class="center col-qtde">${item.qtd}</div>
                <div class="right col-unt">${Utils.formatarValor(
                  item.valorUnitario,
                  false
                )}</div>
                <div class="right col-total">${Utils.formatarValor(
                  item.valorTotal,
                  false
                )}</div>
              </div>
              ${
                item.observacoes
                  ? `
                <tr>
                  <td class="item-obs" colspan="7">
                    <p><strong>Observações:</strong> ${item.observacoes}</p>
                  </td>
                </tr>
              `
                  : ""
              }
          </div>
        </div>
      `;
    },
  });

  registry.register("venda.total", {
    render({ vendas } = {}) {
      if (!vendas) return "";
      return `
        <div class="venda-itens">
          <div class="item-venda-total">
            ${vendas.total}
          </div>
        </div>
      `;
    },
  });
})(window);
