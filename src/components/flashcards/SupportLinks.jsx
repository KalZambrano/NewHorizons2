export default function SupportLinks({ topic }) {
    return (
        <div className="mt-4">
            <h3 className="text-sm font-semibold text-blue-600 mb-1">🔗 Enlaces de apoyo</h3>
            <ul className="text-sm list-disc list-inside text-blue-800">
                <li>
                    <a href={`https://es.wikipedia.org/wiki/${encodeURIComponent(topic)}`} target="_blank" rel="noopener noreferrer" className="underline">
                        Wikipedia
                    </a>
                </li>
                <li>
                    <a href={`https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(topic)}`} target="_blank" rel="noopener noreferrer" className="underline">
                        Khan Academy
                    </a>
                </li>
                <li>
                    <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(topic)}`} target="_blank" rel="noopener noreferrer" className="underline">
                        YouTube
                    </a>
                </li>
            </ul>
        </div>
    );
}
