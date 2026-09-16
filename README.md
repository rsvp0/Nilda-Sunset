# Nilda Sunset

Convite digital de uma única página, feito com HTML, CSS e JavaScript, usando Tailwind via CDN.

## Arquivos

- `index.html` — estrutura e metadados
- `style.css` — visual e responsividade
- `script.js` — RSVP e mensagem do WhatsApp
- `convites.json` — lista de convites individuais
- `asd/` — dashboard local e servidor Python de gerenciamento
- `convite.png` — arte enviada para servir de referência visual no hero
- `og-image.jpg` — imagem 1200×630 para prévia de compartilhamento
- `favicon.svg` — favicon

## Convites individuais

O arquivo `convites.json`, na raiz do projeto, é a fonte dos convites. Cada pessoa deve receber um link no formato:

`https://SEU-USUARIO.github.io/Nilda-Sunset/?hash=codigo_unico`

Inicie o dashboard local com `python3 asd/server.py` e abra `http://127.0.0.1:8765/asd/`. Todas as alterações feitas nele são gravadas imediatamente no `convites.json` da raiz. O mesmo servidor também disponibiliza o site principal em `http://127.0.0.1:8765/`.

Para marcar um convite como já utilizado, use o campo de confirmação do dashboard ou altere manualmente o respectivo campo para `"confirmed": true` no `convites.json` e publique a alteração. Convites com esse estado não mostram o formulário.

Os códigos precisam ser únicos. O dashboard valida duplicidades e gera códigos aleatórios longos pelo botão **Gerar**.

## Alterar os dados da festa

Abra `script.js` e edite o objeto `EVENT`.

O WhatsApp está configurado para:

`5582998386476`

A mensagem produzida pelo formulário fica assim:

`Eu, Fulano, confirmo minha presença no Nilda Sunset e levarei como acompanhantes Ciclano e Beltrano.`

## Publicação

Pode colocar estes arquivos em GitHub Pages, Cloudflare Pages ou qualquer hospedagem de arquivos estáticos.

Antes de publicar, no `index.html`, substitua:

`https://SEU-USUARIO.github.io/nilda-sunset/`

pela URL real do site nas tags `og:url`, `og:image` e `twitter:image`.

## Observação sobre o mapa

O site usa um iframe do Google Maps para mostrar uma prévia do local e mantém um botão para abrir o endereço diretamente no Google Maps.
