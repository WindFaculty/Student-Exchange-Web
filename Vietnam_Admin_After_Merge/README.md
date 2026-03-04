# Vietnam Administrative Data (Post-2025)

This directory stores the local curated Vietnam administrative dataset used by the project after the two-tier cutover.

## Active dataset
- `data_csv_post_2025/provinces.csv`
- `data_csv_post_2025/wards.csv`

## Policy model
- Effective date: `2025-07-01`
- Total province/city units: `34`
- District level: removed

## Sync notes
- Runtime uses only `data_csv_post_2025/`.
- Backend mirror path: `apps/backend/Vietnam_Admin_After_Merge/data_csv_post_2025/`.
- Deprecated `data_csv/` (legacy 3-level) has been removed from the repo.

## Primary sources
- `https://xaydungchinhsach.chinhphu.vn/chinh-thuc-danh-sach-34-don-vi-hanh-chinh-cap-tinh-cua-viet-nam-sau-sap-nhap-119250630225730658.htm`
- `https://xaydungchinhsach.chinhphu.vn/toan-van-danh-sach-3212-don-vi-hanh-chinh-cap-xa-cua-34-tinh-thanh-sau-sap-nhap-119250701204530324.htm`
