import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { adminApi } from '../../api/adminApi'
import { IotSampleProjectRequest } from '../../types/models'
import { mapApiError } from '../../lib/format'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import PageHeader from '../../components/ui/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'

interface FormState {
  slug: string
  title: string
  summary: string
  description: string
  componentsText: string
  difficulty: string
  buildTime: string
  mcuSoc: string
  connectivity: string
  projectPath: string
  readmePath: string
  pinoutPath: string
  principlePath: string
  sourcesPath: string
  price: number
  stock: number
  imageUrl: string
  active: boolean
}

const emptyForm: FormState = {
  slug: '',
  title: '',
  summary: '',
  description: '',
  componentsText: '',
  difficulty: '',
  buildTime: '',
  mcuSoc: '',
  connectivity: '',
  projectPath: '',
  readmePath: '',
  pinoutPath: '',
  principlePath: '',
  sourcesPath: '',
  price: 0,
  stock: 0,
  imageUrl: '',
  active: true,
}

const toPayload = (form: FormState): IotSampleProjectRequest => ({
  slug: form.slug.trim(),
  title: form.title.trim(),
  summary: form.summary.trim() || undefined,
  description: form.description.trim() || undefined,
  mainComponents: form.componentsText
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean),
  difficulty: form.difficulty.trim() || undefined,
  buildTime: form.buildTime.trim() || undefined,
  mcuSoc: form.mcuSoc.trim() || undefined,
  connectivity: form.connectivity.trim() || undefined,
  projectPath: form.projectPath.trim(),
  readmePath: form.readmePath.trim(),
  pinoutPath: form.pinoutPath.trim(),
  principlePath: form.principlePath.trim(),
  sourcesPath: form.sourcesPath.trim(),
  price: form.price,
  stock: form.stock,
  imageUrl: form.imageUrl.trim() || undefined,
  active: form.active,
})

const AdminIotSampleProjectFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = useMemo(() => Boolean(id), [id])

  const [form, setForm] = useState<FormState>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pageLoading, setPageLoading] = useState(isEdit)

  useEffect(() => {
    if (!isEdit || !id) return

    const projectId = Number(id)
    if (!Number.isFinite(projectId)) {
      setError('ID du an khong hop le')
      setPageLoading(false)
      return
    }

    const loadProject = async () => {
      setPageLoading(true)
      setError('')
      try {
        const project = await adminApi.getIotSampleProject(projectId)
        setForm({
          slug: project.slug,
          title: project.title,
          summary: project.summary || '',
          description: project.description || '',
          componentsText: project.mainComponents.join('\n'),
          difficulty: project.difficulty || '',
          buildTime: project.buildTime || '',
          mcuSoc: project.mcuSoc || '',
          connectivity: project.connectivity || '',
          projectPath: project.projectPath,
          readmePath: project.readmePath,
          pinoutPath: project.pinoutPath,
          principlePath: project.principlePath,
          sourcesPath: project.sourcesPath,
          price: project.price,
          stock: project.stock,
          imageUrl: project.imageUrl || '',
          active: project.active,
        })
      } catch (err: unknown) {
        setError(mapApiError(err, 'Khong the tai du an IoT'))
      } finally {
        setPageLoading(false)
      }
    }

    loadProject()
  }, [id, isEdit])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.slug.trim()) {
      setError('Slug la bat buoc')
      return
    }
    if (!form.title.trim()) {
      setError('Tieu de la bat buoc')
      return
    }
    if (form.price <= 0) {
      setError('Gia phai lon hon 0')
      return
    }
    if (form.stock < 0) {
      setError('Ton kho khong hop le')
      return
    }

    const payload = toPayload(form)
    if (payload.mainComponents.length === 0) {
      setError('Can it nhat 1 main component')
      return
    }

    if (!payload.projectPath || !payload.readmePath || !payload.pinoutPath || !payload.principlePath || !payload.sourcesPath) {
      setError('Tat ca cac duong dan tai lieu la bat buoc')
      return
    }

    setLoading(true)
    setError('')
    try {
      if (isEdit && id) {
        await adminApi.updateIotSampleProject(Number(id), payload)
      } else {
        await adminApi.createIotSampleProject(payload)
      }
      navigate('/admin/iot-sample-projects')
    } catch (err: unknown) {
      setError(mapApiError(err, 'Khong the luu du an IoT'))
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return <p className="text-sm text-slate-500">Dang tai du lieu du an IoT...</p>
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={isEdit ? 'Cap nhat IoT sample project' : 'Tao IoT sample project moi'}
        description="Quan ly metadata du an IoT va listing commerce mapping."
        actions={<Button variant="outline" onClick={() => navigate('/admin/iot-sample-projects')}>Quay lai</Button>}
      />

      <Card>
        <CardHeader>
          <CardTitle>Thong tin du an</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Slug</label>
                <Input value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Title</label>
                <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Summary</label>
              <Input value={form.summary} onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))} />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                className="min-h-24 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Difficulty</label>
                <Input value={form.difficulty} onChange={(event) => setForm((current) => ({ ...current, difficulty: event.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Build Time</label>
                <Input value={form.buildTime} onChange={(event) => setForm((current) => ({ ...current, buildTime: event.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">MCU/SoC</label>
                <Input value={form.mcuSoc} onChange={(event) => setForm((current) => ({ ...current, mcuSoc: event.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Connectivity</label>
                <Input value={form.connectivity} onChange={(event) => setForm((current) => ({ ...current, connectivity: event.target.value }))} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Main Components (1 dong/1 item)</label>
              <textarea
                value={form.componentsText}
                onChange={(event) => setForm((current) => ({ ...current, componentsText: event.target.value }))}
                className="min-h-28 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Project Path</label>
                <Input value={form.projectPath} onChange={(event) => setForm((current) => ({ ...current, projectPath: event.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">README Path</label>
                <Input value={form.readmePath} onChange={(event) => setForm((current) => ({ ...current, readmePath: event.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Pinout Path</label>
                <Input value={form.pinoutPath} onChange={(event) => setForm((current) => ({ ...current, pinoutPath: event.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Principle Path</label>
                <Input value={form.principlePath} onChange={(event) => setForm((current) => ({ ...current, principlePath: event.target.value }))} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium">Sources Path</label>
                <Input value={form.sourcesPath} onChange={(event) => setForm((current) => ({ ...current, sourcesPath: event.target.value }))} />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Price</label>
                <Input
                  type="number"
                  min={1}
                  value={form.price}
                  onChange={(event) => setForm((current) => ({ ...current, price: Number(event.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Stock</label>
                <Input
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(event) => setForm((current) => ({ ...current, stock: Number(event.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Image URL</label>
                <Input value={form.imageUrl} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))}
              />
              Kich hoat du an (dong thoi bat/tat listing linked)
            </label>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex gap-2">
              <Button type="submit" loading={loading}>{loading ? 'Dang luu...' : isEdit ? 'Cap nhat du an' : 'Tao du an'}</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/admin/iot-sample-projects')}>Huy</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminIotSampleProjectFormPage
