(function clienteComponentsModule(global) {
  const { ComponentRegistry: registry, Utils, I18N } = global;

  if (!registry || !Utils || !I18N) {
    return;
  }

  registry.register("cliente.info", {
    render({ dados, codigoPais = null } = {}) {
      if (!dados) return "";

      const cliente = dados.cliente || {};
      const obra = cliente.obra || {};
      const vendedor = dados.vendedor || {};
      const cores = dados.cores || {};
      const corPrimaria = cores.corPrimaria || "#004080";
      const formatTelefone = (valor) => (valor ? Utils.formatarTelefone(valor) : "");

      return `
        <div class="cliente-info">
            <span>
              <strong>${I18N.t(codigoPais, "client")}:</strong> ${cliente.contato || ""}<br />
            </span>
            <div style="display: flex; gap: 5px;">
            <span><strong>${I18N.t(codigoPais, "address")}:</strong> ${cliente.endereco || ""}</span>
              <span><strong>${I18N.t(codigoPais, "city")}:</strong> ${cliente.cidade || ""}</span>
            </div>
          <div style="display: flex">
            <span style="min-width: 145px;"><strong>${I18N.t(codigoPais, "phone")}:</strong> ${
              formatTelefone(cliente.telefone)
            }</span>
            <span><strong>${I18N.t(codigoPais, "email")}:</strong> ${cliente.email || ""}</span>
          </div>
        </div>

        <div class="dados-cliente">
          <div class="linha1">
            <span><strong>Obra:</strong> ${obra.nome || ""}</span>
            <span><strong>Dt.${I18N.t(codigoPais, "proposal")}:</strong> ${dados.data || ""}</span>
          </div>
          <div class="linha2">
            <span><strong>${I18N.t(codigoPais, "contact")}:</strong> ${obra.responsavel || ""}</span>
            <span style="min-width: 165px;"><strong>${I18N.t(codigoPais, "phone")}:</strong> ${
              formatTelefone(obra.responsavelFone)
            }</span>
          </div>
          <div class="linha3">
            <span><strong>${I18N.t(codigoPais, "workAddress")}:</strong> ${obra.endereco || ""}</span>
            <span style="min-width: 165px;"><strong>${I18N.t(codigoPais, "city")}:</strong> ${obra.cidade || ""}</span>
          </div>
          <div class="linha4 destaque" style="background-color: ${corPrimaria};">
            <span><strong>${I18N.t(codigoPais, "vendor")}:</strong> ${vendedor.nome || ""}</span>
            <span><strong>${I18N.t(codigoPais, "phone")}:</strong> ${
              formatTelefone(vendedor.telefone)
            }</span>
          </div>
        </div>
      `;
    },
  });
})(window);
