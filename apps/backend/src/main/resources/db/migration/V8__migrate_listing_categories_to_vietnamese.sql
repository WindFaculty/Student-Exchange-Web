-- Migrate old non-diacritic category names to proper Vietnamese with diacritics.
UPDATE listings SET category = 'Đồ dùng học tập' WHERE category = 'Do dung hoc tap';
UPDATE listings SET category = 'Đồ điện tử và công nghệ' WHERE category = 'Do dien tu & cong nghe';
UPDATE listings SET category = 'Quần áo, giày dép, phụ kiện thời trang' WHERE category = 'Quan ao, giay dep, phu kien thoi trang';
UPDATE listings SET category = 'Đồ dùng cá nhân và sinh hoạt' WHERE category = 'Do dung ca nhan & sinh hoat';
UPDATE listings SET category = 'Thuê - cho thuê' WHERE category = 'Thue - cho thue';
UPDATE listings SET category = 'Dịch vụ' WHERE category = 'Dich vu';
UPDATE listings SET category = 'Khác' WHERE category = 'Khac';
