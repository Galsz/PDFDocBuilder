const {
  ensureArray,
  ensureBoolean,
  ensureNumber,
  ensureObject,
  ensureString,
  isPlainObject,
} = require("./utils");

const DEFAULT_CORES = {
  corPrimaria: "#004080",
  corSecundaria: "#bb961e",
};

const normalizeCores = (raw) => {
  const cores = ensureObject(raw, DEFAULT_CORES);
  return {
    corPrimaria: ensureString(cores.corPrimaria, DEFAULT_CORES.corPrimaria),
    corSecundaria: ensureString(cores.corSecundaria, DEFAULT_CORES.corSecundaria),
  };
};

const normalizeLicenca = (raw) => {
  const licenca = ensureObject(raw);
  const endereco = ensureString(licenca.endereco || licenca.address || "");
  const cidade = ensureString(licenca.cidade || licenca.city || "");
  return {
    id: ensureString(licenca.id || licenca.licencaId || licenca.codigo || ""),
    nome: ensureString(licenca.nome || licenca.razaoSocial || ""),
    fantasia: ensureString(licenca.fantasia || licenca.nomeFantasia || ""),
    cnpj: ensureString(licenca.cnpj || licenca.cpfCnpj || ""),
    endereco,
    cidade,
    estado: ensureString(licenca.estado || licenca.uf || ""),
    cep: ensureString(licenca.cep || licenca.zip || ""),
    bairro: ensureString(licenca.bairro || licenca.distrito || ""),
    email: ensureString(licenca.email || ""),
    fone: ensureString(licenca.fone || licenca.telefone || licenca.phone || ""),
    whatsapp: ensureString(licenca.whatsapp || licenca.whats || ""),
    site: ensureString(licenca.site || licenca.website || ""),
    instagram: ensureString(licenca.instagram || ""),
    logoUrl: ensureString(licenca.logoUrl || licenca.logo || ""),
    pais: ensureNumber(licenca.pais || licenca.codigoPais, 1058),
  };
};

const normalizeObra = (raw) => {
  const obra = ensureObject(raw);
  return {
    nome: ensureString(obra.nome || obra.project || obra.descricao || ""),
    responsavel: ensureString(obra.responsavel || obra.contato || obra.responsavelNome || ""),
    responsavelFone: ensureString(obra.responsavelFone || obra.telefone || obra.fone || ""),
    endereco: ensureString(obra.endereco || obra.address || ""),
    cidade: ensureString(obra.cidade || obra.city || ""),
  };
};

const normalizeCliente = (raw) => {
  const cliente = ensureObject(raw);
  return {
    id: ensureString(cliente.id || cliente.codigo || cliente.clienteId || ""),
    contato: ensureString(cliente.contato || cliente.nome || cliente.razaoSocial || ""),
    telefone: ensureString(cliente.telefone || cliente.fone || cliente.phone || ""),
    email: ensureString(cliente.email || ""),
    endereco: ensureString(cliente.endereco || cliente.address || ""),
    cidade: ensureString(cliente.cidade || cliente.city || ""),
    cpfcnpj: ensureString(cliente.cpfcnpj || cliente.cpfCnpj || cliente.documento || ""),
    obra: normalizeObra(cliente.obra || cliente.jobSite || cliente.localObra || {}),
  };
};

const normalizeVendedor = (raw) => {
  const vendedor = ensureObject(raw);
  return {
    id: ensureString(vendedor.id || vendedor.codigo || vendedor.vendedorId || ""),
    nome: ensureString(vendedor.nome || vendedor.name || ""),
    telefone: ensureString(vendedor.telefone || vendedor.fone || vendedor.phone || ""),
    email: ensureString(vendedor.email || vendedor.mail || ""),
  };
};

const normalizeConfig = (
  rawConfig,
  {
    reportType,
    templateId = "default",
    defaults = {},
    defaultManifestVersion = "v1",
    overrides = {},
  } = {}
) => {
  const source = ensureObject(rawConfig);
  const base = isPlainObject(defaults) ? { ...defaults } : {};
  const config = {};

  Object.entries(base).forEach(([key, defaultValue]) => {
    if (typeof defaultValue === "boolean") {
      config[key] = ensureBoolean(source[key], defaultValue);
    } else if (typeof defaultValue === "number") {
      config[key] = ensureNumber(source[key], defaultValue);
    } else if (typeof defaultValue === "string") {
      config[key] = ensureString(source[key], defaultValue);
    } else if (Array.isArray(defaultValue)) {
      config[key] = ensureArray(source[key], defaultValue);
    } else if (isPlainObject(defaultValue)) {
      config[key] = ensureObject(source[key], defaultValue);
    }
  });

  if (source.cover) {
    config.cover = ensureObject(source.cover);
  }
  if (source.layout || source.layouts || source.layoutDefinitions) {
    const layoutSource = source.layout || source.layouts || source.layoutDefinitions;
    config.layout = ensureObject(layoutSource);
  }
  if (source.tokens) {
    config.tokens = ensureObject(source.tokens);
  }
  if (source.sections) {
    config.sections = ensureArray(source.sections);
  }

  config.templateId = ensureString(source.templateId, templateId);
  config.reportType = reportType;
  config.manifestVersion = ensureString(
    source.manifestVersion,
    ensureString(base.manifestVersion, defaultManifestVersion)
  );
  config.dataVersion = ensureString(source.dataVersion, ensureString(base.dataVersion, null));
  config.forceRefresh = ensureBoolean(source.forceRefresh, false);

  return {
    ...config,
    ...ensureObject(overrides),
  };
};

module.exports = {
  DEFAULT_CORES,
  normalizeCliente,
  normalizeConfig,
  normalizeCores,
  normalizeLicenca,
  normalizeVendedor,
};
