export class FileStorage implements StorageService {
  // ... 其他代码保持不变 ...

  async exportData(): Promise<string> {
    try {
      const data = await this.readFile();
      // 导出完整的目标数据，包括所有属性
      const exportData = data.goals.map((goal: Goal) => ({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        domains: goal.domains,
        type: goal.type,
        status: goal.status,
        progress: goal.progress,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
        completedAt: goal.completedAt,
        tasks: goal.tasks,
        notes: goal.notes
      }));
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  async importData(jsonData: string): Promise<void> {
    const data = await this.readFile();
    const importedGoals = JSON.parse(jsonData);
    // 更新或添加导入的目标
    const updatedGoals = data.goals.map(existingGoal => {
      const importedGoal = importedGoals.find((g: Goal) => g.id === existingGoal.id);
      return importedGoal || existingGoal;
    });
    
    // 添加新的目标
    const newGoals = importedGoals.filter((importedGoal: Goal) => 
      !data.goals.some(existingGoal => existingGoal.id === importedGoal.id)
    );
    
    data.goals = [...updatedGoals, ...newGoals];
    await this.writeFile(data);
  }

  async deleteGoal(goalId: string): Promise<void> {
    try {
      const data = await this.readFile();
      // 查找要删除的目标
      const goalToDelete = data.goals.find((g: Goal) => g.id === goalId);
      if (!goalToDelete) {
        throw new Error('Goal not found');
      }

      // 从数组中移除目标
      data.goals = data.goals.filter((g: Goal) => g.id !== goalId);

      // 保存更新后的数据
      await this.writeFile(data);
    } catch (error) {
      console.error('Failed to delete goal:', error);
      throw error;
    }
  }

  // ... 其他代码保持不变 ...
} 