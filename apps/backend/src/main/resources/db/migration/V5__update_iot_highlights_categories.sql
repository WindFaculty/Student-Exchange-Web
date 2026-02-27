-- Update IoT highlights to match new category naming
UPDATE iot_highlights
SET
    title = CASE display_order
        WHEN 1 THEN 'Linh kien'
        WHEN 2 THEN 'San pham mau'
        WHEN 3 THEN 'Dich vu'
        ELSE title
    END,
    description = CASE display_order
        WHEN 1 THEN 'Danh muc linh kien IoT cho hoc tap va du an.'
        WHEN 2 THEN 'San pham mau de tham khao va trien khai nhanh.'
        WHEN 3 THEN 'Cac dich vu ho tro tu van, lap dat va bao tri.'
        ELSE description
    END,
    updated_at = CURRENT_TIMESTAMP
WHERE active = 1
  AND display_order IN (1, 2, 3)
  AND page_content_id IN (
      SELECT id
      FROM iot_page_contents
      WHERE active = 1
  );
