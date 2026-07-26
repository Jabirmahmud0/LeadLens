import * as React from 'react';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { User, Camera, Save } from 'lucide-react';

export const metadata = {
  title: 'Profile | Account | LeadLens',
};

export default async function ProfilePage() {
  const session = await getSession();
  if (!session || !session.user) redirect('/login');

  const fullName = session.user.fullName || '';

  return (
    <div className="space-y-8">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl font-medium text-white mb-6">Personal Information</h2>
        
        <div className="flex flex-col sm:flex-row gap-8 items-start">
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center relative overflow-hidden group cursor-pointer">
              <User className="w-10 h-10 text-neutral-500 group-hover:opacity-0 transition-opacity" />
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <button className="text-xs text-neutral-400 hover:text-white transition-colors">
              Upload Avatar
            </button>
          </div>
          
          <div className="flex-1 w-full space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Full Name</label>
                <input
                  type="text"
                  defaultValue={fullName}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="John Doe"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Email Address</label>
                <input
                  type="email"
                  defaultValue={session.user.email}
                  disabled
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-neutral-500 cursor-not-allowed"
                />
                <p className="text-xs text-neutral-500 mt-1">Contact support to change your email.</p>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
