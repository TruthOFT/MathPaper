package com.math_paper.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("answer_judge_record")
public class AnswerJudgeRecord {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private Long studentAnswerId;
    private Long questionId;
    private Long paperQuestionId;
    private String judgeMode;
    private String standardLatex;
    private String studentLatex;
    private String answerValueType;
    private String standardAnswerValue;
    private String studentAnswerValue;
    private String standardExpr;
    private String studentExpr;
    private String calculateResult;
    private String resultLatex;
    private String judgeResult;
    private BigDecimal judgeScore;
    private Integer equivalent;
    private String judgeDetail;
    private String errorReason;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Integer isDelete;
}
