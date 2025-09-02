import React from 'react';
import { TodoProvider } from './contexts/TodoContext';
import TodoWrite from './components/todos/TodoWrite';
import TodoList from './components/todos/TodoList';

function App() {
  return (
    <div>
      <h1>Todo Service</h1>
      <TodoProvider>
        <TodoWrite />
        <TodoList />
      </TodoProvider>
    </div>
  );
}

export default App;
