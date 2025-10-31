(function clienteComponentsModule(global) {
  const { ComponentRegistry: registry, Utils, I18N, DynamicRenderer } = global;

  if (!registry || !Utils || !I18N) {
    return;
  }

  registry.register("cliente.info", {
    render({ dados, config = {}, codigoPais = null } = {}) {
      if (!dados) return "";

      
      // Rota de blueprint dinâmica se configurada
      const compConf = config?.components?.clienteInfo;
      const usarBlueprint = compConf?.type === "blueprint" && compConf?.blueprint;
      const runtime = { dados, config, tokens: compConf?.tokens || {}, query: config.query || {} };
      const modo = compConf?.mode || "replace"; // replace | prepend | append
      let htmlDinamico = "";

      if (usarBlueprint && DynamicRenderer?.renderToString) {
        const html = DynamicRenderer.renderToString(compConf.blueprint, runtime) || "";
        const widthMm = Number(compConf?.blueprint?.page?.widthMm);
        const fullWidth = Number.isFinite(widthMm) && widthMm >= 209;
        const wrapperClasses = ["dynamic-blueprint-block"];
        if (fullWidth) {
          wrapperClasses.push("dynamic-blueprint-block--flush");
        }
        const widthAttr = Number.isFinite(widthMm) ? ` data-blueprint-width-mm="${widthMm}"` : "";
        htmlDinamico = `<div class="${wrapperClasses.join(" ")}" data-component="cliente.info"${widthAttr}>${html}</div>`;
      }

  const cliente = dados.cliente || {};
      const obra = cliente.obra || {};
      const vendedor = dados.vendedor || {};
      const cores = dados.cores || {};
      const corPrimaria = cores.corPrimaria || "#004080";
      const formatTelefone = (valor) => (valor ? Utils.formatarTelefone(valor) : "");

      const htmlPadrao = `
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

      if (usarBlueprint && htmlDinamico) {
        if (modo === "prepend") return `${htmlDinamico}${htmlPadrao}`;
        if (modo === "append") return `${htmlPadrao}${htmlDinamico}`;
        return htmlDinamico; // replace
      }

      return htmlPadrao;
    },
  });
})(window);
