package com.math_paper.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("student_answer")
public class StudentAnswer {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private Long taskStudentId;
    private Long paperQuestionId;
    private Long questionId;
    private Long studentId;
    private Integer attemptNo;
    private String answerContent;
    private String answerValueType;
    private String answerValue;
    private String answerExpr;
    private String judgeResult;
    private BigDecimal judgeScore;
    private Integer isCorrect;
    private String feedbackContent;
    private LocalDateTime submitTime;
    private LocalDateTime autoCorrectTime;
    private LocalDateTime teacherReviewTime;
    private Long reviewerId;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Integer isDelete;
}
