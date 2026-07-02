import React, { useState } from 'react';
import './css/todo.css';
import axios from 'axios'
import logo1 from '../assets/logo1.png';
import { Link } from 'react-router';


const Todo = () => {
  const [addValue, setAddValue] = useState('');
  const [data, setData] = useState([]);

  // const handleAdd = () => {
  //   if (addValue.trim() !== '') {
  //     setData([...data, addValue.trim()]);
  //     setAddValue('');
  //   }

  //   axios.post('http://localhost:3001/add', {data:data})
  //   .then(result => console.log(result))
  //   .catch(err => console.log(err))
  // };
const handleAdd = () => {
  if (addValue.trim() !== '') {
    axios.post('http://localhost:3001/add', { data: addValue.trim() })
      .then(result => {
        console.log(result);
        setData(prev => [...prev, addValue.trim()]);
        setAddValue('');
      })
      .catch(err => console.log(err));
  }
};

  return (
    <div id='body'>
      <Link to="/" ><img src={logo1} width="200px" alt="img" style={{cursor:"pointer", left:"0px",top:"0", position:"absolute"}} /></Link>


      <div id="input" className='app-division'>
        <input
          type="text"
          id='text-input'
          placeholder='Enter your task'
          onChange={(e) => setAddValue(e.target.value)}
          value={addValue}
        />
        <button onClick={handleAdd} id='add-button'>ADD</button>
      </div>

      <div id="notes" className='app-division'>
        <div id="checklist">
          <h2 id='c'><u> your lists :   </u></h2>
          {data.length === 0 ?
            <div><h4>no records </h4></div>
            :

          data.map((item, index) => (
                 <div id="list"> 
            <React.Fragment key={index}>
              <input
                type="checkbox"
                id={`item-${index}`}
                name={`item-${index}`}
                value={item}
              />
              <label htmlFor={`item-${index}`}>{item}</label>
            </React.Fragment></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Todo;

