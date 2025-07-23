
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
  formatarTelefone(telefone) {
    if (!telefone || typeof telefone !== 'string') return telefone;
    telefone = telefone.replace(/\D/g, ''); 

    if (telefone.length === 11) {
      return telefone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (telefone.length === 10) {
      return telefone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    } else {
      return telefone; 
    }
  },
  formatarValor(valor, comSimbolo = true) {
    if (!valor) return comSimbolo ? 'R$ 0,00' : '0,00';
    if (typeof valor === 'string') valor = parseFloat(valor.replace(',', '.'));

    return valor.toLocaleString('pt-BR', {
      style: comSimbolo ? 'currency' : 'decimal',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  },
  dividirEmBlocosQuebraveis(texto, {
    paragrafosPorBloco = 5,
    className = "allow-break",
    titulo = null
  } = {}) {
    if (!texto || typeof texto !== "string") return [];

    // Divide por linhas
    const linhas = texto
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const blocos = [];

    for (let i = 0; i < linhas.length; i += paragrafosPorBloco) {
      const grupo = linhas.slice(i, i + paragrafosPorBloco);
      const wrapper = document.createElement("div");
      wrapper.className = className;
      wrapper.innerHTML = `
        ${titulo && i === 0 ? `<h3 class="observacoes">${titulo}</h3>` : ""}
        <div class="observacoes-conteudo">
          ${grupo.map(linha => `<p>${linha}</p>`).join("")}
        </div>
      `;
      blocos.push(wrapper);
    }

    return blocos;
  }
};

// =====================
// GERADORES DE HTML
// =====================
const Geradores = {
  gerarCabecalho(dados, config, pagina = 1) {
    const mostrarLogo = config.imprimirLogoEmTodas || pagina === 1;
    const mostrarTitulo = pagina === 1;

    return `
      <header id="head">
        <div id="details">
          <div class="wvicon">
            <img src="./assets/logowhite_evo.svg" />
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
                  <line x1="100.999" y1="13.2461" x2="1229" y2="13.2461" stroke="#BB961E" stroke-width="5" data-cor="secundaria"/>
                  <path
                      d="M1221.68 12.4055C1224.76 4.90059 1232.07 0 1240.18 0H1646C1657.05 0 1666 8.95431 1666 20V111C1666 122.046 1657.05 131 1646 131H1202.83C1188.6 131 1178.92 116.566 1184.33 103.406L1221.68 12.4055Z"
                      data-cor="primaria" fill="#004080" />
                  <path
                      d="M1221.68 12.4055C1224.76 4.90059 1232.07 0 1240.18 0H1646C1657.05 0 1666 8.95431 1666 20V111C1666 122.046 1657.05 131 1646 131H1202.83C1188.6 131 1178.92 116.566 1184.33 103.406L1221.68 12.4055Z"
                      data-cor="primaria" fill="#004080" />
                  <line x1="103.324" y1="12.9216" x2="57.3239" y2="128.922" stroke="#BB961E" stroke-width="5" data-cor="secundaria"/>
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
        <div class="footer-page-number" >
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
          <span style="min-width: 165px;"><strong>Telefone:</strong> ${Utils.formatarTelefone(dados.cliente.telefone)}</span>
        </div>
        <div class="linha3">
          <span><strong>Endereço Obra:</strong> ${dados.cliente.enderecoObra}</span>
          <span style="min-width: 165px;"><strong>Cidade:</strong> ${dados.cliente.cidade}</span>
        </div>
        <div class="linha4 destaque" style="background-color: ${dados.cores.corPrimaria};">
          <span><strong>Vendedor:</strong> ${dados.vendedor.nome}</span>
          <span><strong>Telefone:</strong> ${Utils.formatarTelefone(dados.vendedor.telefone)}</span>
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
                      <span class="col-tipo"><strong>Tipo:</strong></span>
                      <span class="col-qtd"><strong>Qtd:</strong></span>
                      ${config.imprimirMedidas ? `
                        <span class="col-qtd"><strong>M2:</strong></span>
                        <span class="col-l"><strong>L:</strong></span>
                        <span class="col-h"><strong>H:</strong></span>` : ""}
                      ${config.imprimirValorUnitario ? `
                        <span class="col-vlr-unt"><strong>Vlr Unt:</strong></span>
                        <span class="col-vlr-total"><strong>Vlr Total:</strong></span>` : ""}
                    </div>
                    <div class="tabela-item-dados">
                      <span class="col-tipo">${p.tipo}</span>
                      <span class="col-qtd">${p.qtd}</span>
                      ${config.imprimirMedidas ? `
                        <span class="col-qtd">${p.m2}</span>
                        <span class="col-l">${p.largura}</span>
                        <span class="col-h">${p.altura}</span>` : ""}
                      ${config.imprimirValorUnitario ? `
                        <span class="col-vlr-unt">${Utils.formatarValor(p.valorUnt, false)}</span>
                        <span class="col-vlr-total">${Utils.formatarValor(p.valorTotal, false)}</span>` : ""}
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
                    <td class="right">${Utils.formatarValor(item.valorUnitario, false)}</td>
                    <td class="right">${Utils.formatarValor(item.valorTotal, false)}</td>
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
    if (!parcelas) return "";

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
                <td class="al-right pd">${Utils.formatarValor(p.valor, false)}</td>
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

    console.log(dados.logoTempera)
    return `
        <div id="totais" class="totais-container">
          <div class="logo-tempera">
            ${dados.logoTempera ?`
              <img src="${dados.logoTempera}" style="height: 150px" alt="logo-tempera"/>`
            : ''}
          </div>
          <div class="totais-valores">
              ${config.imprimirDesconto ? `
              <p><strong>Valor Total:</strong> ${Utils.formatarValor(dados.valorTotal)}</p>
              <p><strong>Valor Desconto:</strong> ${Utils.formatarValor(dados.desconto)}</p>` : ""} 
              <div class="valor-final-destaque">
                  Valor Final: ${Utils.formatarValor(dados.valorFinal)}
              </div>
          </div>
      </div>
    `;
  },

  gerarCondicoesPagamento(condicoes) {
    return `
      <div id="condicoes" class="condicoes-pagamento">
          <p><h3>Condições de pagamento: </h3>${condicoes}</p>
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
      <div id="observacoes" class="observacoes allow-break">
          <h3>Observações: </h3>
          <div class="observacoes-conteudo">
            ${observacoes}
          </div>
      </div>
    `;
  },

  gerarPromissoria(dados) {
    if (!dados || !dados.promissoria) return "";

    return `
      <div class="promissoria-container">
        <div class="promissoria-left">
          <span>AVALISTA(S)</span>
          <p>NOME__________________________________________</p>
          <p>CPF/CNPJ______________________________________</p>
          <p>ENDEREÇO_____________________________________</p>
        </div>
        <div class="promissoria-right ">

          <div style="display: flex;justify-content: space-between;margin-bottom: 20px;font-size: 9pt;">
            <div><strong>Nº:</strong> <span style="border: 1px solid black;border-radius: 8px;padding: 5px 18px;">${dados.promissoria.documento}</span></div>
            <div><strong>Vencimento,</strong> 10/05/2025</div>
            <div><strong>R$</strong> <span style="border: 1px solid black;border-radius: 8px;padding: 5px 18px;">${Utils.formatarValor(dados.promissoria.valor)}</span></div>
          </div>

          <p>${dados.promissoria.descricao}</p>

          <div style="display: flex; justify-content: flex-end">
            <span style="background: #ccc;padding: 3px 10px">por esta via de:</span>
            <span style="letter-spacing: 10px; padding: 4px 10px; font-weight: bold;">NOTA PROMISSÓRIA</span>
          </div>

          <p>${dados.licenca.nome} | CNPJ: ${dados.licenca.cnpj}</p>

          <p style="display: flex;margin: 2px;">
            <span style="width: 131px">ou à sua ordem, a quantia de</span>
            <span style="background: #ccc; padding: 7px; width: 100%">${dados.promissoria.valorExtenso1}</span>
          </p>

          <div style="display: flex; gap: 5px">
             <span style="background: #ccc; padding: 7px; width: 75%">${dados.promissoria.valorExtenso2}</span>
            <span style="text-align: left;">EM MOEDA CORRENTE<br />DESTE PAÍS</span>
          </div>
         

          <p>Pagável em Sorocaba</p>
          <div style="margin-top: 20px">
            <p>EMITENTE: ${dados.cliente.contato}</p>
            <p>CPF/CNPJ: ${dados.cliente.cpfcnpj}</p>
            <p>Endereço: ${dados.cliente.endereco}</p>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 20px;">
            <div>Sorocaba, 10/05/205</div>
            <div style="text-align: center;">
              _______________________________________________________<br/>
              Assinatura
            </div>
          </div>
        </div>
      </div>
    `;
  },

  gerarContrato(contrato) {
    return `

      <div id="contrato" class="contrato-content">${contrato}</div>
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

  adicionarConteudoPaginado(
    blocos,               
    gerarCabecalho,      
    gerarFooter,        
    dados = {},        
    config = {}       
  ) {

    return new Promise(resolve => {
      const LIMITE_PAGINA = config.imprimirLogoEmTodas === true ? 765 : 780; 
      let totalPaginas = 1;
      
      let paginaAtual = this.criarNovaPagina(
        gerarCabecalho(totalPaginas),
        gerarFooter(totalPaginas, "?"),
        dados.imagemTimbre,    
      );
      let contentDiv = paginaAtual.querySelector(".content");
      document.body.appendChild(paginaAtual);

      const paginas  = [paginaAtual];     
      const promessas = [];               

      blocos.filter(Boolean).forEach(bloco => {
        promessas.push(
          new Promise(done => {
            const medidor = bloco.cloneNode(true);
            medidor.style.visibility = "hidden";
            medidor.style.position   = "absolute";
            medidor.style.left       = "-9999px";
            document.body.appendChild(medidor);

            requestAnimationFrame(() => {
            
              const alturaBloco  = medidor.offsetHeight;
              const alturaAtual  = contentDiv.scrollHeight;
              const evitarQuebra = bloco.classList.contains("avoid-break");
            
              document.body.removeChild(medidor); 

              const ultrapassa = alturaAtual + alturaBloco > LIMITE_PAGINA;

              if (ultrapassa && (!evitarQuebra || alturaBloco > LIMITE_PAGINA)) {
                totalPaginas++;
                paginaAtual = this.criarNovaPagina(
                  gerarCabecalho(totalPaginas),
                  gerarFooter(totalPaginas, "?"),
                  dados.imagemTimbre, 
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

      Promise.all(promessas).then(() => {
        paginas.forEach((pagina, idx) => {
          const footerNumber = pagina.querySelector(".footer-page-number");
          if (footerNumber) {
            footerNumber.textContent = `${idx + 1} / ${paginas.length}`;
          }
        });

        resolve();  
      });
    });
  },

  criarNovaPagina(cabecalhoHTML, footerHTML, imagemTimbre) {
    const pagina = document.createElement("div");
    pagina.classList.add("page-relatorio");

    if (imagemTimbre) {
      pagina.classList.add("timbre");
      this.inserirTimbre(pagina, imagemTimbre);
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
    const {dadosCarregados, config} = await this.carregarDados();

    if (!dadosCarregados) {
      console.error("Erro ao carregar dados da proposta.");
      return;
    }

    this.dados  = dadosCarregados ?? {};
    this.dados.cores = this.dados.cores ?? {};

    const coresPadrao = { corPrimaria: "#004080", corSecundaria: "#bb961e" };
    this.dados.cores  = { ...coresPadrao, ...this.dados.cores };

    this.cores = this.dados.cores;

    this.config = config ?? {};

    console.log(this.config)

    this.preencherCapa();
    this.preencherRodape();

    const blocosHTML = [
      criarBloco(Geradores.gerarDadosCliente(this.dados)),
      ...(this.dados.projetos ?? []).flatMap((projeto) => {
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
      ...Utils.dividirEmBlocosQuebraveis(this.dados.observacoes, {
        paragrafosPorBloco: 3,
        className: "allow-break",
        titulo: "Observações:"
      }),
    ].filter(Boolean);

    function criarBloco(htmlString) {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = htmlString;
      return wrapper;
    }

    function quebrarObservacoesEmBlocos(observacoesHtml) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = observacoesHtml;

      const fragmentos = [];

      tempDiv.childNodes.forEach(node => {
        if (
          node.nodeType === Node.ELEMENT_NODE ||
          (node.nodeType === Node.TEXT_NODE && node.textContent.trim())
        ) {
          const wrapper = document.createElement("div");
          wrapper.classList.add("observacoes", "allow-break");
          wrapper.innerHTML = `
            <h3>Observações:</h3>
            <div class="observacoes-conteudo">
              ${node.outerHTML || node.textContent}
            </div>`;
          fragmentos.push(wrapper);
        }
      });

      console.log("Blocos de observações gerados:", fragmentos.length);

      return fragmentos;
    }


    await Paginador.adicionarConteudoPaginado(
      blocosHTML,
      pag => Geradores.gerarCabecalho(this.dados, this.config, pag),
      (pag, tot) => Geradores.gerarFooter(this.dados.licenca, pag, tot),
      this.dados,
      this.config
    );

    if (this.config.imprimirPromissorias && this.dados) {
      const Pagina = document.createElement("div");
      Pagina.classList.add("contrato-page");

      Pagina.innerHTML = Geradores.gerarPromissoria(this.dados)
      document.body.appendChild(Pagina);
    }

    if (this.config.imprimirContrato && this.dados.contratoHtml) {
      const contratoPagina = document.createElement("div");
      contratoPagina.classList.add("contrato-page");

      contratoPagina.innerHTML = Geradores.gerarContrato(this.dados.contratoHtml);
      document.body.appendChild(contratoPagina);
    }

    this.aplicarCores(this.cores);
    window.readyForPDF = true;
    console.log("Relatório renderizado com sucesso.");  
  },

  async carregarDados() {
     const { licencaId, orcamentoId, config } = this.getQueryParams();

    if (!config || !licencaId || !orcamentoId) {
      console.error("Parâmetros inválidos ou ausentes.");
      return null;
    }

    try {
      const response = await fetch("https://dev.wvetro.com.br/geovaneconcept/app.wvetro.arelorcamentoconcepthtml", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          licencaId,
          orcamentoId,
          config
        })
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar os dados do relatório.");
      }

      const dadosRelatorio = await response.json();
      return {dadosCarregados: dadosRelatorio, config};
    } catch (e) {
      console.error("Erro no fetch:", e);
       return null;
    }
  },

  getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      licencaId: params.get('licencaId'),
      orcamentoId: params.get('orcamentoId'),
      config: JSON.parse(decodeURIComponent(params.get('config')))
    };
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
    document.querySelectorAll('[data-cor="primaria"]').forEach((el) => {
      if (el.hasAttribute("fill")) {
        el.setAttribute("fill", config.corPrimaria);
      }
      if (el.hasAttribute("stroke")) {
        el.setAttribute("stroke", config.corPrimaria);
      }
    });
    document.querySelectorAll('[data-cor="secundaria"]').forEach((el) => {
      if (el.hasAttribute("fill")) {
        el.setAttribute("fill", config.corSecundaria);
      }
      if (el.hasAttribute("stroke")) {
        el.setAttribute("stroke", config.corSecundaria);
      }
    });
    document.querySelectorAll(".valor-final-destaque").forEach((el) => {
      el.style.backgroundColor = config.corPrimaria;
      el.style.boxShadow = `-6px 6px 0px ${config.corSecundaria}`;
    });
  },

  preencherCapa() {

    this.preencherCards();

    Utils.setText("title", this.dados.titulo);
    Utils.setText("subtitle", this.dados.subtitulo);
    Utils.setText("orcamento-nro", this.dados.id)

    Utils.setHTML(
      "licenca-whatsapp",
      `<i class="icon-capa color-primaria fab fa-whatsapp"></i> ${Utils.formatarTelefone(this.dados.licenca.whatsapp)}`
    );
    Utils.setHTML(
      "licenca-fone",
      `<i class="icon-capa color-primaria fas fa-phone-alt"></i> ${Utils.formatarTelefone(this.dados.licenca.fone)}`
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


  preencherCards() {
    const cards = document.querySelectorAll(
      ".card-left, .card-middle, .card-right"
    );
    cards.forEach((card) => {
      card.style.backgroundImage = `url('${
        !this.dados.imagemCapa?.trim() ? './assets/building.png' : this.dados.imagemCapa
      }')`;
      card.style.backgroundRepeat = "no-repeat";
      card.style.backgroundSize = "794px auto";
      card.style.backgroundPositionY = "center";
    });

    Utils.setCardPosition(".card-left", "left");
    Utils.setCardPosition(".card-middle", "center");
    Utils.setCardPosition(".card-right", "right");
  },

  preencherRodape() {
    Utils.setText("rodape-telefone", Utils.formatarTelefone(this.dados.licenca.telefone));
    Utils.setText("rodape-email", this.dados.licenca.email);
    Utils.setText("rodape-site", this.dados.licenca.site);
    Utils.setText("rodape-endereco", this.dados.licenca.endereco);
  },
};

// =====================
// INICIAR APP
// =====================
document.addEventListener("DOMContentLoaded", () => {
  PropostaApp.init();
});
