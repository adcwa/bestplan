import { useState, FormEvent } from 'react';
import { Goal } from '@/types/goals';
import { ConfirmDialog } from './ConfirmDialog';

interface Props {
  goal: Goal;
  onSave: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onClose: () => void;
}

export const GoalEditor: React.FC<Props> = ({
  goal,
  onSave,
  onDelete,
  onClose
}) => {
  const [formData, setFormData] = useState(goal);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(goal.id);
    onClose();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* 标题部分 - 添加删除按钮 */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <label htmlFor="title" className="block text-sm font-medium text-neutral-700">
                目标标题上
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                required
              />
            </div>
            <button
              type="button"
              onClick={handleDelete}
              className="ml-4 mt-7 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-600 hover:text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              删除目标
            </button>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-neutral-700">
              目标描述
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              相关领域
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {['精神', '智力', '情感', '职业', '婚姻', '亲子', '社交', '娱乐', '财务', '健康'].map((domain) => (
                <button
                  key={domain}
                  type="button"
                  onClick={() => {
                    const domains = formData.domains.includes(domain)
                      ? formData.domains.filter(d => d !== domain)
                      : [...formData.domains, domain];
                    setFormData({ ...formData, domains });
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    formData.domains.includes(domain)
                      ? 'bg-primary text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>
          </div>

          {/* 进度部分 */}
          <div>
            <label htmlFor="progress" className="block text-sm font-medium text-neutral-700">
              完成进度
            </label>
            <input
              type="range"
              id="progress"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
              className="mt-1 block w-full"
            />
            <div className="mt-1 text-sm text-neutral-500 text-right">
              {formData.progress}%
            </div>
          </div>

          {/* 底部按钮组 - 移除删除按钮 */}
          <div className="flex justify-end pt-4 border-t border-neutral-200 mt-6">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                取消
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      </form>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="删除目标"
        message="确定要删除这个目标吗？此操作无法撤销。"
        goal={goal}
        type="danger"
      />
    </>
  );
}; 