import { GridContent } from '@ant-design/pro-components';
import type { FC } from 'react';
import {
  ManualPaperManager,
  Metric,
  PageHero,
} from '@/components/MathPaper/Panels';

const ManualPapers: FC = () => (
  <GridContent>
    <PageHero title="手动组卷" subtitle="从题库直接勾选题目，设置分值后生成试卷。">
      <Metric label="组卷方式" value="人工选题" />
      <Metric label="题目来源" value="题库" />
    </PageHero>
    <ManualPaperManager />
  </GridContent>
);

export default ManualPapers;
