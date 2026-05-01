import { GridContent } from '@ant-design/pro-components';
import type { FC } from 'react';
import { Metric, PageHero, WrongQuestionsPanel } from '@/components/MathPaper/Panels';

const WrongQuestions: FC = () => (
  <GridContent>
    <PageHero title="错题本" subtitle="集中复习错题，查看标准答案和解析，掌握后标记完成。">
      <Metric label="复习状态" value="可追踪" />
      <Metric label="解析" value="随题展示" />
    </PageHero>
    <WrongQuestionsPanel />
  </GridContent>
);

export default WrongQuestions;
