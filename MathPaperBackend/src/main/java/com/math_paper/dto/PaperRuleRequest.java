package com.math_paper.dto;

import java.math.BigDecimal;
import java.util.List;

public record PaperRuleRequest(
        String ruleName,
        String schoolStage,
        String gradeLevel,
        String paperType,
        BigDecimal targetDifficulty,
        String remark,
        List<Section> sections
) {
    public record Section(
            String sectionName,
            String questionType,
            Integer count,
            BigDecimal score,
            List<String> knowledgePointCodes
    ) {
    }
}
