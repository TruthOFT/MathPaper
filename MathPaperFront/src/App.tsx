import {useEffect, useState} from 'react'
import {ComputeEngine} from '@cortex-js/compute-engine'
import {
    Alert,
    App as AntApp,
    Avatar,
    Button,
    Card,
    Checkbox,
    Col,
    Divider,
    Flex,
    Form,
    Input,
    InputNumber,
    Layout,
    List,
    Menu,
    Row,
    Select,
    Space,
    Table,
    Tag,
    Typography,
} from 'antd'
import type {MenuProps, TableColumnsType} from 'antd'
import {
    BookOutlined,
    CalculatorOutlined,
    FileTextOutlined,
    LogoutOutlined,
    ReadOutlined,
    SendOutlined,
} from '@ant-design/icons'
import 'katex/dist/katex.min.css'
import './App.css'
import {request} from './api'
import {useAuthStore} from './authStore'
import {LatexText} from './LatexText'
import {MathInput} from './MathInput'

const {Header, Content, Sider} = Layout
const {Text, Title} = Typography
const {TextArea} = Input
const computeEngine = new ComputeEngine()

type ActiveView = 'calculator' | 'questions' | 'papers' | 'tasks'

type KnowledgePoint = {
    id: number
    pointCode: string
    pointName: string
}

type QuestionOption = {
    id?: number
    optionKey: string
    optionContent: string
    isCorrect: number
    sortNo: number
}

type Question = {
    id: number
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
    knowledgePointIds: number[]
    options: QuestionOption[]
}

type PaperRule = {
    id: number
    ruleName: string
    questionCount: number
    totalScore: number
}

type Paper = {
    id: number
    paperCode: string
    paperName: string
    questionCount: number
    totalScore: number
}

type ClassInfo = {
    id: number
    className: string
}

type TaskSummary = {
    taskId: number
    taskStudentId: number | null
    paperId: number
    taskName: string
    status: string
    totalScore: number | null
    deadlineTime: string | null
}

type PaperQuestion = {
    id: number
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
    taskId: number
    taskStudentId: number
    paperId: number
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
    id?: number
    questionType: string
    stemContent: string
    answerValue: string
    analysisContent: string
    difficulty: number
    defaultScore: number
    blankCount: number
    estimatedMinutes: number
    knowledgePointIds: number[]
    options: QuestionOption[]
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
    analysisContent: '原函数为 \\(\\frac{x^3}{3}\\)。',
    difficulty: 0.4,
    defaultScore: 10,
    blankCount: 0,
    estimatedMinutes: 3,
    knowledgePointIds: [],
    options: defaultOptions,
}

const questionTypeLabel: Record<string, string> = {
    calculation: '计算题',
    fill_blank: '填空题',
    single_choice: '选择题',
}

const statusColor: Record<string, string> = {
    published: 'processing',
    submitted: 'warning',
    corrected: 'success',
    correct: 'success',
    wrong: 'error',
}

const calculatorExamples = [
    {label: '计算定积分', latex: '\\int_0^1 x^2\\,dx'},
    {label: '求极限', latex: '\\lim_{x\\to0}\\frac{\\sin x}{x}'},
    {label: '函数求导', latex: '\\frac{d}{dx}x^3'},
    {label: '解方程', latex: 'x^2=1'},
]

const calculatorTopics = ['微积分', '极限', '导数', '积分', '方程', '函数', '选择题', '填空题']

const calculatorFeatures = [
    {title: 'MathLive 输入', description: '用数学键盘输入公式，保存为标准 LaTeX。'},
    {title: '接口计算', description: '提交 LaTeX 和 MathJSON，后端统一计算。'},
    {title: 'LaTeX 结果', description: '接口结果自动渲染，题干和答案也同样支持。'},
]

const navItems: MenuProps['items'] = [
    {key: 'calculator', icon: <CalculatorOutlined/>, label: '公式计算'},
    {key: 'questions', icon: <BookOutlined/>, label: '题库管理'},
    {key: 'papers', icon: <FileTextOutlined/>, label: '自动组卷'},
    {key: 'tasks', icon: <ReadOutlined/>, label: '作业'},
]

const navTitle: Record<ActiveView, string> = {
    calculator: '公式计算',
    questions: '题库管理',
    papers: '自动组卷',
    tasks: '作业',
}

function App() {
    const {user, isLogin, refreshMe, logout} = useAuthStore()
    const {message} = AntApp.useApp()
    const [activeView, setActiveView] = useState<ActiveView>('calculator')
    const [collapsed, setCollapsed] = useState(false)

    useEffect(() => {
        void refreshMe()
    }, [refreshMe])

    if (!isLogin || !user) {
        return <AuthPage/>
    }

    const isTeacher = user.roleType === 'teacher' || user.roleType === 'admin'
    const visibleNavItems = navItems?.filter((item) => {
        if (!item || !('key' in item)) return false
        return isTeacher || item.key === 'calculator' || item.key === 'tasks'
    })

    const handleLogout = async () => {
        await logout()
        message.success('已退出登录')
    }

    return (
        <Layout style={{minHeight: '100vh'}}>
            <Sider
                breakpoint="lg"
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                theme="light"
                style={{background: '#fff'}}
            >
                <Flex align="center" justify={collapsed ? 'center' : 'flex-start'} gap="small" style={{padding: 16}}>
                    <Avatar>M</Avatar>
                    {!collapsed && (
                        <Title level={4} style={{margin: 0}}>
                            智能作业本
                        </Title>
                    )}
                </Flex>
                <Menu
                    mode="inline"
                    theme="light"
                    selectedKeys={[activeView]}
                    items={visibleNavItems}
                    onClick={({key}) => setActiveView(key as ActiveView)}
                />
            </Sider>
            <Layout>
                <Header style={{background: '#fff', borderBottom: '1px solid #f0f0f0'}}>
                    <Flex justify="space-between" align="center">
                        <Title level={3} style={{margin: 0}}>
                            {navTitle[activeView]}
                        </Title>
                        <Space size="middle">
                            <Tag color={user.roleType === 'student' ? 'blue' : 'green'}>{user.roleType}</Tag>
                            <Text>{user.realName}</Text>
                            <Button icon={<LogoutOutlined/>} onClick={() => void handleLogout()}>
                                退出
                            </Button>
                        </Space>
                    </Flex>
                </Header>
                <Content style={{padding: 24}}>
                    {activeView === 'calculator' && <CalculatorPanel/>}
                    {activeView === 'questions' && isTeacher && <QuestionManager/>}
                    {activeView === 'papers' && isTeacher && <PaperManager/>}
                    {activeView === 'tasks' && <TaskPanel/>}
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
            } else {
                await register({
                    username: values.username,
                    password: values.password,
                    roleType: values.roleType ?? 'teacher',
                    realName: values.realName ?? '',
                })
            }
        } catch (error) {
            message.error(error instanceof Error ? error.message : '操作失败')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Flex align="center" justify="center" style={{minHeight: '100vh', padding: 24}}>
            <Card style={{width: 430, maxWidth: '100%'}}>
                <Space direction="vertical" size="large" style={{width: '100%'}}>
                    <div>
                        <Text type="secondary">Smart Homework</Text>
                        <Title level={2}>数学自动测试及批改系统</Title>
                    </div>
                    <Space.Compact block>
                        <Button type={mode === 'login' ? 'primary' : 'default'} onClick={() => setMode('login')}>
                            登录
                        </Button>
                        <Button type={mode === 'register' ? 'primary' : 'default'} onClick={() => setMode('register')}>
                            注册
                        </Button>
                    </Space.Compact>
                    <Form
                        layout="vertical"
                        initialValues={{
                            username: 'teacher_math_01',
                            password: '123456',
                            realName: '张老师',
                            roleType: 'teacher',
                        }}
                        onFinish={(values) => void submit(values)}
                    >
                        <Form.Item label="账号" name="username" rules={[{required: true, message: '请输入账号'}]}>
                            <Input autoComplete="username"/>
                        </Form.Item>
                        <Form.Item label="密码" name="password" rules={[{required: true, message: '请输入密码'}]}>
                            <Input.Password autoComplete={mode === 'login' ? 'current-password' : 'new-password'}/>
                        </Form.Item>
                        {mode === 'register' && (
                            <Form.Item label="姓名" name="realName" rules={[{required: true, message: '请输入姓名'}]}>
                                <Input/>
                            </Form.Item>
                        )}
                        {mode === 'register' && (
                            <Form.Item label="角色" name="roleType">
                                <Select
                                    options={[
                                        {value: 'teacher', label: '教师'},
                                        {value: 'student', label: '学生'},
                                    ]}
                                />
                            </Form.Item>
                        )}
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            {mode === 'login' ? '登录' : '注册'}
                        </Button>
                    </Form>
                </Space>
            </Card>
        </Flex>
    )
}

function CalculatorPanel() {
    const [latex, setLatex] = useState('\\int_0^1 x^2\\,dx')
    const [mathJson, setMathJson] = useState<unknown>(null)
    const [result, setResult] = useState<CalculateResponse | null>(null)
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const calculate = async () => {
        setMessage('')
        setLoading(true)
        try {
            const parsedMathJson = computeEngine.parse(latex).json
            setMathJson(parsedMathJson)
            const data = await request<CalculateResponse>('/api/calculate', {
                method: 'POST',
                body: JSON.stringify({latex, mathJson: parsedMathJson}),
            })
            setResult(data)
        } catch (error) {
            setMessage(error instanceof Error ? error.message : '计算失败')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Space direction="vertical" size="large" style={{width: '100%'}}>
            <Flex justify="center" style={{padding: '48px 0 24px'}}>
                <Space direction="vertical" size="large" align="center" style={{width: 'min(920px, 100%)'}}>
                    <Space direction="vertical" size="small" align="center">
                        <Title style={{marginBottom: 0}}>输入你想计算的数学问题</Title>
                        <Text type="secondary">MathLive 输入，后端接口计算，结果以 LaTeX 渲染。</Text>
                    </Space>
                    <Card style={{width: '100%'}}>
                        <Space direction="vertical" size="middle" style={{width: '100%'}}>
                            <MathInput value={latex} onChange={setLatex}/>
                            <Flex justify="space-between" gap="middle" wrap>
                                <Space wrap>
                                    {calculatorExamples.map((example) => (
                                        <Button key={example.label} onClick={() => setLatex(example.latex)}>
                                            {example.label}
                                        </Button>
                                    ))}
                                </Space>
                                <Button type="primary" size="large" loading={loading} icon={<CalculatorOutlined/>}
                                        onClick={() => void calculate()}>
                                    计算
                                </Button>
                            </Flex>
                            {message && <Alert type="error" message={message} showIcon/>}
                        </Space>
                    </Card>
                </Space>
            </Flex>

            {Boolean(result || mathJson) && (
                <Flex justify="center">
                    <Space direction="vertical" size="middle" style={{width: 'min(920px, 100%)'}}>
                        <Card title="输入">
                            <LatexText value={latex} mathOnly display/>
                        </Card>
                        <Card title="结果">
                            {result?.resultLatex ? (
                                <LatexText value={result.resultLatex} mathOnly display/>
                            ) : (
                                <Text type="secondary">等待接口返回</Text>
                            )}
                        </Card>
                        {result?.message && <Alert type="success" message={result.message} showIcon/>}
                    </Space>
                </Flex>
            )}

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={8}>
                    <Card title="数学主题">
                        <Space wrap>
                            {calculatorTopics.map((topic) => (
                                <Tag key={topic}>{topic}</Tag>
                            ))}
                        </Space>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="试试这些">
                        <List
                            dataSource={calculatorExamples}
                            renderItem={(example) => (
                                <List.Item
                                    actions={[
                                        <Button type="link" onClick={() => setLatex(example.latex)}>
                                            填入
                                        </Button>,
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={example.label}
                                        description={<LatexText value={example.latex} mathOnly/>}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="当前能力">
                        <List
                            dataSource={calculatorFeatures}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta title={item.title} description={item.description}/>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </Space>
    )
}

function QuestionManager() {
    const {message} = AntApp.useApp()
    const [questions, setQuestions] = useState<Question[]>([])
    const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePoint[]>([])
    const [form, setForm] = useState<QuestionFormState>(defaultQuestionForm)
    const [loading, setLoading] = useState(false)

    const load = async () => {
        setLoading(true)
        try {
            const [questionData, knowledgeData] = await Promise.all([
                request<Question[]>('/api/questions'),
                request<KnowledgePoint[]>('/api/catalog/knowledge-points'),
            ])
            setQuestions(questionData)
            setKnowledgePoints(knowledgeData)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const timer = window.setTimeout(() => void load(), 0)
        return () => window.clearTimeout(timer)
    }, [])

    const save = async () => {
        try {
            await request<Question>('/api/questions', {
                method: 'POST',
                body: JSON.stringify({
                    ...form,
                    inputType: form.questionType === 'single_choice' ? 'choice' : 'formula',
                    answerContent: form.answerValue,
                    options: form.questionType === 'single_choice' ? form.options : [],
                }),
            })
            message.success('保存成功')
            await load()
        } catch (error) {
            message.error(error instanceof Error ? error.message : '保存失败')
        }
    }

    const edit = (question: Question) => {
        setForm({
            id: question.id,
            questionType: question.questionType,
            stemContent: question.stemContent,
            answerValue: question.answerValue,
            analysisContent: question.analysisContent ?? '',
            difficulty: Number(question.difficulty ?? 0.5),
            defaultScore: Number(question.defaultScore ?? 10),
            blankCount: question.blankCount ?? 0,
            estimatedMinutes: question.estimatedMinutes ?? 3,
            knowledgePointIds: question.knowledgePointIds ?? [],
            options: question.options.length ? question.options : defaultOptions,
        })
    }

    const columns: TableColumnsType<Question> = [
        {
            title: '题号',
            dataIndex: 'questionCode',
            width: 130,
            render: (value: string) => <Text strong>{value}</Text>,
        },
        {
            title: '题型',
            dataIndex: 'questionType',
            width: 110,
            render: (value: string) => <Tag color="blue">{questionTypeLabel[value] ?? value}</Tag>,
        },
        {
            title: '题干',
            dataIndex: 'stemContent',
            render: (value: string) => <LatexText value={value}/>,
        },
        {
            title: '分值',
            dataIndex: 'defaultScore',
            width: 90,
            render: (value: number) => `${value} 分`,
        },
        {
            title: '操作',
            key: 'actions',
            width: 90,
            render: (_, question) => <Button onClick={() => edit(question)}>编辑</Button>,
        },
    ]

    return (
        <Space direction="vertical" size="large" style={{width: '100%'}}>
            <PageIntro title="题库管理" subtitle="题干、选项、答案、解析包含 LaTeX 时自动渲染。"/>
            <Row gutter={[16, 16]}>
                <Col xs={24} xl={10}>
                    <QuestionForm
                        form={form}
                        knowledgePoints={knowledgePoints}
                        onChange={setForm}
                        onSave={() => void save()}
                        onNew={() => setForm(defaultQuestionForm)}
                    />
                </Col>
                <Col xs={24} xl={14}>
                    <Card title="题目列表">
                        <Table<Question>
                            rowKey="id"
                            columns={columns}
                            dataSource={questions}
                            loading={loading}
                            pagination={{pageSize: 8}}
                            scroll={{x: 760}}
                        />
                    </Card>
                </Col>
            </Row>
        </Space>
    )
}

function QuestionForm({
                          form,
                          knowledgePoints,
                          onChange,
                          onSave,
                          onNew,
                      }: {
    form: QuestionFormState
    knowledgePoints: KnowledgePoint[]
    onChange: (form: QuestionFormState) => void
    onSave: () => void
    onNew: () => void
}) {
    const updateOption = (index: number, patch: Partial<QuestionOption>) => {
        const next = [...form.options]
        next[index] = {...next[index], ...patch}
        onChange({...form, options: next})
    }

    return (
        <Card title={form.id ? '编辑题目' : '新增题目'}>
            <Space direction="vertical" size="middle" className="full-width">
                <Row gutter={12}>
                    <Col xs={24} md={8}>
                        <Text strong>题型</Text>
                        <Select
                            style={{width: '100%', marginTop: 8}}
                            value={form.questionType}
                            onChange={(questionType) => onChange({...form, questionType})}
                            options={[
                                {value: 'calculation', label: '计算题'},
                                {value: 'fill_blank', label: '填空题'},
                                {value: 'single_choice', label: '选择题'},
                            ]}
                        />
                    </Col>
                    <Col xs={12} md={8}>
                        <Text strong>难度</Text>
                        <InputNumber
                            style={{width: '100%', marginTop: 8}}
                            min={0}
                            max={1}
                            step={0.05}
                            value={form.difficulty}
                            onChange={(difficulty) => onChange({...form, difficulty: Number(difficulty ?? 0)})}
                        />
                    </Col>
                    <Col xs={12} md={8}>
                        <Text strong>分值</Text>
                        <InputNumber
                            style={{width: '100%', marginTop: 8}}
                            min={0}
                            value={form.defaultScore}
                            onChange={(defaultScore) => onChange({...form, defaultScore: Number(defaultScore ?? 0)})}
                        />
                    </Col>
                </Row>
                <LabeledEditor label="题干">
                    <TextArea rows={4} value={form.stemContent}
                              onChange={(event) => onChange({...form, stemContent: event.target.value})}/>
                    <Card size="small">
                        <LatexText value={form.stemContent}/>
                    </Card>
                </LabeledEditor>
                <LabeledEditor label="标准答案">
                    <MathInput value={form.answerValue} onChange={(answerValue) => onChange({...form, answerValue})}/>
                    <Card size="small">
                        <LatexText value={form.answerValue} mathOnly/>
                    </Card>
                </LabeledEditor>
                <LabeledEditor label="解析">
                    <TextArea rows={3} value={form.analysisContent}
                              onChange={(event) => onChange({...form, analysisContent: event.target.value})}/>
                    <Card size="small">
                        <LatexText value={form.analysisContent}/>
                    </Card>
                </LabeledEditor>
                <div>
                    <Text strong>知识点</Text>
                    <Checkbox.Group
                        style={{marginTop: 8}}
                        value={form.knowledgePointIds}
                        options={knowledgePoints.map((point) => ({label: point.pointName, value: point.id}))}
                        onChange={(knowledgePointIds) => onChange({
                            ...form,
                            knowledgePointIds: knowledgePointIds as number[]
                        })}
                    />
                </div>
                {form.questionType === 'single_choice' && (
                    <div>
                        <Text strong>选项</Text>
                        <Row gutter={[12, 12]} style={{marginTop: 8}}>
                            {form.options.map((option, index) => (
                                <Col xs={24} md={12} key={option.optionKey}>
                                    <Input
                                        addonBefore={option.optionKey}
                                        value={option.optionContent}
                                        onChange={(event) => updateOption(index, {optionContent: event.target.value})}
                                    />
                                    <Card size="small" style={{marginTop: 8}}>
                                        <LatexText value={option.optionContent}/>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                )}
                <Space wrap>
                    <Button type="primary" onClick={onSave}>
                        保存题目
                    </Button>
                    <Button onClick={onNew}>新题</Button>
                </Space>
            </Space>
        </Card>
    )
}

function PaperManager() {
    const {message} = AntApp.useApp()
    const [rules, setRules] = useState<PaperRule[]>([])
    const [papers, setPapers] = useState<Paper[]>([])
    const [classes, setClasses] = useState<ClassInfo[]>([])
    const [ruleId, setRuleId] = useState<number | ''>('')
    const [paperId, setPaperId] = useState<number | ''>('')
    const [classId, setClassId] = useState<number | ''>('')
    const [paperName, setPaperName] = useState('智能作业自动组卷')
    const [taskName, setTaskName] = useState('智能作业练习')

    const load = async () => {
        const [ruleData, paperData, classData] = await Promise.all([
            request<PaperRule[]>('/api/papers/rules'),
            request<Paper[]>('/api/papers'),
            request<ClassInfo[]>('/api/catalog/classes'),
        ])
        setRules(ruleData)
        setPapers(paperData)
        setClasses(classData)
        setRuleId((current) => current || ruleData[0]?.id || '')
        setPaperId((current) => current || paperData[0]?.id || '')
        setClassId((current) => current || classData[0]?.id || '')
    }

    useEffect(() => {
        const timer = window.setTimeout(() => void load(), 0)
        return () => window.clearTimeout(timer)
    }, [])

    const generate = async () => {
        if (!ruleId) return
        const paper = await request<Paper>('/api/papers/auto-generate', {
            method: 'POST',
            body: JSON.stringify({ruleId, paperName}),
        })
        setPaperId(paper.id)
        message.success(`已生成试卷：${paper.paperName}`)
        await load()
    }

    const publish = async () => {
        if (!paperId || !classId) return
        const task = await request<TaskSummary>('/api/tasks/publish', {
            method: 'POST',
            body: JSON.stringify({paperId, classId, taskName, deadlineDays: 7}),
        })
        message.success(`已发布作业：${task.taskName}`)
    }

    return (
        <Space direction="vertical" size="large" style={{width: '100%'}}>
            <PageIntro title="自动组卷" subtitle="按规则抽题生成试卷，再发布给班级。"/>
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="生成试卷">
                        <Space direction="vertical" size="middle" style={{width: '100%'}}>
                            <Select
                                placeholder="组卷规则"
                                value={ruleId || undefined}
                                onChange={setRuleId}
                                options={rules.map((rule) => ({
                                    value: rule.id,
                                    label: `${rule.ruleName} / ${rule.questionCount}题 / ${rule.totalScore}分`,
                                }))}
                            />
                            <Input value={paperName} onChange={(event) => setPaperName(event.target.value)}/>
                            <Button type="primary" icon={<FileTextOutlined/>} onClick={() => void generate()}>
                                自动组卷
                            </Button>
                        </Space>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="发布作业">
                        <Space direction="vertical" size="middle" style={{width: '100%'}}>
                            <Select
                                placeholder="试卷"
                                value={paperId || undefined}
                                onChange={setPaperId}
                                options={papers.map((paper) => ({
                                    value: paper.id,
                                    label: `${paper.paperName} / ${paper.questionCount}题 / ${paper.totalScore}分`,
                                }))}
                            />
                            <Select
                                placeholder="班级"
                                value={classId || undefined}
                                onChange={setClassId}
                                options={classes.map((item) => ({value: item.id, label: item.className}))}
                            />
                            <Input value={taskName} onChange={(event) => setTaskName(event.target.value)}/>
                            <Button type="primary" icon={<SendOutlined/>} onClick={() => void publish()}>
                                发布作业
                            </Button>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </Space>
    )
}

function TaskPanel() {
    const {user} = useAuthStore()
    const {message} = AntApp.useApp()
    const [tasks, setTasks] = useState<TaskSummary[]>([])
    const [detail, setDetail] = useState<TaskDetail | null>(null)
    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [loading, setLoading] = useState(false)

    const loadTasks = async () => {
        setLoading(true)
        try {
            setTasks(await request<TaskSummary[]>('/api/tasks/mine'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const timer = window.setTimeout(() => void loadTasks(), 0)
        return () => window.clearTimeout(timer)
    }, [])

    const openTask = async (taskStudentId: number | null) => {
        if (!taskStudentId) {
            message.info('教师端只显示发布记录，学生端可进入作答。')
            return
        }
        const data = await request<TaskDetail>(`/api/tasks/student/${taskStudentId}`)
        setDetail(data)
        const answerMap: Record<number, string> = {}
        data.questions.forEach((question) => {
            answerMap[question.id] = question.studentAnswer ?? ''
        })
        setAnswers(answerMap)
    }

    const submit = async () => {
        if (!detail) return
        const data = await request<{ totalScore: number }>('/api/tasks/submit', {
            method: 'POST',
            body: JSON.stringify({
                taskStudentId: detail.taskStudentId,
                answers: Object.entries(answers).map(([paperQuestionId, answerLatex]) => ({
                    paperQuestionId: Number(paperQuestionId),
                    answerLatex,
                })),
            }),
        })
        message.success(`提交完成，总分 ${data.totalScore}`)
        await openTask(detail.taskStudentId)
        await loadTasks()
    }

    const isStudent = user?.roleType === 'student'

    return (
        <Space direction="vertical" size="large" style={{width: '100%'}}>
            <PageIntro title="作业" subtitle={isStudent ? '在线作答并自动批改。' : '查看已发布作业。'}/>
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={8}>
                    <Card title="作业列表">
                        <List
                            loading={loading}
                            dataSource={tasks}
                            renderItem={(task) => (
                                <List.Item
                                    actions={[<Button onClick={() => void openTask(task.taskStudentId)}>打开</Button>]}
                                >
                                    <List.Item.Meta
                                        title={task.taskName}
                                        description={
                                            <Space wrap>
                                                <Tag color={statusColor[task.status] ?? 'default'}>{task.status}</Tag>
                                                {task.totalScore !== null && <Text>{task.totalScore} 分</Text>}
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={16}>
                    <Card title={detail?.taskName ?? '作答区'}>
                        {!detail && <Alert type="info" message="选择一个学生作业开始。" showIcon/>}
                        <Space direction="vertical" size="middle" style={{width: '100%'}}>
                            {detail?.questions.map((question) => (
                                <Card key={question.id} size="small">
                                    <Flex justify="space-between" gap={12} wrap>
                                        <Text strong>
                                            {question.questionNo}. {question.sectionName}
                                        </Text>
                                        <Space wrap>
                                            <Tag>{question.score} 分</Tag>
                                            <Tag
                                                color={statusColor[question.judgeResult] ?? 'default'}>{question.judgeResult || '未提交'}</Tag>
                                            <Tag color="green">得分 {question.judgeScore ?? 0}</Tag>
                                        </Space>
                                    </Flex>
                                    <Divider/>
                                    <LatexText value={question.stemContent}/>
                                    {question.options.length > 0 && (
                                        <List
                                            dataSource={question.options}
                                            renderItem={(option) => (
                                                <List.Item>
                                                    <Space>
                                                        <Tag>{option.optionKey}</Tag>
                                                        <LatexText value={option.optionContent}/>
                                                    </Space>
                                                </List.Item>
                                            )}
                                        />
                                    )}
                                    <Divider/>
                                    <MathInput value={answers[question.id] ?? ''}
                                               onChange={(value) => setAnswers({...answers, [question.id]: value})}/>
                                    {detail.status === 'corrected' && (
                                        <Alert
                                            type="success"
                                            showIcon
                                            message="批改结果"
                                            description={
                                                <Space direction="vertical" size={4}>
                                                    <span>
                                                        标准答案：<LatexText value={question.answerValue} mathOnly/>
                                                    </span>
                                                    <span>
                                                        解析：<LatexText value={question.analysisContent}/>
                                                    </span>
                                                </Space>
                                            }
                                        />
                                    )}
                                </Card>
                            ))}
                            {detail && isStudent && (
                                <Button type="primary" size="large" onClick={() => void submit()}>
                                    提交并批改
                                </Button>
                            )}
                        </Space>
                    </Card>
                </Col>
            </Row>
        </Space>
    )
}

function PageIntro({title, subtitle}: { title: string; subtitle: string }) {
    return (
        <Card>
            <Flex justify="space-between" align="center" gap={16} wrap>
                <div>
                    <Text type="secondary">Core Workflow</Text>
                    <Title level={2}>{title}</Title>
                </div>
                <Text type="secondary">{subtitle}</Text>
            </Flex>
        </Card>
    )
}

function LabeledEditor({label, children}: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <Text strong>{label}</Text>
            <Space direction="vertical" size={8} style={{width: '100%', marginTop: 8}}>
                {children}
            </Space>
        </div>
    )
}

export default App
