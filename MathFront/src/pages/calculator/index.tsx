import { GridContent } from '@ant-design/pro-components';
import type { FC } from 'react';
import { CalculatorPanel } from '@/components/MathPaper/Panels';

const Calculator: FC = () => (
  <GridContent>
    <CalculatorPanel />
  </GridContent>
);

export default Calculator;
