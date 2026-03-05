package com.ssg.iot.service.agentic;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssg.iot.common.ApiException;
import com.ssg.iot.dto.agentic.AgenticTaskCancelResponse;
import com.ssg.iot.dto.agentic.AgenticTaskStatusResponse;
import com.ssg.iot.dto.agentic.AgenticTaskSubmitRequest;
import com.ssg.iot.dto.agentic.AgenticTaskSubmitResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AgenticGatewayService {

    private static final String INTERNAL_TOKEN_HEADER = "X-Internal-Token";

    private final ObjectMapper objectMapper;

    @Value("${agentic.enabled:false}")
    private boolean agenticEnabled;

    @Value("${agentic.sidecar.base-url:http://127.0.0.1:18082}")
    private String sidecarBaseUrl;

    @Value("${agentic.sidecar.connect-timeout-ms:2000}")
    private int connectTimeoutMs;

    @Value("${agentic.sidecar.read-timeout-ms:15000}")
    private int readTimeoutMs;

    @Value("${agentic.internal.token:}")
    private String internalToken;

    public AgenticTaskSubmitResponse submitTask(AgenticTaskSubmitRequest request) {
        ensureEnabled();
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("task_type", normalizeTaskType(request.getTaskType()));
        payload.put("objective", request.getObjective());
        if (request.getWorkflowId() != null && !request.getWorkflowId().isBlank()) {
            payload.put("workflow_id", request.getWorkflowId());
        }
        if (request.getContext() != null) {
            payload.put("context", request.getContext());
        } else {
            payload.put("context", Map.of());
        }

        String responseBody = invoke(
                "/internal/tasks/submit",
                "POST",
                toJson(payload)
        );
        return fromJson(responseBody, AgenticTaskSubmitResponse.class);
    }

    public AgenticTaskStatusResponse getTaskStatus(String taskId) {
        ensureEnabled();
        String encodedTaskId = URLEncoder.encode(taskId, StandardCharsets.UTF_8);
        String responseBody = invoke(
                "/internal/tasks/" + encodedTaskId,
                "GET",
                null
        );
        return fromJson(responseBody, AgenticTaskStatusResponse.class);
    }

    public AgenticTaskCancelResponse cancelTask(String taskId) {
        ensureEnabled();
        String encodedTaskId = URLEncoder.encode(taskId, StandardCharsets.UTF_8);
        String responseBody = invoke(
                "/internal/tasks/" + encodedTaskId + "/cancel",
                "POST",
                "{}"
        );
        return fromJson(responseBody, AgenticTaskCancelResponse.class);
    }

    private void ensureEnabled() {
        if (!agenticEnabled) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Agentic runtime is disabled");
        }
    }

    private String normalizeTaskType(String taskType) {
        if (taskType == null || taskType.isBlank()) {
            return "build";
        }
        return taskType.trim().toLowerCase();
    }

    private HttpClient buildHttpClient() {
        return HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(connectTimeoutMs))
                .build();
    }

    private String invoke(String path, String method, String body) {
        try {
            HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(sidecarBaseUrl + path))
                    .timeout(Duration.ofMillis(readTimeoutMs))
                    .header("Accept", "application/json");

            if (internalToken != null && !internalToken.isBlank()) {
                requestBuilder.header(INTERNAL_TOKEN_HEADER, internalToken);
            }

            if ("POST".equalsIgnoreCase(method)) {
                String payload = body == null ? "{}" : body;
                requestBuilder.header("Content-Type", "application/json");
                requestBuilder.POST(HttpRequest.BodyPublishers.ofString(payload));
            } else {
                requestBuilder.GET();
            }

            HttpResponse<String> response = buildHttpClient().send(
                    requestBuilder.build(),
                    HttpResponse.BodyHandlers.ofString()
            );
            int statusCode = response.statusCode();
            if (statusCode >= 200 && statusCode < 300) {
                return response.body();
            }
            throw new ApiException(
                    HttpStatus.BAD_GATEWAY,
                    "Agentic sidecar request failed with status " + statusCode
            );
        } catch (IOException | InterruptedException ex) {
            if (ex instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Unable to connect to agentic sidecar");
        }
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to serialize request payload");
        }
    }

    private <T> T fromJson(String rawBody, Class<T> targetType) {
        try {
            return objectMapper.readValue(rawBody, targetType);
        } catch (JsonProcessingException ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Invalid response from agentic sidecar");
        }
    }
}
