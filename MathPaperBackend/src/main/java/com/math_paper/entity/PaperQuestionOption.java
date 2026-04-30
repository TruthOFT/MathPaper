package com.math_paper.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("paper_question_option")
public class PaperQuestionOption {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private Long paperQuestionId;
    private String optionKey;
    private String optionContent;
    private Integer sortNo;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Integer isDelete;
}
