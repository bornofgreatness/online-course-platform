export type QuizQuestion = {
  id: string
  prompt: string
  options: [string, string, string, string]
  correctIndex: 0 | 1 | 2 | 3
}

export type QuizPayload = { questions: QuizQuestion[] }
export type QuizLanguage = 'en' | 'pt'

export const QUIZ_PASS_SCORE = 7
export const QUIZ_MAX_QUESTIONS = 10
export const QUIZ_MAX_ATTEMPTS = 3

export function buildDefaultQuizPayload(): QuizPayload {
  const questions: QuizQuestion[] = [
    {
      id: 'q1',
      prompt: 'What is the primary format for course materials on this platform?',
      options: ['PDF documents', 'VHS tapes', 'Printed books only', 'Fax transmissions'],
      correctIndex: 0,
    },
    {
      id: 'q2',
      prompt: 'Where should learners track enrolled courses and certificates?',
      options: ['Dashboard', 'Pricing page', '404 page', 'Sitemap'],
      correctIndex: 0,
    },
    {
      id: 'q3',
      prompt: 'A passing quiz score is at least how many correct answers out of 10?',
      options: ['5', '6', '7', '9'],
      correctIndex: 2,
    },
    {
      id: 'q4',
      prompt: 'How many quiz attempts are allowed per course?',
      options: ['1', '2', '3', 'Unlimited'],
      correctIndex: 2,
    },
    {
      id: 'q5',
      prompt: 'Certificates are issued after you:',
      options: [
        'Enroll only',
        'Complete requirements including passing the quiz when assigned',
        'Share on social media',
        'Open the homepage',
      ],
      correctIndex: 1,
    },
    {
      id: 'q6',
      prompt: 'Subscription access is checked when you:',
      options: [
        'Enroll in a course and open protected materials',
        'Change your avatar color',
        'Print the syllabus only',
        'View the public landing page',
      ],
      correctIndex: 0,
    },
    {
      id: 'q7',
      prompt: 'If you forget your password, you should use:',
      options: ['Forgot password flow', 'Guess until it works', 'Email the instructor', 'Clear cookies only'],
      correctIndex: 0,
    },
    {
      id: 'q8',
      prompt: 'Course workload hours describe:',
      options: [
        'Estimated study time',
        'Server CPU hours',
        'Number of PDF bytes',
        'Instructor age',
      ],
      correctIndex: 0,
    },
    {
      id: 'q9',
      prompt: 'Progress while reading is saved when:',
      options: [
        'You are signed in and enrolled',
        'You disable JavaScript',
        'You use incognito without login',
        'You refresh before loading',
      ],
      correctIndex: 0,
    },
    {
      id: 'q10',
      prompt: 'Unique certificate numbers help with:',
      options: ['Public verification', 'Random decoration', 'Hiding completion', 'Deleting courses'],
      correctIndex: 0,
    },
  ]
  return { questions }
}

export function parseQuizQuestions(json: string | null | undefined): QuizPayload | null {
  if (!json?.trim()) return null
  try {
    const data = JSON.parse(json) as QuizPayload
    if (!data?.questions || !Array.isArray(data.questions)) return null
    if (data.questions.length !== QUIZ_MAX_QUESTIONS) return null
    for (const q of data.questions) {
      if (!q?.id || !q.prompt || !Array.isArray(q.options) || q.options.length !== 4) return null
      if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3) return null
    }
    return data
  } catch {
    return null
  }
}

export function stripAnswers(payload: QuizPayload) {
  return {
    questions: payload.questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      options: q.options,
    })),
  }
}

const ptDefaultQuizText: Record<string, Pick<QuizQuestion, 'prompt' | 'options'>> = {
  q1: {
    prompt: 'Qual é o formato principal dos materiais do curso nesta plataforma?',
    options: ['Documentos PDF', 'Fitas VHS', 'Apenas livros impressos', 'Transmissões por fax'],
  },
  q2: {
    prompt: 'Onde os alunos devem acompanhar cursos inscritos e certificados?',
    options: ['Painel', 'Página de preços', 'Página 404', 'Mapa do site'],
  },
  q3: {
    prompt: 'A nota mínima para aprovação no quiz é de quantas respostas corretas em 10?',
    options: ['5', '6', '7', '9'],
  },
  q4: {
    prompt: 'Quantas tentativas de quiz são permitidas por curso?',
    options: ['1', '2', '3', 'Ilimitadas'],
  },
  q5: {
    prompt: 'Os certificados são emitidos depois que você:',
    options: [
      'Apenas se inscreve',
      'Conclui os requisitos, incluindo passar no quiz quando houver',
      'Compartilha nas redes sociais',
      'Abre a página inicial',
    ],
  },
  q6: {
    prompt: 'O acesso da assinatura é verificado quando você:',
    options: [
      'Inscreve-se em um curso e abre materiais protegidos',
      'Altera a cor do avatar',
      'Imprime apenas o programa',
      'Vê a landing page pública',
    ],
  },
  q7: {
    prompt: 'Se você esquecer sua senha, deve usar:',
    options: ['Fluxo de recuperação de senha', 'Tentar adivinhar até funcionar', 'Enviar e-mail ao instrutor', 'Limpar apenas os cookies'],
  },
  q8: {
    prompt: 'A carga horária do curso descreve:',
    options: ['Tempo estimado de estudo', 'Horas de CPU do servidor', 'Número de bytes do PDF', 'Idade do instrutor'],
  },
  q9: {
    prompt: 'O progresso durante a leitura é salvo quando:',
    options: [
      'Você está conectado e inscrito',
      'Você desativa o JavaScript',
      'Você usa janela anônima sem login',
      'Você atualiza antes de carregar',
    ],
  },
  q10: {
    prompt: 'Números únicos de certificado ajudam com:',
    options: ['Verificação pública', 'Decoração aleatória', 'Ocultar conclusão', 'Excluir cursos'],
  },
}

export function localizeQuizPayload(payload: QuizPayload, language: QuizLanguage): QuizPayload {
  if (language !== 'pt') return payload

  return {
    questions: payload.questions.map((question) => {
      const localized = ptDefaultQuizText[question.id]
      if (!localized) return question
      return {
        ...question,
        prompt: localized.prompt,
        options: localized.options as [string, string, string, string],
      }
    }),
  }
}

export function gradeAnswers(payload: QuizPayload, answers: number[]): number {
  if (!Array.isArray(answers) || answers.length !== payload.questions.length) return 0
  let score = 0
  for (let i = 0; i < payload.questions.length; i++) {
    const a = answers[i]
    if (typeof a === 'number' && a === payload.questions[i].correctIndex) score++
  }
  return score
}

/** Normalize admin draft input before save. Returns null if invalid. */
export function normalizeQuizDraft(questions: QuizQuestion[]): QuizPayload | null {
  if (questions.length !== QUIZ_MAX_QUESTIONS) return null

  const normalized: QuizQuestion[] = questions.map((q, index) => ({
    id: (q.id?.trim() || `q${index + 1}`) as string,
    prompt: q.prompt.trim(),
    options: q.options.map((option) => String(option).trim()) as [string, string, string, string],
    correctIndex: q.correctIndex,
  }))

  return parseQuizQuestions(JSON.stringify({ questions: normalized }))
}

export function isQuizDraftComplete(questions: QuizQuestion[]): boolean {
  return normalizeQuizDraft(questions) !== null
}
