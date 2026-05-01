import {useCallback, useEffect, useState} from 'react'
import type {ReactNode} from 'react'
import {ComputeEngine} from '@cortex-js/compute-engine'
import {
    App as AntApp,
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    Divider,
    Empty,
    Flex,
    Form,
    Grid,
    Input,
    InputNumber,
    Layout,
    List,
    Menu,
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
import type {MenuProps, TableColumnsType} from 'antd'
import {
    BookOutlined,
    CalculatorOutlined,
    CheckCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    FileAddOutlined,
    FileTextOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    PlusOutlined,
    ReadOutlined,
    SendOutlined,
    SolutionOutlined,
    UserOutlined,
} from '@ant-design/icons'
import 'katex/dist/katex.min.css'
import './App.css'
import {request} from './api'
import {useAuthStore} from './authStore'
import {LatexText} from './LatexText'
import {MathInput} from './MathInput'

const {Header, Content, Sider} = Layout
const {Title, Text, Paragraph} = Typography
const {TextArea} = Input
const computeEngine = new ComputeEngine()

type ActiveView = 'calculator' | 'questions' | 'papers' | 'tasks'
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
    questionCount: number
    totalScore: number
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

type CalculateResponse = {
    latex: string
    mathJson: unknown
    symjaExpression: string
    result: string
    resultLatex: string
    message: string
}

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
    published: '待提交',
    submitted: '已提交',
    corrected: '已批改',
    correct: '正确',
    wrong: '错误',
}

const statusColor: Record<string, string> = {
    published: 'processing',
    submitted: 'warning',
    corrected: 'success',
    correct: 'success',
    wrong: 'error',
}

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

const navItems: MenuProps['items'] = [
    {key: 'calculator', icon: <CalculatorOutlined/>, label: '公式计算'},
    {key: 'questions', icon: <BookOutlined/>, label: '题库管理'},
    {key: 'papers', icon: <FileTextOutlined/>, label: '自动组卷'},
    {key: 'tasks', icon: <ReadOutlined/>, label: '作业批改'},
]

const viewMeta: Record<ActiveView, { title: string; subtitle: string }> = {
    calculator: {
        title: '公式计算',
        subtitle: 'MathLive 输入公式，后端计算并返回 LaTeX 结果。',
    },
    questions: {
        title: '题库管理',
        subtitle: '维护题干、标准答案、解析、难度和知识点，答案统一保存 LaTeX。',
    },
    papers: {
        title: '自动组卷',
        subtitle: '按规则生成试卷，再发布到班级形成作业。',
    },
    tasks: {
        title: '作业批改',
        subtitle: '学生在线作答，系统按 LaTeX 精确匹配自动判分。',
    },
}

function App() {
    const {user, isLogin, refreshMe, logout} = useAuthStore()
    const {message} = AntApp.useApp()
    const screens = Grid.useBreakpoint()
    const [activeView, setActiveView] = useState<ActiveView>('calculator')
    const [collapsed, setCollapsed] = useState(false)

    useEffect(() => {
        void refreshMe()
    }, [refreshMe])

    if (!isLogin || !user) {
        return <AuthPage/>
    }

    const isTeacher = user.roleType === 'teacher' || user.roleType === 'admin'
    const allowedNavItems = navItems?.filter((item) => {
        if (!isTeacher && (item?.key === 'questions' || item?.key === 'papers')) {
            return false
        }
        return true
    })
    const selectedView = !isTeacher && (activeView === 'questions' || activeView === 'papers')
        ? 'tasks'
        : activeView

    const handleLogout = async () => {
        await logout()
        message.success('已退出登录')
    }

    return (
        <Layout className="app-shell">
            <Sider
                width={260}
                breakpoint="lg"
                collapsedWidth={screens.lg ? 76 : 0}
                collapsed={collapsed}
                onCollapse={setCollapsed}
                className="app-sider"
            >
                <div className="brand-block">
                    <div className="brand-mark"><SolutionOutlined/></div>
                    {!collapsed && (
                        <div>
                            <Text className="brand-title">智能作业本</Text>
                            <Text className="brand-subtitle">数学自动测试及批改</Text>
                        </div>
                    )}
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[selectedView]}
                    items={allowedNavItems}
                    onClick={({key}) => setActiveView(key as ActiveView)}
                    className="side-menu"
                />
            </Sider>

            <Layout className="main-layout">
                <Header className="topbar">
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                        onClick={() => setCollapsed(!collapsed)}
                        className="icon-button"
                    />
                    <div className="topbar-title">
                        <Text className="eyebrow">MathPaper Console</Text>
                        <Title level={3}>{viewMeta[selectedView].title}</Title>
                    </div>
                    <Space size={12} className="topbar-actions">
                        <Tag color={isTeacher ? 'blue' : 'green'}>{isTeacher ? '教师端' : '学生端'}</Tag>
                        <Avatar icon={<UserOutlined/>}/>
                        <Text strong>{user.realName || user.username}</Text>
                        <Button icon={<LogoutOutlined/>} onClick={handleLogout}>退出</Button>
                    </Space>
                </Header>

                <Content className="content-wrap">
                    <PageHero title={viewMeta[selectedView].title} subtitle={viewMeta[selectedView].subtitle}>
                        <Metric label="当前身份" value={isTeacher ? '教师' : '学生'}/>
                        <Metric label="判题策略" value="LaTeX 精确匹配"/>
                        <Metric label="公式输入" value="MathLive"/>
                    </PageHero>

                    {selectedView === 'calculator' && <CalculatorPanel/>}
                    {selectedView === 'questions' && <QuestionManager/>}
                    {selectedView === 'papers' && <PaperManager/>}
                    {selectedView === 'tasks' && <TaskPanel/>}
                </Content>
            </Layout>
        </Layout>
    )
}

function AuthPage() {
    const {login, register} = useAuthStore()
    const {message} = AntApp.useApp()
    const [mode, setMode] = useState<'login' | 'register'>('login')
    const [loading, setLoading] = useState(false)

    const submit = async (values: { username: string; password: string; realName?: string; roleType?: string }) => {
        setLoading(true)
        try {
            if (mode === 'login') {
                await login(values.username, values.password)
                message.success('登录成功')
                return
            }
            await register({
                username: values.username,
                password: values.password,
                realName: values.realName || values.username,
                roleType: values.roleType || 'student',
            })
            message.success('注册成功')
        } catch (error) {
            message.error(error instanceof Error ? error.message : '操作失败')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <section className="auth-visual">
                <Badge color="#f97316" text="MathLive + 自动批改"/>
                <Title>智能作业本</Title>
                <Paragraph>
                    题库管理、自动组卷、在线作答和自动判分集中在一个工作台，教师少改卷，学生快反馈。
                </Paragraph>
                <Row gutter={[16, 16]} className="auth-metrics">
                    <Col span={8}><Statistic title="核心模块" value={4}/></Col>
                    <Col span={8}><Statistic title="公式输入" value="LaTeX"/></Col>
                    <Col span={8}><Statistic title="判题" value="Exact"/></Col>
                </Row>
            </section>

            <Card className="auth-card">
                <Segmented
                    block
                    value={mode}
                    onChange={(value) => setMode(value as 'login' | 'register')}
                    options={[
                        {label: '登录', value: 'login'},
                        {label: '注册', value: 'register'},
                    ]}
                />
                <Form layout="vertical" onFinish={submit} className="auth-form">
                    <Form.Item name="username" label="账号" rules={[{required: true, message: '请输入账号'}]}>
                        <Input size="large" placeholder="teacher01 / student01"/>
                    </Form.Item>
                    <Form.Item name="password" label="密码" rules={[{required: true, message: '请输入密码'}]}>
                        <Input.Password size="large" placeholder="请输入密码"/>
                    </Form.Item>
                    {mode === 'register' && (
                        <>
                            <Form.Item name="realName" label="姓名">
                                <Input size="large" placeholder="用于页面显示"/>
                            </Form.Item>
                            <Form.Item name="roleType" label="角色" initialValue="student">
                                <Select
                                    size="large"
                                    options={[
                                        {label: '学生', value: 'student'},
                                        {label: '教师', value: 'teacher'},
                                    ]}
                                />
                            </Form.Item>
                        </>
                    )}
                    <Button type="primary" htmlType="submit" size="large" loading={loading} block>
                        {mode === 'login' ? '进入系统' : '创建账号'}
                    </Button>
                </Form>
            </Card>
        </div>
    )
}

function CalculatorPanel() {
    const [latex, setLatex] = useState('\\int_0^1 x^2\\,dx')
    const [mathJson, setMathJson] = useState<unknown>(null)
    const [result, setResult] = useState<CalculateResponse | null>(null)
    const [loading, setLoading] = useState(false)
    const {message} = AntApp.useApp()

    const calculate = async () => {
        setLoading(true)
        try {
            const parsedMathJson = computeEngine.parse(latex).json
            setMathJson(parsedMathJson)
            const data = await request<CalculateResponse>('/api/calculate', {
                method: 'POST',
                body: JSON.stringify({latex, mathJson: parsedMathJson}),
            })
            setResult(data)
            message.success(data.message || '计算完成')
        } catch (error) {
            message.error(error instanceof Error ? error.message : '计算失败')
        } finally {
            setLoading(false)
        }
    }

    const examples = [
        '\\int_0^1 x^2\\,dx',
        '\\lim_{x\\to0}\\frac{\\sin x}{x}',
        '\\frac{d}{dx}x^3',
        'x^2=1',
    ]

    return (
        <Row gutter={[20, 20]}>
            <Col xs={24} xl={12}>
                <Card title="输入公式" className="panel-card" extra={<Tag color="blue">MathLive</Tag>}>
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
                    <LabeledBlock label="公式编辑器">
                        <MathInput value={latex} onChange={setLatex}/>
                    </LabeledBlock>
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

function QuestionManager() {
    const {message} = AntApp.useApp()
    const [questions, setQuestions] = useState<Question[]>([])
    const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePoint[]>([])
    const [form, setForm] = useState<QuestionFormState>(defaultQuestionForm)
    const [loading, setLoading] = useState(false)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const [questionData, knowledgeData] = await Promise.all([
                request<Question[]>('/api/questions'),
                request<KnowledgePoint[]>('/api/catalog/knowledge-points'),
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
            await request<Question>('/api/questions', {
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
            await request<void>(`/api/questions/${id}`, {method: 'DELETE'})
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

function PaperManager() {
    const {message} = AntApp.useApp()
    const [rules, setRules] = useState<PaperRule[]>([])
    const [papers, setPapers] = useState<Paper[]>([])
    const [classes, setClasses] = useState<ClassInfo[]>([])
    const [ruleId, setRuleId] = useState<Id | undefined>()
    const [paperId, setPaperId] = useState<Id | undefined>()
    const [classId, setClassId] = useState<Id | undefined>()
    const [paperName, setPaperName] = useState('智能作业自动组卷')
    const [taskName, setTaskName] = useState('智能作业练习')
    const [loading, setLoading] = useState(false)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const [ruleData, paperData, classData] = await Promise.all([
                request<PaperRule[]>('/api/papers/rules'),
                request<Paper[]>('/api/papers'),
                request<ClassInfo[]>('/api/catalog/classes'),
            ])
            setRules(ruleData)
            setPapers(paperData)
            setClasses(classData)
        } catch (error) {
            message.error(error instanceof Error ? error.message : '组卷数据加载失败')
        } finally {
            setLoading(false)
        }
    }, [message])

    useEffect(() => {
        void load()
    }, [load])

    const generate = async () => {
        if (!ruleId) {
            message.warning('请选择组卷规则')
            return
        }
        setLoading(true)
        try {
            const paper = await request<Paper>('/api/papers/auto-generate', {
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
            await request<TaskSummary>('/api/tasks/publish', {
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

    return (
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
    )
}

function TaskPanel() {
    const {user} = useAuthStore()
    const {message} = AntApp.useApp()
    const [tasks, setTasks] = useState<TaskSummary[]>([])
    const [detail, setDetail] = useState<TaskDetail | null>(null)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)

    const isStudent = user?.roleType === 'student'

    const loadTasks = useCallback(async () => {
        setLoading(true)
        try {
            setTasks(await request<TaskSummary[]>('/api/tasks/mine'))
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
            const data = await request<TaskDetail>(`/api/tasks/student/${taskStudentId}`)
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

    const submit = async () => {
        if (!detail) {
            return
        }
        setLoading(true)
        try {
            const data = await request<{ totalScore: number }>('/api/tasks/submit', {
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

    return (
        <Row gutter={[20, 20]}>
            <Col xs={24} lg={8}>
                <Card title="我的作业" className="panel-card">
                    <List
                        loading={loading}
                        dataSource={tasks}
                        locale={{emptyText: <Empty description="暂无作业"/>}}
                        renderItem={(task) => (
                            <List.Item
                                className="task-item"
                                onClick={() => openTask(task.taskStudentId)}
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
                                                    <div className="option-card">
                                                        <Tag>{option.optionKey}</Tag>
                                                        <LatexText value={option.optionContent}/>
                                                    </div>
                                                </Col>
                                            ))}
                                        </Row>
                                    )}
                                    {isStudent && detail.status === 'published' ? (
                                        <LabeledBlock label="我的答案">
                                            <MathInput
                                                value={answers[String(question.id)] || ''}
                                                onChange={(value) => setAnswers((prev) => ({
                                                    ...prev,
                                                    [String(question.id)]: value,
                                                }))}
                                            />
                                        </LabeledBlock>
                                    ) : (
                                        <Row gutter={[12, 12]} className="answer-compare">
                                            <Col xs={24} md={12}>
                                                <Text type="secondary">我的答案</Text>
                                                <div className="latex-preview">
                                                    <LatexText value={question.studentAnswer} mathOnly/>
                                                </div>
                                            </Col>
                                            <Col xs={24} md={12}>
                                                <Text type="secondary">标准答案</Text>
                                                <div className="latex-preview">
                                                    <LatexText value={question.answerValue} mathOnly/>
                                                </div>
                                            </Col>
                                        </Row>
                                    )}
                                </Card>
                            ))}
                            {isStudent && detail.status === 'published' && (
                                <Button type="primary" size="large" icon={<CheckCircleOutlined/>} loading={loading} onClick={submit}>
                                    提交作业
                                </Button>
                            )}
                        </Space>
                    ) : (
                        <Empty description="从左侧选择一份作业"/>
                    )}
                </Card>
            </Col>
        </Row>
    )
}

function PageHero({title, subtitle, children}: { title: string; subtitle: string; children: ReactNode }) {
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

function Metric({label, value}: { label: string; value: string }) {
    return (
        <div className="metric-pill">
            <Text type="secondary">{label}</Text>
            <Text strong>{value}</Text>
        </div>
    )
}

function LabeledBlock({label, children}: { label: string; children: ReactNode }) {
    return (
        <div className="labeled-block">
            <Text strong>{label}</Text>
            {children}
        </div>
    )
}

export default App
