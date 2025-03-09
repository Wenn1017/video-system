import "./App.css";
import { Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage/LoginPage";
import MainPage from "./pages/MainURLPage/MainURLPage";
// import ForgotPasswordPage from "./pages/ForgotPasswordPage/ForgotPasswordPage";
import SignUpPage from "./pages/SignUpPage/SignUpPage"; 

const App = () => {
  return (
    <>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage/>} />
          <Route path="/signup" element={<SignUpPage/>} />
          <Route path="/mainurl" element={<MainURLPage/>} />
          <Route path="/mainurl/mainfile" element={<MainFilePage/>} />
          <Route path="/main/translation" element={<TranslationPage/>} />
  
        </Routes>
      </div>
    </>
  );
};

export default App;