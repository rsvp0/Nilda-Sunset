# Nilda Sunset

Convite digital de uma única página, feito com HTML, CSS e JavaScript, usando Tailwind via CDN.

## Arquivos

- `index.html` — estrutura e metadados
- `style.css` — visual e responsividade
- `script.js` — RSVP e mensagem do WhatsApp
- `convite.png` — arte enviada para servir de referência visual no hero
- `og-image.jpg` — imagem 1200×630 para prévia de compartilhamento
- `favicon.svg` — favicon

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
