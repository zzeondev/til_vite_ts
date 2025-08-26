import { useState } from 'react';

import TodoWrite from './components/todos/TodoWrite';
import type { TodoType } from './types/TodoType';
import TodoList from './components/todos/TodoList';

// 초기 값
const initialTodos: TodoType[] = [
  { id: '1', title: '할일 1', completed: false },
  { id: '2', title: '할일 2', completed: true },
  { id: '3', title: '할일 3', completed: false },
];

function App() {
  const [todos, setTodos] = useState<TodoType[]>(initialTodos);

  // todo 업데이트 하기
  const addTodo = (newTodo: TodoType): void => {
    setTodos([newTodo, ...todos]);
  };

  // todo completed 토글하기
  const toggleTodo = (id: string): void => {
    const arr = todos.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item,
    );
    setTodos(arr);
  };

  // todo 삭제하기
  const deleteTodo = (id: string): void => {
    const arr = todos.filter(item => item.id !== id);
    setTodos(arr);
  };

  // todo 수정하기
  const editTodo = (id: string, editTitle: string): void => {
    const arr = todos.map(item => (item.id === id ? { ...item, title: editTitle } : item));
    setTodos(arr);
  };

  return (
    <div>
      <h1>할 일 웹 서비스</h1>
      <div>
        <TodoWrite addTodo={addTodo} />
        <TodoList
          todos={todos}
          toggleTodo={toggleTodo}
          editTodo={editTodo}
          deleteTodo={deleteTodo}
        />
      </div>
    </div>
  );
}

export default App;
