const DadosMock = {
  id: "4257",
  titulo: "PROPOSTA",
  subtitulo: "COMERCIAL",
  imagemCapa: "./public/12.png",
  imagemTimbre: "./public/12.png",
  data: "20/06/2025",
  valorTotal: 2.169.80,
  desconto: 0.00,
  valorFinal: 2.169.80,
  condicoesPagamento: "À vista ou em até 3x sem juros no cartão de crédito.",
  observacoes:
    "Proposta válida por 30 dias. Preços sujeitos a alteração sem aviso prévio.",
  contratoHtml: "",
  config: {
    imprimirLogoEmTodas: false,
    imprimirParcelas: true,
    imprimirPromissorias: true,
    imprimirValorTotal: true,
    imprimirDesconto: true,
    imprimirVariaveis: true,
    imprimirValorUnitario: true,
    imprimirMedidas: true,
    imprimirVendaItens: true,
    imprimirTimbre: false,
    imprimirContrato: false,
  },
  cores: {
    corPrimaria: "#004080",
    corSecundaria: "#bb961e",
  },
  vendedor: {
    nome: "Bruno Colombo",
    telefone: "(61) 99999-9999",
  },
  licenca: {
    nome: "Wvetro - Sistema para Vidraçarias e Serralherias",
    whatsapp: "15 99821-1524",
    fone: "15 99821-1524",
    email: "geolimass03@gmail.com",
    site: "www.wvetro_teste.com.br",
    endereco: "Rua José Hauer, 1625B - Curitiba/PR",
    cnpj: "12.345.678/0001-90",
    logoUrl: "./public/logowv.png",
    instagram: "Didjoo__",
  },
  cliente: {
    contato: "Construtora Alpha",
    obra: "Gesso Campelo",
    enderecoObra: "Quadra QNE 24 Lote 01 Loja, 04 Taguatinga",
    cidade: "Brasília/DF",
    email: "",
    telefone: "(61) 3037-4922",
  },
  contato: {
    telefone: "(41) 99940-1420",
    email: "financeirowvetro@gmail.com",
    site: "www.wvetro_teste.com.br",
    endereco: "Rua José Hauer, 1625B - Curitiba/PR",
  },
  projetos: [
    {
      ordem: 1,
      nome: "CAIXILHO JANELA INTEGRADA",
      imagem: "https://sistema.wvetro.com.br/concept/fotos/00001/ESQ_1127.jpg",
      perfil: "PRETO",
      acessorios: "SEM ACESSORIOS",
      vidro: "LAMINADO 4MM",
      tipo: "1",
      qtd: 1,
      largura: 6100,
      altura: 1000,
      valorUnt:2.544,97,
      valorTotal: 2.544,97,
      localizacao: "COZINHA",
      observacoes: "Verificar vão antes da instalação.",
      variaveis: [
        { nome: "PERFIL MARCO LATERAL", valor: "MARCO ÚNICO" },
        { nome: "MONTAGEM DA JANELA", valor: "TODAS MÓVEIS" },
      ],
    },
    {
      ordem: 1,
      nome: "CAIXILHO JANELA INTEGRADA",
      imagem: "https://sistema.wvetro.com.br/concept/fotos/00001/ESQ_1127.jpg",
      perfil: "PRETO",
      acessorios: "SEM ACESSORIOS",
      vidro: "LAMINADO 4MM",
      tipo: "1",
      qtd: 1,
      largura: 6100,
      altura: 1000,
      valorUnt: 2.544,97,
      valorTotal: 2.544,97,
      localizacao: "COZINHA",
      observacoes: "Verificar vão antes da instalação.",
      variaveis: [
        { nome: "PERFIL MARCO LATERAL", valor: "MARCO ÚNICO" },
        { nome: "MONTAGEM DA JANELA", valor: "TODAS MÓVEIS" },
      ],
    },

  ],
  vendaItens: 
    {
      total: 720,00,
      itens: [
        {
          imagem: "https://sistema.wvetro.com.br/concept/fotos/00001/1150.PNG",
          cor: "ACESSÓRIO",
          descricao: "1150 - ROLDANA CARRINHO QUADRUPLA P/ 1127 E 1341",
          unidade: "UN",
          largura: 0,
          altura: 0,
          qtd: 10,
          valorUnitario: 72,00,
          valorTotal: 720,00,
          observacoes: "Entrega em até 10 dias úteis",
        },
        {
          imagem: "https://sistema.wvetro.com.br/concept/fotos/00001/1150.PNG",
          cor: "ACESSÓRIO",
          descricao: "1150 - ROLDANA CARRINHO QUADRUPLA P/ 1127 E 1341",
          unidade: "UN",
          largura: 0,
          altura: 0,
          qtd: 10,
          valorUnitario: 72,00
          valorTotal: 720,00,
          observacoes: "Entrega em até 10 dias úteis",
        },
        {
          imagem: "https://sistema.wvetro.com.br/concept/fotos/00001/1150.PNG",
          cor: "ACESSÓRIO",
          descricao: "1150 - ROLDANA CARRINHO QUADRUPLA P/ 1127 E 1341",
          unidade: "UN",
          largura: 0,
          altura: 0,
          qtd: 10,
          valorUnitario: 72,00,
          valorTotal: 720,00,
          observacoes: "Entrega em até 10 dias úteis",
        },
        
      ],
    },
  parcelas: [
    {
      numero: 1,
      vencimento: "20/07/2025",
      valor: 1.000,00,
      formaPagamento: "Boleto",
      status: "Pendente",
    },
    {
      numero: 2,
      vencimento: "20/08/2025",
      valor: 1.000,00,
      formaPagamento: "Boleto",
      status: "Pendente",
    },
    {
      numero: 3,
      vencimento: "20/09/2025",
      valor: 1.000,00,
      formaPagamento: "Boleto",
      status: "Pendente",
    },
  ],
};

// =====================
// FUNÇÕES UTILITÁRIAS
// =====================
const Utils = {
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
};

// =====================
// GERADORES DE HTML
// =====================
const Geradores = {
  gerarCabecalho(dados, pagina = 1) {
    const mostrarLogo = dados.config.imprimirLogoEmTodas || pagina === 1;
    const mostrarTitulo = pagina === 1;

    return `
      <header id="head">
        <div id="details">
          <div class="wvicon">
            <img src="./public/logowhite_evo.svg" />
          </div>
          <div class="detailheader" style="background-color: ${dados.cores.corSecundaria};"></div>
          <div class="detailheaderblue" style="background-color: ${dados.cores.corPrimaria};"></div>
        </div>
        ${
          mostrarLogo
            ? `<div style="display: flex; justify-content: space-between;">
                <div style="padding-top: 54px; padding-left: 50px; font-size: 14px;">
                  ${mostrarTitulo ? `<h2>Proposta ${dados.id}</h2>` : ''}
                </div>
                <div style="padding-top: 34px; padding-right: 50px;">
                  <img src="${dados.licenca.logoUrl}" style="height: 100px;" />
                </div>
              </div>`
            : ''
        }
      </header>
    `;
  },

  gerarFooter(licenca, pagina = 1, totalPaginas = 1) {
    return `
      <footer class="footer">
        <div class="footer-image">
          <svg xmlns="http://www.w3.org/2000/svg" width="794" height="78" viewBox="0 0 1637 158" fill="none">
              <g clip-path="url(#clip0_44_103)">
                  <line x1="100.999" y1="13.2461" x2="1229" y2="13.2461" stroke="#BB961E" stroke-width="5" />
                  <path
                      d="M1221.68 12.4055C1224.76 4.90059 1232.07 0 1240.18 0H1646C1657.05 0 1666 8.95431 1666 20V111C1666 122.046 1657.05 131 1646 131H1202.83C1188.6 131 1178.92 116.566 1184.33 103.406L1221.68 12.4055Z"
                      data-cor="primaria" fill="#004080" />
                  <path
                      d="M1221.68 12.4055C1224.76 4.90059 1232.07 0 1240.18 0H1646C1657.05 0 1666 8.95431 1666 20V111C1666 122.046 1657.05 131 1646 131H1202.83C1188.6 131 1178.92 116.566 1184.33 103.406L1221.68 12.4055Z"
                      data-cor="primaria" fill="#004080" />
                  <line x1="103.324" y1="12.9216" x2="57.3239" y2="128.922" stroke="#BB961E" stroke-width="5"  />
                  <path
                      d="M101.215 551.462C96.5717 547.584 93.9327 541.814 94.037 535.765L100.651 151.997C100.841 140.953 109.949 132.154 120.993 132.345L143.766 132.737C154.81 132.927 163.609 142.035 163.418 153.079L156.488 555.206C156.198 572.009 136.571 580.984 123.672 570.213L101.215 551.462Z"
                      data-cor="secundaria" fill="#BB961E" />
                  <path
                      d="M12.9924 544.703C5.64594 541.446 0.962086 534.109 1.10056 526.074L7.65114 145.997C7.84148 134.953 16.9488 126.154 27.9928 126.345L107.67 127.718C118.715 127.908 127.513 137.016 127.323 148.06L120.192 561.827C119.945 576.142 105.178 585.568 92.0894 579.767L12.9924 544.703Z"
                      data-cor="primaria" fill="#004080" />
              </g>
              <defs>
                  <clipPath id="clip0_44_103">
                      <rect width="1637" height="158" fill="white" />
                  </clipPath>
              </defs>
          </svg>
        </div>
        <div class="footer-page-number">
          <span>${pagina} / ${totalPaginas}</span>
        </div>
        <div class="footer-info">
          <div class="footer-info-left">
            <strong>${licenca.nome}</strong><br />
            ${licenca.fone}<br />
            ${licenca.email}
          </div>
          <div class="footer-info-right">
            <div>${licenca.site}</div>
          </div>
        </div>
        <div class="footer-site">
          <span>© Wvetro - Sistema para Vidraçarias e Serralherias</span>
        </div>
      </footer>
    `;
  },

  gerarDadosCliente(dados) {
    return `
      <div class="dados-cliente">
        <div class="linha1">
          <span><strong>Obra:</strong> ${dados.cliente.obra}</span>
          <span><strong>Dt.Proposta:</strong> ${dados.data}</span>
        </div>
        <div class="linha2">
          <span><strong>Contato:</strong> ${dados.cliente.contato}</span>
          <span><strong>E-mail:</strong> ${dados.cliente.email}</span>
          <span><strong>Telefone:</strong> ${dados.cliente.telefone}</span>
        </div>
        <div class="linha3">
          <span><strong>Endereço Obra:</strong> ${dados.cliente.enderecoObra}</span>
          <span><strong>Cidade:</strong> ${dados.cliente.cidade}</span>
        </div>
        <div class="linha4 destaque cor-primaria">
          <span><strong>Vendedor:</strong> ${dados.vendedor.nome}</span>
          <span><strong>Telefone:</strong> ${dados.vendedor.telefone}</span>
        </div>
      </div>
    `;
  },

  gerarProjeto(p, config) {
    return `
        <div class="projeto-item avoid-break">
          <div class="item-topo">
            <div class="item-imagem">
              <img src="${p.imagem}" alt="Imagem projeto ${p.ordem}" class="imagem-projeto" />
            </div>
            <div class="item-info">
              <div class="item-info-header">
                <h4>${p.nome}</h4>
                <p><strong>Perfil:</strong> ${p.perfil}</p>
                <p><strong>Acessórios:</strong> ${p.acessorios}</p>
                <p><strong>Vidro:</strong> ${p.vidro}</p>
                <p><strong>Localização:</strong> ${p.localizacao}</p>
              </div>
              <div class="item-tabela allow-break">
                <div class="tabela-item-linha">
                  <div class="tabela-item-numero">${p.ordem}</div>
                  <div class="tabela-item-valores">
                    <div class="tabela-item-header">
                      <span><strong>Tipo:</strong></span>
                      <span><strong>Qtd:</strong></span>
                      ${config.imprimirMedidas ? `
                        <span><strong>L:</strong></span>
                        <span><strong>H:</strong></span>` : ""}
                      ${config.imprimirValorUnitario ? `
                        <span><strong>Vlr Unt:</strong></span>
                        <span><strong>Vlr Total:</strong></span>` : ""}
                    </div>
                    <div class="tabela-item-dados">
                      <span>${p.tipo}</span>
                      <span>${p.qtd}</span>
                      ${config.imprimirMedidas ? `
                        <span>${p.largura}</span>
                        <span>${p.altura}</span>` : ""}
                      ${config.imprimirValorUnitario ? `
                        <span>${p.valorUnt}</span>
                        <span>${p.valorTotal}</span>` : ""}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          ${p.observacoes ? `
            <div class="item-obs allow-break">
              <p><strong>Observações:</strong> ${p.observacoes}</p>
            </div>` : ""}
        </div>
    `;
  },

  gerarVariaveis(lista, config) {
    if (!lista || !lista.length || !config.imprimirVariaveis) return "";

    return `
      <div class="item-variaveis">
        <span class="variaveis-titulo">Lista de variáveis</span>
        <table class="tabela-variaveis">
          <tbody>
            ${lista
              .map(v => `
                <tr>
                  <td>${v.nome}</td>
                  <td>${v.valor}</td>
                </tr>
              `)
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  },



  gerarVendaMateriais(vendas) {
    if (!vendas.itens) return "";

    return `
      <div id="venda-itens" class="venda-itens">
        <div class="item-venda avoid-break">
          <span class="item-venda-titulo">Venda de materiais</span>
          <table class="item-venda-lista">
            <thead>
              <tr class="item-venda-cabecalho">
                <th class="produto">Produto</th>
                <th>Un.</th>
                <th>Larg.</th>
                <th>Alt.</th>
                <th>Qtde.</th>
                <th>Vlr unt.</th>
                <th class="valor-total">Vlr. Total</th>
              </tr>
            </thead>
            ${vendas.itens
              .map(
                (item) => `
                <tbody class="venda-item-linha avoid-break">
                  <tr>
                    <td class="item-venda-produto">
                      <img src="${item.imagem}" alt="Imagem Produto" class="produto-imagem">
                      <div>
                        <div class="produto-cor"><strong>Cor:</strong> ${item.cor}</div>
                        <div>${item.descricao}</div>
                      </div>
                    </td>
                    <td class="center">${item.unidade}</td>
                    <td class="center">${item.largura}</td>
                    <td class="center">${item.altura}</td>
                    <td class="center">${item.qtd}</td>
                    <td class="right">${item.valorUnitario}</td>
                    <td class="right">${item.valorTotal}</td>
                  </tr>
                  ${
                    item.observacoes
                      ? `
                    <tr>
                      <td class="item-obs" colspan="7">
                        <p><strong>Observações:</strong> ${item.observacoes}</p>
                      </td>
                    </tr>
                  `
                      : ""
                  }
                </tbody>
              `
              )
              .join("")}
          </table>
          <div class="item-venda-total">
            ${vendas.total}
          </div>
        </div>
      </div>
    `;
  },


  gerarParcelas(parcelas) {
    return `
      <div id="parcela" class="parcela-container">
        <table id="parcela-lista" class="parcela-tabela">
          <thead>
            <tr class="parcela-cabecalho">
              <th class="al-left pd">Parcela</th>
              <th class="al-left pd">Vencimento</th>
              <th class="al-right pd">Valor</th>
              <th class="al-left pd">Forma de Pagamento</th>
              <th class="al-left pd">Status</th>
            </tr>
          </thead>
          <tbody>
            ${parcelas
              .map(
                (p) => `
              <tr>
                <td class="pd">${p.numero}</td>
                <td class="pd">${p.vencimento}</td>
                <td class="al-right pd">${p.valor}</td>
                <td class="pd">${p.formaPagamento}</td>
                <td class="pd">${p.status}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  },
  gerarTotais(dados, config = {}) {
    return `
        <div id="totais" class="totais-container">
          <div class="totais-valores">
              ${config.imprimirDesconto ? `
              <p><strong>Valor Total:</strong> ${dados.valorTotal}</p>
              <p><strong>Valor Desconto:</strong> ${dados.desconto}</p>` : ""} 
              <div class="valor-final-destaque ">
                  Valor Final: ${dados.valorFinal}
              </div>
          </div>
      </div>
    `;
  },

  gerarCondicoesPagamento(condicoes) {
    return `
      <div id="condicoes" class="condicoes-pagamento">
          <p><strong>Condições de pagamento: </strong>${condicoes}</p>
      </div>
    `;
  },
  gerarAssinatura() {
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

  gerarObservacoes(observacoes) {
    if (!observacoes || observacoes.trim() === "") return "";
    return `
      <div id="observacoes" class="observacoes">
          <p><strong>Observações:</strong>${observacoes}</p>
      </div>
    `;
  },

  gerarContrato() {
    return `
      <div id="contrato" class="contrato-container">
        <h2>Contrato de Prestação de Serviços</h2>
        <p>Este contrato é celebrado entre a empresa contratada e o contratante, conforme os termos e condições acordados.</p>
        <p><strong>Data:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Assinatura do Contratante:</strong></p>
        <div class="assinatura-linha"></div>
        <p><strong>Assinatura do Contratado:</strong></p>
        <div class="assinatura-linha"></div>
      </div>
    `;
  }

};

const Paginador = {
  inserirTimbre(pagina, imagemUrl) {
      const fundo = document.createElement("div");
      fundo.classList.add("timbre-background");
      fundo.style.backgroundImage = `url('${imagemUrl}')`;
      pagina.appendChild(fundo);
  },

adicionarConteudoPaginado(blocos, gerarCabecalho, gerarFooter, dadosLicenca, config = {}) {
  let totalPaginas = 1;
  let paginaAtual = this.criarNovaPagina(
    gerarCabecalho(totalPaginas),
    gerarFooter(dadosLicenca, totalPaginas, "?"),
    config
  );
  let contentDiv = paginaAtual.querySelector(".content");
  document.body.appendChild(paginaAtual);

  let promessas = [];

  blocos.forEach((bloco) => {
    promessas.push(
      new Promise((resolve) => {
        const clone = bloco.cloneNode(true);
        clone.style.visibility = "hidden";
        clone.style.position = "absolute";
        clone.style.left = "-9999px";
        document.body.appendChild(clone);

        requestAnimationFrame(() => {
          const alturaBloco = clone.offsetHeight;
          const alturaAtual = contentDiv.scrollHeight;
          const LIMITE_PAGINA = 1000;
          const isAvoidBreak = bloco.classList.contains("avoid-break");

          document.body.removeChild(clone);

          // Se for um bloco indivisível e não couber, vai para nova página
          if (alturaAtual + alturaBloco > LIMITE_PAGINA && isAvoidBreak) {
            // Se o bloco sozinho já ultrapassa o limite, deixa ele mesmo assim
            if (alturaBloco > LIMITE_PAGINA) {
              console.warn("Bloco maior que a página. Será forçado.");
            } else {
              totalPaginas++;
              paginaAtual = Paginador.criarNovaPagina(
                gerarCabecalho(totalPaginas),
                gerarFooter(dadosLicenca, totalPaginas, "?"),
                config
              );
              contentDiv = paginaAtual.querySelector(".content");
              document.body.appendChild(paginaAtual);
            }
          } else if (alturaAtual + alturaBloco > LIMITE_PAGINA) {
            // Para blocos quebráveis, vai normalmente
            totalPaginas++;
            paginaAtual = Paginador.criarNovaPagina(
              gerarCabecalho(totalPaginas),
              gerarFooter(dadosLicenca, totalPaginas, "?"),
              config
            );
            contentDiv = paginaAtual.querySelector(".content");
            document.body.appendChild(paginaAtual);
          }

          contentDiv.appendChild(bloco);
          resolve();
        });
      })
    );
  });

  Promise.all(promessas).then(() => {
    document.querySelectorAll(".footer-page-number").forEach((el, i) => {
      el.innerHTML = `<span>${i + 1} / ${totalPaginas}</span>`;
    });
  });
},

  criarNovaPagina(cabecalhoHTML, footerHTML, config) {
    const pagina = document.createElement("div");
    pagina.classList.add("page-relatorio");

    if (config?.usarTimbre && config.imagemTimbre) {
      pagina.classList.add("timbre");
      this.inserirTimbre(pagina, config.imagemTimbre);
    }

    pagina.insertAdjacentHTML("beforeend", cabecalhoHTML);

    const content = document.createElement("div");
    content.classList.add("content");
    pagina.appendChild(content);

    pagina.insertAdjacentHTML("beforeend", footerHTML);

    return pagina;
  },


};

// =====================
// APLICAÇÃO PRINCIPAL
// =====================
const PropostaApp = {
  dados: {},

  async init() {
    const dadosCarregados = await this.carregarDados();

    if (!dadosCarregados) {
      alert("Erro ao carregar dados da proposta.");
      return;
    }

    this.dados = dadosCarregados;
    this.cores = this.dados.cores;
    this.config = this.dados.config;

    this.preencherCapa();
    this.preencherRodape();

    const blocosHTML = [
      criarBloco(Geradores.gerarDadosCliente(this.dados)),
      ...this.dados.projetos.flatMap((projeto) => {
        const blocos = [
          criarBloco(Geradores.gerarProjeto(projeto, this.config, !projeto.variaveis?.length > 0))
        ];

        if (projeto.variaveis?.length > 0 && this.config.imprimirVariaveis) {
          blocos.push(
            criarBloco(Geradores.gerarVariaveis(projeto.variaveis, this.config))
          );
        }

        return blocos;
      }),
      (this.config.imprimirVendaItens ? criarBloco(Geradores.gerarVendaMateriais(this.dados.vendaItens, this.config)) : null),
      (this.config.imprimirParcelas ? criarBloco(Geradores.gerarParcelas(this.dados.parcelas))  : null),
      (this.config.imprimirValorTotal ? criarBloco(Geradores.gerarTotais(this.dados, this.config)) : null),
      criarBloco(Geradores.gerarCondicoesPagamento(this.dados.condicoesPagamento)),
      criarBloco(Geradores.gerarAssinatura()),
      criarBloco(Geradores.gerarObservacoes(this.dados.observacoes)),
      (this.config.imprimirContrato ? criarBloco(Geradores.gerarContrato()) : null),
    ];

    function criarBloco(htmlString) {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = htmlString;
      return wrapper;
    }

    Paginador.adicionarConteudoPaginado(
      blocosHTML,
      (pagina) => Geradores.gerarCabecalho(this.dados, pagina),
      (licenca, pag, total) => Geradores.gerarFooter(licenca, pag, total),
      this.dados.licenca,
      {
        usarTimbre: this.config.imprimirTimbre,
        imagemTimbre: this.dados.imagemTimbre,
      }
    );

    // Aplicar cores
    this.aplicarCores(this.cores);
  },

  async carregarDados() {
     const dados = getDadosRelatorio();

    if (!dados || !dados.licencaid || !dados.orcamentoid) {
      alert("Parâmetros inválidos ou ausentes.");
      return null;
    }

    try {
      const response = await fetch(
        `https://suaapi.com/relatorios?licencaid=${dados.licencaid}&orcamentoid=${dados.orcamentoid}`
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar os dados do relatório.");
      }

      const dadosRelatorio = await response.json();

      // Opcional: incluir a config manual do usuário (vinda da URL)
      dadosRelatorio.config = dados.config;

      return dadosRelatorio;
    } catch (erro) {
      console.error("Erro no fetch:", erro);
      return null;
    }
  },

  getDadosRelatorio() {
    const params = new URLSearchParams(window.location.search);
    const dadosEncoded = params.get("dados");

    if (!dadosEncoded) return null;

    try {
      return JSON.parse(decodeURIComponent(dadosEncoded));
    } catch (e) {
      console.error("Erro ao decodificar os dados:", e);
      return null;
    }
  },


  aplicarCores(config) {
    document.querySelectorAll(".cor-primaria").forEach((el) => {
      el.style.backgroundColor = config.corPrimaria;
    });
    document.querySelectorAll(".cor-secundaria").forEach((el) => {
      el.style.backgroundColor = config.corSecundaria;
    });
    document.querySelectorAll(".color-primaria").forEach((el) => {
      el.style.color = config.corPrimaria;
    });
    document.querySelectorAll(".color-secundaria").forEach((el) => {
      el.style.color = config.corSecundaria;
    });
    document.querySelectorAll(".borda-cor-primaria").forEach((el) => {
      el.style.outlineColor = config.corPrimaria;
    });
    document.querySelectorAll(".borda-cor-secundaria").forEach((el) => {
      el.style.outlineColor = config.corSecundaria;
    });
    document.querySelectorAll('svg path[data-cor="primaria"]').forEach((el) => {
      el.setAttribute("fill", config.corPrimaria);
    });
    document
      .querySelectorAll('svg path[data-cor="secundaria"]')
      .forEach((el) => {
        el.setAttribute("fill", config.corSecundaria);
      });
    document.querySelectorAll(".valor-final-destaque").forEach((el) => {
      el.style.backgroundColor = config.corPrimaria;
      el.style.boxShadow = `-6px 6px 0px ${config.corSecundaria}`;
    });
  },

  preencherCapa() {
    this.preencherTituloRelatorio();
    this.preencherCards();

    Utils.setText("title", this.dados.titulo);
    Utils.setText("subtitle", this.dados.subtitulo);

    Utils.setHTML(
      "licenca-whatsapp",
      `<i class="icon-capa color-primaria fab fa-whatsapp"></i> ${this.dados.licenca.whatsapp}`
    );
    Utils.setHTML(
      "licenca-fone",
      `<i class="icon-capa color-primaria fas fa-phone-alt"></i> ${this.dados.licenca.fone}`
    );
    Utils.setHTML(
      "licenca-email",
      `<i class="icon-capa color-primaria fas fa-envelope"></i> ${this.dados.licenca.email}`
    );
    Utils.setHTML(
      "licenca-site",
      `<i class="icon-capa color-primaria fas fa-globe"></i> ${this.dados.licenca.site}`
    );
    Utils.setHTML(
      "licenca-endereco",
      `<i class="icon-capa color-primaria fas fa-map-marker-alt"></i> ${this.dados.licenca.endereco}`
    );
    Utils.setHTML(
      "licenca-cnpj",
      `<i class="icon-capa color-primaria fas fa-building"></i> ${this.dados.licenca.cnpj}`
    );
    Utils.setHTML(
      "licenca-instagram",
      `<i class="icon-capa color-primaria fab fa-instagram"></i> <a href="https://www.instagram.com/${this.dados.licenca.instagram}/" target="_blank">${this.dados.licenca.instagram}</a>`
    );
    Utils.setHTML(
      "logo-capa",
      `<img src="${this.dados.licenca.logoUrl}" alt="Logo" class="logo-capa">`
    );
  },

  preencherTituloRelatorio() {
    Utils.setText("title", this.dados.titulo);
    Utils.setText("subtitle", this.dados.subtitulo);
  },

  preencherCards() {
    const cards = document.querySelectorAll(
      ".card-left, .card-middle, .card-right"
    );
    cards.forEach((card) => {
      card.style.backgroundImage = `url('${this.dados.imagemCapa}')`;
      card.style.backgroundRepeat = "no-repeat";
      card.style.backgroundSize = "794px auto";
      card.style.backgroundPositionY = "center";
    });

    Utils.setCardPosition(".card-left", "left");
    Utils.setCardPosition(".card-middle", "center");
    Utils.setCardPosition(".card-right", "right");
  },

  preencherRodape() {
    Utils.setText("rodape-telefone", this.dados.contato.telefone);
    Utils.setText("rodape-email", this.dados.contato.email);
    Utils.setText("rodape-site", this.dados.contato.site);
    Utils.setText("rodape-endereco", this.dados.contato.endereco);
  },
};

// =====================
// INICIAR APP
// =====================
document.addEventListener("DOMContentLoaded", () => {
  PropostaApp.init();
});
