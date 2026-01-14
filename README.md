

esse projeto é um scraper simples que coleta automaticamente produtos do Mercado Livre a partir de uma página de listagem do vendedor (por **CustId**), extraindo:

- nome do produto
- preço
- link do anúncio
- imagens (urls mlstatic)

O resultado é salvo em um arquivo JSON: `produtos-ml.json`.

## requisitos
- Node.js 
- NPM

## instalação

1) instale as dependências:
```bash
npm install

2) instale o navegador do playwright (chromium):
 
npm run setup

3) eodar o scraper

npm run scrape

4) será gerado:

produtos-ml.json

5) configuração

dentro do arquivo:

scripts/scrape-ml.mjs

altere a variável LIST_URL para o seu vendedor:

Exemplo:

const LIST_URL = "https://lista.mercadolivre.com.br/_CustId_1158232213";

obs:
o meli pode mudar o layout/seletores. Caso o scraper retorne 0 produtos, ele vai gerar um html de debug e ajuste seletores.

esse scraper utiliza navegador real via playwright para evitar bloqueios comuns em api.

