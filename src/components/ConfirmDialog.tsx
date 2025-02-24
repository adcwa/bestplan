'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Goal } from '@/types/goals';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  goal?: Goal;
  type?: 'warning' | 'danger';
}

export const ConfirmDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  goal,
  type = 'warning'
}) => {
  const getBgColor = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-100';
      default:
        return 'bg-yellow-100';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'danger':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-500';
      default:
        return 'bg-yellow-600 hover:bg-yellow-500';
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-neutral-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${getBgColor()} sm:mx-0 sm:h-10 sm:w-10`}>
                    <ExclamationTriangleIcon className={`h-6 w-6 ${getIconColor()}`} aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-neutral-900">
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-neutral-500">
                        {message}
                      </p>
                      {goal && (
                        <div className="mt-4 bg-neutral-50 rounded-md p-4">
                          <h4 className="text-sm font-medium text-neutral-900 mb-2">
                            目标详情：
                          </h4>
                          <div className="space-y-2 text-sm text-neutral-600">
                            <p><span className="font-medium">标题：</span>{goal.title}</p>
                            <p><span className="font-medium">描述：</span>{goal.description}</p>
                            <p><span className="font-medium">领域：</span>{goal.domains.join('、')}</p>
                            <p><span className="font-medium">进度：</span>{goal.progress}%</p>
                            <p><span className="font-medium">任务完成情况：</span>
                              {goal.tasks?.filter(task => task.completed).length || 0} / {goal.tasks?.length || 0}
                            </p>
                            <p><span className="font-medium">创建时间：</span>
                              {goal.createdAt?.toLocaleDateString()}
                            </p>
                            {goal.completedAt && (
                              <p><span className="font-medium">完成时间：</span>
                                {goal.completedAt.toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${getButtonColor()}`}
                    onClick={onConfirm}
                  >
                    {type === 'danger' ? '确认删除' : '确认覆盖'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                  >
                    取消
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}; 