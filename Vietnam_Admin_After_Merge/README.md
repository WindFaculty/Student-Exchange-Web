# Vietnam Administrative Data (CSV)

This directory contains the local curated Vietnam administrative dataset used by the project.

## Included files

- `data_csv/provinces.csv`
- `data_csv/districts.csv`
- `data_csv/wards.csv`
- `data_csv/villages.csv`

## Data source and sync info

- Last synced: `2026-03-03`
- Source (districts + wards): `https://raw.githubusercontent.com/VietThan/DanhMucHanhChinh/master/districts.json`
- Source (districts + wards): `https://raw.githubusercontent.com/VietThan/DanhMucHanhChinh/master/wards.json`
- Cross-check reference: `https://provinces.open-api.vn/api/?depth=3`

## Notes

- CSV files are encoded as UTF-8 (without BOM).
- `districts.csv` and `wards.csv` are aligned and synchronized with `apps/backend/Vietnam_Admin_After_Merge/data_csv`.
- Some island districts do not have commune-level rows in source data (for example: Côn Đảo, Hoàng Sa, Bạch Long Vĩ, Lý Sơn, Cồn Cỏ).