'use client';

import { useState, useEffect } from 'react';
import { Trash2, Copy, Plus, Search, ExternalLink, Check, Activity, BarChart3, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

interface LinkData {
  code: string;
  targetUrl: string;
  clicks: number;
  lastClicked: string | null;
}

type SortField = 'code' | 'targetUrl' | 'clicks' | 'lastClicked';
type SortOrder = 'asc' | 'desc';

export default function Dashboard() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('code');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Form states
  const [targetUrl, setTargetUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; code: string; url: string }>({
    show: false,
    code: '',
    url: '',
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/links');
      if (response.ok) {
        const data = await response.json();
        setLinks(data);
      }
    } catch (err) {
      console.error('Failed to fetch links:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl,
          code: customCode || undefined,
        }),
      });

      const data = await response.json();

      if (response.status === 409) {
        setError('This code already exists. Please choose a different one.');
      } else if (!response.ok) {
        setError(data.error || 'Failed to create link');
      } else {
        toast.success('Link created successfully!', {
          duration: 3000,
        });
        setTargetUrl('');
        setCustomCode('');
        setShowAddModal(false);
        setError('');
        fetchLinks();
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (code: string, url: string) => {
    setDeleteConfirm({ show: true, code, url });
  };

  const handleDeleteConfirm = async () => {
    const code = deleteConfirm.code;
    setDeleteConfirm({ show: false, code: '', url: '' });

    try {
      const response = await fetch(`/api/links/${code}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Link deleted successfully!', {
          duration: 3000,
        });
        fetchLinks();
      } else {
        toast.error('Failed to delete link', {
          duration: 3000,
        });
      }
    } catch (err) {
      toast.error('Network error. Please try again.', {
        duration: 3000,
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, code: '', url: '' });
  };

  const copyToClipboard = (code: string) => {
    const url = `${window.location.origin}/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    toast.success('Link copied to clipboard!', {
      duration: 2000,
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredLinks = links.filter(
    (link) =>
      link.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.targetUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedLinks = [...filteredLinks].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Handle null values for lastClicked
    if (sortField === 'lastClicked') {
      aValue = aValue ? new Date(aValue).getTime() : 0;
      bValue = bValue ? new Date(bValue).getTime() : 0;
    }

    // Handle string comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="bottom-right" />
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">TinyLink</h1>
            <Link
              href="/health"
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium border border-green-200"
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Health Check</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by code or URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            Add Link
          </button>
        </div>

        {/* Links Table */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center mt-10">
            <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading links...</p>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-16 text-center mt-10">
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'No links found matching your search.' : 'No links yet. Create your first short link!'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                Add Your First Link
              </button>
            )}
          </div>
        ) : (
          <div className="mt-10">
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('code')}
                          className="flex items-center gap-1 hover:text-gray-700 transition-colors cursor-pointer"
                          title={sortField === 'code'
                            ? `Sorted ${sortOrder === 'asc' ? 'A-Z' : 'Z-A'} (click to reverse)`
                            : 'Click to sort by Short URL'}
                        >
                          Short URL
                          {sortField === 'code' ? (
                            sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-40" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('targetUrl')}
                          className="flex items-center gap-1 hover:text-gray-700 transition-colors cursor-pointer"
                          title={sortField === 'targetUrl'
                            ? `Sorted ${sortOrder === 'asc' ? 'A-Z' : 'Z-A'} (click to reverse)`
                            : 'Click to sort by Target URL'}
                        >
                          Target URL
                          {sortField === 'targetUrl' ? (
                            sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-40" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('clicks')}
                          className="flex items-center gap-1 hover:text-gray-700 transition-colors cursor-pointer"
                          title={sortField === 'clicks'
                            ? `Sorted ${sortOrder === 'asc' ? 'Low to High' : 'High to Low'} (click to reverse)`
                            : 'Click to sort by Clicks'}
                        >
                          Clicks
                          {sortField === 'clicks' ? (
                            sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-40" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('lastClicked')}
                          className="flex items-center gap-1 hover:text-gray-700 transition-colors cursor-pointer"
                          title={sortField === 'lastClicked'
                            ? `Sorted ${sortOrder === 'asc' ? 'Oldest First' : 'Newest First'} (click to reverse)`
                            : 'Click to sort by Last Clicked'}
                        >
                          Last Clicked
                          {sortField === 'lastClicked' ? (
                            sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-40" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stats
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedLinks.map((link) => (
                      <tr key={link.code} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <a
                              href={`/${link.code}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {link.code}
                            </a>
                            <button
                              onClick={() => copyToClipboard(link.code)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                              title="Copy short URL"
                            >
                              {copiedCode === link.code ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 max-w-md">
                            <span className="text-sm text-gray-900 truncate" title={link.targetUrl}>
                              {link.targetUrl}
                            </span>
                            <a
                              href={link.targetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0"
                            >
                              <ExternalLink className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {link.clicks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {link.lastClicked
                            ? new Date(link.lastClicked).toLocaleString()
                            : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Link
                            href={`/code/${link.code}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <BarChart3 className="w-4 h-4" />
                            View
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleDeleteClick(link.code, link.targetUrl)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {sortedLinks.map((link) => (
                <div key={link.code} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                  {/* Short URL Section */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500 uppercase">Short URL</span>
                      <button
                        onClick={() => copyToClipboard(link.code)}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                        title="Copy short URL"
                      >
                        {copiedCode === link.code ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <a
                      href={`/${link.code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-blue-600 hover:text-blue-800 font-semibold text-base"
                    >
                      {link.code}
                    </a>
                  </div>

                  {/* Target URL */}
                  <div className="mb-3 pb-3 border-b border-gray-200">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1.5">Target URL</p>
                    <div className="flex items-start gap-2">
                      <span className="text-sm text-gray-900 break-all flex-1 leading-tight" title={link.targetUrl}>
                        {link.targetUrl}
                      </span>
                      <a
                        href={link.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 mt-0.5 cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                      </a>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-xs font-medium text-gray-500 mb-1">Clicks</p>
                      <p className="text-lg font-bold text-gray-900">{link.clicks}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-xs font-medium text-gray-500 mb-1">Last Clicked</p>
                      <p className="text-xs text-gray-900 font-medium">
                        {link.lastClicked
                          ? new Date(link.lastClicked).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Never'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/code/${link.code}`}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer font-semibold"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Stats
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(link.code, link.targetUrl)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer font-semibold"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Add Link Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" onClick={() => {
          setShowAddModal(false);
          setError('');
          setTargetUrl('');
          setCustomCode('');
        }}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Add New Link</h2>
            <form onSubmit={handleAddLink} className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="targetUrl" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Target URL *
                </label>
                <input
                  type="url"
                  id="targetUrl"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://your-long-url"
                  required
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="customCode" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Custom Code (optional)
                </label>
                <input
                  type="text"
                  id="customCode"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="e.g., docs, mylink"
                  pattern="[A-Za-z0-9]{6,8}"
                  title="6-8 characters, alphanumeric only"
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
                />
                <p className="mt-1 text-xs text-gray-500">6-8 characters, alphanumeric only</p>
              </div>

              {error && (
                <div className="p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-800">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setError('');
                    setTargetUrl('');
                    setCustomCode('');
                  }}
                  className="w-full sm:flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer order-2 sm:order-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer order-1 sm:order-2"
                >
                  {isSubmitting ? 'Creating...' : 'Create Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={handleDeleteCancel}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Delete Link?</h2>
              <p className="text-gray-600 text-xs sm:text-sm mb-3">
                Are you sure you want to delete this link? This action cannot be undone.
              </p>
              <div className="bg-gray-50 rounded-lg p-2.5 sm:p-3 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Short Code</p>
                <p className="font-mono font-semibold text-gray-900 mb-2 text-sm">{deleteConfirm.code}</p>
                <p className="text-xs text-gray-500 mb-1">Target URL</p>
                <p className="text-xs sm:text-sm text-gray-700 break-all" title={deleteConfirm.url}>
                  {deleteConfirm.url}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleDeleteCancel}
                className="w-full sm:flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="w-full sm:flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium cursor-pointer order-1 sm:order-2"
              >
                Delete Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
