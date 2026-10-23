// Perfis de especialidade do Modelo Base Odontológico «ARCO»
// A troca entre perfis altera apenas dados e textos, nunca a estrutura ou o layout.
// Todos os textos seguem linguagem neutra de gênero e prudência ética do CFO (CONFIRMAR COM O PROFISSIONAL).

window.SITE_PROFILES = {
  geral: {
    label: 'Clínica geral',
    seo: {
      title: '{brand} | Dentista em {city}',
      description: 'Clínica odontológica em {city}: avaliação, prevenção, tratamentos e estética do sorriso. Agende pelo WhatsApp.'
    },
    hero: {
      word: 'arco',
      title: 'Saúde bucal com *precisão* e calma.',
      sub: 'Check-up, prevenção e tratamentos para toda a família, explicados passo a passo por uma equipe que escuta antes de agir.',
      chips: ['Check-up e prevenção', 'Tratamentos restauradores', 'Estética do sorriso'],
      b3: { label: 'Conhecer a estética do sorriso', target: '#destaque' }
    },
    marquee: [
      'Check-up e *prevenção*',
      'Limpeza e *profilaxia*',
      'Restaurações *estéticas*',
      'Tratamento de *canal*',
      'Cirurgias orais *simples*',
      'Estética do *sorriso*',
      'Avaliação de *urgência*'
    ],
    services: [
      {
        tag: 'Primeira consulta',
        title: 'Avaliação e check-up',
        icon: 'espelho',
        image: 'T-01',
        text: 'Conversa, exame clínico e, quando indicado, exames de imagem. Você sai com um plano claro dos próximos passos.'
      },
      {
        tag: 'Prevenção',
        title: 'Limpeza e prevenção',
        icon: 'escova',
        image: 'T-02',
        text: 'Remoção de placa e tártaro, orientação de higiene e acompanhamento para manter a saúde da boca em dia.'
      },
      {
        tag: 'Restauração',
        title: 'Restaurações e dentística',
        icon: 'dente',
        image: 'T-03',
        text: 'Recuperação de dentes com cárie ou desgaste, com materiais escolhidos para função e aparência.'
      },
      {
        tag: 'Endodontia',
        title: 'Tratamento de canal',
        icon: 'raiz',
        image: 'T-06',
        text: 'Cuidado do interior do dente quando há inflamação ou infecção, com foco em preservar o dente natural.'
      },
      {
        tag: 'Cirurgia',
        title: 'Cirurgias orais simples',
        icon: 'implante',
        image: 'T-04',
        text: 'Procedimentos de pequeno porte, como a remoção de sisos quando indicada, com planejamento prévio.'
      },
      {
        tag: 'Estética',
        title: 'Estética do sorriso',
        icon: 'dente',
        image: 'T-03',
        text: 'Clareamento, facetas e ajustes de forma e cor, sempre após avaliação individual.'
      }
    ],
    featured: {
      eyebrow: 'Em destaque',
      title: 'Estética que respeita o seu *sorriso*.',
      text: 'Clareamento, facetas e ajustes de forma e cor planejados em conjunto com você. A indicação depende de avaliação individual.',
      cta: 'Quero saber mais',
      triage: 'Estética do sorriso',
      caseLabel: 'Caso ilustrativo de estética do sorriso'
    },
    triage: [
      {
        label: 'Avaliação e check-up',
        guide: 'Ótimo ponto de partida: conversamos sobre sua rotina e queixas, fazemos o exame clínico e explicamos o que encontramos.'
      },
      {
        label: 'Limpeza e prevenção',
        guide: 'Indicada para manter a saúde da boca em dia. A frequência ideal varia de pessoa para pessoa e é definida na avaliação.'
      },
      {
        label: 'Estética do sorriso',
        guide: 'Clareamento, facetas e ajustes de forma e cor. Antes de indicar qualquer opção, fazemos uma avaliação individual.'
      },
      {
        label: 'Dor ou urgência',
        guide: 'Conte o que está sentindo e indicamos o melhor horário. Em caso de dor intensa, febre ou inchaço no rosto, procure um serviço de urgência.'
      },
      {
        label: 'Ainda não sei',
        guide: 'Sem problema. Conversamos e indicamos o melhor primeiro passo.'
      }
    ],
    journey: [
      {
        title: 'Primeiro contato',
        icon: 'espelho',
        text: 'Você escolhe o canal, conta o que procura e combinamos o melhor horário.'
      },
      {
        title: 'Avaliação e exames',
        icon: 'raiz',
        text: 'Conversa, exame clínico e, quando necessário, exames de imagem.'
      },
      {
        title: 'Plano explicado',
        icon: 'dente',
        text: 'Apresentamos as opções, as etapas e os cuidados de cada caminho, para você decidir com calma.'
      },
      {
        title: 'Tratamento e acompanhamento',
        icon: 'escova',
        text: 'Realizamos o que foi combinado e acompanhamos a evolução depois.'
      }
    ],
    faq: [
      {
        q: 'Como funciona a primeira consulta?',
        a: 'Conversamos sobre seu histórico e suas queixas, fazemos o exame clínico e explicamos os próximos passos. Exames de imagem entram quando forem necessários.'
      },
      {
        q: 'Preciso estar com dor para marcar?',
        a: 'Não. Consultas de rotina e de prevenção ajudam a identificar problemas cedo e a manter a saúde da boca em dia.'
      },
      {
        q: 'Quanto tempo dura um tratamento?',
        a: 'Depende de cada caso. Depois da avaliação, explicamos as etapas e uma estimativa de prazo.'
      },
      {
        q: 'Como agendo?',
        a: 'Pelo WhatsApp ou pelo formulário desta página. Respondemos para confirmar o melhor horário.'
      },
      {
        q: 'Os resultados de estética são iguais para todos?',
        a: 'Não. Os resultados variam de pessoa para pessoa e a indicação depende de avaliação individual.'
      },
      {
        q: 'Meus dados ficam seguros?',
        a: 'Usamos seus dados apenas para contato e agendamento, conforme a LGPD. Veja a política de privacidade.'
      }
    ]
  },

  estetica: {
    label: 'Estética do sorriso',
    seo: {
      title: '{brand} | Estética do Sorriso em {city}',
      description: 'Facetas, clareamento e estética dental em {city}, planejados após avaliação individual. Agende sua conversa pelo WhatsApp.'
    },
    hero: {
      word: 'sorriso',
      title: 'Seu sorriso, *desenhado* com naturalidade.',
      sub: 'Facetas, clareamento e ajustes de forma e cor, planejados com você e sempre após avaliação individual.',
      chips: ['Facetas em resina e porcelana', 'Clareamento supervisionado', 'Planejamento do sorriso'],
      b3: { label: 'Conhecer facetas e lentes', target: '#destaque' }
    },
    marquee: [
      'Facetas em *resina*',
      'Lentes e facetas de *porcelana*',
      'Clareamento *dental*',
      'Contorno *gengival*',
      'Planejamento do *sorriso*',
      'Manutenção e *acompanhamento*'
    ],
    services: [
      {
        tag: 'Escultura direta',
        title: 'Facetas em resina',
        icon: 'dente',
        image: 'T-03',
        text: 'Camadas finas esculpidas diretamente sobre o esmalte para ajustar forma, pequenos espaços e proporção após avaliação clínica.'
      },
      {
        tag: 'Cerâmica',
        title: 'Lentes e facetas de porcelana',
        icon: 'espelho',
        image: 'T-01',
        text: 'Laminados cerâmicos confeccionados sob medida após planejamento detalhado da oclusão e da estrutura dental.'
      },
      {
        tag: 'Luminosidade',
        title: 'Clareamento dental',
        icon: 'escova',
        image: 'T-02',
        text: 'Protocolos em consultório, caseiros supervisionados ou combinados, definidos conforme a sensibilidade e a condição de cada paciente.'
      },
      {
        tag: 'Proporção',
        title: 'Contorno gengival',
        icon: 'raiz',
        image: 'T-04',
        text: 'Cuidado periodontal e ajuste delicado da margem gengival quando há indicação clínica para harmonizar a moldura dos dentes.'
      },
      {
        tag: 'Previsibilidade',
        title: 'Planejamento do sorriso',
        icon: 'aparelho',
        image: 'T-06',
        text: 'Análise fotográfica e estudo das proporções faciais para conversar sobre possibilidades antes de iniciar o tratamento.'
      },
      {
        tag: 'Longevidade',
        title: 'Manutenção e acompanhamento',
        icon: 'escova',
        image: 'T-05',
        text: 'Sessões periódicas de profilaxia, polimento e revisão para conservar a saúde gengival e o acabamento das restaurações.'
      }
    ],
    featured: {
      eyebrow: 'Em destaque',
      title: 'Facetas e lentes, *planejadas* com você.',
      text: 'Cada sorriso tem textura, translucidez e proporção próprias. Analisamos a saúde bucal e a mordida antes de indicar resina ou cerâmica. A indicação depende de avaliação individual.',
      cta: 'Quero avaliar meu sorriso',
      triage: 'Facetas e lentes',
      caseLabel: 'Caso ilustrativo de reanatomização estética'
    },
    triage: [
      {
        label: 'Facetas e lentes',
        guide: 'Avaliamos o esmalte, a gengiva e a mordida para explicar as diferenças e indicações entre resina composta e porcelana.'
      },
      {
        label: 'Clareamento',
        guide: 'Examinamos a origem do escurecimento dental e eventuais áreas de sensibilidade antes de definir o protocolo adequado.'
      },
      {
        label: 'Contorno do sorriso',
        guide: 'Ideal para conversar sobre pequenos espaços, bordas desgastadas ou desníveis gengivais com foco em naturalidade.'
      },
      {
        label: 'Avaliação inicial',
        guide: 'Um check-up completo da saúde bucal e estética para ouvir suas expectativas e traçar um plano seguro.'
      },
      {
        label: 'Ainda não sei',
        guide: 'Sem problema. Conversamos na consulta e apresentamos as opções mais indicadas para o seu caso.'
      }
    ],
    journey: [
      {
        title: 'Primeiro contato',
        icon: 'espelho',
        text: 'Você conta o que gostaria de melhorar no sorriso e agendamos um horário tranquilo para conversar.'
      },
      {
        title: 'Avaliação e exames',
        icon: 'raiz',
        text: 'Exame clínico da gengiva, dentes e mordida, acompanhado de registros fotográficos e radiográficos quando necessários.'
      },
      {
        title: 'Plano explicado',
        icon: 'dente',
        text: 'Mostramos as alternativas entre clareamento, resina ou cerâmica, com etapas e cuidados explicados sem pressa.'
      },
      {
        title: 'Tratamento e acompanhamento',
        icon: 'escova',
        text: 'Executamos o procedimento combinado com atenção aos detalhes e programamos retornos de manutenção.'
      }
    ],
    faq: [
      {
        q: 'Qual a diferença entre facetas em resina e de porcelana?',
        a: 'As facetas em resina são esculpidas diretamente nos dentes em consultório, enquanto as de porcelana são confeccionadas em laboratório. A escolha depende da avaliação clínica, da mordida e dos objetivos de cada paciente.'
      },
      {
        q: 'Qualquer pessoa pode fazer facetas ou clareamento?',
        a: 'Não. A indicação depende de avaliação individual presencial para verificar a saúde gengival, ausência de cáries, condição do esmalte e hábitos funcionais.'
      },
      {
        q: 'Os resultados estéticos são iguais para todos?',
        a: 'Não. Cada pessoa possui anatomia, cor natural e resposta biológica próprias. Os resultados variam de pessoa para pessoa e são planejados individualmente.'
      },
      {
        q: 'Como faço para agendar uma avaliação?',
        a: 'Você pode clicar nos botões de WhatsApp ou preencher a mini-triagem abaixo para enviar sua mensagem e combinar o melhor horário.'
      },
      {
        q: 'Onde o consultório está localizado?',
        a: 'Os dados completos de endereço, horário de funcionamento e mapa interativo estão disponíveis na seção de Contato logo abaixo.'
      },
      {
        q: 'Como meus dados de contato são tratados?',
        a: 'Seus dados são utilizados exclusivamente para retorno de atendimento e agendamento, em conformidade com a LGPD e o sigilo profissional.'
      }
    ]
  },

  implantes: {
    label: 'Implantes e reabilitação',
    seo: {
      title: '{brand} | Implantes e Reabilitação Oral em {city}',
      description: 'Implantes dentários, próteses e reabilitação oral em {city} com planejamento por imagem. Agende sua avaliação.'
    },
    hero: {
      word: 'base',
      title: 'Recupere o conforto de *mastigar* e sorrir.',
      sub: 'Implantes e reabilitação oral planejados com exames de imagem e acompanhamento próximo.',
      chips: ['Implantes dentários', 'Prótese sobre implante', 'Planejamento digital'],
      b3: { label: 'Conhecer o planejamento digital', target: '#destaque' }
    },
    marquee: [
      'Implantes *dentários*',
      'Prótese sobre *implante*',
      'Enxerto ósseo e *preparo*',
      'Planejamento *digital*',
      'Reabilitação de *arcada*',
      'Manutenção e *cuidados*'
    ],
    services: [
      {
        tag: 'Suporte fixo',
        title: 'Implantes dentários',
        icon: 'implante',
        image: 'T-04',
        text: 'Reposição da raiz de um ou mais dentes ausentes por meio de pinos de titânio ou zircônia, planejados conforme a disponibilidade óssea.'
      },
      {
        tag: 'Função e forma',
        title: 'Prótese sobre implante',
        icon: 'dente',
        image: 'T-03',
        text: 'Coroas unitárias ou próteses fixas desenhadas para devolver a mastigação equilibrada e a harmonia com os dentes vizinhos.'
      },
      {
        tag: 'Estrutura',
        title: 'Enxerto ósseo e preparo',
        icon: 'raiz',
        image: 'T-06',
        text: 'Procedimentos reconstrutivos indicados quando é necessário recuperar volume ósseo ou gengival antes da instalação do implante.'
      },
      {
        tag: 'Precisão',
        title: 'Planejamento digital e cirurgia guiada',
        icon: 'espelho',
        image: 'T-01',
        text: 'Estudo tridimensional por tomografia e escaneamento para posicionar o implante com segurança anatômica quando indicado.'
      },
      {
        tag: 'Reabilitação',
        title: 'Reabilitação de arcada completa',
        icon: 'aparelho',
        image: 'T-05',
        text: 'Planejamento integrado para pacientes que perderam múltiplos dentes e buscam recuperar estabilidade mastigatória.'
      },
      {
        tag: 'Prevenção',
        title: 'Manutenção e cuidados',
        icon: 'escova',
        image: 'T-02',
        text: 'Consultas periódicas de controle clínico, radiográfico e higienização profissional ao redor dos implantes e próteses.'
      }
    ],
    featured: {
      eyebrow: 'Em destaque',
      title: 'Implantes com planejamento *digital*.',
      text: 'Exames de imagem e análise da mordida ajudam a planejar cada etapa antes do procedimento. A indicação técnica e os prazos dependem de avaliação individual.',
      cta: 'Agendar avaliação de implantes',
      triage: 'Implante unitário',
      caseLabel: 'Caso ilustrativo de reabilitação oral'
    },
    triage: [
      {
        label: 'Implante unitário',
        guide: 'Avaliamos a região da ausência dental e os exames de imagem para planejar a reposição de forma individualizada.'
      },
      {
        label: 'Vários dentes',
        guide: 'Estudamos toda a arcada e a oclusão para apresentar opções seguras de reabilitação parcial ou total.'
      },
      {
        label: 'Prótese sobre implante',
        guide: 'Indicado para quem já possui implantes instalados ou deseja revisar e substituir próteses antigas.'
      },
      {
        label: 'Avaliação inicial',
        guide: 'Conversa detalhada, exame clínico e solicitação de exames complementares para diagnóstico preciso.'
      },
      {
        label: 'Ainda não sei',
        guide: 'Sem problema. Examinamos o seu caso com calma e explicamos todas as alternativas possíveis.'
      }
    ],
    journey: [
      {
        title: 'Primeiro contato',
        icon: 'espelho',
        text: 'Você agenda sua consulta e traz exames anteriores, se já tiver, para nossa primeira conversa.'
      },
      {
        title: 'Avaliação e exames',
        icon: 'raiz',
        text: 'Exame clínico completo e solicitação de radiografias ou tomografia para avaliar o suporte ósseo.'
      },
      {
        title: 'Plano explicado',
        icon: 'dente',
        text: 'Explicamos as etapas cirúrgicas e protéticas, os tempos biológicos de cicatrização e os cuidados necessários.'
      },
      {
        title: 'Tratamento e acompanhamento',
        icon: 'escova',
        text: 'Realizamos a reabilitação planejada e mantemos revisões periódicas para preservar a saúde dos tecidos.'
      }
    ],
    faq: [
      {
        q: 'O que é um implante dentário e para que serve?',
        a: 'É uma estrutura, geralmente de titânio, instalada no osso para substituir a raiz de um dente perdido e servir de suporte para uma prótese dentária.'
      },
      {
        q: 'Todas as pessoas podem colocar implantes dentários?',
        a: 'A indicação depende de avaliação clínica, exames de imagem (como tomografia) e análise das condições gerais de saúde de cada paciente.'
      },
      {
        q: 'O tempo de cicatrização e o resultado são iguais em todos os casos?',
        a: 'Não. O tempo de osseointegração e as etapas variam conforme a região, a qualidade óssea e a resposta biológica individual.'
      },
      {
        q: 'Como faço para agendar minha consulta?',
        a: 'Basta enviar mensagem pelo WhatsApp ou preencher o formulário de agendamento desta página para combinarmos o melhor horário.'
      },
      {
        q: 'Onde fica o consultório?',
        a: 'O endereço completo, os horários de atendimento e o mapa de localização estão na seção Contato desta página.'
      },
      {
        q: 'Minhas informações pessoais estão protegidas?',
        a: 'Sim. Todos os dados informados seguem a LGPD e o sigilo odontológico, sendo usados apenas para o seu atendimento.'
      }
    ]
  },

  ortodontia: {
    label: 'Ortodontia',
    seo: {
      title: '{brand} | Ortodontia e Alinhadores em {city}',
      description: 'Aparelhos fixos, estéticos e alinhadores transparentes em {city}, com acompanhamento regular. Agende pelo WhatsApp.'
    },
    hero: {
      word: 'linha',
      title: 'Alinhar com *propósito*: conforto, função e estética.',
      sub: 'Aparelhos fixos, estéticos e alinhadores transparentes, com acompanhamento regular.',
      chips: ['Alinhadores transparentes', 'Aparelhos estéticos e fixos', 'Crianças, jovens e adultos'],
      b3: { label: 'Conhecer os alinhadores', target: '#destaque' }
    },
    marquee: [
      'Aparelho *fixo*',
      'Aparelho *estético*',
      'Alinhadores *transparentes*',
      'Ortodontia para *adultos*',
      'Ortodontia *interceptiva*',
      'Contenção e *manutenção*'
    ],
    services: [
      {
        tag: 'Tradição e controle',
        title: 'Aparelho fixo',
        icon: 'aparelho',
        image: 'T-05',
        text: 'Movimentação ortodôntica contínua para correção de desalinhamentos e ajustes de encaixe da mordida.'
      },
      {
        tag: 'Discrição',
        title: 'Aparelho estético',
        icon: 'espelho',
        image: 'T-01',
        text: 'Bráquetes translúcidos de safira ou cerâmica que se integram de forma discreta ao tom natural dos dentes.'
      },
      {
        tag: 'Removível e digital',
        title: 'Alinhadores transparentes',
        icon: 'aparelho',
        image: 'T-05',
        text: 'Placas transparentes removíveis planejadas digitalmente, que facilitam a higiene diária e a alimentação.'
      },
      {
        tag: 'Qualquer fase',
        title: 'Ortodontia para adultos',
        icon: 'dente',
        image: 'T-03',
        text: 'Planejamento adaptado à rotina adulta, muitas vezes integrado a outras áreas como reabilitação e periodontium.'
      },
      {
        tag: 'Infância',
        title: 'Ortodontia interceptiva',
        icon: 'escova',
        image: 'T-02',
        text: 'Acompanhamento do crescimento ósseo e da troca dos dentes na infância para orientar o desenvolvimento da arcada.'
      },
      {
        tag: 'Estabilidade',
        title: 'Contenção e manutenção',
        icon: 'raiz',
        image: 'T-06',
        text: 'Acompanhamento pós-tratamento e instalação de contenções para preservar a estabilidade do alinhamento alcançado.'
      }
    ],
    featured: {
      eyebrow: 'Em destaque',
      title: 'Alinhadores *transparentes*.',
      text: 'Planejamento digital das movimentações dentárias com placas removíveis que facilitam a rotina de higiene. A indicação depende de avaliação ortodôntica individual.',
      cta: 'Avaliar meu alinhamento',
      triage: 'Alinhadores',
      caseLabel: 'Caso ilustrativo de alinhamento ortodôntico'
    },
    triage: [
      {
        label: 'Aparelho fixo',
        guide: 'Conversamos sobre como funciona o tratamento fixo, a periodicidade das manutenções e os cuidados de higiene.'
      },
      {
        label: 'Estético',
        guide: 'Apresentamos as opções de bráquetes cerâmicos ou de safira para quem busca um aparelho fixo mais discreto.'
      },
      {
        label: 'Alinhadores',
        guide: 'Avaliamos sua mordida para verificar a indicação de alinhadores transparentes removíveis e explicar o fluxo digital.'
      },
      {
        label: 'Avaliação inicial',
        guide: 'Exame clínico da oclusão e solicitação de documentação ortodôntica para traçar um plano personalizado.'
      },
      {
        label: 'Ainda não sei',
        guide: 'Sem problema. Na consulta avaliamos qual modalidade ortodôntica melhor se adapta ao seu caso e à sua rotina.'
      }
    ],
    journey: [
      {
        title: 'Primeiro contato',
        icon: 'espelho',
        text: 'Você agenda sua conversa inicial e conta o que incomoda na posição dos dentes ou no encaixe da mordida.'
      },
      {
        title: 'Avaliação e exames',
        icon: 'raiz',
        text: 'Exame clínico detalhado e pedido de documentação ortodôntica (radiografias, fotos e modelos digitais).'
      },
      {
        title: 'Plano explicado',
        icon: 'dente',
        text: 'Apresentamos as opções de aparelhos indicadas para o seu caso, etapas previstas e orientações de uso.'
      },
      {
        title: 'Tratamento e acompanhamento',
        icon: 'escova',
        text: 'Iniciamos o tratamento com consultas regulares de ajuste e seguimos até a fase de contenção e estabilidade.'
      }
    ],
    faq: [
      {
        q: 'Qual a diferença entre alinhadores transparentes e aparelho fixo?',
        a: 'Os alinhadores são placas transparentes removíveis trocadas em sequência, enquanto o aparelho fixo utiliza bráquetes colados aos dentes. Ambos têm indicações específicas definidas após avaliação.'
      },
      {
        q: 'Qualquer caso pode ser tratado com alinhadores?',
        a: 'A indicação depende da avaliação clínica e da análise da documentação ortodôntica, que mostram qual técnica é mais adequada para a sua oclusão.'
      },
      {
        q: 'Quanto tempo dura o tratamento ortodôntico?',
        a: 'O prazo varia de pessoa para pessoa conforme a complexidade da movimentação, a resposta biológica e a colaboração no uso e nas consultas.'
      },
      {
        q: 'Como faço para agendar uma consulta ortodôntica?',
        a: 'Você pode agendar diretamente pelo WhatsApp ou preenchendo o formulário rápido na seção de Agendamento.'
      },
      {
        q: 'Onde o consultório atende?',
        a: 'Confira o endereço completo, horários de atendimento e mapa interativo na seção de Contato abaixo.'
      },
      {
        q: 'Meus dados de contato ficam protegidos?',
        a: 'Sim. Utilizamos suas informações apenas para agendamento e comunicação direta com você, respeitando a LGPD.'
      }
    ]
  },

  endodontia: {
    label: 'Endodontia e cirurgia',
    seo: {
      title: '{brand} | Endodontia e Cirurgia Oral em {city}',
      description: 'Tratamento de canal, retratamento e cirurgias orais menores em {city} com planejamento prévio. Agende pelo WhatsApp.'
    },
    hero: {
      word: 'raiz',
      title: 'Preservar o dente natural, com *cuidado* e técnica.',
      sub: 'Tratamento de canal, retratamento e cirurgias orais menores com planejamento prévio.',
      chips: ['Tratamento de canal', 'Retratamento endodôntico', 'Cirurgia oral menor'],
      b3: { label: 'Conhecer o cuidado endodôntico', target: '#destaque' }
    },
    marquee: [
      'Tratamento de *canal*',
      'Retratamento *endodôntico*',
      'Cirurgia de *sisos*',
      'Cirurgias orais *menores*',
      'Avaliação de *urgência*',
      'Acompanhamento *pós-procedimento*'
    ],
    services: [
      {
        tag: 'Preservação',
        title: 'Tratamento de canal',
        icon: 'raiz',
        image: 'T-06',
        text: 'Desinfecção e selamento do interior do dente quando há inflamação ou infecção pulpar, visando manter o dente natural.'
      },
      {
        tag: 'Revisão técnica',
        title: 'Retratamento endodôntico',
        icon: 'espelho',
        image: 'T-01',
        text: 'Nova intervenção em canais já tratados anteriormente quando há necessidade de desacontaminação complementar.'
      },
      {
        tag: 'Planejamento cirúrgico',
        title: 'Cirurgia de sisos',
        icon: 'implante',
        image: 'T-04',
        text: 'Avaliação por exames de imagem e remoção planejada de terceiros molares quando há indicação clínica.'
      },
      {
        tag: 'Ambulatorial',
        title: 'Cirurgias orais menores',
        icon: 'dente',
        image: 'T-03',
        text: 'Pequenos procedimentos cirúrgicos realizados em consultório com orientação detalhada antes e depois do atendimento.'
      },
      {
        tag: 'Diagnóstico',
        title: 'Avaliação de dor e urgência',
        icon: 'espelho',
        image: 'T-01',
        text: 'Investigação clínica e radiográfica para identificar a causa de desconfortos agudos e realizar o alívio adequado.'
      },
      {
        tag: 'Recuperação',
        title: 'Acompanhamento pós-procedimento',
        icon: 'escova',
        image: 'T-02',
        text: 'Monitoramento da reparação tecidual e orientações para que o dente volte a receber a restauração definitiva.'
      }
    ],
    featured: {
      eyebrow: 'Em destaque',
      title: 'Endodontia com *planejamento*.',
      text: 'Exames de imagem e recursos de ampliação auxiliam no cuidado dos canais radiculares e na preservação da estrutura dental. A indicação depende de avaliação individual.',
      cta: 'Agendar avaliação',
      triage: 'Canal',
      caseLabel: 'Caso ilustrativo de preservação e reabilitação dental'
    },
    triage: [
      {
        label: 'Dor no dente',
        guide: 'Conte o que está sentindo para priorizarmos o seu horário. Em caso de febre ou inchaço severo, procure pronto-atendimento.'
      },
      {
        label: 'Canal',
        guide: 'Avaliamos o dente com testes clínicos e radiografia para confirmar a necessidade de tratamento ou retratamento de canal.'
      },
      {
        label: 'Siso',
        guide: 'Analisamos a posição dos sisos em exames de imagem e explicamos todos os cuidados pré e pós-operatórios.'
      },
      {
        label: 'Avaliação inicial',
        guide: 'Consulta tranquila para diagnóstico clínico, análise de exames ou segunda opinião profissional.'
      },
      {
        label: 'Ainda não sei',
        guide: 'Sem problema. Descreva brevemente sua necessidade e orientamos o melhor primeiro passo.'
      }
    ],
    journey: [
      {
        title: 'Primeiro contato',
        icon: 'espelho',
        text: 'Você relata sua queixa ou encaminhamento pelo WhatsApp e agendamos o atendimento.'
      },
      {
        title: 'Avaliação e exames',
        icon: 'raiz',
        text: 'Exame clínico minucioso e análise radiográfica ou tomográfica da região a ser tratada.'
      },
      {
        title: 'Plano explicado',
        icon: 'dente',
        text: 'Explicamos o diagnóstico, o passo a passo do procedimento e todas as recomendações de preparo.'
      },
      {
        title: 'Tratamento e acompanhamento',
        icon: 'escova',
        text: 'Realizamos o cuidado com tranquilidade e acompanhamos a evolução pós-operatória.'
      }
    ],
    faq: [
      {
        q: 'Quando o tratamento de canal é indicado?',
        a: 'Quando a polpa do dente sofre inflamação irreversível ou infecção, geralmente por cárie profunda, fratura ou trauma, buscando preservar o dente natural.'
      },
      {
        q: 'Todo dente siso precisa ser removido?',
        a: 'Não. A indicação cirúrgica depende de avaliação clínica e de exames de imagem que mostrem a posição do dente e o espaço disponível na arcada.'
      },
      {
        q: 'Quantas sessões são necessárias e como é a recuperação?',
        a: 'O número de sessões e a evolução pós-procedimento variam conforme a anatomia do dente, o grau de inflamação e a resposta biológica de cada paciente.'
      },
      {
        q: 'Como faço para agendar minha avaliação?',
        a: 'Entre em contato pelo WhatsApp ou preencha a mini-triagem desta página para combinarmos o horário.'
      },
      {
        q: 'Onde o consultório fica localizado?',
        a: 'Veja o endereço completo, horários e mapa na seção de Contato logo abaixo.'
      },
      {
        q: 'Meus dados estão seguros?',
        a: 'Sim. As informações enviadas são protegidas pela LGPD e utilizadas apenas para o agendamento da sua consulta.'
      }
    ]
  }
};