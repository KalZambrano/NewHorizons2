export default function PdfMaterials({ materials }) {
    if (!materials || materials.length === 0) {
        return <p className="text-gray-600 italic text-center">No hay materiales PDF para este módulo.</p>;
    }

    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-blue-700">Materiales PDF 📄</h3>
            <ul className="list-disc list-inside space-y-1">
                {materials.map(({ id, title, url }) => (
                    <li key={id}>
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            {title}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
