
export default function MaterialSelector({ selectedModule, selectedMaterial, setSelectedMaterial, moduleMaterials }) {
    if (!selectedModule || !moduleMaterials[selectedModule]) return null;

    return (
        <div className="mb-5">
            <label className="text-sm font-semibold text-gray-800 mb-1 block">
                Selecciona un material 📄 ({moduleMaterials[selectedModule].length})
            </label>
            <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm bg-white shadow-inner"
            >
                <option value="">-- Material PDF --</option>
                {moduleMaterials[selectedModule].map((material, idx) => (
                    <option key={idx} value={material}>
                        {material}
                    </option>
                ))}
            </select>
        </div>
    );
}
