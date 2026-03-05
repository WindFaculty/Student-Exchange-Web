package com.ssg.iot.dto.agentic;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

@Data
public class AgenticTaskCancelResponse {
    @JsonAlias("task_id")
    private String taskId;

    private String status;
    private String message;
}
