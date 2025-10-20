(function componentRegistryModule(global) {
  const SCOPES = ["report", "theme", "common"];
  const registries = {
    report: new Map(),
    theme: new Map(),
    common: new Map(),
  };

  function normalizeDefinition(name, definition) {
    if (!definition) {
      throw new Error(`ComponentRegistry: definition inválida para '${name}'.`);
    }

    if (typeof definition === "function") {
      return { render: definition };
    }

    if (typeof definition.render === "function") {
      return definition;
    }

    throw new Error(`ComponentRegistry: componente '${name}' precisa expor função render.`);
  }

  function getRegistry(scope) {
    if (!scope || !registries[scope]) {
      throw new Error(`ComponentRegistry: escopo inválido '${scope}'.`);
    }
    return registries[scope];
  }

  function setComponent(scope, name, definition) {
    if (!name || typeof name !== "string") {
      throw new Error("ComponentRegistry: o nome do componente deve ser uma string.");
    }
    const registry = getRegistry(scope);
    registry.set(name, Object.freeze(normalizeDefinition(name, definition)));
  }

  function resolveComponent(name, { includeCommon = true, includeTheme = true, includeReport = true } = {}) {
    if (includeReport && registries.report.has(name)) {
      return registries.report.get(name);
    }
    if (includeTheme && registries.theme.has(name)) {
      return registries.theme.get(name);
    }
    if (includeCommon && registries.common.has(name)) {
      return registries.common.get(name);
    }
    return undefined;
  }

  function componentNames(iterable) {
    return Array.from(iterable.keys());
  }

  const registry = {
    register(name, definition, scope = "theme") {
      setComponent(scope, name, definition);
    },
    registerTheme(name, definition) {
      setComponent("theme", name, definition);
    },
    registerCommon(name, definition) {
      setComponent("common", name, definition);
    },
    registerReport(name, definition) {
      setComponent("report", name, definition);
    },
    setReportOverrides(overrides = {}) {
      registries.report.clear();
      Object.entries(overrides).forEach(([name, definition]) => {
        setComponent("report", name, definition);
      });
    },
    clearReportOverrides() {
      registries.report.clear();
    },
    get(name, options = {}) {
      return resolveComponent(name, options);
    },
    has(name, options = {}) {
      return Boolean(resolveComponent(name, options));
    },
    render(name, props = {}, options = {}) {
      const component = resolveComponent(name, options);
      if (!component) {
        throw new Error(`ComponentRegistry: componente não registrado '${name}'.`);
      }
      const renderer = component.render || component;
      if (typeof renderer !== "function") {
        throw new Error(`ComponentRegistry: componente '${name}' não possui função render válida.`);
      }
      return renderer(props);
    },
    list({ scope } = {}) {
      if (scope) {
        if (!registries[scope]) {
          throw new Error(`ComponentRegistry: escopo desconhecido '${scope}'.`);
        }
        return componentNames(registries[scope]);
      }
      const names = new Set();
      SCOPES.forEach((scopeName) => {
        componentNames(registries[scopeName]).forEach((componentName) => names.add(componentName));
      });
      return Array.from(names);
    },
    getContract(name, options = {}) {
      const component = resolveComponent(name, options);
      return component?.contract || null;
    },
  };

  global.ComponentRegistry = registry;
})(window);
