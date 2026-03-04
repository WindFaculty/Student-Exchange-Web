package com.ssg.iot.service.location.source;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;

@Component
@Order(10)
public class LocalCuratedLocationSourceAdapter implements VnLocationSourceAdapter {

    @Value("${vn.location.local-curated.base-path:Vietnam_Admin_After_Merge/data_csv_post_2025}")
    private String basePath;

    @Override
    public String sourceTag() {
        return "LOCAL_CURATED_POST_2025";
    }

    @Override
    public VnLocationSourceLoadResult load() {
        try {
            Path base = Path.of(basePath);
            Path provincesPath = base.resolve("provinces.csv");
            Path wardsPath = base.resolve("wards.csv");

            if (!Files.exists(provincesPath) || !Files.exists(wardsPath)) {
                return VnLocationSourceLoadResult.failure(sourceTag(), "Local curated CSV files are missing under " + basePath);
            }

            List<Map<String, String>> provinceRows = readCsv(provincesPath);
            List<Map<String, String>> wardRows = readCsv(wardsPath);

            List<VnLocationDataset.ProvinceRecord> provinces = new ArrayList<>();
            Map<String, String> provinceIdToCode = new HashMap<>();
            Map<String, LocalDate> provinceCodeToEffectiveDate = new HashMap<>();

            for (Map<String, String> row : provinceRows) {
                String provinceId = normalize(row.get("id"));
                String provinceCode = firstNonNull(
                        normalize(row.get("code_bnv")),
                        normalize(row.get("code"))
                );
                String provinceName = normalize(row.get("name_current"));
                if (provinceCode == null || provinceName == null) {
                    continue;
                }

                LocalDate effectiveDate = parseDate(row.get("effective_date"));
                boolean merged = parseBoolean(row.get("is_merged"));
                provinces.add(new VnLocationDataset.ProvinceRecord(
                        provinceCode,
                        provinceName,
                        normalize(row.get("name_old")),
                        merged,
                        effectiveDate
                ));

                if (provinceId != null) {
                    provinceIdToCode.put(provinceId, provinceCode);
                }
                provinceCodeToEffectiveDate.put(provinceCode, effectiveDate);
            }

            List<VnLocationDataset.WardRecord> wards = new ArrayList<>();
            for (Map<String, String> row : wardRows) {
                String provinceCode = firstNonNull(
                        normalize(row.get("province_code_bnv")),
                        normalize(row.get("province_code")),
                        provinceIdToCode.get(normalize(row.get("province_id")))
                );
                String wardCode = firstNonNull(
                        normalize(row.get("code")),
                        normalize(row.get("ward_code"))
                );
                String wardName = normalize(row.get("name_current"));
                if (provinceCode == null || wardCode == null || wardName == null) {
                    continue;
                }

                wards.add(new VnLocationDataset.WardRecord(
                        wardCode,
                        provinceCode,
                        wardName,
                        normalize(row.get("name_old")),
                        parseBoolean(row.get("is_merged")),
                        firstNonNullDate(parseDate(row.get("effective_date")), provinceCodeToEffectiveDate.get(provinceCode))
                ));
            }

            return VnLocationSourceLoadResult.success(sourceTag(), new VnLocationDataset(provinces, wards));
        } catch (Exception ex) {
            return VnLocationSourceLoadResult.failure(sourceTag(), "Local curated source error: " + ex.getMessage());
        }
    }

    private List<Map<String, String>> readCsv(Path path) throws IOException {
        List<String> lines = Files.readAllLines(path, StandardCharsets.UTF_8);
        if (lines.isEmpty()) {
            return List.of();
        }

        List<String> headers = parseCsvLine(lines.get(0));
        if (!headers.isEmpty()) {
            headers.set(0, stripBom(headers.get(0)));
        }

        List<Map<String, String>> rows = new ArrayList<>();
        for (int i = 1; i < lines.size(); i++) {
            String line = lines.get(i);
            if (line == null || line.isBlank()) {
                continue;
            }

            List<String> values = parseCsvLine(line);
            Map<String, String> row = new HashMap<>();
            for (int col = 0; col < headers.size(); col++) {
                String header = headers.get(col);
                String value = col < values.size() ? values.get(col) : "";
                row.put(header, value);
            }
            rows.add(row);
        }
        return rows;
    }

    private List<String> parseCsvLine(String line) {
        List<String> values = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuote = false;
        for (int i = 0; i < line.length(); i++) {
            char ch = line.charAt(i);
            if (ch == '"') {
                if (inQuote && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    current.append('"');
                    i++;
                    continue;
                }
                inQuote = !inQuote;
                continue;
            }
            if (ch == ',' && !inQuote) {
                values.add(current.toString());
                current.setLength(0);
                continue;
            }
            current.append(ch);
        }
        values.add(current.toString());
        return values;
    }

    private String stripBom(String value) {
        if (value == null) {
            return null;
        }
        return value.replace("\uFEFF", "");
    }

    private LocalDate parseDate(String value) {
        String normalized = normalize(value);
        if (normalized == null) {
            return null;
        }
        try {
            return LocalDate.parse(normalized);
        } catch (DateTimeParseException ignored) {
            return null;
        }
    }

    private boolean parseBoolean(String value) {
        String normalized = normalize(value);
        if (normalized == null) {
            return false;
        }
        return "true".equalsIgnoreCase(normalized)
                || "1".equals(normalized)
                || "yes".equalsIgnoreCase(normalized);
    }

    private String normalize(String value) {
        return VnLocationSourceUtils.normalize(value);
    }

    private String firstNonNull(String... values) {
        if (values == null) {
            return null;
        }
        for (String value : values) {
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    private LocalDate firstNonNullDate(LocalDate... values) {
        if (values == null) {
            return null;
        }
        for (LocalDate value : values) {
            if (value != null) {
                return value;
            }
        }
        return null;
    }
}
