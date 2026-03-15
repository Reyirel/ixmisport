import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminPanel from './pages/AdminPanel'
import Perfil from './pages/Perfil'
import CanchasReservar from './pages/CanchasReservar'
import { AuthProvider, useAuth } from './context/AuthContext'
import { initializeCanchas } from './services/firestoreService'

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()
  
  // Mientras se carga, mostrar loading
  if (loading) {
    return <div className="p-8 text-center">Cargando...</div>
  }
  
  // Si no está autenticado, redirigir a login
  if (!currentUser) {
    return <Navigate to="/login" />
  }
  
  return children
}

function AdminRoute({ children }) {
  const { currentUser, userData, loading } = useAuth()
  
  // Mientras se carga, mostrar loading
  if (loading) {
    return <div className="p-8 text-center">Verificando permisos...</div>
  }
  
  // Si no hay usuario autenticado
  if (!currentUser) {
    return <Navigate to="/login" />
  }
  
  // Si el usuario no es admin
  if (!userData?.isAdmin) {
    return <Navigate to="/" />
  }
  
  // Si es admin, permitir acceso
  return children
}

function AppContent() {
  useEffect(() => {
    // Inicializar datos al cargar la app
    initializeCanchas()
    
  }, [])

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/reservar"
          element={
            <ProtectedRoute>
              <CanchasReservar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
