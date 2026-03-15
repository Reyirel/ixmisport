import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, Zap, CheckCircle, ArrowRight, Trophy, Shield, Smartphone, Clock, Star, Play, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState, useRef } from 'react'
import soccerImage from '../assets/imagen1.png'

// Iconos SVG personalizados para deportes
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
    <ellipse cx="12" cy="8" rx="5" ry="6"/>
    <path d="M12 14v8"/>
    <path d="M9 22h6"/>
    <circle cx="10" cy="6" r="0.5" fill="currentColor"/>
    <circle cx="14" cy="6" r="0.5" fill="currentColor"/>
    <circle cx="12" cy="9" r="0.5" fill="currentColor"/>
    <circle cx="10" cy="9" r="0.5" fill="currentColor"/>
    <circle cx="14" cy="9" r="0.5" fill="currentColor"/>
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

export default function Home() {
  const { currentUser } = useAuth()
  const [scrollY, setScrollY] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const heroRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        setMousePosition({
          x: (e.clientX - rect.left - rect.width / 2) / 50,
          y: (e.clientY - rect.top - rect.height / 2) / 50
        })
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // Deportes disponibles
  const sports = [
    {
      icon: BasketballIcon,
      name: 'Baloncesto',
      courts: 4,
      description: 'Canchas profesionales con tableros reglamentarios',
      gradient: 'from-orange-500 to-amber-500',
      bgLight: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      icon: VolleyballIcon,
      name: 'Voleibol',
      courts: 2,
      description: 'Canchas con redes de alta calidad y medidas oficiales',
      gradient: 'from-blue-500 to-cyan-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      icon: TennisIcon,
      name: 'Tenis',
      courts: 2,
      description: 'Canchas reglamentarias con superficie apta para competencia',
      gradient: 'from-yellow-500 to-lime-500',
      bgLight: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      icon: PadelIcon,
      name: 'Pádel',
      courts: 1,
      description: 'Cancha cerrada con cristales y piso de cemento',
      gradient: 'from-emerald-500 to-teal-500',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
    {
      icon: SoccerIcon,
      name: 'Fútbol Soccer',
      courts: 1,
      description: 'Cancha de fútbol soccer con césped artificial',
      gradient: 'from-green-500 to-emerald-600',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      icon: SoccerIcon,
      name: 'Fútbol Rápido',
      courts: 1,
      description: 'Cancha de fútbol rápido, ideal para partidos ágiles',
      gradient: 'from-lime-500 to-green-500',
      bgLight: 'bg-lime-50',
      textColor: 'text-lime-700'
    },
  ]

  // Pasos del proceso
  const steps = [
    {
      number: '01',
      title: 'Crea tu cuenta',
      description: 'Regístrate gratis en segundos con tu email.',
      icon: Users,
    },
    {
      number: '02',
      title: 'Elige tu cancha',
      description: 'Explora las canchas disponibles por deporte.',
      icon: MapPin,
    },
    {
      number: '03',
      title: 'Selecciona horario',
      description: 'Escoge la fecha y hora que mejor te convenga.',
      icon: Calendar,
    },
    {
      number: '04',
      title: '¡A jugar!',
      description: 'Recibe confirmación y disfruta tu reserva.',
      icon: CheckCircle,
    },
  ]

  // Características principales
  const features = [
    {
      icon: Clock,
      title: 'Reserva en minutos',
      description: 'Proceso rápido y sencillo, sin llamadas ni esperas.',
    },
    {
      icon: Shield,
      title: 'Sistema de reputación',
      description: 'Tu puntualidad suma estrellas y beneficios.',
    },
    {
      icon: Smartphone,
      title: 'Desde cualquier lugar',
      description: 'Accede y reserva desde tu celular o computadora.',
    },
    {
      icon: Trophy,
      title: 'Canchas verificadas',
      description: 'Todas nuestras instalaciones cumplen estándares de calidad.',
    },
  ]

  // Testimonios
  const testimonials = [
    {
      name: 'Carlos Mendoza',
      role: 'Jugador de Basketball',
      avatar: 'CM',
      content: 'Antes perdía horas buscando canchas disponibles. Ahora reservo en minutos y puedo jugar con mi equipo cada semana.',
      rating: 5,
    },
    {
      name: 'María García',
      role: 'Amante del Pádel',
      avatar: 'MG',
      content: 'La mejor plataforma para reservar. El sistema de estrellas me motiva a ser puntual y las canchas siempre están en excelente estado.',
      rating: 5,
    },
    {
      name: 'Roberto Sánchez',
      role: 'Entrenador de Voleibol',
      avatar: 'RS',
      content: 'Organizo prácticas para mi equipo semanalmente. La confirmación instantánea y el panel de administración son increíbles.',
      rating: 5,
    },
  ]

  return (
    <div className="w-full bg-white overflow-hidden">
      {/* ====== HERO SECTION - Modern SaaS Style ====== */}
      <section 
        ref={heroRef}
        className="relative w-full min-h-screen flex items-center bg-white pt-20 pb-16 lg:pt-24 lg:pb-24"
      >
        {/* Subtle background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />
          {/* Floating shapes with parallax */}
          <div 
            className="absolute top-20 right-[15%] w-64 h-64 rounded-full bg-emerald-50 blur-3xl opacity-60"
            style={{ transform: `translate(${mousePosition.x * -1}px, ${mousePosition.y * -1}px)` }}
          />
          <div 
            className="absolute bottom-20 left-[10%] w-48 h-48 rounded-full bg-violet-50 blur-3xl opacity-50"
            style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
          />
          <div 
            className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full bg-emerald-100 blur-2xl opacity-30"
            style={{ transform: `translate(${mousePosition.x * 0.5}px, ${scrollY * 0.1}px)` }}
          />
        </div>

        <div className="relative max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Content - Typography & CTA */}
            <div className="order-2 lg:order-1 max-w-xl">
              {/* Badge */}
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full mb-6 opacity-0"
                style={{ animation: 'fadeSlideUp 0.6s ease-out 0.1s forwards' }}
              >
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-emerald-700 text-sm font-medium tracking-wide">
                  Plataforma #1 en reservas deportivas
                </span>
              </div>

              {/* Headline */}
              <h1 
                className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6 opacity-0"
                style={{ 
                  animation: 'fadeSlideUp 0.6s ease-out 0.2s forwards',
                  fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif"
                }}
              >
                Reserva tu cancha
                <span className="block text-emerald-600 mt-2">
                  en segundos
                </span>
              </h1>
              
              {/* Subheadline */}
              <p 
                className="text-lg sm:text-xl text-gray-500 leading-relaxed mb-10 max-w-md opacity-0"
                style={{ animation: 'fadeSlideUp 0.6s ease-out 0.3s forwards' }}
              >
                La forma más rápida y segura de encontrar canchas para reservar en la unidad deportiva sin complicaciones ni esperas.
              </p>

              {/* CTA Buttons */}
              <div 
                className="flex flex-col sm:flex-row gap-4 mb-10 opacity-0"
                style={{ animation: 'fadeSlideUp 0.6s ease-out 0.4s forwards' }}
              >
                {currentUser ? (
                  <Link 
                    to="/reservar" 
                    className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-full font-semibold text-base hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <span>Explorar Canchas</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                ) : (
                  <>
                    <Link 
                      to="/register" 
                      className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-full font-semibold text-base hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <span>Comenzar Gratis</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                    <Link 
                      to="/login" 
                      className="group inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-full font-semibold text-base hover:border-emerald-200 hover:bg-emerald-50 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      Iniciar Sesión
                    </Link>
                  </>
                )}
              </div>

              {/* Trust indicators */}
              <div 
                className="flex flex-wrap items-center gap-6 opacity-0"
                style={{ animation: 'fadeSlideUp 0.6s ease-out 0.5s forwards' }}
              >
                <div className="flex items-center gap-2 text-gray-500">
                  <CheckCircle size={18} className="text-emerald-500" />
                  <span className="text-sm font-medium">Sin comisiones</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Shield size={18} className="text-emerald-500" />
                  <span className="text-sm font-medium">Pago seguro</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Zap size={18} className="text-emerald-500" />
                  <span className="text-sm font-medium">Confirmación instantánea</span>
                </div>
              </div>
            </div>

            {/* Right Content - Illustration */}
            <div 
              className="order-1 lg:order-2 flex items-center justify-center opacity-0"
              style={{ 
                animation: 'fadeSlideUp 0.8s ease-out 0.3s forwards',
                transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`
              }}
            >
              <div className="relative w-full max-w-lg lg:max-w-xl aspect-square">
                <img
                  src={soccerImage}
                  alt="Logo"
                  className="w-full h-full object-contain drop-shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0"
          style={{ animation: 'fadeIn 0.6s ease-out 1s forwards' }}
        >
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <span className="text-xs font-medium tracking-widest uppercase">Descubre más</span>
            <div className="w-6 h-10 border-2 border-gray-300 rounded-full p-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mx-auto animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* ====== SPORTS SECTION - Deportes Disponibles ====== */}
      <section className="w-full py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-50 -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-30 -ml-48 -mb-48" />
        
        <div className="max-w-7xl mx-auto relative">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fadeInUp">
            <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full mb-4">
              Deportes
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Elige tu deporte favorito
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Contamos con instalaciones de primera calidad para diferentes disciplinas deportivas
            </p>
          </div>

          {/* Sports Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
            {sports.map((sport, index) => {
              const Icon = sport.icon
              return (
                <div
                  key={index}
                  className="group relative bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-emerald-100/50 transition-all duration-500 hover:-translate-y-2 animate-fadeInUp overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Background gradient on hover */}
                  <div className={`absolute inset-0 bg-linear-to-br ${sport.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  {/* Icon */}
                  <div className={`relative w-20 h-20 ${sport.bgLight} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-10 h-10 ${sport.textColor}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {sport.name}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {sport.description}
                  </p>

                  {/* Courts count */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-3xl font-bold bg-linear-to-r ${sport.gradient} bg-clip-text text-transparent`}>
                        {sport.courts}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {sport.courts === 1 ? 'cancha disponible' : 'canchas disponibles'}
                      </span>
                    </div>
                    <div className={`w-10 h-10 rounded-full ${sport.bgLight} flex items-center justify-center group-hover:bg-linear-to-r group-hover:${sport.gradient} transition-all duration-300`}>
                      <ChevronRight className={`w-5 h-5 ${sport.textColor} group-hover:text-white transition-colors`} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-12 animate-fadeInUp" style={{ animationDelay: '300ms' }}>
            <Link 
              to={currentUser ? "/reservar" : "/register"}
              className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors group"
            >
              <span>Ver todas las canchas</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ====== HOW IT WORKS - Timeline Style ====== */}
      <section className="w-full py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 lg:mb-20 animate-fadeInUp">
            <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full mb-4">
              Proceso
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Reserva en 4 simples pasos
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hemos simplificado el proceso para que puedas enfocarte en lo que importa: jugar
            </p>
          </div>

          {/* Steps Timeline */}
          <div className="relative">
            {/* Connection Line (Desktop) */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-linear-to-r from-emerald-200 via-emerald-400 to-emerald-200" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div
                    key={index}
                    className="relative animate-fadeInUp"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Step Card */}
                    <div className="relative bg-white rounded-2xl p-6 lg:p-8 text-center group">
                      {/* Number Circle */}
                      <div className="relative mx-auto mb-6">
                        <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-200 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        {/* Step Number Badge */}
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                          {step.number}
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Mobile Connection Arrow */}
                    {index < steps.length - 1 && (
                      <div className="flex justify-center my-4 lg:hidden">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                          <ChevronRight className="w-5 h-5 text-emerald-600 rotate-90" />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ====== FEATURES BENTO GRID ====== */}
      <section className="w-full py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fadeInUp">
            <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full mb-4">
              Beneficios
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              ¿Por qué elegirnos?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Diseñamos la mejor experiencia para que disfrutes del deporte
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              const isLarge = index === 0 || index === 3
              return (
                <div
                  key={index}
                  className={`group bg-white rounded-3xl p-8 border border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-50 transition-all duration-500 animate-fadeInUp ${
                    isLarge ? 'md:col-span-2 lg:col-span-2' : ''
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col h-full">
                    {/* Icon */}
                    <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:scale-110 transition-all duration-300">
                      <Icon className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed flex-grow">
                      {feature.description}
                    </p>

                    {/* Bottom decoration */}
                    <div className="mt-6 pt-6 border-t border-gray-100 group-hover:border-emerald-100 transition-colors">
                      <div className="flex items-center gap-2 text-emerald-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span>Más información</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ====== TESTIMONIALS SECTION ====== */}
      <section className="w-full py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-linear-to-b from-emerald-50/50 to-transparent" />
        
        <div className="max-w-7xl mx-auto relative">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fadeInUp">
            <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full mb-4">
              Testimonios
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Deportistas de la unidad ya confían en ixmisport para sus reservas
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-emerald-50 hover:border-emerald-100 transition-all duration-500 animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 leading-relaxed mb-8 text-lg">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-linear-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 animate-fadeInUp" style={{ animationDelay: '400ms' }}>
            {[
              { value: '11', label: 'Canchas disponibles' },
              { value: 'Gratis', label: 'Uso de la plataforma' },
              { value: '6', label: 'Deportes disponibles' },
              { value: '5★', label: 'Calificación promedio' },
            ].map((stat, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-2xl border border-gray-100">
                <div className="text-3xl lg:text-4xl font-bold text-emerald-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 text-sm font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FINAL CTA SECTION ====== */}
      <section className="w-full py-20 lg:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-linear-to-br from-emerald-600 via-emerald-500 to-teal-500" />
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/10 rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto relative">
          <div className="text-center animate-fadeInUp">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur rounded-3xl mb-8">
              <Trophy className="w-10 h-10 text-white" />
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              ¿Listo para jugar?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Únete a nuestra comunidad de deportistas y empieza a reservar tus canchas favoritas hoy mismo
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {currentUser ? (
                <Link 
                  to="/reservar" 
                  className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-emerald-600 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-black/20 transition-all duration-300 hover:scale-105"
                >
                  <span>Reservar ahora</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link 
                    to="/register" 
                    className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-emerald-600 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-black/20 transition-all duration-300 hover:scale-105"
                  >
                    <span>Crear cuenta gratis</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    to="/login" 
                    className="inline-flex items-center justify-center px-10 py-5 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-emerald-600 transition-all duration-300"
                  >
                    Ya tengo cuenta
                  </Link>
                </>
              )}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-white/80">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} />
                <span className="text-sm font-medium">Registro gratuito</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={18} />
                <span className="text-sm font-medium">Datos protegidos</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={18} />
                <span className="text-sm font-medium">Confirmación inmediata</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add animations to CSS */}
      <style>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes floatImage {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes floatDot {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-8px) scale(1.1);
            opacity: 0.8;
          }
        }

        @keyframes motionLine {
          0%, 100% {
            opacity: 0.2;
            transform: scaleX(1);
          }
          50% {
            opacity: 0.6;
            transform: scaleX(1.1);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        /* Reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  )
}
