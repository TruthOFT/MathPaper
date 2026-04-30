/*
 MySQL 8.0 migration
 Project: 智能作业本-数学自动测试及批改系统设计
 Purpose:
 1. 数据库不再保存 MathJSON。
 2. 标准答案、学生答案都按 MathLive LaTeX 字符串保存。
 3. 自动批改默认使用 exact_match 字符串相等比对。
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
USE `math_paper`;

DELIMITER $$

DROP PROCEDURE IF EXISTS `add_column_if_not_exists`$$
CREATE PROCEDURE `add_column_if_not_exists`(
  IN p_tableName varchar(64),
  IN p_columnName varchar(64),
  IN p_columnSql text
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_tableName
      AND COLUMN_NAME = p_columnName
  ) THEN
    SET @sqlText = CONCAT('ALTER TABLE `', p_tableName, '` ADD COLUMN ', p_columnSql);
    PREPARE stmt FROM @sqlText;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$

DROP PROCEDURE IF EXISTS `drop_column_if_exists`$$
CREATE PROCEDURE `drop_column_if_exists`(
  IN p_tableName varchar(64),
  IN p_columnName varchar(64)
)
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_tableName
      AND COLUMN_NAME = p_columnName
  ) THEN
    SET @sqlText = CONCAT('ALTER TABLE `', p_tableName, '` DROP COLUMN `', p_columnName, '`');
    PREPARE stmt FROM @sqlText;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$

DELIMITER ;

-- ----------------------------
-- 1. 删除 MathJSON 入库字段
-- ----------------------------
CALL `drop_column_if_exists`('question', 'stemMathJson');
CALL `drop_column_if_exists`('question', 'answerMathJson');
CALL `drop_column_if_exists`('question', 'judgeConfig');

CALL `drop_column_if_exists`('question_template', 'stemMathJsonTemplate');
CALL `drop_column_if_exists`('question_template', 'answerMathJsonTemplate');

CALL `drop_column_if_exists`('paper_question', 'stemMathJsonSnapshot');
CALL `drop_column_if_exists`('paper_question', 'answerMathJsonSnapshot');

CALL `drop_column_if_exists`('student_answer', 'answerMathJson');

CALL `drop_column_if_exists`('answer_judge_record', 'standardMathJson');
CALL `drop_column_if_exists`('answer_judge_record', 'studentMathJson');

-- ----------------------------
-- 2. 新增字符串答案字段
-- ----------------------------
CALL `add_column_if_not_exists`(
  'question',
  'answerValueType',
  '`answerValueType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ''latex'' COMMENT ''答案值类型：统一为latex'' AFTER `answerContent`'
);

CALL `add_column_if_not_exists`(
  'question',
  'answerValue',
  '`answerValue` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT ''标准答案判题值，按字符串相等比对'' AFTER `answerValueType`'
);

CALL `add_column_if_not_exists`(
  'question_template',
  'answerValueType',
  '`answerValueType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ''latex'' COMMENT ''答案值类型：统一为latex'' AFTER `answerTemplate`'
);

CALL `add_column_if_not_exists`(
  'question_template',
  'answerValueTemplate',
  '`answerValueTemplate` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT ''答案判题值模板，按字符串相等比对'' AFTER `answerValueType`'
);

CALL `add_column_if_not_exists`(
  'paper_question',
  'answerValueTypeSnapshot',
  '`answerValueTypeSnapshot` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ''latex'' COMMENT ''答案值类型快照：统一为latex'' AFTER `answerContentSnapshot`'
);

CALL `add_column_if_not_exists`(
  'paper_question',
  'answerValueSnapshot',
  '`answerValueSnapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT ''标准答案判题值快照，按字符串相等比对'' AFTER `answerValueTypeSnapshot`'
);

CALL `add_column_if_not_exists`(
  'student_answer',
  'answerValueType',
  '`answerValueType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ''latex'' COMMENT ''学生答案值类型：统一为latex'' AFTER `answerContent`'
);

CALL `add_column_if_not_exists`(
  'student_answer',
  'answerValue',
  '`answerValue` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT ''学生答案判题值，按字符串相等比对'' AFTER `answerValueType`'
);

CALL `add_column_if_not_exists`(
  'answer_judge_record',
  'answerValueType',
  '`answerValueType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ''latex'' COMMENT ''答案值类型：统一为latex'' AFTER `studentLatex`'
);

CALL `add_column_if_not_exists`(
  'answer_judge_record',
  'standardAnswerValue',
  '`standardAnswerValue` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT ''标准答案判题值'' AFTER `answerValueType`'
);

CALL `add_column_if_not_exists`(
  'answer_judge_record',
  'studentAnswerValue',
  '`studentAnswerValue` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT ''学生答案判题值'' AFTER `standardAnswerValue`'
);

-- ----------------------------
-- 3. 默认判题方式改为字符串相等
-- ----------------------------
ALTER TABLE `question`
  MODIFY COLUMN `judgeMode` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'exact_match' COMMENT '判题方式：exact_match';

ALTER TABLE `answer_judge_record`
  MODIFY COLUMN `judgeMode` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'exact_match' COMMENT '判题方式：exact_match';

UPDATE `question`
SET `judgeMode` = 'exact_match'
WHERE `judgeMode` = 'expression_equivalent';

UPDATE `answer_judge_record`
SET `judgeMode` = 'exact_match'
WHERE `judgeMode` = 'expression_equivalent';

UPDATE `question`
SET `judgeMode` = 'exact_match'
WHERE `judgeMode` = 'option_match';

UPDATE `answer_judge_record`
SET `judgeMode` = 'exact_match'
WHERE `judgeMode` = 'option_match';

UPDATE `question`
SET `answerValueType` = 'latex';

UPDATE `question_template`
SET `answerValueType` = 'latex';

UPDATE `paper_question`
SET `answerValueTypeSnapshot` = 'latex';

UPDATE `student_answer`
SET `answerValueType` = 'latex';

UPDATE `answer_judge_record`
SET `answerValueType` = 'latex';

-- ----------------------------
-- 4. 旧数据兜底：answerValue 为空时，用 answerContent 填充
-- ----------------------------
UPDATE `question`
SET `answerValue` = `answerContent`
WHERE `answerValue` IS NULL
  AND `answerContent` IS NOT NULL;

UPDATE `paper_question`
SET `answerValueSnapshot` = `answerContentSnapshot`
WHERE `answerValueSnapshot` IS NULL
  AND `answerContentSnapshot` IS NOT NULL;

UPDATE `student_answer`
SET `answerValue` = `answerContent`
WHERE `answerValue` IS NULL
  AND `answerContent` IS NOT NULL;

DROP PROCEDURE IF EXISTS `add_column_if_not_exists`;
DROP PROCEDURE IF EXISTS `drop_column_if_exists`;

SET FOREIGN_KEY_CHECKS = 1;
