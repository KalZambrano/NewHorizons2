export default function FlashcardViewer({ flashcard, index, total, showAnswer, setShowAnswer, onNext }) {
    return (
        <>
            <div className="w-full h-44 perspective mb-5">
                <div
                    className={`relative w-full h-full transition-transform duration-500 transform-style preserve-3d ${showAnswer ? 'rotate-y-180' : ''}`}
                >
                    {/* Cara frontal */}
                    <div className="absolute w-full h-full backface-hidden flex items-center justify-center text-center p-4 bg-white border border-gray-300 rounded-xl shadow-md">
                        <p className="text-gray-800 text-md font-medium leading-relaxed">{flashcard.question}</p>
                    </div>

                    {/* Cara trasera */}
                    <div className="absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center text-center p-4 bg-blue-100 border border-blue-200 rounded-xl shadow-md">
                        <p className="text-gray-800 text-md font-semibold leading-relaxed">{flashcard.answer}</p>
                    </div>
                </div>
            </div>

            <div className="text-sm text-gray-600 mb-3 text-center">
                Tarjeta {index + 1} de {total}
            </div>

            <div className="mt-auto flex justify-between gap-2">
                <button
                    className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold shadow"
                    onClick={() => setShowAnswer((prev) => !prev)}
                >
                    {showAnswer ? '🔄 Ver pregunta' : '✅ Ver respuesta'}
                </button>
                <button
                    className="text-sm bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition font-semibold shadow"
                    onClick={onNext}
                >
                    Siguiente ➡️
                </button>
            </div>
        </>
    );
}
