import { LocalStorageUserRepository } from './infrastructure/repositories/LocalStorageUserRepository';
import { LocalStorageSurveyRepository } from './infrastructure/repositories/LocalStorageSurveyRepository';
import { LocalStoragePackRepository } from './infrastructure/repositories/LocalStoragePackRepository';

import { SupabaseUserRepository } from './infrastructure/repositories/SupabaseUserRepository';
import { SupabaseSurveyRepository } from './infrastructure/repositories/SupabaseSurveyRepository';
import { SupabasePackRepository } from './infrastructure/repositories/SupabasePackRepository';

import { isSupabaseConfigured } from './infrastructure/datasources/supabaseClient';
import { isBrowser } from './infrastructure/helpers/env';

import type { UserRepository } from './domain/repositories/UserRepository';
import type { SurveyRepository } from './domain/repositories/SurveyRepository';
import type { PackRepository } from './domain/repositories/PackRepository';

import { LoginUser } from './usecases/auth/LoginUser';
import { LoginWithGoogle } from './usecases/auth/LoginWithGoogle';
import { GetSurveyQuestions } from './usecases/survey/GetSurveyQuestions';
import { SaveSurveyAnswers } from './usecases/survey/SaveSurveyAnswers';
import { GetClientPacks } from './usecases/inventory/GetClientPacks';
import { GetAdminInventory } from './usecases/inventory/GetAdminInventory';
import { UpdatePackStock } from './usecases/inventory/UpdatePackStock';

const shouldUseSupabase = (): boolean => isSupabaseConfigured;

function createUserRepository(): UserRepository {
  return shouldUseSupabase()
    ? new SupabaseUserRepository()
    : new LocalStorageUserRepository();
}

function createSurveyRepository(): SurveyRepository {
  return shouldUseSupabase()
    ? new SupabaseSurveyRepository()
    : new LocalStorageSurveyRepository();
}

function createPackRepository(): PackRepository {
  return shouldUseSupabase()
    ? new SupabasePackRepository()
    : new LocalStoragePackRepository();
}

let _userRepository: UserRepository | null = null;
let _surveyRepository: SurveyRepository | null = null;
let _packRepository: PackRepository | null = null;

function getRepositories() {
  if (!_userRepository) {
    _userRepository = createUserRepository();
    _surveyRepository = createSurveyRepository();
    _packRepository = createPackRepository();

    if (isBrowser()) {
      if (shouldUseSupabase()) {
        console.log('🔌 Conectado a base de datos de producción (Supabase)');
      } else {
        console.warn('⚠️ Ejecutando en modo de desarrollo local (LocalStorage). Configura PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY para activar producción.');
      }
    }
  }
  return { userRepository: _userRepository!, surveyRepository: _surveyRepository!, packRepository: _packRepository! };
}

export const userRepository = {
  login: (email: string, password?: string, role?: 'client' | 'admin') =>
    getRepositories().userRepository.login(email, password, role),
  loginWithGoogle: () => getRepositories().userRepository.loginWithGoogle(),
  getCurrentUser: () => getRepositories().userRepository.getCurrentUser(),
  logout: () => getRepositories().userRepository.logout(),
  updateProfile: (userId: string, updates: { name?: string; avatarUrl?: string }) =>
    getRepositories().userRepository.updateProfile(userId, updates),
} satisfies UserRepository;

export const surveyRepository = {
  getQuestions: () => getRepositories().surveyRepository.getQuestions(),
  saveAnswers: (answers: Record<number, string | string[]>) =>
    getRepositories().surveyRepository.saveAnswers(answers),
  getAnswers: () => getRepositories().surveyRepository.getAnswers(),
  isCompleted: () => getRepositories().surveyRepository.isCompleted(),
  resetSurvey: () => getRepositories().surveyRepository.resetSurvey(),
} satisfies SurveyRepository;

export const packRepository = {
  getPacks: () => getRepositories().packRepository.getPacks(),
  getPackById: (id: string) => getRepositories().packRepository.getPackById(id),
  getPacksByStore: (storeId: string) => getRepositories().packRepository.getPacksByStore(storeId),
  updateStock: (packId: string, newStock: number) =>
    getRepositories().packRepository.updateStock(packId, newStock),
  addPack: (pack: Omit<import('./domain/entities/Pack').Pack, 'id'>) =>
    getRepositories().packRepository.addPack(pack),
} satisfies PackRepository;

export const loginUserUseCase = new LoginUser(userRepository);
export const loginWithGoogleUseCase = new LoginWithGoogle(userRepository);
export const getSurveyQuestionsUseCase = new GetSurveyQuestions(surveyRepository);
export const saveSurveyAnswersUseCase = new SaveSurveyAnswers(surveyRepository);
export const getClientPacksUseCase = new GetClientPacks(packRepository);
export const getAdminInventoryUseCase = new GetAdminInventory(packRepository);
export const updatePackStockUseCase = new UpdatePackStock(packRepository);
