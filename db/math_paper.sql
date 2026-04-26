/*
 Navicat Premium Dump SQL

 Source Server         : MyDB
 Source Server Type    : MySQL
 Source Server Version : 80031 (8.0.31)
 Source Host           : localhost:3306
 Source Schema         : math_paper

 Target Server Type    : MySQL
 Target Server Version : 80031 (8.0.31)
 File Encoding         : 65001

 Date: 25/03/2026 17:06:55
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for homework_task
-- ----------------------------
DROP TABLE IF EXISTS `homework_task`;
CREATE TABLE `homework_task`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `taskCode` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '作业编码',
  `paperId` bigint NOT NULL COMMENT '基础试卷id',
  `taskName` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '作业名称',
  `teacherId` bigint NOT NULL DEFAULT 0 COMMENT '教师id',
  `classId` bigint NOT NULL DEFAULT 0 COMMENT '班级id',
  `pushType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'manual' COMMENT '推送方式：manual、personalized',
  `publishTime` datetime NULL DEFAULT NULL COMMENT '发布时间',
  `deadlineTime` datetime NULL DEFAULT NULL COMMENT '截止时间',
  `allowRetry` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否允许重做',
  `status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '状态：0草稿 1已发布 2已结束',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_taskCode_isDelete`(`taskCode` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_paperId`(`paperId` ASC) USING BTREE,
  INDEX `idx_teacherId_classId`(`teacherId` ASC, `classId` ASC) USING BTREE,
  CONSTRAINT `fk_homework_task_paperId` FOREIGN KEY (`paperId`) REFERENCES `paper` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '作业任务表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for homework_task_student
-- ----------------------------
DROP TABLE IF EXISTS `homework_task_student`;
CREATE TABLE `homework_task_student`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `taskId` bigint NOT NULL COMMENT '作业任务id',
  `studentId` bigint NOT NULL COMMENT '学生id',
  `paperId` bigint NOT NULL COMMENT '学生实际作答试卷id，可用于个性化推送',
  `status` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '状态：pending、doing、submitted、corrected',
  `startTime` datetime NULL DEFAULT NULL COMMENT '开始时间',
  `submitTime` datetime NULL DEFAULT NULL COMMENT '提交时间',
  `objectiveScore` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '客观题自动得分',
  `totalScore` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '总分',
  `autoCorrectStatus` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'waiting' COMMENT '自动批改状态',
  `teacherReviewStatus` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'not_required' COMMENT '教师复核状态',
  `masterySnapshot` json NULL COMMENT '知识点掌握度快照',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_taskId_studentId_isDelete`(`taskId` ASC, `studentId` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_paperId`(`paperId` ASC) USING BTREE,
  CONSTRAINT `fk_homework_task_student_paperId` FOREIGN KEY (`paperId`) REFERENCES `paper` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_homework_task_student_taskId` FOREIGN KEY (`taskId`) REFERENCES `homework_task` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '学生作业任务表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for knowledge_point
-- ----------------------------
DROP TABLE IF EXISTS `knowledge_point`;
CREATE TABLE `knowledge_point`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `parentId` bigint NOT NULL DEFAULT 0 COMMENT '父知识点id，0表示根节点',
  `pointCode` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '知识点编码',
  `pointName` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '知识点名称',
  `subjectCode` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'math' COMMENT '学科编码',
  `schoolStage` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '学段，junior_high等',
  `gradeLevel` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '年级，grade_7等',
  `sortNo` int NOT NULL DEFAULT 0 COMMENT '排序号',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态：1启用 0停用',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_pointCode_isDelete`(`pointCode` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_parentId`(`parentId` ASC) USING BTREE,
  INDEX `idx_subjectCode_schoolStage_gradeLevel`(`subjectCode` ASC, `schoolStage` ASC, `gradeLevel` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '知识点表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for paper
-- ----------------------------
DROP TABLE IF EXISTS `paper`;
CREATE TABLE `paper`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `paperCode` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '试卷编码',
  `paperName` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '试卷名称',
  `ruleId` bigint NULL DEFAULT NULL COMMENT '组卷规则id',
  `paperType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'homework' COMMENT '试卷类型：homework、quiz、practice',
  `subjectCode` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'math' COMMENT '学科编码',
  `schoolStage` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '学段',
  `gradeLevel` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '年级',
  `sourceType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'manual' COMMENT '来源：manual、auto',
  `difficulty` decimal(4, 2) NOT NULL DEFAULT 0.50 COMMENT '试卷难度',
  `questionCount` int NOT NULL DEFAULT 0 COMMENT '题目数量',
  `totalScore` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '总分',
  `durationMinutes` int NOT NULL DEFAULT 30 COMMENT '建议时长，分钟',
  `status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '状态：0草稿 1已发布',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_paperCode_isDelete`(`paperCode` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_ruleId`(`ruleId` ASC) USING BTREE,
  INDEX `idx_subjectCode_schoolStage_gradeLevel`(`subjectCode` ASC, `schoolStage` ASC, `gradeLevel` ASC) USING BTREE,
  CONSTRAINT `fk_paper_ruleId` FOREIGN KEY (`ruleId`) REFERENCES `paper_rule` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '试卷表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for paper_question
-- ----------------------------
DROP TABLE IF EXISTS `paper_question`;
CREATE TABLE `paper_question`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `paperId` bigint NOT NULL COMMENT '试卷id',
  `questionId` bigint NULL DEFAULT NULL COMMENT '题库题目id',
  `templateId` bigint NULL DEFAULT NULL COMMENT '模板id',
  `sectionName` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '大题名称',
  `questionNo` int NOT NULL COMMENT '题号',
  `questionType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '题型',
  `score` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '题目分值',
  `sortNo` int NOT NULL DEFAULT 0 COMMENT '排序号',
  `difficultySnapshot` decimal(4, 2) NOT NULL DEFAULT 0.50 COMMENT '难度快照',
  `stemContentSnapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '题干快照，包含数学式时直接存latex',
  `answerContentSnapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '答案快照，包含数学式时直接存latex',
  `answerExprSnapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '答案表达式快照，供symja判等',
  `analysisContentSnapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '解析快照，包含数学式时直接存latex',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_paperId_questionNo_isDelete`(`paperId` ASC, `questionNo` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_questionId`(`questionId` ASC) USING BTREE,
  INDEX `idx_templateId`(`templateId` ASC) USING BTREE,
  CONSTRAINT `fk_paper_question_paperId` FOREIGN KEY (`paperId`) REFERENCES `paper` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_paper_question_questionId` FOREIGN KEY (`questionId`) REFERENCES `question` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_paper_question_templateId` FOREIGN KEY (`templateId`) REFERENCES `question_template` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '试卷题目快照表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for paper_question_option
-- ----------------------------
DROP TABLE IF EXISTS `paper_question_option`;
CREATE TABLE `paper_question_option`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `paperQuestionId` bigint NOT NULL COMMENT '试卷题目id',
  `optionKey` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '选项键',
  `optionContent` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '选项内容快照，包含数学式时直接存latex',
  `sortNo` int NOT NULL DEFAULT 0 COMMENT '排序号',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_paperQuestionId_optionKey_isDelete`(`paperQuestionId` ASC, `optionKey` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_paperQuestionId`(`paperQuestionId` ASC) USING BTREE,
  CONSTRAINT `fk_paper_question_option_paperQuestionId` FOREIGN KEY (`paperQuestionId`) REFERENCES `paper_question` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '试卷题目选项快照表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for paper_rule
-- ----------------------------
DROP TABLE IF EXISTS `paper_rule`;
CREATE TABLE `paper_rule`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `ruleCode` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '规则编码',
  `ruleName` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '规则名称',
  `subjectCode` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'math' COMMENT '学科编码',
  `schoolStage` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '学段',
  `gradeLevel` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '年级',
  `paperType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'homework' COMMENT '试卷类型：homework、quiz、practice',
  `questionCount` int NOT NULL DEFAULT 0 COMMENT '目标题量',
  `totalScore` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '目标总分',
  `targetDifficulty` decimal(4, 2) NOT NULL DEFAULT 0.50 COMMENT '目标难度',
  `ruleConfig` json NOT NULL COMMENT '组卷规则json，包含知识点、题型、数量、难度区间',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态：1启用 0停用',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_ruleCode_isDelete`(`ruleCode` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_subjectCode_schoolStage_gradeLevel`(`subjectCode` ASC, `schoolStage` ASC, `gradeLevel` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '组卷规则表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for question
-- ----------------------------
DROP TABLE IF EXISTS `question`;
CREATE TABLE `question`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `questionCode` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '题目编码',
  `templateId` bigint NULL DEFAULT NULL COMMENT '来源模板id',
  `questionType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '题型：single_choice、multiple_choice、fill_blank、calculation',
  `inputType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'text' COMMENT '作答方式：choice、text、formula',
  `subjectCode` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'math' COMMENT '学科编码',
  `schoolStage` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '学段',
  `gradeLevel` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '年级',
  `difficulty` decimal(4, 2) NOT NULL DEFAULT 0.50 COMMENT '难度系数，0.00-1.00',
  `sourceType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'manual' COMMENT '来源：manual、import、template_generate、ai_generate',
  `stemContent` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '题干内容，包含数学式时直接存latex',
  `answerContent` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '标准答案展示内容，包含数学式时直接存latex',
  `answerExpr` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '标准答案表达式，供symja判等',
  `analysisContent` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '解析内容，包含数学式时直接存latex',
  `judgeMode` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'expression_equivalent' COMMENT '判题方式：option_match、exact_match、expression_equivalent',
  `blankCount` int NOT NULL DEFAULT 0 COMMENT '填空数量',
  `defaultScore` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '默认分值',
  `estimatedMinutes` int NOT NULL DEFAULT 3 COMMENT '预计作答时长，分钟',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态：1启用 0停用',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_questionCode_isDelete`(`questionCode` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_templateId`(`templateId` ASC) USING BTREE,
  INDEX `idx_subjectCode_schoolStage_gradeLevel`(`subjectCode` ASC, `schoolStage` ASC, `gradeLevel` ASC) USING BTREE,
  INDEX `idx_questionType_difficulty`(`questionType` ASC, `difficulty` ASC) USING BTREE,
  CONSTRAINT `fk_question_templateId` FOREIGN KEY (`templateId`) REFERENCES `question_template` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '题库主表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for question_knowledge
-- ----------------------------
DROP TABLE IF EXISTS `question_knowledge`;
CREATE TABLE `question_knowledge`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `questionId` bigint NOT NULL COMMENT '题目id',
  `knowledgePointId` bigint NOT NULL COMMENT '知识点id',
  `weight` decimal(5, 2) NOT NULL DEFAULT 1.00 COMMENT '知识点权重',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_questionId_knowledgePointId_isDelete`(`questionId` ASC, `knowledgePointId` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_knowledgePointId`(`knowledgePointId` ASC) USING BTREE,
  CONSTRAINT `fk_question_knowledge_knowledgePointId` FOREIGN KEY (`knowledgePointId`) REFERENCES `knowledge_point` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_question_knowledge_questionId` FOREIGN KEY (`questionId`) REFERENCES `question` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '题目知识点关联表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for question_option
-- ----------------------------
DROP TABLE IF EXISTS `question_option`;
CREATE TABLE `question_option`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `questionId` bigint NOT NULL COMMENT '题目id',
  `optionKey` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '选项键，如a、b、c、d',
  `optionContent` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '选项内容，包含数学式时直接存latex',
  `isCorrect` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否正确答案',
  `sortNo` int NOT NULL DEFAULT 0 COMMENT '排序号',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_questionId_optionKey_isDelete`(`questionId` ASC, `optionKey` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_questionId`(`questionId` ASC) USING BTREE,
  CONSTRAINT `fk_question_option_questionId` FOREIGN KEY (`questionId`) REFERENCES `question` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '题目选项表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for question_template
-- ----------------------------
DROP TABLE IF EXISTS `question_template`;
CREATE TABLE `question_template`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `templateCode` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '模板编码',
  `templateName` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '模板名称',
  `questionType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '题型：single_choice、fill_blank、calculation',
  `subjectCode` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'math' COMMENT '学科编码',
  `schoolStage` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '学段',
  `gradeLevel` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '年级',
  `knowledgePointId` bigint NOT NULL COMMENT '所属知识点id',
  `difficulty` decimal(4, 2) NOT NULL DEFAULT 0.50 COMMENT '难度系数，0.00-1.00',
  `stemTemplate` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '题干模板，公式内容使用latex',
  `answerTemplate` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '答案模板，公式内容使用latex',
  `answerExprTemplate` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '答案表达式模板，供symja判等',
  `analysisTemplate` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '解析模板，公式内容使用latex',
  `variableConfig` json NULL COMMENT '模板变量配置',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态：1启用 0停用',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_templateCode_isDelete`(`templateCode` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_knowledgePointId`(`knowledgePointId` ASC) USING BTREE,
  INDEX `idx_questionType_difficulty`(`questionType` ASC, `difficulty` ASC) USING BTREE,
  CONSTRAINT `fk_question_template_knowledgePointId` FOREIGN KEY (`knowledgePointId`) REFERENCES `knowledge_point` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '题目模板表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for student_answer
-- ----------------------------
DROP TABLE IF EXISTS `student_answer`;
CREATE TABLE `student_answer`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `taskStudentId` bigint NOT NULL COMMENT '学生作业任务id',
  `paperQuestionId` bigint NOT NULL COMMENT '试卷题目id',
  `questionId` bigint NULL DEFAULT NULL COMMENT '题库题目id',
  `studentId` bigint NOT NULL COMMENT '学生id',
  `attemptNo` int NOT NULL DEFAULT 1 COMMENT '作答次数',
  `answerContent` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '学生答案内容，包含数学式时直接存latex',
  `answerExpr` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '学生答案表达式，供symja判等',
  `judgeResult` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '判题结果：pending、correct、wrong、partial',
  `judgeScore` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '判题得分',
  `isCorrect` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否正确',
  `feedbackContent` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '批改反馈内容，包含数学式时直接存latex',
  `submitTime` datetime NULL DEFAULT NULL COMMENT '提交时间',
  `autoCorrectTime` datetime NULL DEFAULT NULL COMMENT '自动批改时间',
  `teacherReviewTime` datetime NULL DEFAULT NULL COMMENT '教师复核时间',
  `reviewerId` bigint NOT NULL DEFAULT 0 COMMENT '复核教师id',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_taskStudentId_paperQuestionId_attemptNo_isDelete`(`taskStudentId` ASC, `paperQuestionId` ASC, `attemptNo` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_questionId`(`questionId` ASC) USING BTREE,
  INDEX `idx_studentId`(`studentId` ASC) USING BTREE,
  INDEX `fk_student_answer_paperQuestionId`(`paperQuestionId` ASC) USING BTREE,
  CONSTRAINT `fk_student_answer_paperQuestionId` FOREIGN KEY (`paperQuestionId`) REFERENCES `paper_question` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_student_answer_questionId` FOREIGN KEY (`questionId`) REFERENCES `question` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_student_answer_taskStudentId` FOREIGN KEY (`taskStudentId`) REFERENCES `homework_task_student` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '学生作答记录表' ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
