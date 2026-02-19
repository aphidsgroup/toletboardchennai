export default function PropertyLoading() {
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
            <div className="animate-pulse">
                {/* Header skeleton */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                    <div className="container mx-auto max-w-3xl">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                        <div className="h-7 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                </div>

                {/* Image skeleton */}
                <div className="w-full h-64 bg-gray-200 dark:bg-gray-700" />

                {/* Content skeleton */}
                <div className="container mx-auto max-w-3xl px-4 py-6 space-y-6">
                    {/* Price & details */}
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                        ))}
                    </div>

                    {/* Tour embed area */}
                    <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                </div>
            </div>
        </main>
    );
}
