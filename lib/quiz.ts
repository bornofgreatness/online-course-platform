export type QuizQuestion = {
  id: string
  prompt: string
  options: [string, string, string, string]
  correctIndex: 0 | 1 | 2 | 3
}

export type QuizPayload = { questions: QuizQuestion[] }

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

export function gradeAnswers(payload: QuizPayload, answers: number[]): number {
  if (!Array.isArray(answers) || answers.length !== payload.questions.length) return 0
  let score = 0
  for (let i = 0; i < payload.questions.length; i++) {
    const a = answers[i]
    if (typeof a === 'number' && a === payload.questions[i].correctIndex) score++
  }
  return score
}
