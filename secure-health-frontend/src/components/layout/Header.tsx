import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserCircleIcon,
  DocumentTextIcon,
  UserIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { APP_DETAILS } from '../../utils/constants';
import { truncateAddress } from '../../utils/helpers';

const navigation = [
  { name: 'Home', href: '/', icon: DocumentTextIcon },
  { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
  { name: 'Patient Records', href: '/patient-dashboard', icon: DocumentTextIcon },
  { name: 'Provider Portal', href: '/provider-dashboard', icon: UserIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Header() {
  const { isAuthenticated, connectWallet, disconnectWallet, userData } = useAuth();
  const location = useLocation();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      // You might want to add toast notification here
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      // You might want to add toast notification here
    }
  };

  return (
    <Disclosure as="nav" className="bg-primary-600 shadow-lg">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <Link to="/" className="flex flex-shrink-0 items-center">
                  <img
                    className="h-8 w-auto"
                    src={APP_DETAILS.icon}
                    alt={APP_DETAILS.name}
                  />
                  <span className="ml-2 text-xl font-bold text-white hidden sm:block">
                    {APP_DETAILS.name}
                  </span>
                </Link>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={classNames(
                          isActive
                            ? 'border-white text-white'
                            : 'border-transparent text-gray-300 hover:border-gray-200 hover:text-gray-200',
                          'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
                        )}
                      >
                        <item.icon className="h-5 w-5 mr-1" aria-hidden="true" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* User Menu & Wallet Connection */}
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {isAuthenticated ? (
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex items-center rounded-full bg-primary-700 p-1 text-white hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-white">
                        <UserCircleIcon className="h-8 w-8" aria-hidden="true" />
                        <span className="ml-2 mr-2">
                          {truncateAddress(userData?.profile?.stxAddress?.testnet || '')}
                        </span>
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              Profile Settings
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleDisconnect}
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block w-full text-left px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              Disconnect Wallet
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <button
                    onClick={handleConnect}
                    className="rounded-md bg-primary-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-200 hover:bg-primary-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    to={item.href}
                    className={classNames(
                      isActive
                        ? 'bg-primary-700 text-white'
                        : 'text-gray-200 hover:bg-primary-700 hover:text-white',
                      'flex items-center px-3 py-2 text-base font-medium'
                    )}
                  >
                    <item.icon className="h-5 w-5 mr-2" aria-hidden="true" />
                    {item.name}
                  </Disclosure.Button>
                );
              })}
            </div>
            <div className="border-t border-primary-700 pb-3 pt-4">
              {isAuthenticated ? (
                <div className="space-y-1">
                  <Disclosure.Button
                    as={Link}
                    to="/profile"
                    className="block px-4 py-2 text-base font-medium text-gray-200 hover:bg-primary-700 hover:text-white"
                  >
                    Profile Settings
                  </Disclosure.Button>
                  <Disclosure.Button
                    as="button"
                    onClick={handleDisconnect}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-200 hover:bg-primary-700 hover:text-white"
                  >
                    Disconnect Wallet
                  </Disclosure.Button>
                </div>
              ) : (
                <div className="px-4">
                  <button
                    onClick={handleConnect}
                    className="w-full rounded-md bg-primary-700 px-4 py-2 text-base font-medium text-white hover:bg-primary-800"
                  >
                    Connect Wallet
                  </button>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
