
const DadosMock = {
  id: "4257",
  titulo: "PROPOSTA",
  subtitulo: "COMERCIAL",
  imagemCapa: "./public/12.png",
  data: "20/06/2025",
  valorTotal: "R$ 2.169,80",
  desconto: "R$ 0,00",
  valorFinal: "R$ 2.169,80",
  condicoesPagamento: "À vista ou em até 3x sem juros no cartão de crédito.",
  observacoes: "Proposta válida por 30 dias. Preços sujeitos a alteração sem aviso prévio.",
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
      nome: "CAIXILHO JANELA INTEGRADA",
      imagem: "https://sistema.wvetro.com.br/concept/fotos/00001/ESQ_1127.jpg",
      perfil: "PRETO",
      acessorios: "SEM ACESSORIOS",
      vidro: "LAMINADO 4MM",
      localizacao: "COZINHA",
      observacoes: "Verificar vão antes da instalação.",
      itens: [
        { tipo: "1", qtd: 1, largura: 6100, altura: 1000, valorUnt: "2.544,97", valorTotal: "2.544,97" }
      ],
      variaveis: [
        { nome: "PERFIL MARCO LATERAL", valor: "MARCO ÚNICO" },
        { nome: "MONTAGEM DA JANELA", valor: "TODAS MÓVEIS" }
      ]
    },
  ],
  vendaItens: [
    {
      observacoes: "Entrega em até 10 dias úteis",
      total: "R$ 720,00",
      itens: [
        {
          imagem: "https://sistema.wvetro.com.br/concept/fotos/00001/1150.PNG",
          cor: "ACESSÓRIO",
          descricao: "1150 - ROLDANA CARRINHO QUADRUPLA P/ 1127 E 1341",
          unidade: "UN",
          largura: 0,
          altura: 0,
          qtd: 10,
          valorUnitario: "72,00",
          valorTotal: "720,00"
        }
      ]
    }
  ],
  parcelas: [
    { numero: 1, vencimento: "20/07/2025", valor: "R$ 1.000,00", formaPagamento: "Boleto", status: "Pendente" },
    { numero: 2, vencimento: "20/08/2025", valor: "R$ 1.000,00", formaPagamento: "Boleto", status: "Pendente" },
    { numero: 3, vencimento: "20/09/2025", valor: "R$ 1.000,00", formaPagamento: "Boleto", status: "Pendente" }
  ]
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
};

// =====================
// GERADORES DE HTML
// =====================
const Geradores = {
  gerarCabecalho(dados) {
    return `
      <header id="head">
        <div id="details">
          <div class="wvicon">
            <img src="./public/logowhite_evo.svg" />
          </div>
          <div class="detailheader" style="background-color: ${dados.cores.corSecundaria};"></div>
          <div class="detailheaderblue" style="background-color: ${dados.cores.corPrimaria};"></div>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <div style="padding-top: 54px; padding-left: 50px; font-size: 14px;">
            <h2>Proposta ${dados.id}</h2>
          </div>
          <div style="padding-top: 34px; padding-right: 50px;">
            <img src="${dados.licenca.logoUrl}" style="height: 100px;" />
          </div>
        </div>
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

  gerarProjetos(projetos) {
    return `
      <div id="projetos" class="projetos-container">
        ${projetos.map((p, i) => `
          <div class="projeto-item">
            <div class="item-topo">
              <div class="item-imagem">
                <img src="${p.imagem}" alt="Imagem projeto ${i + 1}" class="imagem-projeto" />
              </div>
              <div class="item-info">
                <div class="item-info-header">
                  <h4>${p.nome}</h4>
                  <p><strong>Perfil:</strong> ${p.perfil}</p>
                  <p><strong>Acessórios:</strong> ${p.acessorios}</p>
                  <p><strong>Vidro:</strong> ${p.vidro}</p>
                  <p><strong>Localização:</strong> ${p.localizacao}</p>
                </div>

                <div class="item-tabela">
                  ${p.itens.map((item, idx) => `
                    <div class="tabela-item-linha">
                      <div class="tabela-item-numero">${idx + 1}</div>
                      <div class="tabela-item-valores">
                        <div class="tabela-item-header">
                          <span><strong>Tipo:</strong></span>
                          <span><strong>Qtd:</strong></span>
                          <span><strong>L:</strong></span>
                          <span><strong>H:</strong></span>
                          <span><strong>Vlr Unt:</strong></span>
                          <span><strong>Vlr Total:</strong></span>
                        </div>
                        <div class="tabela-item-dados">
                          <span>${item.tipo}</span>
                          <span>${item.qtd}</span>
                          <span>${item.largura}</span>
                          <span>${item.altura}</span>
                          <span>${item.valorUnt}</span>
                          <span>${item.valorTotal}</span>
                        </div>
                      </div>
                    </div>
                  `).join("")}
                </div>
              </div>
            </div>

            ${p.observacoes ? `
              <div class="item-obs">
                <p><strong>Observações:</strong> ${p.observacoes}</p>
              </div>` : ''
            }

            <div class="linha-separadora"></div>

            ${p.variaveis && p.variaveis.length > 0 ? `
              <div class="item-variaveis">
                <span class="variaveis-titulo">Lista de variáveis</span>
                <table class="tabela-variaveis">
                  <tbody>
                    ${p.variaveis.map(v => `
                      <tr>
                        <td>${v.nome}</td>
                        <td>${v.valor}</td>
                      </tr>`).join("")}
                  </tbody>
                </table>
              </div>` : ''
            }

          </div>
        `).join("")}
      </div>
    `;
  },

  gerarVendaMateriais(vendas) {
    if (!vendas?.length) return "";

    return `
      <div id="venda-itens" class="venda-itens">
        ${vendas.map(venda => `
          <div class="item-venda">
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
              <tbody>
                ${venda.itens.map(item => `
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
                `).join("")}

                ${venda.observacoes ? `
                  <tr>
                    <td class="item-obs" colspan="7">
                      <p><strong>Observações:</strong> ${venda.observacoes}</p>
                    </td>
                  </tr>
                ` : ""}
              </tbody>
            </table>

            <div class="item-venda-total">
              ${venda.total}
            </div>
          </div>
        `).join("")}
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
            ${parcelas.map(p => `
              <tr>
                <td class="pd">${p.numero}</td>
                <td class="pd">${p.vencimento}</td>
                <td class="al-right pd">${p.valor}</td>
                <td class="pd">${p.formaPagamento}</td>
                <td class="pd">${p.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },
  gerarTotais(dados) {
    return `
        <div id="totais" class="totais-container">
          <div class="totais-valores">
              <p><strong>Valor Total:</strong> ${dados.valorTotal}</p>
              <p><strong>Desconto:</strong> ${dados.desconto}</p>
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
  gerarAssinatura(){ 
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
    return `
      <div id="observacoes" class="observacoes">
          <p><strong>Observações:</strong>${observacoes}</p>
      </div>
    `;
  }

};

// =====================
// APLICAÇÃO PRINCIPAL
// =====================
const PropostaApp = {
  dados: {},

  init() {
    this.dados = DadosMock;
    this.cores = this.dados.cores;

    this.preencherCapa();
    this.preencherRodape();

    const novaPagina = document.createElement('div');
    novaPagina.classList.add('page-relatorio');

    // Header
    novaPagina.insertAdjacentHTML('beforeend', Geradores.gerarCabecalho(this.dados));

    // Content
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('content');
    contentDiv.insertAdjacentHTML('beforeend', Geradores.gerarDadosCliente(this.dados));
    novaPagina.appendChild(contentDiv);

    contentDiv.insertAdjacentHTML('beforeend', Geradores.gerarProjetos(this.dados.projetos));
    contentDiv.insertAdjacentHTML('beforeend', Geradores.gerarVendaMateriais(this.dados.vendaItens));
    contentDiv.insertAdjacentHTML('beforeend', Geradores.gerarParcelas(this.dados.parcelas));
    

    // Footer
    novaPagina.insertAdjacentHTML('beforeend', Geradores.gerarFooter(this.dados.licenca, 1, 1));
   

    // Adicionar à página
    document.body.appendChild(novaPagina);

    const novaPagina2 = document.createElement('div');
    novaPagina2.classList.add('page-relatorio');
    novaPagina2.insertAdjacentHTML('beforeend', Geradores.gerarCabecalho(this.dados));

    // Content
    const contentDiv2 = document.createElement('div');
    contentDiv2.classList.add('content');
    contentDiv2.insertAdjacentHTML('beforeend', Geradores.gerarTotais(this.dados));
    contentDiv2.insertAdjacentHTML('beforeend', Geradores.gerarCondicoesPagamento(this.dados.condicoesPagamento));
    contentDiv2.insertAdjacentHTML('beforeend', Geradores.gerarAssinatura());
    contentDiv2.insertAdjacentHTML('beforeend', Geradores.gerarObservacoes(this.dados.observacoes));
    novaPagina2.appendChild(contentDiv2);
    novaPagina2.insertAdjacentHTML('beforeend', Geradores.gerarFooter(this.dados.licenca, 1, 1));

    document.body.appendChild(novaPagina2);
    // Aplicar cores
    this.aplicarCores(this.cores);
  },

  aplicarCores(config) {
    document.querySelectorAll(".cor-primaria").forEach(el => {
      el.style.backgroundColor = config.corPrimaria;
    });
    document.querySelectorAll(".cor-secundaria").forEach(el => {
      el.style.backgroundColor = config.corSecundaria;
    });
    document.querySelectorAll(".color-primaria").forEach(el => {
      el.style.color = config.corPrimaria;
    });
    document.querySelectorAll(".color-secundaria").forEach(el => {
      el.style.color = config.corSecundaria;
    });
    document.querySelectorAll(".borda-cor-primaria").forEach(el => {
      el.style.outlineColor = config.corPrimaria;
    });
    document.querySelectorAll(".borda-cor-secundaria").forEach(el => {
      el.style.outlineColor = config.corSecundaria;
    });
    document.querySelectorAll('svg path[data-cor="primaria"]').forEach(el => {
      el.setAttribute("fill", config.corPrimaria);
    });
    document.querySelectorAll('svg path[data-cor="secundaria"]').forEach(el => {
      el.setAttribute("fill", config.corSecundaria);
    });
    document.querySelectorAll(".valor-final-destaque").forEach(el => {
      el.style.backgroundColor = config.corPrimaria;
      el.style.boxShadow = `-6px 6px 0px ${config.corSecundaria}`;
    });
  },

  preencherCapa() {
    this.preencherTituloRelatorio();
    this.preencherCards();

    Utils.setText("title", this.dados.titulo);
    Utils.setText("subtitle", this.dados.subtitulo);

    Utils.setHTML("licenca-whatsapp", `<i class="icon-capa color-primaria fab fa-whatsapp"></i> ${this.dados.licenca.whatsapp}`);
    Utils.setHTML("licenca-fone", `<i class="icon-capa color-primaria fas fa-phone-alt"></i> ${this.dados.licenca.fone}`);
    Utils.setHTML("licenca-email", `<i class="icon-capa color-primaria fas fa-envelope"></i> ${this.dados.licenca.email}`);
    Utils.setHTML("licenca-site", `<i class="icon-capa color-primaria fas fa-globe"></i> ${this.dados.licenca.site}`);
    Utils.setHTML("licenca-endereco", `<i class="icon-capa color-primaria fas fa-map-marker-alt"></i> ${this.dados.licenca.endereco}`);
    Utils.setHTML("licenca-cnpj", `<i class="icon-capa color-primaria fas fa-building"></i> ${this.dados.licenca.cnpj}`);
    Utils.setHTML("licenca-instagram", `<i class="icon-capa color-primaria fab fa-instagram"></i> <a href="https://www.instagram.com/${this.dados.licenca.instagram}/" target="_blank">${this.dados.licenca.instagram}</a>`);
    Utils.setHTML("logo-capa", `<img src="${this.dados.licenca.logoUrl}" alt="Logo" class="logo-capa">`);
  },

  preencherTituloRelatorio() {
    Utils.setText("title", this.dados.titulo);
    Utils.setText("subtitle", this.dados.subtitulo);
  },

  preencherCards() {
    const cards = document.querySelectorAll(".card-left, .card-middle, .card-right");
    cards.forEach(card => {
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
  }
};

// =====================
// INICIAR APP
// =====================
document.addEventListener("DOMContentLoaded", () => {
  PropostaApp.init();
});
