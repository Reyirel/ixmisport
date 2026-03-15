import { useEffect, useState } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  MapPin, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Star,
  ChevronDown,
  X,
  CalendarDays,
  Activity,
  UserCheck,
  Ban,
  PlayCircle,
  RefreshCw,
  FileText,
  Download,
  Sparkles,
  Shield,
  Mail,
  Phone,
  CreditCard,
  GraduationCap,
  CalendarCheck,
  BarChart3,
  Percent,
  UserX,
  Timer,
  Plus,
  Trash2,
  Pencil
} from 'lucide-react'
import jsPDF from 'jspdf'
import {
  getAllReservasAdmin,
  getPendingReservas,
  updateReservaStatus,
  postponeReserva,
  getAllCanchas,
  addCancha,
  deleteCancha,
  updateCancha,
  disableCancha,
  enableCancha,
  getAllUsers,
  getUserReservasAdmin,
  getSystemStats,
  updateUserRating
} from '../services/firestoreService'

// Iconos SVG por deporte
const sportIcons = {
  Basquetbol: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M12 2v20M2 12h20M4.93 4.93c4.08 4.08 4.08 10.06 0 14.14M19.07 4.93c-4.08 4.08-4.08 10.06 0 14.14" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  ),
  Voleibol: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M12 2c0 5.5 4.5 10 10 10M12 2c0 5.5-4.5 10-10 10M12 22c0-5.5 4.5-10 10-10M12 22c0-5.5-4.5-10-10-10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  ),
  Pádel: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <ellipse cx="12" cy="8" rx="6" ry="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <line x1="12" y1="15" x2="12" y2="22" stroke="currentColor" strokeWidth="2"/>
      <circle cx="9" cy="7" r="1" fill="currentColor"/>
      <circle cx="15" cy="7" r="1" fill="currentColor"/>
      <circle cx="12" cy="10" r="1" fill="currentColor"/>
    </svg>
  ),
  Fútbol: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <polygon points="12,7 15,10 14,14 10,14 9,10" stroke="currentColor" strokeWidth="1" fill="none"/>
      <line x1="12" y1="2" x2="12" y2="7" stroke="currentColor" strokeWidth="1"/>
      <line x1="22" y1="12" x2="15" y2="10" stroke="currentColor" strokeWidth="1"/>
      <line x1="19" y1="19" x2="14" y2="14" stroke="currentColor" strokeWidth="1"/>
      <line x1="5" y1="19" x2="10" y2="14" stroke="currentColor" strokeWidth="1"/>
      <line x1="2" y1="12" x2="9" y2="10" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),
}

const sportColors = {
  Basquetbol: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' },
  Voleibol: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
  Pádel: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700' },
  Fútbol: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', badge: 'bg-green-100 text-green-700' },
}

const statusConfig = {
  pendiente: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock, label: 'Pendiente' },
  aprobada: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle, label: 'Aprobada' },
  rechazada: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Rechazada' },
  cancelada: { color: 'bg-gray-100 text-gray-600 border-gray-200', icon: Ban, label: 'Cancelada' },
  'no-asistió': { color: 'bg-rose-100 text-rose-700 border-rose-200', icon: AlertTriangle, label: 'No Asistió' },
  pospuesta: { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: RefreshCw, label: 'Pospuesta' }
}

// Tabs del panel
const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'reservas', label: 'Reservas', icon: Calendar },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'canchas', label: 'Canchas', icon: MapPin },
]

// Función para calcular tiempo restante de inhabilitación
const getDisabledInfo = (cancha) => {
  if (!cancha.inhabilitada) return null

  const now = new Date()
  
  // Hora de inicio de la inhabilitación
  const inhabilitadaEn = cancha.inhabilitadaEn?.toDate?.() || null
  const horaInicio = inhabilitadaEn 
    ? inhabilitadaEn.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    : null
  const fechaInicio = inhabilitadaEn
    ? inhabilitadaEn.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
    : null

  // Si hay fecha de finalización
  if (cancha.inhabilitadaHasta) {
    const inhabilitadaHasta = cancha.inhabilitadaHasta.toDate?.() || null
    if (inhabilitadaHasta) {
      const diff = inhabilitadaHasta - now
      if (diff <= 0) {
        return { expired: true, horaInicio, fechaInicio }
      }
      
      const minutosRestantes = Math.ceil(diff / (1000 * 60))
      const horasRestantes = Math.floor(minutosRestantes / 60)
      const mins = minutosRestantes % 60
      
      let tiempoRestante = ''
      if (horasRestantes > 0) {
        tiempoRestante = `${horasRestantes}h ${mins}min`
      } else {
        tiempoRestante = `${mins} min`
      }
      
      const horaFin = inhabilitadaHasta.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      const fechaFin = inhabilitadaHasta.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
      
      return {
        temporal: true,
        horaInicio,
        fechaInicio,
        horaFin,
        fechaFin,
        tiempoRestante,
        minutosRestantes
      }
    }
  }
  
  // Inhabilitación permanente
  return {
    permanente: true,
    horaInicio,
    fechaInicio
  }
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [allReservas, setAllReservas] = useState([])
  const [pendingReservas, setPendingReservas] = useState([])
  const [canchas, setCanchas] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  
  // Modales
  const [postponeModal, setPostponeModal] = useState(null)
  const [disableModal, setDisableModal] = useState(null)
  const [userModal, setUserModal] = useState(null)
  const [userReservas, setUserReservas] = useState([])
  const [loadingUserReservas, setLoadingUserReservas] = useState(false)
  
  // Formularios
  const [postponeData, setPostponeData] = useState({ fecha: '', hora: '' })
  const [disableType, setDisableType] = useState('time')
  const [disableTime, setDisableTime] = useState('')
  const [disableStartHour, setDisableStartHour] = useState('') // Nueva hora de inicio
  const [disableDate, setDisableDate] = useState('')
  const [disableDateType, setDisableDateType] = useState('fullDay')
  
  // Modal nueva cancha
  const [addCanchaModal, setAddCanchaModal] = useState(false)
  const [newCancha, setNewCancha] = useState({ nombre: '', deporte: 'Basquetbol', personasMinimas: 2 })
  const [addCanchaLoading, setAddCanchaLoading] = useState(false)

  // Modal editar cancha
  const [editCanchaModal, setEditCanchaModal] = useState(null) // cancha object
  const [editCancha, setEditCancha] = useState({ nombre: '', deporte: 'Basquetbol', personasMinimas: 2 })
  const [editCanchaLoading, setEditCanchaLoading] = useState(false)

  // Filtros
  const [reservaFilter, setReservaFilter] = useState('all')
  const [reservaSearch, setReservaSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [canchaFilter, setCanchaFilter] = useState('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [reservasData, pendingData, canchasData, usuariosData, statsData] = await Promise.all([
        getAllReservasAdmin(),
        getPendingReservas(),
        getAllCanchas(),
        getAllUsers(),
        getSystemStats()
      ])
      setAllReservas(reservasData)
      setPendingReservas(pendingData)
      setCanchas(canchasData)
      setUsuarios(usuariosData)
      setStats(statsData)
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveReserva = async (reservaId) => {
    try {
      setActionLoading(reservaId)
      await updateReservaStatus(reservaId, 'aprobada')
      await loadData()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectReserva = async (reservaId) => {
    try {
      setActionLoading(reservaId)
      await updateReservaStatus(reservaId, 'rechazada', 'Rechazada por administrador')
      await loadData()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancelReserva = async (reservaId) => {
    if (!window.confirm('¿Estás seguro de cancelar esta reserva aprobada?')) return
    try {
      setActionLoading(reservaId)
      await updateReservaStatus(reservaId, 'cancelada', 'Cancelada por administrador')
      await loadData()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleAddCancha = async (e) => {
    e.preventDefault()
    if (!newCancha.nombre.trim()) return
    try {
      setAddCanchaLoading(true)
      await addCancha({
        nombre: newCancha.nombre.trim(),
        deporte: newCancha.deporte,
        personasMinimas: parseInt(newCancha.personasMinimas) || 2,
        inhabilitada: false,
      })
      setAddCanchaModal(false)
      setNewCancha({ nombre: '', deporte: 'Basquetbol', personasMinimas: 2 })
      await loadData()
    } catch (error) {
      console.error('Error al agregar cancha:', error)
      alert('Error al agregar la cancha')
    } finally {
      setAddCanchaLoading(false)
    }
  }

  const handleEditCancha = async (e) => {
    e.preventDefault()
    if (!editCancha.nombre.trim() || !editCanchaModal) return
    try {
      setEditCanchaLoading(true)
      await updateCancha(editCanchaModal.id, {
        nombre: editCancha.nombre.trim(),
        deporte: editCancha.deporte,
        personasMinimas: parseInt(editCancha.personasMinimas) || 2,
      })
      setEditCanchaModal(null)
      await loadData()
    } catch (error) {
      console.error('Error al editar cancha:', error)
      alert('Error al editar la cancha')
    } finally {
      setEditCanchaLoading(false)
    }
  }

  const handleDeleteCancha = async (canchaId, nombreCancha) => {
    if (!window.confirm(`¿Eliminar permanentemente la cancha "${nombreCancha}"? Esta acción no se puede deshacer.`)) return
    try {
      setActionLoading(canchaId)
      await deleteCancha(canchaId)
      await loadData()
    } catch (error) {
      console.error('Error al eliminar cancha:', error)
      alert('Error al eliminar la cancha')
    } finally {
      setActionLoading(null)
    }
  }

  const handlePostponeReserva = async () => {
    if (!postponeModal || !postponeData.fecha || !postponeData.hora) {
      alert('Por favor completa todos los campos')
      return
    }
    try {
      setActionLoading(postponeModal)
      await postponeReserva(postponeModal, postponeData.fecha, postponeData.hora)
      setPostponeModal(null)
      setPostponeData({ fecha: '', hora: '' })
      await loadData()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDisableCancha = async () => {
    if (!disableModal) return
    try {
      setActionLoading(disableModal)
      let minutes = null
      let startHour = null

      if (disableType === 'time') {
        if (!disableTime) {
          alert('Por favor ingresa la duración en minutos')
          setActionLoading(null)
          return
        }
        minutes = parseInt(disableTime)
        // Si hay hora de inicio especificada, usarla
        startHour = disableStartHour || null
      } else if (disableType === 'fullDay') {
        const now = new Date()
        const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)
        minutes = Math.ceil((midnight - now) / (1000 * 60))
        startHour = null // Empieza ahora
      } else if (disableType === 'date') {
        if (!disableDate) {
          alert('Por favor selecciona una fecha')
          setActionLoading(null)
          return
        }
        if (disableDateType === 'fullDay') {
          const targetDate = new Date(disableDate)
          targetDate.setHours(23, 59, 59)
          const now = new Date()
          minutes = Math.ceil((targetDate - now) / (1000 * 60))
          startHour = null // Empieza ahora
        } else if (disableDateType === 'withTime') {
          if (!disableTime) {
            alert('Por favor ingresa la cantidad de minutos')
            setActionLoading(null)
            return
          }
          minutes = parseInt(disableTime)
          startHour = disableStartHour || null
        }
      }

      await disableCancha(disableModal, minutes, startHour)
      setDisableModal(null)
      setDisableTime('')
      setDisableDate('')
      setDisableStartHour('')
      setDisableType('time')
      setDisableDateType('fullDay')
      await loadData()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al inhabilitar la cancha')
    } finally {
      setActionLoading(null)
    }
  }

  const handleEnableCancha = async (canchaId) => {
    try {
      setActionLoading(canchaId)
      await enableCancha(canchaId)
      await loadData()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleViewUser = async (user) => {
    setUserModal(user)
    setLoadingUserReservas(true)
    try {
      const reservas = await getUserReservasAdmin(user.id)
      setUserReservas(reservas)
    } catch (error) {
      console.error('Error cargando reservas del usuario:', error)
    } finally {
      setLoadingUserReservas(false)
    }
  }

  const handleUpdateUserRating = async (userId, newRating) => {
    try {
      await updateUserRating(userId, newRating)
      await loadData()
      if (userModal && userModal.id === userId) {
        setUserModal({ ...userModal, estrellas: newRating })
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Generar PDF de reporte
  const generateReport = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    
    // Header
    doc.setFillColor(16, 185, 129)
    doc.rect(0, 0, pageWidth, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('Reporte Administrativo', pageWidth / 2, 20, { align: 'center' })
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES', { dateStyle: 'full' })}`, pageWidth / 2, 32, { align: 'center' })
    
    let y = 55
    doc.setTextColor(31, 41, 55)
    
    // Estadísticas generales
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('📊 Estadísticas Generales', 20, y)
    y += 12
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    const statsLines = [
      `Total de reservas: ${stats?.totalReservas || 0}`,
      `Reservas de hoy: ${stats?.reservasHoy || 0}`,
      `Reservas del mes: ${stats?.reservasMes || 0}`,
      `Pendientes: ${stats?.pendientes || 0} | Aprobadas: ${stats?.aprobadas || 0} | Rechazadas: ${stats?.rechazadas || 0}`,
      `Total de usuarios: ${stats?.totalUsuarios || 0} | Activos: ${stats?.usuariosActivos || 0}`,
      `Rating promedio: ${stats?.ratingPromedio || '5.0'} estrellas`,
      `Canchas: ${stats?.totalCanchas || 0} total | ${stats?.canchasActivas || 0} activas | ${stats?.canchasInhabilitadas || 0} inhabilitadas`
    ]
    
    statsLines.forEach(line => {
      doc.text(line, 25, y)
      y += 8
    })
    
    y += 10
    
    // Reservas pendientes
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`⏳ Reservas Pendientes (${pendingReservas.length})`, 20, y)
    y += 12
    
    if (pendingReservas.length > 0) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      pendingReservas.slice(0, 10).forEach(reserva => {
        doc.text(`• ${reserva.userName} - ${reserva.chanchaName} - ${reserva.fecha} ${reserva.hora}`, 25, y)
        y += 7
        if (y > 270) {
          doc.addPage()
          y = 20
        }
      })
      if (pendingReservas.length > 10) {
        doc.text(`... y ${pendingReservas.length - 10} más`, 25, y)
        y += 10
      }
    } else {
      doc.setFontSize(10)
      doc.text('No hay reservas pendientes', 25, y)
      y += 10
    }
    
    // Footer
    doc.setFontSize(9)
    doc.setTextColor(107, 114, 128)
    doc.text('ixmisport - Sistema de Reservas Deportivas', pageWidth / 2, 285, { align: 'center' })
    
    doc.save(`reporte_admin_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  // Filtrar reservas
  const filteredReservas = allReservas.filter(reserva => {
    const matchesFilter = reservaFilter === 'all' || reserva.estado === reservaFilter
    const matchesSearch = reservaSearch === '' || 
      reserva.userName?.toLowerCase().includes(reservaSearch.toLowerCase()) ||
      reserva.chanchaName?.toLowerCase().includes(reservaSearch.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Filtrar usuarios
  const filteredUsers = usuarios.filter(user => {
    return userSearch === '' ||
      user.nombre?.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearch.toLowerCase())
  })

  // Filtrar canchas
  const filteredCanchas = canchas.filter(cancha => {
    if (canchaFilter === 'all') return true
    if (canchaFilter === 'active') return !cancha.inhabilitada
    if (canchaFilter === 'disabled') return cancha.inhabilitada
    return cancha.deporte === canchaFilter
  }).sort((a, b) => (a.orden || 0) - (b.orden || 0))

  // Renderizar estrellas
  const renderStars = (rating, interactive = false, userId = null) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => interactive && userId && handleUpdateUserRating(userId, star)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <Star
              size={interactive ? 18 : 14}
              className={star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}
            />
          </button>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5 text-emerald-600" />
                </span>
                Panel de Administración
              </h1>
              <p className="text-gray-500 mt-1">Gestiona reservas, usuarios y canchas del sistema</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-medium shadow-sm"
              >
                <RefreshCw size={18} />
                Actualizar
              </button>
              <button
                onClick={generateReport}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-medium shadow-sm shadow-emerald-200"
              >
                <Download size={18} />
                Exportar PDF
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 p-1.5">
          <div className="flex flex-wrap gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
                {tab.id === 'reservas' && pendingReservas.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-semibold">
                    {pendingReservas.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards - Primera fila */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
                    <Calendar className="w-6 h-6 text-white" />
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">Total</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalReservas || 0}</p>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <TrendingUp size={14} className="text-emerald-500" />
                  Reservas totales
                </p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}>
                    <Clock className="w-6 h-6 text-white" />
                  </span>
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full animate-pulse">Pendientes</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats?.pendientes || 0}</p>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <AlertTriangle size={14} className="text-amber-500" />
                  Por aprobar
                </p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #374151, #111827)' }}>
                    <Users className="w-6 h-6 text-white" />
                  </span>
                  <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">Usuarios</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalUsuarios || 0}</p>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <UserCheck size={14} className="text-emerald-500" />
                  {stats?.usuariosActivos || 0} activos
                </p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #065f46, #022c22)' }}>
                    <MapPin className="w-6 h-6 text-white" />
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">Canchas</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats?.canchasActivas || 0}</p>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <CheckCircle size={14} className="text-emerald-500" />
                  de {stats?.totalCanchas || 0} disponibles
                </p>
              </div>
            </div>

            {/* Segunda fila de estadísticas - Cards destacados */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl shadow-xl p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm font-medium flex items-center gap-2">
                        <CalendarDays size={16} />
                        Reservas de Hoy
                      </p>
                      <p className="text-5xl font-bold mt-2">{stats?.reservasHoy || 0}</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Sparkles className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
                    <p className="text-emerald-100 text-sm">Este mes</p>
                    <span className="text-white font-bold text-lg">{stats?.reservasMes || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="rounded-2xl shadow-xl p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1f2937, #111827)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm font-medium flex items-center gap-2">
                        <Star size={16} />
                        Rating Promedio
                      </p>
                      <p className="text-5xl font-bold mt-2 flex items-center gap-2">
                        {stats?.ratingPromedio || '5.0'}
                        <Star className="w-10 h-10 fill-white/90" />
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Activity className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <p className="text-gray-300 text-sm flex items-center gap-1">
                      <UserX size={14} />
                      No asistencias
                    </p>
                    <span className="text-white font-bold text-lg">{stats?.noAsistencias || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="rounded-2xl shadow-xl p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #065f46, #022c22)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm font-medium flex items-center gap-2">
                        <Percent size={16} />
                        Tasa de Aprobación
                      </p>
                      <p className="text-5xl font-bold mt-2">
                        {stats?.totalReservas > 0 ? Math.round((stats.aprobadas / stats.totalReservas) * 100) : 0}%
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <TrendingUp className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
                    <p className="text-emerald-100 text-sm flex items-center gap-1">
                      <XCircle size={14} />
                      Rechazadas
                    </p>
                    <span className="text-white font-bold text-lg">{stats?.rechazadas || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tercera fila - Estadísticas detalladas y desglose */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Estadísticas por Deporte */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-3">
                  <span className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                  </span>
                  Estadísticas por Deporte
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(stats?.estadisticasPorDeporte || {}).map(([deporte, data]) => {
                    const colors = sportColors[deporte] || sportColors.Fútbol
                    const total = data.total || 0
                    const maxTotal = Math.max(...Object.values(stats?.estadisticasPorDeporte || {}).map(d => d.total || 0), 1)
                    const percentage = Math.round((total / maxTotal) * 100)
                    
                    return (
                      <div key={deporte} className={`${colors.bg} rounded-xl p-4 border ${colors.border} hover:shadow-md transition-all duration-300`}>
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`${colors.text} w-8 h-8 flex items-center justify-center`}>
                            {sportIcons[deporte] || sportIcons.Fútbol}
                          </span>
                          <span className={`font-semibold ${colors.text}`}>{deporte}</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mb-2">{total}</p>
                        <div className="w-full bg-white/60 rounded-full h-2 mb-2">
                          <div 
                            className={`${colors.text.replace('text', 'bg')} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-emerald-600 font-medium">✓ {data.aprobadas || 0}</span>
                          <span className="text-amber-600 font-medium">⏳ {data.pendientes || 0}</span>
                          <span className="text-red-500 font-medium">✗ {data.rechazadas || 0}</span>
                        </div>
                      </div>
                    )
                  })}
                  {Object.keys(stats?.estadisticasPorDeporte || {}).length === 0 && (
                    <div className="col-span-2 text-center py-8 text-gray-400">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No hay estadísticas disponibles</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Resumen Rápido */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-3">
                  <span className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </span>
                  Resumen del Sistema
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                      <span className="font-medium text-gray-700">Reservas Aprobadas</span>
                    </div>
                    <span className="text-2xl font-bold text-emerald-600">{stats?.aprobadas || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6 text-amber-600" />
                      <span className="font-medium text-gray-700">En Espera</span>
                    </div>
                    <span className="text-2xl font-bold text-amber-600">{stats?.pendientes || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-6 h-6 text-red-600" />
                      <span className="font-medium text-gray-700">Rechazadas</span>
                    </div>
                    <span className="text-2xl font-bold text-red-600">{stats?.rechazadas || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                      <Ban className="w-6 h-6 text-gray-500" />
                      <span className="font-medium text-gray-700">Canchas Inhabilitadas</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-600">{stats?.canchasInhabilitadas || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reservas Pendientes de Aprobación */}
            {pendingReservas.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                      <span className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center animate-pulse">
                        <Clock className="w-5 h-5 text-amber-600" />
                      </span>
                      Reservas Pendientes de Aprobación
                      <span className="px-3 py-1 bg-amber-500 text-white text-sm rounded-full font-semibold">
                        {pendingReservas.length}
                      </span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('reservas')}
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Ver todas
                      <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {pendingReservas.slice(0, 5).map((reserva, index) => {
                    const sportColor = sportColors[reserva.deporte] || sportColors.Fútbol
                    return (
                      <div 
                        key={reserva.id} 
                        className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 ${sportColor.bg} rounded-xl flex items-center justify-center ${sportColor.text}`}>
                            {sportIcons[reserva.deporte] || sportIcons.Fútbol}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{reserva.userName || 'Usuario'}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                              <span className="font-medium text-gray-700">{reserva.chanchaName}</span>
                              <span>•</span>
                              <span>{reserva.fecha}</span>
                              <span>•</span>
                              <span className="font-medium">{reserva.hora}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveReserva(reserva.id)}
                            disabled={actionLoading === reserva.id}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                          >
                            <CheckCircle size={16} />
                            Aprobar
                          </button>
                          <button
                            onClick={() => setPostponeModal(reserva.id)}
                            disabled={actionLoading === reserva.id}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 transition-all"
                          >
                            <RefreshCw size={16} />
                            Posponer
                          </button>
                          <button
                            onClick={() => handleRejectReserva(reserva.id)}
                            disabled={actionLoading === reserva.id}
                            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 text-sm font-medium rounded-xl hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 transition-all"
                          >
                            <XCircle size={16} />
                            Rechazar
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {pendingReservas.length > 5 && (
                  <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
                    <button
                      onClick={() => setActiveTab('reservas')}
                      className="text-emerald-600 hover:text-emerald-700 font-semibold"
                    >
                      Ver {pendingReservas.length - 5} reservas más →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mensaje cuando no hay reservas pendientes */}
            {pendingReservas.length === 0 && (
              <div className="bg-linear-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">¡Todo al día!</h3>
                <p className="text-gray-600">No hay reservas pendientes de aprobación en este momento.</p>
              </div>
            )}
          </div>
        )}

        {/* Reservas Tab */}
        {activeTab === 'reservas' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por usuario o cancha..."
                    value={reservaSearch}
                    onChange={(e) => setReservaSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
                <div className="relative min-w-48">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={reservaFilter}
                    onChange={(e) => setReservaFilter(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-gray-50 focus:bg-white cursor-pointer transition-all font-medium"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="pendiente">🟡 Pendientes</option>
                    <option value="aprobada">🟢 Aprobadas</option>
                    <option value="rechazada">🔴 Rechazadas</option>
                    <option value="cancelada">⚫ Canceladas</option>
                    <option value="no-asistió">⚠️ No asistió</option>
                    <option value="pospuesta">🔵 Pospuestas</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">Mostrando:</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  {filteredReservas.length} reservas
                </span>
                {reservaFilter !== 'all' && (
                  <button
                    onClick={() => setReservaFilter('all')}
                    className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium hover:bg-red-100 transition-all flex items-center gap-1"
                  >
                    <X size={14} />
                    Limpiar filtro
                  </button>
                )}
              </div>
            </div>

            {/* Reservations List - Cards en móvil, tabla en desktop */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Usuario</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Cancha</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Fecha y Hora</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredReservas.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <Calendar className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium">No se encontraron reservas</p>
                            <p className="text-gray-400 text-sm mt-1">Intenta cambiar los filtros de búsqueda</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredReservas.map((reserva, index) => {
                        const status = statusConfig[reserva.estado] || statusConfig.pendiente
                        const StatusIcon = status.icon
                        const sportColor = sportColors[reserva.deporte] || sportColors.Fútbol
                        
                        return (
                          <tr 
                            key={reserva.id} 
                            className="hover:bg-gray-50/80 transition-colors group"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-linear-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                  {reserva.userName?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-900 block">{reserva.userName || 'Sin nombre'}</span>
                                  <span className="text-xs text-gray-400">{reserva.userEmail || ''}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 ${sportColor.bg} rounded-xl flex items-center justify-center ${sportColor.text}`}>
                                  {sportIcons[reserva.deporte] || sportIcons.Fútbol}
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900 block">{reserva.chanchaName}</span>
                                  <span className={`text-xs ${sportColor.text} font-medium`}>{reserva.deporte}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900 flex items-center gap-2">
                                  <CalendarDays size={14} className="text-gray-400" />
                                  {reserva.fecha}
                                </span>
                                <span className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                                  <Clock size={14} className="text-gray-400" />
                                  {reserva.hora}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${status.color}`}>
                                <StatusIcon size={16} />
                                {status.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {reserva.estado === 'pendiente' ? (
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleApproveReserva(reserva.id)}
                                    disabled={actionLoading === reserva.id}
                                    className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200 hover:scale-105 disabled:bg-gray-100 disabled:text-gray-400 disabled:scale-100 transition-all"
                                    title="Aprobar reserva"
                                  >
                                    <CheckCircle size={20} />
                                  </button>
                                  <button
                                    onClick={() => setPostponeModal(reserva.id)}
                                    disabled={actionLoading === reserva.id}
                                    className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 hover:scale-105 disabled:bg-gray-100 disabled:text-gray-400 disabled:scale-100 transition-all"
                                    title="Posponer reserva"
                                  >
                                    <RefreshCw size={20} />
                                  </button>
                                  <button
                                    onClick={() => handleRejectReserva(reserva.id)}
                                    disabled={actionLoading === reserva.id}
                                    className="p-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 hover:scale-105 disabled:bg-gray-100 disabled:text-gray-400 disabled:scale-100 transition-all"
                                    title="Rechazar reserva"
                                  >
                                    <XCircle size={20} />
                                  </button>
                                </div>
                              ) : reserva.estado === 'aprobada' ? (
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleCancelReserva(reserva.id)}
                                    disabled={actionLoading === reserva.id}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-red-100 text-red-600 text-sm font-medium rounded-xl hover:bg-red-200 hover:scale-105 disabled:bg-gray-100 disabled:text-gray-400 disabled:scale-100 transition-all"
                                    title="Cancelar reserva aprobada"
                                  >
                                    <Ban size={16} />
                                    Cancelar
                                  </button>
                                </div>
                              ) : (
                                <div className="flex justify-center">
                                  <span className="text-gray-400 text-sm px-4 py-2 bg-gray-50 rounded-lg">Sin acciones</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-gray-100">
                {filteredReservas.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No se encontraron reservas</p>
                      <p className="text-gray-400 text-sm mt-1">Intenta cambiar los filtros</p>
                    </div>
                  </div>
                ) : (
                  filteredReservas.map((reserva, index) => {
                    const status = statusConfig[reserva.estado] || statusConfig.pendiente
                    const StatusIcon = status.icon
                    const sportColor = sportColors[reserva.deporte] || sportColors.Fútbol
                    
                    return (
                      <div key={reserva.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-linear-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                              {reserva.userName?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{reserva.userName || 'Sin nombre'}</p>
                              <p className="text-sm text-gray-500">{reserva.chanchaName}</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${status.color}`}>
                            <StatusIcon size={14} />
                            {status.label}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 pl-15">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays size={14} className="text-gray-400" />
                            {reserva.fecha}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} className="text-gray-400" />
                            {reserva.hora}
                          </span>
                        </div>
                        
                        {reserva.estado === 'pendiente' && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => handleApproveReserva(reserva.id)}
                              disabled={actionLoading === reserva.id}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 disabled:bg-gray-300 transition-all"
                            >
                              <CheckCircle size={16} />
                              Aprobar
                            </button>
                            <button
                              onClick={() => setPostponeModal(reserva.id)}
                              disabled={actionLoading === reserva.id}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 disabled:bg-gray-50 transition-all"
                            >
                              <RefreshCw size={16} />
                              Posponer
                            </button>
                            <button
                              onClick={() => handleRejectReserva(reserva.id)}
                              disabled={actionLoading === reserva.id}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-100 text-red-600 text-sm font-medium rounded-xl hover:bg-red-200 disabled:bg-gray-100 transition-all"
                            >
                              <XCircle size={16} />
                              Rechazar
                            </button>
                          </div>
                        )}
                        {reserva.estado === 'aprobada' && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => handleCancelReserva(reserva.id)}
                              disabled={actionLoading === reserva.id}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-100 text-red-600 text-sm font-medium rounded-xl hover:bg-red-200 disabled:bg-gray-100 transition-all"
                            >
                              <Ban size={16} />
                              Cancelar reserva
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Usuarios Tab */}
        {activeTab === 'usuarios' && (
          <div className="space-y-6">
            {/* Search & Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                <div className="flex-1 relative w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o correo..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 focus:bg-white transition-all"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold flex items-center gap-2">
                    <Users size={16} />
                    {filteredUsers.length} usuarios
                  </span>
                </div>
              </div>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredUsers.length === 0 ? (
                <div className="col-span-full bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-semibold text-lg">No se encontraron usuarios</p>
                  <p className="text-gray-400 mt-1">Intenta cambiar los términos de búsqueda</p>
                </div>
              ) : (
                filteredUsers.map((user, index) => (
                  <div 
                    key={user.id} 
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Header con gradiente */}
                    <div className="relative h-20" style={{ background: 'linear-gradient(90deg, #1f2937, #111827)' }}>
                      <div className="absolute inset-0 bg-black/10" />
                      {user.isAdmin && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
                          <Shield size={12} />
                          Admin
                        </span>
                      )}
                    </div>
                    
                    {/* Avatar */}
                    <div className="relative -mt-10 px-5">
                      <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white overflow-hidden">
                        <div className="w-full h-full bg-linear-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-2xl">
                          {user.nombre?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div className="p-5 pt-3">
                      <h4 className="font-bold text-gray-900 text-lg">{user.nombre || 'Sin nombre'}</h4>
                      <p className="text-sm text-gray-500 truncate flex items-center gap-1.5 mt-1">
                        <Mail size={14} className="text-gray-400 flex-shrink-0" />
                        {user.email}
                      </p>
                      
                      {/* Stats Row */}
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <div className="text-center p-2 bg-amber-50 rounded-xl">
                          <div className="flex justify-center">{renderStars(user.estrellas || 5)}</div>
                          <p className="text-xs text-amber-600 font-medium mt-1">Rating</p>
                        </div>
                        <div className="text-center p-2 bg-gray-100 rounded-xl">
                          <p className="text-xl font-bold text-gray-900">{user.totalReservas || 0}</p>
                          <p className="text-xs text-gray-600 font-medium">Reservas</p>
                        </div>
                        <div className="text-center p-2 bg-red-50 rounded-xl">
                          <p className={`text-xl font-bold ${(user.noAsistencias || 0) > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                            {user.noAsistencias || 0}
                          </p>
                          <p className="text-xs text-red-600 font-medium">Faltas</p>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <button
                        onClick={() => handleViewUser(user)}
                        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all group-hover:shadow-lg"
                      >
                        <Eye size={18} />
                        Ver perfil completo
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Canchas Tab */}
        {activeTab === 'canchas' && (
          <div className="space-y-6">
            {/* Header con botón agregar */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Gestión de Canchas</h2>
              <button
                onClick={() => setAddCanchaModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-sm"
              >
                <Plus size={18} />
                Nueva Cancha
              </button>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {['all', 'active', 'disabled'].map(filter => (
                    <button
                      key={filter}
                      onClick={() => setCanchaFilter(filter)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                        canchaFilter === filter
                          ? filter === 'disabled' 
                            ? 'bg-red-100 text-red-700 border-2 border-red-300' 
                            : filter === 'active'
                              ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                              : 'bg-gray-900 text-white border-2 border-gray-900'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      {filter === 'all' ? (
                        <>
                          <MapPin size={16} />
                          Todas
                        </>
                      ) : filter === 'active' ? (
                        <>
                          <CheckCircle size={16} />
                          Activas
                        </>
                      ) : (
                        <>
                          <Ban size={16} />
                          Inhabilitadas
                        </>
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Basquetbol', 'Voleibol', 'Pádel', 'Fútbol'].map(deporte => {
                    const colors = sportColors[deporte]
                    return (
                      <button
                        key={deporte}
                        onClick={() => setCanchaFilter(canchaFilter === deporte ? 'all' : deporte)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                          canchaFilter === deporte
                            ? `${colors.bg} ${colors.text} border-2 ${colors.border}`
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border-2 border-transparent'
                        }`}
                      >
                        {sportIcons[deporte]}
                        {deporte}
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {/* Stats rápidas */}
              <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">Resumen:</span>
                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium flex items-center gap-1.5">
                  <MapPin size={14} />
                  {canchas.length} total
                </span>
                <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium flex items-center gap-1.5">
                  <CheckCircle size={14} />
                  {canchas.filter(c => !c.inhabilitada).length} activas
                </span>
                <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-1.5">
                  <Ban size={14} />
                  {canchas.filter(c => c.inhabilitada).length} inhabilitadas
                </span>
              </div>
            </div>

            {/* Canchas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredCanchas.length === 0 ? (
                <div className="col-span-full bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-semibold text-lg">No se encontraron canchas</p>
                  <p className="text-gray-400 mt-1">Intenta cambiar los filtros</p>
                </div>
              ) : (
                filteredCanchas.map((cancha, index) => {
                  const colors = sportColors[cancha.deporte] || sportColors.Fútbol
                  const isDisabled = cancha.inhabilitada
                  const disabledInfo = getDisabledInfo(cancha)
                  
                  return (
                    <div 
                      key={cancha.id} 
                      className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all duration-300 hover:shadow-lg ${
                        isDisabled ? 'border-red-200 bg-red-50/20' : 'border-gray-100 hover:border-emerald-200'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Header con color del deporte */}
                      <div className={`p-4 ${colors.bg} border-b-2 ${colors.border} relative`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm ${colors.text}`}>
                              {sportIcons[cancha.deporte] || sportIcons.Fútbol}
                            </div>
                            <div>
                              <span className={`font-bold text-lg ${colors.text}`}>{cancha.deporte}</span>
                              <p className="text-sm text-gray-600">{cancha.nombre}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                            isDisabled 
                              ? 'bg-red-500 text-white' 
                              : 'bg-emerald-500 text-white'
                          }`}>
                            {isDisabled ? '⛔ Inhabilitada' : '✓ Disponible'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-5">
                        {/* Info básica */}
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg">
                            <Users size={14} className="text-gray-500" />
                            Mín. {cancha.personasMinimas} personas
                          </span>
                          {cancha.orden && (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg">
                              #{cancha.orden}
                            </span>
                          )}
                        </div>
                        
                        {/* Info de inhabilitación mejorada */}
                        {isDisabled && disabledInfo && (
                          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                              <AlertTriangle size={18} className="text-red-600" />
                              <span className="font-semibold text-red-700">Estado de inhabilitación</span>
                            </div>
                            
                            {disabledInfo.horaInicio && (
                              <div className="flex items-center justify-between text-sm py-2 border-b border-red-100">
                                <span className="text-gray-600 flex items-center gap-2">
                                  <Clock size={14} />
                                  Desde:
                                </span>
                                <span className="font-semibold text-red-700">
                                  {disabledInfo.fechaInicio} a las {disabledInfo.horaInicio}
                                </span>
                              </div>
                            )}
                            
                            {disabledInfo.temporal && (
                              <>
                                <div className="flex items-center justify-between text-sm py-2 border-b border-red-100">
                                  <span className="text-gray-600 flex items-center gap-2">
                                    <Timer size={14} />
                                    Hasta:
                                  </span>
                                  <span className="font-semibold text-red-700">
                                    {disabledInfo.fechaFin} a las {disabledInfo.horaFin}
                                  </span>
                                </div>
                                <div className="flex items-center justify-center gap-2 mt-3 p-3 bg-amber-100 rounded-lg">
                                  <Clock size={16} className="text-amber-700 animate-pulse" />
                                  <span className="text-amber-800 font-bold">
                                    ⏱️ {disabledInfo.tiempoRestante} restantes
                                  </span>
                                </div>
                              </>
                            )}
                            
                            {disabledInfo.permanente && (
                              <div className="flex items-center justify-center gap-2 mt-2 p-3 bg-red-100 rounded-lg">
                                <Ban size={16} className="text-red-700" />
                                <span className="text-red-800 font-semibold">
                                  Inhabilitación permanente
                                </span>
                              </div>
                            )}
                            
                            {disabledInfo.expired && (
                              <div className="flex items-center justify-center gap-2 mt-2 p-3 bg-emerald-100 rounded-lg">
                                <CheckCircle size={16} className="text-emerald-700" />
                                <span className="text-emerald-800 font-semibold">
                                  ✓ Inhabilitación expirada
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Botones de acción */}
                        <div className="flex gap-2">
                          {isDisabled ? (
                            <button
                              onClick={() => handleEnableCancha(cancha.id)}
                              disabled={actionLoading === cancha.id}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                              <PlayCircle size={18} />
                              {actionLoading === cancha.id ? 'Habilitando...' : 'Habilitar'}
                            </button>
                          ) : (
                            <button
                              onClick={() => setDisableModal(cancha.id)}
                              disabled={actionLoading === cancha.id}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 border-2 border-red-200 rounded-xl font-semibold hover:bg-red-100 hover:border-red-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 transition-all"
                            >
                              <Ban size={18} />
                              Inhabilitar
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditCanchaModal(cancha)
                              setEditCancha({ nombre: cancha.nombre, deporte: cancha.deporte, personasMinimas: cancha.personasMinimas || 2 })
                            }}
                            disabled={actionLoading === cancha.id}
                            className="flex items-center justify-center gap-1 px-3 py-3 bg-gray-100 text-gray-500 rounded-xl hover:bg-blue-100 hover:text-blue-600 disabled:opacity-50 transition-all"
                            title="Editar cancha"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteCancha(cancha.id, cancha.nombre)}
                            disabled={actionLoading === cancha.id}
                            className="flex items-center justify-center gap-1 px-3 py-3 bg-gray-100 text-gray-500 rounded-xl hover:bg-red-100 hover:text-red-600 disabled:opacity-50 transition-all"
                            title="Eliminar cancha permanentemente"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Nueva Cancha */}
      {addCanchaModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
            <div className="p-6 text-white relative" style={{ background: 'linear-gradient(90deg, #111827, #065f46)' }}>
              <button
                onClick={() => { setAddCanchaModal(false); setNewCancha({ nombre: '', deporte: 'Basquetbol', personasMinimas: 2 }) }}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-all"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Plus className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Nueva Cancha</h3>
                  <p className="text-gray-300 text-sm">Agrega una cancha al sistema</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAddCancha} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nombre de la cancha
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cancha 1, Cancha Norte..."
                  value={newCancha.nombre}
                  onChange={(e) => setNewCancha({ ...newCancha, nombre: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-50 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Deporte
                </label>
                <select
                  value={newCancha.deporte}
                  onChange={(e) => setNewCancha({ ...newCancha, deporte: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-50 focus:bg-white cursor-pointer"
                >
                  <option value="Basquetbol">Basquetbol</option>
                  <option value="Voleibol">Voleibol</option>
                  <option value="Tenis">Tenis</option>
                  <option value="Pádel">Pádel</option>
                  <option value="Fútbol Soccer">Fútbol Soccer</option>
                  <option value="Fútbol Rápido">Fútbol Rápido</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Mínimo de personas
                </label>
                <input
                  type="number"
                  min="1"
                  max="22"
                  value={newCancha.personasMinimas}
                  onChange={(e) => setNewCancha({ ...newCancha, personasMinimas: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-50 focus:bg-white"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={addCanchaLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                >
                  {addCanchaLoading ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Guardando...</>
                  ) : (
                    <><Plus size={18} />Agregar Cancha</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setAddCanchaModal(false); setNewCancha({ nombre: '', deporte: 'Basquetbol', personasMinimas: 2 }) }}
                  className="flex-1 px-4 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Cancha */}
      {editCanchaModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
            <div className="p-6 text-white relative" style={{ background: 'linear-gradient(90deg, #111827, #1e40af)' }}>
              <button
                onClick={() => setEditCanchaModal(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-all"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Pencil className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Editar Cancha</h3>
                  <p className="text-blue-200 text-sm">{editCanchaModal.nombre}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleEditCancha} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nombre de la cancha
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cancha 1, Cancha Norte..."
                  value={editCancha.nombre}
                  onChange={(e) => setEditCancha({ ...editCancha, nombre: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Deporte
                </label>
                <select
                  value={editCancha.deporte}
                  onChange={(e) => setEditCancha({ ...editCancha, deporte: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white cursor-pointer"
                >
                  <option value="Basquetbol">Basquetbol</option>
                  <option value="Voleibol">Voleibol</option>
                  <option value="Tenis">Tenis</option>
                  <option value="Pádel">Pádel</option>
                  <option value="Fútbol Soccer">Fútbol Soccer</option>
                  <option value="Fútbol Rápido">Fútbol Rápido</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Mínimo de personas
                </label>
                <input
                  type="number"
                  min="1"
                  max="22"
                  value={editCancha.personasMinimas}
                  onChange={(e) => setEditCancha({ ...editCancha, personasMinimas: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={editCanchaLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                >
                  {editCanchaLoading ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Guardando...</>
                  ) : (
                    <><Pencil size={18} />Guardar Cambios</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setEditCanchaModal(null)}
                  className="flex-1 px-4 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Posponer Reserva - Mejorado */}
      {postponeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
            {/* Header */}
            <div className="p-6 text-white relative" style={{ background: 'linear-gradient(90deg, #1f2937, #111827)' }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <button
                onClick={() => setPostponeModal(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-all"
              >
                <X size={18} />
              </button>
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <RefreshCw className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Posponer Reserva</h3>
                  <p className="text-gray-300 text-sm">Selecciona nueva fecha y hora</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <CalendarDays size={16} className="text-emerald-600" />
                  Nueva Fecha
                </label>
                <input
                  type="date"
                  value={postponeData.fecha}
                  onChange={(e) => setPostponeData({ ...postponeData, fecha: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Clock size={16} className="text-emerald-600" />
                  Nueva Hora
                </label>
                <select
                  value={postponeData.hora}
                  onChange={(e) => setPostponeData({ ...postponeData, hora: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-50 focus:bg-white cursor-pointer"
                >
                  <option value="">Selecciona una hora</option>
                  {Array.from({ length: 17 }, (_, i) => 5 + i).map(hour => (
                    <option key={hour} value={`${hour}:00`}>{hour}:00 hrs</option>
                  ))}
                </select>
              </div>
              
              {/* Preview */}
              {postponeData.fecha && postponeData.hora && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-sm text-emerald-700 font-medium flex items-center gap-2">
                    <CheckCircle size={16} />
                    Nueva programación:
                  </p>
                  <p className="text-emerald-900 font-bold text-lg mt-1">
                    {new Date(postponeData.fecha + 'T12:00:00').toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} a las {postponeData.hora}
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={handlePostponeReserva}
                disabled={actionLoading === postponeModal || !postponeData.fecha || !postponeData.hora}
                className="flex-1 px-4 py-3.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-400"
              >
                {actionLoading === postponeModal ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Confirmar
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setPostponeModal(null)
                  setPostponeData({ fecha: '', hora: '' })
                }}
                className="flex-1 px-4 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Inhabilitar Cancha - Mejorado */}
      {disableModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-slideUp">
            {/* Header */}
            <div className="p-6 text-white relative" style={{ background: 'linear-gradient(90deg, #ef4444, #e11d48)' }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <button
                onClick={() => {
                  setDisableModal(null)
                  setDisableTime('')
                  setDisableDate('')
                  setDisableStartHour('')
                  setDisableType('time')
                  setDisableDateType('fullDay')
                }}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-all z-10"
              >
                <X size={18} />
              </button>
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Ban className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Inhabilitar Cancha</h3>
                  <p className="text-red-100 text-sm">Configura el tiempo de inhabilitación</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-5">
              {/* Tipo de inhabilitación */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Timer size={16} className="text-red-600" />
                  Tipo de Inhabilitación
                </label>
                <div className="grid grid-cols-1 gap-2 mt-3">
                  {[
                    { value: 'time', label: 'Por duración específica', icon: Clock, desc: 'Especifica minutos u horas' },
                    { value: 'fullDay', label: 'Resto del día', icon: CalendarDays, desc: 'Hasta medianoche' },
                    { value: 'date', label: 'Hasta fecha específica', icon: Calendar, desc: 'Selecciona una fecha' }
                  ].map(option => (
                    <label 
                      key={option.value} 
                      className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                        disableType === option.value 
                          ? 'bg-red-50 border-red-300' 
                          : 'bg-gray-50 border-gray-100 hover:bg-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        value={option.value}
                        checked={disableType === option.value}
                        onChange={(e) => {
                          setDisableType(e.target.value)
                          setDisableTime('')
                          setDisableDate('')
                          setDisableStartHour('')
                        }}
                        className="w-5 h-5 text-red-600 focus:ring-red-500"
                      />
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        disableType === option.value ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-500'
                      }`}>
                        <option.icon size={20} />
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-gray-900">{option.label}</span>
                        <p className="text-xs text-gray-500">{option.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Opciones según tipo seleccionado */}
              {disableType === 'time' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Clock size={16} className="text-gray-500" />
                      Hora de inicio (opcional)
                    </label>
                    <input
                      type="time"
                      value={disableStartHour}
                      onChange={(e) => setDisableStartHour(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <AlertTriangle size={12} />
                      {disableStartHour 
                        ? `Iniciará a las ${disableStartHour}` 
                        : 'Dejar vacío para iniciar inmediatamente'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Timer size={16} className="text-gray-500" />
                      Duración (minutos)
                    </label>
                    <input
                      type="number"
                      value={disableTime}
                      onChange={(e) => setDisableTime(e.target.value)}
                      placeholder="Ej: 60, 120, 180..."
                      min="1"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white transition-all"
                    />
                    {/* Botones de acceso rápido */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {[30, 60, 120, 180, 240].map(mins => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setDisableTime(mins.toString())}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            disableTime === mins.toString()
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {mins < 60 ? `${mins}min` : `${mins/60}h`}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Preview */}
                  {disableTime && (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                      <p className="text-sm text-red-700 font-bold mb-2 flex items-center gap-2">
                        <AlertTriangle size={16} />
                        Resumen de inhabilitación:
                      </p>
                      <div className="space-y-1 text-sm text-red-600">
                        <p>⏰ Inicia: <span className="font-semibold">{disableStartHour ? `Hoy a las ${disableStartHour}` : 'Inmediatamente'}</span></p>
                        <p>⏱️ Duración: <span className="font-semibold">{disableTime} minutos ({Math.floor(disableTime/60)}h {disableTime%60}min)</span></p>
                        <p>🏁 Termina: <span className="font-semibold">{(() => {
                          const now = new Date()
                          let startTime = now
                          if (disableStartHour) {
                            const [h, m] = disableStartHour.split(':').map(Number)
                            startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0)
                            if (startTime < now) startTime = now
                          }
                          const endTime = new Date(startTime.getTime() + parseInt(disableTime) * 60000)
                          return endTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
                        })()}</span></p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {disableType === 'fullDay' && (
                <div className="p-5 bg-amber-50 border-2 border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CalendarDays size={20} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-amber-800">Inhabilitación hasta medianoche</p>
                      <p className="text-sm text-amber-700 mt-1">
                        La cancha estará inhabilitada desde ahora hasta las 00:00 hrs de mañana.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {disableType === 'date' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Calendar size={16} className="text-gray-500" />
                      Hasta qué fecha
                    </label>
                    <input
                      type="date"
                      value={disableDate}
                      onChange={(e) => setDisableDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Timer size={16} className="text-gray-500" />
                      Opciones de tiempo
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'fullDay', label: 'Todo el día', icon: CalendarDays },
                        { value: 'withTime', label: 'Duración específica', icon: Clock }
                      ].map(option => (
                        <label 
                          key={option.value} 
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 ${
                            disableDateType === option.value 
                              ? 'bg-red-50 border-red-300' 
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            value={option.value}
                            checked={disableDateType === option.value}
                            onChange={(e) => setDisableDateType(e.target.value)}
                            className="w-4 h-4 text-red-600 focus:ring-red-500"
                          />
                          <option.icon size={18} className={disableDateType === option.value ? 'text-red-600' : 'text-gray-400'} />
                          <span className="text-sm font-medium text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {disableDateType === 'withTime' && (
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Clock size={16} className="text-gray-500" />
                          Hora de inicio (opcional)
                        </label>
                        <input
                          type="time"
                          value={disableStartHour}
                          onChange={(e) => setDisableStartHour(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Timer size={16} className="text-gray-500" />
                          Duración (minutos)
                        </label>
                        <input
                          type="number"
                          value={disableTime}
                          onChange={(e) => setDisableTime(e.target.value)}
                          placeholder="Ej: 60"
                          min="1"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white transition-all"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-6 pt-0 flex gap-3 border-t border-gray-100 bg-gray-50">
              <button
                onClick={handleDisableCancha}
                disabled={actionLoading === disableModal}
                className="flex-1 px-4 py-3.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200"
              >
                {actionLoading === disableModal ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Ban size={18} />
                    Inhabilitar Cancha
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setDisableModal(null)
                  setDisableTime('')
                  setDisableDate('')
                  setDisableStartHour('')
                  setDisableType('time')
                  setDisableDateType('fullDay')
                }}
                className="flex-1 px-4 py-3.5 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver Usuario - Mejorado */}
      {userModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
            {/* Header con gradiente */}
            <div className="relative p-6 text-white" style={{ background: 'linear-gradient(90deg, #1f2937, #111827)' }}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <button
                onClick={() => {
                  setUserModal(null)
                  setUserReservas([])
                }}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-all z-10"
              >
                <X size={20} />
              </button>
              
              <div className="relative z-10 flex items-center gap-5">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg border border-white/30">
                  {userModal.nombre?.charAt(0)?.toUpperCase() || userModal.email?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{userModal.nombre || 'Sin nombre'}</h3>
                  <p className="text-gray-300 flex items-center gap-2 mt-1">
                    <Mail size={16} />
                    {userModal.email}
                  </p>
                  {userModal.isAdmin && (
                    <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-emerald-600/80 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                      <Shield size={12} />
                      Administrador
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-2xl p-5 text-center border border-amber-100 hover:shadow-md transition-all">
                  <div className="flex justify-center mb-3">
                    {renderStars(userModal.estrellas || 5, true, userModal.id)}
                  </div>
                  <p className="text-sm text-amber-600 font-semibold">Rating</p>
                  <p className="text-xs text-gray-500 mt-1">(Click para editar)</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-5 text-center border border-gray-200 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CalendarCheck className="w-6 h-6 text-gray-700" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{userModal.totalReservas || 0}</p>
                  <p className="text-sm text-gray-600 font-medium">Reservas</p>
                </div>
                <div className="bg-linear-to-br from-red-50 to-rose-50 rounded-2xl p-5 text-center border border-red-100 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <UserX className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-3xl font-bold text-red-700">{userModal.noAsistencias || 0}</p>
                  <p className="text-sm text-red-600 font-medium">No asistencias</p>
                </div>
              </div>
              
              {/* User Info Card */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-emerald-600" />
                  Información del Usuario
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Phone size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Teléfono</p>
                      <p className="font-medium text-gray-900">{userModal.telefono || 'No registrado'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <CreditCard size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Carnet</p>
                      <p className="font-medium text-gray-900">{userModal.carnet || 'No registrado'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <GraduationCap size={18} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Carrera</p>
                      <p className="font-medium text-gray-900">{userModal.carrera || 'No registrada'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Calendar size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Registro</p>
                      <p className="font-medium text-gray-900">
                        {userModal.createdAt?.toDate?.()?.toLocaleDateString('es-ES', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) || 'No disponible'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Historial de Reservas */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gray-50">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <Calendar size={18} className="text-emerald-600" />
                    Historial de Reservas
                    {userReservas.length > 0 && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-semibold">
                        {userReservas.length}
                      </span>
                    )}
                  </h4>
                </div>
                
                {loadingUserReservas ? (
                  <div className="text-center py-12">
                    <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-gray-500">Cargando reservas...</p>
                  </div>
                ) : userReservas.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">Sin reservas</p>
                    <p className="text-sm text-gray-400">Este usuario no tiene reservas registradas</p>
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto">
                    <div className="divide-y divide-gray-100">
                      {userReservas.map((reserva, index) => {
                        const status = statusConfig[reserva.estado] || statusConfig.pendiente
                        const StatusIcon = status.icon
                        const sportColor = sportColors[reserva.deporte] || sportColors.Fútbol
                        
                        return (
                          <div 
                            key={reserva.id} 
                            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-11 h-11 ${sportColor.bg} rounded-xl flex items-center justify-center ${sportColor.text}`}>
                                {sportIcons[reserva.deporte] || sportIcons.Fútbol}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{reserva.chanchaName}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                  <CalendarDays size={14} />
                                  {reserva.fecha}
                                  <span className="text-gray-300">|</span>
                                  <Clock size={14} />
                                  {reserva.hora}
                                </p>
                              </div>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${status.color}`}>
                              <StatusIcon size={14} />
                              {status.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-5 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => {
                  setUserModal(null)
                  setUserReservas([])
                }}
                className="w-full px-4 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
              >
                <X size={18} />
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
