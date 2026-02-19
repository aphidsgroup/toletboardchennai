export default function ListLoading() {
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header skeleton */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm">
                <div className="container mx-auto px-4 py-4 animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="w-20" />
                    </div>
                    <div className="flex gap-2 mb-3">
                        <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                        <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                        <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                    </div>
                </div>
            </header>

            {/* Content skeleton */}
            <div className="container mx-auto px-4 py-6 animate-pulse">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
                            <div className="w-full h-48 bg-gray-200 dark:bg-gray-700" />
                            <div className="p-5 space-y-3">
                                <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
                                <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
                                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
