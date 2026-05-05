import { GridContent } from '@ant-design/pro-components';
import type { FC } from 'react';
import { StudentManagementPanel } from '@/components/MathPaper/Panels';

const StudentsPage: FC = () => (
  <GridContent>
    <StudentManagementPanel />
  </GridContent>
);

export default StudentsPage;
