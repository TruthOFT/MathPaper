package com.math_paper.dto;

import java.util.List;

public record DashboardSummaryResponse(
        String roleType,
        List<DashboardMetricResponse> metrics,
        List<TaskSummaryResponse> recentTasks,
        List<WeakKnowledgePointResponse> weakKnowledgePoints
) {
}
