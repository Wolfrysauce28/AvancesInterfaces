import { LocalStorageUserRepository } from './infrastructure/repositories/LocalStorageUserRepository';
import { LocalStorageSurveyRepository } from './infrastructure/repositories/LocalStorageSurveyRepository';
import { LocalStoragePackRepository } from './infrastructure/repositories/LocalStoragePackRepository';

import { SupabaseUserRepository } from './infrastructure/repositories/SupabaseUserRepository';
import { SupabaseSurveyRepository } from './infrastructure/repositories/SupabaseSurveyRepository';
import { SupabasePackRepository } from './infrastructure/repositories/SupabasePackRepository';

import { isSupabaseConfigured } from './infrastructure/datasources/supabaseClient';

import { LoginUser } from './usecases/auth/LoginUser';
import { GetSurveyQuestions } from './usecases/survey/GetSurveyQuestions';
import { SaveSurveyAnswers } from './usecases/survey/SaveSurveyAnswers';
import { GetClientPacks } from './usecases/inventory/GetClientPacks';
import { GetAdminInventory } from './usecases/inventory/GetAdminInventory';
import { UpdatePackStock } from './usecases/inventory/UpdatePackStock';

// Decidir qué repositorios utilizar
const useSupabase = isSupabaseConfigured;

if (typeof window !== 'undefined') {
  if (useSupabase) {
    console.log('🔌 Conectado a base de datos de producción (Supabase)');
  } else {
    console.warn('⚠️ Ejecutando en modo de desarrollo local (LocalStorage). Configura PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY para activar producción.');
  }
}

// Instanciar repositorios (Infraestructura)
export const userRepository = useSupabase
  ? new SupabaseUserRepository()
  : new LocalStorageUserRepository();

export const surveyRepository = useSupabase
  ? new SupabaseSurveyRepository()
  : new LocalStorageSurveyRepository();

export const packRepository = useSupabase
  ? new SupabasePackRepository()
  : new LocalStoragePackRepository();

// Instanciar Casos de Uso (Aplicación)
export const loginUserUseCase = new LoginUser(userRepository);
export const getSurveyQuestionsUseCase = new GetSurveyQuestions(surveyRepository);
export const saveSurveyAnswersUseCase = new SaveSurveyAnswers(surveyRepository);
export const getClientPacksUseCase = new GetClientPacks(packRepository);
export const getAdminInventoryUseCase = new GetAdminInventory(packRepository);
export const updatePackStockUseCase = new UpdatePackStock(packRepository);
