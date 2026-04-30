package com.math_paper.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("question_option")
public class QuestionOption {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private Long questionId;
    private String optionKey;
    private String optionContent;
    private Integer isCorrect;
    private Integer sortNo;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Integer isDelete;
}
