'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Loader2, Check, Download, Trash2 } from 'lucide-react'

type Section = 'name' | 'password'

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-charcoal mb-1.5">{label}</label>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const t = useTranslations('Account')
  const { data: session, update } = useSession()

  const [name, setName] = useState(session?.user?.name ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNew, setConfirmNew] = useState('')

  const [loading, setLoading] = useState<Section | null>(null)
  const [success, setSuccess] = useState<Section | null>(null)
  const [errors, setErrors] = useState<Partial<Record<Section, string>>>({})

  const hasPassword = session?.user?.hasPassword ?? true

  // Danger Zone state
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteConfirming, setDeleteConfirming] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  function handleExport() {
    window.location.href = '/api/account/export'
  }

  async function handleDelete() {
    if (!deleteConfirming) {
      setDeleteConfirming(true)
      return
    }
    setDeleteLoading(true)
    setDeleteError('')
    try {
      const body = hasPassword
        ? { password: deletePassword }
        : { confirm: deleteConfirmText }
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      await signOut({ callbackUrl: '/' })
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Something went wrong')
      setDeleteLoading(false)
    }
  }

  async function save(section: Section) {
    setLoading(section)
    setSuccess(null)
    setErrors((prev) => ({ ...prev, [section]: '' }))

    if (section === 'password') {
      if (newPassword !== confirmNew) {
        setErrors((prev) => ({ ...prev, password: t('passwordsMismatch') }))
        setLoading(null)
        return
      }
      if (newPassword.length < 8) {
        setErrors((prev) => ({ ...prev, password: t('passwordMinLength') }))
        setLoading(null)
        return
      }
    }

    const body =
      section === 'name'
        ? { name }
        : { currentPassword, newPassword }

    try {
      const res = await fetch('/api/account/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')

      if (section === 'name') {
        await update({ name })
      } else {
        setCurrentPassword('')
        setNewPassword('')
        setConfirmNew('')
      }
      setSuccess(section)
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [section]: err instanceof Error ? err.message : 'Something went wrong',
      }))
    } finally {
      setLoading(null)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-cream-dark px-3.5 py-2.5 text-sm text-charcoal placeholder:text-warm-gray/60 focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal'

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h2 className="text-xl font-medium text-charcoal">{t('settingsTitle')}</h2>
        <p className="text-sm text-warm-gray mt-1">{session?.user?.email}</p>
      </div>

      {/* Profile section */}
      <section className="rounded-2xl border border-cream-dark p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-warm-gray">
          {t('profileSection')}
        </h3>
        <FieldRow label={t('name')}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder={t('name')}
          />
        </FieldRow>
        <FieldRow label={t('email')}>
          <input
            type="email"
            value={session?.user?.email ?? ''}
            disabled
            className={`${inputClass} bg-cream opacity-70 cursor-not-allowed`}
          />
        </FieldRow>

        {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
        {success === 'name' && (
          <p className="flex items-center gap-1.5 text-xs text-emerald-600">
            <Check size={12} /> {t('settingsSaved')}
          </p>
        )}

        <button
          onClick={() => save('name')}
          disabled={loading === 'name'}
          className="flex items-center gap-2 rounded-xl bg-charcoal px-5 py-2.5 text-sm font-medium text-white hover:bg-charcoal/90 disabled:opacity-50"
        >
          {loading === 'name' && <Loader2 size={14} className="animate-spin" />}
          {t('saveChanges')}
        </button>
      </section>

      {/* Password section */}
      <section className="rounded-2xl border border-cream-dark p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-warm-gray">
          {t('passwordSection')}
        </h3>
        <FieldRow label={t('currentPasswordLabel')}>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClass}
            autoComplete="current-password"
          />
        </FieldRow>
        <FieldRow label={t('newPasswordLabel')}>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
            autoComplete="new-password"
          />
        </FieldRow>
        <FieldRow label={t('confirmPassword')}>
          <input
            type="password"
            value={confirmNew}
            onChange={(e) => setConfirmNew(e.target.value)}
            className={inputClass}
            autoComplete="new-password"
          />
        </FieldRow>

        {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
        {success === 'password' && (
          <p className="flex items-center gap-1.5 text-xs text-emerald-600">
            <Check size={12} /> {t('passwordChanged')}
          </p>
        )}

        <button
          onClick={() => save('password')}
          disabled={loading === 'password'}
          className="flex items-center gap-2 rounded-xl bg-charcoal px-5 py-2.5 text-sm font-medium text-white hover:bg-charcoal/90 disabled:opacity-50"
        >
          {loading === 'password' && <Loader2 size={14} className="animate-spin" />}
          {t('updatePassword')}
        </button>
      </section>

      {/* Danger Zone */}
      <section className="rounded-2xl border border-red-200 p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-red-600">
          {t('dangerZone')}
        </h3>

        {/* Export */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-charcoal">{t('exportData')}</p>
            <p className="text-xs text-warm-gray mt-0.5">{t('exportDataDesc')}</p>
          </div>
          <button
            onClick={handleExport}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-300 px-4 py-2 text-sm text-charcoal hover:bg-gray-50"
          >
            <Download size={14} />
            {t('exportData')}
          </button>
        </div>

        {/* Delete */}
        <div className="flex items-start justify-between gap-4 pt-4 border-t border-red-100">
          <div>
            <p className="text-sm font-medium text-red-700">{t('deleteAccount')}</p>
            <p className="text-xs text-warm-gray mt-0.5">{t('deleteAccountDesc')}</p>
          </div>
          {!deleteConfirming ? (
            <button
              onClick={handleDelete}
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} />
              {t('deleteAccount')}
            </button>
          ) : (
            <div className="flex flex-col gap-2 items-end min-w-0">
              <p className="text-xs text-warm-gray">
                {hasPassword ? t('deleteConfirmPrompt') : 'Type DELETE to confirm:'}
              </p>
              {hasPassword ? (
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className={`${inputClass} max-w-[200px]`}
                  autoComplete="current-password"
                />
              ) : (
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className={`${inputClass} max-w-[200px]`}
                />
              )}
              {deleteError && <p className="text-xs text-red-600">{deleteError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setDeleteConfirming(false)
                    setDeletePassword('')
                    setDeleteConfirmText('')
                    setDeleteError('')
                  }}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteLoading && <Loader2 size={12} className="animate-spin" />}
                  {t('deleteConfirmButton')}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
