import React, { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface TimeBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: {
    id: string;
    full_name: string;
    time_bank?: {
      id: string;
      minutes_remaining: number;
    };
  };
  onSuccess: () => void;
}

export default function TimeBankModal({ isOpen, onClose, member, onSuccess }: TimeBankModalProps) {
  const [minutesToAdd, setMinutesToAdd] = useState('60');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const promise = (async () => {
      try {
        const minutes = parseInt(minutesToAdd);
        if (isNaN(minutes) || minutes <= 0) {
          throw new Error('Please enter a valid number of minutes');
        }

        if (member?.time_bank?.id) {
          // Update existing time bank
          const { error: updateError } = await supabase
            .from('time_banks')
            .update({
              minutes_remaining: member.time_bank.minutes_remaining + minutes,
              updated_at: new Date().toISOString()
            })
            .eq('id', member.time_bank.id);

          if (updateError) throw updateError;
        } else {
          // Create new time bank
          const { error: insertError } = await supabase
            .from('time_banks')
            .insert({
              user_id: member?.id,
              minutes_remaining: minutes
            });

          if (insertError) throw insertError;
        }

        onSuccess();
        onClose();
        return `Added ${minutes} minutes to ${member?.full_name}'s time bank`;
      } catch (err) {
        console.error('Error managing time bank:', err);
        throw new Error(err instanceof Error ? err.message : 'Failed to update time bank');
      } finally {
        setLoading(false);
      }
    })();

    toast.promise(promise, {
      loading: 'Adding time...',
      success: (message) => message,
      error: (err) => err.message
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Add Time
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
                Current Time Remaining
              </label>
              <div className="mt-1 flex items-center space-x-2">
                <input
                  type="text"
                  value={`${Math.floor((member?.time_bank?.minutes_remaining || 0) / 60)}h ${(member?.time_bank?.minutes_remaining || 0) % 60}m`}
                  disabled
                  className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Minutes to Add
              </label>
              <div className="mt-1 flex items-center space-x-2">
                <input
                  type="number"
                  value={minutesToAdd}
                  onChange={(e) => setMinutesToAdd(e.target.value)}
                  min="1"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-500">minutes</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {Math.floor(parseInt(minutesToAdd || '0') / 60)}h {parseInt(minutesToAdd || '0') % 60}m
              </p>
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
              {loading ? 'Adding...' : 'Add Time'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}