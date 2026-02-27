import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { iotApi } from '../../api/iotApi'
import { useCart } from '../../context/CartContext'
import { formatCurrency, mapApiError } from '../../lib/format'
import { IotSampleProject } from '../../types/models'
import { Button } from '../../components/ui/Button'
import { Cpu, Wifi, Clock, Tag, Package, Box, Lightbulb, Volume2, Activity } from 'lucide-react'

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
    <div className="flex flex-col">
      {/* Hero Banner */}
      <div className="relative h-[300px] w-full sm:h-[400px]">
        {project.imageUrl && (
          <img
            src={project.imageUrl}
            alt={project.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />

        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl drop-shadow-md">
            {project.title}
          </h1>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              className="rounded-full bg-blue-600 px-8 py-2.5 text-sm font-medium text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]"
              disabled={!canBuy || adding}
              onClick={handleAdd}
            >
              {adding ? 'Dang them...' : 'Buy Now'}
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-slate-400 bg-transparent px-8 py-2.5 text-sm font-medium text-white hover:bg-white/10"
              disabled={!project.listingId}
              onClick={() => navigate(`/products/${project.listingId}`)}
            >
              Open Project
            </Button>
          </div>
        </div>

        {/* Back Button Overlay */}
        <div className="absolute left-6 top-6 z-20">
          <Button
            variant="outline"
            className="rounded-full border-blue-500/30 bg-slate-900/60 text-blue-400 backdrop-blur-md hover:bg-slate-800/80 hover:text-blue-300"
            onClick={() => navigate('/iot?tab=sample')}
          >
            ← Quay lai
          </Button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-x-12 gap-y-12 lg:grid-cols-[1.5fr_1fr]">
          {/* Left Column: About & Paths */}
          <div className="flex flex-col gap-10 text-white">
            <section>
              <h2 className="text-2xl font-bold tracking-tight">About</h2>
              <p className="mt-4 leading-relaxed text-slate-300">
                {project.summary || project.description}
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold">File Paths</h3>
              <div className="mt-4 rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 font-mono text-sm leading-relaxed text-slate-300">
                <p>projectPath: {project.projectPath}</p>
                <p>readmePath: {project.readmePath}</p>
                <p>pinoutPath: {project.pinoutPath}</p>
                <p>principlePath: {project.principlePath}</p>
                <p>sourcesPath: {project.sourcesPath}</p>
              </div>
            </section>
          </div>

          {/* Right Column: Specs & Components */}
          <div className="flex flex-col gap-10 text-white">
            <section className="grid gap-6 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Cpu className="h-6 w-6 text-blue-500" />
                <div>
                  <dt className="text-sm font-medium text-slate-400">MCU/SoC:</dt>
                  <dd className="font-medium text-slate-200">{project.mcuSoc || '-'}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Wifi className="h-6 w-6 text-blue-500" />
                <div>
                  <dt className="text-sm font-medium text-slate-400">Connectivity:</dt>
                  <dd className="font-medium text-slate-200">{project.connectivity || '-'}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Activity className="h-6 w-6 text-blue-500" />
                <div>
                  <dt className="text-sm font-medium text-slate-400">Difficulty:</dt>
                  <dd className="font-medium text-slate-200">{project.difficulty || '-'}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-blue-500" />
                <div>
                  <dt className="text-sm font-medium text-slate-400">Build time:</dt>
                  <dd className="font-medium text-slate-200">{project.buildTime || '-'}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Tag className="h-6 w-6 text-blue-500" />
                <div>
                  <dt className="text-sm font-medium text-slate-400">Gia:</dt>
                  <dd className="font-medium text-slate-200">{formatCurrency(project.price)}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Package className="h-6 w-6 text-blue-500" />
                <div>
                  <dt className="text-sm font-medium text-slate-400">Ton kho:</dt>
                  <dd className="font-medium text-slate-200">{project.stock}</dd>
                </div>
              </div>
            </section>

            {!project.listingActive ? (
              <p className="text-sm text-amber-500">Du an dang o che do tham khao, tam thoi khong ban.</p>
            ) : null}

            <section>
              <h2 className="text-2xl font-bold tracking-tight">Main Components</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {project.mainComponents.map((item) => {
                  let Icon = Box
                  if (item.toLowerCase().includes('sensor')) Icon = Activity
                  if (item.toLowerCase().includes('buzzer') || item.toLowerCase().includes('speaker')) Icon = Volume2
                  if (item.toLowerCase().includes('led') || item.toLowerCase().includes('light')) Icon = Lightbulb

                  return (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-slate-900/50 p-4 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-colors hover:border-blue-500/40"
                    >
                      <div className="mt-0.5 rounded-lg bg-blue-950/50 p-2">
                        <Icon className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-200 leading-tight">{item}</p>
                        <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                          Standard IoT component used in this learning module.
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IotProjectDetailPage
