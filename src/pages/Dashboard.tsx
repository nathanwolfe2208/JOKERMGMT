import { useEffect, useState } from 'react';
import { Users, Clock, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { isAdmin } = useAuth();

  const [activeMembersCount, setActiveMembersCount] = useState(0);
  const [activeSessionsCount, setActiveSessionsCount] = useState(0);
  const [totalHoursToday, setTotalHoursToday] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const stats = [
    {
      name: 'Active Members',
      value: activeMembersCount,
      icon: Users,
      href: '/members',
      color: 'bg-blue-500',
    },
    {
      name: 'Active Sessions',
      value: activeSessionsCount,
      icon: Timer,
      href: '/play-sessions',
      color: 'bg-green-500',
    },
    {
      name: 'Total Hours Today',
      value: totalHoursToday,
      icon: Clock,
      href: '/play-sessions',
      color: 'bg-purple-500',
    },
  ];

  useEffect(() => {
    const fetchCounts = async () => {
      if(loading) return;
      let loadingToast;
      try {
        setLoading(true);
        loadingToast = toast.loading("loading..");
        
        // Fetch active members count
        const { count: activeMembers, error: membersError } = await supabase
          .from('memberships')
          .select('*', { count: 'exact' })
          .eq('status', 'active'); // Adjust the status as needed

        if (membersError) throw membersError;

        setActiveMembersCount(activeMembers ?? 0);

        // Fetch active sessions count
        const { count: activeSessions, error: sessionsError } = await supabase
          .from('play_sessions') // Replace with your actual sessions table name
          .select('*', { count: 'exact' })
          .is('end_time', null); // Adjust the status as needed

        if (sessionsError) throw sessionsError;

        setActiveSessionsCount(activeSessions ?? 0);

        
        const { data: hoursData, error: hoursError } = await supabase
          .from('play_sessions') // Replace with your actual sessions table name
          .select('minutes_used');

        if (hoursError) throw hoursError;
        console.log(hoursData);
        const totalHours = hoursData.reduce((acc, ses) => {
          const minutes = ses.minutes_used + 0;
          return acc + minutes / 60;

        }, 0)
        setTotalHoursToday(totalHours);
      } catch (err: any) {
        console.error('Error fetching counts:', err);
        setError(err.message);
        toast.error(error);
      } finally {
        setLoading(false);
        toast.dismiss(loadingToast);
      }
    };

    fetchCounts();
  }, []);



  return (
    <Layout>
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your poker club's activity
        </p>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <dt>
                  <div className={`absolute rounded-md p-3 ${item.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                    {item.name}
                  </p>
                </dt>
                <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                  <p className="text-2xl font-semibold text-gray-900">
                    {item.value}
                  </p>
                </dd>
                <div className="absolute bottom-0 inset-x-0 bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <span className="font-medium text-blue-600 hover:text-blue-500">
                      View all<span className="sr-only"> {item.name}</span>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {isAdmin && (
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                <Users className="h-5 w-5 mr-2" />
                Add New Member
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                <Timer className="h-5 w-5 mr-2" />
                Start New Session
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}