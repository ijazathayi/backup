import React, { useState } from 'react';
import './css/calculator.css'
import logo1 from '../assets/logo1.png';
import { Link } from 'react-router';


const Calculator = () => {
  const [inputValue, setInputValue] = useState('');

  function display(input) {
    setInputValue(inputValue + input);
  }

  function cleardisplay() {
    setInputValue('');
  }

  function calculate() {
    try {
      setInputValue(eval(inputValue).toString());
    } catch (error) {
      setInputValue('Error');
    }
  }
  function deleted(){
    setInputValue(inputValue.slice(0, -1));
  }

  return (<>
    <div id='calc-body'>
      <Link to="/" ><img src={logo1} width="200px" alt="img" style={{cursor:"pointer", left:"0px",top:"0", position:"absolute"}} /></Link>
      <div id="calc-content">
        <input id="inp-screen" value={inputValue} readOnly />
        <div id='but-body'>
          <section>
            <button className='clac-buttons spl-calc-but' onClick={cleardisplay}>C</button>
            <button className='clac-buttons spl-calc-but' onClick={() => deleted()}>DEL</button>
            <button className='clac-buttons spl-calc-but' onClick={() => display('*')}>*</button>
            <button className='clac-buttons spl-calc-but' onClick={() => display('+')}>+</button>
          </section>
          <section>
            <button className='clac-buttons' onClick={() => display('9')}>9</button>
            <button className='clac-buttons' onClick={() => display('8')}>8</button>
            <button className='clac-buttons' onClick={() => display('7')}>7</button>
            <button className='clac-buttons spl-calc-but' onClick={() => display('-')}>-</button>
          </section>
          <section>
            <button className='clac-buttons' onClick={() => display('6')}>6</button>
            <button className='clac-buttons' onClick={() => display('5')}>5</button>
            <button className='clac-buttons' onClick={() => display('4')}>4</button>
            <button className='clac-buttons spl-calc-but' onClick={() => display('*')}>X</button>
          </section>
          <section>
            <button className='clac-buttons' onClick={() => display('3')}>3</button>
            <button className='clac-buttons' onClick={() => display('2')}>2</button>
            <button className='clac-buttons' onClick={() => display('1')}>1</button>
            <button className='clac-buttons spl-calc-but' onClick={calculate}>=</button>
          </section>
        </div>
      </div>
    </div>
    </>
  );
}

export default Calculator;
