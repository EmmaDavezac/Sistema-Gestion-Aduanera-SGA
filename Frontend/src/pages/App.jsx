import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Home from './Home'
import '@fortawesome/fontawesome-free/css/all.min.css';
import { registerSW } from 'virtual:pwa-register'
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

registerSW({ immediate: true })
// Rutas protegidas
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');// Si el usuario tiene token, muestra el componente solicitado, sino redirige a login
    return token ? children : <Navigate to="/login" />;
};
// Rutas públicas
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');// Si el usuario ya tiene token, redirige a home
  return token ? <Navigate to="/" /> : children;
};

function App() 
{
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                <Route path="*" element={<Navigate to="/login" />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
            </Routes>
        </Router>
    );
}

export default App;