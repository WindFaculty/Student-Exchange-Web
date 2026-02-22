-- Update IoT highlights to match new category naming
UPDATE ih
SET
    title = CASE ih.display_order
        WHEN 1 THEN 'Linh kien'
        WHEN 2 THEN 'San pham mau'
        WHEN 3 THEN 'Dich vu'
        ELSE ih.title
    END,
    description = CASE ih.display_order
        WHEN 1 THEN 'Danh muc linh kien IoT cho hoc tap va du an.'
        WHEN 2 THEN 'San pham mau de tham khao va trien khai nhanh.'
        WHEN 3 THEN 'Cac dich vu ho tro tu van, lap dat va bao tri.'
        ELSE ih.description
    END,
    updated_at = CURRENT_TIMESTAMP
FROM iot_highlights ih
JOIN iot_page_contents ipc ON ipc.id = ih.page_content_id
WHERE ipc.active = 1
  AND ih.active = 1
  AND ih.display_order IN (1, 2, 3);
