import React, { useCallback, useEffect, useRef, useState } from 'react'

interface AvatarCropModalProps {
    imageSrc: string          // raw data URL of selected image
    onConfirm: (croppedDataUrl: string) => void
    onCancel: () => void
}

const CANVAS_SIZE = 320   // visible canvas px
const OUTPUT_SIZE = 512   // exported circle px

/**
 * Lightweight circular avatar cropper.
 * - Drag to pan the image inside the circle
 * - Slider to zoom in / out
 * - Outputs a 512×512 JPEG base64 data URL with circular clip
 */
const AvatarCropModal: React.FC<AvatarCropModalProps> = ({ imageSrc, onConfirm, onCancel }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const imgRef = useRef<HTMLImageElement | null>(null)
    const isDragging = useRef(false)
    const lastPos = useRef({ x: 0, y: 0 })

    // offset = top-left corner of image relative to canvas centre
    const [offset, setOffset] = useState({ x: 0, y: 0 })
    const [scale, setScale] = useState(1)
    const [loaded, setLoaded] = useState(false)

    // ----- load image -----
    useEffect(() => {
        const img = new Image()
        img.onload = () => {
            imgRef.current = img
            // default scale: fill the circle
            const fit = Math.max(CANVAS_SIZE / img.naturalWidth, CANVAS_SIZE / img.naturalHeight)
            setScale(fit)
            setOffset({ x: 0, y: 0 })
            setLoaded(true)
        }
        img.src = imageSrc
    }, [imageSrc])

    // ----- draw -----
    const draw = useCallback(() => {
        const canvas = canvasRef.current
        const img = imgRef.current
        if (!canvas || !img) return
        const ctx = canvas.getContext('2d')!
        const cx = CANVAS_SIZE / 2
        const cy = CANVAS_SIZE / 2
        const r = CANVAS_SIZE / 2

        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

        // dim background
        ctx.fillStyle = 'rgba(0,0,0,0.55)'
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

        // image clipped to circle
        ctx.save()
        ctx.beginPath()
        ctx.arc(cx, cy, r - 2, 0, Math.PI * 2)
        ctx.clip()
        const w = img.naturalWidth * scale
        const h = img.naturalHeight * scale
        ctx.drawImage(img, cx - w / 2 + offset.x, cy - h / 2 + offset.y, w, h)
        ctx.restore()

        // circle border
        ctx.strokeStyle = 'rgba(255,255,255,0.7)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(cx, cy, r - 2, 0, Math.PI * 2)
        ctx.stroke()

        // grid lines inside circle (rule of thirds)
        ctx.save()
        ctx.beginPath()
        ctx.arc(cx, cy, r - 2, 0, Math.PI * 2)
        ctx.clip()
        ctx.strokeStyle = 'rgba(255,255,255,0.12)'
        ctx.lineWidth = 1
        const step = CANVAS_SIZE / 3
        for (let i = 1; i < 3; i++) {
            ctx.beginPath(); ctx.moveTo(i * step, 0); ctx.lineTo(i * step, CANVAS_SIZE); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(0, i * step); ctx.lineTo(CANVAS_SIZE, i * step); ctx.stroke()
        }
        ctx.restore()
    }, [offset, scale])

    useEffect(() => { if (loaded) draw() }, [loaded, draw])

    // ----- drag handlers -----
    const pointerStart = (x: number, y: number) => {
        isDragging.current = true
        lastPos.current = { x, y }
    }
    const pointerMove = (x: number, y: number) => {
        if (!isDragging.current) return
        const dx = x - lastPos.current.x
        const dy = y - lastPos.current.y
        lastPos.current = { x, y }
        setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }))
    }
    const pointerEnd = () => { isDragging.current = false }

    const onMouseDown = (e: React.MouseEvent) => pointerStart(e.clientX, e.clientY)
    const onMouseMove = (e: React.MouseEvent) => pointerMove(e.clientX, e.clientY)
    const onMouseUp = () => pointerEnd()
    const onTouchStart = (e: React.TouchEvent) => { const t = e.touches[0]; pointerStart(t.clientX, t.clientY) }
    const onTouchMove = (e: React.TouchEvent) => { e.preventDefault(); const t = e.touches[0]; pointerMove(t.clientX, t.clientY) }

    // ----- export -----
    const handleConfirm = () => {
        const img = imgRef.current
        if (!img) return
        const out = document.createElement('canvas')
        out.width = OUTPUT_SIZE
        out.height = OUTPUT_SIZE
        const ctx = out.getContext('2d')!
        const ratio = OUTPUT_SIZE / CANVAS_SIZE
        const cx = OUTPUT_SIZE / 2
        const cy = OUTPUT_SIZE / 2
        const r = OUTPUT_SIZE / 2 - 2

        ctx.save()
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.clip()
        const w = img.naturalWidth * scale * ratio
        const h = img.naturalHeight * scale * ratio
        ctx.drawImage(img, cx - w / 2 + offset.x * ratio, cy - h / 2 + offset.y * ratio, w, h)
        ctx.restore()

        onConfirm(out.toDataURL('image/jpeg', 0.88))
    }

    return (
        /* backdrop */
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-sm rounded-2xl border p-6 shadow-2xl
        border-slate-200 bg-white dark:border-white/[0.08] dark:bg-slate-900">

                {/* Title */}
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-primary dark:text-cyan-400">
                    Chỉnh sửa ảnh đại diện
                </p>
                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                    Kéo để căn chỉnh • Dùng thanh kéo để phóng to
                </p>

                {/* Canvas crop area */}
                <div className="flex justify-center mb-4">
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_SIZE}
                        height={CANVAS_SIZE}
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onMouseUp={onMouseUp}
                        onMouseLeave={onMouseUp}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={pointerEnd}
                        className="cursor-grab active:cursor-grabbing rounded-full"
                        style={{ touchAction: 'none', userSelect: 'none' }}
                    />
                </div>

                {/* Zoom slider */}
                <div className="mb-6 flex items-center gap-3">
                    <span className="text-sm">🔍</span>
                    <input
                        type="range"
                        min={0.5}
                        max={4}
                        step={0.01}
                        value={scale}
                        onChange={(e) => setScale(parseFloat(e.target.value))}
                        className="flex-1 accent-primary dark:accent-cyan-400"
                    />
                    <span className="text-sm">🔎</span>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="rounded-xl border px-5 py-2 text-sm font-semibold transition-all
              border-slate-200 text-slate-600 hover:bg-slate-50
              dark:border-white/[0.08] dark:text-slate-400 dark:hover:bg-white/[0.05]"
                    >
                        Huỷ
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="rounded-xl px-5 py-2 text-sm font-bold text-white transition-all
              bg-primary hover:bg-primary/90
              dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-600"
                    >
                        Xác nhận
                    </button>
                </div>

                {/* Close × */}
                <button
                    onClick={onCancel}
                    className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                    ✕
                </button>
            </div>
        </div>
    )
}

export default AvatarCropModal
