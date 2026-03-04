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
import java.util.ArrayList;
import java.util.List;

@Component
@Order(20)
@RequiredArgsConstructor
@ConditionalOnProperty(value = "vn.location.enable-remote-sources", havingValue = "true")
public class FallbackOpenApiLocationSourceAdapter implements VnLocationSourceAdapter {

    private final ObjectMapper objectMapper;

    @Value("${vn.location.fallback.url:https://provinces.open-api.vn/api/?depth=3}")
    private String fallbackUrl;

    @Value("${vn.location.http-timeout-seconds:10}")
    private int timeoutSeconds;

    @Override
    public String sourceTag() {
        return "FALLBACK_OPEN_API";
    }

    @Override
    public VnLocationSourceLoadResult load() {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(Math.max(2, timeoutSeconds)))
                    .build();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(fallbackUrl))
                    .timeout(Duration.ofSeconds(Math.max(2, timeoutSeconds)))
                    .GET()
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return VnLocationSourceLoadResult.failure(sourceTag(), "HTTP " + response.statusCode() + " from fallback source");
            }

            JsonNode root = objectMapper.readTree(response.body());
            if (!root.isArray()) {
                return VnLocationSourceLoadResult.failure(sourceTag(), "Fallback payload is not an array");
            }

            List<VnLocationDataset.ProvinceRecord> provinces = new ArrayList<>();
            List<VnLocationDataset.WardRecord> wards = new ArrayList<>();

            for (JsonNode provinceNode : root) {
                String provinceCode = VnLocationSourceUtils.firstCode(provinceNode, "code");
                String provinceName = VnLocationSourceUtils.firstText(provinceNode, "name", "name_current");
                if (provinceCode == null || provinceName == null) {
                    continue;
                }

                provinces.add(new VnLocationDataset.ProvinceRecord(
                        provinceCode,
                        provinceName,
                        VnLocationSourceUtils.firstText(provinceNode, "name_old"),
                        false,
                        null
                ));

                JsonNode districtNodes = VnLocationSourceUtils.firstArray(provinceNode, "districts");
                if (districtNodes == null) {
                    continue;
                }

                for (JsonNode districtNode : districtNodes) {
                    String districtCode = VnLocationSourceUtils.firstCode(districtNode, "code");
                    String districtName = VnLocationSourceUtils.firstText(districtNode, "name", "name_current");
                    if (districtCode == null || districtName == null) {
                        continue;
                    }
                    JsonNode wardNodes = VnLocationSourceUtils.firstArray(districtNode, "wards");
                    if (wardNodes == null) {
                        continue;
                    }
                    for (JsonNode wardNode : wardNodes) {
                        String wardCode = VnLocationSourceUtils.firstCode(wardNode, "code");
                        String wardName = VnLocationSourceUtils.firstText(wardNode, "name", "name_current");
                        if (wardCode == null || wardName == null) {
                            continue;
                        }
                        wards.add(new VnLocationDataset.WardRecord(
                                wardCode,
                                provinceCode,
                                wardName,
                                VnLocationSourceUtils.firstText(wardNode, "name_old"),
                                false,
                                null
                        ));
                    }
                }
            }

            return VnLocationSourceLoadResult.success(sourceTag(), new VnLocationDataset(provinces, wards));
        } catch (Exception ex) {
            return VnLocationSourceLoadResult.failure(sourceTag(), "Fallback source error: " + ex.getMessage());
        }
    }
}
