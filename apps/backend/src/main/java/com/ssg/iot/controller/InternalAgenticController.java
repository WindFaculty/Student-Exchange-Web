package com.ssg.iot.controller;

import com.ssg.iot.dto.agentic.AgenticTaskCancelResponse;
import com.ssg.iot.dto.agentic.AgenticTaskStatusResponse;
import com.ssg.iot.dto.agentic.AgenticTaskSubmitRequest;
import com.ssg.iot.dto.agentic.AgenticTaskSubmitResponse;
import com.ssg.iot.service.agentic.AgenticGatewayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/agentic")
@RequiredArgsConstructor
public class InternalAgenticController {

    private final AgenticGatewayService agenticGatewayService;

    @PostMapping("/tasks")
    public AgenticTaskSubmitResponse submitTask(@Valid @RequestBody AgenticTaskSubmitRequest request) {
        return agenticGatewayService.submitTask(request);
    }

    @GetMapping("/tasks/{taskId}")
    public AgenticTaskStatusResponse getTaskStatus(@PathVariable String taskId) {
        return agenticGatewayService.getTaskStatus(taskId);
    }

    @PostMapping("/tasks/{taskId}/cancel")
    public AgenticTaskCancelResponse cancelTask(@PathVariable String taskId) {
        return agenticGatewayService.cancelTask(taskId);
    }
}
