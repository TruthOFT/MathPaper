import React from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

interface Question {
    id: number;
    type: string;
    content: string;
    latex: string;
}

const mockQuestions: Question[] = [
    { id: 1, type: '积分题', content: '计算不定积分：', latex: '\\int x^2 e^{-x} \\, dx' },
    { id: 2, type: '积分题', content: '求定积分：', latex: '\\int_0^{\\infty} \\frac{\\sin x}{x} \\, dx' },
    { id: 3, type: '极限题', content: '求极限：', latex: '\\lim_{x \\to 0} \\frac{1 - \\cos x}{x^2}' },
    { id: 4, type: '极限题', content: '求极限：', latex: '\\lim_{n \\to \\infty} \\left( 1 + \\frac{1}{n} \\right)^n' },
    { id: 5, type: '导数题', content: '求导数：', latex: '\\frac{d}{dx} \\left( e^x \\cos x \\right)' },
    { id: 6, type: '导数题', content: '求导数：', latex: '\\frac{d}{dx} \\ln(\\sqrt{x^2+1})' },
];

export const QuestionsPage: React.FC = () => {
    return (
        <div className="questions-container">
            <h2 className="questions-title">数学题库</h2>
            <div className="questions-grid">
                {mockQuestions.map((q) => (
                    <div key={q.id} className="question-card">
                        <div className="question-header">
                            <span className="question-type">{q.type}</span>
                            <span className="question-id">#{q.id}</span>
                        </div>
                        <div className="question-body">
                            <p className="question-content">{q.content}</p>
                            <div className="question-latex">
                                <BlockMath math={q.latex} />
                            </div>
                        </div>
                        <div className="question-footer">
                            <button className="action-button">作答</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuestionsPage;
