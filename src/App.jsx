import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import ChatRoom from "./components/ChatRoom.jsx";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/chat" element={<ChatRoom />} />
                <Route path="/register" element={<Register />} />

            </Routes>
        </Router>
    );
};

export default App;
