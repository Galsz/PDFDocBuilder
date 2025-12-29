
(function propostaModule(global) {
  const { ComponentRegistry, Utils, I18N } = global;

  const DEFAULT_COVER_IMAGE = "./../../assets/images/building.png";
  const MANIFEST_BASE_PATH = "./../../manifests";
  const DEFAULT_REPORT_TYPE = "orcamento";
  const DEFAULT_MANIFEST_VERSION = "v1";

  function cloneDeep(value) {
    if (value === undefined || value === null) return value;
    return JSON.parse(JSON.stringify(value));
  }

  function toArray(input) {
    if (Array.isArray(input)) return input;
    if (input === undefined || input === null) return [];
    return [input];
  }

  function setValueByPath(target, path, value) {
    if (!target || !path) return;
    const normalized = path.replace(/\[(\d+)\]/g, ".$1");
    const segments = normalized.split(".").filter(Boolean);
    if (!segments.length) return;
    let current = target;
    for (let index = 0; index < segments.length; index += 1) {
      const segment = segments[index];
      const isLast = index === segments.length - 1;
      if (isLast) {
        current[segment] = value;
      } else {
        const nextSegment = segments[index + 1];
        const shouldBeArray = /^\d+$/.test(nextSegment);
        if (!current[segment] || typeof current[segment] !== "object") {
          current[segment] = shouldBeArray ? [] : {};
        }
        current = current[segment];
      }
    }
  }

  function isPlainObject(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
  }

  const COVER_CARD_SELECTORS = [".card-left", ".card-middle", ".card-right"];

  function toCssMm(value) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      return `${numeric}mm`;
    }
    return null;
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

  const DYNAMIC_ANCHOR_TRANSFORMS = {
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
    if (!anchor) {
      return { x: 0, y: 0 };
    }
    const normalized = String(anchor).trim().toLowerCase();
    if (DYNAMIC_ANCHOR_TRANSFORMS[normalized]) {
      const [x, y] = DYNAMIC_ANCHOR_TRANSFORMS[normalized];
      return { x, y };
    }
    return { x: 0, y: 0 };
  }

  const DynamicCover = {
    render(blueprint, runtimeContext = {}) {
      if (!isPlainObject(blueprint)) {
        console.warn("DynamicCover.render recebeu blueprint inválido", blueprint);
        return false;
      }
      const container = document.getElementById("capa");
      if (!container) {
        console.warn("DynamicCover.render não encontrou container #capa");
        return false;
      }

      this.prepareContainer(container, blueprint);

      const tokensRoot = this.createTokensRoot(container, blueprint);
      const lookup = this.buildLookup(runtimeContext);
      const tokens = Array.isArray(blueprint.tokens) ? blueprint.tokens : [];

      tokens.forEach((token) => {
        const element = this.createTokenElement(token, lookup);
        if (element) {
          tokensRoot.appendChild(element);
        }
      });

      return true;
    },

    prepareContainer(container, blueprint) {
      container.classList.add("dynamic-cover");
      container.setAttribute("data-dynamic-cover", "true");
      container.innerHTML = "";
      container.style.position = "relative";
      container.style.display = "block";
      container.style.padding = "0";
      container.style.margin = "0 auto";
      container.style.overflow = "hidden";
      container.style.boxSizing = "border-box";
      container.style.backgroundColor =
        blueprint.background?.color || "transparent";

      if (blueprint.background?.src) {
        container.style.backgroundImage = `url('${blueprint.background.src}')`;
      } else {
        container.style.backgroundImage = "none";
      }

      const fit = String(blueprint.background?.fit || "cover").toLowerCase();
      let backgroundSize = "cover";
      let backgroundRepeat = "no-repeat";

      if (fit === "contain") {
        backgroundSize = "contain";
      } else if (fit === "stretch" || fit === "fill") {
        backgroundSize = "100% 100%";
      } else if (fit === "repeat" || fit === "tile") {
        backgroundSize = "auto";
        backgroundRepeat = "repeat";
      } else if (fit === "none") {
        backgroundSize = "auto";
      }

      container.style.backgroundRepeat = backgroundRepeat;
      container.style.backgroundSize = backgroundSize;
      container.style.backgroundPosition = "center";

      const widthCss = toCssMm(blueprint.page?.widthMm);
      const heightCss = toCssMm(blueprint.page?.heightMm);

      if (widthCss) {
        container.style.width = widthCss;
      } else {
        container.style.removeProperty("width");
      }

      if (heightCss) {
        container.style.height = heightCss;
      } else {
        container.style.removeProperty("height");
      }
    },

    createTokensRoot(container, blueprint) {
      const tokensRoot = document.createElement("div");
      tokensRoot.classList.add("dynamic-cover__tokens");
      tokensRoot.style.position = "relative";
      tokensRoot.style.width = "100%";
      tokensRoot.style.height = "100%";
      tokensRoot.style.boxSizing = "border-box";

      const safe = isPlainObject(blueprint.page?.safe)
        ? blueprint.page.safe
        : {};

      const paddingTop = toCssMm(safe.top) || "0";
      const paddingRight = toCssMm(safe.right) || "0";
      const paddingBottom = toCssMm(safe.bottom) || "0";
      const paddingLeft = toCssMm(safe.left) || "0";

      tokensRoot.style.padding = `${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft}`;

      container.appendChild(tokensRoot);
      return tokensRoot;
    },

    buildLookup(runtimeContext = {}) {
      const aggregate = {
        dados: runtimeContext.dados || {},
        config: runtimeContext.config || {},
        query: runtimeContext.query || {},
        tokens: runtimeContext.tokens || {},
      };

  const map = new Map();
      const visited = new WeakSet();

      const register = (key, value) => {
        if (value === undefined || value === null) return;
        if (!key) return;
        const normalized = String(key).trim().toLowerCase();
        if (!normalized) return;
        if (!map.has(normalized)) {
          map.set(normalized, value);
        }
      };

      const sanitize = (key) => String(key).trim().toLowerCase().replace(/[^a-z0-9]/g, "");

      const traverse = (prefix, value) => {
        if (value === undefined || value === null) {
          return;
        }

        if (typeof value === "object") {
          if (visited.has(value)) {
            return;
          }
          visited.add(value);
        }

        if (
          typeof value !== "object" ||
          value instanceof Date ||
          value instanceof RegExp
        ) {
          if (prefix) {
            // registro do caminho completo
            register(prefix, value);

            // aliases baseados nos segmentos
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

            if (sanitize(last) === "id") {
              register("orcamentoid", value);
            }
          }
          return;
        }

        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            const nextPrefix = prefix ? `${prefix}[${index}]` : `[${index}]`;
            traverse(nextPrefix, item);
          });
          return;
        }

        Object.keys(value).forEach((key) => {
          const nextPrefix = prefix ? `${prefix}.${key}` : key;
          traverse(nextPrefix, value[key]);
        });
      };

      traverse("dados", aggregate.dados);
      traverse("config", aggregate.config);
      traverse("query", aggregate.query);
      traverse("tokens", aggregate.tokens);

      // Special tokens for cover blueprints
      try {
        const codigoPais = aggregate?.dados?.licenca?.pais ?? aggregate?.config?.codigoPais ?? null;
        const moeda = aggregate?.config?.moeda ?? null;
        const now = new Date();
        const locale = Utils?.paisesConfig?.[codigoPais]?.locale || Utils?.paisesConfig?.[1058]?.locale || "pt-BR";
        const dateStr = new Intl.DateTimeFormat(locale, { dateStyle: "short" }).format(now);
        const timeStr = new Intl.DateTimeFormat(locale, { timeStyle: "short" }).format(now);
        const dateTimeStr = new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(now);
        const currencySymbol =
          (Utils?.getCurrencySymbol && Utils.getCurrencySymbol(codigoPais, moeda)) ||
          (Utils?.paisesConfig?.[codigoPais]?.symbol) ||
          (Utils?.paisesConfig?.[1058]?.symbol) ||
          "R$";

        const registerSpecial = (k, v) => {
          const n = String(k).trim().toLowerCase();
          if (n) map.set(n, v);
        };
        registerSpecial("now", dateTimeStr);
        registerSpecial("datetime", dateTimeStr);
        registerSpecial("date", dateStr);
        registerSpecial("today", dateStr);
        registerSpecial("time", timeStr);
        registerSpecial("currencysymbol", currencySymbol);
        registerSpecial("currency", currencySymbol);
      } catch (e) {
        // ignore
      }

      return (rawExpression) => {
        if (rawExpression === undefined || rawExpression === null) {
          return undefined;
        }

        const expression = String(rawExpression)
          .replace(/^\s*\{\{/, "")
          .replace(/\}\}\s*$/, "")
          .trim();

        if (!expression) return undefined;

        const normalized = expression.toLowerCase();
        if (map.has(normalized)) {
          return map.get(normalized);
        }

        const fromPath = Utils.getValueByPath(aggregate, expression);
        if (!Utils.isNil(fromPath)) {
          return fromPath;
        }

        const fromLowerPath = Utils.getValueByPath(
          aggregate,
          expression.toLowerCase()
        );
        if (!Utils.isNil(fromLowerPath)) {
          return fromLowerPath;
        }

        return undefined;
      };
    },

    createTokenElement(token, lookup) {
      if (!token || typeof token !== "object") {
        return null;
      }

      const type = String(token.type || "text").toLowerCase();
      const wrapper = document.createElement("div");
      wrapper.classList.add("dynamic-cover__token", `dynamic-cover__token--${type}`);
      if (token.id) {
        wrapper.dataset.tokenId = token.id;
      }
      wrapper.style.position = "absolute";
      wrapper.style.pointerEvents = "none";
      wrapper.style.display = "inline-block";
      wrapper.style.whiteSpace = "pre-wrap";
      wrapper.style.wordBreak = "break-word";

      const left = toCssMm(token.xMm ?? token.leftMm ?? token.x);
      const top = toCssMm(token.yMm ?? token.topMm ?? token.y);

      if (left) {
        wrapper.style.left = left;
      }
      if (top) {
        wrapper.style.top = top;
      }

      if (token.zIndex !== undefined) {
        wrapper.style.zIndex = String(token.zIndex);
      }

      const { x, y } = resolveAnchorTransform(token.anchor);
      if (x !== 0 || y !== 0) {
        wrapper.style.transform = `translate(${x}%, ${y}%)`;
      }

      const styleConfig = isPlainObject(token.style) ? token.style : {};

      // Resolver conteúdo antes para detectar imagem implicitamente
      const previewContent = this.resolveTokenContent(token, lookup);
      const renderAsImage =
        type === "image" ||
        token.render === "image" ||
        token.format === "image" ||
        token.asImage === true ||
        isLikelyImageSrc(previewContent);

      if (renderAsImage) {
        const src = previewContent;
        if (!src) {
          return null;
        }

        const img = document.createElement("img");
        img.src = src;
        img.alt = token.binding?.label || token.binding?.key || token.id || "";
        img.style.display = "block";
        img.style.width = "100%";
        img.style.height = "100%";

        if (styleConfig.objectFit) {
          img.style.objectFit = styleConfig.objectFit;
        }
        if (styleConfig.objectPosition) {
          img.style.objectPosition = styleConfig.objectPosition;
        }
        if (styleConfig.borderRadius) {
          img.style.borderRadius = styleConfig.borderRadius;
        }

        wrapper.appendChild(img);
        this.applyTokenStyles(wrapper, styleConfig, type);
        return wrapper;
      }

      const content = previewContent;
      if (content === null || content === undefined) {
        if (token.hideIfEmpty) {
          return null;
        }
        wrapper.textContent = "";
      } else {
        wrapper.textContent = String(content);
      }

      this.applyTokenStyles(wrapper, styleConfig, type);
      return wrapper;
    },

    resolveTokenContent(token, lookup) {
      const candidates = [
        token.value,
        token.binding?.value,
        token.binding?.key,
        token.binding?.label,
      ];

      for (let index = 0; index < candidates.length; index += 1) {
        const candidate = candidates[index];
        if (candidate === undefined || candidate === null) continue;
        const resolved = this.interpolate(candidate, lookup);
        if (resolved !== undefined && resolved !== null && resolved !== "") {
          return resolved;
        }
      }

      return null;
    },

    interpolate(template, lookup) {
      if (template === undefined || template === null) {
        return template;
      }

      if (typeof template !== "string") {
        return template;
      }

      if (!template.includes("{{")) {
        return template;
      }

      let hadReplacement = false;
      const result = template.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, expression) => {
        const value = lookup(expression);
        hadReplacement = true;
        if (value === undefined || value === null) {
          return "";
        }
        return String(value);
      });

      if (!hadReplacement) {
        return template;
      }

      return result;
    },

    applyTokenStyles(target, styleConfig, type) {
      if (!isPlainObject(styleConfig) || !target) {
        return;
      }

      const mmMap = {
        fontSizeMm: "fontSize",
        lineHeightMm: "lineHeight",
        maxWidthMm: "maxWidth",
        maxHeightMm: "maxHeight",
        widthMm: "width",
        heightMm: "height",
        letterSpacingMm: "letterSpacing",
        paddingMm: "padding",
        marginMm: "margin",
      };

      Object.keys(styleConfig).forEach((key) => {
        const value = styleConfig[key];
        if (value === undefined || value === null) {
          return;
        }
        
        if (mmMap[key]) {
          const cssValue = toCssMm(value);
          if (cssValue) {
            target.style[mmMap[key]] = cssValue;
          }
          return;
        }

        if (key.endsWith("Mm")) {
          const cssKey = key.slice(0, -2);
          const cssValue = toCssMm(value);
          if (cssValue) {
            target.style[cssKey] = cssValue;
          }
          return;
        }

        if (key === "opacity") {
          target.style.opacity = String(value);
          return;
        }

        if (key === "color") {
            target.style.color = value;
            return;
        } 

        if (typeof value === "number" && key !== "fontWeight") {
          target.style[key] = `${value}`;
          return;
        }

        if (typeof value === "string" || key === "fontWeight") {
          target.style[key] = String(value);
        }
      });

      if (type === "text" && !styleConfig.textAlign) {
        target.style.textAlign = "left";
      }
      
    },
  };

  function interpolateTemplate(template, context) {
    if (typeof template !== "string") return template;
    return template.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, rawExpression) => {
      const expression = rawExpression.trim();
      if (!expression) return "";
      if (expression === "value") {
        return context.value ?? "";
      }
      return LayoutEngine.resolvePlaceholder(expression, context);
    });
  }

  const coverBaseActions = [
    {
      type: "style",
      targets: [".card-left", ".card-middle", ".card-right"],
      style: {
        backgroundImage: {
          valuePath: "imagemCapa",
          fallback: DEFAULT_COVER_IMAGE,
          prefix: "url('",
          suffix: "')",
        },
        backgroundRepeat: "no-repeat",
        backgroundSize: "794px auto",
        backgroundPositionY: "center",
      },
    },
    {
      type: "style",
      target: ".card-left",
      style: {
        backgroundPositionX: "left",
      },
    },
    {
      type: "style",
      target: ".card-middle",
      style: {
        backgroundPositionX: "center",
      },
    },
    {
      type: "style",
      target: ".card-right",
      style: {
        backgroundPositionX: "right",
      },
    },
    {
      type: "setText",
      target: "#title",
      valuePath: "titulo",
      defaultValue: "",
    },
    {
      type: "setText",
      target: "#subtitle",
      valuePath: "subtitulo",
      defaultValue: "",
    },
    {
      type: "setText",
      target: "#orcamento-nro",
      valuePath: "id",
      defaultValue: "",
    },
    {
      type: "setText",
      target: "#canais-comunicacao-label",
      translationKey: "communicationChannels",
      defaultValue: "Canais de comunicação",
    },
    {
      type: "setHTML",
      target: "#licenca-whatsapp",
      valuePath: "licenca.whatsapp",
      format: "telefone",
      prefix: '<i class="icon-capa color-primaria fab fa-whatsapp"></i> ',
      skipIfEmpty: true,
    },
    {
      type: "setHTML",
      target: "#licenca-fone",
      valuePath: "licenca.fone",
      format: "telefone",
      prefix: '<i class="icon-capa color-primaria fas fa-phone-alt"></i> ',
      skipIfEmpty: true,
    },
    {
      type: "setHTML",
      target: "#licenca-email",
      valuePath: "licenca.email",
      prefix: '<i class="icon-capa color-primaria fas fa-envelope"></i> ',
      skipIfEmpty: true,
    },
    {
      type: "setHTML",
      target: "#licenca-site",
      valuePath: "licenca.site",
      prefix: '<i class="icon-capa color-primaria fas fa-globe"></i> ',
      skipIfEmpty: true,
    },
    {
      type: "setHTML",
      target: "#licenca-endereco",
      valuePath: "licenca.endereco",
      prefix: '<i class="icon-capa color-primaria fas fa-map-marker-alt"></i> ',
      skipIfEmpty: true,
    },
    {
      type: "setHTML",
      target: "#licenca-cnpj",
      valuePath: "licenca.cnpj",
      prefix: '<i class="icon-capa color-primaria fas fa-building"></i> ',
      skipIfEmpty: true,
    },
    {
      type: "setHTML",
      target: "#licenca-instagram",
      valuePath: "licenca.instagram",
      template:
        '<i class="icon-capa color-primaria fab fa-instagram"></i> <a href="https://www.instagram.com/{{value}}/" target="_blank">{{value}}</a>',
      skipIfEmpty: true,
    },
    {
      type: "setHTML",
      target: "#logo-capa",
      valuePath: "licenca.logoUrl",
      template: '<img src="{{value}}" alt="Logo" class="logo-capa">',
      skipIfEmpty: true,
    },
  ];

  const imageCenterActions = cloneDeep(coverBaseActions).map((action) => {
    if (action.type === "style" && action.style?.backgroundPositionX) {
      action.style.backgroundPositionX = "center";
    }
    if (action.type === "style" && action.targets) {
      action.style.backgroundSize = "cover";
      action.style.backgroundPositionX = "center";
    }
    return action;
  });

  const COVER_PRESETS = {
    splitPanels: {
      id: "cover",
      meta: { variant: "split-panels" },
      actions: cloneDeep(coverBaseActions),
    },
    imageCenter: {
      id: "cover",
      meta: { variant: "image-center" },
      actions: imageCenterActions,
    },
    geomDefault: {
      id: "cover",
      meta: { variant: "geom-default" },
      actions: (() => {
        const actions = cloneDeep(coverBaseActions).map((action) => {
          if (action.type === "style" && action.targets) {
            action.style.backgroundSize = "cover";
            action.style.backgroundPosition = "center";
            action.style.backgroundRepeat = "no-repeat";
          }
          if (action.type === "style" && action.target === ".card-middle") {
            action.style.backgroundBlendMode = "multiply";
            action.style.backgroundColor = "rgba(0, 0, 0, 0.35)";
          }
          return action;
        });

        actions.push({
          type: "setAttribute",
          target: "body",
          attribute: "data-cover-variant",
          value: "geom-default",
        });

        return actions;
      })(),
    },
  };

  const DEFAULT_COVER_VARIANT = "splitPanels";

  function applyBackgroundOverrides(actions, background = {}) {
    if (!isPlainObject(background)) return actions;
    return actions.map((action) => {
      if (action.type !== "style") return action;
      const targets = toArray(action.targets || action.target);
      if (!targets.some((selector) => COVER_CARD_SELECTORS.includes(selector))) {
        return action;
      }

      const nextAction = { ...action, style: { ...(action.style || {}) } };

      if (background.size) {
        nextAction.style.backgroundSize = background.size;
      }
      if (background.repeat) {
        nextAction.style.backgroundRepeat = background.repeat;
      }
      if (background.position) {
        nextAction.style.backgroundPosition = background.position;
      }
      if (background.positionX) {
        nextAction.style.backgroundPositionX = background.positionX;
      }
      if (background.positionY) {
        nextAction.style.backgroundPositionY = background.positionY;
      }
      if (background.color) {
        nextAction.style.backgroundColor = background.color;
      }
      if (background.image) {
        if (isPlainObject(nextAction.style.backgroundImage)) {
          nextAction.style.backgroundImage = {
            ...nextAction.style.backgroundImage,
            fallback: background.image,
          };
        } else {
          nextAction.style.backgroundImage = `url('${background.image}')`;
        }
      }
      if (isPlainObject(background.positions) && targets.length === 1) {
        const selector = targets[0];
        const override = background.positions[selector.replace(".card-", "")];
        if (override) {
          nextAction.style.backgroundPositionX = override;
        }
      }

      return nextAction;
    });
  }

  function mergeActions(baseActions, configActions = [], replace = false) {
    if (!Array.isArray(configActions) || configActions.length === 0) {
      return cloneDeep(baseActions || []);
    }
    if (replace) {
      return cloneDeep(configActions);
    }
    return [...cloneDeep(baseActions || []), ...cloneDeep(configActions)];
  }

  function normalizeTokens(rawTokens = {}) {
    if (!isPlainObject(rawTokens)) return {};
    return cloneDeep(rawTokens);
  }

  

  const CoverLayout = {
    validate(coverConfig) {
      if (coverConfig == null) return { valid: false, errors: [] };
      if (!isPlainObject(coverConfig)) {
        return {
          valid: false,
          errors: ["config.cover deve ser um objeto"],
        };
      }

      const errors = [];
      if (coverConfig.variant && typeof coverConfig.variant !== "string") {
        errors.push("cover.variant deve ser string");
      }
      if (coverConfig.background && !isPlainObject(coverConfig.background)) {
        errors.push("cover.background deve ser objeto");
      }
      if (
        coverConfig.tokens &&
        !isPlainObject(coverConfig.tokens) &&
        !Array.isArray(coverConfig.tokens)
      ) {
        errors.push("cover.tokens deve ser um objeto ou array");
      }
      if (coverConfig.actions && !Array.isArray(coverConfig.actions)) {
        errors.push("cover.actions deve ser array");
      }
      if (coverConfig.elements && !Array.isArray(coverConfig.elements)) {
        errors.push("cover.elements deve ser array");
      }
      if (coverConfig.overlays && !Array.isArray(coverConfig.overlays)) {
        errors.push("cover.overlays deve ser array");
      }
      if (coverConfig.regions && !isPlainObject(coverConfig.regions)) {
        errors.push("cover.regions deve ser objeto");
      }
      if (coverConfig.meta && !isPlainObject(coverConfig.meta)) {
        errors.push("cover.meta deve ser objeto");
      }

      return { valid: errors.length === 0, errors };
    },

    normalize(rawCover = {}) {
      if (rawCover == null) return null;
      const source = this.extractDefinition(rawCover);
      const { valid, errors } = this.validate(source);
      if (!valid) {
        console.warn("Configuração de capa inválida:", errors);
        return null;
      }

      let resolvedVariant = DEFAULT_COVER_VARIANT;
      if (typeof source.preset === "string") {
        resolvedVariant = source.preset;
      }
      if (typeof source.variant === "string") {
        resolvedVariant = source.variant;
      }

      const cover = {
        enabled: source.enabled !== false,
        variant: resolvedVariant,
        background: isPlainObject(source.background) ? cloneDeep(source.background) : {},
        tokens: {},
        actions: Array.isArray(source.actions) ? cloneDeep(source.actions) : [],
        replaceDefaultActions: source.replaceDefaultActions === true,
        elements: [],
        regions: isPlainObject(source.regions) ? cloneDeep(source.regions) : {},
        meta: isPlainObject(source.meta) ? cloneDeep(source.meta) : {},
        blueprint: null,
      };

      const tokensInput =
        source.tokens ??
        source.bindings ??
        source.data ??
        source.values ??
        null;

      if (Array.isArray(tokensInput)) {
        cover.tokens = this.tokensFromArray(tokensInput);
        cover.elements = cover.elements.concat(cloneDeep(tokensInput));
      } else {
        cover.tokens = normalizeTokens(tokensInput);
      }

      if (Array.isArray(source.elements)) {
        cover.elements = cover.elements.concat(cloneDeep(source.elements));
      }

      if (Array.isArray(source.overlays)) {
        cover.elements = cover.elements.concat(cloneDeep(source.overlays));
      }

      if (source.blueprint) {
        if (typeof source.blueprint === "string") {
          try {
            cover.blueprint = JSON.parse(source.blueprint);
          } catch (error) {
            console.warn("Falha ao analisar cover.blueprint string:", error);
          }
        } else if (
          isPlainObject(source.blueprint) ||
          Array.isArray(source.blueprint)
        ) {
          cover.blueprint = cloneDeep(source.blueprint);
        }
      }

      if (isPlainObject(source.placeholders)) {
        Object.entries(source.placeholders).forEach(([path, value]) => {
          setValueByPath(cover.tokens, path, value);
        });
      }

      if (typeof source.title === "string") {
        setValueByPath(cover.tokens, "titulo", source.title);
      }
      if (typeof source.subtitle === "string") {
        setValueByPath(cover.tokens, "subtitulo", source.subtitle);
      }
      if (typeof source.number === "string" || typeof source.number === "number") {
        setValueByPath(cover.tokens, "id", source.number);
      }
      if (typeof source.logoUrl === "string") {
        setValueByPath(cover.tokens, "licenca.logoUrl", source.logoUrl);
      }
      if (isPlainObject(source.licenca)) {
        cover.tokens.licenca = {
          ...(cover.tokens.licenca || {}),
          ...cloneDeep(source.licenca),
        };
      }

      return cover.enabled ? cover : null;
    },

    extractDefinition(rawCover) {
      if (!isPlainObject(rawCover)) return rawCover;

      const sources = [
        rawCover.definition,
        rawCover.layout,
        rawCover.settings,
        rawCover.config,
        rawCover,
      ];

      const definition = {};
      let blueprintValue = rawCover.blueprint;

      sources.forEach((source) => {
        if (!isPlainObject(source)) return;
        Object.entries(source).forEach(([key, value]) => {
          if (value === undefined) return;
          if (source === rawCover && ["definition", "layout", "settings", "config", "blueprint"].includes(key)) {
            return;
          }
          if (key === "blueprint") {
            if (blueprintValue === undefined) {
              blueprintValue = value;
            }
            return;
          }
          definition[key] = cloneDeep(value);
        });
      });

      if (blueprintValue !== undefined) {
        definition.blueprint = cloneDeep(blueprintValue);
      }

      return definition;
    },

    tokensFromArray(entries = []) {
      const tokens = {};
      entries.forEach((entry) => {
        if (!entry || typeof entry !== "object") return;
        const path = entry.path || entry.binding || entry.valuePath || entry.key || entry.name;
        if (typeof path !== "string") return;
        if (entry.value !== undefined) {
          setValueByPath(tokens, path, entry.value);
        } else if (entry.defaultValue !== undefined) {
          setValueByPath(tokens, path, entry.defaultValue);
        } else if (entry.fallback !== undefined) {
          setValueByPath(tokens, path, entry.fallback);
        } else if (entry.content !== undefined) {
          setValueByPath(tokens, path, entry.content);
        }
      });
      return normalizeTokens(tokens);
    },

    build(rawCover, context) {
      const normalized = this.normalize(rawCover);
      if (!normalized) return null;

      const variantKey = COVER_PRESETS[normalized.variant]
        ? normalized.variant
        : DEFAULT_COVER_VARIANT;

      const basePreset = cloneDeep(COVER_PRESETS[variantKey]);
      const actions = applyBackgroundOverrides(
        mergeActions(basePreset.actions, normalized.actions, normalized.replaceDefaultActions),
        normalized.background
      );

      const tokens = this.prepareTokens(normalized.tokens, context);
      const blueprint = normalized.blueprint
        ? cloneDeep(normalized.blueprint)
        : null;

      const meta = {
        ...(basePreset.meta || {}),
        ...(normalized.meta || {}),
        variant: variantKey,
        tokens,
      };

      if (Array.isArray(normalized.elements) && normalized.elements.length > 0) {
        meta.elements = cloneDeep(normalized.elements);
      }

      if (normalized.regions && Object.keys(normalized.regions).length > 0) {
        meta.regions = cloneDeep(normalized.regions);
      }

      if (blueprint) {
        meta.blueprint = blueprint;
      }

      const page = {
        id: "cover",
        meta,
        actions,
      };

      return {
        page,
        tokens,
        variant: variantKey,
        meta,
        blueprint,
      };
    },

    prepareTokens(tokensConfig = {}, context = {}) {
      const tokens = cloneDeep(tokensConfig || {});
      if (!isPlainObject(tokens.licenca)) {
        tokens.licenca = {};
      }

      const defaults = {
        titulo: context.dados?.titulo,
        subtitulo: context.dados?.subtitulo,
        id: context.dados?.id,
        imagemCapa: context.dados?.imagemCapa,
        licenca: {
          whatsapp: context.dados?.licenca?.whatsapp,
          fone: context.dados?.licenca?.fone,
          email: context.dados?.licenca?.email,
          site: context.dados?.licenca?.site,
          endereco: context.dados?.licenca?.endereco,
          cnpj: context.dados?.licenca?.cnpj,
          instagram: context.dados?.licenca?.instagram,
          logoUrl: context.dados?.licenca?.logoUrl,
        },
      };

      Object.entries(defaults).forEach(([path, value]) => {
        if (isPlainObject(value)) {
          if (!isPlainObject(tokens[path])) {
            tokens[path] = {};
          }
          Object.entries(value).forEach(([nestedKey, nestedValue]) => {
            if (Utils.isNil(tokens[path][nestedKey])) {
              tokens[path][nestedKey] = nestedValue;
            }
          });
        } else if (Utils.isNil(Utils.getValueByPath(tokens, path))) {
          setValueByPath(tokens, path, value);
        }
      });

      return tokens;
    },
  };

  const ManifestRuntime = {
    cache: new Map(),

    async load(reportType = DEFAULT_REPORT_TYPE, version = DEFAULT_MANIFEST_VERSION) {
      const key = `${reportType}@${version}`;
      if (this.cache.has(key)) {
        return this.cache.get(key);
      }

      const manifestPath = `${MANIFEST_BASE_PATH}/${reportType}/${version}.json`;

      try {
        const response = await fetch(manifestPath, { cache: "no-cache" });
        if (!response.ok) {
          throw new Error(`Manifesto não encontrado (${response.status})`);
        }
        const manifest = await response.json();
        this.cache.set(key, manifest);
        return manifest;
      } catch (error) {
        console.warn(`Falha ao carregar manifesto ${reportType}@${version}:`, error);
        this.cache.set(key, null);
        return null;
      }
    },

    resolve(value, context) {
      if (value === undefined || value === null) return value;
      if (typeof value === "string") {
        if (!value.startsWith("@")) {
          return value;
        }
        const path = value.slice(1);
        if (!path) return undefined;
        const [root, ...rest] = path.split(".");
        const target = context[root];
        if (rest.length === 0) {
          return target;
        }
        const subPath = rest.join(".");
        return Utils.getValueByPath(target, subPath, undefined);
      }
      if (Array.isArray(value)) {
        return value.map((item) => this.resolve(item, context));
      }
      if (typeof value === "object") {
        return this.resolveObject(value, context);
      }
      return value;
    },

    resolveObject(objectValue, context) {
      const result = Array.isArray(objectValue) ? [] : {};
      Object.keys(objectValue).forEach((key) => {
        result[key] = this.resolve(objectValue[key], context);
      });
      return result;
    },

    evaluate(condition, context) {
      if (condition === undefined || condition === null) {
        return true;
      }
      if (typeof condition === "string" || Array.isArray(condition)) {
        const resolved = this.resolve(condition, context);
        return Boolean(resolved);
      }
      if (typeof condition === "object") {
        if (condition.allOf) {
          return condition.allOf.every((item) => this.evaluate(item, context));
        }
        if (condition.anyOf) {
          return condition.anyOf.some((item) => this.evaluate(item, context));
        }
        if (Object.prototype.hasOwnProperty.call(condition, "not")) {
          return !this.evaluate(condition.not, context);
        }
        return Boolean(this.resolve(condition, context));
      }
      return Boolean(condition);
    },

    render(manifest, baseContext) {
      if (!manifest) {
        return { blocks: [], attachments: [] };
      }

      const runtimeContext = {
        dados: baseContext.dados,
        config: baseContext.config,
        context: baseContext.context || {},
        codigoPais: baseContext.codigoPais,
        item: null,
        itemIndex: null,
        parentItem: null,
      };

      const blocks = [];
      const pages = Array.isArray(manifest.pages) ? manifest.pages : [];
      pages
        .filter((page) => !page.role || page.role === "content")
        .forEach((page) => {
          this.renderSections(page.sections || [], runtimeContext, blocks);
        });

      const attachments = this.renderAttachments(manifest.attachments || [], runtimeContext);

      return { blocks, attachments };
    },

    renderSections(sections, context, accumulator) {
      if (!Array.isArray(sections) || sections.length === 0) {
        return;
      }
      sections.forEach((section) => {
        this.renderNode(section, context, accumulator);
      });
    },

    renderNode(node, context, accumulator) {
      if (!node) return;
      const type = node.type || "component";
      if (!this.evaluate(node.when, context)) {
        return;
      }

      switch (type) {
        case "component": {
          if (!node.component) return;
          const props = node.props ? this.resolveObject(node.props, context) : {};
          const block = createComponentBlock(node.component, props);
          if (block) {
            accumulator.push(block);
          }
          break;
        }
        case "section":
        case "group": {
          this.renderSections(node.sections || [], context, accumulator);
          break;
        }
        case "collection": {
          const items = toArray(this.resolve(node.items || node.collection, context));
          if (!items.length) return;
          items.forEach((item, index) => {
            const childContext = {
              ...context,
              parentItem: context.item,
              item,
              itemIndex: index,
            };
            const alias = typeof node.itemAs === "string" && node.itemAs.trim().length
              ? node.itemAs.trim()
              : "item";
            childContext[alias] = item;
            this.renderSections(node.sections || [], childContext, accumulator);
          });
          break;
        }
        case "richText": {
          const value = this.resolve(node.value, context);
          if (typeof value !== "string" || value.trim().length === 0) {
            return;
          }
          const options = node.options ? this.resolveObject(node.options, context) : {};
          const blocks = Utils.dividirEmBlocosQuebraveis(value, options);
          blocks.forEach((block) => {
            accumulator.push(block);
          });
          break;
        }
        default:
          console.warn(`Tipo de nó de manifesto não suportado: ${String(type)}`);
      }
    },

    renderAttachments(entries, context) {
      if (!Array.isArray(entries) || entries.length === 0) return [];
      const results = [];
      entries.forEach((entry) => {
        if (!entry) return;
        const type = entry.type || "component";
        if (!this.evaluate(entry.when, context)) {
          return;
        }
        if (type === "component") {
          if (!entry.component) return;
          const props = entry.props ? this.resolveObject(entry.props, context) : {};
          const block = createComponentBlock(entry.component, props);
          if (block) {
            results.push({
              node: block,
              container: entry.container || "page-relatorio",
              mode: entry.mode || "append",
            });
          }
        } else if (type === "richText") {
          const value = this.resolve(entry.value, context);
          if (typeof value !== "string" || value.trim().length === 0) {
            return;
          }
          const options = entry.options ? this.resolveObject(entry.options, context) : {};
          const blocks = Utils.dividirEmBlocosQuebraveis(value, options);
          blocks.forEach((block) => {
            results.push({
              node: block,
              container: entry.container || "page-relatorio",
              mode: entry.mode || "append",
            });
          });
        }
      });
      return results;
    },

    applyAttachments(attachments) {
      if (!Array.isArray(attachments) || attachments.length === 0) {
        return;
      }
      attachments.forEach((attachment) => {
        if (!attachment?.node) return;
        const container = document.createElement("div");
        const classes = typeof attachment.container === "string"
          ? attachment.container.split(/\s+/).filter(Boolean)
          : toArray(attachment.container);
        if (!classes.length) {
          classes.push("page-relatorio");
        }
        classes.forEach((className) => container.classList.add(className));
        appendMarkup(container, attachment.node);
        document.body.appendChild(container);
      });
    },
  };

  const LayoutEngine = {
    applyPage(manifest, pageId, context) {
      if (!manifest || !Array.isArray(manifest.pages)) return false;
      const page = manifest.pages.find((entry) => entry && entry.id === pageId);
      if (!page) return false;
      const actions = Array.isArray(page.actions) ? page.actions : [];
      const executionContext = {
        ...context,
        page,
        tokens: context.tokens || page.meta?.tokens || {},
        document: context.document || global.document,
      };
      actions.forEach((action) => {
        this.executeAction(action, executionContext);
      });
      return actions.length > 0;
    },
    executeAction(action, context) {
      if (!action) return;
      const elements = this.selectElements(action, context);
      switch (action.type) {
        case "setText":
          this.applyText(action, elements, context);
          break;
        case "setHTML":
          this.applyHTML(action, elements, context);
          break;
        case "setAttribute":
          this.applyAttribute(action, elements, context);
          break;
        case "style":
          this.applyStyle(action, elements, context);
          break;
        case "component":
          this.applyComponent(action, elements, context);
          break;
        default:
          console.warn(`Ação de layout desconhecida: ${String(action.type)}`);
      }
    },
    selectElements(action, context) {
      const selectors = toArray(action.targets || action.target);
      if (!selectors.length) return [];
      const elements = [];
      selectors.forEach((selector) => {
        if (!selector) return;
        if (typeof selector === "string") {
          elements.push(...context.document.querySelectorAll(selector));
        } else if (selector instanceof Element) {
          elements.push(selector);
        }
      });
      return elements;
    },
    applyText(action, elements, context) {
      const value = this.extractValue(action, context);
      const shouldSkip = this.shouldSkip(action, value);
      const finalValue = shouldSkip ? action.defaultValue ?? "" : value ?? action.defaultValue ?? "";
      elements.forEach((element) => {
        element.textContent = finalValue ?? "";
      });
    },
    applyHTML(action, elements, context) {
      const value = this.extractValue(action, context);
      const shouldSkip = this.shouldSkip(action, value);
      const finalValue = shouldSkip ? action.defaultValue ?? "" : value ?? action.defaultValue ?? "";
      elements.forEach((element) => {
        element.innerHTML = finalValue ?? "";
      });
    },
    applyAttribute(action, elements, context) {
      if (!action.attribute) return;
      const value = this.extractValue(action, context);
      const shouldSkip = this.shouldSkip(action, value);
      elements.forEach((element) => {
        if (shouldSkip) {
          element.removeAttribute(action.attribute);
        } else {
          element.setAttribute(action.attribute, value ?? "");
        }
      });
    },
    applyStyle(action, elements, context) {
      const style = action.style || {};
      elements.forEach((element) => {
        Object.keys(style).forEach((key) => {
          const styleValue = this.resolveDefinition(style[key], context);
          if (styleValue === undefined || styleValue === null) {
            element.style[key] = "";
          } else {
            element.style[key] = styleValue;
          }
        });
      });
    },
    applyComponent(action, elements, context) {
      if (!ComponentRegistry || !ComponentRegistry.has(action.component)) {
        console.warn(`Componente de layout não encontrado: ${String(action.component)}`);
        return;
      }
      const baseProps = this.resolveDefinition(action.props || {}, context) || {};
      const items = action.itemsPath
        ? toArray(this.getValueFromContext(action.itemsPath, context))
        : [null];
      elements.forEach((element) => {
        if (action.mode === "replace") {
          element.innerHTML = "";
        }
        items.forEach((item) => {
          const props = item
            ? { ...baseProps, [action.itemAs || "item"]: item }
            : baseProps;
          const block = createComponentBlock(action.component, props);
          appendMarkup(element, block);
        });
      });
    },
    resolveDefinition(definition, context) {
      if (definition === undefined || definition === null) return definition;
      if (typeof definition === "string") {
        return this.interpolate(definition, context);
      }
      if (Array.isArray(definition)) {
        return definition.map((item) => this.resolveDefinition(item, context));
      }
      if (typeof definition === "object") {
        if (
          Object.prototype.hasOwnProperty.call(definition, "value") ||
          Object.prototype.hasOwnProperty.call(definition, "valuePath") ||
          Object.prototype.hasOwnProperty.call(definition, "template") ||
          Object.prototype.hasOwnProperty.call(definition, "translationKey")
        ) {
          return this.extractValue(definition, context);
        }
        const result = {};
        Object.keys(definition).forEach((key) => {
          result[key] = this.resolveDefinition(definition[key], context);
        });
        return result;
      }
      return definition;
    },
    extractValue(definition, context) {
      if (definition === undefined || definition === null) return definition;
      if (typeof definition === "string") {
        return this.interpolate(definition, context);
      }
      if (typeof definition !== "object") {
        return definition;
      }

    const def = definition;
    const codigoPais = context.codigoPais ?? context.uf;

    const { value: initialValue } = def;
    let value = initialValue;

      if (def.valuePath || def.path) {
        value = this.getValueFromContext(def.valuePath || def.path, context);
      }

      if (value === undefined && def.translationKey) {
        value = I18N?.t?.(codigoPais, def.translationKey, def.translationFallback ?? null);
      }

      if ((value === undefined || value === null) && def.fallback !== undefined) {
        value = this.resolveDefinition(def.fallback, context);
      }

      if (def.interpolate !== false && typeof value === "string") {
        value = this.interpolate(value, context);
      }

      if (def.format) {
        value = Utils.formatValue(value, def.format, {
          codigoPais,
          comSimbolo: def.comSimbolo !== false,
        });
      }

      if (def.prefix || def.suffix) {
        value = `${def.prefix || ""}${value ?? ""}${def.suffix || ""}`;
      }

      if (def.template) {
        value = interpolateTemplate(def.template, { ...context, value });
      }

      return value;
    },
    interpolate(value, context) {
      if (typeof value !== "string") return value;
      return interpolateTemplate(value, context);
    },
    shouldSkip(action, value) {
      if (!action.skipIfEmpty) return false;
      return Utils.isNil(value) || (typeof value === "string" && value.trim().length === 0);
    },
    getValueFromContext(path, context) {
      if (!path) return undefined;
      if (context.resolvePath) {
        const resolved = context.resolvePath(path, context);
        if (resolved !== undefined) return resolved;
      }
      if (context.tokens) {
        const tokenValue = Utils.getValueByPath(context.tokens, path);
        if (!Utils.isNil(tokenValue)) return tokenValue;
      }
      if (path.startsWith("page.")) {
        return Utils.getValueByPath(context.page, path.slice(5));
      }
      if (path.startsWith("tokens.")) {
        const valueFromTokens = Utils.getValueByPath(context.page?.meta?.tokens || {}, path.slice(7));
        if (!Utils.isNil(valueFromTokens)) return valueFromTokens;
        const valueFromContextTokens = Utils.getValueByPath(context.tokens || {}, path.slice(7));
        if (!Utils.isNil(valueFromContextTokens)) return valueFromContextTokens;
        return undefined;
      }
      if (path.startsWith("config.")) {
        return Utils.getValueByPath(context.config, path.slice(7));
      }
      if (path.startsWith("query.")) {
        return Utils.getValueByPath(context.query, path.slice(6));
      }
      if (context.page?.meta?.tokens) {
        const valueFromPageTokens = Utils.getValueByPath(context.page.meta.tokens, path);
        if (!Utils.isNil(valueFromPageTokens)) return valueFromPageTokens;
      }
      if (context.tokens) {
        const valueFromContextTokens = Utils.getValueByPath(context.tokens, path);
        if (!Utils.isNil(valueFromContextTokens)) return valueFromContextTokens;
      }
      const fromDados = Utils.getValueByPath(context.dados, path);
      if (!Utils.isNil(fromDados)) return fromDados;
      const fromConfig = Utils.getValueByPath(context.config, path);
      if (!Utils.isNil(fromConfig)) return fromConfig;
      if (context.query) {
        if (Object.prototype.hasOwnProperty.call(context.query, path)) {
          return context.query[path];
        }
        const fromQuery = Utils.getValueByPath(context.query, path);
        if (!Utils.isNil(fromQuery)) return fromQuery;
      }
      return undefined;
    },
    resolvePlaceholder(expression, context) {
      if (!expression) return "";
      const [rawPath, rawFormat] = expression.split("|").map((item) => item.trim());
      if (!rawPath) return "";
      if (rawPath.startsWith("i18n:")) {
        const key = rawPath.slice(5);
        const translation = I18N?.t?.(context.codigoPais, key, "") ?? "";
        return rawFormat
          ? Utils.formatValue(translation, rawFormat, { codigoPais: context.codigoPais }) ?? ""
          : translation;
      }
      // Built-in dynamic placeholders
      const lower = rawPath.toLowerCase();
      if (lower === "now" || lower === "datetime") {
        const now = new Date();
        if (rawFormat) return Utils.formatValue(now, rawFormat, { codigoPais: context.codigoPais }) ?? "";
        return Utils.formatarDataHora(now, context.codigoPais);
      }
      if (lower === "today" || lower === "date") {
        const now = new Date();
        if (rawFormat) return Utils.formatValue(now, rawFormat, { codigoPais: context.codigoPais }) ?? "";
        return Utils.formatarData(now, context.codigoPais);
      }
      if (lower === "time") {
        const now = new Date();
        if (rawFormat) return Utils.formatValue(now, rawFormat, { codigoPais: context.codigoPais }) ?? "";
        return Utils.formatarHora(now, context.codigoPais);
      }
      if (rawPath === "value") {
        return context.value ?? "";
      }
      const resolved = this.getValueFromContext(rawPath, context);
      if (rawFormat) {
        return Utils.formatValue(resolved, rawFormat, { codigoPais: context.codigoPais }) ?? "";
      }
      return resolved ?? "";
    },
  };

  function renderComponent(name, props = {}) {
    if (!ComponentRegistry || !ComponentRegistry.has(name)) {
      console.warn(`Componente ausente no registry: ${name}`);
      return null;
    }
    try {
      return ComponentRegistry.render(name, props);
    } catch (error) {
      console.error(`Erro ao renderizar componente ${name}:`, error);
      return null;
    }
  }

  function createComponentBlock(name, props = {}) {
    const markup = renderComponent(name, props);
    if (!markup) return null;
    if (markup instanceof Node) return markup;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = markup;
    return wrapper;
  }

  function appendMarkup(target, markup) {
    if (!target || !markup) return;
    if (markup instanceof Node) {
      target.appendChild(markup);
      return;
    }
    if (typeof markup === "string") {
      target.insertAdjacentHTML("beforeend", markup);
    }
  }

  const Paginador = {
    inserirTimbre(pagina, imagemUrl) {
      if (!imagemUrl) return;
      const fundo = document.createElement("div");
      fundo.classList.add("timbre-background");
      fundo.style.backgroundImage = `url('${imagemUrl}')`;
      pagina.appendChild(fundo);
    },

    criarNovaPagina(cabecalhoMarkup, footerMarkup, imagemTimbre) {
      const pagina = document.createElement("div");
      pagina.classList.add("page-relatorio");

      if (imagemTimbre) {
        pagina.classList.add("timbre");
        this.inserirTimbre(pagina, imagemTimbre);
      }

      appendMarkup(pagina, cabecalhoMarkup);

      const content = document.createElement("div");
      content.classList.add("content");
      pagina.appendChild(content);

      appendMarkup(pagina, footerMarkup);

      return pagina;
    },

    adicionarConteudoPaginado(blocos, dados = {}, config = {}) {
      return new Promise((resolve) => {
        const headerComponent = ComponentRegistry?.get("layout.header");
        const footerComponent = ComponentRegistry?.get("layout.footer");

        if (!headerComponent || !footerComponent) {
          console.error("Componentes de layout não registrados.");
          resolve();
          return;
        }

        const limitePagina = config.imprimirLogoEmTodas === true ? 765 : 780;

        // Define um renderizador de footer com suporte a config.components.footer
        const footerConf = config?.components?.footer || null;
        const footerEnabled = footerConf?.enabled !== false && footerConf?.type !== "none";

        const renderFooter = (paginaAtual, totalAtual) => {
          if (!footerEnabled) return "";

          const blueprint = footerConf?.blueprint;
          const tokens = footerConf?.tokens || {};

          if (blueprint && global.DynamicRenderer?.renderToString) {
            try {
              const runtimeContext = {
                dados,
                config,
                tokens,
                codigoPais: dados.licenca?.pais,
                pagina: paginaAtual,
                totalPaginas: totalAtual,
              };
              let html = global.DynamicRenderer.renderToString(blueprint, runtimeContext) || "";
              if (typeof html === "string") {
                const hasFooterTag = /<footer\b/i.test(html);
                const hasFooterClass = /class=["'][^"']*\bfooter\b[^"']*["']/i.test(html);
                if (!hasFooterTag && !hasFooterClass) {
                  html = `<footer class="footer">${html}</footer>`;
                }
              }
              return html;
            } catch (e) {
              console.warn("Falha ao renderizar footer blueprint; usando padrão.", e);
            }
          }

          // Fallback: componente padrão
          return footerComponent.render({
            licenca: dados.licenca || {},
            pagina: paginaAtual,
            totalPaginas: totalAtual,
            codigoPais: dados.licenca?.pais,
          });
        };

        // 1ª fase: criar páginas e descobrir o total, usando footer temporário
        const paginas = [];
        let paginaAtual = this.criarNovaPagina(
          headerComponent.render({ dados, config, pagina: 1 }),
          "", // footer vazio por enquanto
          dados.imagemTimbre
        );

        let contentDiv = paginaAtual.querySelector(".content");
        document.body.appendChild(paginaAtual);
        paginas.push(paginaAtual);

        const tarefasMedicao = [];

        blocos.filter(Boolean).forEach((bloco) => {
          tarefasMedicao.push(
            new Promise((done) => {
              const medidor = bloco.cloneNode(true);
              medidor.style.visibility = "hidden";
              medidor.style.position = "absolute";
              medidor.style.left = "-9999px";
              document.body.appendChild(medidor);

              requestAnimationFrame(() => {
                const alturaBloco = medidor.offsetHeight;
                const alturaAtual = contentDiv.scrollHeight;
                const evitarQuebra = medidor.classList?.contains?.("avoid-break");

                document.body.removeChild(medidor);

                const ultrapassa = alturaAtual + alturaBloco > limitePagina;
                if (ultrapassa && (!evitarQuebra || alturaBloco > limitePagina)) {
                  paginaAtual = this.criarNovaPagina(
                    headerComponent.render({ dados, config, pagina: paginas.length + 1 }),
                    "", // footer ainda vazio
                    dados.imagemTimbre
                  );
                  contentDiv = paginaAtual.querySelector(".content");
                  document.body.appendChild(paginaAtual);
                  paginas.push(paginaAtual);
                }

                contentDiv.appendChild(bloco);
                done();
              });
            })
          );
        });

        // 2ª fase: com o total conhecido, renderizar footers definitivos (incluindo blueprint)
        Promise.all(tarefasMedicao).then(() => {
          const totalPaginas = paginas.length;

          paginas.forEach((pagina, index) => {
            const paginaNumero = index + 1;

            // Remove footer anterior (se houver) para re-inserir com total correto
            const footerAntigo = pagina.querySelector("footer.footer");
            if (footerAntigo && footerAntigo.parentNode === pagina) {
              pagina.removeChild(footerAntigo);
            }

            const footerMarkup = renderFooter(paginaNumero, totalPaginas) || "";
            if (footerMarkup) {
              appendMarkup(pagina, footerMarkup);
            }

            // Atualiza o texto padrão caso o footer seja o componente padrão
            const footerNumber = pagina.querySelector(".footer-page-number span");
            if (footerNumber) {
              footerNumber.textContent = `${paginaNumero} / ${totalPaginas}`;
            }
          });

          resolve();
        });
      });
    },
  };

  const PropostaApp = {
    dados: {},
    cores: {},
    config: {},
    queryParams: {},
    manifest: null,

    async init() {
      const resultado = await this.carregarDados();
      if (!resultado) {
        console.error("Não foi possível carregar os dados do relatório.");
        return;
      }

      const { dadosCarregados, config, queryParams } = resultado;
      this.dados = dadosCarregados ?? {};
      this.dados.cores = this.dados.cores ?? {};

      const coresPadrao = { corPrimaria: "#004080", corSecundaria: "#bb961e" };
      this.dados.cores = { ...coresPadrao, ...this.dados.cores };

      this.cores = this.dados.cores;
      this.config = config ?? {};
      this.queryParams = queryParams || {};

      // Override de idioma/locale (ex.: config.idioma = "pt-BR", "es-PY", "en-US")
      try {
        if (window.I18N && typeof window.I18N.setIdioma === "function") {
          window.I18N.setIdioma(this.config.idioma ?? null);
        }
      } catch (e) {
        // ignore
      }

      // Override de moeda (ex.: config.moeda = "EUR", "PYG", "USD")
      try {
        if (window.Utils && typeof window.Utils.setMoeda === "function") {
          window.Utils.setMoeda(this.config.moeda ?? null);
        }
      } catch (e) {
        // ignore
      }

      // Normaliza array de componentes (quando fornecido) para os pontos esperados pela engine
      this.normalizarComponentesDaConfig();

      // Flag de capa aceita tanto ImprimirCapa quanto imprimirCapa (case-insensitive por convenção)
      const flagCapa =
        this.config.ImprimirCapa ??
        this.config.imprimirCapa ??
        this.config.imprimircapa ??
        null;

      // Renderiza capa/contracapa apenas quando não for explicitamente desabilitada (flag === false)
      if (flagCapa !== false) {
        this.preencherCapa();
        // Folha de rosto (contra-capa) deve vir imediatamente após a capa
        this.aplicarContraCapaConfigurada();
      } else {
        // Se a capa estiver desabilitada, remove o HTML estático da capa para que nada apareça
        const capaEl = document.getElementById("capa");
        if (capaEl && capaEl.parentNode) {
          capaEl.parentNode.removeChild(capaEl);
        }
      }

      this.preencherRodape();

      const codigoPais = this.dados.licenca?.pais;
      const reportType = this.config.reportType || DEFAULT_REPORT_TYPE;
      const manifestVersion = this.config.manifestVersion || DEFAULT_MANIFEST_VERSION;

      this.manifest = await ManifestRuntime.load(reportType, manifestVersion);

      const manifestContext = {
        dados: this.dados,
        config: this.config,
        codigoPais,
        context: {
          codigoPais,
          reportType,
          manifestVersion:
            (this.manifest && this.manifest.version) || manifestVersion,
        },
      };

      let blocks = [];
      let attachments = [];

      if (this.manifest) {
        const rendered = ManifestRuntime.render(this.manifest, manifestContext);
        blocks = rendered?.blocks || [];
        attachments = rendered?.attachments || [];
      }

      if (!blocks || blocks.length === 0) {
        blocks = this.buildFallbackBlocks(manifestContext);
      }

      await Paginador.adicionarConteudoPaginado(blocks, this.dados, this.config);

      let attachmentsToApply = attachments;
      if (!this.manifest || !attachmentsToApply.length) {
        attachmentsToApply = this.buildFallbackAttachments();
      }

      if (attachmentsToApply && attachmentsToApply.length) {
        ManifestRuntime.applyAttachments(attachmentsToApply);
      }

      this.paginarContratoConteudo();
      this.reaplicarLayoutEGerarPaginacao();

      this.aplicarCores(this.cores);
      global.readyForPDF = true;
      console.log("Relatório renderizado com sucesso.");
    },

    // Converte um array declarativo de componentes em chaves de config já suportadas (cover, backCover, components.header, etc.)
    normalizarComponentesDaConfig() {
      // Apenas o array this.config.components é suportado
      const list = Array.isArray(this.config?.components) ? this.config.components : null;
      if (!list || !list.length) return;

      const normId = (v) => String(v || "").trim().toLowerCase();
      const ensureObj = (v) => (v && typeof v === "object" ? v : {});

      list.forEach((entryRaw) => {
        const entry = ensureObj(entryRaw);
        const id = normId(entry.id || entry.key || entry.name || entry.type);
        if (!id) return;

        // Sinônimos
        const isCover = ["capa", "cover"].includes(id);
  const isBackCover = ["contracapa", "contra-capa", "backcover", "back-cover"].includes(id);
        const isHeader = id === "header" || id === "cabecalho";
        const isFooter = id === "footer" || id === "rodape";
        const isClientInfo = ["cliente.info", "clienteinfo", "cliente_info", "clientinfo"].includes(id);

        if (isCover) {
          // A capa aceita o mesmo schema do CoverLayout (blueprint, tokens, background, actions...)
          this.config.cover = { ...ensureObj(this.config.cover), ...entry };
          return;
        }

        if (isBackCover) {
          // A contracapa só é renderizada quando há blueprint; armazenamos em backCover
          this.config.backCover = { ...ensureObj(this.config.backCover), ...entry };
          return;
        }

        if (isHeader) {
          // O header do layout comum lê de config.components.header
          const headerConf = {
            type: entry.type || (entry.blueprint ? "blueprint" : undefined) || "blueprint",
            blueprint: entry.blueprint,
            tokens: entry.tokens || entry.bindings || entry.data || entry.values || {},
            mode: entry.mode || "replace",
          };
          this.config.components = this.config.components || {};
          this.config.components.header = headerConf;
          return;
        }

        if (isFooter) {
          // Ainda não há footer blueprint integrado ao paginator; deixamos salvo para uso futuro
          const footerConf = {
            type: entry.type || (entry.blueprint ? "blueprint" : undefined) || "blueprint",
            blueprint: entry.blueprint,
            tokens: entry.tokens || entry.bindings || entry.data || entry.values || {},
            mode: entry.mode || "replace",
          };
          this.config.components = this.config.components || {};
          this.config.components.footer = footerConf;
          return;
        }

        if (isClientInfo) {
          const comp = {
            type: entry.type || (entry.blueprint ? "blueprint" : undefined) || "blueprint",
            blueprint: entry.blueprint,
            tokens: entry.tokens || entry.bindings || entry.data || entry.values || {},
            mode: entry.mode || "replace",
          };
          this.config.components = this.config.components || {};
          this.config.components.clienteInfo = comp;
          return;
        }

        // Para outros ids, armazenamos em config.components[id] seguindo o mesmo padrão
        const generic = {
          type: entry.type || (entry.blueprint ? "blueprint" : undefined) || "blueprint",
          blueprint: entry.blueprint,
          tokens: entry.tokens || entry.bindings || entry.data || entry.values || {},
          mode: entry.mode || "replace",
        };
        this.config.components = this.config.components || {};
        this.config.components[id] = generic;
      });
    },

    async carregarDados() {
      const queryParams = this.getQueryParams();
      const { licencaId, orcamentoId, config } = queryParams;
      if (!licencaId || !orcamentoId || !config) {
        console.error("Parâmetros inválidos ou ausentes para carregar relatório.");
        return null;
      }

      try {
        const response = await fetch(
          "https://dev.wvetro.com.br/geovaneconcept/app.wvetro.arelorcamentoconcepthtml",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ licencaId, orcamentoId, config }),
          }
        );

        if (!response.ok) {
          throw new Error(`Erro ao buscar dados do relatório (status ${response.status}).`);
        }

        const dadosRelatorio = await response.json();
        return { dadosCarregados: dadosRelatorio, config, queryParams };
      } catch (error) {
        console.error("Erro ao carregar dados do relatório:", error);
        return null;
      }
    },

    getQueryParams() {
      const params = new URLSearchParams(window.location.search);
      const licencaId = params.get("licencaId");
      const orcamentoId = params.get("orcamentoId");
      const rawConfig = params.get("config");
      let config = null;

      if (rawConfig) {
        try {
          config = JSON.parse(rawConfig);
        } catch (error) {
          console.error("Config inválida na query string:", error);
        }
      }

      return { licencaId, orcamentoId, config };
    },

    buildFallbackBlocks(context = {}) {
      const codigoPais = context.codigoPais ?? this.dados.licenca?.pais;
      const blocos = [];

      const pushBlock = (name, props = {}) => {
        const bloco = createComponentBlock(name, props);
        if (bloco) blocos.push(bloco);
      };

  // Passar config para cliente.info para habilitar blueprints por componente
  pushBlock("cliente.info", { dados: this.dados, config: this.config, codigoPais });

      (this.dados.projetos ?? []).forEach((projeto) => {
        pushBlock("projeto.item", {
          projeto,
          config: this.config,
          codigoPais,
        });
        
        if (projeto.observacoes) {
          const blocosObservacoes = Utils.dividirEmBlocosQuebraveis(projeto.observacoes, {
            paragrafosPorBloco: 5,
            className: "allow-break",
            titulo: "Observações:",
          });
          blocos.push(...blocosObservacoes);
        }

        if (projeto.servicos?.length && this.config.imprimirServicos) {
          pushBlock("projeto.servicos", {
            servicos: projeto.servicos,
            config: this.config,
          });
        }

        if (projeto.variaveis?.length && this.config.imprimirVariaveis) {
          pushBlock("projeto.variaveis", {
            variaveis: projeto.variaveis,
            config: this.config,
          });
        }

        pushBlock("projeto.divisor");
      });

      if (this.config.imprimirVendaItens && this.dados.vendaItens?.itens?.length) {
        pushBlock("venda.cabecalho");
        this.dados.vendaItens.itens.forEach((item) => {
          pushBlock("venda.item", { item });
        });
        pushBlock("venda.total", { vendas: this.dados.vendaItens });
      }

      if (this.config.imprimirParcelas && this.dados.parcelas?.length) {
        pushBlock("financeiro.parcelas", {
          parcelas: this.dados.parcelas,
          codigoPais,
        });
      }

      if (this.config.imprimirValorTotal) {
        pushBlock("financeiro.totais", {
          dados: this.dados,
          config: this.config,
          codigoPais,
        });
      }

      if (this.dados.condicoesPagamento) {
        pushBlock("financeiro.condicoes", {
          condicoes: this.dados.condicoesPagamento,
          codigoPais,
        });
      }

      pushBlock("assinar.bloco");

      const observacoesGerais = Utils.dividirEmBlocosQuebraveis(this.dados.observacoes, {
        paragrafosPorBloco: 3,
        className: "allow-break",
        titulo: "Observações:",
      });
      observacoesGerais.forEach((bloco) => blocos.push(bloco));

      return blocos;
    },

    buildFallbackAttachments() {
      const attachments = [];

      if (this.config.imprimirPromissorias && this.dados.promissoria) {
        const promissoriaBlock = createComponentBlock("financeiro.promissoria", {
          dados: this.dados,
        });
        if (promissoriaBlock) {
          attachments.push({ node: promissoriaBlock, container: "page-relatorio contrato-page" });
        }
      }

      if (this.config.imprimirContrato && this.dados.contratoHtml) {
        const contratoBlock = createComponentBlock("financeiro.contrato", {
          contratoHtml: this.dados.contratoHtml,
        });
        if (contratoBlock) {
          attachments.push({
            node: contratoBlock,
            container: "page-relatorio contrato-page",
          });
        }
      }

      return attachments;
    },

    aplicarCores(coresConfig = {}) {
      const cores = {
        corPrimaria: coresConfig.corPrimaria || "#004080",
        corSecundaria: coresConfig.corSecundaria || "#bb961e",
      };

      document.querySelectorAll(".cor-primaria").forEach((el) => {
        el.style.backgroundColor = cores.corPrimaria;
      });
      document.querySelectorAll(".cor-secundaria").forEach((el) => {
        el.style.backgroundColor = cores.corSecundaria;
      });
      document.querySelectorAll(".color-primaria").forEach((el) => {
        el.style.color = cores.corPrimaria;
      });
      document.querySelectorAll(".color-secundaria").forEach((el) => {
        el.style.color = cores.corSecundaria;
      });
      document.querySelectorAll(".borda-cor-primaria").forEach((el) => {
        el.style.borderColor = cores.corPrimaria;
        el.style.backgroundColor = cores.corPrimaria;
      });
      document.querySelectorAll(".borda-cor-secundaria").forEach((el) => {
        el.style.borderColor = cores.corSecundaria;
        el.style.backgroundColor = cores.corSecundaria;
      });

      document.querySelectorAll('[data-cor="primaria"]').forEach((el) => {
        const tag = el.tagName.toLowerCase();
        if (el.hasAttribute("fill") || tag === "path" || tag === "rect") {
          el.setAttribute("fill", cores.corPrimaria);
        }
        if (el.hasAttribute("stroke") || tag === "line" || tag === "polyline" || tag === "path") {
          el.setAttribute("stroke", cores.corPrimaria);
        }
      });

      document.querySelectorAll('[data-cor="secundaria"]').forEach((el) => {
        const tag = el.tagName.toLowerCase();
        if (el.hasAttribute("fill") || tag === "path" || tag === "rect") {
          el.setAttribute("fill", cores.corSecundaria);
        }
        if (el.hasAttribute("stroke") || tag === "line" || tag === "polyline" || tag === "path") {
          el.setAttribute("stroke", cores.corSecundaria);
        }
      });

      document.querySelectorAll(".valor-final-destaque").forEach((el) => {
        el.style.backgroundColor = cores.corPrimaria;
        el.style.boxShadow = `-6px 6px 0px ${cores.corSecundaria}`;
      });
    },

    preencherCapa() {
      const aplicado = this.aplicarCoverConfigurada();
      if (!aplicado) {
        this.aplicarCapaFallback();
      }
    },

    aplicarCoverConfigurada() {
      // Usa somente o que vier do array components (normalizado em this.config.cover)
      const coverDefinition = this.config?.cover;
      const layout = CoverLayout.build(coverDefinition, { dados: this.dados, config: this.config });

      if (!layout?.blueprint?.page) {
        document.body.removeAttribute("data-cover-variant");
        return false;
      }

      const blueprint = layout.blueprint || layout.meta?.blueprint;
      const runtimeContext = {
        dados: this.dados,
        config: this.config,
        codigoPais: this.dados.licenca?.pais,
        document,
        tokens: layout.tokens,
        query: this.queryParams,
        layoutMeta: layout.meta,
        cover: layout,
      };

      runtimeContext.resolvePath = (path) => this.resolverCoverPath(path, layout.tokens);

      const possuiBlueprint = Boolean(blueprint);
      let aplicadoPreset = false;

      if (!possuiBlueprint) {
        aplicadoPreset = LayoutEngine.applyPage(
          { pages: [layout.page] },
          "cover",
          runtimeContext
        );
      }

      let aplicadoDinamico = false;
      if (possuiBlueprint) {

        aplicadoDinamico = DynamicCover.render(blueprint, runtimeContext);
  
        if (!aplicadoDinamico) {
          aplicadoPreset = LayoutEngine.applyPage(
            { pages: [layout.page] },
            "cover",
            runtimeContext
          );
        }
      }

      if (!aplicadoDinamico && !aplicadoPreset) {
        document.body.removeAttribute("data-cover-variant");
        return false;
      }

      if (layout.variant && !possuiBlueprint) {
        document.body.setAttribute("data-cover-variant", layout.variant);
      } else {
        document.body.removeAttribute("data-cover-variant");
      }

      return true;
    },

    resolverCoverPath(path, tokens = {}) {
      if (!path) return undefined;
      const contexts = [tokens, this.dados, this.config, this.queryParams];
      for (let index = 0; index < contexts.length; index += 1) {
        const source = contexts[index];
        if (!source) continue;
        if (Object.prototype.hasOwnProperty.call(source, path)) {
          return source[path];
        }
        const resolved = Utils.getValueByPath(source, path);
        if (resolved !== undefined) return resolved;
      }
      return undefined;
    },

    aplicarCapaFallback() {
      document.body.removeAttribute("data-cover-variant");

      const imagemCapa = this.dados.imagemCapa?.trim() ? this.dados.imagemCapa : DEFAULT_COVER_IMAGE;

      document.querySelectorAll(".card-left, .card-middle, .card-right").forEach((card) => {
        card.style.backgroundImage = `url('${imagemCapa}')`;
        card.style.backgroundRepeat = "no-repeat";
        card.style.backgroundSize = "794px auto";
        card.style.backgroundPositionY = "center";
      });

      Utils.setCardPosition(".card-left", "left");
      Utils.setCardPosition(".card-middle", "center");
      Utils.setCardPosition(".card-right", "right");

      Utils.setText("title", this.dados.titulo || "");
      Utils.setText("subtitle", this.dados.subtitulo || "");
      Utils.setText("orcamento-nro", this.dados.id || "");

      const licenca = this.dados.licenca || {};
      const codigoPais = licenca.pais;

      Utils.setText(
        "canais-comunicacao-label",
        I18N?.t?.(codigoPais, "communicationChannels") || "Canais de comunicação"
      );

      Utils.setHTML(
        "licenca-whatsapp",
        licenca.whatsapp
          ? `<i class="icon-capa color-primaria fab fa-whatsapp"></i> ${Utils.formatarTelefone(licenca.whatsapp)}`
          : ""
      );
      Utils.setHTML(
        "licenca-fone",
        licenca.fone
          ? `<i class="icon-capa color-primaria fas fa-phone-alt"></i> ${Utils.formatarTelefone(licenca.fone)}`
          : ""
      );
      Utils.setHTML(
        "licenca-email",
        licenca.email
          ? `<i class="icon-capa color-primaria fas fa-envelope"></i> ${licenca.email}`
          : ""
      );
      Utils.setHTML(
        "licenca-site",
        licenca.site
          ? `<i class="icon-capa color-primaria fas fa-globe"></i> ${licenca.site}`
          : ""
      );
      Utils.setHTML(
        "licenca-endereco",
        licenca.endereco
          ? `<i class="icon-capa color-primaria fas fa-map-marker-alt"></i> ${licenca.endereco}`
          : ""
      );
      Utils.setHTML(
        "licenca-cnpj",
        licenca.cnpj
          ? `<i class="icon-capa color-primaria fas fa-building"></i> ${licenca.cnpj}`
          : ""
      );
      Utils.setHTML(
        "licenca-instagram",
        licenca.instagram
          ? `<i class="icon-capa color-primaria fab fa-instagram"></i> <a href="https://www.instagram.com/${licenca.instagram}/" target="_blank">${licenca.instagram}</a>`
          : ""
      );
      Utils.setHTML(
        "logo-capa",
        licenca.logoUrl ? `<img src="${licenca.logoUrl}" alt="Logo" class="logo-capa">` : ""
      );
    },

    // Renderiza uma contra-capa somente quando houver blueprint JSON configurado.
    // Usa exclusivamente o que foi normalizado a partir do array components em this.config.backCover.
    aplicarContraCapaConfigurada() {
      // Usa somente this.config.backCover
      const def = this.config?.backCover;
      if (!def) return false;

      // Aceita blueprint direto (def como blueprint) ou em def.blueprint
      let blueprint = null;
      const looksLikeBlueprint = (obj) => obj && typeof obj === "object" && (
        Object.prototype.hasOwnProperty.call(obj, "page") ||
        Object.prototype.hasOwnProperty.call(obj, "background") ||
        Object.prototype.hasOwnProperty.call(obj, "tokens")
      );

      if (typeof def?.blueprint === "string") {
        try {
          blueprint = JSON.parse(def.blueprint);
        } catch (e) {
          console.warn("contra-capa blueprint inválido (string):", e);
          blueprint = null;
        }
      } else if (def?.blueprint && (typeof def.blueprint === "object")) {
        blueprint = cloneDeep(def.blueprint);
      } else if (looksLikeBlueprint(def)) {
        blueprint = cloneDeep(def);
      }

      if (!blueprint || typeof blueprint !== "object") {
        // Sem blueprint válido, não renderiza contra-capa
        return false;
      }

      // Tokens opcionais para interpolação de blueprint
      let tokens = {};
      const tokensInput = def.tokens ?? def.bindings ?? def.data ?? def.values ?? null;
      if (Array.isArray(tokensInput)) {
        tokens = CoverLayout.tokensFromArray(tokensInput);
      } else if (isPlainObject(tokensInput)) {
        tokens = normalizeTokens(tokensInput);
      }
      if (isPlainObject(def.placeholders)) {
        Object.entries(def.placeholders).forEach(([path, value]) => {
          setValueByPath(tokens, path, value);
        });
      }

      const runtimeContext = {
        dados: this.dados,
        config: this.config,
        codigoPais: this.dados.licenca?.pais,
        tokens,
        query: this.queryParams,
        document,
        layoutMeta: { role: "back-cover" },
      };

      // Renderiza o blueprint em HTML (string)
      const html = (global.DynamicRenderer && global.DynamicRenderer.renderToString)
        ? global.DynamicRenderer.renderToString(blueprint, runtimeContext)
        : "";

      if (!html || html.length === 0) return false;

      // Cria uma página isolada sem header/footer e insere APÓS a capa
      const pagina = document.createElement("div");
      pagina.classList.add("page-relatorio");
      pagina.setAttribute("data-role", "back-cover");
      pagina.innerHTML = html;
      const capa = document.getElementById("capa");
      if (capa && capa.parentNode) {
        capa.insertAdjacentElement("afterend", pagina);
      } else {
        document.body.appendChild(pagina);
      }
      return true;
    },

    preencherRodape() {
      const licenca = this.dados.licenca || {};
      Utils.setText("rodape-telefone", Utils.formatarTelefone(licenca.telefone));
      Utils.setText("rodape-email", licenca.email || "");
      Utils.setText("rodape-site", licenca.site || "");
      Utils.setText("rodape-endereco", licenca.endereco || "");
    },

    obterLimiteConteudo() {
      return this.config.imprimirLogoEmTodas === true ? 765 : 780;
    },

    copiarAtributosElemento(origem, destino, { ignorar = [] } = {}) {
      if (!origem || !destino) return;
      const ignorados = new Set(ignorar);
      Array.from(origem.attributes || []).forEach((attr) => {
        if (ignorados.has(attr.name)) return;
        destino.setAttribute(attr.name, attr.value);
      });
    },

    paginarContratoConteudo() {
      const contratoPaginas = Array.from(document.querySelectorAll(".contrato-page"))
        .filter((pagina) => pagina && pagina.dataset.contratoPaginado !== "true");

      if (!contratoPaginas.length) {
        return;
      }

      const limite = this.obterLimiteConteudo();
      const NodeCtor = global.Node || window.Node;

      contratoPaginas.forEach((paginaOriginal) => {
        const contratoConteudoOriginal = paginaOriginal.querySelector(".contrato-content");
        if (!contratoConteudoOriginal) {
          paginaOriginal.dataset.contratoPaginado = "true";
          return;
        }

        const parent = paginaOriginal.parentNode;
        if (!parent) {
          return;
        }

        const placeholder = document.createComment("contrato-placeholder");
        parent.insertBefore(placeholder, paginaOriginal);

        const nodes = Array.from(contratoConteudoOriginal.childNodes || []);

        parent.removeChild(paginaOriginal);

        const paginaClasses = Array.from(paginaOriginal.classList || []);
        if (!paginaClasses.includes("page-relatorio")) paginaClasses.push("page-relatorio");
        if (!paginaClasses.includes("contrato-page")) paginaClasses.push("contrato-page");

        const criarPaginaContrato = () => {
          const page = document.createElement("div");
          paginaClasses.forEach((cls) => page.classList.add(cls));
          this.copiarAtributosElemento(paginaOriginal, page, {
            ignorar: ["class", "data-contrato-paginado", "id"],
          });
          const content = document.createElement("div");
          content.classList.add("content");
          page.appendChild(content);

          const wrapper = document.createElement("div");
          const originalClassName = contratoConteudoOriginal.className || "contrato-content";
          if (originalClassName) {
            wrapper.className = originalClassName;
          }
          if (!wrapper.classList.contains("contrato-content")) {
            wrapper.classList.add("contrato-content");
          }

          this.copiarAtributosElemento(contratoConteudoOriginal, wrapper, {
            ignorar: ["id", "class"],
          });

          content.appendChild(wrapper);
          page.dataset.contratoPaginado = "true";
          return { page, content, wrapper };
        };

        const paginasGeradas = [];

        const iniciarNovaPagina = () => {
          const novaPagina = criarPaginaContrato();
          parent.insertBefore(novaPagina.page, placeholder);
          paginasGeradas.push(novaPagina);
          return novaPagina;
        };

        let paginaAtual = iniciarNovaPagina();

        nodes.forEach((node) => {
          if (!node) return;
          const isWhitespaceText =
            node.nodeType === (NodeCtor ? NodeCtor.TEXT_NODE : 3) &&
            node.textContent &&
            node.textContent.trim().length === 0;

          if (isWhitespaceText && paginaAtual.wrapper.childNodes.length === 0) {
            return;
          }

          paginaAtual.wrapper.appendChild(node);

          const excedeuLimite = paginaAtual.wrapper.scrollHeight > limite;
          if (excedeuLimite) {
            paginaAtual.wrapper.removeChild(node);

            paginaAtual = iniciarNovaPagina();
            paginaAtual.wrapper.appendChild(node);

            if (paginaAtual.wrapper.scrollHeight > limite) {
              // Se mesmo após nova página exceder, mantemos para evitar loop
              // Isso normalmente acontece com elementos maiores que uma página inteira
            }
          }
        });

        if (contratoConteudoOriginal.id && paginasGeradas.length) {
          paginasGeradas[0].wrapper.id = contratoConteudoOriginal.id;
        }

        parent.removeChild(placeholder);
      });
    },

    renderHeaderMarkup(paginaNumero) {
      const headerComponent = ComponentRegistry?.get("layout.header");
      if (!headerComponent) return "";
      try {
        return headerComponent.render({
          dados: this.dados,
          config: this.config,
          pagina: paginaNumero,
        });
      } catch (error) {
        console.warn("Falha ao renderizar header:", error);
        return "";
      }
    },

    renderFooterMarkup(paginaNumero, totalPaginas) {
      const footerComponent = ComponentRegistry?.get("layout.footer");
      if (!footerComponent) return "";

      const footerConf = this.config?.components?.footer || null;
      const footerEnabled = footerConf?.enabled !== false && footerConf?.type !== "none";
      if (footerConf && !footerEnabled) {
        return "";
      }

      const blueprint = footerConf?.blueprint;
      const tokens = footerConf?.tokens || {};

      if (blueprint && global.DynamicRenderer?.renderToString) {
        try {
          const runtimeContext = {
            dados: this.dados,
            config: this.config,
            tokens,
            codigoPais: this.dados.licenca?.pais,
            pagina: paginaNumero,
            totalPaginas,
          };
          let html = global.DynamicRenderer.renderToString(blueprint, runtimeContext) || "";
          if (typeof html === "string") {
            const hasFooterTag = /<footer\b/i.test(html);
            const hasFooterClass = /class=["'][^"']*\bfooter\b[^"']*["']/i.test(html);
            if (!hasFooterTag && !hasFooterClass) {
              html = `<footer class="footer">${html}</footer>`;
            }
          }
          return html;
        } catch (error) {
          console.warn("Falha ao renderizar footer blueprint; usando padrão.", error);
        }
      }

      try {
        return footerComponent.render({
          licenca: this.dados.licenca || {},
          pagina: paginaNumero,
          totalPaginas,
          codigoPais: this.dados.licenca?.pais,
        });
      } catch (error) {
        console.warn("Falha ao renderizar footer padrão:", error);
        return "";
      }
    },

    reaplicarLayoutEGerarPaginacao() {
      const paginas = Array.from(document.querySelectorAll(".page-relatorio"))
        .filter((page) => page && page.id !== "capa" && page.getAttribute("data-role") !== "back-cover");

      if (!paginas.length) {
        return;
      }

      const totalPaginas = paginas.length;

      paginas.forEach((pagina, index) => {
        const paginaNumero = index + 1;

        pagina.classList.add("page-relatorio");

        Array.from(pagina.children || []).forEach((elemento) => {
          if (!elemento) return;
          if (elemento.classList?.contains("content")) return;
          if (elemento.classList?.contains("timbre-background")) return;
          elemento.remove();
        });

        let content = pagina.querySelector(".content");
        if (!content) {
          const contentWrapper = document.createElement("div");
          contentWrapper.className = "content";
          while (pagina.firstChild) {
            contentWrapper.appendChild(pagina.firstChild);
          }
          pagina.appendChild(contentWrapper);
          content = contentWrapper;
        }

        const headerMarkup = this.renderHeaderMarkup(paginaNumero);
        if (headerMarkup) {
          pagina.insertAdjacentHTML("afterbegin", headerMarkup);
        }

        const footerMarkup = this.renderFooterMarkup(paginaNumero, totalPaginas);
        if (footerMarkup) {
          pagina.insertAdjacentHTML("beforeend", footerMarkup);
        }

        const footerNumber = pagina.querySelector(".footer-page-number span");
        if (footerNumber) {
          footerNumber.textContent = `${paginaNumero} / ${totalPaginas}`;
        }
      });
    },
  };

  document.addEventListener("DOMContentLoaded", () => {
    if (!ComponentRegistry) {
      console.error("ComponentRegistry não foi inicializado antes do script principal.");
      return;
    }
    PropostaApp.init();
  });

  global.PropostaApp = PropostaApp;
  global.Paginador = Paginador;
})(window);
