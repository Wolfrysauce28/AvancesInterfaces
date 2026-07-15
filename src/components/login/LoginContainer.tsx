import React, { useState, useEffect } from 'react';
import { loginUserUseCase, loginWithGoogleUseCase, surveyRepository, userRepository } from '../../core/container';

export const LoginContainer: React.FC = () => {
  const [isRightActive, setIsRightActive] = useState(false);
  const [clientEmail, setClientEmail] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  // Toast for "coming soon" features
  const [infoToast, setInfoToast] = useState('');

  // Forgot password modal
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // On mount: check if already logged in and redirect accordingly
  // Do NOT logout or reset survey on mount — that destroys the session when 
  // the user gets redirected back to login from AuthGuard or after completing survey.
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const user = await userRepository.getCurrentUser();
        if (user) {
          // Already logged in — redirect to appropriate page
          if (user.role === 'admin') {
            window.location.href = '/admin';
          } else {
            const profileCompleted = await surveyRepository.isCompleted();
            window.location.href = profileCompleted ? '/client' : '/registro';
          }
        }
      } catch {
        // No session, stay on login page
      }
    };
    checkExistingSession();
  }, []);

  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones de seguridad en frontend
    if (!clientEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return;
    }
    if (clientPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await loginUserUseCase.execute(clientEmail, clientPassword, 'client');
      const profileCompleted = await surveyRepository.isCompleted();
      if (profileCompleted) {
        window.location.href = '/client';
      } else {
        window.location.href = '/registro';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoadingGoogle(true);
    try {
      await loginWithGoogleUseCase.execute();
      // Omitimos setLoadingGoogle(false) porque la redirección de OAuth cambiará de página
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión con Google');
      setLoadingGoogle(false);
    }
  };

  const handleSocialLoginPlaceholder = (provider: string) => {
    setInfoToast(`Inicio de sesión con ${provider} estará disponible próximamente`);
    setTimeout(() => setInfoToast(''), 3000);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones de seguridad en frontend
    if (!adminEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return;
    }
    if (adminPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await loginUserUseCase.execute(adminEmail, adminPassword, 'admin');
      window.location.href = '/admin';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return;
    // Simulated password recovery
    setForgotSent(true);
    setTimeout(() => {
      setShowForgotPassword(false);
      setForgotSent(false);
      setForgotEmail('');
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] py-6 px-4">
      {/* Info Toast */}
      {infoToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1100] w-full max-w-sm px-4 animate-slide-up-modal">
          <div className="bg-blue-600 text-white p-3.5 rounded-2xl shadow-xl border-2 border-blue-400 flex items-center gap-3">
            <i className="fa-solid fa-circle-info text-xl" />
            <p className="text-sm font-bold flex-1">{infoToast}</p>
            <button onClick={() => setInfoToast('')} className="text-white/80 hover:text-white" aria-label="Cerrar">
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center modal-overlay animate-show" onClick={() => { setShowForgotPassword(false); setForgotSent(false); setForgotEmail(''); }}>
          <div
            className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 max-w-sm w-full shadow-2xl animate-bounce-in mx-4"
            onClick={e => e.stopPropagation()}
          >
            {forgotSent ? (
              <div className="text-center space-y-4 py-4">
                <div className="text-5xl animate-bounce-in">✉️</div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white font-display">¡Enlace Enviado!</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Hemos enviado un enlace de recuperación a <strong className="text-emerald-600 dark:text-emerald-400">{forgotEmail}</strong>. Revisa tu bandeja de entrada.
                </p>
                <div className="w-12 h-12 border-4 border-emerald-200 dark:border-gray-700 border-t-emerald-500 rounded-full animate-spin mx-auto mt-2" />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-white font-display">Recuperar Contraseña</h3>
                  <button onClick={() => setShowForgotPassword(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Cerrar">
                    <i className="fa-solid fa-xmark text-lg" />
                  </button>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>
                <form onSubmit={handleForgotPassword}>
                  <div className="input-icon-wrapper relative w-full mb-4">
                    <input
                      type="email"
                      placeholder="tu@correo.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border-2 border-transparent rounded-[16px] py-3.5 pl-12 pr-4 font-medium outline-none focus:bg-white focus:border-emerald-500 dark:focus:bg-gray-800 transition-all"
                      required
                      autoFocus
                    />
                    <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg active:scale-95 uppercase tracking-wide text-sm">
                    Enviar Enlace de Recuperación
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm font-semibold max-w-sm w-full text-center animate-show">
          <i className="fa-solid fa-circle-exclamation mr-2" />{error}
        </div>
      )}
      
      <div className={`container-login relative bg-white dark:bg-gray-800 rounded-[24px] shadow-2xl dark:shadow-black/50 overflow-hidden w-[900px] max-w-full min-h-[600px] transition-all duration-500 ${isRightActive ? 'right-panel-active' : ''}`} id="container">
        
        {/* FORMULARIO: ADMINISTRADOR / RESTAURANTE */}
        <div className={`form-container absolute top-0 h-full w-full md:w-1/2 transition-all duration-600 ease-in-out flex flex-col justify-center items-center px-10 bg-white dark:bg-gray-800 ${isRightActive ? 'translate-x-full opacity-100 z-50 animate-show' : 'opacity-0 z-10'}`}>
          <form onSubmit={handleAdminLogin} className="w-full max-w-xs flex flex-col items-center">
            {/* Logo interno para móvil */}
            <div className="flex items-center gap-2 mb-4 md:hidden">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-base shadow-md">
                <i className="fa-solid fa-leaf" />
              </div>
              <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Food<span className="text-emerald-500">Save</span></span>
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
                aria-label="Correo administrativo"
              />
              <i className="fa-solid fa-store absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="input-icon-wrapper relative w-full mb-4">
              <input 
                type="password" 
                placeholder="Contraseña de acceso" 
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border-2 border-transparent rounded-[16px] py-3.5 pl-12 pr-4 font-medium outline-none focus:bg-white focus:border-emerald-500 dark:focus:bg-gray-800 transition-all"
                required
                aria-label="Contraseña de acceso"
              />
              <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-xs font-semibold text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mb-6 self-end"
            >
              ¿Problemas de acceso?
            </button>
            
            <button type="submit" disabled={loading} className={`w-full bg-gray-900 dark:bg-emerald-600 hover:bg-gray-800 dark:hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-md active:scale-95 uppercase tracking-wide text-sm mt-2 flex justify-center items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Entrando...</>
              ) : 'Ingresar al Panel'}
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
                <i className="fa-solid fa-leaf" />
              </div>
              <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Food<span className="text-emerald-500">Save</span></span>
            </div>

            <h1 className="text-gray-900 dark:text-white text-center text-2xl font-extrabold mb-1">Hola, Cliente</h1>
            <p className="text-gray-500 dark:text-gray-400 text-center text-xs mb-5">Inicia sesión para rescatar comida</p>
            
            {/* Redes sociales */}
            <div className="flex gap-4 mb-6 w-full justify-center">
              <button
                type="button"
                onClick={() => handleSocialLoginPlaceholder('Facebook')}
                className="w-12 h-12 rounded-[1rem] border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                aria-label="Iniciar sesión con Facebook (próximamente)"
              >
                <i className="fa-brands fa-facebook-f text-lg" />
              </button>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loadingGoogle || loading}
                className={`w-12 h-12 rounded-[1rem] border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-500 hover:border-red-200 transition-all shadow-sm ${loadingGoogle ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Iniciar sesión con Google"
              >
                {loadingGoogle ? (
                  <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <i className="fa-brands fa-google text-lg" />
                )}
              </button>
              <button
                type="button"
                onClick={() => handleSocialLoginPlaceholder('Apple')}
                className="w-12 h-12 rounded-[1rem] border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white hover:border-gray-800 transition-all shadow-sm"
                aria-label="Iniciar sesión con Apple (próximamente)"
              >
                <i className="fa-brands fa-apple text-lg" />
              </button>
            </div>
            
            <div className="flex items-center w-full mb-6">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="px-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">o usa tu email</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>
            
            <div className="input-icon-wrapper relative w-full mb-4">
              <input 
                type="email" 
                placeholder="Correo electrónico" 
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border-2 border-transparent rounded-[16px] py-3.5 pl-12 pr-4 font-medium outline-none focus:bg-white focus:border-emerald-500 dark:focus:bg-gray-800 transition-all"
                required
                aria-label="Correo electrónico"
              />
              <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="input-icon-wrapper relative w-full mb-2">
              <input 
                type="password" 
                placeholder="Contraseña" 
                value={clientPassword}
                onChange={(e) => setClientPassword(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border-2 border-transparent rounded-[16px] py-3.5 pl-12 pr-4 font-medium outline-none focus:bg-white focus:border-emerald-500 dark:focus:bg-gray-800 transition-all"
                required
                aria-label="Contraseña"
              />
              <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mb-6 self-end transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
            
            <button type="submit" disabled={loading || loadingGoogle} className={`w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg active:scale-95 uppercase tracking-wide text-sm flex justify-center items-center gap-2 ${(loading || loadingGoogle) ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Iniciando...</>
              ) : 'Iniciar Sesión'}
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
                <i className="fa-solid fa-basket-shopping text-3xl text-white" />
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
                <i className="fa-solid fa-store text-3xl text-white" />
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
      `}
      </style>
    </div>
  );
};
export default LoginContainer;
