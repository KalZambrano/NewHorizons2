import { useState, useEffect } from 'react';
import { flashcardData } from '../data/flashcards';
import { pdfMaterials } from '../data/pdfMaterials';
import ModuleSelector from '../components/flashcards/ModuleSelector';
import FlashcardViewer from '../components/flashcards/FlashcardViewer';
import SupportLinks from '../components/flashcards/SupportLinks';

export default function FlashcardWidget() {
    const [selectedModule, setSelectedModule] = useState('');
    const [selectedMaterial, setSelectedMaterial] = useState('');
    const [index, setIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [open, setOpen] = useState(false);

    const flashcards = flashcardData[selectedModule] || [];
    const current = flashcards[index];
    const materials = pdfMaterials[selectedModule] || [];

    // Reiniciar cuando se cambia el módulo
    useEffect(() => {
        setIndex(0);
        setShowAnswer(false);
        setSelectedMaterial('');
    }, [selectedModule]);

    const handleNext = () => {
        setShowAnswer(false);
        setIndex((prev) => (prev + 1) % flashcards.length);
    };

    return (
        <div>
            {/* Botón flotante */}
            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-blue-600 text-white text-3xl shadow-xl flex items-center justify-center hover:bg-blue-700 transition-all duration-300 ease-in-out z-50"
            >
                📚
            </button>

            {/* Ventana tipo chatbot estilizada */}
            {open && (
                <div className="fixed bottom-24 right-6 w-[420px] max-h-[85vh] bg-gradient-to-br from-white to-blue-50 shadow-2xl rounded-2xl p-6 border border-blue-200 z-40 flex flex-col font-sans overflow-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-extrabold text-blue-700 flex items-center gap-2">
                            🎓 UTP+Cards
                        </h2>
                        <button
                            onClick={() => setOpen(false)}
                            className="text-gray-400 hover:text-red-500 transition text-lg"
                        >
                            ✖️
                        </button>
                    </div>

                    {/* Selector de módulo */}
                    <ModuleSelector
                        selectedModule={selectedModule}
                        setSelectedModule={setSelectedModule}
                        moduleKeys={Object.keys(flashcardData)}
                    />

                    {/* Mostrar materiales inmediatamente al seleccionar un módulo */}
                    {selectedModule && materials.length > 0 && (
                        <div className="mb-5">
                            <label className="text-sm font-semibold text-gray-800 mb-1 block">
                                Selecciona un material 📄 ({materials.length})
                            </label>
                            <select
                                value={selectedMaterial?.id || ''}
                                onChange={(e) => {
                                    const selected = materials.find(m => m.id === e.target.value);
                                    setSelectedMaterial(selected || '');
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm bg-white shadow-inner"
                            >
                                <option value="">-- Material PDF --</option>
                                {materials.map((material) => (
                                    <option key={material.id} value={material.id}>
                                        {material.title}
                                    </option>
                                ))}
                            </select>

                        </div>
                    )}

                    {/* Flashcards */}
                    {selectedModule && flashcards.length > 0 ? (
                        <>
                            <FlashcardViewer
                                flashcard={current}
                                index={index}
                                total={flashcards.length}
                                showAnswer={showAnswer}
                                setShowAnswer={setShowAnswer}
                                onNext={handleNext}
                            />
                            <SupportLinks topic={current.question} />
                        </>
                    ) : (
                        <p className="text-gray-700 text-center mt-10 italic">
                            Selecciona un módulo para comenzar 📘
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
