'use client'

import { useEffect, useMemo, useState } from 'react'
import AdminSearchBar from './admin/AdminSearchBar'
import {
  adminCardClass,
  adminInputClass,
  adminPrimaryBtnClass,
  adminSectionTitleClass,
} from './admin/adminStyles'
import LoadingButtonLabel from './LoadingButtonLabel'
import LoadingImage from './LoadingImage'
import { useI18n } from './LanguageProvider'
import { matchesAdminSearch } from '../lib/admin/matchesSearch'

type Coupon = {
  id: string
  code: string
  description: string | null
  discountPercent: number | null
  discountCents: number | null
  maxUses: number | null
  usedCount: number
  active: boolean
}

type Campaign = {
  id: string
  subject: string
  bodyHtml: string
  status: string
  recipientFilter: string
  sentCount: number
  sentAt: string | null
}

export default function AdminMarketing() {
  const { t } = useI18n()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discountPercent: 20,
    maxUses: 100,
  })

  const [campaignForm, setCampaignForm] = useState({
    subject: '',
    bodyHtml: '<p>Olá {{nome}},</p><p>Temos novidades na plataforma de cursos!</p>',
    recipientFilter: 'all_students',
  })

  const [uploadFolder, setUploadFolder] = useState('videos')
  const [uploadResult, setUploadResult] = useState<string | null>(null)
  const [couponSearch, setCouponSearch] = useState('')
  const [campaignSearch, setCampaignSearch] = useState('')

  const filteredCoupons = useMemo(() => {
    if (!couponSearch.trim()) return coupons
    return coupons.filter((c) =>
      matchesAdminSearch(couponSearch, c.code, c.description, c.active ? 'active' : 'inactive')
    )
  }, [coupons, couponSearch])

  const filteredCampaigns = useMemo(() => {
    if (!campaignSearch.trim()) return campaigns
    return campaigns.filter((c) =>
      matchesAdminSearch(campaignSearch, c.subject, c.status, c.recipientFilter)
    )
  }, [campaigns, campaignSearch])

  async function load() {
    setLoading(true)
    try {
      const [cRes, campRes] = await Promise.all([
        fetch('/api/admin/coupons'),
        fetch('/api/admin/campaigns'),
      ])
      const cData = await cRes.json()
      const campData = await campRes.json()
      if (cRes.ok) setCoupons(cData.coupons || [])
      if (campRes.ok) setCampaigns(campData.campaigns || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function createCoupon(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMessage(null)
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponForm),
    })
    const data = await res.json()
    setBusy(false)
    if (res.ok) {
      setMessage(t('marketing.couponCreated', { code: data.coupon.code }))
      setCouponForm({ code: '', description: '', discountPercent: 20, maxUses: 100 })
      load()
    } else {
      setMessage(data.error || t('common.error'))
    }
  }

  async function createCampaign(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    const res = await fetch('/api/admin/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaignForm),
    })
    const data = await res.json()
    setBusy(false)
    if (res.ok) {
      setMessage(t('marketing.campaignCreated'))
      load()
    } else {
      setMessage(data.error || t('common.error'))
    }
  }

  async function sendCampaign(id: string) {
    if (!window.confirm(t('marketing.confirmSend'))) return
    setBusy(true)
    const res = await fetch(`/api/admin/campaigns/${id}/send`, { method: 'POST' })
    const data = await res.json()
    setBusy(false)
    setMessage(
      res.ok
        ? t('marketing.sent', { sent: data.sent, total: data.total })
        : data.error || t('common.error')
    )
    load()
  }

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setUploadResult(null)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', uploadFolder)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setBusy(false)
    if (res.ok) {
      setUploadResult(data.url)
      await navigator.clipboard.writeText(data.url).catch(() => {})
    } else {
      setMessage(data.error || t('marketing.uploadFailed'))
    }
    e.target.value = ''
  }

  if (loading) {
    return <LoadingImage size="lg" label={t('common.loading')} className="py-16" />
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      {message && <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">{message}</p>}

      <section className={`${adminCardClass} space-y-4`}>
        <h2 className={adminSectionTitleClass}>{t('marketing.uploadTitle')}</h2>
        <p className="mt-1 text-sm text-slate-600">{t('marketing.uploadSubtitle')}</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <select
            value={uploadFolder}
            onChange={(e) => setUploadFolder(e.target.value)}
            className={`${adminInputClass} w-full sm:w-auto sm:min-w-[10rem]`}
          >
            <option value="videos">videos</option>
            <option value="pdfs">pdfs</option>
            <option value="thumbnails">thumbnails</option>
            <option value="materials">materials</option>
          </select>
          <input
            type="file"
            onChange={uploadFile}
            disabled={busy}
            className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700"
          />
        </div>
        {uploadResult && (
          <p className="mt-3 break-all text-sm text-green-700">
            {t('marketing.urlCopied')}{' '}
            <a href={uploadResult} className="underline">
              {uploadResult}
            </a>
          </p>
        )}
      </section>

      <section className={`${adminCardClass} space-y-4`}>
        <h2 className={adminSectionTitleClass}>{t('marketing.coupons')}</h2>
        <form onSubmit={createCoupon} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            placeholder={t('marketing.couponCode')}
            value={couponForm.code}
            onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
            className={`${adminInputClass} uppercase`}
            required
          />
          <input
            placeholder={t('marketing.description')}
            value={couponForm.description}
            onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
            className={adminInputClass}
          />
          <input
            type="number"
            placeholder={t('marketing.discountPercent')}
            value={couponForm.discountPercent}
            onChange={(e) => setCouponForm({ ...couponForm, discountPercent: Number(e.target.value) })}
            className={adminInputClass}
          />
          <input
            type="number"
            placeholder={t('marketing.maxUses')}
            value={couponForm.maxUses}
            onChange={(e) => setCouponForm({ ...couponForm, maxUses: Number(e.target.value) })}
            className={adminInputClass}
          />
          <button
            type="submit"
            disabled={busy}
            aria-busy={busy}
            className={`${adminPrimaryBtnClass} w-full sm:col-span-2`}
          >
            <LoadingButtonLabel loading={busy} label={t('common.loading')}>
              {t('marketing.createCoupon')}
            </LoadingButtonLabel>
          </button>
        </form>
        {coupons.length > 0 ? (
          <AdminSearchBar
            value={couponSearch}
            onChange={setCouponSearch}
            placeholder={t('marketing.searchCoupons')}
            className="mt-4"
          />
        ) : null}
        <ul className="mt-4 space-y-2 text-sm">
          {coupons.length === 0 ? null : filteredCoupons.length === 0 ? (
            <li className="text-slate-600">{t('admin.noSearchResults')}</li>
          ) : (
            filteredCoupons.map((c) => (
            <li key={c.id} className="flex flex-col gap-2 rounded-xl border border-slate-200/80 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span>
                <strong>{c.code}</strong> — {c.discountPercent}% · {c.usedCount}/{c.maxUses ?? '∞'}{' '}
                {t('marketing.uses')}
              </span>
              <span className={c.active ? 'text-green-600' : 'text-slate-400'}>
                {c.active ? t('marketing.active') : t('marketing.inactive')}
              </span>
            </li>
          ))
          )}
        </ul>
      </section>

      <section className={`${adminCardClass} space-y-4`}>
        <h2 className={adminSectionTitleClass}>{t('marketing.campaigns')}</h2>
        <p className="text-sm text-slate-600">{t('marketing.campaignsHint')}</p>
        <form onSubmit={createCampaign} className="mt-4 space-y-3">
          <input
            placeholder={t('marketing.subject')}
            value={campaignForm.subject}
            onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
            className={adminInputClass}
            required
          />
          <select
            value={campaignForm.recipientFilter}
            onChange={(e) => setCampaignForm({ ...campaignForm, recipientFilter: e.target.value })}
            className={adminInputClass}
          >
            <option value="all_students">{t('marketing.recipientsAll')}</option>
            <option value="verified_students">{t('marketing.recipientsVerified')}</option>
            <option value="all_leads">{t('marketing.recipientsLeads')}</option>
          </select>
          <textarea
            rows={6}
            value={campaignForm.bodyHtml}
            onChange={(e) => setCampaignForm({ ...campaignForm, bodyHtml: e.target.value })}
            className={`${adminInputClass} font-mono`}
            required
          />
          <button
            type="submit"
            disabled={busy}
            aria-busy={busy}
            className={`${adminPrimaryBtnClass} w-full sm:w-auto`}
          >
            <LoadingButtonLabel loading={busy} label={t('common.loading')}>
              {t('marketing.saveDraft')}
            </LoadingButtonLabel>
          </button>
        </form>
        {campaigns.length > 0 ? (
          <AdminSearchBar
            value={campaignSearch}
            onChange={setCampaignSearch}
            placeholder={t('marketing.searchCampaigns')}
            className="mt-6"
          />
        ) : null}
        <ul className="mt-6 space-y-3">
          {campaigns.length === 0 ? null : filteredCampaigns.length === 0 ? (
            <li className="text-slate-600">{t('admin.noSearchResults')}</li>
          ) : (
            filteredCampaigns.map((camp) => (
            <li key={camp.id} className="rounded-xl border border-slate-200/80 p-4 text-sm">
              <p className="font-semibold">{camp.subject}</p>
              <p className="text-slate-500">
                {camp.status === 'sent'
                  ? t('marketing.sentStatus')
                  : camp.status === 'sending'
                    ? t('marketing.sending')
                    : t('marketing.draft')}{' '}
                · {camp.sentCount} · {camp.recipientFilter}
              </p>
              {camp.status !== 'sent' && (
                <button
                  type="button"
                  onClick={() => sendCampaign(camp.id)}
                  disabled={busy}
                  aria-busy={busy}
                  className={`${adminPrimaryBtnClass} mt-3 w-full bg-emerald-600 hover:bg-emerald-700 sm:mt-2 sm:w-auto sm:min-w-[7rem]`}
                >
                  <LoadingButtonLabel loading={busy} label={t('common.loading')}>
                    {t('marketing.sendCampaign')}
                  </LoadingButtonLabel>
                </button>
              )}
            </li>
          ))
          )}
        </ul>
      </section>
    </div>
  )
}
