import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UserIcon, 
  UserGroupIcon, 
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<any>;
  roles: string[];
}

const navigation: NavigationItem[] = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: HomeIcon,
    roles: ['patient', 'provider', 'admin'] 
  },
  { 
    name: 'Patient Profile', 
    href: '/patient-dashboard', 
    icon: UserIcon,
    roles: ['patient'] 
  },
  { 
    name: 'Medical Records', 
    href: '/records', 
    icon: DocumentTextIcon,
    roles: ['patient', 'provider'] 
  },
  { 
    name: 'Healthcare Providers', 
    href: '/providers', 
    icon: UserGroupIcon,
    roles: ['patient', 'admin'] 
  },
  { 
    name: 'Access Control', 
    href: '/access', 
    icon: KeyIcon,
    roles: ['patient'] 
  },
  { 
    name: 'Analytics', 
    href: '/analytics', 
    icon: ChartBarIcon,
    roles: ['provider', 'admin'] 
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Cog6ToothIcon,
    roles: ['patient', 'provider', 'admin'] 
  },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();
  const { isAuthenticated, userData } = useAuth();
  const [userRole, setUserRole] = useState<string>('patient');

  useEffect(() => {
    // Determine user role based on userData or contract state
    // This is a placeholder - implement actual role detection logic
    if (userData) {
      // Example logic to determine role
      const role = userData.profile?.role || 'patient';
      setUserRole(role);
    }
  }, [userData]);

  if (!isAuthenticated) return null;

  const filteredNavigation = navigation.filter(item => item.roles.includes(userRole));

  return (
    <div 
      className={`${
        expanded ? 'w-64' : 'w-20'
      } transition-all duration-300 ease-in-out bg-white h-screen shadow-lg fixed left-0 top-16`}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex-1 px-3 space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive
                      ? 'bg-primary-50 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out`}
                >
                  <item.icon
                    className={`${
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 flex-shrink-0 h-6 w-6 transition-colors duration-150 ease-in-out`}
                    aria-hidden="true"
                  />
                  {expanded && (
                    <span className="flex-1 whitespace-nowrap">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Toggle Button */}
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center w-full rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <span className={expanded ? 'mr-2' : ''}>
              {expanded ? (
                <ChevronLeftIcon className="h-5 w-5" />
              ) : (
                <ChevronRightIcon className="h-5 w-5" />
              )}
            </span>
            {expanded && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
