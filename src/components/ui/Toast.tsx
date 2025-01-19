'use client';

import { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircleIcon, ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ToastProps {
  show: boolean;
  type: 'success' | 'error' | 'warning';
  message: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ show, type, message, onClose }) => {
  const icons = {
    success: <CheckCircleIcon className="h-6 w-6 text-green-400" />,
    error: <ExclamationCircleIcon className="h-6 w-6 text-red-400" />,
    warning: <ExclamationCircleIcon className="h-6 w-6 text-yellow-400" />
  };

  const bgColors = {
    success: 'bg-green-50',
    error: 'bg-red-50',
    warning: 'bg-yellow-50'
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800'
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999]">
      <Transition
        show={show}
        as={Fragment}
        enter="transform ease-out duration-300 transition"
        enterFrom="translate-y-2 opacity-0"
        enterTo="translate-y-0 opacity-100"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className={`max-w-sm w-full shadow-xl rounded-lg pointer-events-auto overflow-hidden ${bgColors[type]} border border-${type === 'success' ? 'green' : type === 'error' ? 'red' : 'yellow'}-200`}>
          <div className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {icons[type]}
              </div>
              <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${textColors[type]}`}>
                  {message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  className={`
                    rounded-md p-1.5 inline-flex hover:bg-${type === 'success' ? 'green' : type === 'error' ? 'red' : 'yellow'}-100
                    ${textColors[type]} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                    transition-colors duration-200
                  `}
                  onClick={onClose}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
}; 