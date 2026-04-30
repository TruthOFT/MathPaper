package com.math_paper.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("paper")
public class Paper {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private String paperCode;
    private String paperName;
    private Long ruleId;
    private String paperType;
    private String subjectCode;
    private String schoolStage;
    private String gradeLevel;
    private String sourceType;
    private BigDecimal difficulty;
    private Integer questionCount;
    private BigDecimal totalScore;
    private Integer durationMinutes;
    private Integer status;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Integer isDelete;
}
