package com.ssg.iot.dto.agentic;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class AgenticTaskStatusResponse {
    @JsonAlias("task_id")
    private String taskId;

    @JsonAlias("task_type")
    private String taskType;

    private String objective;

    @JsonAlias("workflow_id")
    private String workflowId;

    private String status;
    private Map<String, Object> context;
    private List<Map<String, Object>> plan;
    private List<Map<String, Object>> events;
    private Map<String, Object> result;
    private String error;

    @JsonAlias("created_at")
    private String createdAt;

    @JsonAlias("updated_at")
    private String updatedAt;
}
