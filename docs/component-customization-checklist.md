# Customização de Header e Bloco do Cliente (Guia + Checklist)

Este guia explica como personalizar o cabeçalho (layout.header) e o bloco de informações do cliente (cliente.info) de forma escalável, reaproveitando a infraestrutura já usada na capa dinâmica (blueprint JSON) e/ou usando overrides por componente.

## Abordagens suportadas

1) Blueprint JSON (sem código)
- Usa um schema semelhante ao da capa dinâmica: tokens com bindings `{{...}}`, unidades em mm, suporte a imagem automática (base64/URL), estilos e anchor.
- Habilitado por configuração enviada na requisição (por cliente/relatório), com checagem de licença/feature.
- Ideal quando muitos clientes querem variações semelhantes sem deploy de código por cliente.

2) Override de componente (com código)
- Implementações específicas registradas no ComponentRegistry no escopo "report" para trocar `layout.header` e/ou `cliente.info` por versões customizadas.
- Ativado por checagem de licença/feature ou por ID de cliente.
- Útil para layouts extremamente específicos ou com lógica adicional.

Recomendação: privilegiar Blueprint JSON e usar override por componente apenas quando o blueprint não cobrir a necessidade.

## Integração prevista no código

- Header: componente `layout.header` em `public/components/common/index.js`.
	- Antes de renderizar o HTML padrão, verificar `config.components.header`:
		- `type: "blueprint"` → renderizar via renderer dinâmico (reutilizar lógica do DynamicCover, idealmente extraída para `DynamicRenderer`).
		- `type: "component"` + `name` → renderizar esse componente diretamente.
		- Caso nenhum, usar o header padrão atual (fallback).

- Bloco do Cliente: componente `cliente.info` em `public/themes/default/js/components/cliente.js`.
	- Repetir a mesma verificação via `config.components.clienteInfo`.

- Alternativa: aplicar `ComponentRegistry.setReportOverrides()` no bootstrap (com base na licença/config) para trocar implementações inteiras por cliente.

## Dados e tokens disponíveis

Contexto padrão entregue aos componentes:
- `dados` (inclui `licenca`, `cliente`, `vendedor`, `projetos`, `cores`, etc.)
- `config` (flags, presets, componentes)
- `codigoPais` (de `dados.licenca.pais`)

Placeholders úteis (são case-insensitive e aceitam forma achatada):
- Header: `{{LICENCA.LOGOURL}}`, `{{ID}}` (alias `{{ORCAMENTOID}}`), `{{TITULO}}`, `{{SUBTITULO}}`, `{{CORES.CORPRIMARIA}}`, `{{CORES.CORSECUNDARIA}}`
- Cliente: `{{CLIENTE.CONTATO}}`, `{{CLIENTE.EMAIL}}`, `{{CLIENTE.TELEFONE}}`, `{{CLIENTE.ENDERECO}}`, `{{CLIENTE.CIDADE}}`, `{{CLIENTE.OBRA.NOME}}`, `{{CLIENTE.OBRA.ENDERECO}}`, `{{CLIENTE.OBRA.CIDADE}}`, `{{CLIENTE.OBRA.RESPONSAVEL}}`, `{{CLIENTE.OBRA.RESPONSAVELFONE}}`, `{{VENDEDOR.NOME}}`, `{{VENDEDOR.TELEFONE}}`

Obs.: valores que parecem imagem (base64/URL) são renderizados como `<img>` mesmo em tokens "text", e propriedades `style.*Mm` são interpretadas como mm.

## Blueprint JSON – exemplo de Header

```json
{
	"page": { "widthMm": 210, "heightMm": 40, "safe": { "top": 0, "right": 10, "bottom": 0, "left": 10 } },
	"background": { "color": "transparent" },
	"tokens": [
		{
			"id": "logo",
			"type": "image",
			"xMm": 0,
			"yMm": 5,
			"style": { "widthMm": 40, "heightMm": 30, "objectFit": "contain" },
			"binding": { "key": "{{LICENCA.LOGOURL}}" }
		},
		{
			"id": "titulo",
			"type": "text",
			"xMm": 60,
			"yMm": 12,
			"style": { "fontSizeMm": 4.5, "fontWeight": 700, "color": "{{CORES.CORPRIMARIA}}" },
			"value": "Proposta {{ID}}"
		},
		{
			"id": "subtitulo",
			"type": "text",
			"xMm": 60,
			"yMm": 22,
			"style": { "fontSizeMm": 3.2, "color": "#333" },
			"value": "{{TITULO}}"
		}
	]
}
```

## Blueprint JSON – exemplo de Cliente.Info

```json
{
	"page": { "widthMm": 210, "heightMm": 45 },
	"tokens": [
		{ "id": "cliente", "type": "text", "xMm": 0, "yMm": 2.5, "style": { "fontWeight": 700 }, "value": "Cliente: {{CLIENTE.CONTATO}}" },
		{ "id": "email", "type": "text", "xMm": 0, "yMm": 10, "value": "Email: {{CLIENTE.EMAIL}}" },
		{ "id": "fone", "type": "text", "xMm": 80, "yMm": 10, "value": "Telefone: {{CLIENTE.TELEFONE|phone}}" },
		{ "id": "obra", "type": "text", "xMm": 0, "yMm": 17.5, "value": "Obra: {{CLIENTE.OBRA.NOME}}" },
		{ "id": "obra-end", "type": "text", "xMm": 0, "yMm": 24.5, "value": "Endereço Obra: {{CLIENTE.OBRA.ENDERECO}}" },
		{ "id": "obra-cidade", "type": "text", "xMm": 140, "yMm": 24.5, "value": "Cidade: {{CLIENTE.OBRA.CIDADE}}" },
		{ "id": "vendedor", "type": "text", "xMm": 0, "yMm": 33, "style": { "fontWeight": 700, "color": "{{CORES.CORPRIMARIA}}" }, "value": "Vendedor: {{VENDEDOR.NOME}}" },
		{ "id": "vendedor-fone", "type": "text", "xMm": 120, "yMm": 33, "style": { "fontWeight": 700, "color": "{{CORES.CORPRIMARIA}}" }, "value": "Telefone: {{VENDEDOR.TELEFONE|phone}}" }
	]
}
```

## Como habilitar via config (requisição)

Sem código (recomendado):

```json
{
	"components": {
		"header": { "type": "blueprint", "blueprint": { /* blueprint header */ } },
		"clienteInfo": { "type": "blueprint", "blueprint": { /* blueprint cliente */ } }
	},
	"features": { "allowCustomComponents": true },
	"licenca": { "requiredFeature": "custom-header", "idPermitido": 12345 }
}
```

Exemplos prontos:
- `docs/examples/header-blueprint.json`
- `docs/examples/cliente-info-blueprint.json`
- `docs/examples/projeto-item-blueprint.json`
- Config agregando os três: `docs/examples/config-sample.json`

Com código (override por componente):

```json
{
	"components": {
		"header": { "type": "component", "name": "clienteX.layout.header" },
		"clienteInfo": { "type": "component", "name": "clienteX.cliente.info" }
	}
}
```

## Fallbacks e segurança

- Sem permissão/licença ou blueprint inválido → render padrão.
- Logs com prefixo do componente para diagnosticar.
- Não persistir nem executar scripts vindos do blueprint; tratar apenas dados de layout.

## Testes/QA sugeridos

- Header com e sem blueprint; cliente.info com e sem blueprint.
- Placeholders resolvendo corretamente (incluindo aliases achatados, ex.: `{{LICENCAWHATSAPP}}`).
- Imagens base64/URL rendendo como `<img>` com `objectFit` e dimensões.
- Formatação de moeda/telefone conforme país (PYG sem decimais já suportado em `Utils.formatarValor`).
- Geração de PDF sem erros; paginação inalterada.

---

## Checklist rápido (para execução)

Infraestrutura
- [ ] Extrair/refatorar `DynamicCover` → `DynamicRenderer` reutilizável.
- [ ] Definir tipagem mínima e exemplos do blueprint de componente.
- [ ] Torná-lo acessível aos componentes comuns.

Presets e Config
- [ ] Estruturar presets (repositório/pasta/CDN) e convenções de nomes.
- [ ] Backend enviar `config.components.*` e/ou `componentPresets` por licença/report.
- [ ] Validar licença/feature no runtime antes de aplicar.

Componentes alvo (fase 1)
- [ ] `layout.header` consumir blueprint/override + fallback atual.
- [ ] `cliente.info` consumir blueprint/override + fallback atual.
- [ ] Criar blueprint de exemplo para o cliente solicitante.

Exemplos adicionados (starter):
- [x] header blueprint
- [x] cliente.info blueprint
- [x] projeto.item blueprint

Integração
- [ ] Backend popular `config` por `reportType` sem quebrar manifests existentes.
- [ ] Validar orçamentos/contratos com e sem customização.

Testes e QA
- [ ] Cenários com licença autorizada e não autorizada.
- [ ] PDF end-to-end com blueprint e com fallback.
- [ ] Métrica básica de performance (tempo de render por página).

Documentação
- [ ] Atualizar `docs/STRUCTURE.md` e `docs/API.md` com pontos de extensão e tokens.
- [ ] Passo a passo para novos blueprints (onde salvar, versionar, testar).
