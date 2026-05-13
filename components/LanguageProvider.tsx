'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Language = 'en' | 'pt'

export type TranslationKey =
  | 'common.access'
  | 'common.admin'
  | 'common.affiliate'
  | 'common.allCategories'
  | 'common.backToAllCourses'
  | 'common.backToCourses'
  | 'common.categories'
  | 'common.certificates'
  | 'common.close'
  | 'common.courseNotFound'
  | 'common.courses'
  | 'common.dashboard'
  | 'common.home'
  | 'common.language'
  | 'common.learning'
  | 'common.login'
  | 'common.logout'
  | 'common.menu'
  | 'common.password'
  | 'common.prices'
  | 'common.saving'
  | 'common.signup'
  | 'course.about'
  | 'course.available'
  | 'course.complete'
  | 'course.completed'
  | 'course.courseMaterial'
  | 'course.courseMaterialsLocked'
  | 'course.coursePreview'
  | 'course.enroll'
  | 'course.enrolling'
  | 'course.enrollmentFailed'
  | 'course.inProgress'
  | 'course.instructor'
  | 'course.markComplete'
  | 'course.noCoursesFound'
  | 'course.openPdf'
  | 'course.progress'
  | 'course.renewPdfAccess'
  | 'course.search'
  | 'course.showAll'
  | 'course.showing'
  | 'course.status'
  | 'course.viewerNote'
  | 'course.workload'
  | 'actions.certificateEarned'
  | 'actions.errorGeneratingCertificate'
  | 'actions.errorUpdatingProgress'
  | 'actions.failedGenerateCertificate'
  | 'actions.failedMarkComplete'
  | 'actions.generateCertificate'
  | 'actions.generating'
  | 'actions.passQuizBeforeComplete'
  | 'actions.renewAccess'
  | 'actions.subscriptionInactive'
  | 'actions.updating'
  | 'actions.viewCertificate'
  | 'actions.viewPlans'
  | 'quiz.attemptsUsed'
  | 'quiz.attemptsLeft'
  | 'quiz.courseQuiz'
  | 'quiz.failedLoad'
  | 'quiz.loading'
  | 'quiz.maxAttempts'
  | 'quiz.notPassed'
  | 'quiz.passed'
  | 'quiz.passingScore'
  | 'quiz.score'
  | 'quiz.submit'
  | 'quiz.submitting'
  | 'quiz.submitFailed'
  | 'quiz.youPassed'

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    'common.access': 'Access',
    'common.admin': 'Admin',
    'common.affiliate': 'Affiliate',
    'common.allCategories': 'All categories',
    'common.backToAllCourses': 'Back to all courses',
    'common.backToCourses': 'Back to courses',
    'common.categories': 'Categories',
    'common.certificates': 'Certificates',
    'common.close': 'Close',
    'common.courseNotFound': 'Course not found.',
    'common.courses': 'Courses',
    'common.dashboard': 'Dashboard',
    'common.home': 'Home',
    'common.language': 'Language',
    'common.learning': 'Learning',
    'common.login': 'Login',
    'common.logout': 'Log out',
    'common.menu': 'Menu',
    'common.password': 'Password',
    'common.prices': 'Prices',
    'common.saving': 'Saving...',
    'common.signup': 'Sign up',
    'course.about': 'About this course',
    'course.available': 'Available courses',
    'course.complete': 'Completed',
    'course.completed': 'Completed',
    'course.courseMaterial': 'Course material',
    'course.courseMaterialsLocked': 'Course materials are locked',
    'course.coursePreview': 'Course preview',
    'course.enroll': 'Enroll in Course',
    'course.enrolling': 'Enrolling...',
    'course.enrollmentFailed': 'Enrollment failed',
    'course.inProgress': 'In progress',
    'course.instructor': 'Instructor',
    'course.markComplete': 'Mark as Complete',
    'course.noCoursesFound': 'No courses found for this category or search.',
    'course.openPdf': 'Open PDF in new tab',
    'course.progress': 'Progress',
    'course.renewPdfAccess': 'Renew your subscription on the pricing page to view the PDF and use progress tracking.',
    'course.search': 'Search courses...',
    'course.showAll': 'Show all courses',
    'course.showing': 'Showing {count} course{plural}',
    'course.status': 'Status',
    'course.viewerNote':
      'Note: This viewer tracks reading progress by scroll position (logical pages). For full page-level tracking, the PDF should be rendered with a JS PDF library (e.g. pdf.js).',
    'course.workload': 'Workload: {hours} hours',
    'actions.certificateEarned': 'Certificate earned',
    'actions.errorGeneratingCertificate': 'Error generating certificate',
    'actions.errorUpdatingProgress': 'Error updating progress',
    'actions.failedGenerateCertificate': 'Failed to generate certificate',
    'actions.failedMarkComplete': 'Failed to mark course as complete',
    'actions.generateCertificate': 'Generate certificate',
    'actions.generating': 'Generating...',
    'actions.passQuizBeforeComplete': 'Pass the course quiz (7/10 or higher) before marking complete.',
    'actions.renewAccess': 'Renew to access course materials, the quiz, and progress tracking.',
    'actions.subscriptionInactive': 'Your subscription is inactive or has expired.',
    'actions.updating': 'Updating...',
    'actions.viewCertificate': 'View certificate',
    'actions.viewPlans': 'View plans',
    'quiz.attemptsUsed': 'Attempts used',
    'quiz.attemptsLeft': '{count} attempt(s) left.',
    'quiz.courseQuiz': 'Course quiz',
    'quiz.failedLoad': 'Failed to load quiz',
    'quiz.loading': 'Loading quiz...',
    'quiz.maxAttempts': 'Maximum attempts reached without a passing score.',
    'quiz.notPassed': 'Not passed',
    'quiz.passed': 'Passed',
    'quiz.passingScore': 'Passing score',
    'quiz.score': 'Score {score}/10',
    'quiz.submit': 'Submit answers',
    'quiz.submitting': 'Submitting...',
    'quiz.submitFailed': 'Submit failed',
    'quiz.youPassed': 'You have passed this quiz. You can mark the course complete.',
  },
  pt: {
    'common.access': 'Acessar',
    'common.admin': 'Admin',
    'common.affiliate': 'Afiliado',
    'common.allCategories': 'Todas as categorias',
    'common.backToAllCourses': 'Voltar para todos os cursos',
    'common.backToCourses': 'Voltar para cursos',
    'common.categories': 'Categorias',
    'common.certificates': 'Certificados',
    'common.close': 'Fechar',
    'common.courseNotFound': 'Curso não encontrado.',
    'common.courses': 'Cursos',
    'common.dashboard': 'Painel',
    'common.home': 'Início',
    'common.language': 'Idioma',
    'common.learning': 'Estudando',
    'common.login': 'Entrar',
    'common.logout': 'Sair',
    'common.menu': 'Menu',
    'common.password': 'Senha',
    'common.prices': 'Preços',
    'common.saving': 'Salvando...',
    'common.signup': 'Cadastrar',
    'course.about': 'Sobre este curso',
    'course.available': 'Cursos disponíveis',
    'course.complete': 'Concluído',
    'course.completed': 'Concluído',
    'course.courseMaterial': 'Material do curso',
    'course.courseMaterialsLocked': 'Materiais do curso bloqueados',
    'course.coursePreview': 'Prévia do curso',
    'course.enroll': 'Inscrever-se no curso',
    'course.enrolling': 'Inscrevendo...',
    'course.enrollmentFailed': 'Falha na inscrição',
    'course.inProgress': 'Em andamento',
    'course.instructor': 'Instrutor',
    'course.markComplete': 'Marcar como concluído',
    'course.noCoursesFound': 'Nenhum curso encontrado para esta categoria ou busca.',
    'course.openPdf': 'Abrir PDF em nova aba',
    'course.progress': 'Progresso',
    'course.renewPdfAccess':
      'Renove sua assinatura na página de preços para ver o PDF e usar o acompanhamento de progresso.',
    'course.search': 'Buscar cursos...',
    'course.showAll': 'Mostrar todos os cursos',
    'course.showing': 'Mostrando {count} curso{plural}',
    'course.status': 'Status',
    'course.viewerNote':
      'Observação: este visualizador acompanha o progresso pela rolagem (páginas lógicas). Para acompanhamento por página, o PDF deve ser renderizado com uma biblioteca JS de PDF (ex.: pdf.js).',
    'course.workload': 'Carga horária: {hours} horas',
    'actions.certificateEarned': 'Certificado obtido',
    'actions.errorGeneratingCertificate': 'Erro ao gerar certificado',
    'actions.errorUpdatingProgress': 'Erro ao atualizar progresso',
    'actions.failedGenerateCertificate': 'Falha ao gerar certificado',
    'actions.failedMarkComplete': 'Falha ao marcar o curso como concluído',
    'actions.generateCertificate': 'Gerar certificado',
    'actions.generating': 'Gerando...',
    'actions.passQuizBeforeComplete': 'Passe no quiz do curso (7/10 ou mais) antes de marcar como concluído.',
    'actions.renewAccess': 'Renove para acessar materiais do curso, quiz e acompanhamento de progresso.',
    'actions.subscriptionInactive': 'Sua assinatura está inativa ou expirou.',
    'actions.updating': 'Atualizando...',
    'actions.viewCertificate': 'Ver certificado',
    'actions.viewPlans': 'Ver planos',
    'quiz.attemptsUsed': 'Tentativas usadas',
    'quiz.attemptsLeft': '{count} tentativa(s) restante(s).',
    'quiz.courseQuiz': 'Quiz do curso',
    'quiz.failedLoad': 'Falha ao carregar o quiz',
    'quiz.loading': 'Carregando quiz...',
    'quiz.maxAttempts': 'Número máximo de tentativas atingido sem pontuação suficiente.',
    'quiz.notPassed': 'Não aprovado',
    'quiz.passed': 'Aprovado',
    'quiz.passingScore': 'Nota mínima',
    'quiz.score': 'Pontuação {score}/10',
    'quiz.submit': 'Enviar respostas',
    'quiz.submitting': 'Enviando...',
    'quiz.submitFailed': 'Falha ao enviar',
    'quiz.youPassed': 'Você passou neste quiz. Agora pode marcar o curso como concluído.',
  },
}

type I18nContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: TranslationKey, values?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    const stored = window.localStorage.getItem('language')
    if (stored === 'en' || stored === 'pt') {
      setLanguageState(stored)
    }
  }, [])

  const setLanguage = (next: Language) => {
    setLanguageState(next)
    window.localStorage.setItem('language', next)
    document.documentElement.lang = next === 'pt' ? 'pt-BR' : 'en'
  }

  useEffect(() => {
    document.documentElement.lang = language === 'pt' ? 'pt-BR' : 'en'
  }, [language])

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key, values) => {
        let text = translations[language][key] ?? translations.en[key] ?? key
        if (values) {
          for (const [name, value] of Object.entries(values)) {
            text = text.split(`{${name}}`).join(String(value))
          }
        }
        return text
      },
    }),
    [language]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used within LanguageProvider')
  return context
}

export function LocalizedText({
  textKey,
  values,
}: {
  textKey: TranslationKey
  values?: Record<string, string | number>
}) {
  const { t } = useI18n()
  return <>{t(textKey, values)}</>
}
