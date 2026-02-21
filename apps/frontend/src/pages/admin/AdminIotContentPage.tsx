import { FormEvent, useEffect, useMemo, useState } from 'react'
import { adminApi } from '../../api/adminApi'
import { IotContent, IotHighlightUpdateRequest } from '../../types/models'
import { mapApiError } from '../../lib/format'
import PageHeader from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Icon from '../../components/ui/Icon'

interface EditableHighlight extends IotHighlightUpdateRequest {
  localId: string
}

interface IotContentFormState {
  heroTitle: string
  heroSubtitle: string
  heroImageUrl: string
  primaryCtaLabel: string
  primaryCtaHref: string
  highlights: EditableHighlight[]
}

const emptyForm: IotContentFormState = {
  heroTitle: '',
  heroSubtitle: '',
  heroImageUrl: '',
  primaryCtaLabel: '',
  primaryCtaHref: '/listings',
  highlights: [],
}

const makeLocalId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

const toEditableHighlights = (content: IotContent): EditableHighlight[] => (
  content.highlights.map((item) => ({
    localId: String(item.id ?? makeLocalId()),
    title: item.title,
    description: item.description,
    icon: item.icon,
    displayOrder: item.displayOrder,
  }))
)

const toFormState = (content: IotContent): IotContentFormState => ({
  heroTitle: content.heroTitle ?? '',
  heroSubtitle: content.heroSubtitle ?? '',
  heroImageUrl: content.heroImageUrl ?? '',
  primaryCtaLabel: content.primaryCtaLabel ?? '',
  primaryCtaHref: content.primaryCtaHref ?? '/listings',
  highlights: toEditableHighlights(content),
})

const AdminIotContentPage = () => {
  const [form, setForm] = useState<IotContentFormState>(emptyForm)
  const [pageLoading, setPageLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const sortedHighlights = useMemo(
    () => [...form.highlights].sort((a, b) => a.displayOrder - b.displayOrder),
    [form.highlights],
  )

  useEffect(() => {
    const load = async () => {
      setPageLoading(true)
      setError('')
      try {
        const content = await adminApi.getIotContent()
        setForm(toFormState(content))
      } catch (err: unknown) {
        setError(mapApiError(err, 'Khong the tai noi dung IoT'))
      } finally {
        setPageLoading(false)
      }
    }

    load()
  }, [])

  const updateHighlight = (localId: string, updates: Partial<EditableHighlight>) => {
    setForm((current) => ({
      ...current,
      highlights: current.highlights.map((item) => (
        item.localId === localId ? { ...item, ...updates } : item
      )),
    }))
  }

  const addHighlight = () => {
    setSuccessMessage('')
    setError('')
    setForm((current) => {
      if (current.highlights.length >= 6) {
        setError('Toi da 6 highlight')
        return current
      }
      const nextOrder = current.highlights.length === 0
        ? 1
        : Math.max(...current.highlights.map((item) => item.displayOrder)) + 1
      return {
        ...current,
        highlights: [
          ...current.highlights,
          {
            localId: makeLocalId(),
            title: '',
            description: '',
            icon: 'memory',
            displayOrder: nextOrder,
          },
        ],
      }
    })
  }

  const removeHighlight = (localId: string) => {
    setSuccessMessage('')
    setForm((current) => ({
      ...current,
      highlights: current.highlights.filter((item) => item.localId !== localId),
    }))
  }

  const moveHighlight = (localId: string, direction: 'up' | 'down') => {
    const ordered = [...sortedHighlights]
    const index = ordered.findIndex((item) => item.localId === localId)
    if (index < 0) return

    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= ordered.length) return

    const currentItem = ordered[index]
    const targetItem = ordered[targetIndex]

    setForm((current) => ({
      ...current,
      highlights: current.highlights.map((item) => {
        if (item.localId === currentItem.localId) {
          return { ...item, displayOrder: targetItem.displayOrder }
        }
        if (item.localId === targetItem.localId) {
          return { ...item, displayOrder: currentItem.displayOrder }
        }
        return item
      }),
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccessMessage('')

    if (!form.heroTitle.trim()) {
      setError('heroTitle la bat buoc')
      return
    }
    if (!form.heroSubtitle.trim()) {
      setError('heroSubtitle la bat buoc')
      return
    }
    if (!form.primaryCtaLabel.trim()) {
      setError('primaryCtaLabel la bat buoc')
      return
    }
    if (!form.primaryCtaHref.trim().startsWith('/')) {
      setError('primaryCtaHref phai bat dau bang /')
      return
    }
    if (form.highlights.length > 6) {
      setError('Toi da 6 highlight')
      return
    }

    const displayOrders = form.highlights.map((item) => item.displayOrder)
    const duplicated = displayOrders.length !== new Set(displayOrders).size
    if (duplicated) {
      setError('displayOrder phai duy nhat')
      return
    }
    if (displayOrders.some((value) => value < 1)) {
      setError('displayOrder phai lon hon 0')
      return
    }

    const payload = {
      heroTitle: form.heroTitle.trim(),
      heroSubtitle: form.heroSubtitle.trim(),
      heroImageUrl: form.heroImageUrl.trim() || undefined,
      primaryCtaLabel: form.primaryCtaLabel.trim(),
      primaryCtaHref: form.primaryCtaHref.trim(),
      highlights: [...form.highlights]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((item) => ({
          title: item.title.trim(),
          description: item.description.trim(),
          icon: item.icon.trim(),
          displayOrder: item.displayOrder,
        })),
    }

    setSaving(true)
    try {
      const updated = await adminApi.updateIotContent(payload)
      setForm(toFormState(updated))
      setSuccessMessage('Da luu noi dung IoT')
    } catch (err: unknown) {
      setError(mapApiError(err, 'Khong the luu noi dung IoT'))
    } finally {
      setSaving(false)
    }
  }

  if (pageLoading) {
    return <p className="text-sm text-slate-500">Dang tai noi dung IoT...</p>
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Noi dung IoT"
        description="Quan ly hero, CTA va highlights cho trang /iot."
        actions={(
          <Button variant="outline" onClick={() => window.open('/iot', '_blank')}>
            Xem trang IoT
          </Button>
        )}
      />

      <Card>
        <CardHeader>
          <CardTitle>Thong tin hero</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Hero title</label>
                <Input
                  value={form.heroTitle}
                  onChange={(event) => setForm((current) => ({ ...current, heroTitle: event.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Hero image URL</label>
                <Input
                  value={form.heroImageUrl}
                  onChange={(event) => setForm((current) => ({ ...current, heroImageUrl: event.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium">Hero subtitle</label>
                <textarea
                  value={form.heroSubtitle}
                  onChange={(event) => setForm((current) => ({ ...current, heroSubtitle: event.target.value }))}
                  className="min-h-24 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Primary CTA label</label>
                <Input
                  value={form.primaryCtaLabel}
                  onChange={(event) => setForm((current) => ({ ...current, primaryCtaLabel: event.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Primary CTA href</label>
                <Input
                  value={form.primaryCtaHref}
                  onChange={(event) => setForm((current) => ({ ...current, primaryCtaHref: event.target.value }))}
                  placeholder="/listings"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Highlights ({form.highlights.length}/6)</h3>
                <Button type="button" size="sm" variant="outline" onClick={addHighlight} disabled={form.highlights.length >= 6}>
                  <Icon name="add" className="text-[18px]" />
                  Them highlight
                </Button>
              </div>

              {sortedHighlights.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700">
                  Chua co highlight. Hay them it nhat 1 muc de trang IoT day du hon.
                </p>
              ) : (
                <div className="space-y-3">
                  {sortedHighlights.map((item, index) => (
                    <div key={item.localId} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold">Highlight #{index + 1}</p>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => moveHighlight(item.localId, 'up')}
                            disabled={index === 0}
                            title="Move up"
                          >
                            <Icon name="arrow_upward" className="text-[18px]" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => moveHighlight(item.localId, 'down')}
                            disabled={index === sortedHighlights.length - 1}
                            title="Move down"
                          >
                            <Icon name="arrow_downward" className="text-[18px]" />
                          </Button>
                          <Button type="button" size="icon" variant="ghost" onClick={() => removeHighlight(item.localId)} title="Remove">
                            <Icon name="delete" className="text-[18px]" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Title</label>
                          <Input
                            value={item.title}
                            onChange={(event) => updateHighlight(item.localId, { title: event.target.value })}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium">Icon</label>
                          <Input
                            value={item.icon}
                            onChange={(event) => updateHighlight(item.localId, { icon: event.target.value })}
                            placeholder="memory"
                          />
                        </div>

                        <div className="space-y-1 md:col-span-2">
                          <label className="text-sm font-medium">Description</label>
                          <textarea
                            value={item.description}
                            onChange={(event) => updateHighlight(item.localId, { description: event.target.value })}
                            className="min-h-20 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                          />
                        </div>

                        <div className="space-y-1 md:max-w-[180px]">
                          <label className="text-sm font-medium">Display order</label>
                          <Input
                            type="number"
                            min={1}
                            value={item.displayOrder}
                            onChange={(event) => updateHighlight(item.localId, { displayOrder: Number(event.target.value) || 1 })}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}

            <div className="flex gap-2">
              <Button type="submit" loading={saving}>
                {saving ? 'Dang luu...' : 'Luu noi dung IoT'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminIotContentPage
