package com.ssg.iot.dto.agentic;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Map;

@Data
public class AgenticTaskSubmitRequest {
    @NotBlank
    private String objective;

    private String taskType = "build";
    private String workflowId;
    private Map<String, Object> context;
}
