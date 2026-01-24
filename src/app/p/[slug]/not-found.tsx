import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-gray-900">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-gray-700">Page Not Found</h2>
        <p className="mb-8 text-gray-600">
          The page you're looking for doesn't exist or has been unpublished.
        </p>
        <Link
          href="/"
          className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
