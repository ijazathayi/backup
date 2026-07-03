import React, { useState } from 'react'
import './css/calculator.css'

const Calculator = () => {
  const [display, setDisplay] = useState('0')
  const [operator, setOperator] = useState<string | null>(null)
  const [operand, setOperand] = useState<number | null>(null)
  const [waiting, setWaiting] = useState(false)

  const inputDigit = (digit: string) => {
    if (waiting) {
      setDisplay(digit)
      setWaiting(false)
      return
    }
    setDisplay(prev => (prev === '0' ? digit : prev + digit))
  }

  const inputDot = () => {
    if (waiting) {
      setDisplay('0.')
      setWaiting(false)
      return
    }
    if (!display.includes('.')) setDisplay(prev => prev + '.')
  }

  const clearAll = () => {
    setDisplay('0')
    setOperator(null)
    setOperand(null)
    setWaiting(false)
  }

  const performOperation = (nextOp: string) => {
    const inputValue = parseFloat(display)
    if (operand == null) {
      setOperand(inputValue)
    } else if (operator) {
      const current = operand || 0
      let result = current
      switch (operator) {
        case '+': result = current + inputValue; break
        case '-': result = current - inputValue; break
        case '×': result = current * inputValue; break
        case '÷': result = inputValue === 0 ? NaN : current / inputValue; break
      }
      setDisplay(String(Number.isFinite(result) ? result : 'Error'))
      setOperand(result)
    }
    setWaiting(true)
    setOperator(nextOp === '=' ? null : nextOp)
    if (nextOp === '=') setOperand(null)
  }

  return (
    <div className="calculator-root">
      <div className="calculator-shell">
        <div className="calculator-display" aria-live="polite">{display}</div>
        <div className="calculator-keys">
          <button className="key key-ac" onClick={clearAll}>AC</button>
          <button className="key key-op" onClick={() => performOperation('÷')}>÷</button>
          <button className="key key-op" onClick={() => performOperation('×')}>×</button>
          <button className="key key-op" onClick={() => performOperation('-')}>-</button>

          <button className="key" onClick={() => inputDigit('7')}>7</button>
          <button className="key" onClick={() => inputDigit('8')}>8</button>
          <button className="key" onClick={() => inputDigit('9')}>9</button>
          <button className="key key-op" onClick={() => performOperation('+')}>+</button>

          <button className="key" onClick={() => inputDigit('4')}>4</button>
          <button className="key" onClick={() => inputDigit('5')}>5</button>
          <button className="key" onClick={() => inputDigit('6')}>6</button>
          <button className="key key-eq" onClick={() => performOperation('=') }>=</button>

          <button className="key" onClick={() => inputDigit('1')}>1</button>
          <button className="key" onClick={() => inputDigit('2')}>2</button>
          <button className="key" onClick={() => inputDigit('3')}>3</button>

          <button className="key key-zero" onClick={() => inputDigit('0')}>0</button>
          <button className="key" onClick={inputDot}>.</button>
        </div>
      </div>
    </div>
  )
}

export default Calculator