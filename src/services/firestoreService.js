import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  setDoc,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'

// ============ RESERVAS ============

// Agregar una reserva
export const addReserva = async (reservaData) => {
  try {
    const docRef = await addDoc(collection(db, 'reservas'), {
      ...reservaData,
      estado: 'pendiente', // pendiente, aprobada, rechazada, cancelada, pospuesta, no-asistió
      createdAt: Timestamp.now(),
    })
    return docRef.id
  } catch (error) {
    throw error
  }
}

// Obtener todas las reservas
export const getAllReservas = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'reservas'))
    const reservas = []
    querySnapshot.forEach((doc) => {
      reservas.push({ id: doc.id, ...doc.data() })
    })
    return reservas
  } catch (error) {
    throw error
  }
}

// Obtener reservas de un usuario
export const getUserReservas = async (userId) => {
  try {
    const q = query(collection(db, 'reservas'), where('userId', '==', userId))
    const querySnapshot = await getDocs(q)
    const reservas = []
    querySnapshot.forEach((doc) => {
      reservas.push({ id: doc.id, ...doc.data() })
    })
    return reservas
  } catch (error) {
    throw error
  }
}

// Obtener una reserva específica
export const getReserva = async (reservaId) => {
  try {
    const docRef = doc(db, 'reservas', reservaId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }
    } else {
      return null
    }
  } catch (error) {
    throw error
  }
}

// Actualizar estado de una reserva
export const updateReservaStatus = async (reservaId, nuevoEstado, razon = '') => {
  try {
    const docRef = doc(db, 'reservas', reservaId)
    const updateData = {
      estado: nuevoEstado,
      updatedAt: Timestamp.now(),
    }
    if (razon) {
      updateData.razon = razon
    }
    await updateDoc(docRef, updateData)
  } catch (error) {
    throw error
  }
}

// Posponer una reserva
export const postponeReserva = async (reservaId, newDate, newTime) => {
  try {
    const docRef = doc(db, 'reservas', reservaId)
    await updateDoc(docRef, {
      fecha: newDate,
      hora: newTime,
      estado: 'aprobada',
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    throw error
  }
}

// Verificar si hubo no-asistencia (pasaron más de 10 minutos)
export const checkNoShow = async (reservaId) => {
  try {
    const reserva = await getReserva(reservaId)
    if (!reserva) return false

    const reservaTime = new Date(reserva.fechaHora)
    const currentTime = new Date()
    const diffMinutes = (currentTime - reservaTime) / (1000 * 60)

    if (diffMinutes > 10 && reserva.estado === 'aprobada') {
      // Marcar como no asistió
      await updateReservaStatus(reservaId, 'no-asistió')
      
      // Restar estrella al usuario
      await decreaseUserRating(reserva.userId)
      return true
    }
    return false
  } catch (error) {
    throw error
  }
}

// ============ CANCHAS ============

// Las canchas son gestionadas exclusivamente por el administrador desde el panel
export const initializeCanchas = async () => {}

// Agregar una cancha
export const addCancha = async (chanchaData) => {
  try {
    const docRef = await addDoc(collection(db, 'canchas'), {
      ...chanchaData,
      createdAt: Timestamp.now(),
    })
    return docRef.id
  } catch (error) {
    throw error
  }
}

// Obtener todas las canchas
export const getAllCanchas = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'canchas'))
    const canchas = []
    querySnapshot.forEach((doc) => {
      canchas.push({ id: doc.id, ...doc.data() })
    })
    return canchas
  } catch (error) {
    throw error
  }
}

// Obtener una cancha específica
export const getCancha = async (chanchaId) => {
  try {
    const docRef = doc(db, 'canchas', chanchaId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }
    } else {
      return null
    }
  } catch (error) {
    throw error
  }
}

// Actualizar una cancha
export const updateCancha = async (chanchaId, chanchaData) => {
  try {
    const docRef = doc(db, 'canchas', chanchaId)
    await updateDoc(docRef, chanchaData)
  } catch (error) {
    throw error
  }
}

// Eliminar una cancha
export const deleteCancha = async (chanchaId) => {
  try {
    const docRef = doc(db, 'canchas', chanchaId)
    await deleteDoc(docRef)
  } catch (error) {
    throw error
  }
}

// Inhabilitar cancha total o por tiempo
// horaInicio: hora en formato "HH:MM" para programar el inicio de la inhabilitación
// tiempoMinutos: duración en minutos desde horaInicio (o desde ahora si no hay horaInicio)
export const disableCancha = async (chanchaId, tiempoMinutos = null, horaInicio = null) => {
  try {
    const docRef = doc(db, 'canchas', chanchaId)
    const now = new Date()
    
    let startTime = now
    
    // Si se especifica una hora de inicio
    if (horaInicio) {
      const [hours, minutes] = horaInicio.split(':').map(Number)
      startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0)
      
      // Si la hora de inicio ya pasó hoy, no permitir
      if (startTime < now) {
        // Ajustar para que sea la hora actual si ya pasó
        startTime = now
      }
    }
    
    const updateData = {
      inhabilitada: true,
      inhabilitadaEn: Timestamp.fromDate(startTime),
    }
    
    if (tiempoMinutos) {
      // La inhabilitación termina X minutos después de la hora de inicio
      const endTime = new Date(startTime.getTime() + tiempoMinutos * 60000)
      updateData.inhabilitadaHasta = Timestamp.fromDate(endTime)
    }
    
    await updateDoc(docRef, updateData)
  } catch (error) {
    throw error
  }
}

// Habilitar cancha
export const enableCancha = async (chanchaId) => {
  try {
    const docRef = doc(db, 'canchas', chanchaId)
    await updateDoc(docRef, {
      inhabilitada: false,
      inhabilitadaEn: null,
      inhabilitadaHasta: null,
    })
  } catch (error) {
    throw error
  }
}

// Verificar disponibilidad de cancha
export const isCanchaAvailable = async (chanchaId, fecha, hora) => {
  try {
    const cancha = await getCancha(chanchaId)
    if (!cancha) return false

    // Validar rango horario (5:00 AM a 10:00 PM)
    const [horaNum, minutosNum] = hora.split(':').map(Number)
    if (horaNum < 5 || horaNum >= 22) {
      return false
    }

    // Verificar si está inhabilitada
    if (cancha.inhabilitada) {
      if (cancha.inhabilitadaHasta) {
        const ahora = new Date()
        const inhabilitadaHasta = cancha.inhabilitadaHasta.toDate()
        if (ahora < inhabilitadaHasta) {
          return false
        }
      } else {
        return false
      }
    }

    // Verificar conflictos de horario
    const reservasConflict = await getDocs(
      query(
        collection(db, 'reservas'),
        where('chanchaId', '==', chanchaId),
        where('fecha', '==', fecha),
        where('hora', '==', hora),
        where('estado', '==', 'aprobada')
      )
    )

    return reservasConflict.size === 0
  } catch (error) {
    throw error
  }
}

// ============ USUARIOS ============

// Agregar datos de usuario
export const addUserData = async (userId, userData) => {
  try {
    const userRef = doc(db, 'usuarios', userId)
    const existingUser = await getDoc(userRef)

    if (existingUser.exists()) {
      await updateDoc(userRef, userData)
    } else {
      await setDoc(userRef, {
        ...userData,
        estrellas: 5,
        totalReservas: 0,
        noAsistencias: 0,
        createdAt: Timestamp.now(),
      })
    }
  } catch (error) {
    throw error
  }
}

// Obtener datos de usuario
export const getUserData = async (userId) => {
  try {
    const docRef = doc(db, 'usuarios', userId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }
    } else {
      return null
    }
  } catch (error) {
    throw error
  }
}

// Actualizar datos de usuario
export const updateUserData = async (userId, userData) => {
  try {
    const docRef = doc(db, 'usuarios', userId)
    await updateDoc(docRef, userData)
  } catch (error) {
    throw error
  }
}

// Restar estrella al usuario (no asistencia)
export const decreaseUserRating = async (userId) => {
  try {
    const userData = await getUserData(userId)
    if (userData) {
      const newRating = Math.max(1, (userData.estrellas || 5) - 1)
      const newNoShows = (userData.noAsistencias || 0) + 1
      await updateUserData(userId, {
        estrellas: newRating,
        noAsistencias: newNoShows,
      })
    }
  } catch (error) {
    throw error
  }
}

// Aumentar contador de reservas totales del usuario
export const incrementUserReservas = async (userId) => {
  try {
    const userData = await getUserData(userId)
    if (userData) {
      await updateUserData(userId, {
        totalReservas: (userData.totalReservas || 0) + 1,
      })
    }
  } catch (error) {
    throw error
  }
}

// Obtener todas las reservas para admin
export const getAllReservasAdmin = async () => {
  try {
    const allReservas = await getAllReservas()
    // Ordenar por fecha
    return allReservas.sort((a, b) => {
      if (a.fecha && b.fecha) {
        return new Date(a.fecha) - new Date(b.fecha)
      }
      return 0
    })
  } catch (error) {
    throw error
  }
}

// Obtener reservas pendientes
export const getPendingReservas = async () => {
  try {
    const q = query(collection(db, 'reservas'), where('estado', '==', 'pendiente'))
    const querySnapshot = await getDocs(q)
    const reservas = []
    querySnapshot.forEach((doc) => {
      reservas.push({ id: doc.id, ...doc.data() })
    })
    return reservas
  } catch (error) {
    throw error
  }
}

// Cancelar automáticamente reservas pendientes que pasaron su hora
export const autoCancelPendingReservas = async () => {
  try {
    const pendingReservas = await getPendingReservas()
    const currentTime = new Date()

    for (const reserva of pendingReservas) {
      const reservaTime = new Date(reserva.fechaHora)
      
      // Si la hora de la reserva ya pasó, cancelar automáticamente
      if (currentTime > reservaTime) {
        await updateReservaStatus(reserva.id, 'cancelada', 'Cancelada automáticamente - No confirmada en la hora')
      }
    }
  } catch (error) {
    console.error('Error al cancelar reservas automáticamente:', error)
  }
}

// ============ FUNCIONES ADMIN ============

// Obtener todos los usuarios
export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'usuarios'))
    const usuarios = []
    querySnapshot.forEach((doc) => {
      usuarios.push({ id: doc.id, ...doc.data() })
    })
    return usuarios.sort((a, b) => {
      // Ordenar por fecha de creación (más recientes primero)
      if (a.createdAt && b.createdAt) {
        return b.createdAt.toDate() - a.createdAt.toDate()
      }
      return 0
    })
  } catch (error) {
    throw error
  }
}

// Obtener reservas de un usuario específico (para admin)
export const getUserReservasAdmin = async (userId) => {
  try {
    const reservas = await getUserReservas(userId)
    return reservas.sort((a, b) => {
      if (a.fecha && b.fecha) {
        return new Date(b.fecha) - new Date(a.fecha)
      }
      return 0
    })
  } catch (error) {
    throw error
  }
}

// Obtener estadísticas generales del sistema
export const getSystemStats = async () => {
  try {
    const [reservas, usuarios, canchas] = await Promise.all([
      getAllReservas(),
      getAllUsers(),
      getAllCanchas()
    ])
    
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    // Reservas de hoy
    const reservasHoy = reservas.filter(r => {
      if (!r.fecha) return false
      const reservaDate = new Date(r.fecha)
      return reservaDate.toDateString() === today.toDateString()
    })
    
    // Reservas del mes
    const reservasMes = reservas.filter(r => {
      if (!r.fecha) return false
      const reservaDate = new Date(r.fecha)
      return reservaDate >= thisMonth
    })
    
    // Usuarios activos (con al menos una reserva)
    const usuariosActivos = usuarios.filter(u => (u.totalReservas || 0) > 0)
    
    // Estadísticas por deporte
    const deportes = {}
    reservas.forEach(r => {
      const deporte = r.deporte || 'Sin especificar'
      if (!deportes[deporte]) {
        deportes[deporte] = { total: 0, aprobadas: 0, pendientes: 0, rechazadas: 0 }
      }
      deportes[deporte].total++
      if (r.estado === 'aprobada') deportes[deporte].aprobadas++
      else if (r.estado === 'pendiente') deportes[deporte].pendientes++
      else if (r.estado === 'rechazada') deportes[deporte].rechazadas++
    })
    
    // Rating promedio de usuarios
    const ratingPromedio = usuarios.length > 0 
      ? usuarios.reduce((acc, u) => acc + (u.estrellas || 5), 0) / usuarios.length 
      : 5
    
    return {
      totalReservas: reservas.length,
      reservasHoy: reservasHoy.length,
      reservasMes: reservasMes.length,
      pendientes: reservas.filter(r => r.estado === 'pendiente').length,
      aprobadas: reservas.filter(r => r.estado === 'aprobada').length,
      rechazadas: reservas.filter(r => r.estado === 'rechazada').length,
      canceladas: reservas.filter(r => r.estado === 'cancelada').length,
      noAsistencias: reservas.filter(r => r.estado === 'no-asistió').length,
      totalUsuarios: usuarios.length,
      usuariosActivos: usuariosActivos.length,
      ratingPromedio: ratingPromedio.toFixed(1),
      totalCanchas: canchas.length,
      canchasActivas: canchas.filter(c => !c.inhabilitada).length,
      canchasInhabilitadas: canchas.filter(c => c.inhabilitada).length,
      estadisticasPorDeporte: deportes
    }
  } catch (error) {
    throw error
  }
}

// Actualizar rating de usuario (admin)
export const updateUserRating = async (userId, newRating) => {
  try {
    await updateUserData(userId, { estrellas: Math.min(5, Math.max(1, newRating)) })
  } catch (error) {
    throw error
  }
}

