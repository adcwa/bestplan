import { Fragment, useState, useEffect, useCallback } from 'react';
import { Dialog, Combobox, Transition } from '@headlessui/react';
import { Command, CommandType, AISettings } from '@/types/command';
import { 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon, 
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  SparklesIcon,
  ClipboardIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Goal } from '@/types/goals';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { save } from '@tauri-apps/api/dialog';
import { writeTextFile } from '@tauri-apps/api/fs';
import { BaseDirectory, join } from '@tauri-apps/api/path';
import { format } from 'date-fns';
import { ConfirmDialog } from './ConfirmDialog';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  goals: Goal[];
  aiSettings: AISettings;
  onUpdateAISettings: (settings: AISettings) => void;
  onExport: () => Promise<string>;
  onImport: (data: Goal[]) => void;
  onSearch: (goal: Goal) => void;
  initialQuery?: string;
}

const commands: Command[] = [
  {
    id: 'export',
    title: '导出数据',
    description: '将所有目标数据导出为 JSON 文件',
    icon: ArrowDownTrayIcon,
   // shortcut: ['⌘', 'E']
  },
  {
    id: 'import',
    title: '导入数据',
    description: '从 JSON 文件导入目标数据',
    icon: ArrowUpTrayIcon,
    //shortcut: ['⌘', 'I']
  },
  {
    id: 'search',
    title: '搜索目标',
    description: '快速查找和跳转到目标',
    icon: MagnifyingGlassIcon,
   // shortcut: ['⌘', 'F']
  },
  {
    id: 'settings',
    title: '设置',
    description: '配置 AI 设置和其他选项',
    icon: Cog6ToothIcon,
   // shortcut: ['⌘', ',']
  },
  {
    id: 'ai-prompt',
    title: 'AI 助手',
    description: '使用 AI 分析目标并获取建议',
    icon: SparklesIcon,
   // shortcut: ['⌘', 'P']
  }
];

export const CommandPalette: React.FC<Props> = ({
  isOpen,
  onClose,
  goals,
  aiSettings,
  onUpdateAISettings,
  onExport,
  onImport,
  onSearch,
  initialQuery = ''
}) => {
  const [query, setQuery] = useState('');
  const [selectedCommand, setSelectedCommand] = useState<CommandType | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Goal[]>([]);
  const [mentionedGoal, setMentionedGoal] = useState<Goal | null>(null);
  const [importData, setImportData] = useState<Goal[] | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const searchInput = document.querySelector('[data-command-input]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && initialQuery) {
      setQuery(initialQuery);
      const settingsCommand = commands.find(cmd => cmd.id === 'settings');
      if (settingsCommand) {
        setSelectedCommand('settings');
      }
    }
  }, [isOpen, initialQuery]);

  const validateAISettings = () => {
    const missingFields: string[] = [];
    
    if (!aiSettings.openApiKey) {
      missingFields.push('API Key');
    }
    if (!aiSettings.baseUrl) {
      missingFields.push('Base URL');
    }
    if (!aiSettings.modelName) {
      missingFields.push('Model Name');
    }

    if (missingFields.length > 0) {
      setError(`请在设置中配置以下参数：${missingFields.join('、')}`);
      setSelectedCommand('settings'); // 自动切换到设置页面
      return false;
    }
    return true;
  };

  const getFilteredItems = useCallback(() => {
    if (!query) return { commands, goals: [] };

    const filteredCommands = commands.filter((command) =>
      command.title.toLowerCase().includes(query.toLowerCase()) ||
      command.description.toLowerCase().includes(query.toLowerCase())
    );

    const filteredGoals = goals.filter((goal) =>
      goal.title.toLowerCase().includes(query.toLowerCase()) ||
      goal.domains.some(domain => domain.toLowerCase().includes(query.toLowerCase()))
    );

    return { commands: filteredCommands, goals: filteredGoals };
  }, [query, goals]);

  const handleCommandSelect = async (commandOrGoal: Command | Goal | null) => {
    if (!commandOrGoal) return;

    if ('type' in commandOrGoal) {
      onSearch(commandOrGoal);
      onClose();
      return;
    }

    setSelectedCommand(commandOrGoal.id);
    switch (commandOrGoal.id) {
      case 'export':
        try {
          // 生成带时间戳的文件名
          const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
          const defaultFileName = `bestplan_goals_${timestamp}.json`;

          if (window.__TAURI__) {
            // 使用 Tauri 的对话框 API
            const filePath = await save({
              filters: [{
                name: 'JSON',
                extensions: ['json']
              }],
              defaultPath: defaultFileName
            });

            if (filePath) {
              // 准备导出数据
              const exportData = {
                version: "1.0",
                exportDate: new Date().toISOString(),
                goals: goals.map(goal => ({
                  ...goal,
                  createdAt: goal.createdAt?.toISOString(),
                  updatedAt: goal.updatedAt?.toISOString(),
                  completedAt: goal.completedAt?.toISOString()
                }))
              };

              // 写入文件
              await writeTextFile(filePath, JSON.stringify(exportData, null, 2));
              console.log('Data exported successfully');
            }
          } else {
            // Web 环境的导出逻辑
            const exportData = {
              version: "1.0",
              exportDate: new Date().toISOString(),
              goals: goals.map(goal => ({
                ...goal,
                createdAt: goal.createdAt?.toISOString(),
                updatedAt: goal.updatedAt?.toISOString(),
                completedAt: goal.completedAt?.toISOString()
              }))
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = defaultFileName;
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }
          onClose();
        } catch (error) {
          console.error('Export failed:', error);
          setError('导出失败，请确保有正确的文件权限');
        }
        break;

      case 'import':
        try {
          const fileInput = document.getElementById('file-input') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = ''; // 清除之前的选择
            fileInput.click();
          }
        } catch (error) {
          console.error('Import failed:', error);
          setError('导入失败，请重试');
        }
        break;

      case 'search':
        setQuery('');
        break;

      case 'settings':
      case 'ai-prompt':
        break;
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        const importData = JSON.parse(text);
        
        // 处理导入的数据
        const processedGoals = importData.goals.map((goal: any) => ({
          ...goal,
          createdAt: goal.createdAt ? new Date(goal.createdAt) : new Date(),
          updatedAt: goal.updatedAt ? new Date(goal.updatedAt) : new Date(),
          completedAt: goal.completedAt ? new Date(goal.completedAt) : null
        }));

        // 检查是否有重复的目标
        const duplicateGoals = processedGoals.filter(importGoal => 
          goals.some(existingGoal => existingGoal.id === importGoal.id)
        );

        if (duplicateGoals.length > 0) {
          setImportData(processedGoals);
          setShowConfirmDialog(true);
          return;
        }

        onImport(processedGoals);
        onClose();
      } catch (error) {
        console.error('Failed to parse import file:', error);
        setError('导入失败，文件格式不正确');
      }
    }
  };

  const handleConfirmImport = () => {
    if (importData) {
      onImport(importData);
      setShowConfirmDialog(false);
      onClose();
    }
  };

  const handleAIPrompt = async () => {
    setError(null);

    if (!aiPrompt.trim()) {
      setError('请输入问题或需求');
      return;
    }

    if (!validateAISettings()) {
      return;
    }

    setIsLoading(true);
    try {
      let targetGoals = goals;
      if (mentionedGoal) {
        targetGoals = [mentionedGoal];
      }

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
              content: '你是一个目标管理专家，可以帮助用户分析和优化他们的目标。'
            },
            {
              role: 'user',
              content: `基于以下目标数据和用户提示，请给出专业的建议和分析：\n\n目标数据：${JSON.stringify(targetGoals)}\n\n用户提示：${aiPrompt}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format');
      }

      setAiResponse(data.choices[0].message.content);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          setError('API Key 无效，请检查设置');
        } else if (error.message.includes('429')) {
          setError('请求过于频繁，请稍后重试');
        } else {
          setError(`获取 AI 响应失败: ${error.message}`);
        }
      } else {
        setError('获取 AI 响应失败，请稍后重试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResponse = async () => {
    try {
      await navigator.clipboard.writeText(aiResponse);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleAIPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setAiPrompt(value);
    setError(null);

    const atIndex = value.lastIndexOf('@');
    if (atIndex !== -1) {
      const searchTerm = value.slice(atIndex + 1).toLowerCase();
      const matchedGoals = goals.filter(goal =>
        goal.title.toLowerCase().includes(searchTerm)
      );
      setSearchResults(matchedGoals);
    } else {
      setSearchResults([]);
    }
  };

  const handleMentionSelect = (goal: Goal) => {
    const atIndex = aiPrompt.lastIndexOf('@');
    const newPrompt = aiPrompt.slice(0, atIndex) + `@${goal.title} `;
    setAiPrompt(newPrompt);
    setSearchResults([]);
    setMentionedGoal(goal);
  };

  // 自定义 Markdown 组件
  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={tomorrow}
          language={match[1]}
          PreTag="div"
          className="rounded-md"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={`${className} bg-neutral-100 rounded px-1`} {...props}>
          {children}
        </code>
      );
    },
    // 其他 Markdown 组件样式
    p: (props: any) => <p className="mb-4" {...props} />,
    h1: (props: any) => <h1 className="text-2xl font-bold mb-4" {...props} />,
    h2: (props: any) => <h2 className="text-xl font-bold mb-3" {...props} />,
    h3: (props: any) => <h3 className="text-lg font-bold mb-2" {...props} />,
    ul: (props: any) => <ul className="list-disc pl-6 mb-4" {...props} />,
    ol: (props: any) => <ol className="list-decimal pl-6 mb-4" {...props} />,
    li: (props: any) => <li className="mb-1" {...props} />,
    blockquote: (props: any) => (
      <blockquote className="border-l-4 border-neutral-300 pl-4 italic my-4" {...props} />
    ),
  };

  const AISettingsAlert = () => (
    <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            请先完成 AI 设置才能使用回顾功能。请在下方配置必要的 AI 参数。
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog 
          as="div" 
          className="relative z-50" 
          onClose={onClose}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-neutral-900/50 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="mx-auto max-w-2xl transform divide-y divide-neutral-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
                <Combobox 
                  onChange={(command: Command | null) => handleCommandSelect(command)}
                  nullable
                >
                  {({ activeOption }) => (
                    <>
                      <div className="relative">
                        <MagnifyingGlassIcon
                          className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-neutral-400"
                          aria-hidden="true"
                        />
                        <Combobox.Input
                          className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-neutral-900 placeholder:text-neutral-400 focus:ring-0 sm:text-sm"
                          placeholder="搜索命令..."
                          onChange={(event) => setQuery(event.target.value)}
                          data-command-input
                        />
                      </div>

                      {(query === '' || getFilteredItems().commands.length > 0 || getFilteredItems().goals.length > 0) && (
                        <Combobox.Options static className="max-h-80 scroll-py-2 divide-y divide-neutral-100 overflow-y-auto">
                          {getFilteredItems().commands.length > 0 && (
                            <li className="p-2">
                              <h3 className="text-xs font-semibold text-neutral-500 mb-2">命令</h3>
                              {getFilteredItems().commands.map((command) => (
                                <Combobox.Option
                                  key={command.id}
                                  value={command}
                                  className={({ active }) =>
                                    `flex cursor-default select-none items-center rounded-md px-3 py-2 ${
                                      active ? 'bg-primary text-white' : 'text-neutral-900'
                                    }`
                                  }
                                >
                                  {({ active }) => (
                                    <>
                                      <command.icon
                                        className={`h-6 w-6 flex-none ${
                                          active ? 'text-white' : 'text-neutral-400'
                                        }`}
                                        aria-hidden="true"
                                      />
                                      <div className="ml-3 flex-auto">
                                        <p className={`text-sm font-medium ${
                                          active ? 'text-white' : 'text-neutral-900'
                                        }`}>
                                          {command.title}
                                        </p>
                                        <p className={`text-sm ${
                                          active ? 'text-primary-50' : 'text-neutral-500'
                                        }`}>
                                          {command.description}
                                        </p>
                                      </div>
                                      {command.shortcut && (
                                        <div className="ml-3 flex-none flex items-center gap-1">
                                          {command.shortcut.map((key, index) => (
                                            <kbd
                                              key={index}
                                              className={`px-2 py-1 text-xs font-semibold rounded ${
                                                active
                                                  ? 'bg-primary-700 text-white'
                                                  : 'bg-neutral-100 text-neutral-500'
                                              }`}
                                            >
                                              {key}
                                            </kbd>
                                          ))}
                                        </div>
                                      )}
                                    </>
                                  )}
                                </Combobox.Option>
                              ))}
                            </li>
                          )}

                          {getFilteredItems().goals.length > 0 && (
                            <li className="p-2">
                              <h3 className="text-xs font-semibold text-neutral-500 mb-2">目标</h3>
                              {getFilteredItems().goals.map((goal) => (
                                <Combobox.Option
                                  key={goal.id}
                                  value={goal}
                                  className={({ active }) =>
                                    `flex cursor-default select-none items-center rounded-md px-3 py-2 ${
                                      active ? 'bg-primary text-white' : 'text-neutral-900'
                                    }`
                                  }
                                >
                                  {({ active }) => (
                                    <>
                                      <div className="ml-3 flex-auto">
                                        <p className={`text-sm font-medium ${
                                          active ? 'text-white' : 'text-neutral-900'
                                        }`}>
                                          {goal.title}
                                        </p>
                                        <p className={`text-sm ${
                                          active ? 'text-primary-50' : 'text-neutral-500'
                                        }`}>
                                          {goal.domains.join(' · ')}
                                        </p>
                                      </div>
                                    </>
                                  )}
                                </Combobox.Option>
                              ))}
                            </li>
                          )}
                        </Combobox.Options>
                      )}

                      {selectedCommand === 'settings' && (
                        <div className="p-4 space-y-4">
                          <h3 className="text-lg font-medium text-neutral-900">AI 设置</h3>
                          {initialQuery === '设置' && <AISettingsAlert />}
                          <div className="space-y-4">
                            {error && (
                              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-600">{error}</p>
                              </div>
                            )}
                            <div>
                              <label className="block text-sm font-medium text-neutral-700">
                                OpenAI API Key
                              </label>
                              <input
                                type="password"
                                value={aiSettings.openApiKey}
                                onChange={(e) => onUpdateAISettings({
                                  ...aiSettings,
                                  openApiKey: e.target.value
                                })}
                                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-neutral-700">
                                Base URL
                              </label>
                              <input
                                type="text"
                                value={aiSettings.baseUrl}
                                onChange={(e) => onUpdateAISettings({
                                  ...aiSettings,
                                  baseUrl: e.target.value
                                })}
                                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-neutral-700">
                                Model Name
                              </label>
                              <input
                                type="text"
                                value={aiSettings.modelName}
                                onChange={(e) => onUpdateAISettings({
                                  ...aiSettings,
                                  modelName: e.target.value
                                })}
                                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedCommand === 'ai-prompt' && (
                        <div className="p-4 space-y-4">
                          {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                              <p className="text-sm text-red-600">{error}</p>
                            </div>
                          )}
                          <div className="relative">
                            <label className="block text-sm font-medium text-neutral-700">
                              输入你的问题或需求（使用 @ 提及特定目标）
                            </label>
                            <textarea
                              value={aiPrompt}
                              onChange={handleAIPromptChange}
                              rows={4}
                              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                                error 
                                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                  : 'border-neutral-300 focus:border-primary focus:ring-primary'
                              }`}
                              placeholder="例如：分析我的目标完成情况，或者给出改进建议..."
                            />
                            {searchResults.length > 0 && (
                              <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                                {searchResults.map((goal) => (
                                  <button
                                    key={goal.id}
                                    className="w-full text-left px-4 py-2 hover:bg-neutral-100"
                                    onClick={() => handleMentionSelect(goal)}
                                  >
                                    <div className="font-medium">{goal.title}</div>
                                    <div className="text-sm text-neutral-500">
                                      {goal.domains.join(' · ')}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={handleAIPrompt}
                              disabled={isLoading || !aiPrompt.trim()}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                            >
                              {isLoading ? '处理中...' : '获取 AI 建议'}
                            </button>
                          </div>
                          {aiResponse && (
                            <div className="mt-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-neutral-700">AI 响应</h3>
                                <button
                                  onClick={handleCopyResponse}
                                  className="flex items-center gap-1 px-2 py-1 text-sm text-neutral-600 hover:text-primary transition-colors"
                                >
                                  {isCopied ? (
                                    <ClipboardDocumentCheckIcon className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <ClipboardIcon className="w-4 h-4" />
                                  )}
                                  {isCopied ? '已复制' : '复制'}
                                </button>
                              </div>
                              <div className="p-4 bg-neutral-50 rounded-md overflow-auto max-h-96">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={MarkdownComponents}
                                  className="prose prose-neutral max-w-none"
                                >
                                  {aiResponse}
                                </ReactMarkdown>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </Combobox>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmImport}
        title="确认覆盖"
        message={`导入的数据中包含 ${importData?.filter(importGoal => 
          goals.some(existingGoal => existingGoal.id === importGoal.id)
        ).length} 个已存在的目标，是否确认覆盖？`}
      />

      <input
        type="file"
        id="file-input"
        className="hidden"
        accept=".json"
        onChange={handleFileImport}
      />
    </>
  );
}; 