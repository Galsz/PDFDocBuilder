const adaptOrcamento = require("./orcamentoAdapter");
const adaptContrato = require("./contratoAdapter");
const adaptRelacaoMateriais = require("./relacaoMateriaisAdapter");
const adaptOrdemProducao = require("./ordemProducaoAdapter");

const registry = new Map();

const registerDefaults = () => {
  registry.set(adaptOrcamento.REPORT_TYPE, adaptOrcamento);
  registry.set(adaptContrato.REPORT_TYPE, adaptContrato);
  registry.set(adaptRelacaoMateriais.REPORT_TYPE, adaptRelacaoMateriais);
  registry.set(adaptOrdemProducao.REPORT_TYPE, adaptOrdemProducao);
};

registerDefaults();

const getAdapter = (reportType) => registry.get(reportType) || null;

const adapt = (reportType, payload, options) => {
  const adapter = getAdapter(reportType);
  if (!adapter) {
    throw new Error(`Adapter não encontrado para reportType '${reportType}'`);
  }
  return adapter(payload, options);
};

const registerAdapter = (reportType, adapterFn) => {
  if (typeof adapterFn !== "function") {
    throw new Error("Adapter precisa ser uma função.");
  }
  registry.set(reportType, adapterFn);
};

const listAdapters = () => Array.from(registry.keys());

module.exports = {
  adapt,
  getAdapter,
  listAdapters,
  registerAdapter,
};
