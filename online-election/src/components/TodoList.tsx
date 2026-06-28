import React from 'react';
import { Check, Trash2, Clock, Tag } from 'lucide-react';
import { Todo } from '../types';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      {todos.map((todo) => (
        <div
          key={todo.id}
          className={`bg-white p-4 rounded-lg shadow-md ${
            todo.completed ? 'opacity-75' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onToggle(todo.id)}
                className={`p-2 rounded-full ${
                  todo.completed ? 'bg-green-100' : 'bg-gray-100'
                }`}
              >
                <Check
                  size={20}
                  className={todo.completed ? 'text-green-500' : 'text-gray-400'}
                />
              </button>
              <div>
                <h3 className={`text-lg font-medium ${
                  todo.completed ? 'line-through text-gray-500' : ''
                }`}>
                  {todo.title}
                </h3>
                <p className="text-gray-600">{todo.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className={`flex items-center gap-1 ${getPriorityColor(todo.priority)}`}>
                    <Tag size={16} />
                    {todo.priority}
                  </span>
                  {todo.category && (
                    <span className="flex items-center gap-1">
                      <Tag size={16} />
                      {todo.category}
                    </span>
                  )}
                  {todo.dueDate && (
                    <span className="flex items-center gap-1">
                      <Clock size={16} />
                      {new Date(todo.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => onDelete(todo.id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-full"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}