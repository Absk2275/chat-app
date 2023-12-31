import './App.css';
import {Route, Routes} from "react-router-dom";
import Homepage from './component/Homepage';
import ChatPage from './component/ChatPage';
function App() {
  return (
   
    <div className='App'>
    <Routes>
    <Route path="/" element={<Homepage />}></Route>
    <Route path="/chats" element={<ChatPage />}></Route>
    </Routes>
    </div>

    
  );
}

export default App;
