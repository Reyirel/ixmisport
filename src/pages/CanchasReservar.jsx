import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getAllCanchas,
  isCanchaAvailable,
  addReserva,
  incrementUserReservas,
  getUserReservas,
  getCancha,
  updateReservaStatus,
} from '../services/firestoreService'
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2,
  Star,
  Trophy,
  Activity,
  ChevronRight,
  Download,
  FileText,
  Ban
} from 'lucide-react'
import jsPDF from 'jspdf'

// Función para calcular tiempo restante de inhabilitación
const getDisabledInfo = (cancha) => {
  if (!cancha.inhabilitada) return null

  const now = new Date()
  
  // Hora de inicio de la inhabilitación
  const inhabilitadaEn = cancha.inhabilitadaEn?.toDate?.() || null
  const horaInicio = inhabilitadaEn 
    ? inhabilitadaEn.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    : null

  // Si hay fecha de finalización
  if (cancha.inhabilitadaHasta) {
    const inhabilitadaHasta = cancha.inhabilitadaHasta.toDate?.() || null
    if (inhabilitadaHasta) {
      const diff = inhabilitadaHasta - now
      if (diff <= 0) {
        return { expired: true, horaInicio }
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
      
      return {
        temporal: true,
        horaInicio,
        horaFin,
        tiempoRestante,
        minutosRestantes
      }
    }
  }
  
  // Inhabilitación permanente
  return {
    permanente: true,
    horaInicio
  }
}

// Iconos SVG personalizados para cada deporte
const BasketballIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M4.93 4.93l14.14 14.14"/>
    <path d="M19.07 4.93L4.93 19.07"/>
    <path d="M12 2c2.76 0 5 4.48 5 10s-2.24 10-5 10"/>
    <path d="M12 2c-2.76 0-5 4.48-5 10s2.24 10 5 10"/>
  </svg>
)

const VolleyballIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2c3 3 4.5 7 4.5 10"/>
    <path d="M12 2c-3 3-4.5 7-4.5 10"/>
    <path d="M2.5 9c3 1 7 1.5 9.5 1.5s6.5-.5 9.5-1.5"/>
    <path d="M12 12v10"/>
  </svg>
)

const PadelIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="8" rx="6" ry="6"/>
    <path d="M12 14v8"/>
    <path d="M9 22h6"/>
    <circle cx="10" cy="7" r="1" fill="currentColor"/>
    <circle cx="14" cy="7" r="1" fill="currentColor"/>
    <circle cx="12" cy="10" r="1" fill="currentColor"/>
  </svg>
)

const SoccerIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2l2 4-2 2-2-2 2-4z"/>
    <path d="M22 12l-4 2-2-2 2-2 4 2z"/>
    <path d="M12 22l-2-4 2-2 2 2-2 4z"/>
    <path d="M2 12l4-2 2 2-2 2-4-2z"/>
    <path d="M12 8l2 2v4l-2 2-2-2v-4l2-2z"/>
  </svg>
)

const TennisIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2c-2.5 2.5-4 6-4 10s1.5 7.5 4 10"/>
    <path d="M12 2c2.5 2.5 4 6 4 10s-1.5 7.5-4 10"/>
    <path d="M2 12h20"/>
  </svg>
)

export default function CanchasReservar() {
  const { currentUser, userData } = useAuth()
  const [canchas, setCanchas] = useState([])
  const [userReservas, setUserReservas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedCancha, setSelectedCancha] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [cantidadPersonas, setCantidadPersonas] = useState(1)
  const [loading2, setLoading2] = useState(false)
  const [lastReserva, setLastReserva] = useState(null)

  useEffect(() => {
    loadCanchas()
    if (currentUser) {
      loadUserReservas()
    }
    
    const interval = setInterval(loadCanchas, 30000)
    return () => clearInterval(interval)
  }, [currentUser])

  const loadCanchas = async () => {
    try {
      setLoading(true)
      const data = await getAllCanchas()
      const sorted = data.sort((a, b) => {
        const deporteOrder = { 'Basquetbol': 1, 'Voleibol': 2, 'Tenis': 3, 'Pádel': 4, 'Fútbol Soccer': 5, 'Fútbol Rápido': 6, 'Fútbol': 5 }
        const orderA = deporteOrder[a.deporte] || 99
        const orderB = deporteOrder[b.deporte] || 99
        if (orderA !== orderB) return orderA - orderB
        return a.nombre.localeCompare(b.nombre)
      })
      setCanchas(sorted)
    } catch (err) {
      setError('Error al cargar canchas: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadUserReservas = async () => {
    try {
      const reservas = await getUserReservas(currentUser.uid)
      setUserReservas(reservas)
    } catch (err) {
      console.error('Error al cargar reservas:', err)
    }
  }

  const generatePDF = (reservaData) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    
    const emerald600 = [5, 150, 105]
    const emerald100 = [209, 250, 229]
    const gray900 = [17, 24, 39]
    const gray500 = [107, 114, 128]
    
    doc.setFillColor(...emerald600)
    doc.rect(0, 0, pageWidth, 45, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.text('ixmisport', pageWidth / 2, 22, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Comprobante de Reserva', pageWidth / 2, 35, { align: 'center' })
    
    doc.setFillColor(...emerald100)
    doc.rect(0, 45, pageWidth, 3, 'F')
    
    let y = 65
    
    doc.setTextColor(...gray900)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Detalles de tu Reserva', 20, y)
    
    y += 15
    doc.setDrawColor(...emerald600)
    doc.setLineWidth(0.5)
    doc.line(20, y, pageWidth - 20, y)
    
    y += 15
    
    const datos = [
      ['Cancha:', reservaData.chanchaName],
      ['Deporte:', reservaData.deporte],
      ['Fecha:', new Date(reservaData.fecha).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })],
      ['Hora:', reservaData.hora + ' hrs'],
      ['Personas:', reservaData.cantidadPersonas + ' jugadores'],
      ['Reservado por:', reservaData.userName],
      ['Estado:', 'Pendiente de aprobación'],
    ]
    
    datos.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(...gray500)
      doc.text(label, 25, y)
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(12)
      doc.setTextColor(...gray900)
      doc.text(value, 75, y)
      
      y += 12
    })
    
    y += 10
    doc.setFillColor(...emerald100)
    doc.roundedRect(20, y - 5, pageWidth - 40, 25, 3, 3, 'F')
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...emerald600)
    doc.text('ID de Reserva:', pageWidth / 2, y + 5, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setTextColor(...gray900)
    doc.text(reservaData.id || 'Pendiente', pageWidth / 2, y + 15, { align: 'center' })
    
    y += 40
    doc.setFillColor(254, 243, 199)
    doc.roundedRect(20, y, pageWidth - 40, 45, 3, 3, 'F')
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(180, 83, 9)
    doc.text('Importante:', 25, y + 12)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const notas = [
      '- Tu reserva esta pendiente de aprobacion por el administrador.',
      '- Debes confirmar tu asistencia a la hora exacta de la reserva.',
      '- Si no asistes despues de confirmar, se restara una estrella.',
      '- Horario de canchas: 5:00 AM - 10:00 PM'
    ]
    notas.forEach((nota, i) => {
      doc.text(nota, 25, y + 22 + (i * 6))
    })
    
    y = 270
    doc.setDrawColor(...emerald600)
    doc.setLineWidth(0.5)
    doc.line(20, y, pageWidth - 20, y)
    
    doc.setFontSize(9)
    doc.setTextColor(...gray500)
    doc.text('Generado el ' + new Date().toLocaleString('es-MX'), pageWidth / 2, y + 10, { align: 'center' })
    doc.text('ixmisport - Sistema de Reservas Deportivas', pageWidth / 2, y + 18, { align: 'center' })
    
    doc.save('reserva-' + reservaData.deporte.toLowerCase() + '-' + reservaData.fecha + '.pdf')
  }

  const handleReserva = async (e) => {
    e.preventDefault()
    if (!selectedCancha || !selectedDate || !selectedTime || cantidadPersonas < 1) {
      setError('Por favor completa todos los campos')
      return
    }

    if (cantidadPersonas < selectedCancha.personasMinimas) {
      setError('Se requieren al menos ' + selectedCancha.personasMinimas + ' personas para jugar ' + selectedCancha.deporte)
      return
    }

    const [hora] = selectedTime.split(':').map(Number)
    if (hora < 5 || hora >= 22) {
      setError('Las reservas solo se pueden hacer entre las 5:00 AM y las 10:00 PM')
      return
    }

    setLoading2(true)
    setError('')
    setSuccess('')

    try {
      const chanchaActual = await getCancha(selectedCancha.id)
      if (!chanchaActual) {
        setError('La cancha no existe')
        setLoading2(false)
        return
      }

      if (chanchaActual.inhabilitada) {
        setError('La cancha esta inhabilitada y no esta disponible para reservas')
        setLoading2(false)
        return
      }

      const available = await isCanchaAvailable(selectedCancha.id, selectedDate, selectedTime)
      if (!available) {
        setError('La cancha no esta disponible en ese horario. Intenta con otro horario.')
        setLoading2(false)
        return
      }

      const reservaData = {
        userId: currentUser.uid,
        userName: userData?.nombre || 'Usuario',
        chanchaId: selectedCancha.id,
        chanchaName: selectedCancha.nombre,
        deporte: selectedCancha.deporte,
        fecha: selectedDate,
        hora: selectedTime,
        fechaHora: new Date(selectedDate + 'T' + selectedTime).toISOString(),
        precio: selectedCancha.precio,
        cantidadPersonas: cantidadPersonas,
        personasConfirmadas: 1,
      }

      const reservaId = await addReserva(reservaData)
      await incrementUserReservas(currentUser.uid)

      setLastReserva({ ...reservaData, id: reservaId })
      generatePDF({ ...reservaData, id: reservaId })

      setSuccess('Reserva creada correctamente. Se ha descargado tu comprobante.')
      setSelectedCancha(null)
      setSelectedDate('')
      setSelectedTime('')
      setCantidadPersonas(1)
      
      await loadUserReservas()
    } catch (err) {
      setError('Error al crear reserva: ' + err.message)
    } finally {
      setLoading2(false)
    }
  }

  const getDeporteIcon = (deporte, className = "w-6 h-6") => {
    switch (deporte) {
      case 'Basquetbol': return <BasketballIcon className={className} />
      case 'Voleibol': return <VolleyballIcon className={className} />
      case 'Pádel': return <PadelIcon className={className} />
      case 'Tenis': return <TennisIcon className={className} />
      case 'Fútbol Soccer': return <SoccerIcon className={className} />
      case 'Fútbol Rápido': return <SoccerIcon className={className} />
      case 'Fútbol': return <SoccerIcon className={className} />
      default: return <Activity className={className} />
    }
  }

  const getDeporteColor = (deporte) => {
    switch (deporte) {
      case 'Basquetbol': return { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' }
      case 'Voleibol': return { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' }
      case 'Pádel': return { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200' }
      case 'Tenis': return { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-200' }
      case 'Fútbol Soccer': return { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' }
      case 'Fútbol Rápido': return { bg: 'bg-lime-100', text: 'text-lime-700', border: 'border-lime-200' }
      case 'Fútbol': return { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' }
      default: return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' }
    }
  }

  const canchasPorDeporte = canchas.reduce((acc, cancha) => {
    if (!acc[cancha.deporte]) {
      acc[cancha.deporte] = []
    }
    acc[cancha.deporte].push(cancha)
    return acc
  }, {})

  const getEstadoStyle = (estado) => {
    switch (estado) {
      case 'aprobada': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'pendiente': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'rechazada': return 'bg-red-50 text-red-700 border-red-200'
      case 'cancelada': return 'bg-gray-50 text-gray-700 border-gray-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-16">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Cargando canchas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Reservar Canchas
            </h1>
          </div>
          <p className="text-gray-500 ml-13">
            Selecciona una cancha, elige tu horario y descarga tu comprobante
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-emerald-600">{success}</p>
                  {lastReserva && (
                    <button
                      onClick={() => generatePDF(lastReserva)}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Descargar comprobante nuevamente
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  Canchas Disponibles
                </h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {canchas.filter(c => !c.inhabilitada).length} disponibles
                </span>
              </div>

              <div className="space-y-8">
                {Object.entries(canchasPorDeporte).map(([deporte, canchasDeporte]) => {
                  const colors = getDeporteColor(deporte)
                  return (
                    <div key={deporte}>
                      <div className={'flex items-center gap-3 mb-4 pb-3 border-b ' + colors.border}>
                        <div className={'w-10 h-10 rounded-lg flex items-center justify-center ' + colors.bg + ' ' + colors.text}>
                          {getDeporteIcon(deporte, "w-5 h-5")}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{deporte}</h3>
                          <p className="text-xs text-gray-500">
                            {canchasDeporte.length} cancha{canchasDeporte.length !== 1 ? 's' : ''} - Min. {canchasDeporte[0]?.personasMinimas} personas
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {canchasDeporte.map((cancha) => {
                          const disabledInfo = getDisabledInfo(cancha)
                          return (
                            <div
                              key={cancha.id}
                              onClick={() => !cancha.inhabilitada && setSelectedCancha(cancha)}
                              className={'relative p-4 rounded-xl border-2 transition-all duration-300 ' + (
                                cancha.inhabilitada
                                  ? 'border-red-200 bg-red-50/50 cursor-not-allowed'
                                  : selectedCancha?.id === cancha.id
                                  ? colors.border + ' ' + colors.bg + ' shadow-md cursor-pointer'
                                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm hover:bg-gray-50 cursor-pointer'
                              )}
                            >
                              <div className="text-center">
                                <div className={'w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center ' + (
                                  cancha.inhabilitada 
                                    ? 'bg-red-100 text-red-400'
                                    : selectedCancha?.id === cancha.id 
                                    ? colors.bg + ' ' + colors.text 
                                    : 'bg-gray-100 text-gray-400'
                                )}>
                                  {cancha.inhabilitada ? <Ban className="w-5 h-5" /> : getDeporteIcon(deporte, "w-5 h-5")}
                                </div>
                                <p className={'font-semibold text-sm ' + (cancha.inhabilitada ? 'text-gray-500' : 'text-gray-900')}>
                                  {cancha.nombre.split(' - ')[0]}
                                </p>
                                {cancha.inhabilitada && disabledInfo ? (
                                  <div className="mt-2 space-y-1">
                                    <div className="flex items-center justify-center gap-1 text-xs text-red-600 font-medium">
                                      <XCircle className="w-3 h-3" />
                                      No disponible
                                    </div>
                                    {disabledInfo.horaInicio && (
                                      <div className="text-xs text-gray-500">
                                        Desde: <span className="font-medium text-gray-700">{disabledInfo.horaInicio}</span>
                                      </div>
                                    )}
                                    {disabledInfo.temporal && (
                                      <div className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full inline-block">
                                        <Clock className="w-3 h-3 inline mr-1" />
                                        {disabledInfo.tiempoRestante} restantes
                                      </div>
                                    )}
                                    {disabledInfo.temporal && disabledInfo.horaFin && (
                                      <div className="text-xs text-gray-500">
                                        Hasta: <span className="font-medium text-gray-700">{disabledInfo.horaFin}</span>
                                      </div>
                                    )}
                                    {disabledInfo.permanente && (
                                      <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full inline-block">
                                        Inhabilitada
                                      </div>
                                    )}
                                  </div>
                                ) : selectedCancha?.id === cancha.id ? (
                                  <span className={'inline-block mt-1 text-xs font-medium ' + colors.text}>
                                    Seleccionada
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 mt-1 text-xs text-emerald-600">
                                    <CheckCircle className="w-3 h-3" />
                                    Gratis
                                  </span>
                                )}
                              </div>

                              {cancha.inhabilitada && disabledInfo && (
                                <div className="absolute top-0 left-0 w-full h-full rounded-xl bg-gray-50 bg-opacity-80 flex flex-col items-center justify-center p-2">
                                  {disabledInfo.temporal ? (
                                    <>
                                      <p className="text-xs text-gray-500 mb-1">
                                        Inhabilitada hasta:
                                      </p>
                                      <p className="text-sm font-semibold text-gray-900">
                                        {disabledInfo.horaFin}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {disabledInfo.tiempoRestante} restantes
                                      </p>
                                    </>
                                  ) : (
                                    <>
                                      <p className="text-xs text-gray-500 mb-1">
                                        Inhabilitación permanente
                                      </p>
                                      <p className="text-sm font-semibold text-gray-900">
                                        {disabledInfo.horaInicio}
                                      </p>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  Mis Reservas
                </h2>
                {userReservas.length > 0 && (
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {userReservas.length} reserva{userReservas.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              {userReservas.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No tienes reservas aun</p>
                  <p className="text-sm text-gray-400 mt-1">Haz tu primera reserva ahora</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userReservas.map((reserva) => {
                    const colors = getDeporteColor(reserva.deporte)
                    return (
                      <div 
                        key={reserva.id} 
                        className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={'w-10 h-10 rounded-lg flex items-center justify-center ' + colors.bg + ' ' + colors.text}>
                              {getDeporteIcon(reserva.deporte, "w-5 h-5")}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{reserva.chanchaName}</h4>
                              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {reserva.fecha ? reserva.fecha.split('-').reverse().join('/') : ''}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {reserva.hora}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className={'text-xs font-semibold px-2.5 py-1 rounded-full border ' + getEstadoStyle(reserva.estado)}>
                            {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {userData?.nombre?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{userData?.nombre || 'Usuario'}</h3>
                  <p className="text-sm text-gray-500">{userData?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                    {[...Array(userData?.estrellas || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-amber-700 font-medium">Estrellas</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Trophy className="w-5 h-5 text-emerald-500" />
                    <span className="text-xl font-bold text-emerald-700">{userData?.totalReservas || 0}</span>
                  </div>
                  <p className="text-xs text-emerald-700 font-medium">Reservas</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 text-emerald-600" />
                  Nueva Reserva
                </h3>

                <form onSubmit={handleReserva} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Cancha
                    </label>
                    <div className={'p-3 rounded-xl border-2 transition-colors ' + (
                      selectedCancha 
                        ? getDeporteColor(selectedCancha.deporte).bg + ' ' + getDeporteColor(selectedCancha.deporte).border 
                        : 'bg-gray-50 border-gray-200'
                    )}>
                      {selectedCancha ? (
                        <div className="flex items-center gap-2">
                          <div className={getDeporteColor(selectedCancha.deporte).text}>
                            {getDeporteIcon(selectedCancha.deporte, "w-5 h-5")}
                          </div>
                          <span className="font-medium text-gray-900">{selectedCancha.nombre}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Selecciona una cancha arriba</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Calendar className="w-4 h-4 inline mr-1.5 text-gray-400" />
                      Fecha
                    </label>
                    <input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Clock className="w-4 h-4 inline mr-1.5 text-gray-400" />
                      Hora (5:00 AM - 10:00 PM)
                    </label>
                    <input
                      id="time"
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      min="05:00"
                      max="21:59"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="personas" className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Users className="w-4 h-4 inline mr-1.5 text-gray-400" />
                      Personas
                    </label>
                    <input
                      id="personas"
                      type="number"
                      min="1"
                      max="22"
                      value={cantidadPersonas}
                      onChange={(e) => setCantidadPersonas(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      required
                    />
                    {selectedCancha && (
                      <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Minimo requerido: {selectedCancha.personasMinimas} personas
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading2 || !selectedCancha}
                    className="group w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-xl font-semibold text-base hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-emerald-200"
                  >
                    {loading2 ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Creando reserva...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        <span>Reservar y Descargar PDF</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <p className="text-xs text-amber-700 leading-relaxed">
                    <strong>Importante:</strong> Al reservar se descargara automaticamente tu comprobante en PDF. 
                    Tu reserva estara pendiente hasta que el administrador la apruebe.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
