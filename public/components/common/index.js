(function commonComponentsModule(global) {
  const { ComponentRegistry: registry, I18N, Utils } = global;

  if (!registry) {
    console.error("Common components depend on ComponentRegistry being loaded first.");
    return;
  }

  // DynamicRenderer: renderiza um blueprint genérico em HTML (string), reutilizável por qualquer componente
  const DynamicRenderer = (function createDynamicRenderer() {
    function isPlainObject(value) {
      return Object.prototype.toString.call(value) === "[object Object]";
    }

    function toCssMm(value) {
      const n = Number(value);
      return Number.isFinite(n) ? `${n}mm` : null;
    }

    const ANCHOR_MAP = {
      "top-left": [0, 0],
      "left-top": [0, 0],
      "top-center": [-50, 0],
      "center-top": [-50, 0],
      "top-right": [-100, 0],
      "right-top": [-100, 0],
      "center-left": [0, -50],
      "left-center": [0, -50],
      center: [-50, -50],
      middle: [-50, -50],
      "center-center": [-50, -50],
      "middle-center": [-50, -50],
      "center-right": [-100, -50],
      "right-center": [-100, -50],
      "bottom-left": [0, -100],
      "left-bottom": [0, -100],
      "bottom-center": [-50, -100],
      "center-bottom": [-50, -100],
      "bottom-right": [-100, -100],
      "right-bottom": [-100, -100],
    };

    function resolveAnchorTransform(anchor) {
      if (!anchor) return { x: 0, y: 0 };
      const k = String(anchor).trim().toLowerCase();
      const pair = ANCHOR_MAP[k];
      if (!pair) return { x: 0, y: 0 };
      return { x: pair[0], y: pair[1] };
    }

    function isLikelyImageSrc(value) {
      if (typeof value !== "string") return false;
      const v = value.trim();
      if (!v) return false;
      return (
        v.startsWith("data:image/") ||
        v.startsWith("http://") ||
        v.startsWith("https://") ||
        v.startsWith("blob:")
      );
    }

    function buildLookup(runtime = {}) {
      const aggregate = {
        dados: runtime.dados || {},
        config: runtime.config || {},
        query: runtime.query || {},
        tokens: runtime.tokens || {},
      };
      const map = new Map();
      const visited = new WeakSet();

      const register = (key, value) => {
        if (value === undefined || value === null) return;
        const norm = String(key).trim().toLowerCase();
        if (!norm) return;
        if (!map.has(norm)) map.set(norm, value);
      };

      const sanitize = (key) => String(key).trim().toLowerCase().replace(/[^a-z0-9]/g, "");

      const traverse = (prefix, value) => {
        if (value === undefined || value === null) return;
        if (typeof value === "object") {
          if (visited.has(value)) return;
          visited.add(value);
        }
        if (typeof value !== "object" || value instanceof Date || value instanceof RegExp) {
          if (prefix) {
            register(prefix, value);
            const segments = prefix.split(".").filter(Boolean);
            const last = segments[segments.length - 1];
            if (last) {
              register(last, value);
              register(sanitize(last), value);
            }
            const roots = new Set(["dados", "tokens", "config", "query"]);
            const withoutRoots = segments.filter((s) => !roots.has(s));
            if (withoutRoots.length) {
              const flattened = sanitize(withoutRoots.join(""));
              if (flattened) register(flattened, value);
            }
            if (sanitize(last) === "id") register("orcamentoid", value);
          }
          return;
        }
        if (Array.isArray(value)) {
          value.forEach((item, index) => traverse(`${prefix}[${index}]`, item));
          return;
        }
        Object.keys(value).forEach((k) => traverse(prefix ? `${prefix}.${k}` : k, value[k]));
      };

      traverse("dados", aggregate.dados);
      traverse("config", aggregate.config);
      traverse("query", aggregate.query);
      traverse("tokens", aggregate.tokens);

      // Page-aware special tokens (current/total page), available for any blueprint
      if (typeof runtime.pagina === "number") {
        register("pagina", runtime.pagina);
        register("page", runtime.pagina);
      }
      if (typeof runtime.totalPaginas === "number") {
        register("totalpaginas", runtime.totalPaginas);
        register("totalpages", runtime.totalPaginas);
        register("total_paginas", runtime.totalPaginas);
        register("total paginas", runtime.totalPaginas);
      }

      // Special tokens (date/time/currency symbol)
      try {
        const codigoPais = aggregate?.dados?.licenca?.pais ?? aggregate?.config?.codigoPais ?? null;
        const now = new Date();
        const locale = Utils?.paisesConfig?.[codigoPais]?.locale || Utils?.paisesConfig?.[1058]?.locale || "pt-BR";
        const dateStr = new Intl.DateTimeFormat(locale, { dateStyle: "short" }).format(now);
        const timeStr = new Intl.DateTimeFormat(locale, { timeStyle: "short" }).format(now);
        const dateTimeStr = new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(now);
        const currencySymbol = (Utils?.paisesConfig?.[codigoPais]?.symbol) || (Utils?.paisesConfig?.[1058]?.symbol) || "R$";

        // register lower-case keys; lookup lowercases expressions
        register("now", dateTimeStr);
        register("datetime", dateTimeStr);
        register("date", dateStr);
        register("today", dateStr);
        register("time", timeStr);
        register("currencysymbol", currencySymbol);
        register("currency", currencySymbol);
      } catch (e) {
        // ignore
      }

      return (exprRaw) => {
        if (exprRaw === undefined || exprRaw === null) return undefined;
        const expr = String(exprRaw).replace(/^\s*\{\{/, "").replace(/\}\}\s*$/, "").trim();
        if (!expr) return undefined;
        const normalized = expr.toLowerCase();
        if (map.has(normalized)) return map.get(normalized);
        const fromPath = Utils?.getValueByPath?.(aggregate, expr);
        if (fromPath !== undefined && fromPath !== null) return fromPath;
        const fromLowerPath = Utils?.getValueByPath?.(aggregate, expr.toLowerCase());
        if (fromLowerPath !== undefined && fromLowerPath !== null) return fromLowerPath;
        return undefined;
      };
    }

    function interpolate(template, lookup) {
      if (template === undefined || template === null) return template;
      if (typeof template !== "string") return template;
      if (!template.includes("{{")) return template;
      let changed = false;
      const out = template.replace(/\{\{\s*([^}]+)\s*\}\}/g, (m, e) => {
        const v = lookup(e);
        changed = true;
        return v === undefined || v === null ? "" : String(v);
      });
      return changed ? out : template;
    }

    function styleToInline(style = {}) {
      if (!isPlainObject(style)) return "";
      const mmMap = {
        fontSizeMm: "font-size",
        lineHeightMm: "line-height",
        maxWidthMm: "max-width",
        maxHeightMm: "max-height",
        widthMm: "width",
        heightMm: "height",
        letterSpacingMm: "letter-spacing",
        paddingMm: "padding",
        marginMm: "margin",
      };
      const parts = [];
      Object.keys(style).forEach((key) => {
        const val = style[key];
        if (val === undefined || val === null) return;
        if (mmMap[key]) {
          const css = toCssMm(val);
          if (css) parts.push(`${mmMap[key]}:${css}`);
          return;
        }
        if (key.endsWith("Mm")) {
          const cssKey = key.slice(0, -2).replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
          const css = toCssMm(val);
          if (css) parts.push(`${cssKey}:${css}`);
          return;
        }
        const cssKey = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
        parts.push(`${cssKey}:${val}`);
      });
      return parts.join(";");
    }

    function tokenToHTML(token, lookup) {
      if (!token || typeof token !== "object") return "";
      const type = String(token.type || "text").toLowerCase();
      const left = toCssMm(token.xMm ?? token.leftMm ?? token.x);
      const top = toCssMm(token.yMm ?? token.topMm ?? token.y);
      const z = token.zIndex !== undefined ? `z-index:${String(token.zIndex)};` : "";
      const { x, y } = resolveAnchorTransform(token.anchor);
      const transform = x !== 0 || y !== 0 ? `transform:translate(${x}%,${y}%);` : "";
      const base = `position:absolute;pointer-events:none;display:inline-block;white-space:pre-wrap;word-break:break-word;${left ? `left:${left};` : ""}${top ? `top:${top};` : ""}${z}${transform}`;

      const preview = resolveTokenContent(token, lookup);
      const asImage = type === "image" || token.render === "image" || token.format === "image" || token.asImage === true || isLikelyImageSrc(preview);
      const styleInline = styleToInline(isPlainObject(token.style) ? token.style : {});
      const idAttr = token.id ? ` data-token-id="${token.id}"` : "";
      if (asImage) {
        if (!preview) return "";
        const objFit = token.style?.objectFit ? `object-fit:${token.style.objectFit};` : "";
        const objPos = token.style?.objectPosition ? `object-position:${token.style.objectPosition};` : "";
        return `<div class="dynamic-token dynamic-token--image"${idAttr} style="${base}${styleInline}"><img src="${String(preview)}" alt="${token.binding?.label || token.binding?.key || token.id || ""}" style="display:block;width:100%;height:100%;${objFit}${objPos}${token.style?.borderRadius ? `border-radius:${token.style.borderRadius};` : ""}"></div>`;
      }
      const content = preview ?? "";
      const text = String(content);
      return `<div class="dynamic-token dynamic-token--text"${idAttr} style="${base}${styleInline}">${text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>`;
    }

    function resolveTokenContent(token, lookup) {
      const candidates = [token.value, token.binding?.value, token.binding?.key, token.binding?.label];
      for (let i = 0; i < candidates.length; i += 1) {
        const c = candidates[i];
        if (c === undefined || c === null) continue;
        const res = interpolate(c, lookup);
        if (res !== undefined && res !== null && res !== "") return res;
      }
      return null;
    }

    function renderToString(blueprint, runtime = {}) {
      if (!isPlainObject(blueprint)) return "";
      const lookup = buildLookup(runtime);
      const widthCss = toCssMm(blueprint.page?.widthMm);
      const heightCss = toCssMm(blueprint.page?.heightMm);
      const bgColor = blueprint.background?.color || "transparent";
      const bgSrc = blueprint.background?.src;
      const fit = String(blueprint.background?.fit || "cover").toLowerCase();
      let backgroundSize = "cover";
      let backgroundRepeat = "no-repeat";
      if (fit === "contain") backgroundSize = "contain";
      else if (fit === "stretch" || fit === "fill") backgroundSize = "100% 100%";
      else if (fit === "repeat" || fit === "tile") { backgroundSize = "auto"; backgroundRepeat = "repeat"; }
      else if (fit === "none") backgroundSize = "auto";

      const safe = isPlainObject(blueprint.page?.safe) ? blueprint.page.safe : {};
      const padTop = toCssMm(safe.top) || "0";
      const padRight = toCssMm(safe.right) || "0";
      const padBottom = toCssMm(safe.bottom) || "0";
      const padLeft = toCssMm(safe.left) || "0";

      const containerStyle = [
        "position:relative",
        "display:block",
        "padding:0",
        "margin:0 auto",
        "overflow:hidden",
        "box-sizing:border-box",
        `background-color:${bgColor}`,
        bgSrc ? `background-image:url('${bgSrc}')` : "background-image:none",
        `background-size:${backgroundSize}`,
        `background-repeat:${backgroundRepeat}`,
        "background-position:center",
        widthCss ? `width:${widthCss}` : null,
        heightCss ? `height:${heightCss}` : null,
      ].filter(Boolean).join(";");

      const rootStyle = [
        "position:relative",
        "width:100%",
        "height:100%",
        "box-sizing:border-box",
        `padding:${padTop} ${padRight} ${padBottom} ${padLeft}`,
      ].join(";");

      const tokens = Array.isArray(blueprint.tokens) ? blueprint.tokens : [];
      const tokensHTML = tokens.map((t) => tokenToHTML(t, lookup)).filter(Boolean).join("");

      return `<div class="dynamic-container" data-dynamic="true" style="${containerStyle}"><div class="dynamic-container__tokens" style="${rootStyle}">${tokensHTML}</div></div>`;
    }

    return { renderToString };
  })();

  // Expor no global para uso em outros módulos se necessário
  global.DynamicRenderer = DynamicRenderer;

  registry.registerCommon("layout.header", {
    contract: {
      description: "Cabeçalho padrão do relatório com logo e informações da proposta.",
      props: {
        dados: "object|required",
        config: "object|optional",
        pagina: "number|optional",
      },
    },
    render({ dados, config = {}, pagina = 1 } = {}) {
      if (!dados) return "";
      // Rota de blueprint dinâmica (sem código), aplicada quando configurada
      const headerConf = config?.components?.header;
      const usarBlueprint = headerConf?.type === "blueprint" && headerConf?.blueprint;
      if (usarBlueprint) {
        const runtime = { dados, config, tokens: headerConf.tokens || {}, query: config.query || {} };
        const html = DynamicRenderer.renderToString(headerConf.blueprint, runtime);
        if (html && html.length) return html;
      }

      const mostrarLogo = config.imprimirLogoEmTodas || pagina === 1;
      const mostrarTitulo = pagina === 1;

      return `
        <header id="head">
          <div id="details">
            <div class="wvicon">
              <img style="z-index: 10;" src="../../assets/images/logowhite_evo.svg" alt="Logo" />
            </div>
            <div class="detailheader" style="background-color: ${dados.cores.corSecundaria};"></div>
            <div class="detailheaderblue" style="background-color: ${dados.cores.corPrimaria};"></div>
          </div>
          ${
            mostrarLogo
              ? `<div style="display: flex; justify-content: space-between;">
                  <div style="padding-top: 54px; padding-left: 50px; font-size: 14px;">
                    ${
                      mostrarTitulo
                        ? `<h2>${I18N.t(dados.licenca?.pais, "proposal")} ${dados.id}</h2>`
                        : ""
                    }
                  </div>
                  <div style="padding-top: 34px; padding-right: 50px;">
                    <img src="${dados.licenca.logoUrl}" style="height: 100px;" alt="Logo Licença" />
                  </div>
                </div>`
              : ""
          }
        </header>
      `;
    },
  });

  registry.registerCommon("layout.footer", {
    contract: {
      description: "Rodapé padrão do relatório com dados da licença e paginação.",
      props: {
        licenca: "object|optional",
        pagina: "number|optional",
        totalPaginas: "number|optional",
        codigoPais: "number|optional",
      },
    },
    render({ licenca = {}, pagina = 1, totalPaginas = 1, codigoPais = null } = {}) {
      return `
        <footer class="footer">
          <div class="footer-image">
            <svg xmlns="http://www.w3.org/2000/svg" width="794" height="78" viewBox="0 0 1637 158" fill="none" style="shape-rendering:geometricPrecision">
              <line x1="100.999" y1="13.2461" x2="1229" y2="13.2461" stroke="#BB961E" stroke-width="3" data-cor="secundaria" vector-effect="non-scaling-stroke" />
              <path d="M1221.68 12.4055C1224.76 4.90059 1232.07 0 1240.18 0H1646C1657.05 0 1666 8.95431 1666 20V111C1666 122.046 1657.05 131 1646 131H1202.83C1188.6 131 1178.92 116.566 1184.33 103.406L1221.68 12.4055Z" data-cor="primaria" fill="#004080" />
              <path d="M1221.68 12.4055C1224.76 4.90059 1232.07 0 1240.18 0H1646C1657.05 0 1666 8.95431 1666 20V111C1666 122.046 1657.05 131 1646 131H1202.83C1188.6 131 1178.92 116.566 1184.33 103.406L1221.68 12.4055Z" data-cor="primaria" fill="#004080" />
              <line x1="103.324" y1="12.9216" x2="57.3239" y2="128.922" stroke="#BB961E" stroke-width="3" data-cor="secundaria" vector-effect="non-scaling-stroke" />
              <path d="M101.215 551.462C96.5717 547.584 93.9327 541.814 94.037 535.765L100.651 151.997C100.841 140.953 109.949 132.154 120.993 132.345L143.766 132.737C154.81 132.927 163.609 142.035 163.418 153.079L156.488 555.206C156.198 572.009 136.571 580.984 123.672 570.213L101.215 551.462Z" data-cor="secundaria" fill="#BB961E" />
              <path d="M12.9924 544.703C5.64594 541.446 0.962086 534.109 1.10056 526.074L7.65114 145.997C7.84148 134.953 16.9488 126.154 27.9928 126.345L107.67 127.718C118.715 127.908 127.513 137.016 127.323 148.06L120.192 561.827C119.945 576.142 105.178 585.568 92.0894 579.767L12.9924 544.703Z" data-cor="primaria" fill="#004080" />
            </svg>
          </div>
          <div class="footer-page-number" >
            <span>${I18N.t(codigoPais, "page")} ${pagina} ${I18N.t(codigoPais, "of")} ${totalPaginas}</span>
          </div>
          <div class="footer-info">
            <div class="footer-info-left">
              <strong>${licenca.nome ?? ""}</strong><br />
              ${licenca.fone ?? ""}<br />
              ${licenca.email ?? ""}
            </div>
            <div class="footer-info-right">
              <div>${licenca.site ?? ""}</div>
            </div>
          </div>
          <div class="footer-site">
            <span>© Wvetro - Sistema para Vidraçarias e Serralherias</span>
          </div>
        </footer>
      `;
    },
  });

  // Bloco dinâmico genérico: permite usar blueprint em manifests/components
  registry.registerCommon("dynamic.block", {
    contract: {
      description: "Renderiza um bloco a partir de um blueprint JSON genérico.",
      props: { blueprint: "object|required", context: "object|optional" },
    },
    render({ blueprint, context = {} } = {}) {
      if (!blueprint) return "";
      const html = global.DynamicRenderer?.renderToString?.(blueprint, context) || "";
      return html;
    },
  });

  registry.registerCommon("assinar.bloco", {
    contract: {
      description: "Bloco padrão de assinaturas para contratante e contratado.",
      props: {},
    },
    render() {
      return `
        <div id="assinatura" class="assinatura-container">
          <div class="assinatura-bloco">
            <div class="linha-assinatura">
              <strong>CONTRATANTE</strong>
            </div>
          </div>

          <div class="assinatura-bloco">
            <div class="linha-assinatura">
              <strong>CONTRATADO</strong>
            </div>
          </div>
        </div>
      `;
    },
  });
})(window);
