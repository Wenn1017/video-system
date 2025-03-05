import "./App.css";
import { Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage/LoginPage";
import MainPage from "./pages/MainPage/MainPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage/ForgotPasswordPage";
import SignUpPage from "./pages/SignUpPage/SignUpPage"; 

const App = () => {
  return (
    <>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage/>} />
          <Route path="/main" element={<MainPage/>} />
          <Route path="/forgot-password" element={<ForgotPasswordPage/>} />
          <Route path="/signup" element={<SignUpPage/>} />
          
        </Routes>
      </div>
    </>
  );
};

export default App;