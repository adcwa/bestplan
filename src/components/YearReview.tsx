import React, { useState, useCallback, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Review } from '@/types/review';
import { Goal } from '@/types/goals';
import { AISettings } from '@/types/command';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import { ArrowPathIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { storage } from '@/services/storage';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  goals: Goal[];
  aiSettings: AISettings;
  existingReview?: Review;
}

const REVIEW_PROMPT = `请根据以下目标数据生成一份详尽的年度回顾报告。报告应包含：

1. 总体成就概述
   - 完成的目标数量和比例
   - 重要里程碑
   - 成长亮点

2. 分领域详细分析
   - 每个领域的目标完成情况
   - 特别成功的领域
   - 需要改进的领域

3. 习惯养成分析
   - 已经形成的好习惯
   - 坚持情况分析
   - 习惯对生活的影响

4. 数据可视化建议
   - 用 Markdown 表格展示关键数据

5. 明年规划建议
   - 基于今年表现的具体建议
   - 需要继续的目标
   - 新的发展方向

请用 Markdown 格式输出，确保报告既专业又易读，包含数据支持和具体例子。`;

export const YearReview: React.FC<Props> = ({
  isOpen,
  onClose,
  goals,
  aiSettings,
  existingReview
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [review, setReview] = useState<Review | undefined>(existingReview);
  const [error, setError] = useState<string | null>(null);
  const [generationStep, setGenerationStep] = useState<string>('');

  useEffect(() => {
    if (isOpen && !existingReview && !isLoading && !review) {
      generateReview();
    }
  }, [isOpen, existingReview]);

  useEffect(() => {
    setReview(existingReview);
  }, [existingReview]);

  const generateReview = useCallback(async () => {
    if (!aiSettings.openApiKey || !aiSettings.baseUrl || !aiSettings.modelName) {
      setError('请先在设置中配置 AI 参数');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGenerationStep('准备数据...');

    try {
      setGenerationStep('分析目标数据...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      const currentYear = new Date().getFullYear();
      const yearStart = new Date(currentYear, 0, 1);
      const yearEnd = new Date(currentYear, 11, 31);
      
      const yearGoals = goals.filter(goal => {
        const goalDate = new Date(goal.startDate);
        return goalDate >= yearStart && goalDate <= yearEnd;
      });

      if (yearGoals.length === 0) {
        throw new Error('当年没有设置任何目标');
      }

      setGenerationStep('生成报告中...');
      const response = await fetch(aiSettings.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiSettings.openApiKey}`
        },
        body: JSON.stringify({
          model: aiSettings.modelName,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的目标管理分析师，擅长数据分析和生成图文并茂的报告。'
            },
            {
              role: 'user',
              content: `${REVIEW_PROMPT}\n\n目标数据：${JSON.stringify(yearGoals, null, 2)}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`生成回顾报告失败: ${response.statusText}`);
      }

      setGenerationStep('处理响应数据...');
      const data = await response.json();
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('AI 响应格式错误');
      }

      const content = data.choices[0].message.content;

      setGenerationStep('保存报告...');
      const newReview: Review = {
        id: Date.now().toString(),
        year: currentYear,
        content,
        generatedAt: new Date(),
        goals: yearGoals
      };

      await storage.saveReview(newReview);
      setReview(newReview);
      setGenerationStep('完成！');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to generate review:', error);
      setError(error instanceof Error ? error.message : '生成回顾报告时出错');
    } finally {
      setIsLoading(false);
      setGenerationStep('');
    }
  }, [goals, aiSettings]);

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
              <Dialog.Panel className="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title as="h3" className="text-2xl font-semibold text-neutral-900">
                      {new Date().getFullYear()} 年度回顾
                    </Dialog.Title>
                    <div className="flex items-center gap-4">
                      {review && (
                        <span className="text-sm text-neutral-500">
                          生成于 {format(new Date(review.generatedAt), 'yyyy-MM-dd HH:mm')}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={generateReview}
                        disabled={isLoading}
                        className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white transition-all ${
                          isLoading 
                            ? 'bg-neutral-400 cursor-not-allowed' 
                            : 'bg-primary hover:bg-primary-dark'
                        }`}
                      >
                        <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        {review ? '重新生成' : '生成回顾'}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-4 bg-red-50 rounded-md"
                    >
                      <p className="text-sm text-red-600">{error}</p>
                    </motion.div>
                  )}

                  <div className="mt-4 max-h-[70vh] overflow-y-auto">
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center justify-center py-12 space-y-4"
                        >
                          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                          <p className="text-neutral-600">{generationStep}</p>
                        </motion.div>
                      ) : review ? (
                        <motion.div
                          key="content"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="prose prose-neutral max-w-none"
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {review.content}
                          </ReactMarkdown>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center py-12 space-y-4"
                        >
                          <DocumentTextIcon className="w-16 h-16 text-neutral-300 mx-auto" />
                          <p className="text-neutral-500">点击生成按钮开始生成年度回顾</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}; 