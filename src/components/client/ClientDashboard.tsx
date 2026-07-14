import React, { useEffect, useState } from 'react';
import type { Pack } from '../../core/domain/entities/Pack';
import { getClientPacksUseCase, updatePackStockUseCase } from '../../core/container';

export const ClientDashboard: React.FC = () => {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [activeView, setActiveView] = useState<'home' | 'product'>('home');
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [reservationMessage, setReservationMessage] = useState('');

  // Sincronizar el data-attribute de body con la vista de React para respetar estilos del BaseLayout
  useEffect(() => {
    document.body.setAttribute('data-view', activeView);
    return () => {
      document.body.removeAttribute('data-view');
    };
  }, [activeView]);

  const loadPacks = async () => {
    try {
      const data = await getClientPacksUseCase.execute();
      setPacks(data);
    } catch (err) {
      console.error('Error cargando packs:', err);
    }
  };

  useEffect(() => {
    loadPacks();
  }, []);

  const handlePackClick = (pack: Pack) => {
    setSelectedPack(pack);
    setActiveView('product');
  };

  const handleBackToHome = () => {
    setActiveView('home');
    setSelectedPack(null);
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(prev => prev === category ? null : category);
  };

  const handleReservePack = async (pack: Pack) => {
    if (pack.stock <= 0) return;
    try {
      // Decrementar stock en el repositorio
      const updatedPack = await updatePackStockUseCase.execute(pack.id, pack.stock - 1);
      
      // Actualizar listado local
      setPacks(prev => prev.map(p => p.id === pack.id ? updatedPack : p));
      
      // Mostrar alerta
      const code = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
      setReservationMessage(
        `¡Reserva confirmada! Código: ${code}. Retira tu pack en ${pack.storeName} entre las ${pack.collectionTime}.`
      );
      
      // Regresar al feed después del éxito
      setTimeout(() => {
        setReservationMessage('');
        handleBackToHome();
      }, 5000);
    } catch (err) {
      console.error('Error al reservar:', err);
    }
  };

  const filteredPacks = packs.filter(pack => {
    const matchesSearch = pack.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pack.storeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pack.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory ? pack.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* ALERTA DE RESERVA EXITOSA */}
      {reservationMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-lg px-4 animate-show">
          <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between border-2 border-emerald-400">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-circle-check text-2xl text-white"></i>
              <p className="text-sm font-bold">{reservationMessage}</p>
            </div>
            <button onClick={() => setReservationMessage('')} className="text-white hover:text-emerald-100 font-bold p-1">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}

      {/* TOP NAVBAR (Oculto en detalle de producto en móvil) */}
      <nav id="top-nav-bar" className={`bg-white dark:bg-gray-800 shadow-sm fixed w-full top-0 z-50 transition-all duration-300 ${activeView === 'product' ? 'hidden md:block' : 'block'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-4 md:gap-8">
              <div className="flex-shrink-0 flex items-center cursor-pointer active:scale-95 transition" onClick={handleBackToHome}>
                <div className="w-9 h-9 md:w-11 md:h-11 bg-brand-500 rounded-2xl flex items-center justify-center text-white text-lg md:text-xl shadow-md mr-3">
                  <i className="fa-solid fa-leaf"></i>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight hidden md:block text-gray-900 dark:text-white">Cero<span className="text-brand-500">Merma</span></h1>
              </div>
              
              {/* Location Selector */}
              <div className="flex flex-col cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1.5 md:p-2 rounded-lg transition">
                <span className="hidden md:block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Entregar en</span>
                <div className="flex items-center text-sm md:text-base font-bold text-gray-900 dark:text-white max-w-[160px] md:max-w-xs">
                  <i className="fa-solid fa-location-dot text-red-500 mr-2 text-base md:text-lg"></i>
                  <span className="truncate">Av. Providencia 1234</span>
                  <i className="fa-solid fa-chevron-down ml-2 text-gray-400 text-[10px] md:text-xs"></i>
                </div>
              </div>
            </div>

            {/* Desktop Search */}
            <div className="hidden md:block flex-1 max-w-2xl px-8">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-magnifying-glass text-gray-400 group-focus-within:text-brand-600 transition-colors"></i>
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-gray-800 focus:border-transparent text-sm font-medium transition-all shadow-inner" 
                  placeholder="Buscar restaurantes, panaderías, platos rescatados..." 
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 md:gap-4">
              <button className="relative p-2 md:p-3 text-gray-600 dark:text-gray-300 hover:text-emerald-500 transition active:scale-95 bg-gray-50 dark:bg-gray-700 rounded-full md:bg-transparent">
                <i className="fa-solid fa-basket-shopping text-lg md:text-xl"></i>
                <span className="absolute top-0 right-0 md:top-1 md:right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm transform translate-x-1/4 -translate-y-1/4">2</span>
              </button>
              
              <button className="flex md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-red-500 transition active:scale-95 bg-gray-50 dark:bg-gray-700 rounded-full" onClick={() => window.location.href = '/'} aria-label="Salir">
                <i className="fa-solid fa-arrow-right-from-bracket text-lg"></i>
              </button>

              <button className="hidden md:flex items-center gap-3 p-1.5 pr-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition border border-gray-100 dark:border-gray-700 shadow-sm" onClick={() => window.location.href = '/'}>
                <img src="https://i.pravatar.cc/100?img=32" alt="Perfil" className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700" />
                <div className="flex flex-col items-start">
                  <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight">Juan Pérez</span>
                  <span className="text-[10px] font-semibold text-red-500 leading-tight">Cerrar Sesión</span>
                </div>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Search */}
        <div id="mobile-search-bar" className="md:hidden px-4 pb-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <i className="fa-solid fa-magnifying-glass text-gray-400"></i>
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium transition shadow-inner" 
              placeholder="¿Qué vas a rescatar hoy?" 
            />
          </div>
        </div>
      </nav>

      {/* VIEW: HOME DASHBOARD */}
      {activeView === 'home' && (
        <div className="view-section px-4 sm:px-6 lg:px-8 mt-44 md:mt-28 mb-24">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-3xl p-6 md:p-8 text-white shadow-lg mb-8 flex items-center justify-between relative overflow-hidden cursor-pointer hover:shadow-xl transition">
            <div className="relative z-10 w-full md:w-2/3">
              <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide backdrop-blur-sm mb-3">Recién agregados</span>
              <h2 className="text-2xl md:text-3xl font-extrabold mb-2 leading-tight font-display">Salva comida deliciosa, ahorra dinero</h2>
              <p className="text-emerald-50 font-medium text-sm md:text-base max-w-sm font-body">Descubre packs sorpresa con descuentos de hasta 70% en comercios cerca de ti.</p>
            </div>
            <i className="fa-solid fa-bag-shopping text-8xl md:text-[120px] absolute -right-6 -bottom-6 text-white/10 transform -rotate-12"></i>
          </div>

          {/* Categories */}
          <div className="mb-10">
            <h3 className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white mb-4 font-display">Explorar Categorías</h3>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
              <button onClick={() => handleCategorySelect('panaderia')} className={`flex flex-col items-center min-w-[85px] gap-3 group`}>
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[1.25rem] bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-3xl border-2 transition-all ${selectedCategory === 'panaderia' ? 'border-emerald-500' : 'border-transparent group-hover:border-emerald-500'}`}>🥐</div>
                <span className={`text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-emerald-500 transition ${selectedCategory === 'panaderia' ? 'text-emerald-500' : ''}`}>Panadería</span>
              </button>
              <button onClick={() => handleCategorySelect('platos_fuertes')} className="flex flex-col items-center min-w-[85px] gap-3 group">
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[1.25rem] bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-3xl border-2 transition-all ${selectedCategory === 'platos_fuertes' ? 'border-emerald-500' : 'border-transparent group-hover:border-emerald-500'}`}>🍲</div>
                <span className={`text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-emerald-500 transition ${selectedCategory === 'platos_fuertes' ? 'text-emerald-500' : ''}`}>Platos</span>
              </button>
              <button onClick={() => handleCategorySelect('saludable')} className="flex flex-col items-center min-w-[85px] gap-3 group">
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[1.25rem] bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-3xl border-2 transition-all ${selectedCategory === 'saludable' ? 'border-emerald-500' : 'border-transparent group-hover:border-emerald-500'}`}>🥗</div>
                <span className={`text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-emerald-500 transition ${selectedCategory === 'saludable' ? 'text-emerald-500' : ''}`}>Saludable</span>
              </button>
              {selectedCategory && (
                <button onClick={() => setSelectedCategory(null)} className="flex flex-col items-center min-w-[85px] gap-3 group">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.25rem] bg-gray-100 dark:bg-gray-700 shadow-sm flex items-center justify-center text-xl text-gray-500 border-2 border-transparent group-hover:border-gray-400 transition-all">
                    <i className="fa-solid fa-xmark"></i>
                  </div>
                  <span className="text-xs md:text-sm font-bold text-gray-500 group-hover:text-gray-700 dark:group-hover:text-white transition">Limpiar</span>
                </button>
              )}
            </div>
          </div>

          {/* Listado de packs */}
          <div className="mb-8">
            <div className="flex justify-between items-end mb-5">
              <div>
                <h3 className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white flex items-center font-display">
                  <i className="fa-solid fa-clock text-red-500 mr-2"></i> Terminan Pronto
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1 font-body">Rescata comida de calidad antes del cierre</p>
              </div>
            </div>
            
            {filteredPacks.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-8">
                <i className="fa-solid fa-magnifying-glass text-4xl text-gray-300 mb-4 block"></i>
                <p className="text-gray-500 font-bold">No se encontraron productos que coincidan con la búsqueda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPacks.map((pack) => (
                  <div 
                    key={pack.id} 
                    onClick={() => handlePackClick(pack)}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer transition-all flex flex-col group"
                  >
                    <div className="h-44 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                      <img src={pack.imageUrl} alt={pack.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      
                      {pack.isUrgent && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center shadow-sm">
                          <i className="fa-regular fa-clock mr-1.5"></i> {pack.collectionTime}
                        </div>
                      )}
                      
                      {pack.stock <= 2 && pack.stock > 0 && (
                        <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center shadow-sm">
                          <i className="fa-solid fa-fire mr-1.5"></i> Quedan {pack.stock} packs
                        </div>
                      )}

                      {pack.stock === 0 && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white text-lg font-bold">
                          Agotado
                        </div>
                      )}
                      
                      <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xs text-gray-900 dark:text-white text-xs font-bold px-2 py-1.5 rounded-lg shadow-sm flex items-center">
                        <i className="fa-solid fa-star text-amber-500 mr-1"></i> 4.8
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mb-1 uppercase tracking-widest">{pack.storeName}</p>
                        <h4 className="font-extrabold text-gray-900 dark:text-white text-lg mb-2 line-clamp-1 font-display">{pack.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3"><i class="fa-solid fa-person-walking mr-1 text-gray-400"></i> a 1.2 km de ti</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50 dark:border-gray-700">
                        <div>
                          <span className="text-gray-400 dark:text-gray-500 line-through text-xs font-semibold block mb-0.5">${pack.originalPrice.toFixed(2)}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xl md:text-2xl">${pack.discountedPrice.toFixed(2)}</span>
                        </div>
                        <button 
                          disabled={pack.stock === 0}
                          className="btn-primary text-white w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-95"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReservePack(pack);
                          }}
                        >
                          <i className="fa-solid fa-plus text-lg"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: PRODUCT DETAIL */}
      {activeView === 'product' && selectedPack && (
        <div className="view-section px-0 md:px-6 lg:px-8 bg-white dark:bg-gray-800 md:bg-transparent min-h-screen mt-0 md:mt-28 mb-24 animate-show">
          <div className="bg-white dark:bg-gray-800 md:rounded-3xl md:shadow-md md:border md:border-gray-100 dark:md:border-gray-700 overflow-hidden relative max-w-5xl mx-auto">
            {/* Botón flotante atrás para móviles */}
            <button onClick={handleBackToHome} className="md:hidden absolute top-4 left-4 w-10 h-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 dark:text-white shadow-md z-20 active:scale-95">
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <button className="md:hidden absolute top-4 right-4 w-10 h-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 dark:text-white shadow-md z-20 active:scale-95">
              <i className="fa-regular fa-heart"></i>
            </button>

            {/* Botón atrás en Desktop */}
            <div className="hidden md:flex p-4 items-center border-b border-gray-50 dark:border-gray-700">
              <button onClick={handleBackToHome} className="text-gray-500 hover:text-emerald-500 font-bold text-sm flex items-center transition">
                <i className="fa-solid fa-arrow-left mr-2"></i> Volver a resultados
              </button>
            </div>

            {/* Split Grid */}
            <div className="flex flex-col md:flex-row">
              {/* Imagen */}
              <div className="h-72 md:h-[500px] md:w-1/2 relative w-full">
                <img src={selectedPack.imageUrl} alt={selectedPack.name} className="w-full h-full object-cover" />
              </div>

              {/* Detalles */}
              <div className="p-6 md:p-10 relative -mt-6 md:mt-0 bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-none md:w-1/2 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-1.5 flex items-center">
                    <i className="fa-solid fa-shop mr-1.5 text-gray-400"></i> {selectedPack.storeName}
                  </p>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight font-display mb-4">{selectedPack.name}</h2>
                  
                  <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base mb-6 leading-relaxed font-body">{selectedPack.description}</p>
                  
                  {/* Tarjetas de Información */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex items-start">
                      <i className="fa-solid fa-star text-amber-500 mt-0.5 mr-2"></i>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">4.8 / 5.0</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold">124 reseñas</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex items-start">
                      <i className="fa-solid fa-leaf text-emerald-500 mt-0.5 mr-2"></i>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">-{selectedPack.co2SavedKg} kg CO2e</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold">Impacto evitado</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30 mb-8">
                    <i className="fa-solid fa-clock text-red-500 text-2xl mr-4 animate-pulse"></i>
                    <div>
                      <p className="text-red-500 font-bold text-sm">Recogida Urgente Hoy</p>
                      <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">Acércate entre las {selectedPack.collectionTime} hrs</p>
                    </div>
                  </div>
                </div>

                {/* Checkout Bar */}
                <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-4 shadow-xl md:relative md:border-t-2 md:border-gray-100 dark:md:border-gray-700 md:shadow-none md:p-0 md:pt-6 z-40 mt-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-0.5 uppercase tracking-wide">Precio Original: <span className="line-through ml-1">${selectedPack.originalPrice.toFixed(2)}</span></p>
                      <div className="flex items-center">
                        <span className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">${selectedPack.discountedPrice.toFixed(2)}</span>
                        <span className="ml-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded-lg">Ahorras 70%</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleReservePack(selectedPack)}
                      disabled={selectedPack.stock === 0}
                      className="btn-primary text-white font-bold py-4 px-8 md:px-12 rounded-[1rem] shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-95 min-h-[52px] flex items-center justify-center text-lg"
                    >
                      {selectedPack.stock > 0 ? 'Reservar Pack' : 'Agotado'}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      <div id="bottom-nav-bar" className="md:hidden fixed bottom-0 left-0 z-50 w-full bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shadow-md flex justify-around items-center pt-2 pb-safe px-1">
        <button onClick={handleBackToHome} className={`nav-tab flex flex-col items-center justify-center w-full py-2 ${activeView === 'home' ? 'text-emerald-500' : 'text-gray-400'}`}>
          <i className="fa-solid fa-house text-xl mb-1"></i>
          <span className="text-[10px] font-bold">Inicio</span>
        </button>
        <button onClick={handleBackToHome} className="nav-tab flex flex-col items-center justify-center w-full py-2 text-gray-400">
          <i className="fa-solid fa-magnifying-glass text-xl mb-1"></i>
          <span className="text-[10px] font-semibold">Buscar</span>
        </button>
        <button className="nav-tab flex flex-col items-center justify-center w-full py-2 text-gray-400 relative">
          <i className="fa-solid fa-receipt text-xl mb-1"></i>
          <span className="text-[10px] font-semibold">Pedidos</span>
          <div className="absolute top-1.5 right-6 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
        </button>
      </div>
    </div>
  );
};
export default ClientDashboard;
