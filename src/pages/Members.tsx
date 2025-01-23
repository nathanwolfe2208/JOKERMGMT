import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { User, Clock, Settings, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import MembershipModal from '../components/MembershipModal';
import TimeBankModal from '../components/TimeBankModal';

interface Member {
  id: string;
  full_name: string;
  email: string;
  membership: {
    id: string;
    status: string;
    end_date: string;
  };
  time_bank: {
    id: string;
    minutes_remaining: number;
  };
}

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [isTimeBankModalOpen, setIsTimeBankModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data: memberships, error: membershipsError } = await supabase
        .from('memberships')
        .select('id, user_id, status, end_date')
        .eq('status', 'active');

      if (membershipsError) throw membershipsError;

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          time_banks (
            id,
            minutes_remaining
          )
        `);

      if (error) throw error;

      const members = data.map((item) => ({
        id: item.id,
        full_name: item.full_name,
        email: item.email,
        membership: memberships.find(m => m.user_id === item.id) || { id: '', status: '', end_date: '' },
        time_bank: item.time_banks[0] || { id: '', minutes_remaining: 0 }
      }));

      setMembers(members);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleEditMembership = (member: Member) => {
    setSelectedMember(member);
    setIsMembershipModalOpen(true);
  };

  const handleAddTime = (member: Member) => {
    setSelectedMember(member);
    setIsTimeBankModalOpen(true);
  };

  // Filter members based on search query
  const filteredMembers = members.filter(member =>
    member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <User  className="h-4 w-4 mr-2" />
                Add Member
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text gray-400" />
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 h-12 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
          />
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
                    ) : filteredMembers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4">
                          No members found
                        </td>
                      </tr>
                    ) : (
                      filteredMembers.map((member) => (
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
                              <button
                                onClick={() => handleEditMembership(member)}
                                className="text-grey-600 hover:text-grey-900 mr-4"
                              >
                                <Settings className='h-5 w-5'/>
                              </button>
                              <button
                                onClick={() => handleAddTime(member)}
                                className="text-green-600 hover:text-green-900 mr-4"
                              >
                                <Plus className="h-6 w-6" />
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

      {selectedMember && (
        <>
          <MembershipModal
            isOpen={isMembershipModalOpen}
            onClose={() => {
              setIsMembershipModalOpen(false);
              setSelectedMember(null);
            }}
            member={selectedMember}
            onSuccess={fetchMembers}
          />
          <TimeBankModal
            isOpen={isTimeBankModalOpen}
            onClose={() => {
              setIsTimeBankModalOpen(false);
              setSelectedMember(null);
            }}
            member={selectedMember}
            onSuccess={fetchMembers}
          />
        </>
      )}
    </Layout>
  );
}