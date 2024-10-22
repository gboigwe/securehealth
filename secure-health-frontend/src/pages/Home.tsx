import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShieldCheckIcon, 
  LockClosedIcon, 
  UserGroupIcon, 
  DocumentTextIcon 
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Secure Medical Records',
    description: 'Your medical records are encrypted and stored on a decentralized network, ensuring maximum security and privacy.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Patient Control',
    description: 'Maintain complete control over your medical records and manage healthcare provider access.',
    icon: LockClosedIcon,
  },
  {
    name: 'Provider Collaboration',
    description: 'Enable seamless and secure collaboration between healthcare providers while maintaining privacy.',
    icon: UserGroupIcon,
  },
  {
    name: 'Immutable History',
    description: 'All record updates are tracked on the blockchain, ensuring a complete and tamper-proof medical history.',
    icon: DocumentTextIcon,
  },
];

export default function Home() {
  const { isAuthenticated, connectWallet } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      connectWallet();
    }
  };

  return (
    <div className="relative isolate">
      {/* Hero section */}
      <div className="relative px-6 lg:px-8">
        <div className="mx-auto max-w-3xl pt-20 pb-32 sm:pt-48 sm:pb-40">
          <div>
            <div className="hidden sm:mb-8 sm:flex sm:justify-center">
              <div className="relative overflow-hidden rounded-full py-1.5 px-4 text-sm leading-6 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                <span className="text-gray-600">
                  Revolutionizing healthcare record management.{' '}
                </span>
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Secure Health Records on the Blockchain
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                A decentralized platform that puts you in control of your medical records
                while ensuring the highest level of security and privacy.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <button
                  onClick={handleGetStarted}
                  className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
                </button>
                <a href="#features" className="text-sm font-semibold leading-6 text-gray-900">
                  Learn more <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">
              Better Healthcare Management
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to manage your health records
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <feature.icon className="h-5 w-5 flex-none text-primary-600" aria-hidden="true" />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
