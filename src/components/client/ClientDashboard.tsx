import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { Pack } from '../../core/domain/entities/Pack';
import { getClientPacksUseCase, updatePackStockUseCase, userRepository } from '../../core/container';

// =====================
// TYPES
// =====================
type ClientView = 'home' | 'product' | 'orders';

interface CartItem {
  pack: Pack;
  quantity: number;
}

interface Reservation {
  id: string;
  code: string;
  pack: Pack;
  quantity: number;
  timestamp: number;
  status: 'confirmed' | 'picked_up' | 'expired';
}

// =====================
// HELPERS
// =====================
const CART_STORAGE_KEY = 'foodsave_cart';
const FAVORITES_STORAGE_KEY = 'foodsave_favorites';
const RESERVATIONS_STORAGE_KEY = 'foodsave_reservations';
const LOCATION_STORAGE_KEY = 'foodsave_location';

const PRESET_LOCATIONS = [
  { label: 'Av. Providencia 1234', icon: 'fa-house' },
  { label: 'Oficina Centro, Piso 5', icon: 'fa-building' },
  { label: 'Universidad Campus Norte', icon: 'fa-graduation-cap' },
  { label: 'Plaza Central, Local 12', icon: 'fa-store' },
];

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function generateReservationCode(): string {
  return `RES-${Math.floor(1000 + Math.random() * 9000)}`;
}

// =====================
// SUB-COMPONENTS
// =====================

/** Skeleton loader for pack cards */
const PackCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
    <div className="h-44 skeleton" />
    <div className="p-5 space-y-3">
      <div className="h-3 w-20 skeleton" />
      <div className="h-5 w-3/4 skeleton" />
      <div className="h-3 w-1/2 skeleton" />
      <div className="flex justify-between items-center pt-3 border-t border-gray-50 dark:border-gray-700">
        <div className="space-y-1">
          <div className="h-3 w-12 skeleton" />
          <div className="h-6 w-16 skeleton" />
        </div>
        <div className="w-10 h-10 rounded-xl skeleton" />
      </div>
    </div>
  </div>
);

/** Confetti burst effect */
const ConfettiEffect: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  const colors = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="confetti-piece rounded-sm"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: colors[i % colors.length],
            animationDelay: `${Math.random() * 0.6}s`,
            animationDuration: `${1.5 + Math.random() * 1.5}s`,
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
};

/** Toast notification */
const Toast: React.FC<{
  message: string;
  subMessage?: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}> = ({ message, subMessage, type, onClose, duration = 5000 }) => {
  const bgColors = {
    success: 'bg-emerald-600 border-emerald-400',
    error: 'bg-red-600 border-red-400',
    info: 'bg-blue-600 border-blue-400',
  };
  const icons = {
    success: 'fa-circle-check',
    error: 'fa-circle-exclamation',
    info: 'fa-circle-info',
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-lg px-4 animate-slide-up-modal">
      <div className={`${bgColors[type]} text-white p-4 rounded-2xl shadow-xl border-2 relative overflow-hidden`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <i className={`fa-solid ${icons[type]} text-2xl text-white mt-0.5`} />
            <div>
              <p className="text-sm font-bold">{message}</p>
              {subMessage && <p className="text-xs text-white/80 mt-0.5">{subMessage}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white font-bold p-1 flex-shrink-0" aria-label="Cerrar notificación">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-white/30 toast-progress-bar" style={{ animationDuration: `${duration}ms` }} />
      </div>
    </div>
  );
};

// =====================
// MAIN COMPONENT
// =====================
export const ClientDashboard: React.FC = () => {
  // --- Core State ---
  const [packs, setPacks] = useState<Pack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<ClientView>('home');
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // --- Profile State ---
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // --- Cart State ---
  const [cart, setCart] = useState<CartItem[]>(() => loadFromStorage(CART_STORAGE_KEY, []));
  const [isCartOpen, setIsCartOpen] = useState(false);

  // --- Favorites State ---
  const [favorites, setFavorites] = useState<string[]>(() => loadFromStorage(FAVORITES_STORAGE_KEY, []));

  // --- Orders State ---
  const [reservations, setReservations] = useState<Reservation[]>(() => loadFromStorage(RESERVATIONS_STORAGE_KEY, []));

  // --- Location State ---
  const [selectedLocation, setSelectedLocation] = useState(() => loadFromStorage(LOCATION_STORAGE_KEY, PRESET_LOCATIONS[0].label));
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  // --- Confirmation Modal State ---
  const [confirmPack, setConfirmPack] = useState<Pack | null>(null);
  const [isReserving, setIsReserving] = useState(false);

  // --- Toast State ---
  const [toast, setToast] = useState<{ message: string; subMessage?: string; type: 'success' | 'error' | 'info' } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Confetti State ---
  const [showConfetti, setShowConfetti] = useState(false);

  // ---- EFFECTS ----

  // Fetch logged in user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const u = await userRepository.getCurrentUser();
        if (u) {
          setCurrentUser(u);
          setEditName(u.name);
          setEditAvatarUrl(u.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.email.split('@')[0]}`);
        }
      } catch (err) {
        console.error('Error fetching user info:', err);
      }
    };
    fetchUser();
  }, []);

  // Sync body data-view
  useEffect(() => {
    document.body.setAttribute('data-view', activeView === 'product' ? 'product' : 'home');
    return () => { document.body.removeAttribute('data-view'); };
  }, [activeView]);

  // Load packs
  const loadPacks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getClientPacksUseCase.execute();
      setPacks(data);
    } catch (err) {
      console.error('Error cargando packs:', err);
      showToast('Error al cargar los productos', 'Intenta recargar la página', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadPacks(); }, [loadPacks]);

  // Persist cart, favorites, reservations
  useEffect(() => { saveToStorage(CART_STORAGE_KEY, cart); }, [cart]);
  useEffect(() => { saveToStorage(FAVORITES_STORAGE_KEY, favorites); }, [favorites]);
  useEffect(() => { saveToStorage(RESERVATIONS_STORAGE_KEY, reservations); }, [reservations]);
  useEffect(() => { saveToStorage(LOCATION_STORAGE_KEY, selectedLocation); }, [selectedLocation]);

  // ---- TOAST ----
  const showToast = useCallback((message: string, subMessage?: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, subMessage, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 5000);
  }, []);

  // ---- NAVIGATION ----
  const handlePackClick = (pack: Pack) => {
    setSelectedPack(pack);
    setActiveView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setActiveView('home');
    setSelectedPack(null);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || isSavingProfile) return;
    setIsSavingProfile(true);
    try {
      const updated = await userRepository.updateProfile(currentUser.id, {
        name: editName,
        avatarUrl: editAvatarUrl,
      });
      setCurrentUser(updated);
      setIsProfileOpen(false);
      showToast('¡Perfil actualizado con éxito! 🎉', '', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error al actualizar el perfil', 'Intenta nuevamente', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    try {
      await userRepository.logout();
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      window.location.href = '/';
    }
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(prev => prev === category ? null : category);
  };

  // ---- CART ----
  const addToCart = (pack: Pack) => {
    if (pack.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.pack.id === pack.id);
      if (existing) {
        if (existing.quantity >= pack.stock) {
          showToast('Stock máximo alcanzado', `Solo quedan ${pack.stock} unidades`, 'info');
          return prev;
        }
        return prev.map(item =>
          item.pack.id === pack.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { pack, quantity: 1 }];
    });
    showToast('Agregado al carrito', `${pack.name} · ${pack.storeName}`, 'success');
  };

  const removeFromCart = (packId: string) => {
    setCart(prev => prev.filter(item => item.pack.id !== packId));
  };

  const updateCartQuantity = (packId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.pack.id !== packId) return item;
      const newQty = item.quantity + delta;
      if (newQty <= 0) return item;
      if (newQty > item.pack.stock) {
        showToast('Stock máximo alcanzado', '', 'info');
        return item;
      }
      return { ...item, quantity: newQty };
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.pack.discountedPrice * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ---- FAVORITES ----
  const toggleFavorite = (packId: string) => {
    setFavorites(prev =>
      prev.includes(packId) ? prev.filter(id => id !== packId) : [...prev, packId]
    );
  };

  // ---- RESERVATION ----
  const openConfirmation = (pack: Pack) => {
    setConfirmPack(pack);
  };

  const handleConfirmReservation = async () => {
    if (!confirmPack || isReserving) return;
    setIsReserving(true);

    try {
      // Get total quantity from cart for this pack, or 1 if direct
      const cartItem = cart.find(item => item.pack.id === confirmPack.id);
      const quantity = cartItem ? cartItem.quantity : 1;

      if (confirmPack.stock < quantity) {
        showToast('Stock insuficiente', 'Otro usuario reservó antes. Intenta con menos unidades.', 'error');
        setIsReserving(false);
        return;
      }

      const updatedPack = await updatePackStockUseCase.execute(confirmPack.id, confirmPack.stock - quantity);
      setPacks(prev => prev.map(p => p.id === confirmPack.id ? updatedPack : p));

      const code = generateReservationCode();
      const newReservation: Reservation = {
        id: `res-${Date.now()}`,
        code,
        pack: { ...confirmPack },
        quantity,
        timestamp: Date.now(),
        status: 'confirmed',
      };
      setReservations(prev => [newReservation, ...prev]);

      // Remove from cart
      removeFromCart(confirmPack.id);

      setConfirmPack(null);
      setIsCartOpen(false);

      // Show confetti
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);

      showToast(
        `¡Reserva confirmada! Código: ${code}`,
        `Retira en ${confirmPack.storeName} entre las ${confirmPack.collectionTime}. Evitaste ${confirmPack.co2SavedKg * quantity} kg de CO2 🌍`,
        'success'
      );

      // Go back to home if in product detail
      if (activeView === 'product') {
        setTimeout(handleBackToHome, 800);
      }
    } catch (err) {
      console.error('Error al reservar:', err);
      showToast('Error al procesar la reserva', 'Intenta nuevamente', 'error');
    } finally {
      setIsReserving(false);
    }
  };

  // Confirm all cart items
  const handleConfirmAllCart = async () => {
    if (cart.length === 0 || isReserving) return;
    setIsReserving(true);

    try {
      const newReservations: Reservation[] = [];

      for (const item of cart) {
        if (item.pack.stock < item.quantity) {
          showToast('Stock insuficiente', `${item.pack.name} ya no tiene suficientes unidades`, 'error');
          setIsReserving(false);
          return;
        }

        const updatedPack = await updatePackStockUseCase.execute(item.pack.id, item.pack.stock - item.quantity);
        setPacks(prev => prev.map(p => p.id === item.pack.id ? updatedPack : p));

        newReservations.push({
          id: `res-${Date.now()}-${item.pack.id}`,
          code: generateReservationCode(),
          pack: { ...item.pack },
          quantity: item.quantity,
          timestamp: Date.now(),
          status: 'confirmed',
        });
      }

      setReservations(prev => [...newReservations, ...prev]);
      setCart([]);
      setIsCartOpen(false);

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);

      showToast(
        `¡${newReservations.length} reserva(s) confirmada(s)!`,
        `Revisa tus pedidos para ver los códigos de retiro 📋`,
        'success'
      );
    } catch (err) {
      console.error('Error al reservar:', err);
      showToast('Error al procesar las reservas', 'Intenta nuevamente', 'error');
    } finally {
      setIsReserving(false);
    }
  };

  // ---- FILTERING ----
  const filteredPacks = packs.filter(pack => {
    const matchesSearch = pack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pack.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pack.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? pack.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // =====================
  // RENDER
  // =====================
  return (
    <div>
      {/* CONFETTI */}
      <ConfettiEffect active={showConfetti} />

      {/* TOAST */}
      {toast && (
        <Toast
          message={toast.message}
          subMessage={toast.subMessage}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* CONFIRMATION MODAL */}
      {confirmPack && (
        <div className="fixed inset-0 z-[1100] flex items-end md:items-center justify-center modal-overlay animate-show" onClick={() => !isReserving && setConfirmPack(null)}>
          <div
            className="bg-white dark:bg-gray-800 w-full max-w-md md:rounded-3xl rounded-t-3xl shadow-2xl border border-gray-100 dark:border-gray-700 animate-slide-up-modal overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header with image */}
            <div className="relative h-40 overflow-hidden">
              <img src={confirmPack.imageUrl} alt={confirmPack.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5">
                <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">{confirmPack.storeName}</p>
                <h3 className="text-white text-xl font-extrabold font-display">{confirmPack.name}</h3>
              </div>
              <button
                onClick={() => setConfirmPack(null)}
                disabled={isReserving}
                className="absolute top-3 right-3 w-9 h-9 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 dark:text-white shadow-md disabled:opacity-50"
                aria-label="Cerrar confirmación"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            {/* Details */}
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Precio Original: <span className="line-through ml-1">${confirmPack.originalPrice.toFixed(2)}</span></p>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-extrabold text-gray-900 dark:text-white">${confirmPack.discountedPrice.toFixed(2)}</span>
                    <span className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded-lg">
                      Ahorras {Math.round((1 - confirmPack.discountedPrice / confirmPack.originalPrice) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Disponibles</p>
                  <p className="text-lg font-extrabold text-gray-900 dark:text-white">{confirmPack.stock}</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/30 gap-3">
                <i className="fa-solid fa-clock text-amber-500 text-lg" />
                <div>
                  <p className="text-amber-700 dark:text-amber-400 font-bold text-xs">Recogida: {confirmPack.collectionTime}</p>
                  <p className="text-amber-600/70 dark:text-amber-500/70 text-[10px]">Presenta tu código al retirar</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <i className="fa-solid fa-leaf text-emerald-500" />
                <p className="text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                  Evitarás {confirmPack.co2SavedKg} kg de CO2 con esta reserva 🌍
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setConfirmPack(null)}
                  disabled={isReserving}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-4 px-4 rounded-2xl transition active:scale-95 disabled:opacity-50 text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmReservation}
                  disabled={isReserving || confirmPack.stock <= 0}
                  className="flex-[2] btn-primary text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                >
                  {isReserving ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Reservando...</>
                  ) : (
                    <><i className="fa-solid fa-check" /> Confirmar Reserva</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[900] modal-overlay animate-show" onClick={() => setIsCartOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl animate-slide-in-right flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Cart Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white font-display flex items-center gap-2">
                <i className="fa-solid fa-basket-shopping text-emerald-500" /> Mi Carrito
                {cartCount > 0 && (
                  <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">{cartCount}</span>
                )}
              </h3>
              <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-white transition" aria-label="Cerrar carrito">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="text-5xl animate-bounce-in">🛒</div>
                  <p className="font-bold text-gray-500 dark:text-gray-400">Tu carrito está vacío</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] mx-auto">Explora el menú y agrega packs para rescatar comida deliciosa</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.pack.id} className="flex gap-4 bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                    <img src={item.pack.imageUrl} alt={item.pack.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{item.pack.storeName}</p>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{item.pack.name}</h4>
                      <p className="text-emerald-600 dark:text-emerald-400 font-extrabold text-lg">${item.pack.discountedPrice.toFixed(2)}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                          <button onClick={() => updateCartQuantity(item.pack.id, -1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-emerald-500 transition" aria-label="Reducir cantidad">−</button>
                          <span className="w-8 text-center font-bold text-sm text-gray-900 dark:text-white">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.pack.id, 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-emerald-500 transition" aria-label="Aumentar cantidad">+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.pack.id)} className="text-red-400 hover:text-red-500 text-xs font-bold transition" aria-label="Eliminar del carrito">
                          <i className="fa-solid fa-trash-can" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-gray-100 dark:border-gray-700 space-y-4 pb-safe">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400 font-bold text-sm">Total ({cartCount} items)</span>
                  <span className="text-2xl font-extrabold text-gray-900 dark:text-white">${cartTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleConfirmAllCart}
                  disabled={isReserving}
                  className="w-full btn-primary text-white font-bold py-4 rounded-2xl shadow-lg transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-base"
                >
                  {isReserving ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Procesando...</>
                  ) : (
                    <><i className="fa-solid fa-check-double" /> Confirmar {cartCount} Reserva{cartCount > 1 ? 's' : ''}</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LOCATION DROPDOWN */}
      {isLocationOpen && (
        <div className="fixed inset-0 z-[800]" onClick={() => setIsLocationOpen(false)}>
          <div
            className="absolute top-16 left-4 md:left-28 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-72 animate-show overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-3 border-b border-gray-100 dark:border-gray-700">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Seleccionar ubicación</p>
            </div>
            {PRESET_LOCATIONS.map(loc => (
              <button
                key={loc.label}
                onClick={() => { setSelectedLocation(loc.label); setIsLocationOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left ${selectedLocation === loc.label ? 'bg-emerald-50 dark:bg-emerald-950/30' : ''}`}
              >
                <i className={`fa-solid ${loc.icon} text-gray-400 ${selectedLocation === loc.label ? 'text-emerald-500' : ''} w-5 text-center`} />
                <span className={`text-sm font-semibold ${selectedLocation === loc.label ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>{loc.label}</span>
                {selectedLocation === loc.label && <i className="fa-solid fa-check text-emerald-500 ml-auto text-xs" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TOP NAVBAR (Hidden on product detail mobile) */}
      <nav id="top-nav-bar" className={`bg-white dark:bg-gray-800 shadow-sm fixed w-full top-0 z-50 transition-all duration-300 ${activeView === 'product' ? 'hidden md:block' : 'block'}`} role="navigation" aria-label="Navegación principal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-4 md:gap-8">
              <div className="flex-shrink-0 flex items-center cursor-pointer active:scale-95 transition" onClick={handleBackToHome} role="button" aria-label="Ir al inicio">
                <div className="w-9 h-9 md:w-11 md:h-11 bg-brand-500 btn-primary rounded-2xl flex items-center justify-center text-white text-lg md:text-xl shadow-md mr-3">
                  <i className="fa-solid fa-leaf" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight hidden md:block text-gray-900 dark:text-white">Food<span className="text-emerald-500">Save</span></h1>
              </div>

              {/* Location Selector */}
              <div
                className="flex flex-col cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1.5 md:p-2 rounded-lg transition"
                onClick={() => setIsLocationOpen(!isLocationOpen)}
                role="button"
                aria-label="Seleccionar ubicación de entrega"
                aria-expanded={isLocationOpen}
              >
                <span className="hidden md:block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Entregar en</span>
                <div className="flex items-center text-sm md:text-base font-bold text-gray-900 dark:text-white max-w-[160px] md:max-w-xs">
                  <i className="fa-solid fa-location-dot text-red-500 mr-2 text-base md:text-lg" />
                  <span className="truncate">{selectedLocation}</span>
                  <i className={`fa-solid fa-chevron-down ml-2 text-gray-400 text-[10px] md:text-xs transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>

            {/* Desktop Search */}
            <div className="hidden md:block flex-1 max-w-2xl px-8">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-magnifying-glass text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-gray-800 focus:border-transparent text-sm font-medium transition-all shadow-inner"
                  placeholder="Buscar restaurantes, panaderías, platos rescatados..."
                  aria-label="Buscar productos"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 md:gap-4">
              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 md:p-3 text-gray-600 dark:text-gray-300 hover:text-emerald-500 transition active:scale-95 bg-gray-50 dark:bg-gray-700 rounded-full md:bg-transparent"
                aria-label={`Abrir carrito, ${cartCount} items`}
              >
                <i className="fa-solid fa-basket-shopping text-lg md:text-xl" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 md:top-1 md:right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm transform translate-x-1/4 -translate-y-1/4 animate-bounce-in">
                    {cartCount}
                  </span>
                )}
              </button>

              <button className="flex md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-emerald-500 transition active:scale-95 bg-gray-50 dark:bg-gray-700 rounded-full" onClick={() => setIsProfileOpen(true)} aria-label="Ver perfil">
                <img src={currentUser?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser?.email?.split('@')[0] || 'default'}`} alt="Perfil" className="w-6 h-6 rounded-full object-cover" />
              </button>

              <button className="hidden md:flex items-center gap-3 p-1.5 pr-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition border border-gray-100 dark:border-gray-700 shadow-sm" onClick={() => setIsProfileOpen(true)} aria-label="Perfil y configuración">
                <img src={currentUser?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser?.email?.split('@')[0] || 'default'}`} alt="Perfil" loading="lazy" className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 object-cover" />
                <div className="flex flex-col items-start">
                  <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{currentUser?.name || 'Cargando...'}</span>
                  <span className="text-[10px] font-semibold text-emerald-500 leading-tight">Editar Perfil</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div id="mobile-search-bar" className="md:hidden px-4 pb-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <i className="fa-solid fa-magnifying-glass text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium transition shadow-inner"
              placeholder="¿Qué vas a rescatar hoy?"
              aria-label="Buscar productos"
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
            <i className="fa-solid fa-bag-shopping text-8xl md:text-[120px] absolute -right-6 -bottom-6 text-white/10 transform -rotate-12" />
          </div>

          {/* Categories */}
          <div className="mb-10">
            <h3 className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white mb-4 font-display">Explorar Categorías</h3>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2" role="tablist" aria-label="Filtrar por categoría">
              <button onClick={() => handleCategorySelect('panaderia')} className="flex flex-col items-center min-w-[85px] gap-3 group" role="tab" aria-selected={selectedCategory === 'panaderia'}>
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[1.25rem] bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-3xl border-2 transition-all ${selectedCategory === 'panaderia' ? 'border-emerald-500' : 'border-transparent group-hover:border-emerald-500'}`}>🥐</div>
                <span className={`text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-emerald-500 transition ${selectedCategory === 'panaderia' ? 'text-emerald-500' : ''}`}>Panadería</span>
              </button>
              <button onClick={() => handleCategorySelect('platos_fuertes')} className="flex flex-col items-center min-w-[85px] gap-3 group" role="tab" aria-selected={selectedCategory === 'platos_fuertes'}>
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[1.25rem] bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-3xl border-2 transition-all ${selectedCategory === 'platos_fuertes' ? 'border-emerald-500' : 'border-transparent group-hover:border-emerald-500'}`}>🍲</div>
                <span className={`text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-emerald-500 transition ${selectedCategory === 'platos_fuertes' ? 'text-emerald-500' : ''}`}>Platos</span>
              </button>
              <button onClick={() => handleCategorySelect('saludable')} className="flex flex-col items-center min-w-[85px] gap-3 group" role="tab" aria-selected={selectedCategory === 'saludable'}>
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[1.25rem] bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-3xl border-2 transition-all ${selectedCategory === 'saludable' ? 'border-emerald-500' : 'border-transparent group-hover:border-emerald-500'}`}>🥗</div>
                <span className={`text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-emerald-500 transition ${selectedCategory === 'saludable' ? 'text-emerald-500' : ''}`}>Saludable</span>
              </button>
              {selectedCategory && (
                <button onClick={() => setSelectedCategory(null)} className="flex flex-col items-center min-w-[85px] gap-3 group" aria-label="Limpiar filtro">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.25rem] bg-gray-100 dark:bg-gray-700 shadow-sm flex items-center justify-center text-xl text-gray-500 border-2 border-transparent group-hover:border-gray-400 transition-all">
                    <i className="fa-solid fa-xmark" />
                  </div>
                  <span className="text-xs md:text-sm font-bold text-gray-500 group-hover:text-gray-700 dark:group-hover:text-white transition">Limpiar</span>
                </button>
              )}
            </div>
          </div>

          {/* Pack Listing */}
          <div className="mb-8">
            <div className="flex justify-between items-end mb-5">
              <div>
                <h3 className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white flex items-center font-display">
                  <i className="fa-solid fa-clock text-red-500 mr-2" /> Terminan Pronto
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1 font-body">Rescata comida de calidad antes del cierre</p>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <PackCardSkeleton key={i} />)}
              </div>
            ) : filteredPacks.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-8">
                <i className="fa-solid fa-magnifying-glass text-4xl text-gray-300 mb-4 block" />
                <p className="text-gray-500 font-bold">No se encontraron productos que coincidan con la búsqueda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPacks.map((pack) => (
                  <div
                    key={pack.id}
                    onClick={() => handlePackClick(pack)}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer transition-all flex flex-col group"
                    role="article"
                    aria-label={`${pack.name} - ${pack.storeName}`}
                  >
                    <div className="h-44 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                      <img src={pack.imageUrl} alt={pack.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />

                      {pack.isUrgent && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center shadow-sm">
                          <i className="fa-regular fa-clock mr-1.5" /> {pack.collectionTime}
                        </div>
                      )}

                      {pack.stock <= 2 && pack.stock > 0 && !pack.isUrgent && (
                        <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center shadow-sm animate-pulse-glow">
                          <i className="fa-solid fa-fire mr-1.5" /> Quedan {pack.stock} packs
                        </div>
                      )}

                      {pack.stock === 0 && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white text-lg font-bold">
                          Agotado
                        </div>
                      )}

                      <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xs text-gray-900 dark:text-white text-xs font-bold px-2 py-1.5 rounded-lg shadow-sm flex items-center">
                        <i className="fa-solid fa-star text-amber-500 mr-1" /> 4.8
                      </div>

                      {/* Favorite button on card */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(pack.id); }}
                        className="absolute bottom-3 right-3 w-8 h-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xs rounded-full flex items-center justify-center shadow-sm transition active:scale-90"
                        aria-label={favorites.includes(pack.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                      >
                        <i className={`${favorites.includes(pack.id) ? 'fa-solid text-red-500' : 'fa-regular text-gray-500'} fa-heart text-sm transition-colors`} />
                      </button>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mb-1 uppercase tracking-widest">{pack.storeName}</p>
                        <h4 className="font-extrabold text-gray-900 dark:text-white text-lg mb-2 line-clamp-1 font-display">{pack.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3"><i className="fa-solid fa-person-walking mr-1 text-gray-400" /> a 1.2 km de ti</p>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50 dark:border-gray-700">
                        <div>
                          <span className="text-gray-400 dark:text-gray-500 line-through text-xs font-semibold block mb-0.5">${pack.originalPrice.toFixed(2)}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xl md:text-2xl">${pack.discountedPrice.toFixed(2)}</span>
                        </div>
                        <button
                          disabled={pack.stock === 0}
                          className="btn-primary text-white w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-95"
                          onClick={(e) => { e.stopPropagation(); addToCart(pack); }}
                          aria-label={`Agregar ${pack.name} al carrito`}
                        >
                          <i className="fa-solid fa-plus text-lg" />
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

      {/* VIEW: ORDERS */}
      {activeView === 'orders' && (
        <div className="view-section px-4 sm:px-6 lg:px-8 mt-44 md:mt-28 mb-24">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white font-display flex items-center gap-2">
              <i className="fa-solid fa-receipt text-emerald-500" /> Mis Pedidos
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-body">Historial de reservas y códigos de retiro</p>
          </div>

          {reservations.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl">
              <div className="text-5xl mb-4 animate-bounce-in">📋</div>
              <p className="font-bold text-gray-500 dark:text-gray-400">Aún no tienes pedidos</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-[250px] mx-auto">Explora el menú y reserva tu primer pack para comenzar a rescatar comida</p>
              <button onClick={handleBackToHome} className="mt-6 btn-primary text-white font-bold py-3 px-6 rounded-xl shadow-md transition active:scale-95 text-sm">
                Explorar Packs
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map(res => (
                <div key={res.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="flex gap-4">
                    <img src={res.pack.imageUrl} alt={res.pack.name} className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{res.pack.storeName}</p>
                          <h4 className="font-extrabold text-gray-900 dark:text-white text-base font-display">{res.pack.name}</h4>
                        </div>
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider flex-shrink-0 ${
                          res.status === 'confirmed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900'
                            : res.status === 'picked_up'
                              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600'
                        }`}>
                          {res.status === 'confirmed' ? 'Confirmado' : res.status === 'picked_up' ? 'Retirado' : 'Expirado'}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <span><i className="fa-solid fa-hashtag mr-1 text-emerald-500" />{res.code}</span>
                        <span><i className="fa-regular fa-clock mr-1" />{res.pack.collectionTime}</span>
                        <span><i className="fa-solid fa-box mr-1" />{res.quantity} pack{res.quantity > 1 ? 's' : ''}</span>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 dark:border-gray-700">
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-lg">${(res.pack.discountedPrice * res.quantity).toFixed(2)}</span>
                        <span className="text-[10px] text-gray-500">{new Date(res.timestamp).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW: PRODUCT DETAIL */}
      {activeView === 'product' && selectedPack && (
        <div className="view-section px-0 md:px-6 lg:px-8 bg-white dark:bg-gray-800 md:bg-transparent min-h-screen mt-0 md:mt-28 mb-24 animate-show">
          <div className="bg-white dark:bg-gray-800 md:rounded-3xl md:shadow-md md:border md:border-gray-100 dark:md:border-gray-700 overflow-hidden relative max-w-5xl mx-auto">
            {/* Mobile floating buttons */}
            <button onClick={handleBackToHome} className="md:hidden absolute top-4 left-4 w-10 h-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 dark:text-white shadow-md z-20 active:scale-95" aria-label="Volver">
              <i className="fa-solid fa-arrow-left" />
            </button>
            <button
              onClick={() => toggleFavorite(selectedPack.id)}
              className="md:hidden absolute top-4 right-4 w-10 h-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-md z-20 active:scale-95"
              aria-label={favorites.includes(selectedPack.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              <i className={`${favorites.includes(selectedPack.id) ? 'fa-solid text-red-500' : 'fa-regular text-gray-500'} fa-heart transition-colors`} />
            </button>

            {/* Desktop back button */}
            <div className="hidden md:flex p-4 items-center border-b border-gray-50 dark:border-gray-700 justify-between">
              <button onClick={handleBackToHome} className="text-gray-500 hover:text-emerald-500 font-bold text-sm flex items-center transition">
                <i className="fa-solid fa-arrow-left mr-2" /> Volver a resultados
              </button>
              <button
                onClick={() => toggleFavorite(selectedPack.id)}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-500 transition"
                aria-label={favorites.includes(selectedPack.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <i className={`${favorites.includes(selectedPack.id) ? 'fa-solid text-red-500' : 'fa-regular'} fa-heart`} />
                {favorites.includes(selectedPack.id) ? 'Guardado' : 'Guardar'}
              </button>
            </div>

            {/* Split Grid */}
            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div className="h-72 md:h-[500px] md:w-1/2 relative w-full">
                <img src={selectedPack.imageUrl} alt={selectedPack.name} loading="lazy" className="w-full h-full object-cover" />
              </div>

              {/* Details */}
              <div className="p-6 md:p-10 relative -mt-6 md:mt-0 bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-none md:w-1/2 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-1.5 flex items-center">
                    <i className="fa-solid fa-shop mr-1.5 text-gray-400" /> {selectedPack.storeName}
                  </p>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight font-display mb-4">{selectedPack.name}</h2>

                  <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base mb-6 leading-relaxed font-body">{selectedPack.description}</p>

                  {/* Info Cards */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex items-start">
                      <i className="fa-solid fa-star text-amber-500 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">4.8 / 5.0</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold">124 reseñas</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex items-start">
                      <i className="fa-solid fa-leaf text-emerald-500 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">-{selectedPack.co2SavedKg} kg CO2e</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold">Impacto evitado</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30 mb-8">
                    <i className="fa-solid fa-clock text-red-500 text-2xl mr-4 animate-pulse" />
                    <div>
                      <p className="text-red-500 font-bold text-sm">Recogida Urgente Hoy</p>
                      <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">Acércate entre las {selectedPack.collectionTime} hrs</p>
                    </div>
                  </div>
                </div>

                {/* Checkout Bar */}
                <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-4 shadow-xl md:relative md:border-t-2 md:border-gray-100 dark:md:border-gray-700 md:shadow-none md:p-0 md:pt-6 z-40 mt-auto pb-safe">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-0.5 uppercase tracking-wide">Precio Original: <span className="line-through ml-1">${selectedPack.originalPrice.toFixed(2)}</span></p>
                      <div className="flex items-center">
                        <span className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">${selectedPack.discountedPrice.toFixed(2)}</span>
                        <span className="ml-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded-lg">
                          Ahorras {Math.round((1 - selectedPack.discountedPrice / selectedPack.originalPrice) * 100)}%
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => openConfirmation(selectedPack)}
                      disabled={selectedPack.stock === 0}
                      className="btn-primary text-white font-bold py-4 px-8 md:px-12 rounded-[1rem] shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-95 min-h-[52px] flex items-center justify-center text-lg gap-2"
                      aria-label={selectedPack.stock > 0 ? 'Reservar Pack' : 'Agotado'}
                    >
                      {selectedPack.stock > 0 ? (
                        <><i className="fa-solid fa-basket-shopping" /> Reservar Pack</>
                      ) : 'Agotado'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      {activeView !== 'product' && (
        <div id="bottom-nav-bar" className="md:hidden fixed bottom-0 left-0 z-50 w-full bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shadow-md flex justify-around items-center pt-2 pb-safe px-1" role="navigation" aria-label="Navegación inferior">
          <button
            onClick={handleBackToHome}
            className={`nav-tab flex flex-col items-center justify-center w-full py-2 transition ${activeView === 'home' ? 'text-emerald-500' : 'text-gray-400'}`}
            aria-label="Inicio"
            aria-current={activeView === 'home' ? 'page' : undefined}
          >
            <i className="fa-solid fa-house text-xl mb-1" />
            <span className="text-[10px] font-bold">Inicio</span>
          </button>
          <button
            onClick={() => { handleBackToHome(); /* Focus search after navigating */ setTimeout(() => document.querySelector<HTMLInputElement>('#mobile-search-bar input')?.focus(), 100); }}
            className="nav-tab flex flex-col items-center justify-center w-full py-2 text-gray-400"
            aria-label="Buscar"
          >
            <i className="fa-solid fa-magnifying-glass text-xl mb-1" />
            <span className="text-[10px] font-semibold">Buscar</span>
          </button>
          <button
            onClick={() => setActiveView('orders')}
            className={`nav-tab flex flex-col items-center justify-center w-full py-2 relative transition ${activeView === 'orders' ? 'text-emerald-500' : 'text-gray-400'}`}
            aria-label={`Pedidos${reservations.length > 0 ? `, ${reservations.length} pedidos` : ''}`}
            aria-current={activeView === 'orders' ? 'page' : undefined}
          >
            <i className="fa-solid fa-receipt text-xl mb-1" />
            <span className="text-[10px] font-semibold">Pedidos</span>
            {reservations.filter(r => r.status === 'confirmed').length > 0 && (
              <div className="absolute top-1.5 right-6 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-800" />
            )}
          </button>
        </div>
      )}
      {/* PROFILE SETTINGS MODAL */}
      {isProfileOpen && currentUser && (
        <div className="fixed inset-0 z-[1100] flex items-end md:items-center justify-center modal-overlay animate-show" onClick={() => !isSavingProfile && setIsProfileOpen(false)}>
          <div
            className="bg-white dark:bg-gray-800 w-full max-w-md md:rounded-3xl rounded-t-3xl shadow-2xl border border-gray-100 dark:border-gray-700 animate-slide-up-modal overflow-hidden p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white font-display">Configuración de Perfil</h3>
              <button onClick={() => setIsProfileOpen(false)} disabled={isSavingProfile} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Cerrar modal">
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex flex-col items-center gap-3 mb-6">
                <img 
                  src={editAvatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.email}`} 
                  alt="Vista previa de avatar" 
                  className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    const randomSeed = Math.random().toString(36).substring(7);
                    setEditAvatarUrl(`https://api.dicebear.com/7.x/bottts/svg?seed=${randomSeed}`);
                  }}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Cambiar avatar aleatoriamente 🤖
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:border-emerald-500 font-medium text-sm"
                  placeholder="Tu nombre completo"
                  required
                  maxLength={50}
                  aria-label="Nombre completo"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Correo Electrónico (No editable)</label>
                <input
                  type="text"
                  value={currentUser.email}
                  disabled
                  className="w-full bg-gray-100 dark:bg-gray-700 text-gray-400 border border-gray-200 dark:border-gray-600 rounded-xl p-3 outline-none font-medium text-sm cursor-not-allowed"
                  aria-label="Correo electrónico"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isSavingProfile}
                  className="flex-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-bold py-3.5 px-4 rounded-xl transition active:scale-95 text-xs flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket" /> Cerrar Sesión
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex-[2] btn-primary text-white font-bold py-3.5 px-6 rounded-xl shadow-md active:scale-95 transition-all uppercase tracking-wide text-xs flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSavingProfile ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Guardando...</>
                  ) : (
                    'Guardar Cambios'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ClientDashboard;
