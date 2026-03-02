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
@Order(30)
public class LocalCuratedLocationSourceAdapter implements VnLocationSourceAdapter {

    @Value("${vn.location.local-curated.base-path:Vietnam_Admin_After_Merge/data_csv}")
    private String basePath;

    @Override
    public String sourceTag() {
        return "LOCAL_CURATED";
    }

    @Override
    public VnLocationSourceLoadResult load() {
        try {
            Path base = Path.of(basePath);
            Path provincesPath = base.resolve("provinces.csv");
            Path districtsPath = base.resolve("districts.csv");
            Path wardsPath = base.resolve("wards.csv");

            if (!Files.exists(provincesPath) || !Files.exists(districtsPath) || !Files.exists(wardsPath)) {
                return VnLocationSourceLoadResult.failure(sourceTag(), "Local curated CSV files are missing under " + basePath);
            }

            List<Map<String, String>> provinceRows = readCsv(provincesPath);
            List<Map<String, String>> districtRows = readCsv(districtsPath);
            List<Map<String, String>> wardRows = readCsv(wardsPath);

            List<VnLocationDataset.ProvinceRecord> provinces = new ArrayList<>();
            Map<String, String> provinceIdToCode = new HashMap<>();
            Map<String, LocalDate> provinceCodeToEffectiveDate = new HashMap<>();

            for (Map<String, String> row : provinceRows) {
                String provinceId = normalize(row.get("id"));
                String provinceCode = normalize(row.get("code"));
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

            List<VnLocationDataset.DistrictRecord> districts = new ArrayList<>();
            Map<String, String> districtIdToCode = new HashMap<>();
            Map<String, String> districtIdToProvinceCode = new HashMap<>();

            for (Map<String, String> row : districtRows) {
                String districtId = normalize(row.get("id"));
                String provinceId = normalize(row.get("province_id"));
                String provinceCode = provinceIdToCode.get(provinceId);
                String districtName = normalize(row.get("name_current"));
                if (provinceCode == null || districtName == null) {
                    continue;
                }

                String districtCode = resolveDistrictCode(provinceCode, districtId, row.get("code"));
                if (districtCode == null) {
                    continue;
                }

                districts.add(new VnLocationDataset.DistrictRecord(
                        districtCode,
                        provinceCode,
                        districtName,
                        normalize(row.get("name_old")),
                        parseBoolean(row.get("is_merged")),
                        provinceCodeToEffectiveDate.get(provinceCode)
                ));

                if (districtId != null) {
                    districtIdToCode.put(districtId, districtCode);
                    districtIdToProvinceCode.put(districtId, provinceCode);
                }
            }

            List<VnLocationDataset.WardRecord> wards = new ArrayList<>();
            for (Map<String, String> row : wardRows) {
                String wardId = normalize(row.get("id"));
                String districtId = normalize(row.get("district_id"));
                String districtCode = districtIdToCode.get(districtId);
                String provinceCode = districtIdToProvinceCode.get(districtId);
                String wardName = normalize(row.get("name_current"));
                if (districtCode == null || provinceCode == null || wardName == null) {
                    continue;
                }

                String wardCode = resolveWardCode(districtCode, wardId, row.get("code"));
                if (wardCode == null) {
                    continue;
                }

                wards.add(new VnLocationDataset.WardRecord(
                        wardCode,
                        districtCode,
                        provinceCode,
                        wardName,
                        normalize(row.get("name_old")),
                        parseBoolean(row.get("is_merged")),
                        provinceCodeToEffectiveDate.get(provinceCode)
                ));
            }

            return VnLocationSourceLoadResult.success(sourceTag(), new VnLocationDataset(provinces, districts, wards));
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

    private String resolveDistrictCode(String provinceCode, String districtId, String providedCode) {
        String normalizedCode = normalize(providedCode);
        if (normalizedCode != null) {
            return normalizedCode;
        }
        Integer id = parseInteger(districtId);
        if (id == null) {
            return null;
        }
        return provinceCode + String.format("%03d", id);
    }

    private String resolveWardCode(String districtCode, String wardId, String providedCode) {
        String normalizedCode = normalize(providedCode);
        if (normalizedCode != null) {
            return normalizedCode;
        }
        Integer id = parseInteger(wardId);
        if (id == null) {
            return null;
        }
        return districtCode + String.format("%03d", id);
    }

    private Integer parseInteger(String value) {
        String normalized = normalize(value);
        if (normalized == null) {
            return null;
        }
        try {
            return Integer.parseInt(normalized);
        } catch (NumberFormatException ignored) {
            return null;
        }
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
}
