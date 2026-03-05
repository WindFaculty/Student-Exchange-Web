package com.ssg.iot.dto.agentic;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

@Data
public class AgenticTaskSubmitResponse {
    @JsonAlias("task_id")
    private String taskId;

    private String status;

    @JsonAlias("accepted_at")
    private String acceptedAt;
}
