import {useCallback, useEffect, useMemo, useState} from 'react'
import type {ReactNode} from 'react'
import {ComputeEngine} from '@cortex-js/compute-engine'
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
} from 'antd'
import type {TableColumnsType} from 'antd'
import {
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
} from '@ant-design/icons'
import 'katex/dist/katex.min.css'
import './mathpaper.css'
import { mathRequest } from '@/services/mathpaper'
import { useModel } from '@umijs/max'
import {LatexText} from './LatexText'
import {MathInput} from './MathInput'

const {Title, Text, Paragraph} = Typography
const {TextArea} = Input
const computeEngine = new ComputeEngine()

type Id = number | string

type KnowledgePoint = {
    id: Id
    pointCode: string
    pointName: string
}

type QuestionOption = {
    id?: Id
    optionKey: string
    optionContent: string
    isCorrect: number
    sortNo: number
}

type Question = {
    id: Id
    questionCode: string
    questionType: string
    inputType: string
    stemContent: string
    answerContent: string
    answerValue: string
    analysisContent: string
    difficulty: number
    defaultScore: number
    blankCount: number
    estimatedMinutes: number
    knowledgePointIds: Id[]
    options: QuestionOption[]
}

type PaperRule = {
    id: Id
    ruleName: string
    schoolStage: string
    gradeLevel: string
    paperType: string
    questionCount: number
    totalScore: number
    targetDifficulty: number
    ruleConfig: string
    remark?: string
    updateTime?: string
}

type PaperRuleSection = {
    sectionName: string
    questionType: string
    count: number
    score: number
    knowledgePointCodes: string[]
}

type PaperRuleFormState = {
    ruleName: string
    schoolStage: string
    gradeLevel: string
    paperType: string
    targetDifficulty: number
    remark: string
    sections: PaperRuleSection[]
}

type Paper = {
    id: Id
    paperCode: string
    paperName: string
    questionCount: number
    totalScore: number
}

type ClassInfo = {
    id: Id
    className: string
}

type TaskSummary = {
    taskId: Id
    taskStudentId: Id | null
    paperId: Id
    taskName: string
    status: string
    totalScore: number | null
    deadlineTime: string | null
}

type PaperQuestion = {
    id: Id
    questionNo: number
    sectionName: string
    questionType: string
    score: number
    stemContent: string
    answerContent: string
    answerValue: string
    analysisContent: string
    studentAnswer: string
    judgeResult: string
    judgeScore: number
    options: QuestionOption[]
}

type TaskDetail = {
    taskId: Id
    taskStudentId: Id
    paperId: Id
    taskName: string
    status: string
    questions: PaperQuestion[]
}

type DashboardMetric = {
    key: string
    label: string
    value: string
}

type WeakKnowledgePoint = {
    knowledgePointId: Id
    pointName: string
    wrongCount: number
}

type DashboardSummary = {
    roleType: string
    metrics: DashboardMetric[]
    recentTasks: TaskSummary[]
    weakKnowledgePoints: WeakKnowledgePoint[]
}

type TaskStudent = {
    taskStudentId: Id
    studentId: Id
    studentName: string
    studentNo: string
    status: string
    totalScore: number | null
    submitTime: string | null
    wrongCount: number
}

type WrongQuestion = {
    id: Id
    taskStudentId: Id | null
    questionId: Id
    paperQuestionId: Id
    taskName: string
    stemContent: string
    studentAnswer: string
    standardAnswer: string
    analysisContent: string
    wrongReason: string
    reviewCount: number
    mastered: number
    wrongTime: string
    options: QuestionOption[]
}

type CalculateResponse = {
    latex: string
    mathJson: unknown
    symjaExpression: string
    result: string
    resultLatex: string
    message: string
}

type MatrixAction = 'determinant' | 'rowReduce' | 'matrixRank' | 'nullSpace' | 'linearSolve'

type MatrixInfo = {
    node: unknown[]
    rowCount: number
    columnCount: number
}

const matrixActionLabel: Record<MatrixAction, string> = {
    determinant: '行列式',
    rowReduce: '行最简',
    matrixRank: '秩',
    nullSpace: '零空间',
    linearSolve: '线性方程组',
}

const isJsonArray = (value: unknown): value is unknown[] => Array.isArray(value)

const getMatrixInfo = (value: unknown): MatrixInfo | null => {
    const node = unwrapMatrixNode(value)
    if (!node) {
        return null
    }

    const rowsNode = node[1]
    if (!isJsonArray(rowsNode) || rowsNode[0] !== 'List') {
        return null
    }

    let columnCount: number | null = null
    for (let i = 1; i < rowsNode.length; i += 1) {
        const rowNode = rowsNode[i]
        if (!isJsonArray(rowNode) || rowNode[0] !== 'List') {
            return null
        }

        const currentColumnCount = rowNode.length - 1
        if (columnCount === null) {
            columnCount = currentColumnCount
        } else if (columnCount !== currentColumnCount) {
            return null
        }
    }

    return {
        node,
        rowCount: rowsNode.length - 1,
        columnCount: columnCount ?? 0,
    }
}

const unwrapMatrixNode = (value: unknown): unknown[] | null => {
    if (!isJsonArray(value)) {
        return null
    }

    if (value[0] === 'Matrix') {
        return value
    }

    if (value[0] === 'List' && value.length === 2) {
        return unwrapMatrixNode(value[1])
    }

    return null
}

const buildMatrixActionMathJson = (action: MatrixAction, matrixInfo: MatrixInfo): unknown[] | null => {
    if (action === 'linearSolve') {
        return buildLinearSolveFromAugmentedMatrix(matrixInfo)
    }

    const headByAction: Record<Exclude<MatrixAction, 'linearSolve'>, string> = {
        determinant: 'Determinant',
        rowReduce: 'RowReduce',
        matrixRank: 'MatrixRank',
        nullSpace: 'NullSpace',
    }

    return [headByAction[action], matrixInfo.node]
}

const buildLinearSolveFromAugmentedMatrix = (matrixInfo: MatrixInfo): unknown[] | null => {
    if (matrixInfo.columnCount < 2 || matrixInfo.columnCount !== matrixInfo.rowCount + 1) {
        return null
    }

    const rowsNode = matrixInfo.node[1]
    if (!isJsonArray(rowsNode)) {
        return null
    }

    const coefficientRows: unknown[] = ['List']
    const valueRows: unknown[] = ['List']
    for (let i = 1; i < rowsNode.length; i += 1) {
        const rowNode = rowsNode[i]
        if (!isJsonArray(rowNode)) {
            return null
        }

        coefficientRows.push(['List', ...rowNode.slice(1, -1)])
        valueRows.push(['List', rowNode[rowNode.length - 1]])
    }

    return [
        'LinearSolve',
        ['Matrix', coefficientRows, "'[]'"],
        ['Matrix', valueRows, "'[]'"],
    ]
}

const normalizeLatexForComputeEngine = (value: string) => {
    const source = normalizeNthDerivativeLatex(stripOuterMathDelimiters(value.trim()))
    return source.replace(
        /^(.+)\\(?:bigm|Bigm|middle)\s*(?:\||\\vert)\s*(_(?:\{[^{}]+\}|[^\s]+))$/,
        (_, expression: string, subscript: string) => `\\left.${expression}\\right|${subscript}`,
    )
}

const stripOuterMathDelimiters = (value: string) => {
    const source = value.trim()
    if (source.startsWith('$$') && source.endsWith('$$')) {
        return source.slice(2, -2).trim()
    }
    if (source.startsWith('\\[') && source.endsWith('\\]')) {
        return source.slice(2, -2).trim()
    }
    if (source.startsWith('\\(') && source.endsWith('\\)')) {
        return source.slice(2, -2).trim()
    }
    return source
}

const normalizeNthDerivativeLatex = (value: string) => value.replace(
    /^\\(?:dfrac|tfrac|frac)\{?(?:\\mathrm\{d\}|d)\^?\{?(\d+)\}?\}?\{?(?:\\mathrm\{d\}|d)\s*([a-zA-Z])\^?\{?\1\}?\}?(.+)$/,
    (_, order: string, variable: string, expression: string) => {
        const firstDerivative = `\\frac{d}{d${variable}}`
        return `${firstDerivative.repeat(Number(order))}${expression}`
    },
)

type QuestionFormState = {
    id?: Id
    questionType: string
    stemContent: string
    answerValue: string
    analysisContent: string
    difficulty: number
    defaultScore: number
    blankCount: number
    estimatedMinutes: number
    knowledgePointIds: Id[]
    options: QuestionOption[]
}

const questionTypeLabel: Record<string, string> = {
    calculation: '计算题',
    fill_blank: '填空题',
    single_choice: '选择题',
}

const statusLabel: Record<string, string> = {
    pending: '待提交',
    published: '待提交',
    submitted: '已提交',
    corrected: '已批改',
    correct: '正确',
    wrong: '错误',
}

const statusColor: Record<string, string> = {
    pending: 'processing',
    published: 'processing',
    submitted: 'warning',
    corrected: 'success',
    correct: 'success',
    wrong: 'error',
}

const choiceQuestionTypes = new Set(['single_choice'])

const isChoiceQuestion = (questionType: string) => choiceQuestionTypes.has(questionType)

const canAnswerTask = (status?: string | null) => status === 'pending' || status === 'published'

const defaultOptions: QuestionOption[] = [
    {optionKey: 'A', optionContent: '\\(2x\\)', isCorrect: 1, sortNo: 1},
    {optionKey: 'B', optionContent: '\\(x\\)', isCorrect: 0, sortNo: 2},
    {optionKey: 'C', optionContent: '\\(x^2\\)', isCorrect: 0, sortNo: 3},
    {optionKey: 'D', optionContent: '\\(2\\)', isCorrect: 0, sortNo: 4},
]

const defaultQuestionForm: QuestionFormState = {
    questionType: 'calculation',
    stemContent: '计算：\\(\\int_0^1 x^2\\,dx\\)',
    answerValue: '\\frac{1}{3}',
    analysisContent: '原函数为 \\(\\frac{x^3}{3}\\)，代入上下限得到 \\(\\frac{1}{3}\\)。',
    difficulty: 0.4,
    defaultScore: 10,
    blankCount: 0,
    estimatedMinutes: 3,
    knowledgePointIds: [],
    options: defaultOptions,
}

const defaultRuleSection: PaperRuleSection = {
    sectionName: '计算题',
    questionType: 'calculation',
    count: 5,
    score: 10,
    knowledgePointCodes: [],
}

const defaultPaperRuleForm: PaperRuleFormState = {
    ruleName: '智能作业组卷规则',
    schoolStage: 'junior',
    gradeLevel: 'grade7',
    paperType: 'homework',
    targetDifficulty: 0.5,
    remark: '',
    sections: [defaultRuleSection],
}

export function DashboardPanel() {
    const {message} = AntApp.useApp()
    const [summary, setSummary] = useState<DashboardSummary | null>(null)
    const [loading, setLoading] = useState(false)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            setSummary(await mathRequest<DashboardSummary>('/api/dashboard/summary'))
        } catch (error) {
            message.error(error instanceof Error ? error.message : '看板数据加载失败')
        } finally {
            setLoading(false)
        }
    }, [message])

    useEffect(() => {
        void load()
    }, [load])

    const maxWrongCount = Math.max(1, ...(summary?.weakKnowledgePoints.map((item) => item.wrongCount) ?? [0]))

    return (
        <Row gutter={[20, 20]}>
            {(summary?.metrics ?? []).map((metric) => (
                <Col xs={24} sm={12} xl={6} key={metric.key}>
                    <Card className="panel-card" loading={loading}>
                        <Statistic title={metric.label} value={metric.value}/>
                    </Card>
                </Col>
            ))}
            {!summary && (
                <Col span={24}>
                    <Card className="panel-card" loading={loading}/>
                </Col>
            )}
            <Col xs={24} lg={14}>
                <Card title="最近作业" className="panel-card" extra={<TeamOutlined/>}>
                    <List
                        loading={loading}
                        dataSource={summary?.recentTasks ?? []}
                        locale={{emptyText: <Empty description="暂无作业"/>}}
                        renderItem={(task) => (
                            <List.Item>
                                <List.Item.Meta
                                    title={
                                        <Space>
                                            <Text strong>{task.taskName}</Text>
                                            <Tag color={statusColor[task.status]}>{statusLabel[task.status] || task.status}</Tag>
                                        </Space>
                                    }
                                    description={`截止：${task.deadlineTime || '未设置'} / 得分：${task.totalScore ?? '-'}`}
                                />
                            </List.Item>
                        )}
                    />
                </Card>
            </Col>
            <Col xs={24} lg={10}>
                <Card title="薄弱知识点" className="panel-card" extra={<ExclamationCircleOutlined/>}>
                    <List
                        loading={loading}
                        dataSource={summary?.weakKnowledgePoints ?? []}
                        locale={{emptyText: <Empty description="暂无薄弱知识点"/>}}
                        renderItem={(item) => (
                            <List.Item>
                                <Space direction="vertical" className="full-width" size={4}>
                                    <Flex justify="space-between">
                                        <Text strong>{item.pointName}</Text>
                                        <Text type="secondary">{item.wrongCount} 错</Text>
                                    </Flex>
                                    <Progress percent={Math.round((item.wrongCount / maxWrongCount) * 100)} size="small"/>
                                </Space>
                            </List.Item>
                        )}
                    />
                </Card>
            </Col>
        </Row>
    )
}

export function CalculatorPanel() {
    const [latex, setLatex] = useState('\\int_0^1 x^2\\,dx')
    const [mathJson, setMathJson] = useState<unknown>(null)
    const [result, setResult] = useState<CalculateResponse | null>(null)
    const [loading, setLoading] = useState(false)
    const {message} = AntApp.useApp()
    const matrixInfo = useMemo(() => {
        try {
            return getMatrixInfo(computeEngine.parse(normalizeLatexForComputeEngine(latex)).json)
        } catch {
            return null
        }
    }, [latex])

    const submitCalculation = async (requestLatex: string, requestMathJson: unknown) => {
        setLoading(true)
        try {
            setMathJson(requestMathJson)
            const data = await mathRequest<CalculateResponse>('/api/calculate', {
                method: 'POST',
                body: JSON.stringify({latex: requestLatex, mathJson: requestMathJson}),
            })
            setResult(data)
            message.success(data.message || '计算完成')
        } catch (error) {
            message.error(error instanceof Error ? error.message : '计算失败')
        } finally {
            setLoading(false)
        }
    }

    const calculate = async () => {
        const parsedMathJson = computeEngine.parse(normalizeLatexForComputeEngine(latex)).json
        await submitCalculation(latex, parsedMathJson)
    }

    const calculateMatrixAction = async (action: MatrixAction) => {
        if (!matrixInfo) {
            message.warning('请先输入一个矩阵')
            return
        }

        const actionMathJson = buildMatrixActionMathJson(action, matrixInfo)
        if (!actionMathJson) {
            message.warning('线性方程组请使用增广矩阵，最后一列作为常数项')
            return
        }

        await submitCalculation(`${matrixActionLabel[action]}(${latex})`, actionMathJson)
    }

    const examples = [
        '\\int_0^1 x^2\\,dx',
        '\\lim_{x\\to0}\\frac{\\sin x}{x}',
        '\\frac{d}{dx}x^3',
        'x^2=1',
        '\\begin{bmatrix}1&2\\\\2&4\\end{bmatrix}',
        '\\begin{bmatrix}2&1&5\\\\1&-1&1\\end{bmatrix}',
        '\\det\\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}',
        '\\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}^{-1}',
        '\\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}+\\begin{bmatrix}5&6\\\\7&8\\end{bmatrix}',
        '\\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}\\cdot\\begin{bmatrix}5&6\\\\7&8\\end{bmatrix}',
    ]

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
                                                <LatexText value={item} mathOnly/>
                                            </button>
                                        ))}
                                    </div>
                                ),
                            },
                        ]}
                    />
                    <LabeledBlock label="公式编辑器">
                        <MathInput value={latex} onChange={setLatex}/>
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
                                    {(Object.keys(matrixActionLabel) as MatrixAction[]).map((action) => (
                                        <Button
                                            key={action}
                                            onClick={() => calculateMatrixAction(action)}
                                            loading={loading}
                                        >
                                            {matrixActionLabel[action]}
                                        </Button>
                                    ))}
                                </Space>
                            </Flex>
                        </div>
                    )}
                    <Button
                        type="primary"
                        icon={<CalculatorOutlined/>}
                        size="large"
                        loading={loading}
                        onClick={calculate}
                    >
                        开始计算
                    </Button>
                </Card>
            </Col>
            <Col xs={24} xl={12}>
                <Card title="计算结果" className="panel-card" extra={<Tag color="orange">LaTeX 渲染</Tag>}>
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
                                                <LatexText value={result.resultLatex || result.result} mathOnly display/>
                                            </div>
                                            <Divider/>
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
                        <Empty description="输入公式后点击计算"/>
                    )}
                </Card>
            </Col>
        </Row>
    )
}

export function QuestionManager() {
    const {message} = AntApp.useApp()
    const [questions, setQuestions] = useState<Question[]>([])
    const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePoint[]>([])
    const [form, setForm] = useState<QuestionFormState>(defaultQuestionForm)
    const [loading, setLoading] = useState(false)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const [questionData, knowledgeData] = await Promise.all([
                mathRequest<Question[]>('/api/questions'),
                mathRequest<KnowledgePoint[]>('/api/catalog/knowledge-points'),
            ])
            setQuestions(questionData)
            setKnowledgePoints(knowledgeData)
        } catch (error) {
            message.error(error instanceof Error ? error.message : '题库加载失败')
        } finally {
            setLoading(false)
        }
    }, [message])

    useEffect(() => {
        void load()
    }, [load])

    const save = async () => {
        if (!form.stemContent.trim() || !form.answerValue.trim()) {
            message.warning('题干和标准答案不能为空')
            return
        }

        setLoading(true)
        try {
            await mathRequest<Question>('/api/questions', {
                method: 'POST',
                body: JSON.stringify({
                    ...form,
                    inputType: 'latex',
                    answerContent: form.answerValue,
                    options: form.questionType === 'single_choice' ? form.options : [],
                }),
            })
            message.success(form.id ? '题目已更新' : '题目已新增')
            setForm(defaultQuestionForm)
            await load()
        } catch (error) {
            message.error(error instanceof Error ? error.message : '保存失败')
        } finally {
            setLoading(false)
        }
    }

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
        })
    }

    const remove = async (id: Id) => {
        setLoading(true)
        try {
            await mathRequest<void>(`/api/questions/${id}`, {method: 'DELETE'})
            message.success('题目已删除')
            await load()
        } catch (error) {
            message.error(error instanceof Error ? error.message : '删除失败')
        } finally {
            setLoading(false)
        }
    }

    const columns: TableColumnsType<Question> = [
        {
            title: '题目',
            dataIndex: 'stemContent',
            render: (value: string, row) => (
                <Space direction="vertical" size={2}>
                    <Text strong>{row.questionCode}</Text>
                    <LatexText value={value}/>
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
            render: (value: number) => <Progress percent={Math.round(Number(value) * 100)} size="small"/>,
        },
        {
            title: '答案',
            dataIndex: 'answerValue',
            width: 160,
            render: (value: string) => <LatexText value={value} mathOnly/>,
        },
        {
            title: '操作',
            width: 150,
            render: (_, row) => (
                <Space>
                    <Button icon={<EditOutlined/>} onClick={() => edit(row)}>编辑</Button>
                    <Popconfirm title="确认删除这道题？" onConfirm={() => remove(row.id)}>
                        <Button danger icon={<DeleteOutlined/>}/>
                    </Popconfirm>
                </Space>
            ),
        },
    ]

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
                        pagination={{pageSize: 6}}
                    />
                </Card>
            </Col>
        </Row>
    )
}

function QuestionEditor({
    value,
    onChange,
    knowledgePoints,
    onSave,
    onReset,
    loading,
}: {
    value: QuestionFormState
    onChange: (value: QuestionFormState) => void
    knowledgePoints: KnowledgePoint[]
    onSave: () => void
    onReset: () => void
    loading: boolean
}) {
    const updateOption = (index: number, patch: Partial<QuestionOption>) => {
        const options = [...value.options]
        options[index] = {...options[index], ...patch}
        onChange({...value, options})
    }

    return (
        <Card
            title={value.id ? '编辑题目' : '新增题目'}
            className="panel-card sticky-card"
            extra={<Button icon={<PlusOutlined/>} onClick={onReset}>新题</Button>}
        >
            <Form layout="vertical">
                <Form.Item label="题型">
                    <Segmented
                        block
                        value={value.questionType}
                        onChange={(questionType) => onChange({...value, questionType: String(questionType)})}
                        options={[
                            {label: '计算', value: 'calculation'},
                            {label: '填空', value: 'fill_blank'},
                            {label: '选择', value: 'single_choice'},
                        ]}
                    />
                </Form.Item>
                <Form.Item label="知识点">
                    <Select
                        mode="multiple"
                        value={value.knowledgePointIds}
                        onChange={(knowledgePointIds) => onChange({...value, knowledgePointIds})}
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
                        onChange={(event) => onChange({...value, stemContent: event.target.value})}
                        rows={4}
                    />
                    <div className="stem-preview">
                        <Text type="secondary">题干预览</Text>
                        <div className="latex-preview">
                            <LatexText value={value.stemContent}/>
                        </div>
                    </div>
                </Form.Item>
                <Form.Item label="标准答案">
                    <MathInput
                        value={value.answerValue}
                        onChange={(answerValue) => onChange({...value, answerValue})}
                    />
                </Form.Item>
                <Form.Item label="解析">
                    <TextArea
                        value={value.analysisContent}
                        onChange={(event) => onChange({...value, analysisContent: event.target.value})}
                        rows={3}
                    />
                </Form.Item>
                <Row gutter={12}>
                    <Col span={12}>
                        <Form.Item label="分值">
                            <InputNumber
                                min={1}
                                value={value.defaultScore}
                                onChange={(defaultScore) => onChange({...value, defaultScore: Number(defaultScore || 0)})}
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
                                onChange={(difficulty) => onChange({...value, difficulty: Number(difficulty || 0)})}
                                className="full-width"
                            />
                        </Form.Item>
                    </Col>
                </Row>
                {value.questionType === 'single_choice' && (
                    <div className="option-editor">
                        <Text strong>选项</Text>
                        {value.options.map((option, index) => (
                            <Space key={option.optionKey} className="option-row" align="center">
                                <Tag>{option.optionKey}</Tag>
                                <Input
                                    value={option.optionContent}
                                    onChange={(event) => updateOption(index, {optionContent: event.target.value})}
                                />
                                <Select
                                    value={option.isCorrect}
                                    onChange={(isCorrect) => updateOption(index, {isCorrect})}
                                    options={[
                                        {label: '错误', value: 0},
                                        {label: '正确', value: 1},
                                    ]}
                                    className="option-select"
                                />
                            </Space>
                        ))}
                    </div>
                )}
                <Button
                    type="primary"
                    icon={<FileAddOutlined/>}
                    loading={loading}
                    onClick={onSave}
                    block
                >
                    保存题目
                </Button>
            </Form>
        </Card>
    )
}

export function PaperManager() {
    const {message} = AntApp.useApp()
    const [rules, setRules] = useState<PaperRule[]>([])
    const [papers, setPapers] = useState<Paper[]>([])
    const [classes, setClasses] = useState<ClassInfo[]>([])
    const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePoint[]>([])
    const [ruleId, setRuleId] = useState<Id | undefined>()
    const [paperId, setPaperId] = useState<Id | undefined>()
    const [classId, setClassId] = useState<Id | undefined>()
    const [paperName, setPaperName] = useState('智能作业自动组卷')
    const [taskName, setTaskName] = useState('智能作业练习')
    const [ruleModalOpen, setRuleModalOpen] = useState(false)
    const [editingRule, setEditingRule] = useState<PaperRule | null>(null)
    const [ruleForm, setRuleForm] = useState<PaperRuleFormState>(defaultPaperRuleForm)
    const [loading, setLoading] = useState(false)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const [ruleData, paperData, classData, knowledgeData] = await Promise.all([
                mathRequest<PaperRule[]>('/api/papers/rules'),
                mathRequest<Paper[]>('/api/papers'),
                mathRequest<ClassInfo[]>('/api/catalog/classes'),
                mathRequest<KnowledgePoint[]>('/api/catalog/knowledge-points'),
            ])
            setRules(ruleData)
            setPapers(paperData)
            setClasses(classData)
            setKnowledgePoints(knowledgeData)
        } catch (error) {
            message.error(error instanceof Error ? error.message : '组卷数据加载失败')
        } finally {
            setLoading(false)
        }
    }, [message])

    useEffect(() => {
        void load()
    }, [load])

    const parseRuleForm = (rule: PaperRule): PaperRuleFormState => {
        let sections: PaperRuleSection[] = [defaultRuleSection]
        try {
            const parsed = JSON.parse(rule.ruleConfig || '{}') as { sections?: PaperRuleSection[] }
            if (parsed.sections?.length) {
                sections = parsed.sections.map((section) => ({
                    sectionName: section.sectionName || questionTypeLabel[section.questionType] || '大题',
                    questionType: section.questionType || 'calculation',
                    count: Number(section.count || 1),
                    score: Number(section.score || 10),
                    knowledgePointCodes: section.knowledgePointCodes || [],
                }))
            }
        } catch {
            sections = [defaultRuleSection]
        }

        return {
            ruleName: rule.ruleName,
            schoolStage: rule.schoolStage || 'junior',
            gradeLevel: rule.gradeLevel || 'grade7',
            paperType: rule.paperType || 'homework',
            targetDifficulty: Number(rule.targetDifficulty ?? 0.5),
            remark: rule.remark || '',
            sections,
        }
    }

    const openCreateRule = () => {
        setEditingRule(null)
        setRuleForm({
            ...defaultPaperRuleForm,
            sections: [{...defaultRuleSection}],
        })
        setRuleModalOpen(true)
    }

    const openEditRule = (rule: PaperRule) => {
        setEditingRule(rule)
        setRuleForm(parseRuleForm(rule))
        setRuleModalOpen(true)
    }

    const updateRuleSection = (index: number, patch: Partial<PaperRuleSection>) => {
        const sections = [...ruleForm.sections]
        sections[index] = {...sections[index], ...patch}
        setRuleForm({...ruleForm, sections})
    }

    const addRuleSection = () => {
        setRuleForm({
            ...ruleForm,
            sections: [...ruleForm.sections, {...defaultRuleSection}],
        })
    }

    const removeRuleSection = (index: number) => {
        if (ruleForm.sections.length <= 1) {
            message.warning('至少保留一行抽题规则')
            return
        }
        setRuleForm({
            ...ruleForm,
            sections: ruleForm.sections.filter((_, currentIndex) => currentIndex !== index),
        })
    }

    const saveRule = async () => {
        if (!ruleForm.ruleName.trim()) {
            message.warning('规则名称不能为空')
            return
        }
        if (!ruleForm.sections.length) {
            message.warning('至少配置一行抽题规则')
            return
        }
        const invalidSection = ruleForm.sections.some((section) => (
            !section.questionType || !section.count || section.count < 1 || !section.score || section.score <= 0
        ))
        if (invalidSection) {
            message.warning('请完整填写每行题型、数量和分值')
            return
        }
        if (ruleForm.targetDifficulty < 0 || ruleForm.targetDifficulty > 1) {
            message.warning('目标难度必须在 0 到 1 之间')
            return
        }

        setLoading(true)
        try {
            const url = editingRule ? `/api/papers/rules/${editingRule.id}` : '/api/papers/rules'
            const method = editingRule ? 'PUT' : 'POST'
            const saved = await mathRequest<PaperRule>(url, {
                method,
                body: JSON.stringify(ruleForm),
            })
            message.success(editingRule ? '规则已更新' : '规则已新增')
            setRuleId(saved.id)
            setRuleModalOpen(false)
            await load()
        } catch (error) {
            message.error(error instanceof Error ? error.message : '规则保存失败')
        } finally {
            setLoading(false)
        }
    }

    const deleteRule = async (id: Id) => {
        setLoading(true)
        try {
            await mathRequest<void>(`/api/papers/rules/${id}`, {method: 'DELETE'})
            if (ruleId === id) {
                setRuleId(undefined)
            }
            message.success('规则已删除')
            await load()
        } catch (error) {
            message.error(error instanceof Error ? error.message : '规则删除失败')
        } finally {
            setLoading(false)
        }
    }

    const generate = async () => {
        if (!ruleId) {
            message.warning('请选择组卷规则')
            return
        }
        setLoading(true)
        try {
            const paper = await mathRequest<Paper>('/api/papers/auto-generate', {
                method: 'POST',
                body: JSON.stringify({ruleId, paperName}),
            })
            setPaperId(paper.id)
            message.success('试卷已生成')
            await load()
        } catch (error) {
            message.error(error instanceof Error ? error.message : '生成失败')
        } finally {
            setLoading(false)
        }
    }

    const publish = async () => {
        if (!paperId || !classId) {
            message.warning('请选择试卷和班级')
            return
        }
        setLoading(true)
        try {
            await mathRequest<TaskSummary>('/api/tasks/publish', {
                method: 'POST',
                body: JSON.stringify({paperId, taskName, classId, deadlineDays: 7}),
            })
            message.success('作业已发布')
        } catch (error) {
            message.error(error instanceof Error ? error.message : '发布失败')
        } finally {
            setLoading(false)
        }
    }

    const ruleColumns: TableColumnsType<PaperRule> = [
        {
            title: '规则',
            dataIndex: 'ruleName',
            render: (value: string, row) => (
                <Space direction="vertical" size={2}>
                    <Text strong>{value}</Text>
                    <Text type="secondary">{row.gradeLevel || 'grade7'} / 难度 {row.targetDifficulty ?? '-'}</Text>
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
                    <Button size="small" icon={<EditOutlined/>} onClick={() => openEditRule(row)}>编辑</Button>
                    <Popconfirm title="确认删除这条组卷规则？" onConfirm={() => deleteRule(row.id)}>
                        <Button size="small" danger icon={<DeleteOutlined/>}/>
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    return (
        <>
            <Row gutter={[20, 20]}>
                <Col xs={24} lg={10}>
                    <Card title="自动组卷" className="panel-card">
                        <Form layout="vertical">
                            <Form.Item label="试卷名称">
                                <Input value={paperName} onChange={(event) => setPaperName(event.target.value)}/>
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
                            <Button type="primary" icon={<FileTextOutlined/>} loading={loading} onClick={generate} block>
                                生成试卷
                            </Button>
                        </Form>
                    </Card>

                    <Card title="发布作业" className="panel-card">
                        <Form layout="vertical">
                            <Form.Item label="作业名称">
                                <Input value={taskName} onChange={(event) => setTaskName(event.target.value)}/>
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
                                    options={classes.map((item) => ({label: item.className, value: item.id}))}
                                />
                            </Form.Item>
                            <Button type="primary" icon={<SendOutlined/>} loading={loading} onClick={publish} block>
                                发布作业
                            </Button>
                        </Form>
                    </Card>
                </Col>
                <Col xs={24} lg={14}>
                    <Card
                        title="组卷规则管理"
                        className="panel-card"
                        extra={<Button type="primary" icon={<PlusOutlined/>} onClick={openCreateRule}>新增规则</Button>}
                    >
                        <Table
                            rowKey={(row) => String(row.id)}
                            columns={ruleColumns}
                            dataSource={rules}
                            loading={loading}
                            pagination={{pageSize: 5}}
                        />
                    </Card>

                    <Card title="已生成试卷" className="panel-card">
                        <List
                            loading={loading}
                            dataSource={papers}
                            locale={{emptyText: <Empty description="暂无试卷"/>}}
                            renderItem={(paper) => (
                                <List.Item
                                    actions={[
                                        <Button key="use" onClick={() => setPaperId(paper.id)}>用于发布</Button>,
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
                                    onChange={(event) => setRuleForm({...ruleForm, ruleName: event.target.value})}
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
                                    onChange={(targetDifficulty) => setRuleForm({...ruleForm, targetDifficulty: Number(targetDifficulty ?? 0.5)})}
                                    className="full-width"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label="学段">
                                <Input
                                    value={ruleForm.schoolStage}
                                    onChange={(event) => setRuleForm({...ruleForm, schoolStage: event.target.value})}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label="年级">
                                <Input
                                    value={ruleForm.gradeLevel}
                                    onChange={(event) => setRuleForm({...ruleForm, gradeLevel: event.target.value})}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label="试卷类型">
                                <Select
                                    value={ruleForm.paperType}
                                    onChange={(paperType) => setRuleForm({...ruleForm, paperType})}
                                    options={[
                                        {label: '作业', value: 'homework'},
                                        {label: '测验', value: 'quiz'},
                                        {label: '练习', value: 'practice'},
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="备注">
                                <Input
                                    value={ruleForm.remark}
                                    onChange={(event) => setRuleForm({...ruleForm, remark: event.target.value})}
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
                                    <Button danger size="small" onClick={() => removeRuleSection(index)}>
                                        删除
                                    </Button>
                                }
                            >
                                <Row gutter={12}>
                                    <Col xs={24} md={8}>
                                        <Form.Item label="名称" required>
                                            <Input
                                                value={section.sectionName}
                                                onChange={(event) => updateRuleSection(index, {sectionName: event.target.value})}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Form.Item label="题型" required>
                                            <Select
                                                value={section.questionType}
                                                onChange={(questionType) => updateRuleSection(index, {
                                                    questionType,
                                                    sectionName: questionTypeLabel[questionType] || section.sectionName,
                                                })}
                                                options={[
                                                    {label: '计算题', value: 'calculation'},
                                                    {label: '填空题', value: 'fill_blank'},
                                                    {label: '选择题', value: 'single_choice'},
                                                ]}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={12} md={4}>
                                        <Form.Item label="数量" required>
                                            <InputNumber
                                                min={1}
                                                value={section.count}
                                                onChange={(count) => updateRuleSection(index, {count: Number(count || 1)})}
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
                                                onChange={(score) => updateRuleSection(index, {score: Number(score || 1)})}
                                                className="full-width"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item label="知识点">
                                            <Select
                                                mode="multiple"
                                                value={section.knowledgePointCodes}
                                                onChange={(knowledgePointCodes) => updateRuleSection(index, {knowledgePointCodes})}
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
                        <Button icon={<PlusOutlined/>} onClick={addRuleSection}>
                            添加一行抽题规则
                        </Button>
                    </Space>
                </Form>
            </Modal>
        </>
    )
}

export function TaskPanel() {
    const { initialState } = useModel('@@initialState')
    const user = initialState?.currentUser
    const {message} = AntApp.useApp()
    const [tasks, setTasks] = useState<TaskSummary[]>([])
    const [selectedTask, setSelectedTask] = useState<TaskSummary | null>(null)
    const [taskStudents, setTaskStudents] = useState<TaskStudent[]>([])
    const [detail, setDetail] = useState<TaskDetail | null>(null)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)

    const isStudent = user?.roleType === 'student'

    const loadTasks = useCallback(async () => {
        setLoading(true)
        try {
            setTasks(await mathRequest<TaskSummary[]>('/api/tasks/mine'))
        } catch (error) {
            message.error(error instanceof Error ? error.message : '作业加载失败')
        } finally {
            setLoading(false)
        }
    }, [message])

    useEffect(() => {
        void loadTasks()
    }, [loadTasks])

    const openTask = useCallback(async (taskStudentId: Id | null) => {
        if (!taskStudentId) {
            message.info('教师端先查看发布记录，学生端可进入作答详情')
            return
        }
        setLoading(true)
        try {
            const data = await mathRequest<TaskDetail>(`/api/tasks/student/${taskStudentId}`)
            setDetail(data)
            const answerMap: Record<string, string> = {}
            data.questions.forEach((question) => {
                answerMap[String(question.id)] = question.studentAnswer || ''
            })
            setAnswers(answerMap)
        } catch (error) {
            message.error(error instanceof Error ? error.message : '作业详情加载失败')
        } finally {
            setLoading(false)
        }
    }, [message])

    const openTaskSummary = async (task: TaskSummary) => {
        setSelectedTask(task)
        if (isStudent) {
            await openTask(task.taskStudentId)
            return
        }
        setDetail(null)
        setTaskStudents([])
        setLoading(true)
        try {
            setTaskStudents(await mathRequest<TaskStudent[]>(`/api/tasks/${task.taskId}/students`))
        } catch (error) {
            message.error(error instanceof Error ? error.message : '学生提交数据加载失败')
        } finally {
            setLoading(false)
        }
    }

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
            render: (value: string) => <Tag color={statusColor[value]}>{statusLabel[value] || value}</Tag>,
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
            render: (value: number) => <Tag color={value > 0 ? 'error' : 'success'}>{value}</Tag>,
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
            render: (_, row) => <Button size="small" onClick={() => openTask(row.taskStudentId)}>查看</Button>,
        },
    ]

    const submit = async () => {
        if (!detail) {
            return
        }
        setLoading(true)
        try {
            const data = await mathRequest<{ totalScore: number }>('/api/tasks/submit', {
                method: 'POST',
                body: JSON.stringify({
                    taskStudentId: detail.taskStudentId,
                    answers: detail.questions.map((question) => ({
                        paperQuestionId: question.id,
                        answerLatex: answers[String(question.id)] || '',
                    })),
                }),
            })
            message.success(`提交成功，得分 ${data.totalScore}`)
            await openTask(detail.taskStudentId)
            await loadTasks()
        } catch (error) {
            message.error(error instanceof Error ? error.message : '提交失败')
        } finally {
            setLoading(false)
        }
    }

    const updateAnswer = (questionId: Id, value: string) => {
        setAnswers((prev) => ({
            ...prev,
            [String(questionId)]: value,
        }))
    }

    return (
        <Row gutter={[20, 20]}>
            <Col span={24}>
                <PageHero
                    title={isStudent ? '我的作业' : '作业批改'}
                    subtitle={isStudent ? '在线完成老师发布的作业，提交后查看批改结果。' : '查看作业发布记录、学生提交情况和自动批改结果。'}
                >
                    <Metric label="当前身份" value={isStudent ? '学生' : '教师'} />
                    <Metric label="判题策略" value="LaTeX 精确匹配" />
                </PageHero>
            </Col>
            <Col xs={24} lg={8}>
                <Card title={isStudent ? '我的作业' : '已发布作业'} className="panel-card">
                    <List
                        loading={loading}
                        dataSource={tasks}
                        locale={{emptyText: <Empty description="暂无作业"/>}}
                        renderItem={(task) => (
                            <List.Item
                                className="task-item"
                                onClick={() => openTaskSummary(task)}
                            >
                                <List.Item.Meta
                                    title={
                                        <Space>
                                            <Text strong>{task.taskName}</Text>
                                            <Tag color={statusColor[task.status]}>{statusLabel[task.status] || task.status}</Tag>
                                        </Space>
                                    }
                                    description={
                                        <Space direction="vertical" size={2}>
                                            <Text type="secondary">截止：{task.deadlineTime || '未设置'}</Text>
                                            <Text type="secondary">得分：{task.totalScore ?? '-'}</Text>
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
                    extra={detail && <Tag color={statusColor[detail.status]}>{statusLabel[detail.status] || detail.status}</Tag>}
                >
                    {!isStudent && selectedTask && (
                        <Table
                            rowKey={(row) => String(row.taskStudentId)}
                            columns={studentColumns}
                            dataSource={taskStudents}
                            loading={loading}
                            pagination={{pageSize: 6}}
                            className="student-task-table"
                        />
                    )}
                    {detail ? (
                        <Space direction="vertical" size={16} className="full-width">
                            {detail.questions.map((question) => (
                                <Card key={String(question.id)} className="question-card" size="small">
                                    <Flex justify="space-between" gap={12} wrap="wrap">
                                        <Space>
                                            <Tag color="blue">第 {question.questionNo} 题</Tag>
                                            <Tag>{questionTypeLabel[question.questionType] || question.questionType}</Tag>
                                            <Text type="secondary">{question.score} 分</Text>
                                        </Space>
                                        {question.judgeResult && (
                                            <Tag color={statusColor[question.judgeResult]}>
                                                {statusLabel[question.judgeResult] || question.judgeResult}
                                            </Tag>
                                        )}
                                    </Flex>
                                    <div className="stem-block">
                                        <LatexText value={question.stemContent}/>
                                    </div>
                                    {question.options?.length > 0 && (
                                        <Row gutter={[12, 12]}>
                                            {question.options.map((option) => (
                                                <Col xs={24} md={12} key={option.optionKey}>
                                                    <button
                                                        type="button"
                                                        className={[
                                                            'option-card',
                                                            isStudent && canAnswerTask(detail.status) && isChoiceQuestion(question.questionType)
                                                                ? 'choice-option-card'
                                                                : '',
                                                            answers[String(question.id)] === option.optionKey
                                                                ? 'choice-option-card-selected'
                                                                : '',
                                                        ].filter(Boolean).join(' ')}
                                                        disabled={!isStudent || !canAnswerTask(detail.status) || !isChoiceQuestion(question.questionType)}
                                                        onClick={() => updateAnswer(question.id, option.optionKey)}
                                                    >
                                                        <Tag>{option.optionKey}</Tag>
                                                        <LatexText value={option.optionContent}/>
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
                                                    <Tag color={answers[String(question.id)] ? 'blue' : 'default'}>
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
                                                        <LatexText value={question.studentAnswer} mathOnly/>
                                                    )}
                                                </div>
                                            </Col>
                                            <Col xs={24} md={12}>
                                                <Text type="secondary">标准答案</Text>
                                                <div className="latex-preview">
                                                    {isChoiceQuestion(question.questionType) ? (
                                                        <Text strong>{question.answerValue || '-'}</Text>
                                                    ) : (
                                                        <LatexText value={question.answerValue} mathOnly/>
                                                    )}
                                                </div>
                                            </Col>
                                        </Row>
                                    )}
                                </Card>
                            ))}
                            {isStudent && canAnswerTask(detail.status) && (
                                <Button type="primary" size="large" icon={<CheckCircleOutlined/>} loading={loading} onClick={submit}>
                                    提交作业
                                </Button>
                            )}
                        </Space>
                    ) : !isStudent && selectedTask ? null : (
                        <Empty description="从左侧选择一份作业"/>
                    )}
                </Card>
            </Col>
        </Row>
    )
}

export function WrongQuestionsPanel() {
    const {message} = AntApp.useApp()
    const [items, setItems] = useState<WrongQuestion[]>([])
    const [practiceId, setPracticeId] = useState<Id | null>(null)
    const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            setItems(await mathRequest<WrongQuestion[]>('/api/wrong-questions/mine'))
        } catch (error) {
            message.error(error instanceof Error ? error.message : '错题加载失败')
        } finally {
            setLoading(false)
        }
    }, [message])

    useEffect(() => {
        void load()
    }, [load])

    const review = async (item: WrongQuestion) => {
        setLoading(true)
        try {
            await mathRequest<WrongQuestion>(`/api/wrong-questions/${item.id}/review`, {method: 'POST'})
            setPracticeId(item.id)
            await load()
        } catch (error) {
            message.error(error instanceof Error ? error.message : '复习记录失败')
        } finally {
            setLoading(false)
        }
    }

    const mastered = async (item: WrongQuestion) => {
        setLoading(true)
        try {
            await mathRequest<WrongQuestion>(`/api/wrong-questions/${item.id}/mastered`, {method: 'POST'})
            message.success('已标记掌握')
            await load()
        } catch (error) {
            message.error(error instanceof Error ? error.message : '标记失败')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card title="我的错题本" className="panel-card">
            <List
                loading={loading}
                dataSource={items}
                locale={{emptyText: <Empty description="暂无错题"/>}}
                renderItem={(item) => (
                    <List.Item>
                        <Space direction="vertical" size={12} className="full-width">
                            <Flex justify="space-between" gap={12} wrap="wrap">
                                <Space wrap>
                                    <Text strong>{item.taskName}</Text>
                                    <Tag color={item.mastered ? 'success' : 'error'}>{item.mastered ? '已掌握' : '未掌握'}</Tag>
                                    <Text type="secondary">复习 {item.reviewCount || 0} 次</Text>
                                </Space>
                                <Space>
                                    <Button onClick={() => review(item)} loading={loading}>再练一次</Button>
                                    <Button type="primary" onClick={() => mastered(item)} disabled={Boolean(item.mastered)} loading={loading}>
                                        标记已掌握
                                    </Button>
                                </Space>
                            </Flex>
                            <div className="stem-block">
                                <LatexText value={item.stemContent}/>
                            </div>
                            {item.options?.length > 0 && (
                                <Row gutter={[12, 12]}>
                                    {item.options.map((option) => (
                                        <Col xs={24} md={12} key={option.optionKey}>
                                            <div className="option-card">
                                                <Tag>{option.optionKey}</Tag>
                                                <LatexText value={option.optionContent}/>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            )}
                            {practiceId === item.id && (
                                <LabeledBlock label="本次练习答案">
                                    <MathInput
                                        value={practiceAnswers[String(item.id)] || ''}
                                        onChange={(value) => setPracticeAnswers((prev) => ({
                                            ...prev,
                                            [String(item.id)]: value,
                                        }))}
                                    />
                                </LabeledBlock>
                            )}
                            <Row gutter={[12, 12]} className="answer-compare">
                                <Col xs={24} md={12}>
                                    <Text type="secondary">我的原答案</Text>
                                    <div className="latex-preview">
                                        <LatexText value={item.studentAnswer} mathOnly/>
                                    </div>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Text type="secondary">标准答案</Text>
                                    <div className="latex-preview">
                                        <LatexText value={item.standardAnswer} mathOnly/>
                                    </div>
                                </Col>
                                {item.analysisContent && (
                                    <Col span={24}>
                                        <Text type="secondary">解析</Text>
                                        <div className="latex-preview">
                                            <LatexText value={item.analysisContent}/>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        </Space>
                    </List.Item>
                )}
            />
        </Card>
    )
}

export function PageHero({title, subtitle, children}: { title: string; subtitle: string; children: ReactNode }) {
    return (
        <Card className="hero-card">
            <Flex justify="space-between" align="center" gap={24} wrap="wrap">
                <div>
                    <Text className="eyebrow">Core Workflow</Text>
                    <Title level={2}>{title}</Title>
                    <Paragraph>{subtitle}</Paragraph>
                </div>
                <Space size={12} wrap>{children}</Space>
            </Flex>
        </Card>
    )
}

export function Metric({label, value}: { label: string; value: string }) {
    return (
        <div className="metric-pill">
            <Text type="secondary">{label}</Text>
            <Text strong>{value}</Text>
        </div>
    )
}

export function LabeledBlock({label, children}: { label: string; children: ReactNode }) {
    return (
        <div className="labeled-block">
            <Text strong>{label}</Text>
            {children}
        </div>
    )
}
