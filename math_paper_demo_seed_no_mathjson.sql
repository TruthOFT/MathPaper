/*
 MySQL 8.0 demo data
 Project: 智能作业本-数学自动测试及批改系统设计
 Target schema: math_paper

 执行顺序：
 1. math_paper-structure.sql
 2. math_paper_no_mathjson_migration.sql
 3. math_paper_demo_seed_no_mathjson.sql

 说明：
 - 不保存 MathJSON。
 - 标准答案使用 answerValue 字符串保存。
 - answerValueType 统一为 latex，老师和学生都用 MathLive 输入 LaTeX。
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
USE `math_paper`;

-- ----------------------------
-- 1. 用户、班级
-- ----------------------------
INSERT INTO `user_account`
(`username`, `passwordHash`, `roleType`, `realName`, `phone`, `email`, `status`)
VALUES
('teacher_math_01', '$2a$10$demo.teacher.hash', 'teacher', '张老师', NULL, NULL, 1),
('student_zhangsan', '$2a$10$demo.student.hash', 'student', '张三', NULL, NULL, 1),
('student_lisi', '$2a$10$demo.student.hash', 'student', '李四', NULL, NULL, 1),
('student_wangwu', '$2a$10$demo.student.hash', 'student', '王五', NULL, NULL, 1)
ON DUPLICATE KEY UPDATE
  `passwordHash` = VALUES(`passwordHash`),
  `roleType` = VALUES(`roleType`),
  `realName` = VALUES(`realName`),
  `status` = VALUES(`status`);

SET @teacherId = (SELECT `id` FROM `user_account` WHERE `username` = 'teacher_math_01' AND `isDelete` = 0 LIMIT 1);
SET @studentZhangId = (SELECT `id` FROM `user_account` WHERE `username` = 'student_zhangsan' AND `isDelete` = 0 LIMIT 1);
SET @studentLiId = (SELECT `id` FROM `user_account` WHERE `username` = 'student_lisi' AND `isDelete` = 0 LIMIT 1);
SET @studentWangId = (SELECT `id` FROM `user_account` WHERE `username` = 'student_wangwu' AND `isDelete` = 0 LIMIT 1);

INSERT INTO `class_info`
(`classCode`, `className`, `teacherId`, `subjectCode`, `schoolStage`, `gradeLevel`, `status`, `remark`)
VALUES
('CLS_MATH_2026_01', '高二数学智能作业演示班', @teacherId, 'math', 'senior_high', 'grade_11', 1, '用于自动组卷、自动批改演示')
ON DUPLICATE KEY UPDATE
  `className` = VALUES(`className`),
  `teacherId` = VALUES(`teacherId`),
  `subjectCode` = VALUES(`subjectCode`),
  `schoolStage` = VALUES(`schoolStage`),
  `gradeLevel` = VALUES(`gradeLevel`),
  `status` = VALUES(`status`),
  `remark` = VALUES(`remark`);

SET @classId = (SELECT `id` FROM `class_info` WHERE `classCode` = 'CLS_MATH_2026_01' AND `isDelete` = 0 LIMIT 1);

INSERT INTO `class_student`
(`classId`, `studentId`, `studentNo`, `joinTime`, `status`)
VALUES
(@classId, @studentZhangId, '2026001', NOW(), 1),
(@classId, @studentLiId, '2026002', NOW(), 1),
(@classId, @studentWangId, '2026003', NOW(), 1)
ON DUPLICATE KEY UPDATE
  `studentNo` = VALUES(`studentNo`),
  `status` = VALUES(`status`);

-- ----------------------------
-- 2. 知识点
-- ----------------------------
INSERT INTO `knowledge_point`
(`parentId`, `pointCode`, `pointName`, `subjectCode`, `schoolStage`, `gradeLevel`, `sortNo`, `status`)
VALUES
(0, 'KP_CALC_ROOT', '微积分与函数综合', 'math', 'senior_high', 'grade_11', 1, 1),
(0, 'KP_ALG_ROOT', '代数与方程', 'math', 'senior_high', 'grade_11', 2, 1)
ON DUPLICATE KEY UPDATE
  `pointName` = VALUES(`pointName`),
  `subjectCode` = VALUES(`subjectCode`),
  `schoolStage` = VALUES(`schoolStage`),
  `gradeLevel` = VALUES(`gradeLevel`),
  `sortNo` = VALUES(`sortNo`),
  `status` = VALUES(`status`);

SET @kpCalcRoot = (SELECT `id` FROM `knowledge_point` WHERE `pointCode` = 'KP_CALC_ROOT' AND `isDelete` = 0 LIMIT 1);
SET @kpAlgRoot = (SELECT `id` FROM `knowledge_point` WHERE `pointCode` = 'KP_ALG_ROOT' AND `isDelete` = 0 LIMIT 1);

INSERT INTO `knowledge_point`
(`parentId`, `pointCode`, `pointName`, `subjectCode`, `schoolStage`, `gradeLevel`, `sortNo`, `status`)
VALUES
(@kpCalcRoot, 'KP_LIMIT', '极限计算', 'math', 'senior_high', 'grade_11', 11, 1),
(@kpCalcRoot, 'KP_DERIVATIVE', '导数计算', 'math', 'senior_high', 'grade_11', 12, 1),
(@kpCalcRoot, 'KP_INTEGRAL', '积分计算', 'math', 'senior_high', 'grade_11', 13, 1),
(@kpAlgRoot, 'KP_EQUATION', '方程求解', 'math', 'senior_high', 'grade_11', 21, 1),
(@kpAlgRoot, 'KP_FUNCTION', '函数与表达式化简', 'math', 'senior_high', 'grade_11', 22, 1)
ON DUPLICATE KEY UPDATE
  `parentId` = VALUES(`parentId`),
  `pointName` = VALUES(`pointName`),
  `sortNo` = VALUES(`sortNo`),
  `status` = VALUES(`status`);

SET @kpLimit = (SELECT `id` FROM `knowledge_point` WHERE `pointCode` = 'KP_LIMIT' AND `isDelete` = 0 LIMIT 1);
SET @kpDerivative = (SELECT `id` FROM `knowledge_point` WHERE `pointCode` = 'KP_DERIVATIVE' AND `isDelete` = 0 LIMIT 1);
SET @kpIntegral = (SELECT `id` FROM `knowledge_point` WHERE `pointCode` = 'KP_INTEGRAL' AND `isDelete` = 0 LIMIT 1);
SET @kpEquation = (SELECT `id` FROM `knowledge_point` WHERE `pointCode` = 'KP_EQUATION' AND `isDelete` = 0 LIMIT 1);
SET @kpFunction = (SELECT `id` FROM `knowledge_point` WHERE `pointCode` = 'KP_FUNCTION' AND `isDelete` = 0 LIMIT 1);

-- ----------------------------
-- 3. 题目模板
-- ----------------------------
INSERT INTO `question_template`
(`templateCode`, `templateName`, `questionType`, `subjectCode`, `schoolStage`, `gradeLevel`, `knowledgePointId`, `difficulty`, `stemTemplate`, `answerTemplate`, `answerValueType`, `answerValueTemplate`, `answerExprTemplate`, `analysisTemplate`, `variableConfig`, `status`, `remark`)
VALUES
('TPL_LIMIT_BASIC', '极限计算模板', 'calculation', 'math', 'senior_high', 'grade_11', @kpLimit, 0.45, '计算极限：\\(\\lim_{x \\to a} f(x)\\)', NULL, 'latex', NULL, NULL, '先代入或等价变形，再使用极限运算。', NULL, 1, '自动组卷可用模板'),
('TPL_DERIVATIVE_BASIC', '导数计算模板', 'calculation', 'math', 'senior_high', 'grade_11', @kpDerivative, 0.40, '求函数导数：\\(\\frac{d}{dx} f(x)\\)', NULL, 'latex', NULL, NULL, '使用幂函数、复合函数、乘积法则等求导。', NULL, 1, '自动组卷可用模板'),
('TPL_INTEGRAL_BASIC', '积分计算模板', 'calculation', 'math', 'senior_high', 'grade_11', @kpIntegral, 0.55, '计算积分：\\(\\int f(x)\\,dx\\)', NULL, 'latex', NULL, NULL, '识别积分类型，先化简再计算。', NULL, 1, '自动组卷可用模板'),
('TPL_EQUATION_BASIC', '方程求解模板', 'calculation', 'math', 'senior_high', 'grade_11', @kpEquation, 0.35, '解方程：\\(f(x)=0\\)', NULL, 'latex', NULL, NULL, '移项、因式分解或调用符号求解。', NULL, 1, '自动组卷可用模板'),
('TPL_CHOICE_BASIC', '选择题模板', 'single_choice', 'math', 'senior_high', 'grade_11', @kpFunction, 0.30, '选择正确答案。', NULL, 'latex', NULL, NULL, '比较选项与标准答案。', NULL, 1, '自动组卷可用模板')
ON DUPLICATE KEY UPDATE
  `templateName` = VALUES(`templateName`),
  `questionType` = VALUES(`questionType`),
  `knowledgePointId` = VALUES(`knowledgePointId`),
  `difficulty` = VALUES(`difficulty`),
  `stemTemplate` = VALUES(`stemTemplate`),
  `answerValueType` = VALUES(`answerValueType`),
  `answerValueTemplate` = VALUES(`answerValueTemplate`),
  `variableConfig` = VALUES(`variableConfig`),
  `status` = VALUES(`status`);

SET @tplLimit = (SELECT `id` FROM `question_template` WHERE `templateCode` = 'TPL_LIMIT_BASIC' AND `isDelete` = 0 LIMIT 1);
SET @tplDerivative = (SELECT `id` FROM `question_template` WHERE `templateCode` = 'TPL_DERIVATIVE_BASIC' AND `isDelete` = 0 LIMIT 1);
SET @tplIntegral = (SELECT `id` FROM `question_template` WHERE `templateCode` = 'TPL_INTEGRAL_BASIC' AND `isDelete` = 0 LIMIT 1);
SET @tplEquation = (SELECT `id` FROM `question_template` WHERE `templateCode` = 'TPL_EQUATION_BASIC' AND `isDelete` = 0 LIMIT 1);
SET @tplChoice = (SELECT `id` FROM `question_template` WHERE `templateCode` = 'TPL_CHOICE_BASIC' AND `isDelete` = 0 LIMIT 1);

-- ----------------------------
-- 4. 题库题目：answerValue 用字符串精确比对
-- ----------------------------
INSERT INTO `question`
(`questionCode`, `templateId`, `questionType`, `inputType`, `subjectCode`, `schoolStage`, `gradeLevel`, `difficulty`, `sourceType`, `stemContent`, `answerContent`, `answerValueType`, `answerValue`, `answerExpr`, `analysisContent`, `judgeMode`, `blankCount`, `defaultScore`, `estimatedMinutes`, `status`, `remark`)
VALUES
('Q_LIMIT_001', @tplLimit, 'calculation', 'formula', 'math', 'senior_high', 'grade_11', 0.35, 'manual', '计算极限：\\(\\lim_{x \\to 0}\\frac{\\sin x}{x}\\)', '\\(1\\)', 'latex', '1', NULL, '重要极限，答案为 1。', 'exact_match', 0, 10.00, 3, 1, '自动组卷题'),
('Q_LIMIT_002', @tplLimit, 'calculation', 'formula', 'math', 'senior_high', 'grade_11', 0.50, 'manual', '计算极限：\\(\\lim_{n \\to \\infty}(1+\\frac{1}{n})^n\\)', '\\(e\\)', 'latex', 'e', NULL, '自然常数 e 的经典定义。', 'exact_match', 0, 10.00, 3, 1, '自动组卷题'),
('Q_LIMIT_003', @tplLimit, 'calculation', 'formula', 'math', 'senior_high', 'grade_11', 0.55, 'manual', '计算极限：\\(\\lim_{x \\to 0}\\frac{1-\\cos x}{x^2}\\)', '\\(\\frac{1}{2}\\)', 'latex', '\\frac{1}{2}', NULL, '等价无穷小。', 'exact_match', 0, 10.00, 4, 1, '自动组卷题'),
('Q_DERIVATIVE_001', @tplDerivative, 'calculation', 'formula', 'math', 'senior_high', 'grade_11', 0.30, 'manual', '求导：\\(\\frac{d}{dx}x^3\\)', '\\(3x^2\\)', 'latex', '3x^2', NULL, '幂函数求导。', 'exact_match', 0, 10.00, 2, 1, '自动组卷题'),
('Q_DERIVATIVE_002', @tplDerivative, 'calculation', 'formula', 'math', 'senior_high', 'grade_11', 0.45, 'manual', '求二阶导数：\\(\\frac{d^2}{dx^2}\\sin x\\)', '\\(-\\sin x\\)', 'latex', '-\\sin x', NULL, '先求一阶，再求二阶。', 'exact_match', 0, 10.00, 3, 1, '自动组卷题'),
('Q_INTEGRAL_001', @tplIntegral, 'calculation', 'formula', 'math', 'senior_high', 'grade_11', 0.40, 'manual', '计算定积分：\\(\\int_0^1 x^2\\,dx\\)', '\\(\\frac{1}{3}\\)', 'latex', '\\frac{1}{3}', NULL, '原函数为 x^3/3。', 'exact_match', 0, 10.00, 3, 1, '自动组卷题'),
('Q_INTEGRAL_002', @tplIntegral, 'calculation', 'formula', 'math', 'senior_high', 'grade_11', 0.75, 'manual', '计算广义积分：\\(\\int_0^{\\infty}e^{-x^2}\\,dx\\)', '\\(\\frac{\\sqrt{\\pi}}{2}\\)', 'latex', '\\frac{\\sqrt{\\pi}}{2}', NULL, '高斯积分半区间。', 'exact_match', 0, 10.00, 5, 1, '自动组卷题'),
('Q_INTEGRAL_003', @tplIntegral, 'calculation', 'formula', 'math', 'senior_high', 'grade_11', 0.35, 'manual', '计算不定积分：\\(\\int 2x\\,dx\\)', '\\(x^2+C\\)', 'latex', 'x^2+C', NULL, '原函数加常数 C。', 'exact_match', 0, 10.00, 2, 1, '自动组卷题'),
('Q_EQUATION_001', @tplEquation, 'calculation', 'formula', 'math', 'senior_high', 'grade_11', 0.35, 'manual', '解方程：\\(x^2=1\\)', '\\(x=-1\\ 或\\ x=1\\)', 'latex', 'x=-1或x=1', NULL, '因式分解。', 'exact_match', 0, 10.00, 3, 1, '自动组卷题'),
('Q_EQUATION_002', @tplEquation, 'calculation', 'formula', 'math', 'senior_high', 'grade_11', 0.25, 'manual', '解方程：\\(2x+3=7\\)', '\\(x=2\\)', 'latex', '2', NULL, '移项求解。', 'exact_match', 0, 10.00, 2, 1, '自动组卷题'),
('Q_FILL_001', NULL, 'fill_blank', 'formula', 'math', 'senior_high', 'grade_11', 0.20, 'manual', '填空：\\(\\sqrt{16}=\\underline{\\quad}\\)', '\\(4\\)', 'latex', '4', NULL, '4 的平方是 16。', 'exact_match', 1, 5.00, 1, 1, '自动组卷题'),
('Q_CHOICE_001', @tplChoice, 'single_choice', 'choice', 'math', 'senior_high', 'grade_11', 0.20, 'manual', '单选：函数 \\(y=x^2\\) 的导数是？', 'A', 'latex', 'A', NULL, '导数为 2x。', 'exact_match', 0, 5.00, 1, 1, '自动组卷题')
ON DUPLICATE KEY UPDATE
  `templateId` = VALUES(`templateId`),
  `questionType` = VALUES(`questionType`),
  `inputType` = VALUES(`inputType`),
  `difficulty` = VALUES(`difficulty`),
  `stemContent` = VALUES(`stemContent`),
  `answerContent` = VALUES(`answerContent`),
  `answerValueType` = VALUES(`answerValueType`),
  `answerValue` = VALUES(`answerValue`),
  `answerExpr` = VALUES(`answerExpr`),
  `analysisContent` = VALUES(`analysisContent`),
  `judgeMode` = VALUES(`judgeMode`),
  `blankCount` = VALUES(`blankCount`),
  `defaultScore` = VALUES(`defaultScore`),
  `estimatedMinutes` = VALUES(`estimatedMinutes`),
  `status` = VALUES(`status`),
  `remark` = VALUES(`remark`);

-- ----------------------------
-- 5. 选择题选项
-- ----------------------------
INSERT INTO `question_option` (`questionId`, `optionKey`, `optionContent`, `isCorrect`, `sortNo`)
SELECT `id`, 'A', '\\(2x\\)', 1, 1 FROM `question` WHERE `questionCode` = 'Q_CHOICE_001' AND `isDelete` = 0
ON DUPLICATE KEY UPDATE `optionContent` = VALUES(`optionContent`), `isCorrect` = VALUES(`isCorrect`), `sortNo` = VALUES(`sortNo`);

INSERT INTO `question_option` (`questionId`, `optionKey`, `optionContent`, `isCorrect`, `sortNo`)
SELECT `id`, 'B', '\\(x\\)', 0, 2 FROM `question` WHERE `questionCode` = 'Q_CHOICE_001' AND `isDelete` = 0
ON DUPLICATE KEY UPDATE `optionContent` = VALUES(`optionContent`), `isCorrect` = VALUES(`isCorrect`), `sortNo` = VALUES(`sortNo`);

INSERT INTO `question_option` (`questionId`, `optionKey`, `optionContent`, `isCorrect`, `sortNo`)
SELECT `id`, 'C', '\\(x^2\\)', 0, 3 FROM `question` WHERE `questionCode` = 'Q_CHOICE_001' AND `isDelete` = 0
ON DUPLICATE KEY UPDATE `optionContent` = VALUES(`optionContent`), `isCorrect` = VALUES(`isCorrect`), `sortNo` = VALUES(`sortNo`);

INSERT INTO `question_option` (`questionId`, `optionKey`, `optionContent`, `isCorrect`, `sortNo`)
SELECT `id`, 'D', '\\(2\\)', 0, 4 FROM `question` WHERE `questionCode` = 'Q_CHOICE_001' AND `isDelete` = 0
ON DUPLICATE KEY UPDATE `optionContent` = VALUES(`optionContent`), `isCorrect` = VALUES(`isCorrect`), `sortNo` = VALUES(`sortNo`);

-- ----------------------------
-- 6. 题目-知识点关联
-- ----------------------------
INSERT INTO `question_knowledge` (`questionId`, `knowledgePointId`, `weight`)
SELECT q.`id`, k.`id`, 1.00
FROM `question` q
JOIN `knowledge_point` k ON k.`pointCode` = 'KP_LIMIT' AND k.`isDelete` = 0
WHERE q.`questionCode` IN ('Q_LIMIT_001', 'Q_LIMIT_002', 'Q_LIMIT_003') AND q.`isDelete` = 0
ON DUPLICATE KEY UPDATE `weight` = VALUES(`weight`);

INSERT INTO `question_knowledge` (`questionId`, `knowledgePointId`, `weight`)
SELECT q.`id`, k.`id`, 1.00
FROM `question` q
JOIN `knowledge_point` k ON k.`pointCode` = 'KP_DERIVATIVE' AND k.`isDelete` = 0
WHERE q.`questionCode` IN ('Q_DERIVATIVE_001', 'Q_DERIVATIVE_002', 'Q_CHOICE_001') AND q.`isDelete` = 0
ON DUPLICATE KEY UPDATE `weight` = VALUES(`weight`);

INSERT INTO `question_knowledge` (`questionId`, `knowledgePointId`, `weight`)
SELECT q.`id`, k.`id`, 1.00
FROM `question` q
JOIN `knowledge_point` k ON k.`pointCode` = 'KP_INTEGRAL' AND k.`isDelete` = 0
WHERE q.`questionCode` IN ('Q_INTEGRAL_001', 'Q_INTEGRAL_002', 'Q_INTEGRAL_003') AND q.`isDelete` = 0
ON DUPLICATE KEY UPDATE `weight` = VALUES(`weight`);

INSERT INTO `question_knowledge` (`questionId`, `knowledgePointId`, `weight`)
SELECT q.`id`, k.`id`, 1.00
FROM `question` q
JOIN `knowledge_point` k ON k.`pointCode` = 'KP_EQUATION' AND k.`isDelete` = 0
WHERE q.`questionCode` IN ('Q_EQUATION_001', 'Q_EQUATION_002') AND q.`isDelete` = 0
ON DUPLICATE KEY UPDATE `weight` = VALUES(`weight`);

INSERT INTO `question_knowledge` (`questionId`, `knowledgePointId`, `weight`)
SELECT q.`id`, k.`id`, 1.00
FROM `question` q
JOIN `knowledge_point` k ON k.`pointCode` = 'KP_FUNCTION' AND k.`isDelete` = 0
WHERE q.`questionCode` IN ('Q_FILL_001') AND q.`isDelete` = 0
ON DUPLICATE KEY UPDATE `weight` = VALUES(`weight`);

-- ----------------------------
-- 7. 自动组卷规则
-- ----------------------------
INSERT INTO `paper_rule`
(`ruleCode`, `ruleName`, `subjectCode`, `schoolStage`, `gradeLevel`, `paperType`, `questionCount`, `totalScore`, `targetDifficulty`, `ruleConfig`, `status`, `remark`)
VALUES
('RULE_AUTO_MATH_001', '高二数学自动组卷规则-微积分综合', 'math', 'senior_high', 'grade_11', 'homework', 8, 70.00, 0.45,
 '{
   "strategy":"difficulty_balanced",
   "sections":[
     {"sectionName":"一、选择题","questionType":"single_choice","count":1,"score":5,"knowledgePointCodes":["KP_DERIVATIVE","KP_FUNCTION"]},
     {"sectionName":"二、填空题","questionType":"fill_blank","count":1,"score":5,"knowledgePointCodes":["KP_FUNCTION"]},
     {"sectionName":"三、计算题","questionType":"calculation","count":6,"score":10,"knowledgePointCodes":["KP_LIMIT","KP_DERIVATIVE","KP_INTEGRAL","KP_EQUATION"]}
   ],
   "difficultyRange":[0.20,0.80],
   "avoidRepeatDays":7
 }', 1, '可按题型、知识点、难度自动抽题')
ON DUPLICATE KEY UPDATE
  `ruleName` = VALUES(`ruleName`),
  `questionCount` = VALUES(`questionCount`),
  `totalScore` = VALUES(`totalScore`),
  `targetDifficulty` = VALUES(`targetDifficulty`),
  `ruleConfig` = VALUES(`ruleConfig`),
  `status` = VALUES(`status`),
  `remark` = VALUES(`remark`);

SET @ruleId = (SELECT `id` FROM `paper_rule` WHERE `ruleCode` = 'RULE_AUTO_MATH_001' AND `isDelete` = 0 LIMIT 1);

-- ----------------------------
-- 8. 自动组卷生成示例试卷
-- ----------------------------
INSERT INTO `paper`
(`paperCode`, `paperName`, `ruleId`, `paperType`, `subjectCode`, `schoolStage`, `gradeLevel`, `sourceType`, `difficulty`, `questionCount`, `totalScore`, `durationMinutes`, `status`, `remark`)
VALUES
('PAPER_AUTO_DEMO_001', '高二数学智能作业-自动组卷样卷', @ruleId, 'homework', 'math', 'senior_high', 'grade_11', 'auto', 0.45, 8, 70.00, 40, 1, '由 RULE_AUTO_MATH_001 生成的演示试卷')
ON DUPLICATE KEY UPDATE
  `paperName` = VALUES(`paperName`),
  `ruleId` = VALUES(`ruleId`),
  `sourceType` = VALUES(`sourceType`),
  `difficulty` = VALUES(`difficulty`),
  `questionCount` = VALUES(`questionCount`),
  `totalScore` = VALUES(`totalScore`),
  `durationMinutes` = VALUES(`durationMinutes`),
  `status` = VALUES(`status`),
  `remark` = VALUES(`remark`);

SET @paperId = (SELECT `id` FROM `paper` WHERE `paperCode` = 'PAPER_AUTO_DEMO_001' AND `isDelete` = 0 LIMIT 1);

INSERT INTO `paper_question`
(`paperId`, `questionId`, `templateId`, `sectionName`, `questionNo`, `questionType`, `score`, `sortNo`, `difficultySnapshot`, `stemContentSnapshot`, `answerContentSnapshot`, `answerValueTypeSnapshot`, `answerValueSnapshot`, `answerExprSnapshot`, `analysisContentSnapshot`)
SELECT @paperId, q.`id`, q.`templateId`, seed.`sectionName`, seed.`questionNo`, q.`questionType`, seed.`score`, seed.`questionNo`, q.`difficulty`, q.`stemContent`, q.`answerContent`, q.`answerValueType`, q.`answerValue`, q.`answerExpr`, q.`analysisContent`
FROM (
  SELECT 'Q_CHOICE_001' AS `questionCode`, '一、选择题' AS `sectionName`, 1 AS `questionNo`, 5.00 AS `score`
  UNION ALL SELECT 'Q_FILL_001', '二、填空题', 2, 5.00
  UNION ALL SELECT 'Q_LIMIT_001', '三、计算题', 3, 10.00
  UNION ALL SELECT 'Q_DERIVATIVE_001', '三、计算题', 4, 10.00
  UNION ALL SELECT 'Q_INTEGRAL_001', '三、计算题', 5, 10.00
  UNION ALL SELECT 'Q_EQUATION_001', '三、计算题', 6, 10.00
  UNION ALL SELECT 'Q_INTEGRAL_002', '三、计算题', 7, 10.00
  UNION ALL SELECT 'Q_LIMIT_002', '三、计算题', 8, 10.00
) seed
JOIN `question` q ON q.`questionCode` = seed.`questionCode` AND q.`isDelete` = 0
ON DUPLICATE KEY UPDATE
  `questionId` = VALUES(`questionId`),
  `templateId` = VALUES(`templateId`),
  `sectionName` = VALUES(`sectionName`),
  `questionType` = VALUES(`questionType`),
  `score` = VALUES(`score`),
  `sortNo` = VALUES(`sortNo`),
  `difficultySnapshot` = VALUES(`difficultySnapshot`),
  `stemContentSnapshot` = VALUES(`stemContentSnapshot`),
  `answerContentSnapshot` = VALUES(`answerContentSnapshot`),
  `answerValueTypeSnapshot` = VALUES(`answerValueTypeSnapshot`),
  `answerValueSnapshot` = VALUES(`answerValueSnapshot`),
  `answerExprSnapshot` = VALUES(`answerExprSnapshot`),
  `analysisContentSnapshot` = VALUES(`analysisContentSnapshot`);

INSERT INTO `paper_question_option`
(`paperQuestionId`, `optionKey`, `optionContent`, `sortNo`)
SELECT pq.`id`, qo.`optionKey`, qo.`optionContent`, qo.`sortNo`
FROM `paper_question` pq
JOIN `question` q ON q.`id` = pq.`questionId` AND q.`questionCode` = 'Q_CHOICE_001'
JOIN `question_option` qo ON qo.`questionId` = q.`id` AND qo.`isDelete` = 0
WHERE pq.`paperId` = @paperId AND pq.`isDelete` = 0
ON DUPLICATE KEY UPDATE `optionContent` = VALUES(`optionContent`), `sortNo` = VALUES(`sortNo`);

-- ----------------------------
-- 9. 作业发布
-- ----------------------------
INSERT INTO `homework_task`
(`taskCode`, `paperId`, `taskName`, `teacherId`, `classId`, `pushType`, `publishTime`, `deadlineTime`, `allowRetry`, `status`, `remark`)
VALUES
('TASK_AUTO_DEMO_001', @paperId, '智能作业-微积分综合练习', @teacherId, @classId, 'manual', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 1, 1, '自动组卷样卷发布给演示班')
ON DUPLICATE KEY UPDATE
  `paperId` = VALUES(`paperId`),
  `taskName` = VALUES(`taskName`),
  `teacherId` = VALUES(`teacherId`),
  `classId` = VALUES(`classId`),
  `allowRetry` = VALUES(`allowRetry`),
  `status` = VALUES(`status`),
  `remark` = VALUES(`remark`);

SET @taskId = (SELECT `id` FROM `homework_task` WHERE `taskCode` = 'TASK_AUTO_DEMO_001' AND `isDelete` = 0 LIMIT 1);

INSERT INTO `homework_task_student`
(`taskId`, `studentId`, `paperId`, `status`, `startTime`, `submitTime`, `objectiveScore`, `totalScore`, `autoCorrectStatus`, `teacherReviewStatus`, `masterySnapshot`)
VALUES
(@taskId, @studentZhangId, @paperId, 'corrected', DATE_SUB(NOW(), INTERVAL 1 HOUR), NOW(), 55.00, 70.00, 'finished', 'not_required', NULL),
(@taskId, @studentLiId, @paperId, 'pending', NULL, NULL, 0.00, 0.00, 'waiting', 'not_required', NULL),
(@taskId, @studentWangId, @paperId, 'pending', NULL, NULL, 0.00, 0.00, 'waiting', 'not_required', NULL)
ON DUPLICATE KEY UPDATE
  `paperId` = VALUES(`paperId`),
  `status` = VALUES(`status`),
  `objectiveScore` = VALUES(`objectiveScore`),
  `totalScore` = VALUES(`totalScore`),
  `autoCorrectStatus` = VALUES(`autoCorrectStatus`),
  `teacherReviewStatus` = VALUES(`teacherReviewStatus`),
  `masterySnapshot` = VALUES(`masterySnapshot`);

SET @taskStudentZhangId = (SELECT `id` FROM `homework_task_student` WHERE `taskId` = @taskId AND `studentId` = @studentZhangId AND `isDelete` = 0 LIMIT 1);

-- ----------------------------
-- 10. 作答与批改记录：字符串相等比对
-- ----------------------------
INSERT INTO `student_answer`
(`taskStudentId`, `paperQuestionId`, `questionId`, `studentId`, `attemptNo`, `answerContent`, `answerValueType`, `answerValue`, `answerExpr`, `judgeResult`, `judgeScore`, `isCorrect`, `feedbackContent`, `submitTime`, `autoCorrectTime`, `reviewerId`)
SELECT @taskStudentZhangId, pq.`id`, pq.`questionId`, @studentZhangId, 1, '\\(1\\)', 'latex', '1', NULL, 'correct', pq.`score`, 1, '答案正确。', NOW(), NOW(), 0
FROM `paper_question` pq
JOIN `question` q ON q.`id` = pq.`questionId`
WHERE pq.`paperId` = @paperId AND q.`questionCode` = 'Q_LIMIT_001' AND pq.`isDelete` = 0
ON DUPLICATE KEY UPDATE
  `answerContent` = VALUES(`answerContent`),
  `answerValueType` = VALUES(`answerValueType`),
  `answerValue` = VALUES(`answerValue`),
  `judgeResult` = VALUES(`judgeResult`),
  `judgeScore` = VALUES(`judgeScore`),
  `isCorrect` = VALUES(`isCorrect`),
  `feedbackContent` = VALUES(`feedbackContent`),
  `submitTime` = VALUES(`submitTime`),
  `autoCorrectTime` = VALUES(`autoCorrectTime`);

INSERT INTO `student_answer`
(`taskStudentId`, `paperQuestionId`, `questionId`, `studentId`, `attemptNo`, `answerContent`, `answerValueType`, `answerValue`, `answerExpr`, `judgeResult`, `judgeScore`, `isCorrect`, `feedbackContent`, `submitTime`, `autoCorrectTime`, `reviewerId`)
SELECT @taskStudentZhangId, pq.`id`, pq.`questionId`, @studentZhangId, 1, '\\(\\sqrt{\\pi}\\)', 'latex', '\\sqrt{\\pi}', NULL, 'wrong', 0.00, 0, '字符串比对不一致，标准答案是 \\frac{\\sqrt{\\pi}}{2}。', NOW(), NOW(), 0
FROM `paper_question` pq
JOIN `question` q ON q.`id` = pq.`questionId`
WHERE pq.`paperId` = @paperId AND q.`questionCode` = 'Q_INTEGRAL_002' AND pq.`isDelete` = 0
ON DUPLICATE KEY UPDATE
  `answerContent` = VALUES(`answerContent`),
  `answerValueType` = VALUES(`answerValueType`),
  `answerValue` = VALUES(`answerValue`),
  `judgeResult` = VALUES(`judgeResult`),
  `judgeScore` = VALUES(`judgeScore`),
  `isCorrect` = VALUES(`isCorrect`),
  `feedbackContent` = VALUES(`feedbackContent`),
  `submitTime` = VALUES(`submitTime`),
  `autoCorrectTime` = VALUES(`autoCorrectTime`);

INSERT INTO `answer_judge_record`
(`studentAnswerId`, `questionId`, `paperQuestionId`, `judgeMode`, `standardLatex`, `studentLatex`, `answerValueType`, `standardAnswerValue`, `studentAnswerValue`, `standardExpr`, `studentExpr`, `calculateResult`, `resultLatex`, `judgeResult`, `judgeScore`, `equivalent`, `judgeDetail`, `errorReason`)
SELECT sa.`id`, sa.`questionId`, sa.`paperQuestionId`, 'exact_match', q.`answerContent`, sa.`answerContent`, q.`answerValueType`, q.`answerValue`, sa.`answerValue`, NULL, NULL,
       CONCAT('standardAnswerValue=', q.`answerValue`, '; studentAnswerValue=', sa.`answerValue`), NULL,
       sa.`judgeResult`, sa.`judgeScore`, sa.`isCorrect`, NULL, NULL
FROM `student_answer` sa
JOIN `question` q ON q.`id` = sa.`questionId`
WHERE sa.`taskStudentId` = @taskStudentZhangId AND sa.`isDelete` = 0
  AND NOT EXISTS (
    SELECT 1 FROM `answer_judge_record` ajr
    WHERE ajr.`studentAnswerId` = sa.`id` AND ajr.`isDelete` = 0
  );

INSERT INTO `student_knowledge_mastery`
(`studentId`, `knowledgePointId`, `masteryLevel`, `rightCount`, `wrongCount`, `partialCount`, `lastAnswerTime`, `lastWrongTime`, `masteryDetail`)
VALUES
(@studentZhangId, @kpLimit, 80.00, 4, 1, 0, NOW(), DATE_SUB(NOW(), INTERVAL 2 DAY), NULL),
(@studentZhangId, @kpDerivative, 90.00, 5, 0, 0, NOW(), NULL, NULL),
(@studentZhangId, @kpIntegral, 60.00, 2, 2, 0, NOW(), NOW(), NULL),
(@studentZhangId, @kpEquation, 70.00, 3, 1, 0, NOW(), DATE_SUB(NOW(), INTERVAL 1 DAY), NULL)
ON DUPLICATE KEY UPDATE
  `masteryLevel` = VALUES(`masteryLevel`),
  `rightCount` = VALUES(`rightCount`),
  `wrongCount` = VALUES(`wrongCount`),
  `partialCount` = VALUES(`partialCount`),
  `lastAnswerTime` = VALUES(`lastAnswerTime`),
  `lastWrongTime` = VALUES(`lastWrongTime`),
  `masteryDetail` = VALUES(`masteryDetail`);

INSERT INTO `wrong_question_book`
(`studentId`, `questionId`, `paperQuestionId`, `studentAnswerId`, `wrongReason`, `wrongSnapshot`, `reviewCount`, `mastered`, `lastReviewTime`)
SELECT @studentZhangId, sa.`questionId`, sa.`paperQuestionId`, sa.`id`, 'concept', NULL, 0, 0, NULL
FROM `student_answer` sa
JOIN `question` q ON q.`id` = sa.`questionId`
WHERE sa.`taskStudentId` = @taskStudentZhangId AND q.`questionCode` = 'Q_INTEGRAL_002' AND sa.`isDelete` = 0
  AND NOT EXISTS (
    SELECT 1 FROM `wrong_question_book` wqb
    WHERE wqb.`studentAnswerId` = sa.`id` AND wqb.`isDelete` = 0
  );

-- ----------------------------
-- 11. 自动组卷查询参考
-- ----------------------------
-- SELECT q.*
-- FROM question q
-- JOIN question_knowledge qk ON qk.questionId = q.id AND qk.isDelete = 0
-- JOIN knowledge_point kp ON kp.id = qk.knowledgePointId AND kp.isDelete = 0
-- WHERE q.subjectCode = 'math'
--   AND q.schoolStage = 'senior_high'
--   AND q.gradeLevel = 'grade_11'
--   AND q.questionType = 'calculation'
--   AND q.status = 1
--   AND q.isDelete = 0
--   AND kp.pointCode IN ('KP_LIMIT','KP_DERIVATIVE','KP_INTEGRAL','KP_EQUATION')
--   AND q.difficulty BETWEEN 0.20 AND 0.80
-- GROUP BY q.id
-- ORDER BY ABS(q.difficulty - 0.45), RAND()
-- LIMIT 6;

SET FOREIGN_KEY_CHECKS = 1;
