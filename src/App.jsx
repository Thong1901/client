import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import Chat from "./pages/chat.jsx";
import Register from "./pages/Register";
import Login from "./pages/Login";
import { Container } from "react-bootstrap";
import { useContext, useEffect } from "react";
import { AuthContext } from "./context/AuthContext.jsx";
import { ChatContextProvider } from "./context/ChatContext.jsx";
import "bootstrap/dist/css/bootstrap.min.css";


function App() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Add viewport meta tag for mobile
    const viewport = document.createElement('meta');
    viewport.name = "viewport";
    viewport.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
    document.head.appendChild(viewport);

    // Add mobile web app capable meta tags
    const mobileWebApp = document.createElement('meta');
    mobileWebApp.name = "apple-mobile-web-app-capable";
    mobileWebApp.content = "yes";
    document.head.appendChild(mobileWebApp);

    // Detect touch support
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      document.body.classList.add('touch-device');
    } else {
      document.body.classList.remove('touch-device');
    }

    return () => {
      document.head.removeChild(viewport);
      document.head.removeChild(mobileWebApp);
    };
  }, []);

  return (
    <ChatContextProvider user={user}>
      <NavBar />
      <Container className="text-secondary px-2">
        <Routes>
          <Route path="/" element={user ? <Chat /> : <Login />} />
          <Route path="/register" element={user ? <Chat /> : <Register />} />
          <Route path="/login" element={user ? <Chat /> : <Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Container>
    </ChatContextProvider>
  );
}
export default App
