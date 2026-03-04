package com.ssg.iot.service.location.source;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
@Order(10)
@RequiredArgsConstructor
@ConditionalOnProperty(value = "vn.location.enable-remote-sources", havingValue = "true")
public class OfficialLocationSourceAdapter implements VnLocationSourceAdapter {

    private final ObjectMapper objectMapper;

    @Value("${vn.location.official.url:}")
    private String officialUrl;

    @Value("${vn.location.http-timeout-seconds:10}")
    private int timeoutSeconds;

    @Override
    public String sourceTag() {
        return "OFFICIAL";
    }

    @Override
    public VnLocationSourceLoadResult load() {
        if (VnLocationSourceUtils.normalize(officialUrl) == null) {
            return VnLocationSourceLoadResult.failure(sourceTag(), "Official source URL is not configured");
        }
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(Math.max(2, timeoutSeconds)))
                    .build();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(officialUrl))
                    .timeout(Duration.ofSeconds(Math.max(2, timeoutSeconds)))
                    .GET()
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return VnLocationSourceLoadResult.failure(sourceTag(), "HTTP " + response.statusCode() + " from official source");
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode provinceNodes = root.isArray() ? root : VnLocationSourceUtils.firstArray(root, "data", "provinces", "items");
            if (provinceNodes == null || !provinceNodes.isArray()) {
                return VnLocationSourceLoadResult.failure(sourceTag(), "Official payload is not in supported JSON format");
            }

            List<VnLocationDataset.ProvinceRecord> provinces = new ArrayList<>();
            List<VnLocationDataset.WardRecord> wards = new ArrayList<>();

            for (JsonNode provinceNode : provinceNodes) {
                String provinceCode = VnLocationSourceUtils.firstCode(provinceNode, "code", "province_code");
                String provinceName = VnLocationSourceUtils.firstText(provinceNode, "name_current", "name", "province_name");
                if (provinceCode == null || provinceName == null) {
                    continue;
                }
                LocalDate provinceDate = VnLocationSourceUtils.firstDate(provinceNode, "effective_date");
                boolean provinceMerged = VnLocationSourceUtils.firstBoolean(provinceNode, false, "is_merged");

                provinces.add(new VnLocationDataset.ProvinceRecord(
                        provinceCode,
                        provinceName,
                        VnLocationSourceUtils.firstText(provinceNode, "name_old"),
                        provinceMerged,
                        provinceDate
                ));

                JsonNode districtNodes = VnLocationSourceUtils.firstArray(provinceNode, "districts");
                if (districtNodes == null) {
                    continue;
                }

                for (JsonNode districtNode : districtNodes) {
                    String districtCode = VnLocationSourceUtils.firstCode(districtNode, "code", "district_code");
                    String districtName = VnLocationSourceUtils.firstText(districtNode, "name_current", "name", "district_name");
                    if (districtCode == null || districtName == null) {
                        continue;
                    }
                    LocalDate districtDate = VnLocationSourceUtils.firstDate(districtNode, "effective_date");
                    boolean districtMerged = VnLocationSourceUtils.firstBoolean(districtNode, false, "is_merged");

                    JsonNode wardNodes = VnLocationSourceUtils.firstArray(districtNode, "wards");
                    if (wardNodes == null) {
                        continue;
                    }
                    for (JsonNode wardNode : wardNodes) {
                        String wardCode = VnLocationSourceUtils.firstCode(wardNode, "code", "ward_code");
                        String wardName = VnLocationSourceUtils.firstText(wardNode, "name_current", "name", "ward_name");
                        if (wardCode == null || wardName == null) {
                            continue;
                        }
                        LocalDate wardDate = VnLocationSourceUtils.firstDate(wardNode, "effective_date");
                        boolean wardMerged = VnLocationSourceUtils.firstBoolean(wardNode, false, "is_merged");

                        wards.add(new VnLocationDataset.WardRecord(
                                wardCode,
                                provinceCode,
                                wardName,
                                VnLocationSourceUtils.firstText(wardNode, "name_old"),
                                wardMerged,
                                wardDate
                        ));
                    }
                }
            }

            return VnLocationSourceLoadResult.success(sourceTag(), new VnLocationDataset(provinces, wards));
        } catch (Exception ex) {
            return VnLocationSourceLoadResult.failure(sourceTag(), "Official source error: " + ex.getMessage());
        }
    }
}
