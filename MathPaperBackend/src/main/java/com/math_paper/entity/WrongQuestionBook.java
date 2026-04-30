package com.math_paper.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("wrong_question_book")
public class WrongQuestionBook {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private Long studentId;
    private Long questionId;
    private Long paperQuestionId;
    private Long studentAnswerId;
    private String wrongReason;
    private String wrongSnapshot;
    private Integer reviewCount;
    private Integer mastered;
    private LocalDateTime lastReviewTime;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Integer isDelete;
}
