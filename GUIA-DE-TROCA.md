# Guia de Troca de Dados e Publicação — Modelo Base Odontológico «ARCO»

Este guia mostra como personalizar o modelo **Arco** para qualquer clínica ou consultório odontológico em poucos minutos, seja para uma **abordagem comercial ao vivo** (usando parâmetros de URL e o Modo Vendedor) ou para a **entrega final ao cliente**.

---

## 1. Dados do Cliente (`assets/js/config.js`)

O arquivo `assets/js/config.js` é o **único arquivo que você precisa editar** para trocar nome da clínica, profissional titular, CRO, equipe, cidade, endereço, WhatsApp, e-mail, Instagram, horários, perfil de especialidade e variante da foto principal.

### Exemplo Antes vs. Depois

**Antes (Padrão de Demonstração):**
```js
window.SITE_CONFIG = {
  demoMode: true,
  profile: 'geral',
  heroVariant: 'dupla',
  brand: {
    name: 'Arco Odontologia',
    short: 'Arco',
    tagline: 'Odontologia com precisão e calma.',
    heroWord: ''
  },
  owner: { title: 'Dr.', name: 'Henrique Moura', profession: 'Cirurgião-Dentista', cro: 'CRO-UF 00000' },
  location: {
    city: 'Cidade Exemplo', uf: 'UF',
    address: 'Av. das Acácias, 1200 — Sala 31, Centro, Cidade Exemplo – UF',
    cep: '00000-000',
    mapsQuery: 'Av. das Acácias 1200 Centro Cidade Exemplo UF',
    mapsEmbedUrl: ''
  },
  contact: {
    whatsapp: '5511900000000',
    phoneDisplay: '(11) 90000-0000',
    email: 'contato@exemplo.com.br',
    instagram: '@arco.odonto.demo'
  }
  // ...
};
```

**Depois (Cliente Real — Ex.: Clínica de Implantes de um Dentista):**
```js
window.SITE_CONFIG = {
  demoMode: false,             // Desliga a faixa de demonstração e libera indexação no Google
  profile: 'implantes',        // Muda todos os textos para Implantes e Reabilitação
  heroVariant: 'ele',          // Exibe foto individual masculina na Hero
  brand: {
    name: 'Moura Reabilitação Oral',
    short: 'Moura',
    tagline: 'Reabilitação oral com planejamento e clareza.',
    heroWord: 'base'
  },
  owner: { title: 'Dr.', name: 'Rafael Moura', profession: 'Cirurgião-Dentista', cro: 'CRO-SP 99999' },
  location: {
    city: 'Campinas', uf: 'SP',
    address: 'Av. Norte-Sul, 500 — Conj. 82, Cambuí, Campinas – SP',
    cep: '13025-000',
    mapsQuery: 'Av. Norte-Sul 500 Cambuí Campinas SP',
    mapsEmbedUrl: ''
  },
  contact: {
    whatsapp: '5519999999999',
    phoneDisplay: '(19) 99999-9999',
    email: 'atendimento@mouraodonto.com.br',
    instagram: '@moura.reabilitacao'
  }
  // ...
};
```

### Atalho para Vendas: Modo Vendedor (`?vendedor=1`)
Durante a prospecção, abra o site com `?vendedor=1` no final do endereço (ex.: `https://seudominio.com/?vendedor=1`):
1. Clique no botão **Modo vendedor** no canto inferior esquerdo.
2. Digite o nome da clínica do prospecto, cidade, WhatsApp, escolha o perfil (`geral`, `estetica`, `implantes`, `ortodontia`, `endodontia`) e a variante da Hero (`dupla`, `ele`, `ela`).
3. Clique em **Copiar link personalizado** para enviar ao cliente ou **Copiar config.js** para colar diretamente no arquivo `assets/js/config.js`.

---

## 2. Troca de Perfil de Especialidade (`assets/js/profiles.js`)

O modelo já traz **5 perfis completos** prontos em `assets/js/profiles.js`:
- `geral` — Clínica odontológica geral e prevenção (padrão)
- `estetica` — Estética do sorriso (facetas em resina, lentes cerâmicas, clareamento)
- `implantes` — Implantes dentários, prótese sobre implante e reabilitação oral
- `ortodontia` — Aparelhos fixos, estéticos e alinhadores transparentes
- `endodontia` — Tratamento de canal, retratamento e cirurgias orais menores

Para ativar qualquer um deles:
- Altere `profile: 'estetica'` em `assets/js/config.js`; **ou**
- Use o parâmetro de URL `?perfil=estetica` para demonstrar sem tocar no código.
- Se desejar ajustar alguma frase específica de um serviço ou pergunta frequente, edite o objeto correspondente em `assets/js/profiles.js`.

---

## 3. Tabela Completa de Imagens a Trocar

Todas as imagens ficam na pasta `assets/` e seguem o padrão `nome-v1-{largura}w.{ext}` (`480w`, `720w`, `960w`, `1280w`, `1600w` em `.avif`, `.webp` e `.jpg`, além do arquivo base `nome-v1.jpg`).

| ID Prompt | Nome Base em `assets/` | Dimensão Mestre | Proporção | Moldura | Onde Aparece |
|---|---|---|---|---|---|
| **H-01** | `hero-cena-dupla-v1` | `2000×2500` | `4:5` | **M1** Arco-janela | Hero (variante `dupla`) |
| **H-02** | `hero-cena-ele-v1` | `2000×2500` | `4:5` | **M1** Arco-janela | Hero (variante `ele`) |
| **H-03** | `hero-cena-ela-v1` | `2000×2500` | `4:5` | **M1** Arco-janela | Hero (variante `ela`) |
| **H-04** | `hero-recorte-dupla\|ele\|ela-v1.webp` | `960×1200` (alfa) | `4:5` | Pop-out sobre **M1** | Camada L6 da Hero (se omitido, degrada sem quebrar) |
| **H-05** | `hero-sombra-dupla\|ele\|ela-v1.webp` | `600×200` (alfa) | `3:1` | Sombra sob L6 | Base da janela da Hero |
| **H-06** | `hero-bg-desktop` / `hero-bg-mobile` | `1920×1080` / `1080×1920` | `16:9` / `9:16` | Fundo L0 | Camada de fundo da Hero |
| **H-07** | `hero-glow.webp` / `.png` | `600×600` (alfa) | `1:1` | Halo elíptico | Camada L5 da Hero |
| **H-08** | `hero-arcs.svg` | Vetorial (`1440×900`) | Vetorial | Traços e régua | Camada L2 da Hero |
| **C-01** | `clinica-vertical-v1` | `2000×2500` | `4:5` | **M1** Arco-janela | Seção «A clínica» (peça principal do mosaico) |
| **C-02** | `clinica-recepcao-v1` | `1800×1200` | `3:2` | **M2** Chanfro | Seção «A clínica» (canto inferior esquerdo do mosaico) |
| **C-03** | `clinica-detalhe-v1` | `1200×1600` | `3:4` | **M4** Cápsula | Seção «A clínica» (canto superior direito do mosaico) |
| **T-01** | `trat-exame-v1` | `1200×1500` | `4:5` | **M3** Passe-partout | Seção «Tratamentos» (Exame / Avaliação / Lentes) |
| **T-02** | `trat-prevencao-v1` | `1200×1500` | `4:5` | **M3** Passe-partout | Seção «Tratamentos» (Prevenção / Clareamento) |
| **T-03** | `trat-estetica-v1` | `1200×1500` | `4:5` | **M3** Passe-partout | Seção «Tratamentos» (Estética / Restaurações / Prótese) |
| **T-04** | `trat-implante-v1` | `1200×1500` | `4:5` | **M3** Passe-partout | Seção «Tratamentos» (Implantes / Cirurgia oral) |
| **T-05** | `trat-orto-v1` | `1200×1500` | `4:5` | **M3** Passe-partout | Seção «Tratamentos» (Ortodontia / Alinhadores) |
| **T-06** | `trat-radiografia-v1` | `1200×1500` | `4:5` | **M3** Passe-partout | Seção «Tratamentos» (Endodontia / Planejamento digital) |
| **E-01** | `equipe-01-v1` | `1200×1600` | `3:4` | **M4** Cápsula | Seção «Equipe» (Profissional 1) |
| **E-02** | `equipe-02-v1` | `1200×1600` | `3:4` | **M4** Cápsula | Seção «Equipe» (Profissional 2) |
| **E-03** | `equipe-03-v1` | `1200×1600` | `3:4` | **M4** Cápsula | Seção «Equipe» (Profissional 3) |
| **P-01** | `paciente-01-v1` | `2000×2000` | `1:1` | **M5** Órbita | Seção «Agendamento» |
| **B-01** | `ba-a-before-v1` / `ba-a-after-v1` | `1600×1200` | `4:3` | **M6** Lâmina | Seção «Em destaque» (Slider comparador) |
| **B-02** | `ba-b-before-v1` / `ba-b-after-v1` | `1600×2000` | `4:5` | **M2** Chanfro | Seção «Resultados» (Cortina por scroll) |
| **B-02Z** | `ba-b-after-zoom-v1` | `2400×3000` | `4:5` | Lupa 180px | Seção «Resultados» (Lupa 2,4× e modal mobile) |
| **FX-1** | `fx-caustics.webp` / `.jpg` | `1024×1024` | `1:1` | Tile contínuo | Fundos de Tratamentos, Jornada e Agendamento |
| **FX-2** | `fx-grain.webp` / `.png` | `256×256` | `1:1` | Tile contínuo | Textura de grão fino em seções escuras e claras |
| **OG-1** | `og-image.jpg` | `1200×630` | `1.91:1` | Open Graph | Compartilhamento no WhatsApp / redes sociais |

---

## 4. Como Mudar a Identidade de Cores (`:root`)

Toda a paleta de cores está concentrada exclusivamente no bloco `:root` de `assets/css/styles.css` (e espelhada no `<style id="critical-css">` de `index.html`):
- Para criar um novo tema (por exemplo, Azul-Cobalto ou Verde-Oliva), altere apenas os tokens `--ink`, `--abyss`, `--pine`, `--deepsea`, `--jade`, `--ivory`, `--mist`, `--linen`, `--brass-1`, `--brass-2`, `--mint` e `--ember`.
- **O que conferir no contraste (WCAG AA):**
  - `--text-on-dark` sobre `--ink`, `--abyss`, `--pine` e `--deepsea` deve manter razão ≥ **4,5:1** (atualmente entre **11,8:1 e 16,9:1**).
  - `--text-on-light` e `--text-muted-light` sobre `--ivory`, `--mist` e `--linen` devem manter razão ≥ **4,5:1** (atualmente entre **5,99:1 e 14,4:1**).
  - `--brass-2` sobre `--ivory` deve manter razão ≥ **3,0:1** (usado apenas em traços e palavras em destaque de títulos grandes).

---

## 5. Metadados, Domínio e Desativação do `noindex`

Antes de colocar o site de um cliente real no ar:
1. Em `assets/js/config.js`, mude `demoMode: false`. Isso oculta automaticamente a faixa «Modelo de demonstração» no rodapé e muda a meta tag `robots` para `index, follow`.
2. Em `index.html`, substitua o conteúdo padrão de `<meta name="robots" content="noindex, nofollow">` por `<meta name="robots" content="index, follow">` e atualize a URL absoluta de `og:image` com o domínio oficial do cliente (ex.: `https://clinicaexemplo.com.br/assets/og-image.jpg`).

---

## 6. Checklist Ético e Legal Obrigatório Antes de Publicar para um Cliente Real

1. **Substituir fotos fictícias por fotos reais:** substitua os retratos da Hero (`H-01..H-04`), da Equipe (`E-01..E-03`) e, principalmente, as imagens de **Antes e Depois** (`B-01` e `B-02`) por fotografias clínicas reais do próprio cirurgião-dentista, com **Termo de Consentimento Livre e Esclarecido (TCLE) e autorização de uso de imagem por escrito** assinado por cada paciente. **As imagens geradas neste modelo demonstrativo jamais devem ir ao ar como se fossem casos clínicos reais.**
2. **Revisão ética junto ao CFO / CRO:** valide todos os textos marcados com `CONFIRMAR COM O PROFISSIONAL` no HTML, `config.js` e `profiles.js` para garantir conformidade com a Resolução CFO-196/2019 e as normas vigentes do Conselho Federal de Odontologia e do CRO do estado do cliente.
3. **Identificação obrigatória do profissional:** preencha obrigatoriamente o nome do responsável técnico, inscrição no CRO (`owner.cro` e `legal.responsibleCro`) e CNPJ (`legal.cnpj`, se pessoa jurídica) em `assets/js/config.js`.
4. **Política de Privacidade (LGPD):** revise o texto do modal `#privacidade` com os dados cadastrais reais da clínica.
5. **Remover atributos de demonstração:** remova os atributos `data-demo-image="true"` dos blocos comparadores após inserir as fotos clínicas reais autorizadas.

---

## 7. Como Publicar e Testar

1. Suba a pasta raiz contendo `index.html`, `_headers` e a pasta `assets/` para qualquer serviço de hospedagem estática (Cloudflare Pages, Vercel, Netlify, Hostinger ou servidor Apache/Nginx).
2. O arquivo `_headers` já configura cache longo (`max-age=31536000, immutable`) para imagens e fontes, e revalidação imediata (`max-age=0, must-revalidate`) para `index.html`, `config.js` e `profiles.js`.
3. Rode uma verificação rápida abrindo `?debug=1` no navegador para confirmar `Overflow-X (0): Nenhum (0)` em mobile (`360px`, `390px`) e desktop (`1440px`).
