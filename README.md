# Mercado Livre Scraper (Playwright)

Scraper simples que coleta automaticamente produtos do Mercado Livre a partir de uma página de listagem do vendedor (por **CustId**), extraindo:

- Nome do produto
- Preço
- Link do anúncio
- Imagens (URLs mlstatic)

O resultado é salvo em um arquivo JSON: `produtos-ml.json`.

---

## Requisitos
- Node.js
- NPM

---

## Instalação

### 1) Instale as dependências
```bash
npm install
```

### 2) Instale o navegador do Playwright (Chromium)
```bash
npm run setup
```

### 3) Rodar o scraper
```bash
npm run scrape
```

Será gerado:
- `produtos-ml.json`

---

## Configuração
Edite o arquivo:

`./scripts/scrape-ml.mjs`

E altere a variável `LIST_URL` para o seu vendedor:

Exemplo:
```js
const LIST_URL = "https://lista.mercadolivre.com.br/_CustId_1158232213";
```

---

## Observações
- O Mercado Livre pode mudar layout/seletores.
- Caso o scraper retorne 0 produtos, ele pode gerar `debug-ml.html` para ajudar no ajuste.
