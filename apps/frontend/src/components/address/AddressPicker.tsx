import { useEffect, useMemo, useState } from 'react'
import { buildFullVnAddress, locationApi } from '../../api/locationApi'
import { mapApiError } from '../../lib/format'
import { VnProvinceOption, VnWardOption } from '../../types/models'

export interface AddressPickerValue {
  addressLine: string
  provinceCode: string
  wardCode: string
}

export interface AddressPickerResolved {
  provinceName: string
  wardName: string
  fullAddress: string
}

interface AddressPickerProps {
  value: AddressPickerValue
  onChange: (value: AddressPickerValue) => void
  onResolvedChange?: (resolved: AddressPickerResolved) => void
  labelClassName?: string
  fieldClassName?: string
  requiredSelection?: boolean
  requiredAddressLine?: boolean
  disabled?: boolean
}

const defaultFieldClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
const defaultLabelClass =
  'mb-1 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400'
const dropdownClass =
  'absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900'
const dropdownOptionClass =
  'flex w-full items-center px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'

const useDebouncedValue = (value: string, delayMs = 250) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delayMs)
    return () => window.clearTimeout(timeoutId)
  }, [value, delayMs])

  return debouncedValue
}

const normalizeSearchText = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\u0111/g, 'd')
  .replace(/\u0110/g, 'd')
  .toLowerCase()
  .trim()

const prioritizeOptions = <T extends { name: string }>(options: T[], query: string) => {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return options

  const startsWith: T[] = []
  const contains: T[] = []
  const rest: T[] = []

  options.forEach((option) => {
    const normalizedName = normalizeSearchText(option.name)
    if (normalizedName.startsWith(normalizedQuery)) {
      startsWith.push(option)
      return
    }
    if (normalizedName.includes(normalizedQuery)) {
      contains.push(option)
      return
    }
    rest.push(option)
  })

  return [...startsWith, ...contains, ...rest]
}

const AddressPicker = ({
  value,
  onChange,
  onResolvedChange,
  labelClassName = defaultLabelClass,
  fieldClassName = defaultFieldClass,
  requiredSelection = false,
  requiredAddressLine = false,
  disabled = false,
}: AddressPickerProps) => {
  const [provinceInput, setProvinceInput] = useState('')
  const [wardInput, setWardInput] = useState('')

  const [provinceQuery, setProvinceQuery] = useState('')
  const [wardQuery, setWardQuery] = useState('')

  const [provinceOpen, setProvinceOpen] = useState(false)
  const [wardOpen, setWardOpen] = useState(false)

  const [provinces, setProvinces] = useState<VnProvinceOption[]>([])
  const [wards, setWards] = useState<VnWardOption[]>([])

  const [provinceNameMap, setProvinceNameMap] = useState<Record<string, string>>({})
  const [wardNameMap, setWardNameMap] = useState<Record<string, string>>({})

  const [error, setError] = useState('')
  const debouncedProvinceQuery = useDebouncedValue(provinceQuery)
  const debouncedWardQuery = useDebouncedValue(wardQuery)

  const selectedProvinceName = value.provinceCode ? (provinceNameMap[value.provinceCode] ?? '') : ''
  const selectedWardName = value.wardCode ? (wardNameMap[value.wardCode] ?? '') : ''

  useEffect(() => {
    if (!provinceOpen) {
      setProvinceInput(selectedProvinceName)
      setProvinceQuery('')
    }
  }, [provinceOpen, selectedProvinceName])

  useEffect(() => {
    if (!wardOpen) {
      setWardInput(selectedWardName)
      setWardQuery('')
    }
  }, [wardOpen, selectedWardName])

  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        const data = await locationApi.getProvinces(debouncedProvinceQuery)
        if (!mounted) return
        setProvinces(data)
        setProvinceNameMap((prev) => {
          const next = { ...prev }
          data.forEach((item) => { next[item.code] = item.name })
          return next
        })
        setError('')
      } catch (err: unknown) {
        if (!mounted) return
        setError(mapApiError(err, 'Khong the tai danh sach tinh/thanh'))
      }
    }
    run()
    return () => { mounted = false }
  }, [debouncedProvinceQuery])

  useEffect(() => {
    if (!value.provinceCode) {
      setWards([])
      setWardOpen(false)
      setWardInput('')
      setWardQuery('')
      return
    }
    let mounted = true
    const run = async () => {
      try {
        const data = await locationApi.getWards(value.provinceCode, debouncedWardQuery)
        if (!mounted) return
        setWards(data)
        setWardNameMap((prev) => {
          const next = { ...prev }
          data.forEach((item) => { next[item.code] = item.name })
          return next
        })
        setError('')
      } catch (err: unknown) {
        if (!mounted) return
        setError(mapApiError(err, 'Khong the tai danh sach xa/phuong'))
      }
    }
    run()
    return () => { mounted = false }
  }, [value.provinceCode, debouncedWardQuery])

  const prioritizedProvinces = useMemo(
    () => prioritizeOptions(provinces, provinceQuery),
    [provinces, provinceQuery],
  )
  const prioritizedWards = useMemo(
    () => prioritizeOptions(wards, wardQuery),
    [wards, wardQuery],
  )

  const resolved = useMemo<AddressPickerResolved>(() => {
    const provinceName = provinceNameMap[value.provinceCode] || ''
    const wardName = wardNameMap[value.wardCode] || ''
    return {
      provinceName,
      wardName,
      fullAddress: buildFullVnAddress(value.addressLine, wardName, provinceName),
    }
  }, [value.addressLine, value.provinceCode, value.wardCode, provinceNameMap, wardNameMap])

  useEffect(() => {
    onResolvedChange?.(resolved)
  }, [onResolvedChange, resolved])

  const handleProvinceChange = (provinceCode: string) => {
    onChange({
      ...value,
      provinceCode,
      wardCode: '',
    })
    setProvinceOpen(false)
    setWardOpen(false)
    setWardInput('')
    setWardQuery('')
  }

  const closeProvinceCombobox = () => {
    setProvinceOpen(false)
    setProvinceInput(selectedProvinceName)
    setProvinceQuery('')
  }

  const closeWardCombobox = () => {
    setWardOpen(false)
    setWardInput(selectedWardName)
    setWardQuery('')
  }

  return (
    <div className="space-y-3">
      <div>
        <label className={labelClassName}>So nha, ten duong</label>
        <input
          className={fieldClassName}
          value={value.addressLine}
          required={requiredAddressLine}
          onChange={(event) => onChange({ ...value, addressLine: event.target.value })}
          disabled={disabled}
          placeholder="Vi du: 123 Duong Le Loi"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className={labelClassName}>Tinh / Thanh pho{requiredSelection ? ' *' : ''}</label>
          <div className="relative">
            <input
              className={`${fieldClassName} pr-8`}
              value={provinceInput}
              onFocus={() => setProvinceOpen(true)}
              onBlur={closeProvinceCombobox}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault()
                  closeProvinceCombobox()
                  return
                }
                if (event.key === 'ArrowDown') {
                  event.preventDefault()
                  setProvinceOpen(true)
                  return
                }
                if (event.key === 'Enter' && provinceOpen && prioritizedProvinces.length > 0) {
                  event.preventDefault()
                  const firstOption = prioritizedProvinces[0]
                  setProvinceNameMap((prev) => ({ ...prev, [firstOption.code]: firstOption.name }))
                  setProvinceInput(firstOption.name)
                  handleProvinceChange(firstOption.code)
                }
              }}
              onChange={(event) => {
                const nextValue = event.target.value
                setProvinceInput(nextValue)
                setProvinceQuery(nextValue)
                setProvinceOpen(true)
              }}
              placeholder="Nhap de tim tinh/thanh"
              disabled={disabled}
              aria-required={requiredSelection}
              autoComplete="off"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">
              v
            </span>
            {provinceOpen && !disabled ? (
              <ul className={dropdownClass}>
                {value.provinceCode ? (
                  <li>
                    <button
                      type="button"
                      tabIndex={-1}
                      className={`${dropdownOptionClass} text-slate-500 italic dark:text-slate-400`}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setProvinceInput('')
                        setWardInput('')
                        setWardQuery('')
                        onChange({ ...value, provinceCode: '', wardCode: '' })
                        setProvinceOpen(false)
                      }}
                    >
                      Bo chon tinh/thanh
                    </button>
                  </li>
                ) : null}
                {prioritizedProvinces.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                    Khong tim thay tinh/thanh phu hop
                  </li>
                ) : prioritizedProvinces.map((province) => (
                  <li key={province.code}>
                    <button
                      type="button"
                      tabIndex={-1}
                      className={[
                        dropdownOptionClass,
                        province.code === value.provinceCode
                          ? 'bg-primary/10 text-primary dark:bg-cyan-500/15 dark:text-cyan-300'
                          : '',
                      ].join(' ')}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setProvinceNameMap((prev) => ({ ...prev, [province.code]: province.name }))
                        setProvinceInput(province.name)
                        handleProvinceChange(province.code)
                      }}
                    >
                      {province.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelClassName}>Xa / Phuong{requiredSelection ? ' *' : ''}</label>
          <div className="relative">
            <input
              className={`${fieldClassName} pr-8`}
              value={wardInput}
              onFocus={() => setWardOpen(true)}
              onBlur={closeWardCombobox}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault()
                  closeWardCombobox()
                  return
                }
                if (event.key === 'ArrowDown') {
                  event.preventDefault()
                  setWardOpen(true)
                  return
                }
                if (event.key === 'Enter' && wardOpen && prioritizedWards.length > 0) {
                  event.preventDefault()
                  const firstOption = prioritizedWards[0]
                  setWardNameMap((prev) => ({ ...prev, [firstOption.code]: firstOption.name }))
                  setWardInput(firstOption.name)
                  onChange({ ...value, wardCode: firstOption.code })
                  setWardOpen(false)
                }
              }}
              onChange={(event) => {
                const nextValue = event.target.value
                setWardInput(nextValue)
                setWardQuery(nextValue)
                setWardOpen(true)
              }}
              placeholder="Nhap de tim xa/phuong"
              disabled={disabled || !value.provinceCode}
              aria-required={requiredSelection}
              autoComplete="off"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">
              v
            </span>
            {wardOpen && !disabled && value.provinceCode ? (
              <ul className={dropdownClass}>
                {value.wardCode ? (
                  <li>
                    <button
                      type="button"
                      tabIndex={-1}
                      className={`${dropdownOptionClass} text-slate-500 italic dark:text-slate-400`}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setWardInput('')
                        onChange({ ...value, wardCode: '' })
                        setWardOpen(false)
                      }}
                    >
                      Bo chon xa/phuong
                    </button>
                  </li>
                ) : null}
                {prioritizedWards.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                    Khong tim thay xa/phuong phu hop
                  </li>
                ) : prioritizedWards.map((ward) => (
                  <li key={ward.code}>
                    <button
                      type="button"
                      tabIndex={-1}
                      className={[
                        dropdownOptionClass,
                        ward.code === value.wardCode
                          ? 'bg-primary/10 text-primary dark:bg-cyan-500/15 dark:text-cyan-300'
                          : '',
                      ].join(' ')}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setWardNameMap((prev) => ({ ...prev, [ward.code]: ward.name }))
                        setWardInput(ward.name)
                        onChange({ ...value, wardCode: ward.code })
                        setWardOpen(false)
                      }}
                    >
                      {ward.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>

      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  )
}

export default AddressPicker
