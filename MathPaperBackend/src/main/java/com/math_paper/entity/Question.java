package com.math_paper.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("question")
public class Question {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private String questionCode;
    private Long templateId;
    private String questionType;
    private String inputType;
    private String subjectCode;
    private String schoolStage;
    private String gradeLevel;
    private BigDecimal difficulty;
    private String sourceType;
    private String stemContent;
    private String answerContent;
    private String answerValueType;
    private String answerValue;
    private String answerExpr;
    private String analysisContent;
    private String judgeMode;
    private Integer blankCount;
    private BigDecimal defaultScore;
    private Integer estimatedMinutes;
    private Integer status;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Integer isDelete;
}
