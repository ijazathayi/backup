import Login from './components/Login';
import Home from './components/Homepage'
import Signup from './components/Signup';
import { BrowserRouter, Routes, Route } from'react-router-dom';
import Homepage from './components/Homepage';
import Othersignin from './components/Othersignin';


function App() {
  return (
    <div className="App">
     <BrowserRouter>
        <Routes>
          <Route path='/' exact element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/home' element={<Homepage />} />
          <Route path='/signin' element={<Othersignin />} />
          
        </Routes>
        </BrowserRouter>  
    
    </div>
  );
}

export default App;
