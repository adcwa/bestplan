export type CommandType = 
  | 'export' 
  | 'import' 
  | 'search' 
  | 'settings'
  | 'ai-prompt';

export interface Command {
  id: CommandType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string[];
}

export interface AISettings {
  openApiKey: string;
  baseUrl: string;
  modelName: string;
} 