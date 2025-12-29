const { ensureNumber, ensureObject, ensureString, normalizeList } = require("./utils");
const {
  DEFAULT_CORES,
  normalizeCliente,
  normalizeConfig,
  normalizeCores,
  normalizeLicenca,
  normalizeVendedor,
} = require("./shared");

const DEFAULT_CONFIG = {
  imprimirLogoEmTodas: false,
  imprimirParcelas: true,
  imprimirPromissorias: false,
  imprimirValorTotal: true,
  imprimirDesconto: true,
  imprimirVariaveis: true,
  imprimirServicos: true,
  imprimirValorUnitario: true,
  imprimirMedidas: true,
  imprimirVendaItens: false,
  imprimirTimbre: false,
  imprimirContrato: false,
  manifestVersion: "v1",
};

const normalizeProjetoVariaveis = (raw) =>
  normalizeList(raw).reduce((accumulator, entry) => {
    if (typeof entry === "string") {
      accumulator.push({ nome: entry, valor: "" });
      return accumulator;
    }
    const variavel = ensureObject(entry);
    const nome = ensureString(variavel.nome || variavel.label || "");
    const valor = ensureString(variavel.valor || variavel.value || "");
    if (!nome && !valor) {
      return accumulator;
    }
    accumulator.push({ nome, valor });
    return accumulator;
  }, []);

const normalizeProjetoServicos = (raw) =>
  normalizeList(raw).reduce((accumulator, entry) => {
    if (typeof entry === "string") {
      accumulator.push({ cod: "", nome: entry, qtd: 0 });
      return accumulator;
    }
    const servico = ensureObject(entry);
    const cod = ensureString(servico.cod || servico.codigo || servico.code || servico.id || "");
    const nome = ensureString(servico.nome || servico.descricao || servico.label || servico.name || "");
    const qtd = ensureNumber(servico.qtd || servico.quantidade || servico.qty || 0, 0);
    if (!cod && !nome && !qtd) {
      return accumulator;
    }
    accumulator.push({ cod, nome, qtd });
    return accumulator;
  }, []);

const normalizeProjetos = (raw) =>
  normalizeList(raw).map((entry, index) => {
    const projeto = ensureObject(entry);
    const ordemPadrao = String(index + 1);
    return {
      id: ensureString(projeto.id || projeto.codigo || projeto.projetoId || ""),
      ordem: ensureString(projeto.ordem || projeto.order || ordemPadrao, ordemPadrao),
      nome: ensureString(projeto.nome || projeto.titulo || `Projeto ${ordemPadrao}`),
      perfil: ensureString(projeto.perfil || projeto.perfilDescricao || ""),
      acessorios: ensureString(projeto.acessorios || projeto.acessórios || projeto.acessoriosDescricao || ""),
      vidro: ensureString(projeto.vidro || projeto.tipoVidro || ""),
      localizacao: ensureString(projeto.localizacao || projeto.ambiente || projeto.setor || ""),
      tipo: ensureString(projeto.tipo || projeto.categoria || ""),
      qtd: ensureNumber(projeto.qtd || projeto.quantidade, 0),
      m2: ensureNumber(projeto.m2 || projeto.area, 0),
      largura: ensureString(projeto.largura || projeto.larguraMm || projeto.larguraCm || ""),
      altura: ensureString(projeto.altura || projeto.alturaMm || projeto.alturaCm || ""),
      valorUnt: ensureNumber(projeto.valorUnt || projeto.valorUnitario, 0),
      valorTotal: ensureNumber(projeto.valorTotal || projeto.total || projeto.valor, 0),
      imagem: ensureString(projeto.imagem || projeto.imagemUrl || projeto.image || ""),
      observacoes: ensureString(projeto.observacoes || projeto.obs || ""),
      variaveis: normalizeProjetoVariaveis(projeto.variaveis || projeto.variables),
      servicos: normalizeProjetoServicos(
        projeto.servicos || projeto.servicos || projeto.services || projeto.serviceItems
      ),
    };
  });

const normalizeVendaItem = (entry) => {
  const item = ensureObject(entry);
  const descricao = ensureString(item.descricao || item.nome || "");
  const codigo = ensureString(item.codigo || item.id || "");
  if (!descricao && !codigo) {
    return null;
  }
  return {
    codigo,
    descricao,
    cor: ensureString(item.cor || item.color || ""),
    unidade: ensureString(item.unidade || item.unidadeMedida || ""),
    largura: ensureString(item.largura || item.larguraMm || ""),
    altura: ensureString(item.altura || item.alturaMm || ""),
    qtd: ensureNumber(item.qtd || item.quantidade, 0),
    valorUnitario: ensureNumber(item.valorUnitario || item.unitario || item.preco, 0),
    valorTotal: ensureNumber(item.valorTotal || item.total || 0),
    imagem: ensureString(item.imagem || item.imagemUrl || item.image || ""),
    observacoes: ensureString(item.observacoes || item.obs || ""),
  };
};

const normalizeVendaItens = (raw) => {
  if (!raw) {
    return { itens: [], total: "" };
  }
  const origem = ensureObject(raw);
  const itens = normalizeList(origem.itens || origem.materiais).map(normalizeVendaItem).filter(Boolean);
  const total = ensureString(
    origem.total || origem.valorTotal || origem.resumo || "",
    itens.reduce((sum, item) => sum + (item.valorTotal || 0), 0).toFixed(2)
  );
  return { itens, total };
};

const normalizeParcelas = (raw) =>
  normalizeList(raw).reduce((accumulator, entry, index) => {
    const parcela = ensureObject(entry);
    const numeroPadrao = String(index + 1);
    const numero = ensureString(parcela.numero || parcela.parcela || numeroPadrao, numeroPadrao);
    const valor = ensureNumber(parcela.valor || parcela.quantia, 0);
    if (!numero && !valor) {
      return accumulator;
    }
    accumulator.push({
      numero,
      vencimento: ensureString(parcela.vencimento || parcela.data || ""),
      valor,
      formaPagamento: ensureString(parcela.formaPagamento || parcela.meio || ""),
      status: ensureString(parcela.status || parcela.situacao || ""),
    });
    return accumulator;
  }, []);

const normalizePromissoria = (raw) => {
  const promissoria = ensureObject(raw);
  if (!Object.keys(promissoria).length) {
    return null;
  }
  return {
    documento: ensureString(promissoria.documento || promissoria.numero || ""),
    vencimento: ensureString(promissoria.vencimento || promissoria.data || ""),
    valor: ensureNumber(promissoria.valor || 0, 0),
    valorExtenso1: ensureString(promissoria.valorExtenso1 || promissoria.valorPorExtenso || ""),
    valorExtenso2: ensureString(promissoria.valorExtenso2 || ""),
    descricao: ensureString(promissoria.descricao || promissoria.texto || ""),
  };
};

const normalizeTotais = (rawTotal) => {
  const totais = ensureObject(rawTotal);
  return {
    valorTotal: ensureNumber(totais.valorTotal || totais.subtotal, 0),
    desconto: ensureNumber(totais.desconto || totais.valorDesconto, 0),
    valorFinal: ensureNumber(totais.valorFinal || totais.total || totais.totalComDesconto, 0),
  };
};

const normalizeDadosBasicos = (raw) => {
  const dados = ensureObject(raw);
  const totais = normalizeTotais(dados);
  return {
    id: ensureString(dados.id || dados.codigo || dados.orcamentoId || ""),
    titulo: ensureString(dados.titulo || dados.nome || ""),
    subtitulo: ensureString(dados.subtitulo || dados.descricao || ""),
    data: ensureString(dados.data || dados.dataProposta || dados.criadoEm || ""),
    imagemCapa: ensureString(dados.imagemCapa || dados.coverImage || ""),
    imagemTimbre: ensureString(dados.imagemTimbre || dados.timbre || ""),
    cores: normalizeCores(dados.cores || DEFAULT_CORES),
    licenca: normalizeLicenca(dados.licenca),
    cliente: normalizeCliente(dados.cliente),
    vendedor: normalizeVendedor(dados.vendedor),
    logoTempera: ensureString(dados.logoTempera || dados.logoTemperado || ""),
    imagemLogo: ensureString(dados.imagemLogo || ""),
    dataAtualizacao: ensureString(dados.dataAtualizacao || dados.atualizadoEm || ""),
    condicoesPagamento: ensureString(dados.condicoesPagamento || dados.condicoes || ""),
    observacoes: ensureString(dados.observacoes || dados.obs || ""),
    promissoria: normalizePromissoria(dados.promissoria),
    contratoHtml: ensureString(dados.contratoHtml || dados.contrato || ""),
    valorTotal: totais.valorTotal,
    desconto: totais.desconto,
    valorFinal: totais.valorFinal,
  };
};

const adaptOrcamento = (payload = {}, options = {}) => {
  const entrada = ensureObject(payload);
  const dadosOriginais = ensureObject(entrada.dados || entrada.data || {});
  const configOriginal = ensureObject(entrada.config || {});

  const dados = normalizeDadosBasicos(dadosOriginais);
  dados.projetos = normalizeProjetos(dadosOriginais.projetos || dadosOriginais.itensProjeto);
  dados.parcelas = normalizeParcelas(dadosOriginais.parcelas || dadosOriginais.financeiroParcelas);
  dados.vendaItens = normalizeVendaItens(dadosOriginais.vendaItens || dadosOriginais.materiaisVenda);

  if (!dados.vendaItens.total && dadosOriginais.vendaItensTotal !== undefined) {
    dados.vendaItens.total = ensureString(dadosOriginais.vendaItensTotal);
  }

  const config = normalizeConfig(configOriginal, {
    reportType: "orcamento",
    templateId: ensureString(
      options.templateId || configOriginal.templateId || options.defaultTemplateId || "default"
    ),
    defaults: DEFAULT_CONFIG,
    defaultManifestVersion: ensureString(
      options.defaultManifestVersion || configOriginal.manifestVersion || DEFAULT_CONFIG.manifestVersion
    ),
    overrides: ensureObject(options.configOverrides),
  });

  if (config.imprimirPromissorias && !dados.promissoria) {
    config.imprimirPromissorias = false;
  }
  if (config.imprimirParcelas && (!dados.parcelas || !dados.parcelas.length)) {
    config.imprimirParcelas = false;
  }
  if (config.imprimirVendaItens && (!dados.vendaItens || !dados.vendaItens.itens.length)) {
    config.imprimirVendaItens = false;
  }

  return {
    reportType: "orcamento",
    dados,
    config,
    meta: {
      source: ensureString(options.source || entrada.source || ""),
      generatedAt: ensureString(options.generatedAt || entrada.generatedAt || ""),
    },
  };
};

module.exports = adaptOrcamento;
module.exports.REPORT_TYPE = "orcamento";
