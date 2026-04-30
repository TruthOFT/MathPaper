import { useEffect, useRef } from 'react'
import { MathfieldElement } from 'mathlive'
import 'mathlive/fonts.css'

type MathInputProps = {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export function MathInput({ value, onChange, placeholder }: MathInputProps) {
    const hostRef = useRef<HTMLDivElement | null>(null)
    const mathfieldRef = useRef<MathfieldElement | null>(null)
    const onChangeRef = useRef(onChange)
    const initialValueRef = useRef(value)
    const placeholderRef = useRef(placeholder)

    useEffect(() => {
        onChangeRef.current = onChange
    }, [onChange])

    useEffect(() => {
        if (!hostRef.current) {
            return
        }

        const mathfield = new MathfieldElement({
            smartFence: true,
            smartMode: false,
        })
        mathfield.className = 'math-editor'
        mathfield.value = initialValueRef.current
        mathfield.setAttribute('math-virtual-keyboard-policy', 'auto')
        mathfield.setAttribute('virtual-keyboard-mode', 'manual')
        mathfield.setAttribute('placeholder', placeholderRef.current ?? '输入 LaTeX')

        const handleInput = (event: Event) => {
            const target = event.target as MathfieldElement
            onChangeRef.current(target.getValue('latex'))
        }

        mathfield.addEventListener('input', handleInput)
        hostRef.current.replaceChildren(mathfield)
        mathfieldRef.current = mathfield

        return () => {
            mathfield.removeEventListener('input', handleInput)
            mathfield.remove()
            mathfieldRef.current = null
        }
    }, [])

    useEffect(() => {
        const mathfield = mathfieldRef.current
        if (mathfield && mathfield.value !== value) {
            mathfield.value = value
        }
    }, [value])

    return <div ref={hostRef} className="mathfield-host" />
}
