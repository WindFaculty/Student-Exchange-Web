import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../../api/adminApi'
import { IotSampleProject } from '../../types/models'
import { formatCurrency, mapApiError } from '../../lib/format'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import Icon from '../../components/ui/Icon'
import PageHeader from '../../components/ui/PageHeader'
import FilterToolbar from '../../components/ui/FilterToolbar'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../components/ui/Table'

const PAGE_SIZE = 10
type ActiveFilter = 'ALL' | 'ACTIVE' | 'INACTIVE'

const AdminIotSampleProjectListPage = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState<IotSampleProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('ALL')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await adminApi.getIotSampleProjects({
        search: search || undefined,
        active: activeFilter === 'ALL' ? undefined : activeFilter === 'ACTIVE',
        page,
        size: PAGE_SIZE,
      })
      setRows(response.content)
      setTotalPages(response.totalPages)
    } catch (err: unknown) {
      setError(mapApiError(err, 'Khong the tai danh sach du an IoT'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeFilter])

  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPage(0)
    await loadData()
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Ban co chac muon an du an mau nay?')) return
    try {
      await adminApi.deleteIotSampleProject(id)
      await loadData()
    } catch (err: unknown) {
      setError(mapApiError(err, 'Khong the xoa du an mau'))
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="IoT Sample Projects"
        description="Quan ly 8 du an mau IoT va mapping commerce voi listings."
        actions={(
          <Button onClick={() => navigate('/admin/iot-sample-projects/new')} iconLeft={<Icon name="add" className="text-[18px]" />}>
            Tao du an
          </Button>
        )}
      />

      <FilterToolbar>
        <form className="grid gap-3 md:grid-cols-[1fr_180px_auto]" onSubmit={handleSearchSubmit}>
          <Input
            value={search}
            placeholder="Tim theo ten, slug, mo ta"
            iconLeft={<Icon name="search" className="text-[18px]" />}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
            value={activeFilter}
            onChange={(event) => {
              setActiveFilter(event.target.value as ActiveFilter)
              setPage(0)
            }}
          >
            <option value="ALL">Tat ca trang thai</option>
            <option value="ACTIVE">Dang hoat dong</option>
            <option value="INACTIVE">Da an</option>
          </select>

          <Button type="submit" variant="outline">Ap dung</Button>
        </form>
      </FilterToolbar>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Tieu de</TableHeaderCell>
              <TableHeaderCell>Slug</TableHeaderCell>
              <TableHeaderCell>Listing</TableHeaderCell>
              <TableHeaderCell>Gia</TableHeaderCell>
              <TableHeaderCell>Ton kho</TableHeaderCell>
              <TableHeaderCell>Trang thai</TableHeaderCell>
              <TableHeaderCell className="text-right">Thao tac</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-slate-500">Dang tai du lieu...</TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-slate-500">Khong co du an mau.</TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.title}</TableCell>
                  <TableCell>{row.slug}</TableCell>
                  <TableCell>{row.listingId ?? '-'}</TableCell>
                  <TableCell>{formatCurrency(row.price)}</TableCell>
                  <TableCell>{row.stock}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Badge variant={row.active ? 'success' : 'secondary'}>
                        {row.active ? 'Project ON' : 'Project OFF'}
                      </Badge>
                      <Badge variant={row.listingActive ? 'success' : 'secondary'}>
                        {row.listingActive ? 'Listing ON' : 'Listing OFF'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/admin/iot-sample-projects/${row.id}/edit`)}>
                        Sua
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(row.id)}>
                        An
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" disabled={page <= 0} onClick={() => setPage((current) => current - 1)}>
          Trang truoc
        </Button>
        <span className="text-sm text-slate-500">Trang {page + 1} / {Math.max(totalPages, 1)}</span>
        <Button
          variant="outline"
          disabled={page + 1 >= Math.max(totalPages, 1)}
          onClick={() => setPage((current) => current + 1)}
        >
          Trang sau
        </Button>
      </div>
    </div>
  )
}

export default AdminIotSampleProjectListPage
