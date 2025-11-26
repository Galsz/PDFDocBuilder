(function sharedModule(global) {
  const I18N = {
    countryToLang: {
      1058: "pt",
      6076: "pt",
      2496: "en",
      230: "en",
      2453: "es",
      4936: "es",
      639: "es",
      5860: "es",
    },
    dict: {
      pt: {
        client: "Cliente",
        vendor: "Vendedor",
        phone: "Telefone",
        email: "Email",
        city: "Cidade",
        address: "Endereço",
        workAddress: "Endereço Obra",
        contact: "Contato",
        proposal: "Proposta",
        project: "Projeto",
        profile: "Perfil",
        accessories: "Acessórios",
        glass: "Vidro",
        location: "Localização",
        type: "Tipo",
        qty: "Qtd",
        width: "L",
        height: "H",
        unitValue: "Vlr Unt",
        totalValue: "Vlr Total",
        materialSale: "Venda de materiais",
        product: "Produto",
        unit: "Un.",
        color: "Cor",
        description: "Descrição",
        observations: "Observações",
        installment: "Parcela",
        dueDate: "Vencimento",
        value: "Valor",
        paymentMethod: "Forma de Pagamento",
        status: "Status",
        subtotal: "Subtotal",
        discount: "Desconto",
        discountValue: "Valor Desconto",
        finalValue: "Valor Final",
        paymentConditions: "Condições de pagamento",
        page: "Página",
        of: "de",
        signature: "Assinatura",
        date: "Data",
        communicationChannels: "Canais de comunicação",
      },
      en: {
        client: "Client",
        vendor: "Vendor",
        phone: "Phone",
        email: "Email",
        city: "City",
        address: "Address",
        workAddress: "Work Address",
        contact: "Contact",
        proposal: "Proposal",
        project: "Project",
        profile: "Section",
        accessories: "Accessories",
        glass: "Glass",
        location: "Location",
        type: "Type",
        qty: "Qty",
        width: "W",
        height: "H",
        unitValue: "Unit Value",
        totalValue: "Total Value",
        materialSale: "Material Sales",
        product: "Product",
        unit: "Un.",
        color: "Color",
        description: "Description",
        observations: "Observations",
        installment: "Installment",
        dueDate: "Due Date",
        value: "Value",
        paymentMethod: "Payment Method",
        status: "Status",
        subtotal: "Subtotal",
        discount: "Discount",
        discountValue: "Discount Value",
        finalValue: "Final Value",
        paymentConditions: "Payment Conditions",
        page: "Page",
        of: "of",
        signature: "Signature",
        date: "Date",
        communicationChannels: "Communication Channels",
      },
      es: {
        client: "Cliente",
        vendor: "Vendedor",
        phone: "Teléfono",
        email: "Email",
        city: "Ciudad",
        address: "Dirección",
        workAddress: "Dirección de Obra",
        contact: "Contacto",
        proposal: "Propuesta",
        project: "Proyecto",
        profile: "Color Perfil",
        accessories: "Accesorios",
        glass: "Vidrio",
        location: "Ubicación",
        type: "Tipo",
        qty: "Cant",
        width: "A",
        height: "H",
        unitValue: "Valor Unit",
        totalValue: "Valor Total",
        materialSale: "Venta de materiales",
        product: "Producto",
        unit: "Un.",
        color: "Color",
        description: "Descripción",
        observations: "Observaciones",
        installment: "Cuota",
        dueDate: "Vencimiento",
        value: "Valor",
        paymentMethod: "Forma de Pago",
        status: "Estado",
        subtotal: "Subtotal",
        discount: "Descuento",
        discountValue: "Valor Descuento",
        finalValue: "Valor Final",
        paymentConditions: "Condiciones de pago",
        page: "Página",
        of: "de",
        signature: "Firma",
        date: "Fecha",
        communicationChannels: "Canales de comunicación",
      },
    },
    getLang(codigoPais) {
      return this.countryToLang[codigoPais] || "pt";
    },
    t(codigoPais, key, fallback = null) {
      const lang = this.getLang(codigoPais);
      const translation = this.dict[lang]?.[key];
      return translation || fallback || key;
    },
  };

  const Utils = {
    paisesConfig: {
      1058: {
        currency: "BRL",
        locale: "pt-BR",
        symbol: "R$",
        language: "pt",
      },
      5860: {
        currency: "PYG",
        locale: "es-PY",
        symbol: "₲",
        language: "es",
      },
      2453: {
        currency: "EUR",
        locale: "es-ES",
        symbol: "€",
        language: "es",
      },
      230: {
        currency: "EUR",
        locale: "de-DE",
        symbol: "€",
        language: "en",
      },
      2496: {
        currency: "USD",
        locale: "en-US",
        symbol: "$",
        language: "en",
      },
      6076: {
        currency: "EUR",
        locale: "pt-PT",
        symbol: "€",
        language: "pt",
      },
      4936: {
        currency: "MXN",
        locale: "es-MX",
        symbol: "MX$",
        language: "es",
      },
      639: {
        currency: "ARS",
        locale: "es-AR",
        symbol: "AR$",
        language: "es",
      },
    },
    setText(id, texto) {
      const el = document.getElementById(id);
      if (el) el.textContent = texto;
    },
    setHTML(id, html) {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    },
    setCardPosition(selector, position) {
      const el = document.querySelector(selector);
      if (el) el.style.backgroundPositionX = position;
    },
    getParametroURL(parametro) {
      const params = new URLSearchParams(window.location.search);
      return params.get(parametro);
    },
    formatarTelefone(telefone) {
      if (!telefone || typeof telefone !== "string") return telefone;
      const digits = telefone.replace(/\D/g, "");

      if (digits.length === 11) {
        return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
      }
      if (digits.length === 10) {
        return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
      }
      return telefone;
    },
    formatarValor(valor, comSimbolo = true, codigoPais = null) {
      // Seleciona configuração do país
      let config = this.paisesConfig[1058];
      if (codigoPais && this.paisesConfig[codigoPais]) {
        config = this.paisesConfig[codigoPais];
      }

      // Moedas sem casas decimais (PYG: Guarani, JPY: Iene, KRW: Won, etc.)
      const zeroDecimalCurrencies = new Set(["PYG", "JPY", "KRW"]);
      const minFrac = zeroDecimalCurrencies.has(config.currency) ? 0 : 2;
      const maxFrac = minFrac;

      // Normaliza valor
      let parsed = valor;
      if (typeof parsed === "string") {
        // Converte vírgula decimal para ponto e remove separadores de milhar simples
        const norm = parsed.replace(/\./g, "").replace(",", ".");
        parsed = Number(norm);
      }
      if (parsed === null || parsed === undefined || Number.isNaN(Number(parsed))) {
        parsed = 0;
      }

      const numero = Number(parsed);
      const valorFormatado = numero.toLocaleString(config.locale, {
        style: "decimal",
        minimumFractionDigits: minFrac,
        maximumFractionDigits: maxFrac,
      });

      return comSimbolo ? `${config.symbol} ${valorFormatado}` : valorFormatado;
    },
    _localeFromPais(codigoPais) {
      let cfg = this.paisesConfig[1058];
      if (codigoPais && this.paisesConfig[codigoPais]) cfg = this.paisesConfig[codigoPais];
      return cfg.locale || "pt-BR";
    },
    _coerceDate(value) {
      if (value instanceof Date) return value;
      if (typeof value === "number") return new Date(value);
      if (typeof value === "string") {
        const d = new Date(value);
        if (!Number.isNaN(d.getTime())) return d;
      }
      return new Date();
    },
    formatarData(value = new Date(), codigoPais = null, options = undefined) {
      const locale = this._localeFromPais(codigoPais);
      const d = this._coerceDate(value);
      const fmt = options ?? { dateStyle: "short" };
      try {
        return new Intl.DateTimeFormat(locale, fmt).format(d);
      } catch (e) {
        return d.toLocaleDateString(locale);
      }
    },
    formatarHora(value = new Date(), codigoPais = null, options = undefined) {
      const locale = this._localeFromPais(codigoPais);
      const d = this._coerceDate(value);
      const fmt = options ?? { timeStyle: "short" };
      try {
        return new Intl.DateTimeFormat(locale, fmt).format(d);
      } catch (e) {
        return d.toLocaleTimeString(locale);
      }
    },
    formatarDataHora(value = new Date(), codigoPais = null, options = undefined) {
      const locale = this._localeFromPais(codigoPais);
      const d = this._coerceDate(value);
      const fmt = options ?? { dateStyle: "short", timeStyle: "short" };
      try {
        return new Intl.DateTimeFormat(locale, fmt).format(d);
      } catch (e) {
        return `${d.toLocaleDateString(locale)} ${d.toLocaleTimeString(locale)}`;
      }
    },
    dividirEmBlocosQuebraveis(
      texto,
      { paragrafosPorBloco = 5, className = "allow-break", titulo = null } = {}
    ) {
      if (!texto || typeof texto !== "string") return [];

      const linhasOriginais = texto.split(/\r?\n/);

      const paragrafos = [];
      linhasOriginais.forEach((ln) => {
        if (ln.trim().length > 0) {
          paragrafos.push(ln.trim());
        } else {
          paragrafos.push("__SPACE__");
        }
      });

      const blocos = [];
      let grupo = [];
      let countParagrafos = 0;

      const pushGrupo = (isFirst) => {
        if (grupo.length === 0) return;
        const wrapper = document.createElement("div");
        const conteudoHTML = grupo
          .map((item) => {
            if (item === "__SPACE__") {
              return '<p style="height:8px"></p>';
            }
            return `<p>${item}</p>`;
          })
          .join("");
        wrapper.innerHTML = `
          ${titulo && isFirst ? `<h3 class="observacoes">${titulo}</h3>` : ""}
          <div class="observacoes-conteudo">${conteudoHTML}</div>
        `;
        blocos.push(wrapper);
      };

      for (let i = 0; i < paragrafos.length; i += 1) {
        const item = paragrafos[i];
        const isSpace = item === "__SPACE__";
        grupo.push(item);
        if (!isSpace) countParagrafos += 1;
        const isLast = i === paragrafos.length - 1;
        if (countParagrafos === paragrafosPorBloco || isLast) {
          pushGrupo(blocos.length === 0);
          grupo = [];
          countParagrafos = 0;
        }
      }

      return blocos;
    },
    getValueByPath(source, path, defaultValue = undefined) {
      if (!source || !path) return defaultValue;
      const normalized = path.replace(/\[(\d+)\]/g, ".$1");
      const segments = normalized.split(".").filter(Boolean);
      let current = source;
      for (let i = 0; i < segments.length; i += 1) {
        const segment = segments[i];
        if (current && Object.prototype.hasOwnProperty.call(current, segment)) {
          current = current[segment];
        } else {
          return defaultValue;
        }
      }
      return current === undefined ? defaultValue : current;
    },
    isNil(value) {
      return value === null || value === undefined;
    },
    isEmpty(value) {
      if (this.isNil(value)) return true;
      if (typeof value === "string") return value.trim().length === 0;
      if (Array.isArray(value)) return value.length === 0;
      if (typeof value === "object") return Object.keys(value).length === 0;
      return false;
    },
    formatValue(value, format, { codigoPais = null, comSimbolo = true } = {}) {
      if (!format) return value;
      if (this.isNil(value)) return value;
      switch (format) {
        case "telefone":
        case "phone":
          return this.formatarTelefone(value);
        case "currency":
          return this.formatarValor(value, comSimbolo, codigoPais);
        case "date":
          return this.formatarData(value, codigoPais);
        case "time":
          return this.formatarHora(value, codigoPais);
        case "datetime":
          return this.formatarDataHora(value, codigoPais);
        case "numero":
        case "number":
          return Number(value);
        case "uppercase":
          return typeof value === "string" ? value.toUpperCase() : value;
        case "lowercase":
          return typeof value === "string" ? value.toLowerCase() : value;
        case "backgroundImage":
          return typeof value === "string" && value.length > 0 ? `url('${value}')` : value;
        default:
          return value;
      }
    },
  };

  global.I18N = I18N;
  global.Utils = Utils;
})(window);
