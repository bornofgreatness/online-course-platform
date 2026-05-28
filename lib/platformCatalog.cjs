/** CommonJS catalog for Node seed script (mirrors lib/platformCatalog.ts). */

const IMG = {
  education: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80',
  tech: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
  ai: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
  health: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
  marketing: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
  jobs: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80',
  social: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80',
}

const COURSE_IMAGES = {
  education: [
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
  ],
  tech: [
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
  ],
  ai: [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=800&q=80',
  ],
  health: [
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
  ],
  marketing: [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1557838923-2985c318be48?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80',
  ],
  jobs: [
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80',
  ],
  social: [
    'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=800&q=80',
  ],
}

function hashString(value) {
  let h = 0
  for (let i = 0; i < value.length; i++) h = Math.imul(31, h) + value.charCodeAt(i)
  return Math.abs(h)
}

function categoryImageKey(categoryName) {
  const name = String(categoryName || '').toLowerCase()
  if (name.includes('educ')) return 'education'
  if (name.includes('inform')) return 'tech'
  if (name.includes('intelig') || name.includes('artificial')) return 'ai'
  if (name.includes('saúde') || name.includes('saude') || name.includes('bem-estar')) return 'health'
  if (name.includes('marketing')) return 'marketing'
  if (name.includes('empreg')) return 'jobs'
  if (name.includes('assist')) return 'social'
  return 'education'
}

function courseThumbnailUrl(categoryName, courseTitle) {
  const key = categoryImageKey(categoryName)
  const images = COURSE_IMAGES[key] || COURSE_IMAGES.education
  return images[hashString(`${categoryName}:${courseTitle}`) % images.length]
}

const WORKLOAD_OPTIONS = [20, 40, 60, 80, 100]

function courseWorkloadHours(topic) {
  return WORKLOAD_OPTIONS[hashString(String(topic || '')) % WORKLOAD_OPTIONS.length]
}

function coursesFor(topic) {
  const workloadHours = courseWorkloadHours(topic)
  return [
    {
      title: `Certificado 100h — ${topic}`,
      description: `Formação completa em ${topic}. Certificado de ${workloadHours} horas com verificação online.`,
      workloadHours,
    },
  ]
}

function sub(name) {
  return { name, courses: coursesFor(name) }
}

const PLATFORM_CATALOG = [
  {
    name: 'Educação',
    icon: 'education',
    imageUrl: IMG.education,
    sortOrder: 1,
    subcategories: [
      sub('Planejamento Pedagógico'),
      sub('Avaliação da Aprendizagem'),
      sub('Metodologias Ativas'),
      sub('Estratégias de Ensino'),
      sub('Gestão Escolar'),
      sub('Coordenação Pedagógica'),
      sub('Liderança Educacional'),
      sub('Administração Escolar'),
      sub('Organização Escolar'),
      sub('Documentos Educacionais'),
      sub('BNCC na Prática'),
      sub('Projeto Político Pedagógico (PPP)'),
      sub('LDB Educacional'),
      sub('Currículo Escolar'),
      sub('Planejamento Escolar'),
      sub('Tecnologias Digitais na Educação'),
      sub('Ensino Híbrido'),
      sub('Ferramentas Digitais para Professores'),
      sub('Produção de Aulas Online'),
      sub('Educação a Distância'),
      sub('Libras Básico'),
      sub('Libras Intermediário'),
      sub('Libras para Professores'),
      sub('Comunicação com Surdos'),
      sub('Educação Inclusiva para Alunos Surdos'),
      sub('Matemática na Educação'),
      sub('Português na Educação'),
      sub('Geografia na Educação'),
      sub('História na Educação'),
      sub('Ciências na Educação'),
    ],
  },
  {
    name: 'Informática',
    icon: 'laptop',
    imageUrl: IMG.tech,
    sortOrder: 2,
    subcategories: [
      sub('Informática Básica'),
      sub('Introdução ao Computador'),
      sub('Internet Básica'),
      sub('Segurança na Internet'),
      sub('Digitação'),
      sub('Windows Básico'),
      sub('Linux Básico'),
      sub('Introdução ao macOS'),
      sub('Android para Computadores'),
      sub('Fundamentos de Sistemas Operacionais'),
      sub('Microsoft Word'),
      sub('Microsoft Excel'),
      sub('Microsoft PowerPoint'),
      sub('Microsoft Access'),
      sub('Digitação Profissional'),
      sub('LibreOffice Writer'),
      sub('LibreOffice Calc'),
      sub('LibreOffice Impress'),
      sub('LibreOffice Base'),
      sub('LibreOffice Draw'),
      sub('Google Docs'),
      sub('Google Sheets'),
      sub('Google Slides'),
      sub('Google Drive'),
      sub('Produtividade com Google'),
      sub('WPS Writer'),
      sub('WPS Planilhas'),
      sub('WPS Apresentação'),
      sub('WPS PDF'),
      sub('Produtividade com WPS'),
    ],
  },
  {
    name: 'Inteligência Artificial',
    icon: 'ai',
    imageUrl: IMG.ai,
    sortOrder: 3,
    subcategories: [
      sub('Introdução à Inteligência Artificial'),
      sub('História da IA'),
      sub('Principais Plataformas de IA'),
      sub('Aplicações de IA'),
      sub('Ética em IA'),
      sub('IA para Produtividade'),
      sub('IA para Estudos'),
      sub('Automação de Tarefas com IA'),
      sub('Organização do Trabalho com IA'),
      sub('Planejamento com IA'),
      sub('Criação de Texto com IA'),
      sub('Criação de Imagem com IA'),
      sub('Criação de Vídeo com IA'),
      sub('IA para Redes Sociais'),
      sub('Ferramentas de Design com IA'),
      sub('IA em Marketing'),
      sub('IA para Pequenos Negócios'),
      sub('Automação de Atendimento com IA'),
      sub('Análise de Dados com IA'),
      sub('Estratégias de Negócios com IA'),
      sub('ChatGPT na Prática'),
      sub('Gemini na Prática'),
      sub('Microsoft Copilot'),
      sub('Midjourney'),
      sub('DALL·E'),
    ],
  },
  {
    name: 'Saúde e Bem-Estar',
    icon: 'health',
    imageUrl: IMG.health,
    sortOrder: 4,
    subcategories: [
      sub('Auxiliar de Farmácia'),
      sub('Auxiliar de Consultório Dentário'),
      sub('Auxiliar Veterinário'),
      sub('Primeiros Socorros'),
      sub('Noções de Enfermagem'),
      sub('Qualidade de Vida'),
      sub('Saúde Mental'),
      sub('Alimentação Saudável'),
      sub('Gestão do Estresse'),
      sub('Hábitos Saudáveis'),
    ],
  },
  {
    name: 'Marketing Digital',
    icon: 'marketing',
    imageUrl: IMG.marketing,
    sortOrder: 5,
    subcategories: [
      sub('Introdução ao Marketing Digital'),
      sub('Marketing em Redes Sociais'),
      sub('Marketing para Pequenos Negócios'),
      sub('Estratégias de Marketing Online'),
      sub('Marketing de Conteúdo'),
      sub('Instagram para Negócios'),
      sub('Facebook para Empresas'),
      sub('Criação de Conteúdo para Redes'),
      sub('Crescimento no Instagram'),
      sub('Gestão de Redes Sociais'),
    ],
  },
  {
    name: 'Empregabilidade',
    icon: 'jobs',
    imageUrl: IMG.jobs,
    sortOrder: 6,
    subcategories: [
      sub('Como Criar um Currículo'),
      sub('Preparação para Entrevistas'),
      sub('Comunicação Profissional'),
      sub('Ética no Trabalho'),
      sub('Comportamento Profissional'),
    ],
  },
  {
    name: 'Assistência Social',
    icon: 'social',
    imageUrl: IMG.social,
    sortOrder: 7,
    subcategories: [
      sub('Introdução aos Serviços Sociais e Política Social'),
      sub('História do Serviço Social no Brasil'),
      sub('Estrutura do SUAS e Políticas de Assistência'),
      sub('Ética Profissional em Serviço Social'),
      sub('Direitos Sociais e Cidadania'),
      sub('Políticas Públicas no Brasil'),
      sub('Organização do Sistema de Assistência Social'),
      sub('SUAS, CRAS e CREAS'),
      sub('Gestão do SUAS'),
      sub('CRAS — Centro de Referência'),
      sub('CREAS — Centro Especializado'),
      sub('Assistência a Famílias em Vulnerabilidade'),
      sub('Trabalho Social com Famílias'),
      sub('Cadastro Único'),
      sub('Bolsa Família'),
      sub('BPC/LOAS'),
      sub('Programas de Transferência de Renda'),
      sub('Projetos Sociais e Comunitários'),
      sub('Visitas Domiciliares'),
      sub('Elaboração de Relatórios Técnicos'),
      sub('Mediação de Conflitos'),
      sub('Acompanhamento Familiar'),
      sub('Direitos Humanos na Prática'),
      sub('ECA na Prática'),
      sub('Proteção Social ao Idoso'),
      sub('Violência Doméstica e Rede de Proteção'),
      sub('Trabalho no CRAS e Oficinas Sociais'),
      sub('Organização e Funcionamento do CRAS'),
      sub('PAIF — Serviço de Proteção e Atendimento Integral à Família'),
      sub('Técnicas de Oficina Social'),
      sub('Grupos Comunitários e Fortalecimento de Vínculos'),
      sub('Educador Social no CRAS'),
      sub('Dinâmica de Grupos Familiares'),
      sub('Oficinas para Crianças e Adolescentes'),
      sub('Planejamento de Atividades Sociais'),
      sub('Relatórios e Registros de Atendimento'),
      sub('Ética no Serviço Social'),
    ],
  },
]

function countCatalogCourses() {
  return PLATFORM_CATALOG.reduce(
    (n, cat) => n + cat.subcategories.reduce((s, sub) => s + sub.courses.length, 0),
    0
  )
}

module.exports = {
  PLATFORM_CATALOG,
  DEFAULT_WORKLOAD_HOURS: 100,
  DEFAULT_PDF_URL: 'generated:course-material',
  DEFAULT_THUMBNAIL:
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
  courseThumbnailUrl,
  countCatalogCourses,
}
