import * as React from 'react';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { Shield, Key, MonitorSmartphone, Trash2, LogOut } from 'lucide-react';
import { Badge } from '@leadlens/ui';

export const metadata = {
  title: 'Security | Account | LeadLens',
};

export default async function SecurityPage() {
  const session = await getSession();
  if (!session || !session.user) redirect('/login');

  return (
    <div className="space-y-8">
      
      {/* Password Management */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center shrink-0">
            <Key className="w-5 h-5 text-neutral-400" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-white">Password</h2>
            <p className="text-sm text-neutral-400">Update your password to keep your account secure.</p>
          </div>
        </div>
        
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Current Password</label>
            <input
              type="password"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">New Password</label>
            <input
              type="password"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
          <button className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors mt-2">
            Update Password
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center shrink-0">
              <MonitorSmartphone className="w-5 h-5 text-neutral-400" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-white">Active Sessions</h2>
              <p className="text-sm text-neutral-400">Manage devices currently logged into your account.</p>
            </div>
          </div>
          <button className="text-sm font-medium text-red-400 hover:text-red-300 flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Log out all other devices
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-neutral-950 border border-neutral-800 rounded-xl">
            <div className="flex items-center gap-4">
              <MonitorSmartphone className="w-6 h-6 text-neutral-500" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white">Mac OS • Chrome</p>
                  <Badge variant="success">Current</Badge>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">San Francisco, USA • 192.168.1.1</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-neutral-950 border border-neutral-800 rounded-xl">
            <div className="flex items-center gap-4">
              <MonitorSmartphone className="w-6 h-6 text-neutral-500" />
              <div>
                <p className="text-sm font-medium text-white">Windows • Firefox</p>
                <p className="text-xs text-neutral-500 mt-0.5">New York, USA • 10.0.0.1 • Last active 2 days ago</p>
              </div>
            </div>
            <button className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
              Revoke
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-neutral-900 border border-red-900/30 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-white">Danger Zone</h2>
            <p className="text-sm text-neutral-400">Irreversible actions for your account.</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-red-900/50 rounded-xl bg-red-950/20">
          <div>
            <p className="text-sm font-medium text-white">Delete Account</p>
            <p className="text-xs text-neutral-400 mt-1 max-w-lg">
              Permanently delete your account and all associated data. This action cannot be undone and will require an email confirmation.
            </p>
          </div>
          <button className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </div>
      </div>
      
    </div>
  );
}
