const { ensureNumber, ensureObject, ensureString, normalizeList } = require("./utils");
const {
  DEFAULT_CORES,
  normalizeCliente,
  normalizeConfig,
  normalizeCores,
  normalizeLicenca,
} = require("./shared");

const DEFAULT_CONFIG = {
  mostrarPrioridade: true,
  mostrarResponsavel: true,
  mostrarResumo: true,
  exibirObservacoes: true,
  manifestVersion: "v1",
};

const normalizeOrdem = (entry, index) => {
  const ordem = ensureObject(entry);
  const codigoPadrao = ensureString(ordem.codigo || ordem.id || ordem.numero || "", `OP-${index + 1}`);
  return {
    codigo: codigoPadrao,
    projeto: ensureString(ordem.projeto || ordem.nomeProjeto || ""),
    ambiente: ensureString(ordem.ambiente || ordem.localizacao || ""),
    etapa: ensureString(ordem.etapa || ordem.fase || ""),
    responsavel: ensureString(ordem.responsavel || ordem.executor || ""),
    prazo: ensureString(ordem.prazo || ordem.dataEntrega || ""),
    quantidade: ensureNumber(ordem.quantidade || ordem.qtd, 0),
    unidade: ensureString(ordem.unidade || ordem.unidadeMedida || ""),
    status: ensureString(ordem.status || ordem.situacao || ""),
    prioridade: ensureString(ordem.prioridade || ordem.priority || ""),
    observacoes: ensureString(ordem.observacoes || ordem.obs || ""),
  };
};

const summarizeOrdens = (ordens) => {
  const resumoInicial = {
    total: ordens.length,
    pendentes: 0,
    concluidas: 0,
  };

  return ordens.reduce((acc, ordem) => {
    const status = ordem.status.toLowerCase();
    if (status.includes("pend")) {
      acc.pendentes += 1;
    }
    if (status.includes("conc") || status.includes("final")) {
      acc.concluidas += 1;
    }
    return acc;
  }, resumoInicial);
};

const adaptOrdemProducao = (payload = {}, options = {}) => {
  const entrada = ensureObject(payload);
  const dadosOriginais = ensureObject(entrada.dados || entrada.data || {});
  const configOriginal = ensureObject(entrada.config || {});

  const ordens = normalizeList(dadosOriginais.ordens || dadosOriginais.itens || dadosOriginais.lista).map(
    normalizeOrdem
  );
  const resumo = summarizeOrdens(ordens);

  const dados = {
    id: ensureString(dadosOriginais.id || dadosOriginais.codigo || dadosOriginais.ordemId || ""),
    titulo: ensureString(dadosOriginais.titulo || dadosOriginais.nome || "Ordem de Produção"),
    data: ensureString(dadosOriginais.data || dadosOriginais.geradoEm || dadosOriginais.emissao || ""),
    cores: normalizeCores(dadosOriginais.cores || DEFAULT_CORES),
    licenca: normalizeLicenca(dadosOriginais.licenca),
    cliente: normalizeCliente(dadosOriginais.cliente),
    ordens,
    resumo,
    observacoes: ensureString(dadosOriginais.observacoes || dadosOriginais.obs || ""),
    metadata: ensureObject(dadosOriginais.metadata),
  };

  const config = normalizeConfig(configOriginal, {
    reportType: "ordemProducao",
    templateId: ensureString(
      options.templateId || configOriginal.templateId || options.defaultTemplateId || "default"
    ),
    defaults: DEFAULT_CONFIG,
    defaultManifestVersion: ensureString(
      options.defaultManifestVersion || configOriginal.manifestVersion || DEFAULT_CONFIG.manifestVersion
    ),
    overrides: ensureObject(options.configOverrides),
  });

  if (!config.mostrarResumo) {
    dados.resumo = summarizeOrdens([]);
  }

  return {
    reportType: "ordemProducao",
    dados,
    config,
    meta: {
      source: ensureString(options.source || entrada.source || ""),
      generatedAt: ensureString(options.generatedAt || entrada.generatedAt || ""),
    },
  };
};

module.exports = adaptOrdemProducao;
module.exports.REPORT_TYPE = "ordemProducao";
