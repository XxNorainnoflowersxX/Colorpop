/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  Github,
  KeyRound,
  Shield,
  Layers,
  Sparkles,
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  ExternalLink,
  BookMarked,
  CircleDot,
  Activity,
  CheckCircle2,
  Copy,
  Check,
  Globe,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { ProfileHeader } from './components/ProfileHeader';
import { RepoCard } from './components/RepoCard';
import { ReadmeModal } from './components/ReadmeModal';
import { IssuesList } from './components/IssuesList';
import { ActivityFeed } from './components/ActivityFeed';
import { ConnectModal } from './components/ConnectModal';
import { OAuthGuideModal } from './components/OAuthGuideModal';
import { GitHubUser, GitHubRepo, GitHubIssue, GitHubEvent, RateLimit } from './types';

export default function App() {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [rateLimit, setRateLimit] = useState<RateLimit | undefined>();
  const [isConfigured, setIsConfigured] = useState(false);
  const [devRedirectUri, setDevRedirectUri] = useState('https://ais-dev-ohlfym6cwp4w2lwha7oenj-597148229967.us-east1.run.app/auth/callback');
  const [previewRedirectUri, setPreviewRedirectUri] = useState('https://ais-pre-ohlfym6cwp4w2lwha7oenj-597148229967.us-east1.run.app/auth/callback');
  
  const [isGuest, setIsGuest] = useState(false);
  const [guestUsername, setGuestUsername] = useState<string | null>(null);

  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [pulls, setPulls] = useState<any[]>([]);
  const [events, setEvents] = useState<GitHubEvent[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'repos' | 'issues' | 'activity' | 'settings'>('repos');

  // Repos filtering & search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'stars' | 'name' | 'forks'>('updated');

  // Modals
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [readmeRepo, setReadmeRepo] = useState<GitHubRepo | null>(null);

  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // 1. Fetch Auth Status
  const fetchAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();

      setIsConfigured(Boolean(data.configured));
      if (data.devRedirectUri) setDevRedirectUri(data.devRedirectUri);
      if (data.previewRedirectUri) setPreviewRedirectUri(data.previewRedirectUri);

      if (data.authenticated && data.user) {
        setUser(data.user);
        setIsGuest(false);
        setGuestUsername(null);
        if (data.rateLimit) setRateLimit(data.rateLimit);
        fetchUserData(data.user.login, false);
      } else if (!user && !guestUsername) {
        // By default show Octocat preview or empty state
        loadPreviewUser('octocat');
      }
    } catch (err) {
      console.error('Failed to check auth status:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Repos, Issues, Pulls, and Activity
  const fetchUserData = async (username: string, guestMode: boolean) => {
    setLoadingData(true);
    try {
      // Repos
      const reposUrl = guestMode
        ? `/api/github/repos?username=${encodeURIComponent(username)}`
        : '/api/github/repos';
      const reposRes = await fetch(reposUrl);
      const reposData = await reposRes.json();
      if (reposRes.ok && Array.isArray(reposData.repos)) {
        setRepos(reposData.repos);
        if (reposData.rateLimit) setRateLimit(reposData.rateLimit);
      }

      // Events / Activity
      const eventsUrl = guestMode
        ? `/api/github/events?username=${encodeURIComponent(username)}`
        : '/api/github/events';
      const eventsRes = await fetch(eventsUrl);
      const eventsData = await eventsRes.json();
      if (eventsRes.ok && Array.isArray(eventsData.events)) {
        setEvents(eventsData.events);
      }

      // Issues & Pulls (authenticated only)
      if (!guestMode) {
        const [issuesRes, pullsRes] = await Promise.all([
          fetch('/api/github/issues'),
          fetch('/api/github/pulls'),
        ]);

        const issuesData = await issuesRes.json();
        const pullsData = await pullsRes.json();

        if (issuesRes.ok && Array.isArray(issuesData.issues)) {
          setIssues(issuesData.issues);
        }
        if (pullsRes.ok && Array.isArray(pullsData.pulls)) {
          setPulls(pullsData.pulls);
        }
      } else {
        setIssues([]);
        setPulls([]);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Load preview profile
  const loadPreviewUser = async (username: string) => {
    try {
      setLoadingData(true);
      const res = await fetch(`/api/github/user?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setIsGuest(true);
        setGuestUsername(username);
        if (data.rateLimit) setRateLimit(data.rateLimit);
        fetchUserData(username, true);
      }
    } catch (err) {
      console.error('Failed to load preview user:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Logout / Disconnect
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setIsGuest(false);
      setGuestUsername(null);
      setRepos([]);
      setIssues([]);
      setPulls([]);
      setEvents([]);
      // Reset to preview
      loadPreviewUser('octocat');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Popup postMessage listener per OAuth skill guidelines
  useEffect(() => {
    fetchAuthStatus();

    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetchAuthStatus();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Filtered & Sorted Repositories
  const filteredRepos = useMemo(() => {
    return repos
      .filter((repo) => {
        const matchesQuery =
          repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesLang =
          selectedLanguage === 'all' || repo.language === selectedLanguage;
        return matchesQuery && matchesLang;
      })
      .sort((a, b) => {
        if (sortBy === 'stars') return (b.stargazers_count || 0) - (a.stargazers_count || 0);
        if (sortBy === 'forks') return (b.forks_count || 0) - (a.forks_count || 0);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return new Date(b.pushed_at || b.updated_at).getTime() - new Date(a.pushed_at || a.updated_at).getTime();
      });
  }, [repos, searchQuery, selectedLanguage, sortBy]);

  const availableLanguages = useMemo(() => {
    const set = new Set<string>();
    repos.forEach((r) => {
      if (r.language) set.add(r.language);
    });
    return Array.from(set).sort();
  }, [repos]);

  const copyUrl = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(id);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col font-sans selection:bg-[#58a6ff]/30">
      {/* Navigation */}
      <Navbar
        user={user}
        rateLimit={rateLimit}
        isGuest={isGuest}
        onOpenConnect={() => setIsConnectOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* If user is guest/preview or not logged in, show an inviting banner */}
        {isGuest && (
          <div className="bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono text-xs font-semibold border border-blue-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Connect Your Account
                </span>
                <span className="text-xs text-[#8b949e]">Currently previewing @{user?.login}</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Connect your personal GitHub account
              </h2>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Unlock direct management of your private repositories, star projects with 1-click, file issues, and view your pull requests.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setIsConnectOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded-xl text-xs font-semibold shadow-lg hover:shadow-emerald-900/30 transition-all flex items-center justify-center space-x-2"
              >
                <Github className="w-4 h-4 fill-current" />
                <span>Connect GitHub</span>
              </button>
              <button
                onClick={() => setIsGuideOpen(true)}
                className="w-full sm:w-auto px-3.5 py-2.5 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] rounded-xl text-xs font-medium transition-colors flex items-center justify-center space-x-1.5"
              >
                <HelpCircle className="w-4 h-4 text-blue-400" />
                <span>Setup Guide</span>
              </button>
            </div>
          </div>
        )}

        {/* User Profile Banner */}
        {user && (
          <ProfileHeader
            user={user}
            repos={repos}
            isGuest={isGuest}
            onOpenConnect={() => setIsConnectOpen(true)}
          />
        )}

        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-[#30363d] pb-2 gap-3">
          <div className="flex items-center space-x-1 sm:space-x-3">
            <button
              onClick={() => setActiveTab('repos')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'repos'
                  ? 'bg-[#21262d] text-white border border-[#30363d]'
                  : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22]'
              }`}
            >
              <BookMarked className="w-4 h-4 text-blue-400" />
              <span>Repositories</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#0d1117] text-[#8b949e] text-[10px] font-mono border border-[#30363d]">
                {repos.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('issues')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'issues'
                  ? 'bg-[#21262d] text-white border border-[#30363d]'
                  : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22]'
              }`}
            >
              <CircleDot className="w-4 h-4 text-emerald-400" />
              <span>Issues &amp; Pulls</span>
              {!isGuest && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#0d1117] text-[#8b949e] text-[10px] font-mono border border-[#30363d]">
                  {issues.length + pulls.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'activity'
                  ? 'bg-[#21262d] text-white border border-[#30363d]'
                  : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22]'
              }`}
            >
              <Activity className="w-4 h-4 text-purple-400" />
              <span>Activity Feed</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#0d1117] text-[#8b949e] text-[10px] font-mono border border-[#30363d]">
                {events.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-[#21262d] text-white border border-[#30363d]'
                  : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22]'
              }`}
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span>OAuth Config</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => user && fetchUserData(user.login, isGuest)}
              disabled={loadingData}
              title="Refresh GitHub Data"
              className="p-2 text-[#8b949e] hover:text-white hover:bg-[#21262d] rounded-lg transition-colors border border-transparent hover:border-[#30363d] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab 1: Repositories */}
        {activeTab === 'repos' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#161b22] border border-[#30363d] p-3 rounded-xl">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]" />
                <input
                  type="text"
                  placeholder="Find a repository..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#8b949e] focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Language filter */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-2.5 py-1 text-xs">
                  <Filter className="w-3.5 h-3.5 text-[#8b949e]" />
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-[#161b22]">All Languages</option>
                    {availableLanguages.map((lang) => (
                      <option key={lang} value={lang} className="bg-[#161b22]">
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div className="flex items-center space-x-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-2.5 py-1 text-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#8b949e]" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="updated" className="bg-[#161b22]">Last Updated</option>
                    <option value="stars" className="bg-[#161b22]">Most Stars</option>
                    <option value="name" className="bg-[#161b22]">Name</option>
                    <option value="forks" className="bg-[#161b22]">Most Forks</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Repos Grid */}
            {repos.length === 0 ? (
              <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-12 text-center space-y-4 shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
                  <BookMarked className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">No repositories found yet</h3>
                  <p className="text-xs text-[#8b949e] max-w-md mx-auto">
                    Your account <strong className="text-white">@{user?.login}</strong> is connected, but doesn't have any repositories yet.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <a
                    href="https://github.com/new"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold rounded-xl transition-all shadow-md"
                  >
                    <span>Create New Repository on GitHub</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => loadPreviewUser('octocat')}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] rounded-xl text-xs font-medium transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <span>View Sample Repos (Octocat)</span>
                  </button>
                </div>
              </div>
            ) : filteredRepos.length === 0 ? (
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-12 text-center text-[#8b949e] space-y-2">
                <BookMarked className="w-8 h-8 mx-auto text-[#30363d]" />
                <p className="text-sm font-medium text-[#c9d1d9]">No repositories match your filter</p>
                <p className="text-xs">Try clearing the search query or selecting a different language.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRepos.map((repo) => (
                  <RepoCard
                    key={repo.id}
                    repo={repo}
                    onOpenReadme={(r) => setReadmeRepo(r)}
                    isGuest={isGuest}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Issues and Pull Requests */}
        {activeTab === 'issues' && (
          <IssuesList
            issues={issues}
            pulls={pulls}
            repos={repos}
            isGuest={isGuest}
            onRefresh={() => user && fetchUserData(user.login, isGuest)}
          />
        )}

        {/* Tab 3: Activity Feed */}
        {activeTab === 'activity' && <ActivityFeed events={events} />}

        {/* Tab 4: OAuth and Settings */}
        {activeTab === 'settings' && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#30363d]">
              <div>
                <h2 className="text-lg font-bold text-white">OAuth &amp; Connection Status</h2>
                <p className="text-xs text-[#8b949e]">
                  Preview environment configuration, callback routes, and credentials.
                </p>
              </div>
              <button
                onClick={() => setIsGuideOpen(true)}
                className="px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] border border-[#30363d] rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Full Setup Walkthrough</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Development URL Card */}
              <div className="p-4 bg-[#0d1117] rounded-xl border border-[#30363d] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> Development Callback URL
                  </span>
                  <button
                    onClick={() => copyUrl(devRedirectUri, 'dev-url')}
                    className="flex items-center space-x-1 text-xs text-[#58a6ff] hover:bg-[#21262d] px-2 py-0.5 rounded transition-colors"
                  >
                    {copiedUrl === 'dev-url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl === 'dev-url' ? 'Copied' : 'Copy URL'}</span>
                  </button>
                </div>
                <code className="block text-xs font-mono text-[#79c0ff] break-all p-2 bg-[#161b22] rounded-lg border border-[#30363d]/60">
                  {devRedirectUri}
                </code>
                <p className="text-[11px] text-[#8b949e]">
                  Register this in your GitHub OAuth App under <strong>Authorization callback URL</strong>.
                </p>
              </div>

              {/* Shared URL Card */}
              <div className="p-4 bg-[#0d1117] rounded-xl border border-[#30363d] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-purple-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> Shared / Deployed Callback URL
                  </span>
                  <button
                    onClick={() => copyUrl(previewRedirectUri, 'preview-url')}
                    className="flex items-center space-x-1 text-xs text-[#58a6ff] hover:bg-[#21262d] px-2 py-0.5 rounded transition-colors"
                  >
                    {copiedUrl === 'preview-url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl === 'preview-url' ? 'Copied' : 'Copy URL'}</span>
                  </button>
                </div>
                <code className="block text-xs font-mono text-[#d2a8ff] break-all p-2 bg-[#161b22] rounded-lg border border-[#30363d]/60">
                  {previewRedirectUri}
                </code>
                <p className="text-[11px] text-[#8b949e]">
                  Use this when sharing or deploying the applet publicly.
                </p>
              </div>
            </div>

            {/* Environment Variables status */}
            <div className="p-4 bg-[#0d1117] rounded-xl border border-[#30363d] space-y-3">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                Environment Variables Status
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-[#30363d]/60">
                  <span className="font-mono text-[#c9d1d9]">GITHUB_CLIENT_ID</span>
                  <span className={`font-mono text-xs px-2 py-0.5 rounded-full ${isConfigured ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'}`}>
                    {isConfigured ? 'Configured' : 'Missing in .env'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#30363d]/60">
                  <span className="font-mono text-[#c9d1d9]">GITHUB_CLIENT_SECRET</span>
                  <span className={`font-mono text-xs px-2 py-0.5 rounded-full ${isConfigured ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'}`}>
                    {isConfigured ? 'Configured' : 'Missing in .env'}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Connect Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setIsConnectOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center space-x-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Connect with PAT or OAuth</span>
              </button>

              {user && (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold transition-colors"
                >
                  Disconnect Account
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#30363d] py-6 px-4 text-center text-xs text-[#8b949e]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Github className="w-4 h-4 fill-current" />
            <span>GitHub Connect &amp; Hub &bull; AI Studio Full-Stack Applet</span>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsGuideOpen(true)} className="hover:text-[#58a6ff]">
              OAuth Setup Guide
            </button>
            <a
              href="https://github.com/settings/developers"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#58a6ff] flex items-center gap-1"
            >
              GitHub Developer Portal <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ConnectModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
        onSuccess={() => fetchAuthStatus()}
        onExploreUser={(u) => loadPreviewUser(u)}
        onOpenGuide={() => {
          setIsConnectOpen(false);
          setIsGuideOpen(true);
        }}
        devRedirectUri={devRedirectUri}
        previewRedirectUri={previewRedirectUri}
        isConfigured={isConfigured}
      />

      <OAuthGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        devRedirectUri={devRedirectUri}
        previewRedirectUri={previewRedirectUri}
      />

      <ReadmeModal
        repo={readmeRepo}
        onClose={() => setReadmeRepo(null)}
      />
    </div>
  );
}
