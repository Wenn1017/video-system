import "./App.css";
import { Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage/LoginPage";
import SignUpPage from "./pages/SignUpPage/SignUpPage"; 
// import ForgotPasswordPage from "./pages/ForgotPasswordPage/ForgotPasswordPage";
import MainPage from "./pages/MainPage/MainPage";
import TranscriptPage from "./pages/TranscriptionPage/TranscriptionPage";
import TranslationPage from "./pages/TranslationPage/TranslationPage";
import SummaryPage from "./pages/SummaryPage/SummaryPage";
import HistoryPage from "./pages/HistoryPage/HistoryPage";
import ViewPage from "./pages/ViewPage/ViewPage";


const App = () => {
  return (
    <>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage/>} />
          <Route path="/signup" element={<SignUpPage/>} />
          <Route path="/main" element={<MainPage/>} />
          <Route path="/transcription" element={<TranscriptPage/>}/>
          <Route path="/summary" element={<SummaryPage/>}/>
          <Route path="/translation" element={<TranslationPage/>}/>
          <Route path="/history" element={<HistoryPage/>}/>
          <Route path="/view" element={<ViewPage/>}/>
          
        </Routes>
      </div>
    </>
  );
};

export default App;