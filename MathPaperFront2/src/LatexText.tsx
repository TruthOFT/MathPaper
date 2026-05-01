import katex from 'katex'

type LatexTextProps = {
    value?: string | null
    mathOnly?: boolean
    display?: boolean
    className?: string
}

type Segment = {
    kind: 'text' | 'math'
    value: string
    display?: boolean
}

const delimiters = [
    { left: '$$', right: '$$', display: true },
    { left: '\\[', right: '\\]', display: true },
    { left: '\\(', right: '\\)', display: false },
]

function stripOuterDelimiter(value: string) {
    const trimmed = value.trim()
    for (const delimiter of delimiters) {
        if (trimmed.startsWith(delimiter.left) && trimmed.endsWith(delimiter.right)) {
            return {
                value: trimmed.slice(delimiter.left.length, trimmed.length - delimiter.right.length),
                display: delimiter.display,
            }
        }
    }
    return { value: trimmed, display: false }
}

function parseLatexText(value: string): Segment[] {
    const segments: Segment[] = []
    let index = 0

    while (index < value.length) {
        const next = delimiters
            .map((delimiter) => ({ delimiter, start: value.indexOf(delimiter.left, index) }))
            .filter((item) => item.start !== -1)
            .sort((a, b) => a.start - b.start)[0]

        if (!next) {
            segments.push({ kind: 'text', value: value.slice(index) })
            break
        }

        if (next.start > index) {
            segments.push({ kind: 'text', value: value.slice(index, next.start) })
        }

        const contentStart = next.start + next.delimiter.left.length
        const end = value.indexOf(next.delimiter.right, contentStart)
        if (end === -1) {
            segments.push({ kind: 'text', value: value.slice(next.start) })
            break
        }

        segments.push({
            kind: 'math',
            value: value.slice(contentStart, end),
            display: next.delimiter.display,
        })
        index = end + next.delimiter.right.length
    }

    return segments.filter((segment) => segment.value.length > 0)
}

function renderMath(value: string, displayMode: boolean) {
    try {
        return katex.renderToString(value, {
            displayMode,
            throwOnError: false,
            strict: false,
        })
    } catch {
        return null
    }
}

export function LatexText({ value, mathOnly = false, display = false, className }: LatexTextProps) {
    const source = value?.trim()

    if (!source) {
        return <span className={className}>-</span>
    }

    if (mathOnly) {
        const stripped = stripOuterDelimiter(source)
        const html = renderMath(stripped.value, display || stripped.display)
        if (!html) {
            return <span className={className}>{source}</span>
        }
        return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
    }

    return (
        <span className={className}>
            {parseLatexText(source).map((segment, index) => {
                if (segment.kind === 'text') {
                    return <span key={index}>{segment.value}</span>
                }

                const html = renderMath(segment.value, Boolean(segment.display))
                if (!html) {
                    return <span key={index}>{segment.value}</span>
                }

                const Tag = segment.display ? 'div' : 'span'
                return <Tag key={index} dangerouslySetInnerHTML={{ __html: html }} />
            })}
        </span>
    )
}
