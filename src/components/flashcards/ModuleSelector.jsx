
export default function ModuleSelector({ selectedModule, setSelectedModule, moduleKeys }) {
    return (
        <div className="mb-5">
            <label className="text-sm font-semibold text-gray-800 mb-1 block">Selecciona un módulo 📂</label>
            <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm bg-white shadow-inner"
            >
                <option value="">-- Módulo --</option>
                {moduleKeys.map((moduloKey) => (
                    <option key={moduloKey} value={moduloKey}>
                        {moduloKey.charAt(0).toUpperCase() + moduloKey.slice(1)}
                    </option>
                ))}
            </select>
        </div>
    );
}
