import React, { useState, useEffect } from 'react';
import { loginUserUseCase, surveyRepository, userRepository } from '../../core/container';

export const LoginContainer: React.FC = () => {
  const [isRightActive, setIsRightActive] = useState(false);
  const [clientEmail, setClientEmail] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Limpiar respuestas de la encuesta y cerrar sesión al montar el Login
    surveyRepository.resetSurvey();
    userRepository.logout();
  }, []);

  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await loginUserUseCase.execute(clientEmail || 'cliente@ceromerma.com', 'client');
      const profileCompleted = await surveyRepository.isCompleted();
      if (profileCompleted) {
        window.location.href = '/client';
      } else {
        window.location.href = '/registro';
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await loginUserUseCase.execute(adminEmail || 'admin@eltrigo.com', 'admin');
      window.location.href = '/admin';
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] py-6 px-4">
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm font-semibold max-w-sm w-full text-center">
          {error}
        </div>
      )}
      
      <div className={`container-login relative bg-white dark:bg-gray-800 rounded-[24px] shadow-2xl dark:shadow-black/50 overflow-hidden w-[900px] max-w-full min-h-[600px] transition-all duration-500 ${isRightActive ? 'right-panel-active' : ''}`} id="container">
        
        {/* FORMULARIO: ADMINISTRADOR / RESTAURANTE */}
        <div className={`form-container absolute top-0 h-full w-full md:w-1/2 transition-all duration-600 ease-in-out flex flex-col justify-center items-center px-10 bg-white dark:bg-gray-800 ${isRightActive ? 'translate-x-full opacity-100 z-50 animate-show' : 'opacity-0 z-10'}`}>
          <form onSubmit={handleAdminLogin} className="w-full max-w-xs flex flex-col items-center">
            {/* Logo interno para móvil */}
            <div className="flex items-center gap-2 mb-4 md:hidden">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-base shadow-md">
                <i className="fa-solid fa-leaf"></i>
              </div>
              <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Cero<span className="text-emerald-500">Merma</span></span>
            </div>

            <h1 className="text-gray-900 dark:text-white text-center text-2xl font-extrabold mb-1">Restaurante</h1>
            <p className="text-gray-500 dark:text-gray-400 text-center text-xs mb-5">Panel de control de inventario KDS</p>
            
            <div className="input-icon-wrapper relative w-full mb-4">
              <input 
                type="email" 
                placeholder="Correo Administrativo" 
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border-2 border-transparent rounded-[16px] py-3.5 pl-12 pr-4 font-medium outline-none focus:bg-white focus:border-emerald-500 dark:focus:bg-gray-800 transition-all"
                required 
              />
              <i className="fa-solid fa-store absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
            
            <div className="input-icon-wrapper relative w-full mb-4">
              <input 
                type="password" 
                placeholder="Contraseña de acceso" 
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border-2 border-transparent rounded-[16px] py-3.5 pl-12 pr-4 font-medium outline-none focus:bg-white focus:border-emerald-500 dark:focus:bg-gray-800 transition-all"
                required 
              />
              <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
            
            <a href="#" className="text-xs font-semibold text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mb-6 self-end">¿Problemas de acceso?</a>
            
            <button type="submit" className="w-full bg-gray-900 dark:bg-emerald-600 hover:bg-gray-800 dark:hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-md active:scale-95 uppercase tracking-wide text-sm mt-2">
              Ingresar al Panel
            </button>
            
            <div className="mobile-toggle block md:hidden w-full mt-5 text-emerald-500 dark:text-emerald-400 font-semibold cursor-pointer text-center text-sm py-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl" onClick={() => setIsRightActive(false)}>
              Soy Cliente, quiero rescatar comida
            </div>
          </form>
        </div>

        {/* FORMULARIO: CLIENTE */}
        <div className={`form-container absolute top-0 h-full w-full md:w-1/2 transition-all duration-600 ease-in-out flex flex-col justify-center items-center px-10 bg-white dark:bg-gray-800 ${isRightActive ? 'translate-x-full opacity-0 z-10' : 'z-20'}`}>
          <form onSubmit={handleClientLogin} className="w-full max-w-xs flex flex-col items-center">
            {/* Logo interno para móvil */}
            <div className="flex items-center gap-2 mb-4 md:hidden">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-base shadow-md">
                <i className="fa-solid fa-leaf"></i>
              </div>
              <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Cero<span className="text-emerald-500">Merma</span></span>
            </div>

            <h1 className="text-gray-900 dark:text-white text-center text-2xl font-extrabold mb-1">Hola, Cliente</h1>
            <p className="text-gray-500 dark:text-gray-400 text-center text-xs mb-5">Inicia sesión para rescatar comida</p>
            
            {/* Redes sociales */}
            <div className="flex gap-4 mb-6 w-full justify-center">
              <button type="button" className="w-12 h-12 rounded-[1rem] border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
                <i className="fa-brands fa-facebook-f text-lg"></i>
              </button>
              <button type="button" className="w-12 h-12 rounded-[1rem] border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-500 hover:border-red-200 transition-all shadow-sm">
                <i className="fa-brands fa-google text-lg"></i>
              </button>
              <button type="button" className="w-12 h-12 rounded-[1rem] border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white hover:border-gray-800 transition-all shadow-sm">
                <i className="fa-brands fa-apple text-lg"></i>
              </button>
            </div>
            
            <div className="flex items-center w-full mb-6">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
              <span className="px-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">o usa tu email</span>
              <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            </div>
            
            <div className="input-icon-wrapper relative w-full mb-4">
              <input 
                type="email" 
                placeholder="Correo electrónico" 
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border-2 border-transparent rounded-[16px] py-3.5 pl-12 pr-4 font-medium outline-none focus:bg-white focus:border-emerald-500 dark:focus:bg-gray-800 transition-all"
                required 
              />
              <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
            
            <div className="input-icon-wrapper relative w-full mb-2">
              <input 
                type="password" 
                placeholder="Contraseña" 
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border-2 border-transparent rounded-[16px] py-3.5 pl-12 pr-4 font-medium outline-none focus:bg-white focus:border-emerald-500 dark:focus:bg-gray-800 transition-all"
                required 
              />
              <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
            
            <a href="#" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mb-6 self-end transition-colors">¿Olvidaste tu contraseña?</a>
            
            <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg active:scale-95 uppercase tracking-wide text-sm">
              Iniciar Sesión
            </button>
            
            <div className="mobile-toggle block md:hidden w-full mt-5 text-emerald-500 dark:text-emerald-400 font-semibold cursor-pointer text-center text-sm py-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl" onClick={() => setIsRightActive(true)}>
              Soy Restaurante, administrar local
            </div>
          </form>
        </div>

        {/* CAPA SUPERPUESTA ANIMADA (Desktop) */}
        <div className={`overlay-container absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-600 ease-in-out z-100 hidden md:block ${isRightActive ? '-translate-x-full' : ''}`}>
          <div className={`overlay bg-gradient-to-br from-emerald-500 to-emerald-700 text-white relative left-[-100%] h-full w-[200%] transition-transform duration-600 ease-in-out ${isRightActive ? 'translate-x-1/2' : 'translate-x-0'}`}>
            
            {/* Panel Izquierdo (Para llevar de vuelta a Cliente) */}
            <div className={`overlay-panel absolute top-0 h-full w-1/2 flex flex-col items-center justify-center px-10 text-center transition-transform duration-600 ease-in-out ${isRightActive ? 'translate-x-0' : '-translate-x-[20%]'}`}>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm shadow-sm">
                <i className="fa-solid fa-basket-shopping text-3xl text-white"></i>
              </div>
              <h2 className="text-white text-3xl font-extrabold mb-4">¿Buscas comida?</h2>
              <p className="text-emerald-50 text-sm leading-relaxed max-w-[280px] mb-8 font-medium">Rescata platillos deliciosos con grandes descuentos y ayuda al planeta.</p>
              <button 
                type="button" 
                onClick={() => setIsRightActive(false)}
                className="bg-transparent border-2 border-white text-white font-bold py-3.5 px-10 rounded-[1rem] hover:bg-white hover:text-emerald-600 transition-all uppercase tracking-widest text-xs active:scale-95"
              >
                Soy Cliente
              </button>
            </div>
            
            {/* Panel Derecho (Para llevar a Administrador) */}
            <div className={`overlay-panel absolute right-0 top-0 h-full w-1/2 flex flex-col items-center justify-center px-10 text-center transition-transform duration-600 ease-in-out ${isRightActive ? 'translate-x-[20%]' : 'translate-x-0'}`}>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm shadow-sm">
                <i className="fa-solid fa-store text-3xl text-white"></i>
              </div>
              <h2 className="text-white text-3xl font-extrabold mb-4">¿Tienes un Local?</h2>
              <p className="text-emerald-50 text-sm leading-relaxed max-w-[280px] mb-8 font-medium font-display">Únete a la red, vende tu merma para generar ingresos extra y optimiza tu KDS.</p>
              <button 
                type="button" 
                onClick={() => setIsRightActive(true)}
                className="bg-transparent border-2 border-white text-white font-bold py-3.5 px-10 rounded-[1rem] hover:bg-white hover:text-emerald-600 transition-all uppercase tracking-widest text-xs active:scale-95"
              >
                Soy Restaurante
              </button>
            </div>

          </div>
        </div>

      </div>

      <style>{`
        @keyframes show {
          0%, 49.99% { opacity: 0; z-index: 1; }
          50%, 100% { opacity: 1; z-index: 5; }
        }
        .animate-show {
          animation: show 0.6s;
        }
      `}</style>
    </div>
  );
};
export default LoginContainer;
