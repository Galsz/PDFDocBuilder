(function layoutComponentsModule(global) {
  const { ComponentRegistry: registry } = global;

  if (!registry) {
    console.error("ComponentRegistry não disponível para registrar overrides de layout.");
  }

  // O tema default utiliza os componentes comuns de layout.
  // Este arquivo permanece como ponto de extensão para futuros overrides específicos do tema.
})(window);
