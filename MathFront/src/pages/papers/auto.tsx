import { GridContent } from '@ant-design/pro-components';
import type { FC } from 'react';
import { Metric, PageHero, PaperManager } from '@/components/MathPaper/Panels';

const AutoPapers: FC = () => (
  <GridContent>
    <PageHero title="自动组卷" subtitle="按规则生成试卷，再发布到班级形成作业。">
      <Metric label="组卷方式" value="规则生成" />
      <Metric label="发布对象" value="班级" />
    </PageHero>
    <PaperManager />
  </GridContent>
);

export default AutoPapers;
