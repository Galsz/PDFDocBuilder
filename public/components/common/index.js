(function commonComponentsModule(global) {
  const { ComponentRegistry: registry, I18N } = global;

  if (!registry) {
    console.error("Common components depend on ComponentRegistry being loaded first.");
    return;
  }

  registry.registerCommon("layout.header", {
    contract: {
      description: "Cabeçalho padrão do relatório com logo e informações da proposta.",
      props: {
        dados: "object|required",
        config: "object|optional",
        pagina: "number|optional",
      },
    },
    render({ dados, config = {}, pagina = 1 } = {}) {
      if (!dados) return "";
      const mostrarLogo = config.imprimirLogoEmTodas || pagina === 1;
      const mostrarTitulo = pagina === 1;

      return `
        <header id="head">
          <div id="details">
            <div class="wvicon">
              <img style="z-index: 10;" src="../../assets/images/logowhite_evo.svg" alt="Logo" />
            </div>
            <div class="detailheader" style="background-color: ${dados.cores.corSecundaria};"></div>
            <div class="detailheaderblue" style="background-color: ${dados.cores.corPrimaria};"></div>
          </div>
          ${
            mostrarLogo
              ? `<div style="display: flex; justify-content: space-between;">
                  <div style="padding-top: 54px; padding-left: 50px; font-size: 14px;">
                    ${
                      mostrarTitulo
                        ? `<h2>${I18N.t(dados.licenca?.pais, "proposal")} ${dados.id}</h2>`
                        : ""
                    }
                  </div>
                  <div style="padding-top: 34px; padding-right: 50px;">
                    <img src="${dados.licenca.logoUrl}" style="height: 100px;" alt="Logo Licença" />
                  </div>
                </div>`
              : ""
          }
        </header>
      `;
    },
  });

  registry.registerCommon("layout.footer", {
    contract: {
      description: "Rodapé padrão do relatório com dados da licença e paginação.",
      props: {
        licenca: "object|optional",
        pagina: "number|optional",
        totalPaginas: "number|optional",
        codigoPais: "number|optional",
      },
    },
    render({ licenca = {}, pagina = 1, totalPaginas = 1, codigoPais = null } = {}) {
      return `
        <footer class="footer">
          <div class="footer-image">
            <svg xmlns="http://www.w3.org/2000/svg" width="794" height="78" viewBox="0 0 1637 158" fill="none" style="shape-rendering:geometricPrecision">
              <line x1="100.999" y1="13.2461" x2="1229" y2="13.2461" stroke="#BB961E" stroke-width="3" data-cor="secundaria" vector-effect="non-scaling-stroke" />
              <path d="M1221.68 12.4055C1224.76 4.90059 1232.07 0 1240.18 0H1646C1657.05 0 1666 8.95431 1666 20V111C1666 122.046 1657.05 131 1646 131H1202.83C1188.6 131 1178.92 116.566 1184.33 103.406L1221.68 12.4055Z" data-cor="primaria" fill="#004080" />
              <path d="M1221.68 12.4055C1224.76 4.90059 1232.07 0 1240.18 0H1646C1657.05 0 1666 8.95431 1666 20V111C1666 122.046 1657.05 131 1646 131H1202.83C1188.6 131 1178.92 116.566 1184.33 103.406L1221.68 12.4055Z" data-cor="primaria" fill="#004080" />
              <line x1="103.324" y1="12.9216" x2="57.3239" y2="128.922" stroke="#BB961E" stroke-width="3" data-cor="secundaria" vector-effect="non-scaling-stroke" />
              <path d="M101.215 551.462C96.5717 547.584 93.9327 541.814 94.037 535.765L100.651 151.997C100.841 140.953 109.949 132.154 120.993 132.345L143.766 132.737C154.81 132.927 163.609 142.035 163.418 153.079L156.488 555.206C156.198 572.009 136.571 580.984 123.672 570.213L101.215 551.462Z" data-cor="secundaria" fill="#BB961E" />
              <path d="M12.9924 544.703C5.64594 541.446 0.962086 534.109 1.10056 526.074L7.65114 145.997C7.84148 134.953 16.9488 126.154 27.9928 126.345L107.67 127.718C118.715 127.908 127.513 137.016 127.323 148.06L120.192 561.827C119.945 576.142 105.178 585.568 92.0894 579.767L12.9924 544.703Z" data-cor="primaria" fill="#004080" />
            </svg>
          </div>
          <div class="footer-page-number" >
            <span>${I18N.t(codigoPais, "page")} ${pagina} ${I18N.t(codigoPais, "of")} ${totalPaginas}</span>
          </div>
          <div class="footer-info">
            <div class="footer-info-left">
              <strong>${licenca.nome ?? ""}</strong><br />
              ${licenca.fone ?? ""}<br />
              ${licenca.email ?? ""}
            </div>
            <div class="footer-info-right">
              <div>${licenca.site ?? ""}</div>
            </div>
          </div>
          <div class="footer-site">
            <span>© Wvetro - Sistema para Vidraçarias e Serralherias</span>
          </div>
        </footer>
      `;
    },
  });

  registry.registerCommon("assinar.bloco", {
    contract: {
      description: "Bloco padrão de assinaturas para contratante e contratado.",
      props: {},
    },
    render() {
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
  });
})(window);
