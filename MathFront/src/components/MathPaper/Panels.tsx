import {
  BarChartOutlined,
  CalculatorOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FileAddOutlined,
  FileTextOutlined,
  PlusOutlined,
  SendOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { ComputeEngine } from '@cortex-js/compute-engine';
import type { TableColumnsType } from 'antd';
import {
  App as AntApp,
  Button,
  Card,
  Col,
  Collapse,
  Divider,
  Empty,
  Flex,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Popconfirm,
  Progress,
  Row,
  Segmented,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import 'katex/dist/katex.min.css';
import './mathpaper.css';
import { useModel } from '@umijs/max';
import { mathRequest } from '@/services/mathpaper';
import { LatexText } from './LatexText';
import { MathInput } from './MathInput';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const computeEngine = new ComputeEngine();

type Id = number | string;

type KnowledgePoint = {
  id: Id;
  pointCode: string;
  pointName: string;
};

type QuestionOption = {
  id?: Id;
  optionKey: string;
  optionContent: string;
  isCorrect: number;
  sortNo: number;
};

type Question = {
  id: Id;
  questionCode: string;
  questionType: string;
  inputType: string;
  stemContent: string;
  answerContent: string;
  answerValue: string;
  analysisContent: string;
  difficulty: number;
  defaultScore: number;
  blankCount: number;
  estimatedMinutes: number;
  knowledgePointIds: Id[];
  options: QuestionOption[];
};

type PaperRule = {
  id: Id;
  ruleName: string;
  schoolStage: string;
  gradeLevel: string;
  paperType: string;
  questionCount: number;
  totalScore: number;
  targetDifficulty: number;
  ruleConfig: string;
  remark?: string;
  updateTime?: string;
};

type PaperRuleSection = {
  sectionName: string;
  questionType: string;
  count: number;
  score: number;
  knowledgePointCodes: string[];
};

type PaperRuleFormState = {
  ruleName: string;
  schoolStage: string;
  gradeLevel: string;
  paperType: string;
  targetDifficulty: number;
  remark: string;
  sections: PaperRuleSection[];
};

type Paper = {
  id: Id;
  paperCode: string;
  paperName: string;
  questionCount: number;
  totalScore: number;
};

type ManualPaperItem = {
  questionId: Id;
  score: number;
  sectionName: string;
};

type ClassInfo = {
  id: Id;
  classCode?: string;
  className: string;
  schoolStage?: string;
  gradeLevel?: string;
  status?: number;
};

type TaskSummary = {
  taskId: Id;
  taskStudentId: Id | null;
  paperId: Id;
  taskName: string;
  status: string;
  totalScore: number | null;
  deadlineTime: string | null;
};

type GradingInfo = {
  standardLatex: string;
  studentLatex: string;
  standardAnswerValue: string;
  studentAnswerValue: string;
  calculateResult: string;
  errorReason: string;
  judgeDetail: string;
  equivalent: number;
};

type PaperQuestion = {
  id: Id;
  questionNo: number;
  sectionName: string;
  questionType: string;
  score: number;
  stemContent: string;
  answerContent: string;
  answerValue: string;
  analysisContent: string;
  studentAnswer: string;
  judgeResult: string;
  judgeScore: number;
  options: QuestionOption[];
  gradingInfo: GradingInfo | null;
};

type TaskDetail = {
  taskId: Id;
  taskStudentId: Id;
  paperId: Id;
  taskName: string;
  status: string;
  questions: PaperQuestion[];
};

type DashboardMetric = {
  key: string;
  label: string;
  value: string;
};

type WeakKnowledgePoint = {
  knowledgePointId: Id;
  pointName: string;
  wrongCount: number;
};

type DashboardSummary = {
  roleType: string;
  metrics: DashboardMetric[];
  recentTasks: TaskSummary[];
  weakKnowledgePoints: WeakKnowledgePoint[];
};

type StudentInfo = {
  id: Id;
  username: string;
  realName: string;
  phone?: string;
  email?: string;
  status: number;
  classId?: Id | null;
  className?: string | null;
  studentNo?: string | null;
  joinTime?: string | null;
  createTime?: string | null;
  updateTime?: string | null;
};

type StudentFormState = {
  id?: Id;
  username: string;
  password?: string;
  realName: string;
  phone?: string;
  email?: string;
  status: number;
  classId?: Id;
  studentNo?: string;
};

type TaskStudent = {
  taskStudentId: Id;
  studentId: Id;
  studentName: string;
  studentNo: string;
  status: string;
  totalScore: number | null;
  submitTime: string | null;
  wrongCount: number;
};

type QuestionStat = {
  paperQuestionId: Id;
  questionNo: number;
  questionType: string;
  score: number;
  stemContent: string;
  attemptCount: number;
  correctCount: number;
  correctRate: number;
};

type WeakKpStat = {
  knowledgePointId: Id;
  pointName: string;
  wrongCount: number;
};

type TaskStatistics = {
  taskId: Id;
  taskName: string;
  totalStudents: number;
  submittedCount: number;
  pendingCount: number;
  submissionRate: number;
  averageScore: number;
  maxScore: number;
  minScore: number;
  scoreDistribution: Record<string, number>;
  perQuestionStats: QuestionStat[];
  weakKnowledgePoints: WeakKpStat[];
};

type WrongQuestion = {
  id: Id;
  taskStudentId: Id | null;
  questionId: Id;
  paperQuestionId: Id;
  taskName: string;
  stemContent: string;
  studentAnswer: string;
  standardAnswer: string;
  analysisContent: string;
  wrongReason: string;
  reviewCount: number;
  mastered: number;
  wrongTime: string;
  options: QuestionOption[];
};

type CalculateResponse = {
  latex: string;
  mathJson: unknown;
  symjaExpression: string;
  result: string;
  resultLatex: string;
  message: string;
};

type MatrixAction =
  | 'determinant'
  | 'rowReduce'
  | 'matrixRank'
  | 'nullSpace'
  | 'linearSolve'
  | 'eigenvalues'
  | 'eigenvectors'
  | 'trace';

type MatrixInfo = {
  node: unknown[];
  rowCount: number;
  columnCount: number;
};

const matrixActionLabel: Record<MatrixAction, string> = {
  determinant: '行列式',
  rowReduce: '行最简',
  matrixRank: '秩',
  nullSpace: '零空间',
  linearSolve: '线性方程组',
  eigenvalues: '特征值',
  eigenvectors: '特征向量',
  trace: '迹',
};

const isJsonArray = (value: unknown): value is unknown[] =>
  Array.isArray(value);

const getMatrixInfo = (value: unknown): MatrixInfo | null => {
  const node = unwrapMatrixNode(value);
  if (!node) {
    return null;
  }

  const rowsNode = node[1];
  if (!isJsonArray(rowsNode) || rowsNode[0] !== 'List') {
    return null;
  }

  let columnCount: number | null = null;
  for (let i = 1; i < rowsNode.length; i += 1) {
    const rowNode = rowsNode[i];
    if (!isJsonArray(rowNode) || rowNode[0] !== 'List') {
      return null;
    }

    const currentColumnCount = rowNode.length - 1;
    if (columnCount === null) {
      columnCount = currentColumnCount;
    } else if (columnCount !== currentColumnCount) {
      return null;
    }
  }

  return {
    node,
    rowCount: rowsNode.length - 1,
    columnCount: columnCount ?? 0,
  };
};

const unwrapMatrixNode = (value: unknown): unknown[] | null => {
  if (!isJsonArray(value)) {
    return null;
  }

  if (value[0] === 'Matrix') {
    return value;
  }

  if (value[0] === 'List' && value.length === 2) {
    return unwrapMatrixNode(value[1]);
  }

  return null;
};

const buildMatrixActionMathJson = (
  action: MatrixAction,
  matrixInfo: MatrixInfo,
): unknown[] | null => {
  if (action === 'linearSolve') {
    return buildLinearSolveFromAugmentedMatrix(matrixInfo);
  }

  const headByAction: Record<Exclude<MatrixAction, 'linearSolve'>, string> = {
    determinant: 'Determinant',
    rowReduce: 'RowReduce',
    matrixRank: 'MatrixRank',
    nullSpace: 'NullSpace',
    eigenvalues: 'Eigenvalues',
    eigenvectors: 'Eigenvectors',
    trace: 'Tr',
  };

  return [headByAction[action], matrixInfo.node];
};

const buildLinearSolveFromAugmentedMatrix = (
  matrixInfo: MatrixInfo,
): unknown[] | null => {
  if (
    matrixInfo.columnCount < 2 ||
    matrixInfo.columnCount !== matrixInfo.rowCount + 1
  ) {
    return null;
  }

  const rowsNode = matrixInfo.node[1];
  if (!isJsonArray(rowsNode)) {
    return null;
  }

  const coefficientRows: unknown[] = ['List'];
  const valueRows: unknown[] = ['List'];
  for (let i = 1; i < rowsNode.length; i += 1) {
    const rowNode = rowsNode[i];
    if (!isJsonArray(rowNode)) {
      return null;
    }

    coefficientRows.push(['List', ...rowNode.slice(1, -1)]);
    valueRows.push(['List', rowNode[rowNode.length - 1]]);
  }

  return [
    'LinearSolve',
    ['Matrix', coefficientRows, "'[]'"],
    ['Matrix', valueRows, "'[]'"],
  ];
};

const normalizeLatexForComputeEngine = (value: string) => {
  const source = normalizeNthDerivativeLatex(
    stripOuterMathDelimiters(value.trim()),
  );
  return source.replace(
    /^(.+)\\(?:bigm|Bigm|middle)\s*(?:\||\\vert)\s*(_(?:\{[^{}]+\}|[^\s]+))$/,
    (_, expression: string, subscript: string) =>
      `\\left.${expression}\\right|${subscript}`,
  );
};

const stripOuterMathDelimiters = (value: string) => {
  const source = value.trim();
  if (source.startsWith('$$') && source.endsWith('$$')) {
    return source.slice(2, -2).trim();
  }
  if (source.startsWith('\\[') && source.endsWith('\\]')) {
    return source.slice(2, -2).trim();
  }
  if (source.startsWith('\\(') && source.endsWith('\\)')) {
    return source.slice(2, -2).trim();
  }
  return source;
};

const normalizeNthDerivativeLatex = (value: string) =>
  value.replace(
    /^\\(?:dfrac|tfrac|frac)\{?(?:\\mathrm\{d\}|d)\^?\{?(\d+)\}?\}?\{?(?:\\mathrm\{d\}|d)\s*([a-zA-Z])\^?\{?\1\}?\}?(.+)$/,
    (_, order: string, variable: string, expression: string) => {
      const firstDerivative = `\\frac{d}{d${variable}}`;
      return `${firstDerivative.repeat(Number(order))}${expression}`;
    },
  );

type QuestionFormState = {
  id?: Id;
  questionType: string;
  stemContent: string;
  answerValue: string;
  analysisContent: string;
  difficulty: number;
  defaultScore: number;
  blankCount: number;
  estimatedMinutes: number;
  knowledgePointIds: Id[];
  options: QuestionOption[];
};

const questionTypeLabel: Record<string, string> = {
  calculation: '计算题',
  fill_blank: '填空题',
  single_choice: '选择题',
};

const statusLabel: Record<string, string> = {
  pending: '待提交',
  published: '待提交',
  submitted: '已提交',
  corrected: '已批改',
  correct: '正确',
  wrong: '错误',
};

const statusColor: Record<string, string> = {
  pending: 'processing',
  published: 'processing',
  submitted: 'warning',
  corrected: 'success',
  correct: 'success',
  wrong: 'error',
};

const choiceQuestionTypes = new Set(['single_choice']);

const isChoiceQuestion = (questionType: string) =>
  choiceQuestionTypes.has(questionType);

const canAnswerTask = (status?: string | null) =>
  status === 'pending' || status === 'published';

const defaultOptions: QuestionOption[] = [
  { optionKey: 'A', optionContent: '\\(2x\\)', isCorrect: 1, sortNo: 1 },
  { optionKey: 'B', optionContent: '\\(x\\)', isCorrect: 0, sortNo: 2 },
  { optionKey: 'C', optionContent: '\\(x^2\\)', isCorrect: 0, sortNo: 3 },
  { optionKey: 'D', optionContent: '\\(2\\)', isCorrect: 0, sortNo: 4 },
];

const defaultQuestionForm: QuestionFormState = {
  questionType: 'calculation',
  stemContent: '计算：\\(\\int_0^1 x^2\\,dx\\)',
  answerValue: '\\frac{1}{3}',
  analysisContent:
    '原函数为 \\(\\frac{x^3}{3}\\)，代入上下限得到 \\(\\frac{1}{3}\\)。',
  difficulty: 0.4,
  defaultScore: 10,
  blankCount: 0,
  estimatedMinutes: 3,
  knowledgePointIds: [],
  options: defaultOptions,
};

const defaultRuleSection: PaperRuleSection = {
  sectionName: '计算题',
  questionType: 'calculation',
  count: 5,
  score: 10,
  knowledgePointCodes: [],
};

const defaultPaperRuleForm: PaperRuleFormState = {
  ruleName: '智能作业组卷规则',
  schoolStage: 'junior',
  gradeLevel: 'grade7',
  paperType: 'homework',
  targetDifficulty: 0.5,
  remark: '',
  sections: [defaultRuleSection],
};

export function DashboardPanel() {
  const { message } = AntApp.useApp();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSummary(await mathRequest<DashboardSummary>('/api/dashboard/summary'));
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : '看板数据加载失败',
      );
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    void load();
  }, [load]);

  const maxWrongCount = Math.max(
    1,
    ...(summary?.weakKnowledgePoints.map((item) => item.wrongCount) ?? [0]),
  );

  return (
    <Space direction="vertical" size={20} className="full-width analysis-layout">
      <Row gutter={[16, 16]}>
        {(summary?.metrics ?? []).map((metric) => (
          <Col xs={24} sm={12} xl={6} key={metric.key}>
            <Card className="panel-card analysis-metric-card" loading={loading}>
              <Statistic title={metric.label} value={metric.value} />
            </Card>
          </Col>
        ))}
        {!summary && (
          <>
            {[1, 2, 3, 4].map((item) => (
              <Col xs={24} sm={12} xl={6} key={item}>
                <Card className="panel-card analysis-metric-card" loading />
              </Col>
            ))}
          </>
        )}
      </Row>
      <Row gutter={[20, 20]} align="stretch">
        <Col xs={24} xl={15}>
          <Card
            title="最近作业"
            className="panel-card analysis-section-card"
            extra={<TeamOutlined />}
          >
            <List
              loading={loading}
              dataSource={summary?.recentTasks ?? []}
              locale={{ emptyText: <Empty description="暂无作业" /> }}
              renderItem={(task) => (
                <List.Item className="analysis-task-item">
                  <List.Item.Meta
                    title={
                      <Flex justify="space-between" gap={12} wrap="wrap">
                        <Text strong>{task.taskName}</Text>
                        <Tag color={statusColor[task.status]}>
                          {statusLabel[task.status] || task.status}
                        </Tag>
                      </Flex>
                    }
                    description={
                      <Space split={<Divider type="vertical" />} wrap>
                        <Text type="secondary">
                          截止：{task.deadlineTime || '未设置'}
                        </Text>
                        <Text type="secondary">
                          得分：{task.totalScore ?? '-'}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} xl={9}>
          <Card
            title="薄弱知识点"
            className="panel-card analysis-section-card"
            extra={<ExclamationCircleOutlined />}
          >
            <List
              loading={loading}
              dataSource={summary?.weakKnowledgePoints ?? []}
              locale={{ emptyText: <Empty description="暂无薄弱知识点" /> }}
              renderItem={(item) => (
                <List.Item>
                  <Space direction="vertical" className="full-width" size={6}>
                    <Flex justify="space-between" gap={12}>
                      <Text strong>{item.pointName}</Text>
                      <Text type="secondary">{item.wrongCount} 错</Text>
                    </Flex>
                    <Progress
                      percent={Math.round(
                        (item.wrongCount / maxWrongCount) * 100,
                      )}
                      size="small"
                    />
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
}

export function StudentManagementPanel() {
  const { message } = AntApp.useApp();
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StudentInfo | null>(null);
  const [keyword, setKeyword] = useState('');
  const [classId, setClassId] = useState<Id | undefined>();
  const [form] = Form.useForm<StudentFormState>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword.trim()) {
        params.set('keyword', keyword.trim());
      }
      if (classId) {
        params.set('classId', String(classId));
      }
      const query = params.toString();
      const [studentData, classData] = await Promise.all([
        mathRequest<StudentInfo[]>(`/api/students${query ? `?${query}` : ''}`),
        mathRequest<ClassInfo[]>('/api/catalog/classes'),
      ]);
      setStudents(studentData);
      setClasses(classData);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '学生数据加载失败');
    } finally {
      setLoading(false);
    }
  }, [classId, keyword, message]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    form.setFieldsValue({
      username: '',
      password: '123456',
      realName: '',
      phone: '',
      email: '',
      status: 1,
      classId: undefined,
      studentNo: '',
    });
    setModalOpen(true);
  };

  const openEdit = (student: StudentInfo) => {
    setEditing(student);
    form.setFieldsValue({
      id: student.id,
      username: student.username,
      password: '',
      realName: student.realName,
      phone: student.phone,
      email: student.email,
      status: student.status,
      classId: student.classId ?? undefined,
      studentNo: student.studentNo ?? '',
    });
    setModalOpen(true);
  };

  const save = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      await mathRequest<StudentInfo>('/api/students', {
        method: 'POST',
        data: {
          ...values,
          id: editing?.id,
          password: values.password?.trim() || undefined,
        },
      });
      message.success('学生已保存');
      setModalOpen(false);
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存失败');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (student: StudentInfo) => {
    setLoading(true);
    try {
      await mathRequest<void>(`/api/students/${student.id}`, {
        method: 'DELETE',
      });
      message.success('学生已删除');
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除失败');
    } finally {
      setLoading(false);
    }
  };

  const columns: TableColumnsType<StudentInfo> = [
    {
      title: '姓名',
      dataIndex: 'realName',
      render: (value: string, row) => (
        <Space direction="vertical" size={0}>
          <Text strong>{value}</Text>
          <Text type="secondary">{row.username}</Text>
        </Space>
      ),
    },
    { title: '学号', dataIndex: 'studentNo', width: 120, render: (v) => v || '-' },
    {
      title: '班级',
      dataIndex: 'className',
      render: (value) => value || <Text type="secondary">未分班</Text>,
    },
    {
      title: '联系方式',
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Text>{row.phone || '-'}</Text>
          <Text type="secondary">{row.email || '-'}</Text>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (value: number) => (
        <Tag color={value === 1 ? 'success' : 'default'}>
          {value === 1 ? '启用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      width: 150,
      render: (_, row) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(row)} />
          <Popconfirm title="删除该学生？" onConfirm={() => remove(row)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={20} className="full-width">
      <Card className="panel-card">
        <Flex justify="space-between" align="center" gap={16} wrap="wrap">
          <Space wrap>
            <Input.Search
              allowClear
              placeholder="搜索账号或姓名"
              style={{ width: 240 }}
              onSearch={(value) => setKeyword(value)}
            />
            <Select
              allowClear
              placeholder="按班级筛选"
              style={{ width: 220 }}
              value={classId}
              onChange={setClassId}
              options={classes.map((item) => ({
                label: item.className,
                value: item.id,
              }))}
            />
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新增学生
          </Button>
        </Flex>
      </Card>
      <Card title="学生列表" className="panel-card" extra={<TeamOutlined />}>
        <Table
          rowKey={(row) => String(row.id)}
          columns={columns}
          dataSource={students}
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>
      <Modal
        title={editing ? '编辑学生' : '新增学生'}
        open={modalOpen}
        onOk={save}
        onCancel={() => setModalOpen(false)}
        confirmLoading={loading}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" initialValues={{ status: 1 }}>
          <Form.Item
            name="username"
            label="登录账号"
            rules={[{ required: true, message: '请输入登录账号' }]}
          >
            <Input placeholder="student_zhangsan" />
          </Form.Item>
          <Form.Item
            name="realName"
            label="学生姓名"
            rules={[{ required: true, message: '请输入学生姓名' }]}
          >
            <Input placeholder="张三" />
          </Form.Item>
          <Form.Item
            name="password"
            label={editing ? '重置密码' : '初始密码'}
            tooltip={editing ? '留空则不修改密码' : undefined}
          >
            <Input.Password placeholder={editing ? '留空不修改' : '123456'} />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="classId" label="班级">
                <Select
                  allowClear
                  placeholder="选择班级"
                  options={classes.map((item) => ({
                    label: item.className,
                    value: item.id,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="studentNo" label="班内学号">
                <Input placeholder="2026001" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="phone" label="手机号">
                <Input placeholder="13800000000" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="邮箱">
                <Input placeholder="student@school.edu" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="status" label="状态">
            <Segmented
              options={[
                { label: '启用', value: 1 },
                { label: '停用', value: 0 },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

export function CalculatorPanel() {
  const [latex, setLatex] = useState('\\int_0^1 x^2\\,dx');
  const [mathJson, setMathJson] = useState<unknown>(null);
  const [result, setResult] = useState<CalculateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { message } = AntApp.useApp();
  const matrixInfo = useMemo(() => {
    try {
      return getMatrixInfo(
        computeEngine.parse(normalizeLatexForComputeEngine(latex)).json,
      );
    } catch {
      return null;
    }
  }, [latex]);

  const submitCalculation = async (
    requestLatex: string,
    requestMathJson: unknown,
  ) => {
    setLoading(true);
    try {
      setMathJson(requestMathJson);
      const data = await mathRequest<CalculateResponse>('/api/calculate', {
        method: 'POST',
        body: JSON.stringify({
          latex: requestLatex,
          mathJson: requestMathJson,
        }),
      });
      setResult(data);
      message.success(data.message || '计算完成');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '计算失败');
    } finally {
      setLoading(false);
    }
  };

  const calculate = async () => {
    const parsedMathJson = computeEngine.parse(
      normalizeLatexForComputeEngine(latex),
    ).json;
    await submitCalculation(latex, parsedMathJson);
  };

  const calculateMatrixAction = async (action: MatrixAction) => {
    if (!matrixInfo) {
      message.warning('请先输入一个矩阵');
      return;
    }

    const actionMathJson = buildMatrixActionMathJson(action, matrixInfo);
    if (!actionMathJson) {
      message.warning('线性方程组请使用增广矩阵，最后一列作为常数项');
      return;
    }

    await submitCalculation(
      `${matrixActionLabel[action]}(${latex})`,
      actionMathJson,
    );
  };

  const examples = [
    '\\int_0^1 x^2\\,dx',
    '\\lim_{x\\to0}\\frac{\\sin x}{x}',
    '\\frac{d}{dx}x^3',
    '\\dfrac{\\mathrm{d}}{\\mathrm{d}x}x^3\\bigm|_{x=2}',
    '\\dfrac{\\mathrm{d}^2}{\\mathrm{d}x^2}x^3\\bigm|_{x=1}',
    '\\dfrac{\\mathrm{d}^3}{\\mathrm{d}x^3}x^5\\bigm|_{x=2}',
    'x^2=1',
    '\\begin{bmatrix}1&2\\\\2&4\\end{bmatrix}',
    '\\begin{bmatrix}2&1&5\\\\1&-1&1\\end{bmatrix}',
    '\\det\\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}',
    '\\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}^{-1}',
    '\\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}+\\begin{bmatrix}5&6\\\\7&8\\end{bmatrix}',
    '\\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}\\cdot\\begin{bmatrix}5&6\\\\7&8\\end{bmatrix}',
  ];

  return (
    <Row gutter={[20, 20]}>
      <Col xs={24} xl={12}>
        <Card title="输入表达式" className="panel-card">
          <Collapse
            ghost
            className="formula-preset-collapse"
            items={[
              {
                key: 'examples',
                label: '示例公式',
                children: (
                  <div className="formula-preset-grid">
                    {examples.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="formula-preset"
                        onClick={() => setLatex(item)}
                        aria-label={`选择示例公式 ${item}`}
                      >
                        <LatexText value={item} mathOnly />
                      </button>
                    ))}
                  </div>
                ),
              },
            ]}
          />
          <LabeledBlock label="公式编辑器">
            <MathInput value={latex} onChange={setLatex} />
          </LabeledBlock>
          {matrixInfo && (
            <div className="matrix-action-panel">
              <Flex justify="space-between" align="center" gap={12} wrap="wrap">
                <Space direction="vertical" size={0}>
                  <Text strong>矩阵操作</Text>
                  <Text type="secondary">
                    {matrixInfo.rowCount} 行 × {matrixInfo.columnCount} 列
                  </Text>
                </Space>
                <Space wrap>
                  {(Object.keys(matrixActionLabel) as MatrixAction[]).map(
                    (action) => (
                      <Button
                        key={action}
                        onClick={() => calculateMatrixAction(action)}
                        loading={loading}
                      >
                        {matrixActionLabel[action]}
                      </Button>
                    ),
                  )}
                </Space>
              </Flex>
            </div>
          )}
          <Button
            type="primary"
            icon={<CalculatorOutlined />}
            size="large"
            loading={loading}
            onClick={calculate}
          >
            开始计算
          </Button>
        </Card>
      </Col>
      <Col xs={24} xl={12}>
        <Card
          title="计算结果"
          className="panel-card"
          extra={<Tag color="orange">LaTeX 渲染</Tag>}
        >
          {result ? (
            <Tabs
              items={[
                {
                  key: 'result',
                  label: '结果',
                  children: (
                    <div className="result-box">
                      <Text type="secondary">输出</Text>
                      <div className="latex-preview large-preview">
                        <LatexText
                          value={result.resultLatex || result.result}
                          mathOnly
                          display
                        />
                      </div>
                      <Divider />
                      <Text type="secondary">Symja 表达式</Text>
                      <pre>{result.symjaExpression || '-'}</pre>
                    </div>
                  ),
                },
                {
                  key: 'debug',
                  label: 'Debug',
                  children: (
                    <div className="debug-grid">
                      <pre>{JSON.stringify(mathJson, null, 2)}</pre>
                      <pre>{JSON.stringify(result, null, 2)}</pre>
                    </div>
                  ),
                },
              ]}
            />
          ) : (
            <Empty description="输入公式后点击计算" />
          )}
        </Card>
      </Col>
    </Row>
  );
}

export function QuestionManager() {
  const { message } = AntApp.useApp();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePoint[]>([]);
  const [form, setForm] = useState<QuestionFormState>(defaultQuestionForm);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [questionData, knowledgeData] = await Promise.all([
        mathRequest<Question[]>('/api/questions'),
        mathRequest<KnowledgePoint[]>('/api/catalog/knowledge-points'),
      ]);
      setQuestions(questionData);
      setKnowledgePoints(knowledgeData);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '题库加载失败');
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!form.stemContent.trim() || !form.answerValue.trim()) {
      message.warning('题干和标准答案不能为空');
      return;
    }

    setLoading(true);
    try {
      await mathRequest<Question>('/api/questions', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          inputType: 'latex',
          answerContent: form.answerValue,
          options: form.questionType === 'single_choice' ? form.options : [],
        }),
      });
      message.success(form.id ? '题目已更新' : '题目已新增');
      setForm(defaultQuestionForm);
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存失败');
    } finally {
      setLoading(false);
    }
  };

  const edit = (question: Question) => {
    setForm({
      id: question.id,
      questionType: question.questionType,
      stemContent: question.stemContent,
      answerValue: question.answerValue,
      analysisContent: question.analysisContent,
      difficulty: Number(question.difficulty),
      defaultScore: Number(question.defaultScore),
      blankCount: question.blankCount,
      estimatedMinutes: question.estimatedMinutes,
      knowledgePointIds: question.knowledgePointIds || [],
      options: question.options?.length ? question.options : defaultOptions,
    });
  };

  const remove = async (id: Id) => {
    setLoading(true);
    try {
      await mathRequest<void>(`/api/questions/${id}`, { method: 'DELETE' });
      message.success('题目已删除');
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除失败');
    } finally {
      setLoading(false);
    }
  };

  const columns: TableColumnsType<Question> = [
    {
      title: '题目',
      dataIndex: 'stemContent',
      render: (value: string, row) => (
        <Space direction="vertical" size={2}>
          <Text strong>{row.questionCode}</Text>
          <LatexText value={value} />
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'questionType',
      width: 96,
      render: (value: string) => <Tag>{questionTypeLabel[value] || value}</Tag>,
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      width: 120,
      render: (value: number) => (
        <Progress percent={Math.round(Number(value) * 100)} size="small" />
      ),
    },
    {
      title: '答案',
      dataIndex: 'answerValue',
      width: 160,
      render: (value: string) => <LatexText value={value} mathOnly />,
    },
    {
      title: '操作',
      width: 150,
      render: (_, row) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => edit(row)}>
            编辑
          </Button>
          <Popconfirm title="确认删除这道题？" onConfirm={() => remove(row.id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Row gutter={[20, 20]}>
      <Col xs={24} xl={9}>
        <QuestionEditor
          value={form}
          onChange={setForm}
          knowledgePoints={knowledgePoints}
          onSave={save}
          onReset={() => setForm(defaultQuestionForm)}
          loading={loading}
        />
      </Col>
      <Col xs={24} xl={15}>
        <Card
          title="题目列表"
          className="panel-card"
          extra={<Tag color="blue">{questions.length} 题</Tag>}
        >
          <Table
            rowKey={(row) => String(row.id)}
            columns={columns}
            dataSource={questions}
            loading={loading}
            pagination={{ pageSize: 6 }}
          />
        </Card>
      </Col>
    </Row>
  );
}

function QuestionEditor({
  value,
  onChange,
  knowledgePoints,
  onSave,
  onReset,
  loading,
}: {
  value: QuestionFormState;
  onChange: (value: QuestionFormState) => void;
  knowledgePoints: KnowledgePoint[];
  onSave: () => void;
  onReset: () => void;
  loading: boolean;
}) {
  const [stemFormula, setStemFormula] = useState('');

  const updateOption = (index: number, patch: Partial<QuestionOption>) => {
    const options = [...value.options];
    options[index] = { ...options[index], ...patch };
    onChange({ ...value, options });
  };

  const insertStemFormula = (displayMode = false) => {
    const formula = stemFormula.trim();
    if (!formula) {
      return;
    }
    const wrappedFormula = displayMode ? `\\[${formula}\\]` : `\\(${formula}\\)`;
    onChange({
      ...value,
      stemContent: `计算：${wrappedFormula}`,
    });
    setStemFormula('');
  };

  return (
    <Card
      title={value.id ? '编辑题目' : '新增题目'}
      className="panel-card sticky-card"
      extra={
        <Button icon={<PlusOutlined />} onClick={onReset}>
          新题
        </Button>
      }
    >
      <Form layout="vertical">
        <Form.Item label="题型">
          <Segmented
            block
            value={value.questionType}
            onChange={(questionType) =>
              onChange({ ...value, questionType: String(questionType) })
            }
            options={[
              { label: '计算', value: 'calculation' },
              { label: '填空', value: 'fill_blank' },
              { label: '选择', value: 'single_choice' },
            ]}
          />
        </Form.Item>
        <Form.Item label="知识点">
          <Select
            mode="multiple"
            value={value.knowledgePointIds}
            onChange={(knowledgePointIds) =>
              onChange({ ...value, knowledgePointIds })
            }
            options={knowledgePoints.map((item) => ({
              label: item.pointName,
              value: item.id,
            }))}
            placeholder="选择知识点"
          />
        </Form.Item>
        <Form.Item label="题干">
          <TextArea
            value={value.stemContent}
            onChange={(event) =>
              onChange({ ...value, stemContent: event.target.value })
            }
            rows={4}
          />
          <div className="stem-mathlive">
            <MathInput
              value={stemFormula}
              onChange={setStemFormula}
              placeholder="题干公式"
            />
            <Space wrap>
              <Button
                icon={<PlusOutlined />}
                onClick={() => insertStemFormula(false)}
                disabled={!stemFormula.trim()}
              >
                插入行内公式
              </Button>
              <Button
                icon={<PlusOutlined />}
                onClick={() => insertStemFormula(true)}
                disabled={!stemFormula.trim()}
              >
                插入独立公式
              </Button>
            </Space>
          </div>
          <div className="stem-preview">
            <Text type="secondary">题干预览</Text>
            <div className="latex-preview">
              <LatexText value={value.stemContent} />
            </div>
          </div>
        </Form.Item>
        <Form.Item label="标准答案">
          <MathInput
            value={value.answerValue}
            onChange={(answerValue) => onChange({ ...value, answerValue })}
          />
        </Form.Item>
        <Form.Item label="解析">
          <TextArea
            value={value.analysisContent}
            onChange={(event) =>
              onChange({ ...value, analysisContent: event.target.value })
            }
            rows={3}
          />
        </Form.Item>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="分值">
              <InputNumber
                min={1}
                value={value.defaultScore}
                onChange={(defaultScore) =>
                  onChange({
                    ...value,
                    defaultScore: Number(defaultScore || 0),
                  })
                }
                className="full-width"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="难度">
              <InputNumber
                min={0}
                max={1}
                step={0.1}
                value={value.difficulty}
                onChange={(difficulty) =>
                  onChange({ ...value, difficulty: Number(difficulty || 0) })
                }
                className="full-width"
              />
            </Form.Item>
          </Col>
        </Row>
        {value.questionType === 'single_choice' && (
          <div className="option-editor">
            <Text strong>选项</Text>
            {value.options.map((option, index) => (
              <Space
                key={option.optionKey}
                className="option-row"
                align="center"
              >
                <Tag>{option.optionKey}</Tag>
                <Input
                  value={option.optionContent}
                  onChange={(event) =>
                    updateOption(index, { optionContent: event.target.value })
                  }
                />
                <Select
                  value={option.isCorrect}
                  onChange={(isCorrect) => updateOption(index, { isCorrect })}
                  options={[
                    { label: '错误', value: 0 },
                    { label: '正确', value: 1 },
                  ]}
                  className="option-select"
                />
              </Space>
            ))}
          </div>
        )}
        <Button
          type="primary"
          icon={<FileAddOutlined />}
          loading={loading}
          onClick={onSave}
          block
        >
          保存题目
        </Button>
      </Form>
    </Card>
  );
}

export function PaperManager() {
  const { message } = AntApp.useApp();
  const [rules, setRules] = useState<PaperRule[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePoint[]>([]);
  const [ruleId, setRuleId] = useState<Id | undefined>();
  const [paperId, setPaperId] = useState<Id | undefined>();
  const [classId, setClassId] = useState<Id | undefined>();
  const [paperName, setPaperName] = useState('智能作业自动组卷');
  const [taskName, setTaskName] = useState('智能作业练习');
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PaperRule | null>(null);
  const [ruleForm, setRuleForm] =
    useState<PaperRuleFormState>(defaultPaperRuleForm);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ruleData, paperData, classData, knowledgeData] = await Promise.all(
        [
          mathRequest<PaperRule[]>('/api/papers/rules'),
          mathRequest<Paper[]>('/api/papers'),
          mathRequest<ClassInfo[]>('/api/catalog/classes'),
          mathRequest<KnowledgePoint[]>('/api/catalog/knowledge-points'),
        ],
      );
      setRules(ruleData);
      setPapers(paperData);
      setClasses(classData);
      setKnowledgePoints(knowledgeData);
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : '组卷数据加载失败',
      );
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    void load();
  }, [load]);

  const parseRuleForm = (rule: PaperRule): PaperRuleFormState => {
    let sections: PaperRuleSection[] = [defaultRuleSection];
    try {
      const parsed = JSON.parse(rule.ruleConfig || '{}') as {
        sections?: PaperRuleSection[];
      };
      if (parsed.sections?.length) {
        sections = parsed.sections.map((section) => ({
          sectionName:
            section.sectionName ||
            questionTypeLabel[section.questionType] ||
            '大题',
          questionType: section.questionType || 'calculation',
          count: Number(section.count || 1),
          score: Number(section.score || 10),
          knowledgePointCodes: section.knowledgePointCodes || [],
        }));
      }
    } catch {
      sections = [defaultRuleSection];
    }

    return {
      ruleName: rule.ruleName,
      schoolStage: rule.schoolStage || 'junior',
      gradeLevel: rule.gradeLevel || 'grade7',
      paperType: rule.paperType || 'homework',
      targetDifficulty: Number(rule.targetDifficulty ?? 0.5),
      remark: rule.remark || '',
      sections,
    };
  };

  const openCreateRule = () => {
    setEditingRule(null);
    setRuleForm({
      ...defaultPaperRuleForm,
      sections: [{ ...defaultRuleSection }],
    });
    setRuleModalOpen(true);
  };

  const openEditRule = (rule: PaperRule) => {
    setEditingRule(rule);
    setRuleForm(parseRuleForm(rule));
    setRuleModalOpen(true);
  };

  const updateRuleSection = (
    index: number,
    patch: Partial<PaperRuleSection>,
  ) => {
    const sections = [...ruleForm.sections];
    sections[index] = { ...sections[index], ...patch };
    setRuleForm({ ...ruleForm, sections });
  };

  const addRuleSection = () => {
    setRuleForm({
      ...ruleForm,
      sections: [...ruleForm.sections, { ...defaultRuleSection }],
    });
  };

  const removeRuleSection = (index: number) => {
    if (ruleForm.sections.length <= 1) {
      message.warning('至少保留一行抽题规则');
      return;
    }
    setRuleForm({
      ...ruleForm,
      sections: ruleForm.sections.filter(
        (_, currentIndex) => currentIndex !== index,
      ),
    });
  };

  const saveRule = async () => {
    if (!ruleForm.ruleName.trim()) {
      message.warning('规则名称不能为空');
      return;
    }
    if (!ruleForm.sections.length) {
      message.warning('至少配置一行抽题规则');
      return;
    }
    const invalidSection = ruleForm.sections.some(
      (section) =>
        !section.questionType ||
        !section.count ||
        section.count < 1 ||
        !section.score ||
        section.score <= 0,
    );
    if (invalidSection) {
      message.warning('请完整填写每行题型、数量和分值');
      return;
    }
    if (ruleForm.targetDifficulty < 0 || ruleForm.targetDifficulty > 1) {
      message.warning('目标难度必须在 0 到 1 之间');
      return;
    }

    setLoading(true);
    try {
      const url = editingRule
        ? `/api/papers/rules/${editingRule.id}`
        : '/api/papers/rules';
      const method = editingRule ? 'PUT' : 'POST';
      const saved = await mathRequest<PaperRule>(url, {
        method,
        body: JSON.stringify(ruleForm),
      });
      message.success(editingRule ? '规则已更新' : '规则已新增');
      setRuleId(saved.id);
      setRuleModalOpen(false);
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '规则保存失败');
    } finally {
      setLoading(false);
    }
  };

  const deleteRule = async (id: Id) => {
    setLoading(true);
    try {
      await mathRequest<void>(`/api/papers/rules/${id}`, { method: 'DELETE' });
      if (ruleId === id) {
        setRuleId(undefined);
      }
      message.success('规则已删除');
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '规则删除失败');
    } finally {
      setLoading(false);
    }
  };

  const generate = async () => {
    if (!ruleId) {
      message.warning('请选择组卷规则');
      return;
    }
    setLoading(true);
    try {
      const paper = await mathRequest<Paper>('/api/papers/auto-generate', {
        method: 'POST',
        body: JSON.stringify({ ruleId, paperName }),
      });
      setPaperId(paper.id);
      message.success('试卷已生成');
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '生成失败');
    } finally {
      setLoading(false);
    }
  };

  const publish = async () => {
    if (!paperId || !classId) {
      message.warning('请选择试卷和班级');
      return;
    }
    setLoading(true);
    try {
      await mathRequest<TaskSummary>('/api/tasks/publish', {
        method: 'POST',
        body: JSON.stringify({ paperId, taskName, classId, deadlineDays: 7 }),
      });
      message.success('作业已发布');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '发布失败');
    } finally {
      setLoading(false);
    }
  };

  const ruleColumns: TableColumnsType<PaperRule> = [
    {
      title: '规则',
      dataIndex: 'ruleName',
      render: (value: string, row) => (
        <Space direction="vertical" size={2}>
          <Text strong>{value}</Text>
          <Text type="secondary">
            {row.gradeLevel || 'grade7'} / 难度 {row.targetDifficulty ?? '-'}
          </Text>
        </Space>
      ),
    },
    {
      title: '题量',
      dataIndex: 'questionCount',
      width: 80,
      render: (value: number) => `${value} 题`,
    },
    {
      title: '总分',
      dataIndex: 'totalScore',
      width: 80,
      render: (value: number) => `${value} 分`,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      width: 170,
      render: (value: string | undefined) => value || '-',
    },
    {
      title: '操作',
      width: 170,
      render: (_, row) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditRule(row)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除这条组卷规则？"
            onConfirm={() => deleteRule(row.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={10}>
          <Card title="自动组卷" className="panel-card">
            <Form layout="vertical">
              <Form.Item label="试卷名称">
                <Input
                  value={paperName}
                  onChange={(event) => setPaperName(event.target.value)}
                />
              </Form.Item>
              <Form.Item label="组卷规则">
                <Select
                  value={ruleId}
                  onChange={setRuleId}
                  placeholder="选择规则"
                  options={rules.map((rule) => ({
                    label: `${rule.ruleName} / ${rule.questionCount}题 / ${rule.totalScore}分`,
                    value: rule.id,
                  }))}
                />
              </Form.Item>
              <Button
                type="primary"
                icon={<FileTextOutlined />}
                loading={loading}
                onClick={generate}
                block
              >
                生成试卷
              </Button>
            </Form>
          </Card>

          <Card title="发布作业" className="panel-card">
            <Form layout="vertical">
              <Form.Item label="作业名称">
                <Input
                  value={taskName}
                  onChange={(event) => setTaskName(event.target.value)}
                />
              </Form.Item>
              <Form.Item label="试卷">
                <Select
                  value={paperId}
                  onChange={setPaperId}
                  placeholder="选择试卷"
                  options={papers.map((paper) => ({
                    label: `${paper.paperName} / ${paper.questionCount}题`,
                    value: paper.id,
                  }))}
                />
              </Form.Item>
              <Form.Item label="班级">
                <Select
                  value={classId}
                  onChange={setClassId}
                  placeholder="选择班级"
                  options={classes.map((item) => ({
                    label: item.className,
                    value: item.id,
                  }))}
                />
              </Form.Item>
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={loading}
                onClick={publish}
                block
              >
                发布作业
              </Button>
            </Form>
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card
            title="组卷规则管理"
            className="panel-card"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateRule}
              >
                新增规则
              </Button>
            }
          >
            <Table
              rowKey={(row) => String(row.id)}
              columns={ruleColumns}
              dataSource={rules}
              loading={loading}
              pagination={{ pageSize: 5 }}
            />
          </Card>

          <Card title="已生成试卷" className="panel-card">
            <List
              loading={loading}
              dataSource={papers}
              locale={{ emptyText: <Empty description="暂无试卷" /> }}
              renderItem={(paper) => (
                <List.Item
                  actions={[
                    <Button key="use" onClick={() => setPaperId(paper.id)}>
                      用于发布
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={<Text strong>{paper.paperName}</Text>}
                    description={`${paper.paperCode} / ${paper.questionCount} 题 / ${paper.totalScore} 分`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
      <Modal
        title={editingRule ? '编辑组卷规则' : '新增组卷规则'}
        open={ruleModalOpen}
        onCancel={() => setRuleModalOpen(false)}
        onOk={saveRule}
        confirmLoading={loading}
        width={900}
        destroyOnHidden
      >
        <Form layout="vertical">
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item label="规则名称" required>
                <Input
                  value={ruleForm.ruleName}
                  onChange={(event) =>
                    setRuleForm({ ...ruleForm, ruleName: event.target.value })
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="目标难度" required>
                <InputNumber
                  min={0}
                  max={1}
                  step={0.1}
                  value={ruleForm.targetDifficulty}
                  onChange={(targetDifficulty) =>
                    setRuleForm({
                      ...ruleForm,
                      targetDifficulty: Number(targetDifficulty ?? 0.5),
                    })
                  }
                  className="full-width"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="学段">
                <Input
                  value={ruleForm.schoolStage}
                  onChange={(event) =>
                    setRuleForm({
                      ...ruleForm,
                      schoolStage: event.target.value,
                    })
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="年级">
                <Input
                  value={ruleForm.gradeLevel}
                  onChange={(event) =>
                    setRuleForm({ ...ruleForm, gradeLevel: event.target.value })
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="试卷类型">
                <Select
                  value={ruleForm.paperType}
                  onChange={(paperType) =>
                    setRuleForm({ ...ruleForm, paperType })
                  }
                  options={[
                    { label: '作业', value: 'homework' },
                    { label: '测验', value: 'quiz' },
                    { label: '练习', value: 'practice' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="备注">
                <Input
                  value={ruleForm.remark}
                  onChange={(event) =>
                    setRuleForm({ ...ruleForm, remark: event.target.value })
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          <Divider>抽题规则</Divider>
          <Space direction="vertical" size={12} className="full-width">
            {ruleForm.sections.map((section, index) => (
              <Card
                key={index}
                size="small"
                className="rule-section-card"
                title={`第 ${index + 1} 行`}
                extra={
                  <Button
                    danger
                    size="small"
                    onClick={() => removeRuleSection(index)}
                  >
                    删除
                  </Button>
                }
              >
                <Row gutter={12}>
                  <Col xs={24} md={8}>
                    <Form.Item label="名称" required>
                      <Input
                        value={section.sectionName}
                        onChange={(event) =>
                          updateRuleSection(index, {
                            sectionName: event.target.value,
                          })
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="题型" required>
                      <Select
                        value={section.questionType}
                        onChange={(questionType) =>
                          updateRuleSection(index, {
                            questionType,
                            sectionName:
                              questionTypeLabel[questionType] ||
                              section.sectionName,
                          })
                        }
                        options={[
                          { label: '计算题', value: 'calculation' },
                          { label: '填空题', value: 'fill_blank' },
                          { label: '选择题', value: 'single_choice' },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Item label="数量" required>
                      <InputNumber
                        min={1}
                        value={section.count}
                        onChange={(count) =>
                          updateRuleSection(index, {
                            count: Number(count || 1),
                          })
                        }
                        className="full-width"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Item label="每题分值" required>
                      <InputNumber
                        min={0.5}
                        step={0.5}
                        value={section.score}
                        onChange={(score) =>
                          updateRuleSection(index, {
                            score: Number(score || 1),
                          })
                        }
                        className="full-width"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="知识点">
                      <Select
                        mode="multiple"
                        value={section.knowledgePointCodes}
                        onChange={(knowledgePointCodes) =>
                          updateRuleSection(index, { knowledgePointCodes })
                        }
                        placeholder="不选则从该题型全部题目中抽取"
                        options={knowledgePoints.map((point) => ({
                          label: point.pointName,
                          value: point.pointCode,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            ))}
            <Button icon={<PlusOutlined />} onClick={addRuleSection}>
              添加一行抽题规则
            </Button>
          </Space>
        </Form>
      </Modal>
    </>
  );
}

export function ManualPaperManager() {
  const { message } = AntApp.useApp();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [paperName, setPaperName] = useState('手动组卷试卷');
  const [taskName, setTaskName] = useState('手动组卷作业');
  const [paperId, setPaperId] = useState<Id | undefined>();
  const [classId, setClassId] = useState<Id | undefined>();
  const [questionType, setQuestionType] = useState('all');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [selectedScores, setSelectedScores] = useState<Record<string, number>>(
    {},
  );
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [questionData, paperData, classData] = await Promise.all([
        mathRequest<Question[]>('/api/questions'),
        mathRequest<Paper[]>('/api/papers'),
        mathRequest<ClassInfo[]>('/api/catalog/classes'),
      ]);
      setQuestions(questionData);
      setPapers(paperData);
      setClasses(classData);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '手动组卷数据加载失败');
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredQuestions = useMemo(
    () =>
      questions.filter(
        (question) =>
          questionType === 'all' || question.questionType === questionType,
      ),
    [questionType, questions],
  );

  const selectedQuestions = useMemo(
    () =>
      selectedQuestionIds
        .map((id) => questions.find((question) => String(question.id) === id))
        .filter((question): question is Question => Boolean(question)),
    [questions, selectedQuestionIds],
  );

  const totalScore = selectedQuestions.reduce(
    (sum, question) =>
      sum + Number(selectedScores[String(question.id)] ?? question.defaultScore),
    0,
  );

  const updateSelectedScore = (questionId: Id, score: number) => {
    setSelectedScores({
      ...selectedScores,
      [String(questionId)]: score,
    });
  };

  const removeSelectedQuestion = (questionId: Id) => {
    const id = String(questionId);
    setSelectedQuestionIds(selectedQuestionIds.filter((item) => item !== id));
  };

  const generateManualPaper = async () => {
    if (!paperName.trim()) {
      message.warning('试卷名称不能为空');
      return;
    }
    if (!selectedQuestions.length) {
      message.warning('请至少选择一道题');
      return;
    }
    const items: ManualPaperItem[] = selectedQuestions.map((question) => ({
      questionId: question.id,
      score: Number(
        selectedScores[String(question.id)] ?? question.defaultScore ?? 10,
      ),
      sectionName: questionTypeLabel[question.questionType] || '题目',
    }));
    if (items.some((item) => item.score <= 0)) {
      message.warning('题目分值必须大于 0');
      return;
    }

    setLoading(true);
    try {
      const paper = await mathRequest<Paper>('/api/papers/manual-generate', {
        method: 'POST',
        body: JSON.stringify({ paperName, items }),
      });
      setPaperId(paper.id);
      message.success('手动组卷已生成试卷');
      setSelectedQuestionIds([]);
      setSelectedScores({});
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '手动组卷失败');
    } finally {
      setLoading(false);
    }
  };

  const publish = async () => {
    if (!paperId || !classId) {
      message.warning('请选择试卷和班级');
      return;
    }
    if (!taskName.trim()) {
      message.warning('作业名称不能为空');
      return;
    }
    setLoading(true);
    try {
      await mathRequest<TaskSummary>('/api/tasks/publish', {
        method: 'POST',
        body: JSON.stringify({ paperId, taskName, classId, deadlineDays: 7 }),
      });
      message.success('作业已发布');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '发布失败');
    } finally {
      setLoading(false);
    }
  };

  const columns: TableColumnsType<Question> = [
    {
      title: '题目',
      dataIndex: 'stemContent',
      render: (value: string, row) => (
        <Space direction="vertical" size={2}>
          <Text strong>{row.questionCode}</Text>
          <LatexText value={value} />
        </Space>
      ),
    },
    {
      title: '题型',
      dataIndex: 'questionType',
      width: 96,
      render: (value: string) => questionTypeLabel[value] || value,
    },
    {
      title: '默认分',
      dataIndex: 'defaultScore',
      width: 92,
      render: (value: number) => `${value} 分`,
    },
    {
      title: '答案',
      dataIndex: 'answerValue',
      width: 160,
      render: (value: string, row) =>
        isChoiceQuestion(row.questionType) ? (
          <Text strong>{value}</Text>
        ) : (
          <LatexText value={value} mathOnly />
        ),
    },
  ];

  return (
    <Row gutter={[20, 20]}>
      <Col xs={24} xl={16}>
        <Card
          title="题库选题"
          className="panel-card"
          extra={<Tag color="blue">已选 {selectedQuestions.length} 题</Tag>}
        >
          <Form layout="vertical">
            <Row gutter={12}>
              <Col xs={24} md={14}>
                <Form.Item label="试卷名称">
                  <Input
                    value={paperName}
                    onChange={(event) => setPaperName(event.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={10}>
                <Form.Item label="题型筛选">
                  <Select
                    value={questionType}
                    onChange={setQuestionType}
                    options={[
                      { label: '全部题型', value: 'all' },
                      { label: '计算题', value: 'calculation' },
                      { label: '填空题', value: 'fill_blank' },
                      { label: '选择题', value: 'single_choice' },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <Table
            rowKey={(row) => String(row.id)}
            columns={columns}
            dataSource={filteredQuestions}
            loading={loading}
            pagination={{ pageSize: 6 }}
            rowSelection={{
              selectedRowKeys: selectedQuestionIds,
              onChange: (keys) => {
                const ids = keys.map(String);
                setSelectedQuestionIds(ids);
                setSelectedScores((current) => {
                  const next = { ...current };
                  ids.forEach((id) => {
                    const question = questions.find(
                      (item) => String(item.id) === id,
                    );
                    if (question && next[id] === undefined) {
                      next[id] = Number(question.defaultScore ?? 10);
                    }
                  });
                  return next;
                });
              },
            }}
          />
        </Card>
      </Col>
      <Col xs={24} xl={8}>
        <Card
          title="已选题目"
          className="panel-card sticky-card"
          extra={<Tag color="green">{totalScore} 分</Tag>}
        >
          <List
            dataSource={selectedQuestions}
            locale={{ emptyText: <Empty description="请从题库勾选题目" /> }}
            renderItem={(question, index) => (
              <List.Item
                actions={[
                  <Button
                    key="remove"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeSelectedQuestion(question.id)}
                  />,
                ]}
              >
                <List.Item.Meta
                  title={`第 ${index + 1} 题 / ${
                    questionTypeLabel[question.questionType] || question.questionType
                  }`}
                  description={
                    <Space direction="vertical" size={8} className="full-width">
                      <LatexText value={question.stemContent} />
                      <InputNumber
                        min={0.5}
                        step={0.5}
                        value={
                          selectedScores[String(question.id)] ??
                          Number(question.defaultScore ?? 10)
                        }
                        onChange={(score) =>
                          updateSelectedScore(question.id, Number(score ?? 0))
                        }
                        addonAfter="分"
                        className="full-width"
                      />
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            loading={loading}
            onClick={generateManualPaper}
            disabled={!selectedQuestions.length}
            block
          >
            生成试卷
          </Button>
        </Card>
        <Card title="已生成试卷" className="panel-card">
          <List
            loading={loading}
            dataSource={papers}
            locale={{ emptyText: <Empty description="暂无试卷" /> }}
            renderItem={(paper) => (
              <List.Item
                actions={[
                  <Button key="use" onClick={() => setPaperId(paper.id)}>
                    用于发布
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={<Text strong>{paper.paperName}</Text>}
                  description={`${paper.paperCode} / ${paper.questionCount} 题 / ${paper.totalScore} 分`}
                />
              </List.Item>
            )}
          />
        </Card>
        <Card title="发布作业" className="panel-card">
          <Form layout="vertical">
            <Form.Item label="作业名称">
              <Input
                value={taskName}
                onChange={(event) => setTaskName(event.target.value)}
              />
            </Form.Item>
            <Form.Item label="试卷">
              <Select
                value={paperId}
                onChange={setPaperId}
                placeholder="选择试卷"
                options={papers.map((paper) => ({
                  label: `${paper.paperName} / ${paper.questionCount}题`,
                  value: paper.id,
                }))}
              />
            </Form.Item>
            <Form.Item label="班级">
              <Select
                value={classId}
                onChange={setClassId}
                placeholder="选择班级"
                options={classes.map((item) => ({
                  label: item.className,
                  value: item.id,
                }))}
              />
            </Form.Item>
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={loading}
              onClick={publish}
              block
            >
              发布作业
            </Button>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}

export function TaskPanel() {
  const { initialState } = useModel('@@initialState');
  const user = initialState?.currentUser;
  const { message } = AntApp.useApp();
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskSummary | null>(null);
  const [taskStudents, setTaskStudents] = useState<TaskStudent[]>([]);
  const [detail, setDetail] = useState<TaskDetail | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<TaskStatistics | null>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  const isStudent = user?.roleType === 'student';

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      setTasks(await mathRequest<TaskSummary[]>('/api/tasks/mine'));
    } catch (error) {
      message.error(error instanceof Error ? error.message : '作业加载失败');
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const openTask = useCallback(
    async (taskStudentId: Id | null) => {
      if (!taskStudentId) {
        message.info('教师端先查看发布记录，学生端可进入作答详情');
        return;
      }
      setLoading(true);
      try {
        const data = await mathRequest<TaskDetail>(
          `/api/tasks/student/${taskStudentId}`,
        );
        setDetail(data);
        const answerMap: Record<string, string> = {};
        data.questions.forEach((question) => {
          answerMap[String(question.id)] = question.studentAnswer || '';
        });
        setAnswers(answerMap);
      } catch (error) {
        message.error(
          error instanceof Error ? error.message : '作业详情加载失败',
        );
      } finally {
        setLoading(false);
      }
    },
    [message],
  );

  const openTaskSummary = async (task: TaskSummary) => {
    setSelectedTask(task);
    if (isStudent) {
      await openTask(task.taskStudentId);
      return;
    }
    setDetail(null);
    setTaskStudents([]);
    setLoading(true);
    try {
      setTaskStudents(
        await mathRequest<TaskStudent[]>(`/api/tasks/${task.taskId}/students`),
      );
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : '学生提交数据加载失败',
      );
    } finally {
      setLoading(false);
    }
  };

  const studentColumns: TableColumnsType<TaskStudent> = [
    {
      title: '学生',
      dataIndex: 'studentName',
      render: (value: string, row) => (
        <Space direction="vertical" size={0}>
          <Text strong>{value || '学生'}</Text>
          <Text type="secondary">{row.studentNo || row.studentId}</Text>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (value: string) => (
        <Tag color={statusColor[value]}>{statusLabel[value] || value}</Tag>
      ),
    },
    {
      title: '得分',
      dataIndex: 'totalScore',
      width: 90,
      render: (value: number | null) => value ?? '-',
    },
    {
      title: '错题',
      dataIndex: 'wrongCount',
      width: 80,
      render: (value: number) => (
        <Tag color={value > 0 ? 'error' : 'success'}>{value}</Tag>
      ),
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      width: 180,
      render: (value: string | null) => value || '-',
    },
    {
      title: '操作',
      width: 90,
      render: (_, row) => (
        <Button size="small" onClick={() => openTask(row.taskStudentId)}>
          查看
        </Button>
      ),
    },
  ];

  const loadStatistics = async (taskId: Id) => {
    setLoading(true);
    try {
      const data = await mathRequest<TaskStatistics>(
        `/api/tasks/${taskId}/statistics`,
      );
      setStatistics(data);
      setStatsVisible(true);
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : '统计数据加载失败',
      );
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (!detail) {
      return;
    }
    setLoading(true);
    try {
      const data = await mathRequest<{ totalScore: number }>(
        '/api/tasks/submit',
        {
          method: 'POST',
          body: JSON.stringify({
            taskStudentId: detail.taskStudentId,
            answers: detail.questions.map((question) => ({
              paperQuestionId: question.id,
              answerLatex: answers[String(question.id)] || '',
            })),
          }),
        },
      );
      message.success(`提交成功，得分 ${data.totalScore}`);
      await openTask(detail.taskStudentId);
      await loadTasks();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '提交失败');
    } finally {
      setLoading(false);
    }
  };

  const updateAnswer = (questionId: Id, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [String(questionId)]: value,
    }));
  };

  return (
    <Row gutter={[20, 20]}>
      <Col span={24}>
        <PageHero
          title={isStudent ? '我的作业' : '作业批改'}
          subtitle={
            isStudent
              ? '在线完成老师发布的作业，提交后查看批改结果。'
              : '查看作业发布记录、学生提交情况和自动批改结果。'
          }
        >
          <Metric label="当前身份" value={isStudent ? '学生' : '教师'} />
          <Metric label="判题策略" value="LaTeX 精确匹配" />
          {!isStudent && selectedTask && (
            <Button
              icon={<BarChartOutlined />}
              onClick={() => loadStatistics(selectedTask.taskId)}
            >
              统计
            </Button>
          )}
        </PageHero>
      </Col>
      <Col xs={24} lg={8}>
        <Card
          title={isStudent ? '我的作业' : '已发布作业'}
          className="panel-card"
        >
          <List
            loading={loading}
            dataSource={tasks}
            locale={{ emptyText: <Empty description="暂无作业" /> }}
            renderItem={(task) => (
              <List.Item
                className="task-item"
                onClick={() => openTaskSummary(task)}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{task.taskName}</Text>
                      <Tag color={statusColor[task.status]}>
                        {statusLabel[task.status] || task.status}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={2}>
                      <Text type="secondary">
                        截止：{task.deadlineTime || '未设置'}
                      </Text>
                      <Text type="secondary">
                        得分：{task.totalScore ?? '-'}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>
      <Col xs={24} lg={16}>
        <Card
          title={detail ? detail.taskName : '作答区'}
          className="panel-card"
          extra={
            detail && (
              <Tag color={statusColor[detail.status]}>
                {statusLabel[detail.status] || detail.status}
              </Tag>
            )
          }
        >
          {!isStudent && selectedTask && (
            <Table
              rowKey={(row) => String(row.taskStudentId)}
              columns={studentColumns}
              dataSource={taskStudents}
              loading={loading}
              pagination={{ pageSize: 6 }}
              className="student-task-table"
            />
          )}
          {detail ? (
            <Space direction="vertical" size={16} className="full-width">
              {detail.questions.map((question) => (
                <Card
                  key={String(question.id)}
                  className="question-card"
                  size="small"
                >
                  <Flex justify="space-between" gap={12} wrap="wrap">
                    <Space>
                      <Tag color="blue">第 {question.questionNo} 题</Tag>
                      <Tag>
                        {questionTypeLabel[question.questionType] ||
                          question.questionType}
                      </Tag>
                      <Text type="secondary">{question.score} 分</Text>
                    </Space>
                    {question.judgeResult && (
                      <Tag color={statusColor[question.judgeResult]}>
                        {statusLabel[question.judgeResult] ||
                          question.judgeResult}
                      </Tag>
                    )}
                  </Flex>
                  <div className="stem-block">
                    <LatexText value={question.stemContent} />
                  </div>
                  {question.options?.length > 0 && (
                    <Row gutter={[12, 12]}>
                      {question.options.map((option) => (
                        <Col xs={24} md={12} key={option.optionKey}>
                          <button
                            type="button"
                            className={[
                              'option-card',
                              isStudent &&
                              canAnswerTask(detail.status) &&
                              isChoiceQuestion(question.questionType)
                                ? 'choice-option-card'
                                : '',
                              answers[String(question.id)] === option.optionKey
                                ? 'choice-option-card-selected'
                                : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            disabled={
                              !isStudent ||
                              !canAnswerTask(detail.status) ||
                              !isChoiceQuestion(question.questionType)
                            }
                            onClick={() =>
                              updateAnswer(question.id, option.optionKey)
                            }
                          >
                            <Tag>{option.optionKey}</Tag>
                            <LatexText value={option.optionContent} />
                          </button>
                        </Col>
                      ))}
                    </Row>
                  )}
                  {isStudent && canAnswerTask(detail.status) ? (
                    <LabeledBlock label="我的答案">
                      {isChoiceQuestion(question.questionType) ? (
                        <div className="choice-answer-line">
                          <Text type="secondary">已选择</Text>
                          <Tag
                            color={
                              answers[String(question.id)] ? 'blue' : 'default'
                            }
                          >
                            {answers[String(question.id)] || '未选择'}
                          </Tag>
                        </div>
                      ) : (
                        <MathInput
                          value={answers[String(question.id)] || ''}
                          onChange={(value) => updateAnswer(question.id, value)}
                        />
                      )}
                    </LabeledBlock>
                  ) : !isStudent && selectedTask ? null : (
                    <Row gutter={[12, 12]} className="answer-compare">
                      <Col xs={24} md={12}>
                        <Text type="secondary">我的答案</Text>
                        <div className="latex-preview">
                          {isChoiceQuestion(question.questionType) ? (
                            <Text strong>{question.studentAnswer || '-'}</Text>
                          ) : (
                            <LatexText
                              value={question.studentAnswer}
                              mathOnly
                            />
                          )}
                        </div>
                      </Col>
                      <Col xs={24} md={12}>
                        <Text type="secondary">标准答案</Text>
                        <div className="latex-preview">
                          {isChoiceQuestion(question.questionType) ? (
                            <Text strong>{question.answerValue || '-'}</Text>
                          ) : (
                            <LatexText value={question.answerValue} mathOnly />
                          )}
                        </div>
                      </Col>
                    </Row>
                  )}
                  {question.gradingInfo && question.judgeResult === 'wrong' && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: 12,
                        background: '#fff2f0',
                        borderRadius: 6,
                        border: '1px solid #ffccc7',
                      }}
                    >
                      <Space direction="vertical" size={4}>
                        <Text type="danger" strong>
                          批改详情
                        </Text>
                        {question.gradingInfo.calculateResult && (
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            计算过程：{question.gradingInfo.calculateResult}
                          </Text>
                        )}
                        {question.gradingInfo.errorReason && (
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            错误原因：{question.gradingInfo.errorReason}
                          </Text>
                        )}
                        {question.gradingInfo.judgeDetail && (
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            详细判定：{question.gradingInfo.judgeDetail}
                          </Text>
                        )}
                        {question.analysisContent && (
                          <div style={{ marginTop: 4 }}>
                            <Text type="secondary" style={{ fontSize: 13 }}>
                              题目解析：
                            </Text>
                            <div className="latex-preview">
                              <LatexText value={question.analysisContent} />
                            </div>
                          </div>
                        )}
                      </Space>
                    </div>
                  )}
                </Card>
              ))}
              {isStudent && canAnswerTask(detail.status) && (
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  loading={loading}
                  onClick={submit}
                >
                  提交作业
                </Button>
              )}
            </Space>
          ) : !isStudent && selectedTask ? null : (
            <Empty description="从左侧选择一份作业" />
          )}
        </Card>
      </Col>
      <Modal
        title={`${statistics?.taskName || ''} - 统计报表`}
        open={statsVisible}
        onCancel={() => setStatsVisible(false)}
        footer={null}
        width={800}
      >
        {statistics && (
          <Space direction="vertical" size={16} className="full-width">
            <Row gutter={[12, 12]}>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="提交率"
                    value={Math.round(statistics.submissionRate * 100)}
                    suffix="%"
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="平均分"
                    value={statistics.averageScore}
                    precision={1}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="最高分"
                    value={statistics.maxScore}
                    precision={1}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="最低分"
                    value={statistics.minScore}
                    precision={1}
                  />
                </Card>
              </Col>
            </Row>
            <Card title="分数分布" size="small">
              <Space direction="vertical" className="full-width">
                {Object.entries(statistics.scoreDistribution).map(
                  ([range, count]) => {
                    const pct =
                      statistics.submittedCount > 0
                        ? (count / statistics.submittedCount) * 100
                        : 0;
                    return (
                      <Row key={range} align="middle" gutter={12}>
                        <Col span={6}>
                          <Text>{range}</Text>
                        </Col>
                        <Col span={16}>
                          <Progress
                            percent={Math.round(pct)}
                            size="small"
                            format={() => `${count}人`}
                          />
                        </Col>
                      </Row>
                    );
                  },
                )}
              </Space>
            </Card>
            <Card title="各题正确率" size="small">
              <Table
                rowKey={(row) => String(row.paperQuestionId)}
                dataSource={statistics.perQuestionStats}
                pagination={false}
                size="small"
                columns={[
                  { title: '题号', dataIndex: 'questionNo', width: 60 },
                  {
                    title: '题型',
                    dataIndex: 'questionType',
                    width: 80,
                    render: (v: string) => (
                      <Tag>{questionTypeLabel[v] || v}</Tag>
                    ),
                  },
                  { title: '分值', dataIndex: 'score', width: 60 },
                  {
                    title: '正确率',
                    dataIndex: 'correctRate',
                    render: (v: number) => (
                      <Progress
                        percent={Math.round(v * 100)}
                        size="small"
                        status={v < 0.5 ? 'exception' : 'success'}
                      />
                    ),
                  },
                  {
                    title: '作答/正确',
                    render: (_: unknown, row: QuestionStat) => (
                      <Text type="secondary">
                        {row.attemptCount}/{row.correctCount}
                      </Text>
                    ),
                  },
                ]}
              />
            </Card>
            {statistics.weakKnowledgePoints.length > 0 && (
              <Card title="薄弱知识点 TOP 10" size="small">
                <List
                  size="small"
                  dataSource={statistics.weakKnowledgePoints}
                  renderItem={(kp: WeakKpStat) => (
                    <List.Item>
                      <Text>{kp.pointName}</Text>
                      <Tag color="error">{kp.wrongCount} 次错误</Tag>
                    </List.Item>
                  )}
                />
              </Card>
            )}
          </Space>
        )}
      </Modal>
    </Row>
  );
}

export function WrongQuestionsPanel() {
  const { message } = AntApp.useApp();
  const [items, setItems] = useState<WrongQuestion[]>([]);
  const [practiceId, setPracticeId] = useState<Id | null>(null);
  const [practiceAnswers, setPracticeAnswers] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await mathRequest<WrongQuestion[]>('/api/wrong-questions/mine'));
    } catch (error) {
      message.error(error instanceof Error ? error.message : '错题加载失败');
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    void load();
  }, [load]);

  const review = async (item: WrongQuestion) => {
    setLoading(true);
    try {
      await mathRequest<WrongQuestion>(
        `/api/wrong-questions/${item.id}/review`,
        { method: 'POST' },
      );
      setPracticeId(item.id);
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '复习记录失败');
    } finally {
      setLoading(false);
    }
  };

  const mastered = async (item: WrongQuestion) => {
    setLoading(true);
    try {
      await mathRequest<WrongQuestion>(
        `/api/wrong-questions/${item.id}/mastered`,
        { method: 'POST' },
      );
      message.success('已标记掌握');
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '标记失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="我的错题本" className="panel-card">
      <List
        loading={loading}
        dataSource={items}
        locale={{ emptyText: <Empty description="暂无错题" /> }}
        renderItem={(item) => (
          <List.Item>
            <Space direction="vertical" size={12} className="full-width">
              <Flex justify="space-between" gap={12} wrap="wrap">
                <Space wrap>
                  <Text strong>{item.taskName}</Text>
                  <Tag color={item.mastered ? 'success' : 'error'}>
                    {item.mastered ? '已掌握' : '未掌握'}
                  </Tag>
                  <Text type="secondary">复习 {item.reviewCount || 0} 次</Text>
                </Space>
                <Space>
                  <Button onClick={() => review(item)} loading={loading}>
                    再练一次
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => mastered(item)}
                    disabled={Boolean(item.mastered)}
                    loading={loading}
                  >
                    标记已掌握
                  </Button>
                </Space>
              </Flex>
              <div className="stem-block">
                <LatexText value={item.stemContent} />
              </div>
              {item.options?.length > 0 && (
                <Row gutter={[12, 12]}>
                  {item.options.map((option) => (
                    <Col xs={24} md={12} key={option.optionKey}>
                      <div className="option-card">
                        <Tag>{option.optionKey}</Tag>
                        <LatexText value={option.optionContent} />
                      </div>
                    </Col>
                  ))}
                </Row>
              )}
              {practiceId === item.id && (
                <LabeledBlock label="本次练习答案">
                  <MathInput
                    value={practiceAnswers[String(item.id)] || ''}
                    onChange={(value) =>
                      setPracticeAnswers((prev) => ({
                        ...prev,
                        [String(item.id)]: value,
                      }))
                    }
                  />
                </LabeledBlock>
              )}
              <Row gutter={[12, 12]} className="answer-compare">
                <Col xs={24} md={12}>
                  <Text type="secondary">我的原答案</Text>
                  <div className="latex-preview">
                    <LatexText value={item.studentAnswer} mathOnly />
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <Text type="secondary">标准答案</Text>
                  <div className="latex-preview">
                    <LatexText value={item.standardAnswer} mathOnly />
                  </div>
                </Col>
                {item.analysisContent && (
                  <Col span={24}>
                    <Text type="secondary">解析</Text>
                    <div className="latex-preview">
                      <LatexText value={item.analysisContent} />
                    </div>
                  </Col>
                )}
              </Row>
            </Space>
          </List.Item>
        )}
      />
    </Card>
  );
}

export function PageHero({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <Card className="hero-card">
      <Flex justify="space-between" align="center" gap={24} wrap="wrap">
        <div>
          <Text className="eyebrow">Core Workflow</Text>
          <Title level={2}>{title}</Title>
          <Paragraph>{subtitle}</Paragraph>
        </div>
        <Space size={12} wrap>
          {children}
        </Space>
      </Flex>
    </Card>
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-pill">
      <Text type="secondary">{label}</Text>
      <Text strong>{value}</Text>
    </div>
  );
}

export function LabeledBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="labeled-block">
      <Text strong>{label}</Text>
      {children}
    </div>
  );
}
