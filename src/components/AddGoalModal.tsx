import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Goal, GoalType, GoalDomain, Trigger, GoalHistory } from '../types/goals';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { BasicInfo } from './AddGoalModal/BasicInfo';
import { TimeSettings } from './AddGoalModal/TimeSettings';
import { PlusIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Toast } from '@/components/ui/Toast';

interface Props {
  type: GoalType;
  goal?: Goal;
  onClose: () => void;
  onSubmit: (goal: Goal) => void;
}

const DOMAINS: GoalDomain[] = [
  '精神', '智力', '情感', '职业', '婚姻', 
  '亲子', '社交', '娱乐', '财务', '健康'
];

const getSteps = (type: GoalType) => [
  { id: 'basic', title: '基本信息', required: true },
  { id: 'time', title: '时间规划', required: true },
  { id: 'motivation', title: '动机计划', required: false },
  { id: 'action', title: '下一步行动', required: false },
  { id: 'trigger', title: '触发器设置', required: false }
].map(step => ({
  ...step,
  // 成就型目标的时间规划不需要频率
  required: type === 'achievement' && step.id === 'time' ? false : step.required
}));

export const AddGoalModal: React.FC<Props> = ({ type, goal, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [frequency, setFrequency] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<GoalDomain[]>([]);
  const [motivations, setMotivations] = useState<string[]>([]);
  const [newMotivation, setNewMotivation] = useState('');
  const [nextSteps, setNextSteps] = useState<string[]>([]);
  const [newStep, setNewStep] = useState('');
  const [rewards, setRewards] = useState<string[]>([]);
  const [newReward, setNewReward] = useState('');
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [newTriggerWhen, setNewTriggerWhen] = useState('');
  const [newTriggerThen, setNewTriggerThen] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning';
    message: string;
  }>({
    show: false,
    type: 'success',
    message: ''
  });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const [localNextStepStatus, setLocalNextStepStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setStartDate(goal.startDate.toISOString().split('T')[0]);
      setDeadline(goal.deadline.toISOString().split('T')[0]);
      setFrequency(goal.frequency);
      setSelectedDomains(goal.domains);
      setMotivations(goal.motivations);
      setNextSteps(goal.nextSteps);
      setRewards(goal.rewards);
      setTriggers(goal.triggers);
      setLocalNextStepStatus(goal.nextStepStatus || {});
    }
  }, [goal]);

  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleLocalStepStatusChange = (step: string, isCompleted: boolean) => {
    setLocalNextStepStatus(prev => ({
      ...prev,
      [step]: isCompleted
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 修改验证逻辑
    if (!title || !startDate || !deadline || (type === 'habit' && !frequency.trim())) {
      showToast('warning', `请完成所有必填字段${type === 'habit' ? '，包括执行频率' : ''}`);
      return;
    }

    const now = new Date();
    const historyEntry: GoalHistory = {
      id: Date.now().toString(),
      date: now,
      type: goal ? 'update' : 'create',
      changes: []
    };

    if (goal) {
      // 记录所有变更
      const fields: Array<{ field: keyof Goal; label: string }> = [
        { field: 'title', label: '标题' },
        { field: 'startDate', label: '开始时间' },
        { field: 'deadline', label: '截止时间' },
        { field: 'frequency', label: '频率' },
        { field: 'domains', label: '领域' },
        { field: 'motivations', label: '动机' },
        { field: 'nextSteps', label: '下一步' },
        { field: 'triggers', label: '触发器' }
      ];

      fields.forEach(({ field, label }) => {
        const oldValue = goal[field];
        const newValue = field === 'startDate' || field === 'deadline'
          ? new Date(field === 'startDate' ? startDate : deadline)
          : field === 'domains' ? selectedDomains
          : field === 'motivations' ? motivations
          : field === 'nextSteps' ? nextSteps
          : field === 'triggers' ? triggers
          : field === 'title' ? title
          : frequency;

        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          historyEntry.changes.push({
            field,
            oldValue,
            newValue
          });
        }
      });
    }

    const updatedGoal: Goal = {
      id: goal?.id || Date.now().toString(),
      type,
      title,
      startDate: new Date(startDate),
      deadline: new Date(deadline),
      frequency: type === 'habit' ? frequency : undefined, // 只在习惯型目标中设置频率
      domains: selectedDomains,
      motivations,
      nextSteps,
      nextStepStatus: localNextStepStatus,
      rewards,
      triggers,
      events: goal?.events || [],
      history: [...(goal?.history || []), historyEntry],
      lastModified: now
    };

    onSubmit(updatedGoal);
    onClose();
  };

  const handleNextStep = () => {
    if (steps[currentStep].required) {
      switch (steps[currentStep].id) {
        case 'basic':
          if (!title.trim()) {
            showToast('warning', '请填写目标标题');
            return;
          }
          break;
        case 'time':
          if (!startDate || !deadline || (type === 'habit' && !frequency.trim())) {
            showToast('warning', `请完成${type === 'habit' ? '时间规划和执行频率' : '时间规划'}`);
            return;
          }
          break;
      }
    }

    // 检查是否是最后一步
    const isLastStep = currentStep === steps.length - 1;

    if (!isLastStep) {
      // 如果不是最后一步，进入下一步
      setCurrentStep(prev => prev + 1);
    } else {
      // 如果是最后一步，提交表单
      handleSubmit(new Event('submit') as any);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // 添加步骤完成状态检查函数
  const isStepComplete = (stepId: string) => {
    switch (stepId) {
      case 'basic':
        return title.trim() !== '';
      case 'time':
        return startDate && deadline && frequency.trim() !== '';
      case 'motivation':
        return true; // 非必填步骤，始终返回 true
      case 'action':
        return true; // 非必填步骤，始终返回 true
      case 'trigger':
        return true; // 非必填步骤，始终返回 true
      default:
        return false;
    }
  };

  // 检查是否可以滚动
  const checkScroll = useCallback(() => {
    if (stepsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = stepsContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  }, []);

  // 监听容器大小变化
  useEffect(() => {
    const container = stepsContainerRef.current;
    if (container) {
      checkScroll();
      const resizeObserver = new ResizeObserver(checkScroll);
      resizeObserver.observe(container);
      container.addEventListener('scroll', checkScroll);
      
      return () => {
        resizeObserver.disconnect();
        container.removeEventListener('scroll', checkScroll);
      };
    }
  }, [checkScroll]);

  // 滚动处理函数
  const handleScroll = (direction: 'left' | 'right') => {
    if (stepsContainerRef.current) {
      const scrollAmount = 200; // 每次滚动的距离
      const newScrollLeft = stepsContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      stepsContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // 根据目标类型获取步骤
  const steps = getSteps(type);

  return (
    <>
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
      <Transition appear show={true} as={Fragment}>
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
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-8">
                    <Dialog.Title
                      as="h3"
                      className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                    >
                      {goal ? '编辑目标' : `新增${type === 'achievement' ? '成就型' : '习惯型'}目标`}
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="p-1 rounded-full hover:bg-neutral-100"
                    >
                      <XMarkIcon className="w-6 h-6 text-neutral-500" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative border-b border-neutral-200 pb-4">
                      {/* 左滚动按钮 */}
                      {canScrollLeft && (
                        <button
                          type="button"
                          onClick={() => handleScroll('left')}
                          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-white shadow-md hover:bg-neutral-50"
                        >
                          <ChevronLeftIcon className="w-5 h-5 text-neutral-500" />
                        </button>
                      )}

                      {/* 步骤导航容器 */}
                      <div 
                        ref={stepsContainerRef}
                        className="flex items-center justify-between overflow-x-auto scrollbar-none scroll-smooth px-6 gap-16"
                      >
                        {steps.map((step, index) => (
                          <button
                            key={step.id}
                            type="button"
                            onClick={() => {
                              if (step.required) {
                                const previousRequiredSteps = steps
                                  .slice(0, index)
                                  .filter(s => s.required);
                                
                                const canNavigate = previousRequiredSteps.every(s => {
                                  switch (s.id) {
                                    case 'basic':
                                      return title.trim() !== '';
                                    case 'time':
                                      return startDate && deadline && frequency.trim() !== '';
                                    default:
                                      return true;
                                  }
                                });
                                
                                if (!canNavigate) {
                                  showToast('warning', '请先完成前面的必填步骤');
                                  return;
                                }
                              }
                              
                              setCurrentStep(index);
                            }}
                            className={`flex flex-col items-center group flex-shrink-0 w-20 relative ${
                              index === currentStep 
                                ? 'text-primary' 
                                : index < currentStep 
                                  ? 'text-neutral-900'
                                  : 'text-neutral-400 hover:text-neutral-600'
                            }`}
                          >
                            <div className="relative">
                              <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors mb-2
                                ${index === currentStep 
                                  ? 'border-primary bg-primary text-white' 
                                  : index < currentStep 
                                    ? 'border-neutral-900 bg-neutral-900 text-white'
                                    : 'border-neutral-300 bg-white text-neutral-500 group-hover:border-primary/50'
                                }
                              `}>
                                {index + 1}
                              </div>
                              {index < steps.length - 1 && (
                                <div className={`
                                  absolute top-[14px] left-[32px] w-[64px] h-[2px]
                                  ${index < currentStep ? 'bg-neutral-900' : 'bg-neutral-200'}
                                `} />
                              )}
                            </div>
                            <div className="text-xs font-medium text-center">
                              {step.title}
                              {step.required && <span className="text-red-500">*</span>}
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* 右滚动按钮 */}
                      {canScrollRight && (
                        <button
                          type="button"
                          onClick={() => handleScroll('right')}
                          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-white shadow-md hover:bg-neutral-50"
                        >
                          <ChevronRightIcon className="w-5 h-5 text-neutral-500" />
                        </button>
                      )}
                    </div>

                    <div className="min-h-[400px] py-4">
                      {currentStep === 0 && (
                        <BasicInfo
                          title={title}
                          setTitle={setTitle}
                          selectedDomains={selectedDomains}
                          setSelectedDomains={setSelectedDomains}
                          DOMAINS={DOMAINS}
                        />
                      )}
                      
                      {currentStep === 1 && (
                        <TimeSettings
                          type={type}
                          startDate={startDate}
                          setStartDate={setStartDate}
                          deadline={deadline}
                          setDeadline={setDeadline}
                          frequency={frequency}
                          setFrequency={setFrequency}
                        />
                      )}
                      
                      {currentStep === 2 && (
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                              动机列表
                            </label>
                            <div className="space-y-2">
                              {motivations.map((motivation, index) => (
                                <div 
                                  key={index} 
                                  className="flex items-center gap-2 bg-neutral-50 rounded-lg pr-2 w-full group hover:bg-neutral-100 transition-colors"
                                >
                                  <span className="flex-1 p-2 break-words min-w-0">
                                    {motivation}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setMotivations(prev => prev.filter((_, i) => i !== index))}
                                    className="text-neutral-400 hover:text-red-500 transition-colors"
                                  >
                                    <XMarkIcon className="w-5 h-5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <input
                                type="text"
                                value={newMotivation}
                                onChange={(e) => setNewMotivation(e.target.value)}
                                className="flex-grow px-3 py-2 border border-neutral-300 rounded-lg focus:ring-primary focus:border-primary"
                                placeholder="输入新动机..."
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (newMotivation.trim()) {
                                    setMotivations(prev => [...prev, newMotivation.trim()]);
                                    setNewMotivation('');
                                  }
                                }}
                                className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                              >
                                <PlusIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {currentStep === 3 && (
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                              下一步行动
                            </label>
                            <div className="space-y-2">
                              {nextSteps.map((step, index) => (
                                <div 
                                  key={index} 
                                  className="flex items-center gap-2 bg-neutral-50 rounded-lg pr-2 w-full group hover:bg-neutral-100 transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={localNextStepStatus[step] || false}
                                    onChange={() => handleLocalStepStatusChange(step, !localNextStepStatus[step])}
                                    className="ml-2 rounded border-neutral-300 text-primary focus:ring-primary"
                                  />
                                  <span className={`flex-1 p-2 ${
                                    localNextStepStatus[step] ? 'text-neutral-400 line-through' : 'text-neutral-700'
                                  }`}>
                                    {step}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setNextSteps(prev => prev.filter((_, i) => i !== index))}
                                    className="text-neutral-400 hover:text-red-500 transition-colors"
                                  >
                                    <XMarkIcon className="w-5 h-5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <input
                                type="text"
                                value={newStep}
                                onChange={(e) => setNewStep(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && newStep.trim()) {
                                    setNextSteps(prev => [...prev, newStep.trim()]);
                                    setNewStep('');
                                  }
                                }}
                                className="flex-grow px-3 py-2 border border-neutral-300 rounded-lg focus:ring-primary focus:border-primary"
                                placeholder="添加新的行动步骤..."
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (newStep.trim()) {
                                    setNextSteps(prev => [...prev, newStep.trim()]);
                                    setNewStep('');
                                  }
                                }}
                                className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                              >
                                <PlusIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {currentStep === 4 && (
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                              触发器设置
                            </label>
                            <div className="space-y-4">
                              {triggers.map((trigger, index) => (
                                <div key={index} className="p-4 bg-neutral-50 rounded-lg space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">触发器 {index + 1}</span>
                                    <button
                                      type="button"
                                      onClick={() => setTriggers(prev => prev.filter((_, i) => i !== index))}
                                      className="text-red-500 hover:text-red-600"
                                    >
                                      <XMarkIcon className="w-5 h-5" />
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <div className="text-sm text-neutral-500 mb-1">当...</div>
                                      <div className="p-2 bg-white rounded border border-neutral-200">
                                        {trigger.when}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-neutral-500 mb-1">则...</div>
                                      <div className="p-2 bg-white rounded border border-neutral-200">
                                        {trigger.then}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <input
                                    type="text"
                                    value={newTriggerWhen}
                                    onChange={(e) => setNewTriggerWhen(e.target.value)}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                                    placeholder="当..."
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={newTriggerThen}
                                    onChange={(e) => setNewTriggerThen(e.target.value)}
                                    className="flex-grow px-3 py-2 border border-neutral-300 rounded-lg"
                                    placeholder="则..."
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (newTriggerWhen.trim() && newTriggerThen.trim()) {
                                        setTriggers(prev => [...prev, {
                                          id: Date.now().toString(),
                                          when: newTriggerWhen.trim(),
                                          then: newTriggerThen.trim()
                                        }]);
                                        setNewTriggerWhen('');
                                        setNewTriggerThen('');
                                      }
                                    }}
                                    className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                  >
                                    <PlusIcon className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between pt-6 border-t border-neutral-200">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className={`
                          px-4 py-2 rounded-lg text-neutral-600 hover:bg-neutral-50
                          ${currentStep === 0 ? 'invisible' : ''}
                        `}
                      >
                        上一步
                      </button>
                      <div className="flex gap-3">
                        {!steps[currentStep].required && currentStep < steps.length - 1 && (
                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="px-4 py-2 text-neutral-600 hover:text-neutral-900"
                          >
                            跳过
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                        >
                          {currentStep === steps.length - 1 ? '完成' : '下一步'}
                        </button>
                      </div>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}; 