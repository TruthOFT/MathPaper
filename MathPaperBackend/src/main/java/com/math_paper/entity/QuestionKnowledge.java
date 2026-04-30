package com.math_paper.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("question_knowledge")
public class QuestionKnowledge {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private Long questionId;
    private Long knowledgePointId;
    private BigDecimal weight;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Integer isDelete;
}
