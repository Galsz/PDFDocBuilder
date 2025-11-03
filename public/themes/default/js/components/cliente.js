(function clienteComponentsModule(global) {
  const { ComponentRegistry: registry, Utils, I18N, DynamicRenderer } = global;

  if (!registry || !Utils || !I18N) {
    return;
  }

  registry.register("cliente.info", {
    render({ dados, config = {}, codigoPais = null } = {}) {
      if (!dados) return "";

      // Tokens flexíveis (similar à capa):
      // - Suporta {{CLIENTENOME}}, {{CLIENTEEMAIL}}, etc. (CAIXA ALTA)
      // - Suporta caminhos como {{dados.cliente.email}}
      // - Cria aliases sanitizados em minúsculas e maiúsculas
      const buildSmartTokens = (src = {}, cfg = {}, qry = {}, extra = {}) => {
        const tokens = {};

        const setKey = (key, value) => {
          if (value === undefined || value === null) return;
          const raw = String(key).trim();
          if (!raw) return;
          if (!(raw in tokens)) tokens[raw] = value;
          const upper = raw.toUpperCase();
          const lower = raw.toLowerCase();
          if (!(upper in tokens)) tokens[upper] = value;
          if (!(lower in tokens)) tokens[lower] = value;
          const sanitized = raw.replace(/[^a-zA-Z0-9]/g, "");
          if (sanitized) {
            const sLower = sanitized.toLowerCase();
            const sUpper = sanitized.toUpperCase();
            if (!(sLower in tokens)) tokens[sLower] = value;
            if (!(sUpper in tokens)) tokens[sUpper] = value;
          }
        };

        const flatten = (obj, prefix = "") => {
          if (!obj || typeof obj !== "object") return;
          Object.keys(obj).forEach((k) => {
            const v = obj[k];
            const path = prefix ? `${prefix}.${k}` : k;
            if (v && typeof v === "object" && !(v instanceof Date)) {
              flatten(v, path);
            } else {
              setKey(path, v);
              const last = String(k).trim();
              if (last) setKey(last, v);
            }
          });
        };

        // Flatten das fontes
        flatten({ dados: src });
        flatten({ config: cfg });
        flatten({ query: qry });
        flatten({ tokens: extra });

        // Aliases úteis em CAIXA ALTA
        const cliente = src.cliente || {};
        const obra = (src.cliente && src.cliente.obra) || src.obra || {};
        const vendedor = src.vendedor || {};
        const aliases = {
          CLIENTENOME: cliente.contato || cliente.nome || "",
          CLIENTECONTATO: cliente.contato || "",
          CLIENTEEMAIL: cliente.email || "",
          CLIENTETELEFONE: cliente.telefone || cliente.fone || "",
          CLIENTEENDERECO: cliente.endereco || "",
          CLIENTECIDADE: cliente.cidade || "",
          OBRANOME: obra.nome || "",
          OBRARESPONSAVEL: obra.responsavel || "",
          OBRARESPONSAVELFONE: obra.responsavelFone || obra.fone || "",
          OBRAENDERECO: obra.endereco || "",
          OBRACIDADE: obra.cidade || "",
          VENDEDORNOME: vendedor.nome || "",
          VENDEDORTELEFONE: vendedor.telefone || vendedor.fone || "",
          ORCAMENTOID: src.id || "",
          DATA: src.data || "",
        };
        Object.keys(aliases).forEach((k) => setKey(k, aliases[k]));

        // Especiais simples
        try {
          const now = new Date();
          setKey("NOW", now);
          setKey("DATE", now);
          setKey("TIME", now);
        } catch (_) {
          // ignore
        }

        return tokens;
      };

      const compConf = config?.components?.clienteInfo;
      const usarBlueprint = compConf?.type === "blueprint" && compConf?.blueprint;
      const runtimeTokens = buildSmartTokens(dados, config, config.query || {}, compConf?.tokens || {});
      const runtime = { dados, config, tokens: runtimeTokens, query: config.query || {} };
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
