package com.ssg.iot.service.agentic;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssg.iot.dto.agentic.AgenticTaskCancelResponse;
import com.ssg.iot.dto.agentic.AgenticTaskStatusResponse;
import com.ssg.iot.dto.agentic.AgenticTaskSubmitRequest;
import com.ssg.iot.dto.agentic.AgenticTaskSubmitResponse;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.Executors;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AgenticGatewayServiceTest {

    private static HttpServer mockSidecarServer;

    @BeforeAll
    static void startServer() throws IOException {
        mockSidecarServer = HttpServer.create(new InetSocketAddress("127.0.0.1", 19091), 0);
        mockSidecarServer.createContext("/internal/tasks/submit", exchange -> {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(405, -1);
                return;
            }
            respondJson(exchange, 200, """
                    {"task_id":"task-123","status":"QUEUED","accepted_at":"2026-03-05T00:00:00Z"}
                    """);
        });
        mockSidecarServer.createContext("/internal/tasks/task-123", exchange -> {
            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(405, -1);
                return;
            }
            respondJson(exchange, 200, """
                    {
                      "task_id":"task-123",
                      "task_type":"build",
                      "objective":"test objective",
                      "workflow_id":"build_project",
                      "status":"RUNNING",
                      "context":{},
                      "plan":[],
                      "events":[],
                      "result":null,
                      "error":null,
                      "created_at":"2026-03-05T00:00:00Z",
                      "updated_at":"2026-03-05T00:00:01Z"
                    }
                    """);
        });
        mockSidecarServer.createContext("/internal/tasks/task-123/cancel", exchange -> {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(405, -1);
                return;
            }
            respondJson(exchange, 200, """
                    {"task_id":"task-123","status":"CANCELLING","message":"Cancel requested"}
                    """);
        });
        mockSidecarServer.setExecutor(Executors.newFixedThreadPool(2));
        mockSidecarServer.start();
    }

    @AfterAll
    static void stopServer() {
        if (mockSidecarServer != null) {
            mockSidecarServer.stop(0);
        }
    }

    @Test
    void gatewayCallsSidecarEndpoints() {
        AgenticGatewayService service = new AgenticGatewayService(new ObjectMapper());
        ReflectionTestUtils.setField(service, "agenticEnabled", true);
        ReflectionTestUtils.setField(service, "sidecarBaseUrl", "http://127.0.0.1:19091");
        ReflectionTestUtils.setField(service, "connectTimeoutMs", 2000);
        ReflectionTestUtils.setField(service, "readTimeoutMs", 10000);
        ReflectionTestUtils.setField(service, "internalToken", "token-abc");

        AgenticTaskSubmitRequest request = new AgenticTaskSubmitRequest();
        request.setObjective("test objective");
        request.setTaskType("build");
        request.setWorkflowId("build_project");
        request.setContext(Map.of("ticket", "T100"));

        AgenticTaskSubmitResponse submitResponse = service.submitTask(request);
        assertEquals("task-123", submitResponse.getTaskId());
        assertEquals("QUEUED", submitResponse.getStatus());

        AgenticTaskStatusResponse statusResponse = service.getTaskStatus("task-123");
        assertEquals("task-123", statusResponse.getTaskId());
        assertEquals("RUNNING", statusResponse.getStatus());

        AgenticTaskCancelResponse cancelResponse = service.cancelTask("task-123");
        assertEquals("task-123", cancelResponse.getTaskId());
        assertEquals("CANCELLING", cancelResponse.getStatus());
    }

    private static void respondJson(com.sun.net.httpserver.HttpExchange exchange, int statusCode, String body)
            throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream outputStream = exchange.getResponseBody()) {
            outputStream.write(bytes);
        }
    }
}
