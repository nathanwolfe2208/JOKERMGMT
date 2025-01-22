import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { User, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Member {
  id: string;
  full_name: string;
  email: string;
  membership: {
    status: string;
    end_date: string;
  };
  time_bank: {
    minutes_remaining: number;
  };
}

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  /*useEffect(() => {
    fetchMembers();
  }, []);*/

  const fetchMembers = async () => {
    setLoading(true); // Start loading state
    try {
      // Step 1: Fetch active memberships
      const { data: memberships, error: membershipsError } = await supabase
        .from('memberships')
        .select('user_id, status, end_date')
        .eq('status', 'active');

  
      if (membershipsError) throw membershipsError;

      console.log(memberships);
  
      // Extract profile IDs from the active memberships
      const userIds = memberships.map(membership => membership.user_id);

      console.log(userIds);
  
      // Step 2: Fetch profiles corresponding to the active memberships
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          time_banks (
            minutes_remaining
          )
        `);
  
      if (error) throw error;

      console.log(data);
  
      // Transform the data to match the Member type
      const members = data.map((item) => ({
        id: item.id,
        full_name: item.full_name,
        email: item.email,
        membership: memberships.find(m => m.user_id === item.id) || { status: '', end_date: '' },
        time_bank: item.time_banks.length > 0 ? item.time_banks[0] : { minutes_remaining: 0 }
      }));
  
      setMembers(members);
    } catch (error) {
      console.error('Error fetching members:', error);
      // Optionally set an error state to display in the UI
      // setError('Failed to fetch members. Please try again later.');
    } finally {
      setLoading(false); // End loading state
    }
  };
  
  // Call fetchMembers when needed, for example, in a useEffect or an event handler
  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold text-gray-900">Members</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all members in your poker club
            </p>
          </div>
          {isAdmin && (
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <button className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto">
                <User className="h-4 w-4 mr-2" />
                Add Member
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Name
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Email
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Membership Status
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Time Remaining
                      </th>
                      {isAdmin && (
                        <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4">
                          Loading...
                        </td>
                      </tr>
                    ) : members.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4">
                          No members found
                        </td>
                      </tr>
                    ) : (
                      members.map((member) => (
                        <tr key={member.id}>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                            {member.full_name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {member.email}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              member.membership?.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {member.membership?.status || 'Inactive'}
                            </span>
                            {member.membership?.end_date && (
                              <span className="ml-2 text-gray-500">
                                (until {format(new Date(member.membership.end_date), 'MMM d, yyyy')})
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-gray-400" />
                              {Math.floor(member.time_bank?.minutes_remaining / 60)}h{' '}
                              {member.time_bank?.minutes_remaining % 60}m
                            </div>
                          </td>
                          {isAdmin && (
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <button className="text-blue-600 hover:text-blue-900 mr-4">
                                Edit
                              </button>
                              <button className="text-blue-600 hover:text-blue-900">
                                Add Time
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
