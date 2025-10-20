const { ensureObject, ensureString } = require("./utils");
const {
  DEFAULT_CORES,
  normalizeCliente,
  normalizeConfig,
  normalizeCores,
  normalizeLicenca,
  normalizeVendedor,
} = require("./shared");

const DEFAULT_CONFIG = {
  imprimirContrato: true,
  imprimirLogoEmTodas: true,
  manifestVersion: "v1",
};

const adaptContrato = (payload = {}, options = {}) => {
  const entrada = ensureObject(payload);
  const dadosOriginais = ensureObject(entrada.dados || entrada.data || {});
  const configOriginal = ensureObject(entrada.config || {});

  const dados = {
    id: ensureString(dadosOriginais.id || dadosOriginais.codigo || dadosOriginais.contratoId || ""),
    titulo: ensureString(dadosOriginais.titulo || dadosOriginais.nome || "Contrato"),
    data: ensureString(dadosOriginais.data || dadosOriginais.dataContrato || ""),
    contratoHtml: ensureString(dadosOriginais.contratoHtml || dadosOriginais.conteudo || ""),
    observacoes: ensureString(dadosOriginais.observacoes || dadosOriginais.obs || ""),
    cores: normalizeCores(dadosOriginais.cores || DEFAULT_CORES),
    licenca: normalizeLicenca(dadosOriginais.licenca),
    cliente: normalizeCliente(dadosOriginais.cliente),
    vendedor: normalizeVendedor(dadosOriginais.vendedor),
  };

  const config = normalizeConfig(configOriginal, {
    reportType: "contrato",
    templateId: ensureString(
      options.templateId || configOriginal.templateId || options.defaultTemplateId || "default"
    ),
    defaults: DEFAULT_CONFIG,
    defaultManifestVersion: ensureString(
      options.defaultManifestVersion || configOriginal.manifestVersion || DEFAULT_CONFIG.manifestVersion
    ),
    overrides: ensureObject(options.configOverrides),
  });

  if (!dados.contratoHtml) {
    config.imprimirContrato = false;
  }

  return {
    reportType: "contrato",
    dados,
    config,
    meta: {
      source: ensureString(options.source || entrada.source || ""),
      generatedAt: ensureString(options.generatedAt || entrada.generatedAt || ""),
    },
  };
};

module.exports = adaptContrato;
module.exports.REPORT_TYPE = "contrato";
