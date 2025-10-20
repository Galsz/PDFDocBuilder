const { ensureNumber, ensureObject, ensureString, normalizeList } = require("./utils");
const {
  DEFAULT_CORES,
  normalizeCliente,
  normalizeConfig,
  normalizeCores,
  normalizeLicenca,
} = require("./shared");

const DEFAULT_CONFIG = {
  mostrarValores: true,
  agruparPorProjeto: true,
  exibirCabecalhoCliente: true,
  exibirObservacoes: true,
  manifestVersion: "v1",
};

const normalizeMaterialItem = (entry) => {
  const item = ensureObject(entry);
  const descricao = ensureString(item.descricao || item.nome || "");
  const codigo = ensureString(item.codigo || item.id || "");
  if (!descricao && !codigo) {
    return null;
  }
  return {
    codigo,
    descricao,
    projeto: ensureString(item.projeto || item.project || ""),
    ambiente: ensureString(item.ambiente || item.localizacao || ""),
    unidade: ensureString(item.unidade || item.unidadeMedida || ""),
    quantidade: ensureNumber(item.quantidade || item.qtd, 0),
    comprimento: ensureString(item.comprimento || item.largura || ""),
    altura: ensureString(item.altura || ""),
    observacoes: ensureString(item.observacoes || item.obs || ""),
    valorUnitario: ensureNumber(item.valorUnitario || item.unitario || 0),
    valorTotal: ensureNumber(item.valorTotal || item.total || 0),
  };
};

const normalizeMateriais = (raw) =>
  normalizeList(raw)
    .map(normalizeMaterialItem)
    .filter(Boolean);

const normalizeGrupo = (entry) => {
  const grupo = ensureObject(entry);
  const materiais = normalizeMateriais(grupo.materiais || grupo.itens);
  return {
    nome: ensureString(grupo.nome || grupo.descricao || ""),
    materiais,
    subtotal: ensureNumber(
      grupo.subtotal,
      materiais.reduce((soma, item) => soma + (item.valorTotal || 0), 0)
    ),
  };
};

const summarizeMateriais = (materiais, grupos) => {
  if (materiais.length) {
    return materiais.reduce(
      (acc, item) => ({
        quantidade: acc.quantidade + (item.quantidade || 0),
        valor: acc.valor + (item.valorTotal || 0),
      }),
      { quantidade: 0, valor: 0 }
    );
  }

  return grupos.reduce(
    (acc, grupo) => {
      const quantidade = grupo.materiais.reduce((sum, item) => sum + (item.quantidade || 0), 0);
      const valor = grupo.materiais.reduce((sum, item) => sum + (item.valorTotal || 0), 0);
      return {
        quantidade: acc.quantidade + quantidade,
        valor: acc.valor + valor,
      };
    },
    { quantidade: 0, valor: 0 }
  );
};

const adaptRelacaoMateriais = (payload = {}, options = {}) => {
  const entrada = ensureObject(payload);
  const dadosOriginais = ensureObject(entrada.dados || entrada.data || {});
  const configOriginal = ensureObject(entrada.config || {});

  const materiais = normalizeMateriais(
    dadosOriginais.materiais || dadosOriginais.itens || dadosOriginais.listagem
  );
  const grupos = normalizeList(dadosOriginais.grupos || dadosOriginais.agrupamentos).map(normalizeGrupo);
  const totais = summarizeMateriais(materiais, grupos);

  const dados = {
    id: ensureString(dadosOriginais.id || dadosOriginais.codigo || dadosOriginais.relacaoId || ""),
    titulo: ensureString(dadosOriginais.titulo || dadosOriginais.nome || "Relação de Materiais"),
    data: ensureString(dadosOriginais.data || dadosOriginais.geradoEm || ""),
    cores: normalizeCores(dadosOriginais.cores || DEFAULT_CORES),
    licenca: normalizeLicenca(dadosOriginais.licenca),
    cliente: normalizeCliente(dadosOriginais.cliente),
    materiais,
    grupos,
    totais,
    observacoes: ensureString(dadosOriginais.observacoes || dadosOriginais.obs || ""),
    metadata: ensureObject(dadosOriginais.metadata),
  };

  const config = normalizeConfig(configOriginal, {
    reportType: "relacaoMateriais",
    templateId: ensureString(
      options.templateId || configOriginal.templateId || options.defaultTemplateId || "default"
    ),
    defaults: DEFAULT_CONFIG,
    defaultManifestVersion: ensureString(
      options.defaultManifestVersion || configOriginal.manifestVersion || DEFAULT_CONFIG.manifestVersion
    ),
    overrides: ensureObject(options.configOverrides),
  });

  if (!config.agruparPorProjeto) {
    dados.grupos = [];
  }

  return {
    reportType: "relacaoMateriais",
    dados,
    config,
    meta: {
      source: ensureString(options.source || entrada.source || ""),
      generatedAt: ensureString(options.generatedAt || entrada.generatedAt || ""),
    },
  };
};

module.exports = adaptRelacaoMateriais;
module.exports.REPORT_TYPE = "relacaoMateriais";
