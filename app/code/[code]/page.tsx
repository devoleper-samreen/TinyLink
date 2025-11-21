'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Copy, Check, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface LinkStats {
  code: string;
  targetUrl: string;
  clicks: number;
  lastClicked: string | null;
  createdAt: string;
}

export default function StatsPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [stats, setStats] = useState<LinkStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (code) {
      fetchStats();
    }
  }, [code]);

  const fetchStats = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/links/${code}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else if (response.status === 404) {
        setError('Link not found');
      } else {
        setError('Failed to load stats');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/${code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Link Statistics</h1>
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading statistics...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to Dashboard
            </Link>
          </div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Short URL Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">Short Code</h2>
                  <p className="text-2xl font-bold text-gray-900 font-mono">{stats.code}</p>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy URL
                    </>
                  )}
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Short URL</h3>
                <p className="text-blue-600 font-medium break-all">
                  {typeof window !== 'undefined' ? `${window.location.origin}/${stats.code}` : `/${stats.code}`}
                </p>
              </div>
            </div>

            {/* Target URL Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-medium text-gray-500 mb-2">Target URL</h2>
              <div className="flex items-start gap-3">
                <p className="text-gray-900 break-all flex-1">{stats.targetUrl}</p>
                <a
                  href={stats.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </a>
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-500">Total Clicks</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.clicks}</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Last Clicked</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {stats.lastClicked ? (
                    <>
                      <span className="block">{new Date(stats.lastClicked).toLocaleDateString()}</span>
                      <span className="text-sm font-normal text-gray-500">
                        {new Date(stats.lastClicked).toLocaleTimeString()}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-400">Never</span>
                  )}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Created At</h3>
                <p className="text-lg font-semibold text-gray-900">
                  <span className="block">{new Date(stats.createdAt).toLocaleDateString()}</span>
                  <span className="text-sm font-normal text-gray-500">
                    {new Date(stats.createdAt).toLocaleTimeString()}
                  </span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`/${stats.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Test Redirect
                </a>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
