import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { iotApi } from '../../api/iotApi'
import { useCart } from '../../context/CartContext'
import { formatCurrency, mapApiError } from '../../lib/format'
import { IotSampleProject } from '../../types/models'
import { Button } from '../../components/ui/Button'

const IotProjectDetailPage: React.FC = () => {
  const navigate = useNavigate()
  const { slug } = useParams<{ slug: string }>()
  const { addToCart } = useCart()

  const [project, setProject] = useState<IotSampleProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!slug) {
      setError('Slug khong hop le')
      setLoading(false)
      return
    }

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await iotApi.getSampleProjectBySlug(slug)
        setProject(data)
      } catch (err: unknown) {
        setError(mapApiError(err, 'Khong the tai chi tiet du an IoT'))
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [slug])

  const handleAdd = async () => {
    if (!project?.listingId) {
      setError('Du an nay chua map voi san pham de mua')
      return
    }
    setAdding(true)
    try {
      await addToCart(project.listingId, 1)
    } catch (err: unknown) {
      setError(mapApiError(err, 'Khong the them vao gio hang'))
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Dang tai du an IoT...</p>
  }

  if (error || !project) {
    return <p className="text-sm text-red-600">{error || 'Khong tim thay du an IoT'}</p>
  }

  const canBuy = Boolean(project.listingId && project.listingActive && project.stock > 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={() => navigate('/iot?tab=sample')}>
          Quay lai tab San pham mau
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" disabled={!project.listingId} onClick={() => navigate(`/products/${project.listingId}`)}>
            Mo trang san pham
          </Button>
          <Button disabled={!canBuy || adding} onClick={handleAdd}>
            {adding ? 'Dang them...' : 'Them vao gio'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-800">
            {project.imageUrl ? (
              <img src={project.imageUrl} alt={project.title} className="h-full w-full object-cover" />
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{project.title}</h1>
          <p className="mt-2 text-sm text-slate-500">Slug: {project.slug}</p>
          <p className="mt-3 text-slate-700 dark:text-slate-300">{project.summary || project.description}</p>

          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <p><span className="font-semibold">MCU/SoC:</span> {project.mcuSoc || '-'}</p>
            <p><span className="font-semibold">Connectivity:</span> {project.connectivity || '-'}</p>
            <p><span className="font-semibold">Difficulty:</span> {project.difficulty || '-'}</p>
            <p><span className="font-semibold">Build time:</span> {project.buildTime || '-'}</p>
            <p><span className="font-semibold">Gia:</span> {formatCurrency(project.price)}</p>
            <p><span className="font-semibold">Ton kho:</span> {project.stock}</p>
          </div>

          {!project.listingActive ? (
            <p className="mt-4 text-sm text-amber-600">Du an dang o che do tham khao, tam thoi khong ban.</p>
          ) : null}

          <div className="mt-4 rounded-lg border border-slate-200 p-3 text-xs dark:border-slate-700">
            <p>projectPath: {project.projectPath}</p>
            <p>readmePath: {project.readmePath}</p>
            <p>pinoutPath: {project.pinoutPath}</p>
            <p>principlePath: {project.principlePath}</p>
            <p>sourcesPath: {project.sourcesPath}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Main components</h2>
        <ul className="mt-3 grid gap-2 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2">
          {project.mainComponents.map((item) => (
            <li key={item} className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">{item}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default IotProjectDetailPage
