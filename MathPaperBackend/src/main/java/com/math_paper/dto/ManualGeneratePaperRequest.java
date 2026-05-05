package com.math_paper.dto;

import java.math.BigDecimal;
import java.util.List;

public record ManualGeneratePaperRequest(
        String paperName,
        List<Item> items
) {
    public record Item(
            Long questionId,
            BigDecimal score,
            String sectionName
    ) {
    }
}
