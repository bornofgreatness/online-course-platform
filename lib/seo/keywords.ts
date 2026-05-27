import type { Language } from '../i18n/translations'
import { SEO_KEYWORDS_EN, SEO_KEYWORDS_EN_STRING } from './keywords.en'

/**
 * Palavras-chave alvo (PT-BR) para SEO orgânico — cursos online, certificados e EaD.
 */
export const SEO_KEYWORDS = [
  'cursos online com certificado rápido',
  'cursos rapidos com certificado',
  'certificado rapido online',
  'cursos online com certificado gratis',
  'como conseguir certificado rapido',
  'cursos com certificado na hora',
  'cursos para turbinar o curriculo',
  'cursos online baratos com certificado',
  'plataforma de cursos online',
  'cursos rapidos de varias areas',
  'cursos online reconhecidos e baratos',
  'cursos online com certificado pago barato',
  'varios cursos com certificado rapido',
  'plataforma de cursos rapidos',
  'cursos acessiveis com certificado',
  'cursos de administracao rapidos',
  'cursos de tecnologia com certificado',
  'cursos de saude online rapidos',
  'cursos de educacao com certificado',
  'cursos de marketing digital rapidos',
  'cursos de estetica com certificado',
  'cursos de idiomas rapidos',
  'emitir certificado rapido',
  'certificado na hora barato',
  'cursos profissionalizantes rapidos',
  'qualificacao profissional barata',
  'curso online com certificado imediato',
  'certificado digital rapido',
  'cursos para horas complementares',
  'certificado para faculdade rapido',
  'cursos rapidos horas complementares',
  'horas complementares faculdade',
  'cursos online 10 horas certificado',
  'cursos EaD rapidos',
  'cursos livres com certificado',
  'certificado valido em todo brasil',
  'cursos rapidos para desempregados',
  'cursos online preco popular',
  'cursos de 80 horas com certificado',
  'cursos de 100 horas com certificado',
  'cursos de 50 horas com certificado',
  'cursos de 20 horas com certificado',
  'como atualizar o curriculo rapido',
  'cursos para ganhar pontos em concurso',
  'certificado de curso livre rapido',
  'plataforma de cursos EaD barata',
  'cursos online em promocao',
  'aprender profissao rapido',
  'cursos rapidos de TI',
  'curso de excel online com certificado',
  'curso assistente administrativo online',
  'cursos de pedagogia rapidos',
  'cursos de vendas e marketing',
  'certificados digitais na hora',
  'CONECT CURSOS',
  'Jacobina',
  'Bahia',
  'EaD',
] as const

export const SEO_KEYWORDS_STRING = SEO_KEYWORDS.join(', ')

export function getSeoKeywords(lang: Language) {
  return lang === 'en' ? SEO_KEYWORDS_EN : SEO_KEYWORDS
}

export function getSeoKeywordsString(lang: Language) {
  return lang === 'en' ? SEO_KEYWORDS_EN_STRING : SEO_KEYWORDS_STRING
}

export const SEO_KEYWORDS_COMBINED_STRING = `${SEO_KEYWORDS_STRING}, ${SEO_KEYWORDS_EN_STRING}`
