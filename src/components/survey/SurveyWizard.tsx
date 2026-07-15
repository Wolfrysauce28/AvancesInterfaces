import React, { useState, useEffect } from 'react';
import type { SurveyQuestion, SurveyAnswers } from '../../core/domain/entities/Survey';
import { getSurveyQuestionsUseCase, saveSurveyAnswersUseCase } from '../../core/container';
import { applyMutuallyExclusiveOption } from '../../core/domain/rules/surveyRules';

export const SurveyWizard: React.FC = () => {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1); // -1: inicio, >=0: preguntas, -2: fin
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await getSurveyQuestionsUseCase.execute();
        setQuestions(data);
      } catch (err) {
        console.error('Error cargando preguntas:', err);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, []);

  const startSurvey = () => {
    setCurrentStep(0);
    setAnswers({});
  };

  const isOptionSelected = (questionId: number, value: string): boolean => {
    const answer = answers[questionId];
    if (!answer) return false;
    if (Array.isArray(answer)) {
      return answer.includes(value);
    }
    return answer === value;
  };

  const selectOption = (questionId: number, value: string, type: 'single' | 'multiple') => {
    const currentAnswer = answers[questionId];
    
    if (type === 'single') {
      setAnswers(prev => ({ ...prev, [questionId]: value }));
    } else {
      const current: string[] = Array.isArray(currentAnswer) ? [...currentAnswer] : [];
      const newSelection = applyMutuallyExclusiveOption(current, value);
      setAnswers(prev => ({ ...prev, [questionId]: newSelection }));
    }
  };

  const hasAnswer = (questionId: number): boolean => {
    const ans = answers[questionId];
    if (ans === undefined || ans === null) return false;
    if (Array.isArray(ans)) return ans.length > 0;
    return ans !== '';
  };

  const nextQuestion = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsSubmitting(true);
      try {
        await saveSurveyAnswersUseCase.execute(answers);
        setCurrentStep(-2); // Ir a la pantalla final
      } catch (err) {
        console.error('Error al guardar respuestas:', err instanceof Error ? err.message : err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const prevQuestion = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const finishSurvey = () => {
    window.location.href = '/client';
  };

  const restartSurvey = () => {
    setCurrentStep(-1);
    setAnswers({});
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-500"></div>
      </div>
    );
  }

  // Pantalla Inicial
  if (currentStep === -1) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 w-full max-w-[680px] rounded-3xl shadow-xl dark:shadow-black/30 p-8 md:p-10 text-center flex flex-col items-center justify-center min-h-[580px] mx-auto my-12 animate-show">
        <div className="text-6xl mb-6 animate-bounce duration-1000">🥗</div>
        <h1 className="font-display text-gray-900 dark:text-white text-3xl md:text-4xl font-extrabold mb-4 leading-tight">Bienvenido a FoodSave</h1>
        <p className="font-body text-gray-500 dark:text-gray-400 max-w-[480px] mb-8 text-sm md:text-base leading-relaxed">
          Completa este breve cuestionario interactivo de registro (20 preguntas) para personalizar tu experiencia, descubrir las mejores ofertas en tu zona y definir tu perfil de Rescatador de Alimentos.
        </p>
        <button onClick={startSurvey} className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-10 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 active:translate-y-0 transition-all duration-300 text-base md:text-lg">
          Comenzar Registro 🚀
        </button>
      </div>
    );
  }

  // Pantalla de Resultados Finales
  if (currentStep === -2) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 w-full max-w-[680px] rounded-3xl shadow-xl dark:shadow-black/30 p-8 md:p-10 text-center flex flex-col items-center justify-center min-h-[580px] mx-auto my-12 animate-show">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="font-display text-gray-900 dark:text-white text-3xl font-extrabold mb-3">¡Perfil Completado con Éxito!</h1>
        <p className="font-body text-gray-500 dark:text-gray-400 max-w-[500px] mb-6 text-sm">
          Gracias por registrarte. Hemos configurado tu cuenta según tus hábitos de rescate y alimentación. Aquí tienes un resumen de tus datos:
        </p>

        <div className="w-full max-h-[280px] overflow-y-auto border border-gray-100 dark:border-gray-700 rounded-2xl p-4 mb-6 bg-gray-50 dark:bg-gray-900 text-left hide-scrollbar">
          {questions.map((q) => {
            const ans = answers[q.id];
            const answerLabel = Array.isArray(ans)
              ? ans.map(val => {
                  const opt = q.options.find(o => o.value === val);
                  return opt ? `${opt.emoji} ${opt.label}` : val;
                }).join(", ")
              : (() => {
                  const opt = q.options.find(o => o.value === ans);
                  return opt ? `${opt.emoji} ${opt.label}` : (ans as string || 'Sin responder');
                })();

            return (
              <div key={q.id} className="py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-none">
                <div className="font-bold text-xs text-gray-800 dark:text-gray-300">{q.id}. {q.title}</div>
                <div className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">{answerLabel}</div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
          <button onClick={restartSurvey} className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 hover:shadow-md active:scale-95 text-sm md:text-base">
            Volver a empezar
          </button>
          <button onClick={finishSurvey} className="flex-[2] bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 active:translate-y-0 transition-all duration-300 text-sm md:text-base">
            Completar y Entrar a la App 🍃
          </button>
        </div>
      </div>
    );
  }

  // Cuestionario de Preguntas
  const currentQuestion = questions[currentStep];
  const progressPercent = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 w-full max-w-[680px] rounded-3xl shadow-xl dark:shadow-black/30 p-6 md:p-10 flex flex-col min-h-[580px] mx-auto my-12 animate-show">
      <div className="mb-6">
        <div className="flex justify-between items-center text-xs md:text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
          <span>Bloque {currentQuestion.blockNum} de 4: {currentQuestion.block}</span>
          <span>Pregunta {currentStep + 1}/{questions.length}</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 transition-all duration-400" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <h2 className="font-display text-gray-900 dark:text-white text-xl md:text-2xl font-extrabold mb-2 leading-tight">
          {currentQuestion.title}
        </h2>
        <p className="font-body text-gray-500 dark:text-gray-400 text-xs md:text-sm mb-6 leading-relaxed">
          {currentQuestion.desc}
        </p>
        
        <div className={`grid gap-3 mb-6 ${currentQuestion.options.length > 4 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          {currentQuestion.options.map((opt) => {
            const selected = isOptionSelected(currentQuestion.id, opt.value);
            return (
              <div 
                key={opt.value} 
                onClick={() => selectOption(currentQuestion.id, opt.value, currentQuestion.type)}
                className={`option-card relative flex items-center gap-4 bg-white dark:bg-gray-800 border-2 rounded-2xl p-4 cursor-pointer select-none transition-all hover:-translate-y-0.5 ${
                  selected 
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10'
                }`}
              >
                <div className={`option-emoji w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-xl text-xl transition-all ${selected ? 'bg-white dark:bg-gray-800' : ''}`}>
                  {opt.emoji}
                </div>
                <span className="font-semibold text-sm md:text-base text-gray-800 dark:text-gray-200">{opt.label}</span>
                {selected && (
                  <span className="absolute right-4 text-emerald-500 font-bold text-lg">✓</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-700 mt-6">
        <button 
          onClick={prevQuestion} 
          disabled={currentStep === 0}
          className="flex items-center gap-2 font-bold text-sm md:text-base text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-40 disabled:hover:text-gray-400 cursor-pointer disabled:cursor-not-allowed transition"
        >
          ← Atrás
        </button>
        <button 
          onClick={nextQuestion} 
          disabled={!hasAnswer(currentQuestion.id) || isSubmitting}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 active:translate-y-0 disabled:opacity-40 disabled:transform-none disabled:shadow-none disabled:cursor-not-allowed cursor-pointer transition-all duration-300 flex items-center gap-2 text-sm md:text-base"
        >
          {isSubmitting ? (
             <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Procesando...</>
          ) : (
            currentStep === questions.length - 1 ? 'Finalizar Registro 🏁' : 'Siguiente →'
          )}
        </button>
      </div>
    </div>
  );
};
export default SurveyWizard;
