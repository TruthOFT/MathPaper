package com.math_paper.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("paper_question")
public class PaperQuestion {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private Long paperId;
    private Long questionId;
    private Long templateId;
    private String sectionName;
    private Integer questionNo;
    private String questionType;
    private BigDecimal score;
    private Integer sortNo;
    private BigDecimal difficultySnapshot;
    private String stemContentSnapshot;
    private String answerContentSnapshot;
    private String answerValueTypeSnapshot;
    private String answerValueSnapshot;
    private String answerExprSnapshot;
    private String analysisContentSnapshot;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Integer isDelete;
}
