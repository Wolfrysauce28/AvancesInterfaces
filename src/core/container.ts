import { LocalStorageUserRepository } from './infrastructure/repositories/LocalStorageUserRepository';
import { LocalStorageSurveyRepository } from './infrastructure/repositories/LocalStorageSurveyRepository';
import { LocalStoragePackRepository } from './infrastructure/repositories/LocalStoragePackRepository';

import { LoginUser } from './usecases/auth/LoginUser';
import { GetSurveyQuestions } from './usecases/survey/GetSurveyQuestions';
import { SaveSurveyAnswers } from './usecases/survey/SaveSurveyAnswers';
import { GetClientPacks } from './usecases/inventory/GetClientPacks';
import { GetAdminInventory } from './usecases/inventory/GetAdminInventory';
import { UpdatePackStock } from './usecases/inventory/UpdatePackStock';

// Instanciar repositorios (Infraestructura)
export const userRepository = new LocalStorageUserRepository();
export const surveyRepository = new LocalStorageSurveyRepository();
export const packRepository = new LocalStoragePackRepository();

// Instanciar Casos de Uso (Aplicación)
export const loginUserUseCase = new LoginUser(userRepository);
export const getSurveyQuestionsUseCase = new GetSurveyQuestions(surveyRepository);
export const saveSurveyAnswersUseCase = new SaveSurveyAnswers(surveyRepository);
export const getClientPacksUseCase = new GetClientPacks(packRepository);
export const getAdminInventoryUseCase = new GetAdminInventory(packRepository);
export const updatePackStockUseCase = new UpdatePackStock(packRepository);
