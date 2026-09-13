import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck, Database, Layers } from 'lucide-react';
import { authApi } from '../../api/auth';
import Button from '../../components/ui/Button';

export default function AuthPage({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!isLogin && !name) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await authApi.login({ email, password });
      } else {
        res = await authApi.signup({ email, password, name });
      }

      if (res && res.token) {
        if (onAuthSuccess) {
          onAuthSuccess(res.user);
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white shadow-lg mb-4">
          <Sparkles size={28} />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
          LogicAI
        </h2>
        <p className="mt-2 text-sm text-zinc-600">
          Enterprise Multi-User Document Intelligence & Grounded RAG Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md border border-zinc-200 sm:rounded-2xl sm:px-10">
          {/* Tab Switcher */}
          <div className="flex rounded-lg bg-zinc-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                isLogin
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                !isLogin
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Full Name
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="block w-full pl-9 pr-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@company.com"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                />
              </div>
              {!isLogin && (
                <p className="mt-1 text-[11px] text-zinc-500">
                  Must be at least 6 characters.
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full justify-center mt-6"
              icon={ArrowRight}
            >
              {loading
                ? isLogin
                  ? 'Signing in...'
                  : 'Creating account...'
                : isLogin
                ? 'Sign In'
                : 'Create Account'}
            </Button>
          </form>

          {/* Feature Highlights */}
          <div className="mt-8 pt-6 border-t border-zinc-100 grid grid-cols-3 gap-2 text-center text-zinc-500">
            <div className="flex flex-col items-center">
              <ShieldCheck size={16} className="text-emerald-600 mb-1" />
              <span className="text-[10px] font-medium">User Isolation</span>
            </div>
            <div className="flex flex-col items-center">
              <Database size={16} className="text-indigo-600 mb-1" />
              <span className="text-[10px] font-medium">PostgreSQL + PGVector</span>
            </div>
            <div className="flex flex-col items-center">
              <Layers size={16} className="text-amber-600 mb-1" />
              <span className="text-[10px] font-medium">Cloudinary Storage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
