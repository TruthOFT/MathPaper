/*
 Navicat / MySQL 8.0 migration
 Project: 智能作业本-数学自动测试及批改系统设计
 Purpose: 在现有题库、组卷、作业表基础上，补充 MathJSON、自动批改记录、学生知识点掌握、错题本、用户班级基础表。

 注意：
 1. 这是增量 SQL，适合在现有 math_paper 库上执行。
 2. ALTER TABLE 部分不要重复执行；如果字段已存在，需要先手动跳过对应语句。
 3. 字段命名遵循现有约定：表名下划线，字段小驼峰。
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

USE `math_paper`;

-- ----------------------------
-- 1. 数学表达式结构化字段
-- ----------------------------
ALTER TABLE `question`
  ADD COLUMN `stemMathJson` json NULL COMMENT '题干主要数学表达式MathJSON，可选' AFTER `stemContent`,
  ADD COLUMN `answerMathJson` json NULL COMMENT '标准答案MathJSON表达式' AFTER `answerContent`,
  ADD COLUMN `judgeConfig` json NULL COMMENT '判题配置：变量、容差、多答案、化简规则等' AFTER `judgeMode`;

ALTER TABLE `question_template`
  ADD COLUMN `stemMathJsonTemplate` json NULL COMMENT '题干MathJSON模板，可选' AFTER `stemTemplate`,
  ADD COLUMN `answerMathJsonTemplate` json NULL COMMENT '答案MathJSON模板' AFTER `answerTemplate`;

ALTER TABLE `paper_question`
  ADD COLUMN `stemMathJsonSnapshot` json NULL COMMENT '题干MathJSON快照' AFTER `stemContentSnapshot`,
  ADD COLUMN `answerMathJsonSnapshot` json NULL COMMENT '答案MathJSON快照' AFTER `answerContentSnapshot`;

ALTER TABLE `student_answer`
  ADD COLUMN `answerMathJson` json NULL COMMENT '学生答案MathJSON表达式' AFTER `answerContent`;

-- ----------------------------
-- 2. 用户、班级基础表
-- ----------------------------
CREATE TABLE IF NOT EXISTS `user_account` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `username` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '登录账号',
  `passwordHash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码哈希',
  `roleType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色：admin、teacher、student',
  `realName` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '真实姓名',
  `phone` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '手机号',
  `email` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '邮箱',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态：1启用 0停用',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_username_isDelete`(`username` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_roleType`(`roleType` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户账号表' ROW_FORMAT = Dynamic;

CREATE TABLE IF NOT EXISTS `class_info` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `classCode` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '班级编码',
  `className` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '班级名称',
  `teacherId` bigint NULL DEFAULT NULL COMMENT '班主任或任课教师id',
  `subjectCode` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'math' COMMENT '学科编码',
  `schoolStage` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '学段',
  `gradeLevel` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '年级',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态：1启用 0停用',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_classCode_isDelete`(`classCode` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_teacherId`(`teacherId` ASC) USING BTREE,
  INDEX `idx_schoolStage_gradeLevel`(`schoolStage` ASC, `gradeLevel` ASC) USING BTREE,
  CONSTRAINT `fk_class_info_teacherId` FOREIGN KEY (`teacherId`) REFERENCES `user_account` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '班级信息表' ROW_FORMAT = Dynamic;

CREATE TABLE IF NOT EXISTS `class_student` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `classId` bigint NOT NULL COMMENT '班级id',
  `studentId` bigint NOT NULL COMMENT '学生id',
  `studentNo` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '班内学号',
  `joinTime` datetime NULL DEFAULT NULL COMMENT '加入时间',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态：1在班 0退出',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_classId_studentId_isDelete`(`classId` ASC, `studentId` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_studentId`(`studentId` ASC) USING BTREE,
  CONSTRAINT `fk_class_student_classId` FOREIGN KEY (`classId`) REFERENCES `class_info` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_class_student_studentId` FOREIGN KEY (`studentId`) REFERENCES `user_account` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '班级学生关联表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- 3. 自动批改过程记录
-- ----------------------------
CREATE TABLE IF NOT EXISTS `answer_judge_record` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `studentAnswerId` bigint NOT NULL COMMENT '学生作答记录id',
  `questionId` bigint NULL DEFAULT NULL COMMENT '题库题目id',
  `paperQuestionId` bigint NULL DEFAULT NULL COMMENT '试卷题目id',
  `judgeMode` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'expression_equivalent' COMMENT '判题方式',
  `standardLatex` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '标准答案LaTeX',
  `studentLatex` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '学生答案LaTeX',
  `standardMathJson` json NULL COMMENT '标准答案MathJSON',
  `studentMathJson` json NULL COMMENT '学生答案MathJSON',
  `standardExpr` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '标准答案Symja表达式',
  `studentExpr` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '学生答案Symja表达式',
  `calculateResult` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT 'Symja计算或化简结果',
  `resultLatex` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '计算结果LaTeX',
  `judgeResult` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '判题结果：pending、correct、wrong、partial、error',
  `judgeScore` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '本次判题得分',
  `equivalent` tinyint(1) NOT NULL DEFAULT 0 COMMENT '表达式是否等价',
  `judgeDetail` json NULL COMMENT '判题详情：规则命中、容差、变量替换、步骤信息等',
  `errorReason` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '判题失败原因',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_studentAnswerId`(`studentAnswerId` ASC) USING BTREE,
  INDEX `idx_questionId`(`questionId` ASC) USING BTREE,
  INDEX `idx_paperQuestionId`(`paperQuestionId` ASC) USING BTREE,
  INDEX `idx_judgeResult`(`judgeResult` ASC) USING BTREE,
  CONSTRAINT `fk_answer_judge_record_studentAnswerId` FOREIGN KEY (`studentAnswerId`) REFERENCES `student_answer` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_answer_judge_record_questionId` FOREIGN KEY (`questionId`) REFERENCES `question` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_answer_judge_record_paperQuestionId` FOREIGN KEY (`paperQuestionId`) REFERENCES `paper_question` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '自动批改过程记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- 4. 学生知识点掌握画像
-- ----------------------------
CREATE TABLE IF NOT EXISTS `student_knowledge_mastery` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `studentId` bigint NOT NULL COMMENT '学生id',
  `knowledgePointId` bigint NOT NULL COMMENT '知识点id',
  `masteryLevel` decimal(5, 2) NOT NULL DEFAULT 0.00 COMMENT '掌握度：0-100',
  `rightCount` int NOT NULL DEFAULT 0 COMMENT '答对次数',
  `wrongCount` int NOT NULL DEFAULT 0 COMMENT '答错次数',
  `partialCount` int NOT NULL DEFAULT 0 COMMENT '部分正确次数',
  `lastAnswerTime` datetime NULL DEFAULT NULL COMMENT '最近作答时间',
  `lastWrongTime` datetime NULL DEFAULT NULL COMMENT '最近答错时间',
  `masteryDetail` json NULL COMMENT '掌握度计算详情',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_studentId_knowledgePointId_isDelete`(`studentId` ASC, `knowledgePointId` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_knowledgePointId`(`knowledgePointId` ASC) USING BTREE,
  INDEX `idx_masteryLevel`(`masteryLevel` ASC) USING BTREE,
  CONSTRAINT `fk_student_knowledge_mastery_studentId` FOREIGN KEY (`studentId`) REFERENCES `user_account` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_student_knowledge_mastery_knowledgePointId` FOREIGN KEY (`knowledgePointId`) REFERENCES `knowledge_point` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '学生知识点掌握表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- 5. 错题本
-- ----------------------------
CREATE TABLE IF NOT EXISTS `wrong_question_book` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `studentId` bigint NOT NULL COMMENT '学生id',
  `questionId` bigint NULL DEFAULT NULL COMMENT '题库题目id',
  `paperQuestionId` bigint NULL DEFAULT NULL COMMENT '试卷题目id',
  `studentAnswerId` bigint NULL DEFAULT NULL COMMENT '来源作答记录id',
  `wrongReason` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '错因：concept、calculation、format、careless、unknown',
  `wrongSnapshot` json NULL COMMENT '错题快照：题干、学生答案、标准答案、解析等',
  `reviewCount` int NOT NULL DEFAULT 0 COMMENT '复习次数',
  `mastered` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否已掌握',
  `lastReviewTime` datetime NULL DEFAULT NULL COMMENT '最近复习时间',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_studentId_mastered`(`studentId` ASC, `mastered` ASC) USING BTREE,
  INDEX `idx_questionId`(`questionId` ASC) USING BTREE,
  INDEX `idx_paperQuestionId`(`paperQuestionId` ASC) USING BTREE,
  INDEX `idx_studentAnswerId`(`studentAnswerId` ASC) USING BTREE,
  CONSTRAINT `fk_wrong_question_book_studentId` FOREIGN KEY (`studentId`) REFERENCES `user_account` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_wrong_question_book_questionId` FOREIGN KEY (`questionId`) REFERENCES `question` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_wrong_question_book_paperQuestionId` FOREIGN KEY (`paperQuestionId`) REFERENCES `paper_question` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_wrong_question_book_studentAnswerId` FOREIGN KEY (`studentAnswerId`) REFERENCES `student_answer` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '学生错题本表' ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
