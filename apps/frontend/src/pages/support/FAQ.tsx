import { useEffect, useMemo, useState } from 'react'
import { supportApi } from '../../api/supportApi'
import { FAQItem } from '../../types/models'
import { mapApiError } from '../../lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import PageHeader from '../../components/ui/PageHeader'
import Icon from '../../components/ui/Icon'

const FAQ = () => {
  const [items, setItems] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('ALL')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const categories = useMemo(() => {
    const distinct = Array.from(new Set(items.map((item) => item.category)))
    return ['ALL', ...distinct]
  }, [items])

  const loadFaqs = async (nextCategory = category, nextSearch = search) => {
    setLoading(true)
    setError('')
    try {
      const response = await supportApi.getFaqs({
        category: nextCategory === 'ALL' ? undefined : nextCategory,
        search: nextSearch || undefined,
      })
      setItems(response)
      setExpandedId(null)
    } catch (err: unknown) {
      setError(mapApiError(err, 'Không thể tải danh sách FAQ'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFaqs('ALL', '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-5">
      <PageHeader title="Câu hỏi thường gặp" description="Tìm nhanh câu trả lời cho các vấn đề phổ biến." />

      <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
        <Input
          value={search}
          placeholder="Tìm trong FAQ"
          iconLeft={<Icon name="search" className="text-[18px]" />}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          {categories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <Button variant="outline" onClick={() => loadFaqs(category, search)}>Áp dụng</Button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-slate-500">Đang tải FAQ...</p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-sm text-slate-500">Không tìm thấy FAQ phù hợp.</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="cursor-pointer" onClick={() => setExpandedId((current) => current === item.id ? null : item.id)}>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base">{item.question}</CardTitle>
                  <span className="text-xs text-slate-500">{item.category}</span>
                </div>
              </CardHeader>
              {expandedId === item.id ? (
                <CardContent>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{item.answer}</p>
                </CardContent>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default FAQ
