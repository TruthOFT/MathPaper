package com.math_paper.service;

import com.math_paper.dto.AuthUserResponse;
import com.math_paper.dto.DashboardSummaryResponse;

public interface DashboardService {
    DashboardSummaryResponse summary(AuthUserResponse user);
}
