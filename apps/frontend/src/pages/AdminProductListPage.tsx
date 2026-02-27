import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../api/adminApi'
import { Listing } from '../types/models'
import { formatCategoryLabel, formatCurrency, mapApiError } from '../lib/format'
import { ADMIN_LISTING_CATEGORIES } from '../lib/listingCategories'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import Icon from '../components/ui/Icon'
import PageHeader from '../components/ui/PageHeader'
import FilterToolbar from '../components/ui/FilterToolbar'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../components/ui/Table'

const PAGE_SIZE = 10
type ActiveFilter = 'ALL' | 'ACTIVE' | 'INACTIVE'

const categoryOptions = ADMIN_LISTING_CATEGORIES

const AdminProductListPage = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('ALL')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('ALL')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await adminApi.getListings({
        search: search || undefined,
        categoryCode: category === 'ALL' ? undefined : category,
        active: activeFilter === 'ALL' ? undefined : activeFilter === 'ACTIVE',
        page,
        size: PAGE_SIZE,
      })
      setRows(response.content)
      setTotalPages(response.totalPages)
    } catch (err: unknown) {
      setError(mapApiError(err, 'Không thể tải danh sách bài đăng'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, category, activeFilter])

  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPage(0)
    await loadData()
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài đăng này?')) return
    try {
      await adminApi.deleteListing(id)
      await loadData()
    } catch (err: unknown) {
      setError(mapApiError(err, 'Xóa bài đăng thất bại'))
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Quản lý bài đăng"
        description="Tìm kiếm, lọc và cập nhật tất cả bài đăng trong hệ thống."
        actions={(
          <Button onClick={() => navigate('/admin/listings/new')} iconLeft={<Icon name="add" className="text-[18px]" />}>
            Tạo bài đăng
          </Button>
        )}
      />

      <FilterToolbar>
        <form className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto]" onSubmit={handleSearchSubmit}>
          <Input
            value={search}
            placeholder="Tìm theo tiêu đề hoặc chủ bài đăng"
            iconLeft={<Icon name="search" className="text-[18px]" />}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value)
              setPage(0)
            }}
          >
            <option value="ALL">Tất cả danh mục</option>
            {categoryOptions.map((item) => (
              <option key={item.code} value={item.code}>{item.label}</option>
            ))}
          </select>

          <select
            className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
            value={activeFilter}
            onChange={(event) => {
              setActiveFilter(event.target.value as ActiveFilter)
              setPage(0)
            }}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Đã ẩn</option>
          </select>

          <Button type="submit" variant="outline">Áp dụng</Button>
        </form>
      </FilterToolbar>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Tiêu đề</TableHeaderCell>
              <TableHeaderCell>Danh mục</TableHeaderCell>
              <TableHeaderCell>Chủ sở hữu</TableHeaderCell>
              <TableHeaderCell>Giá</TableHeaderCell>
              <TableHeaderCell>Tồn kho</TableHeaderCell>
              <TableHeaderCell>Trạng thái</TableHeaderCell>
              <TableHeaderCell className="text-right">Thao tác</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-slate-500">Đang tải dữ liệu...</TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-slate-500">Không có bài đăng phù hợp.</TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.title}</TableCell>
                  <TableCell>{formatCategoryLabel(row.category)}</TableCell>
                  <TableCell>{row.ownerName}</TableCell>
                  <TableCell>{formatCurrency(row.price)}</TableCell>
                  <TableCell>{row.stock}</TableCell>
                  <TableCell>
                    <Badge variant={row.active ? 'success' : 'secondary'}>
                      {row.active ? 'Đang hoạt động' : 'Đã ẩn'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/admin/listings/${row.id}/edit`)}>
                        Sửa
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(row.id)}>
                        Xóa
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
          Trang trước
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

export default AdminProductListPage
