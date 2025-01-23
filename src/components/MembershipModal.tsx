import React, { useState } from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: {
    id: string;
    full_name: string;
    membership?: {
      id: string;
      end_date: string;
      status: string;
    };
  };
  onSuccess: () => void;
}

export default function MembershipModal({ isOpen, onClose, member, onSuccess }: MembershipModalProps) {
  const [endDate, setEndDate] = useState(
    member?.membership?.end_date 
      ? format(new Date(member.membership.end_date), 'yyyy-MM-dd')
      : format(new Date().setMonth(new Date().getMonth() + 1), 'yyyy-MM-dd')
  );
  const [status, setStatus] = useState(member?.membership?.status || 'active');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const promise = (async () => {
      try {
        if (member?.membership?.id) {
          // Update existing membership
          const { error: updateError } = await supabase
            .from('memberships')
            .update({
              end_date: new Date(endDate).toISOString(),
              status,
              updated_at: new Date().toISOString()
            })
            .eq('id', member.membership.id);

          if (updateError) throw updateError;
        } else {
          // Create new membership
          const { error: insertError } = await supabase
            .from('memberships')
            .insert({
              user_id: member?.id,
              start_date: new Date().toISOString(),
              end_date: new Date(endDate).toISOString(),
              status
            });

          if (insertError) throw insertError;
        }

        onSuccess();
        onClose();
        return 'Membership updated successfully';
      } catch (err) {
        console.error('Error managing membership:', err);
        throw new Error('Failed to save membership details');
      } finally {
        setLoading(false);
      }
    })();

    toast.promise(promise, {
      loading: 'Saving membership...',
      success: (message) => message,
      error: (err) => err.message
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {member?.membership ? 'Edit' : 'Add'} Membership
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Member
              </label>
              <input
                type="text"
                value={member?.full_name || ''}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}