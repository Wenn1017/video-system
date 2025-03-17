import "./App.css";
import { Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage/LoginPage";
import MainURLPage from "./pages/MainPage/MainURLPage";
import TranslationPage from "./pages/TranslationPage/TranslationPage";
import TranscriptPage from "./pages/TranscriptionPage/TranscriptionPage";
// import MainFileilePage from "./pages/MainPage/MainFilePage";
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
          {/* <Route path="/mainurl/mainfile" element={<MainFilePage/>} /> */}
          <Route path="/mainurl/translation" element={<TranslationPage/>}/>
          <Route path="/mainurl/transcript" element={<TranscriptPage/>}/>
  
        </Routes>
      </div>
    </>
  );
};

export default App;