import React, { useEffect, useState } from 'react';
import type { Pack } from '../../core/domain/entities/Pack';
import { getAdminInventoryUseCase, updatePackStockUseCase, packRepository } from '../../core/container';

export const AdminDashboard: React.FC = () => {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPack, setNewPack] = useState({
    name: '',
    description: '',
    originalPrice: 10.0,
    discountedPrice: 3.5,
    stock: 5,
    collectionTime: 'Hoy 19:00 - 20:00',
    category: 'panaderia',
    isUrgent: true,
  });

  const loadInventory = async () => {
    try {
      // Filtrar por la tienda del administrador (ej. store-el-trigo)
      const data = await getAdminInventoryUseCase.execute('store-el-trigo');
      setPacks(data);
    } catch (err) {
      console.error('Error cargando inventario:', err);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleUpdateStock = async (packId: string, delta: number) => {
    const pack = packs.find(p => p.id === packId);
    if (!pack) return;
    const newStock = Math.max(0, pack.stock + delta);
    try {
      const updated = await updatePackStockUseCase.execute(packId, newStock);
      setPacks(prev => prev.map(p => p.id === packId ? updated : p));
    } catch (err) {
      console.error('Error actualizando stock:', err);
    }
  };

  const handleCreatePack = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await packRepository.addPack({
        storeId: 'store-el-trigo',
        storeName: 'Panadería El Trigo',
        name: newPack.name,
        description: newPack.description,
        imageUrl: newPack.category === 'panaderia' 
          ? 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=200&q=80' 
          : 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        originalPrice: Number(newPack.originalPrice),
        discountedPrice: Number(newPack.discountedPrice),
        stock: Number(newPack.stock),
        collectionTime: newPack.collectionTime,
        isUrgent: newPack.isUrgent,
        category: newPack.category,
        co2SavedKg: 2.0,
      });

      setIsModalOpen(false);
      setNewPack({
        name: '',
        description: '',
        originalPrice: 10.0,
        discountedPrice: 3.5,
        stock: 5,
        collectionTime: 'Hoy 19:00 - 20:00',
        category: 'panaderia',
        isUrgent: true,
      });
      loadInventory();
    } catch (err) {
      console.error('Error creando pack:', err);
    }
  };

  // Calcular estadísticas básicas en tiempo real
  const totalExtraIncome = packs.reduce((acc, p) => acc + ((5 - p.stock) > 0 ? (5 - p.stock) * p.discountedPrice : 0), 124.50);
  const totalPacksSaved = packs.reduce((acc, p) => acc + ((5 - p.stock) > 0 ? (5 - p.stock) : 0), 28);
  const totalValueRecovered = packs.reduce((acc, p) => acc + ((5 - p.stock) > 0 ? (5 - p.stock) * p.originalPrice : 0), 340.00);

  return (
    <div className="view-section px-4 sm:px-6 lg:px-8 mt-24 mb-24">
      {/* Header del Local */}
      <div className="flex items-center justify-between mb-6 md:mb-8 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-2xl">🥐</div>
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white font-display">Panel KDS</h2>
            <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm font-body">Panadería El Trigo</p>
          </div>
        </div>
        <button onClick={() => window.location.href = '/'} className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 flex items-center bg-gray-50 dark:bg-gray-700 py-2.5 px-4 rounded-xl transition">
          <i className="fa-solid fa-arrow-right-from-bracket mr-2"></i> <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center">
          <div className="text-gray-500 dark:text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Ingresos extra hoy</div>
          <div className="text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">${totalExtraIncome.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center">
          <div className="text-gray-500 dark:text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Packs salvados</div>
          <div className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">{totalPacksSaved}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center">
          <div className="text-gray-500 dark:text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Valor Recuperado</div>
          <div className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">${totalValueRecovered.toFixed(2)}</div>
        </div>
        <div 
          onClick={() => setIsModalOpen(true)}
          className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white cursor-pointer hover:shadow-lg transition active:scale-95"
        >
          <div className="text-gray-300 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Acción rápida</div>
          <div className="text-lg md:text-xl font-extrabold flex items-center"><i className="fa-solid fa-plus-circle mr-2 text-emerald-500"></i> Nuevo Pack</div>
        </div>
      </div>

      {/* Listado de Inventario */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white font-display">Inventario Activo</h3>
        <div className="hidden md:flex gap-2">
          <span className="bg-gray-900 dark:bg-gray-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer">Todos</span>
          <span className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition">Agotados</span>
        </div>
      </div>

      <div className="space-y-4">
        {packs.map((pack) => (
          <div 
            key={pack.id} 
            className={`bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gray-200 dark:hover:border-gray-600 transition ${pack.stock === 0 ? 'opacity-70' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0 ${pack.stock === 0 ? 'grayscale' : ''}`}>
                <img src={pack.imageUrl} alt={pack.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-extrabold text-gray-900 dark:text-white text-base md:text-lg font-display">{pack.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Cierre: {pack.collectionTime.replace('Hoy ', '')}</p>
                <div className="flex items-center text-sm gap-2">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">${pack.discountedPrice.toFixed(2)}</span>
                  <span className="text-gray-400 dark:text-gray-500 line-through text-xs">${pack.originalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t border-gray-50 dark:border-gray-700 md:border-none pt-4 md:pt-0">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Stock</span>
                <div className="flex items-center bg-gray-50 dark:bg-gray-900 rounded-lg p-1 border border-gray-100 dark:border-gray-700">
                  <button 
                    onClick={() => handleUpdateStock(pack.id, -1)}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold rounded-md hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm transition"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-extrabold text-gray-900 dark:text-white text-lg">{pack.stock}</span>
                  <button 
                    onClick={() => handleUpdateStock(pack.id, 1)}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold rounded-md hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm transition"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div>
                {pack.stock > 0 ? (
                  <span className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-[10px] md:text-xs font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-wider">
                    Publicado
                  </span>
                ) : (
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] md:text-xs font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-wider">
                    Agotado
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CREAR PACK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-show">
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 md:p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white font-display">Crear Nuevo Pack</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleCreatePack} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Nombre del Pack</label>
                <input 
                  type="text" 
                  value={newPack.name}
                  onChange={(e) => setNewPack(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:border-emerald-500 font-medium text-sm"
                  placeholder="ej. Pack Sorpresa Salado"
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Descripción</label>
                <textarea 
                  value={newPack.description}
                  onChange={(e) => setNewPack(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:border-emerald-500 font-medium text-sm h-20"
                  placeholder="Describe los productos del pack..."
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Precio Original</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={newPack.originalPrice}
                    onChange={(e) => setNewPack(prev => ({ ...prev, originalPrice: Number(e.target.value) }))}
                    className="w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:border-emerald-500 font-medium text-sm"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Precio Descuento</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={newPack.discountedPrice}
                    onChange={(e) => setNewPack(prev => ({ ...prev, discountedPrice: Number(e.target.value) }))}
                    className="w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:border-emerald-500 font-medium text-sm"
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Stock Inicial</label>
                  <input 
                    type="number" 
                    value={newPack.stock}
                    onChange={(e) => setNewPack(prev => ({ ...prev, stock: Number(e.target.value) }))}
                    className="w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:border-emerald-500 font-medium text-sm"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Categoría</label>
                  <select 
                    value={newPack.category}
                    onChange={(e) => setNewPack(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:border-emerald-500 font-medium text-sm"
                  >
                    <option value="panaderia">Panadería</option>
                    <option value="platos_fuertes">Platos</option>
                    <option value="saludable">Saludable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Horario de Recogida</label>
                <input 
                  type="text" 
                  value={newPack.collectionTime}
                  onChange={(e) => setNewPack(prev => ({ ...prev, collectionTime: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:border-emerald-500 font-medium text-sm"
                  required 
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isUrgent"
                  checked={newPack.isUrgent}
                  onChange={(e) => setNewPack(prev => ({ ...prev, isUrgent: e.target.checked }))}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="isUrgent" className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Publicar como urgente</label>
              </div>

              <button 
                type="submit" 
                className="w-full btn-primary text-white font-bold py-3.5 px-6 rounded-xl shadow-md active:scale-95 transition-all uppercase tracking-wide text-sm mt-4"
              >
                Publicar Pack 🚀
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDashboard;
