export default function HomeLoading() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
            <div className="container mx-auto px-4 py-8 max-w-2xl animate-pulse">
                {/* Logo skeleton */}
                <div className="text-center mb-8">
                    <div className="w-28 h-28 mx-auto rounded-full bg-gray-200 dark:bg-gray-700 mb-4" />
                    <div className="h-8 w-64 mx-auto bg-gray-200 dark:bg-gray-700 rounded-lg mb-2" />
                    <div className="h-5 w-48 mx-auto bg-gray-200 dark:bg-gray-700 rounded-lg" />
                </div>

                {/* Search skeleton */}
                <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl mb-6" />

                {/* CTA buttons skeleton */}
                <div className="space-y-4 mb-8">
                    <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
                    <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
                        <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
                    </div>
                </div>

                {/* Slider skeleton */}
                <div className="mb-8">
                    <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                    <div className="flex gap-4 overflow-hidden">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex-shrink-0 w-[280px] bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
                                <div className="w-full h-40 bg-gray-200 dark:bg-gray-700" />
                                <div className="p-4 space-y-2">
                                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                                    <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
                                    <div className="h-5 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Categories skeleton */}
                <div className="mb-8">
                    <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                    <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
