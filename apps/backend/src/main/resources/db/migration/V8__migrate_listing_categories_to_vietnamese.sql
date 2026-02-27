-- Migrate old non-diacritic category names to proper Vietnamese with diacritics
UPDATE listings SET category = N'Đồ dùng học tập'                       WHERE category = 'Do dung hoc tap';
UPDATE listings SET category = N'Đồ điện tử & công nghệ'                WHERE category = 'Do dien tu & cong nghe';
UPDATE listings SET category = N'Quần áo, giày dép, phụ kiện thời trang' WHERE category = 'Quan ao, giay dep, phu kien thoi trang';
UPDATE listings SET category = N'Đồ dùng cá nhân & sinh hoạt'            WHERE category = 'Do dung ca nhan & sinh hoat';
UPDATE listings SET category = N'Thuê - cho thuê'                         WHERE category = 'Thue - cho thue';
UPDATE listings SET category = N'Dịch vụ'                                WHERE category = 'Dich vu';
UPDATE listings SET category = N'Khác'                                    WHERE category = 'Khac';
