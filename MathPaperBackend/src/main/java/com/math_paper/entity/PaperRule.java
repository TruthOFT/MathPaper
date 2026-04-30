package com.math_paper.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("paper_rule")
public class PaperRule {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private String ruleCode;
    private String ruleName;
    private String subjectCode;
    private String schoolStage;
    private String gradeLevel;
    private String paperType;
    private Integer questionCount;
    private BigDecimal totalScore;
    private BigDecimal targetDifficulty;
    private String ruleConfig;
    private Integer status;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Integer isDelete;
}
