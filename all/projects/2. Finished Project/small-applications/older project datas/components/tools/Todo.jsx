import React, { useState } from 'react'
import './css/todo.css'
import del from '../assets/delete.png'
import axios from 'axios'
import { useEffect } from 'react'
import logo1 from '../assets/logo1.png';
import { Link } from 'react-router';

const Todo = () => {
    const [todo, setTodo] = useState([]);
    const [task, setTask] = useState();


    const fetchTodos = () => {
        axios.get("http://localhost:3001/get")
            .then(result => setTodo(result.data))
            .catch(err => console.log(err));
    };

    useEffect(() => {
        fetchTodos();
    }, []);


    function handleadd() {
        if (!task) return;
        axios.post("http://localhost:3001/add ", { task: task })
        .then(result => { console.log(result); 
            fetchTodos();
            setTodo([...todo, result.data]);
            setTask("");   

        })
        .catch(err => console.log(err))
        if (!task) return;
    }
    function handledelete(id) {
        axios.delete(`http://localhost:3001/delete/${id}`)
            .then(result => { console.log(result); fetchTodos(); })
            .catch(err => console.log(err))
    }       

    const handleKeyDown = (event) => {
  if (event.key === 'Enter') {
  handleadd(); // Call your existing add function
  }
};

    return (
        <div id='todo-body' style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
      <Link to="/" ><img src={logo1} width="200px" alt="img" style={{cursor:"pointer", left:"0px",top:"0", position:"absolute"}} /></Link>

            <div id="todo-section1">
                <h1>Todo List</h1>
                <div id="input-div">
                    {/* <input type="text" placeholder='Enter your task' value={task} onChange={(e) => setTask(e.target.value)} />
                    <button onClick={handleadd}>Add</button> */}
                     <input type="text" placeholder='Enter your task' value={task} onKeyDown={handleKeyDown} onChange={(e) => setTask(e.target.value)} />
                        <button onClick={handleadd}>Add</button>
                </div>
                {
                    todo.length === 0 ?
                        <div>No Data</div> :
                        <div id="list-todos">
                            {todo.map(todoItem => (
                                <div id='todos' key={todoItem._id}>{todoItem.task} 
                                    <button className='delete-btn' onClick={() => handledelete(todoItem._id)}>
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                }
                {/* {
                    todo.length === 0 ?
                        <div>No Datas</div>
                        :
                        todo.map(todo => {
                            <div> {todo}</div>
                        })
                } */}


                {/* <div id="list-todos">
                <ul>
                    <li>Task 1 <button className='delete-btn'> <img src={del} height={"30px"} /> </button ></li>
                    <li>Task 2 <button className='delete-btn'> <img src={del} height={"30px"} /></button></li>
                </ul>

                </div> */}
            </div>
        </div>
    )
}

export default Todo