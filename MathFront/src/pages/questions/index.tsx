import { GridContent } from '@ant-design/pro-components';
import type { FC } from 'react';
import { Metric, PageHero, QuestionManager } from '@/components/MathPaper/Panels';

const Questions: FC = () => (
  <GridContent>
    <PageHero title="题库管理" subtitle="维护题干、标准答案、解析、难度和知识点，答案统一保存 LaTeX。">
      <Metric label="题型" value="计算/填空/选择" />
      <Metric label="答案格式" value="LaTeX" />
    </PageHero>
    <QuestionManager />
  </GridContent>
);

export default Questions;
