import { useEffect, useRef, useState } from 'react'
import { MathfieldElement } from 'mathlive'
import 'mathlive/fonts.css'
import './App.css'
const initialLatexValue = '\\sqrt{3x-1}+(1+x)^2'

function App() {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const mathfieldRef = useRef<MathfieldElement | null>(null)
    const [latexValue, setLatexValue] = useState(initialLatexValue)

    useEffect(() => {
        if (!containerRef.current) {
            return
        }

        const mathfield = new MathfieldElement({
            smartFence: true,
            smartMode: false,
        })

        mathfield.className = 'math-editor'
        mathfield.value = initialLatexValue
        mathfield.setAttribute('math-virtual-keyboard-policy', 'auto')
        mathfield.setAttribute('virtual-keyboard-mode', 'manual')
        mathfield.setAttribute('placeholder', '请输入数学公式')

        const handleInput = (event: Event) => {
            const target = event.target as MathfieldElement
            setLatexValue(target.value)
        }

        mathfield.addEventListener('input', handleInput)
        containerRef.current.replaceChildren(mathfield)
        mathfieldRef.current = mathfield

        return () => {
            mathfield.removeEventListener('input', handleInput)
            mathfield.remove()
            mathfieldRef.current = null
        }
    }, [])

    useEffect(() => {
        const mathfield = mathfieldRef.current
        if (!mathfield || mathfield.value === latexValue) {
            return
        }

        mathfield.value = latexValue
    }, [latexValue])

    const fillExample = (value: string) => {
        setLatexValue(value)
        mathfieldRef.current?.focus()
    }

    return (
        <main className="page">
            <section className="panel">
                <div className="panel-header">
                    <div>
                        <p className="eyebrow">mathlive 接入示例</p>
                        <h1>公式输入框现在可以正常使用了</h1>
                    </div>
                    <p className="desc">
                        前端保存 LaTeX，后端再把表达式送给 Symja 做等价判断。
                    </p>
                </div>

                <div className="editor-card">
                    <label className="label">数学公式输入</label>
                    <div ref={containerRef} className="mathfield-host" />
                    <div className="toolbar">
                        <button type="button" onClick={() => fillExample('\\frac{1}{2}x^2+3x-5')}>
                            二次式
                        </button>
                        <button type="button" onClick={() => fillExample('\\sqrt{x+1}=3')}>
                            根式方程
                        </button>
                        <button type="button" onClick={() => fillExample('\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}')}>
                            矩阵
                        </button>
                    </div>
                </div>

                <div className="preview-grid">
                    <section className="preview-card">
                        <h2>LaTeX 输出</h2>
                        <pre>{latexValue}</pre>
                    </section>
                    <section className="preview-card">
                        <h2>接入说明</h2>
                        <ul>
                            <li>不要把 `Mathfield` 当 React 组件直接渲染。</li>
                            <li>React 里建议通过 `MathfieldElement` 或 `math-field` 自定义元素接入。</li>
                            <li>提交时保存 `latexValue`，批改时再转换为 Symja 可识别表达式。</li>
                        </ul>
                    </section>
                </div>
            </section>
        </main>
    )
}

export default App
