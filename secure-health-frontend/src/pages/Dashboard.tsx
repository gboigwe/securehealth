import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useContract } from '../hooks/useContract';
import { 
    DocumentTextIcon, 
    UserGroupIcon, 
    ClockIcon,
    CalendarIcon
  } from '@heroicons/react/24/outline';

interface DashboardStats {
  totalRecords: number;
  pendingRequests: number;
  activeProviders: number;
  lastUpdate: string;
}

export default function Dashboard() {
  const { userData } = useAuth();
  const { getPatientRecord } = useContract();
  const [stats, setStats] = useState<DashboardStats>({
    totalRecords: 0,
    pendingRequests: 0,
    activeProviders: 0,
    lastUpdate: '-'
  });

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        // Implement fetching of actual stats from the contract
        // For now, using placeholder data
        setStats({
          totalRecords: 5,
          pendingRequests: 2,
          activeProviders: 3,
          lastUpdate: new Date().toLocaleDateString()
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Welcome back, {userData?.profile?.name || 'User'}
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          Here's an overview of your health records and activities
        </p>
      </div>

      {/* Stats */}
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6">
          <dt>
            <div className="absolute rounded-md bg-primary-500 p-3">
              <DocumentTextIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">Total Records</p>
          </dt>
          <dd className="ml-16 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{stats.totalRecords}</p>
          </dd>
        </div>

        <div className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6">
          <dt>
            <div className="absolute rounded-md bg-primary-500 p-3">
              <ClockIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">Pending Requests</p>
          </dt>
          <dd className="ml-16 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{stats.pendingRequests}</p>
          </dd>
        </div>

        <div className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6">
          <dt>
            <div className="absolute rounded-md bg-primary-500 p-3">
              <UserGroupIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">Active Providers</p>
          </dt>
          <dd className="ml-16 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{stats.activeProviders}</p>
          </dd>
        </div>

        <div className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6">
          <dt>
            <div className="absolute rounded-md bg-primary-500 p-3">
              <CalendarIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">Last Update</p>
          </dt>
          <dd className="ml-16 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{stats.lastUpdate}</p>
          </dd>
        </div>
      </dl>

      {/* Recent Activity */}
      <div className="mt-8">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Activity</h3>
        {/* Add recent activity component here */}
      </div>
    </div>
  );
}
