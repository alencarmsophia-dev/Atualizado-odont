// ÚNICO arquivo de dados do cliente. Edite aqui e recarregue a página.
window.SITE_CONFIG = {
  demoMode: true,              // true = mostra «Modelo de demonstração» e mantém noindex
  profile: 'geral',            // geral | estetica | implantes | ortodontia | endodontia
  heroVariant: 'dupla',        // dupla | ele | ela  (qual foto de pessoa aparece na hero)
  brand: {
    name: 'Arco Odontologia',
    short: 'Arco',
    tagline: 'Odontologia com precisão e calma.',
    heroWord: ''               // vazio = usa a palavra do perfil
  },
  owner: { title: 'Dr.', name: 'Henrique Moura', profession: 'Cirurgião-Dentista', cro: 'CRO-UF 00000' },
  team: [                      // 0 a 3 pessoas (0 = seção «Equipe» some)
    { title: 'Dr.',  name: 'Henrique Moura', role: 'Clínica geral e implantodontia', cro: 'CRO-UF 00000', photo: 'equipe-01', bio: 'Atuação dedicada ao diagnóstico cuidadoso, reabilitação oral com implantes e planejamento clínico passo a passo. // CONFIRMAR COM O PROFISSIONAL' },
    { title: 'Dra.', name: 'Lívia Andrade',  role: 'Estética do sorriso e ortodontia', cro: 'CRO-UF 00000', photo: 'equipe-02', bio: 'Foco em estética dental natural, alinhadores transparentes e restaurações que respeitam a anatomia de cada rosto. // CONFIRMAR COM O PROFISSIONAL' },
    { title: 'Dr.',  name: 'Caio Ferraz',    role: 'Endodontia e cirurgia oral menor', cro: 'CRO-UF 00000', photo: 'equipe-03', bio: 'Cuidado voltado à preservação do dente natural em tratamentos de canal e cirurgias orais menores planejadas. // CONFIRMAR COM O PROFISSIONAL' }
  ],
  location: {
    city: 'Cidade Exemplo', uf: 'UF',
    address: 'Av. das Acácias, 1200 — Sala 31, Centro, Cidade Exemplo – UF',
    cep: '00000-000',
    mapsQuery: 'Av. das Acácias 1200 Centro Cidade Exemplo UF',   // vira o link «Como chegar» e o mapa
    mapsEmbedUrl: ''           // opcional: URL de incorporação do Google Maps
  },
  contact: {
    whatsapp: '5511900000000', // só dígitos com DDI+DDD; vazio = usa Instagram
    phoneDisplay: '(11) 90000-0000',
    email: 'contato@exemplo.com.br',
    instagram: '@arco.odonto.demo'
  },
  hours: {                     // vazio = esconde horário e selo «Aberto agora»
    timezone: 'America/Sao_Paulo',
    week: { mon:['08:00','18:00'], tue:['08:00','18:00'], wed:['08:00','18:00'], thu:['08:00','18:00'], fri:['08:00','18:00'], sat:['08:00','12:00'], sun:null },
    note: 'Atendimento mediante agendamento prévio.'
  },
  legal: { cnpj: '00.000.000/0001-00', responsibleName: 'Dr. Henrique Moura', responsibleCro: 'CRO-UF 00000' },
  features: { shader: true, cursor: true, loupe: true, marquee: true, sellerMode: true, debug: true },
  analytics: { gtmId: '', metaPixelId: '' }
};