# Vietnam Administrative Data Post-2025 (2-tier)

- Model: 2-tier local government (`province/city` + `commune/ward`), district level removed.
- Effective date in this dataset: `2025-07-01`.
- Source workbook: `Danh-muc-Phuong-xa_moi.xlsx`.

## Runtime files
- `provinces.csv`: 34 province/city rows
- `wards.csv`: commune/ward rows mapped directly to province

## Notes
- `districts.csv` is intentionally removed in this cutover.
- This folder is mirrored at `apps/backend/Vietnam_Admin_After_Merge/data_csv_post_2025/`.
