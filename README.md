# Context API 와 useReducer

- useState 를 대체하고, props 를 줄여보자

## 1. 기본폴더 구성 및 파일구조

- `/src/contexts` 폴더 생성
- `/src/contexts/TodoContext.jsx` 파일 생성

```jsx
import { createContext, useContext, useReducer } from 'react';

// 1. 초기값
const initialState = {
  todos: [],
};

// 2. 리듀서
// action 은 {type : "문자열", payload : 재료} 형태
function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { todo } = action.payload;

      // 초기값이 객제냐 배열이냐에 따라서 리턴값도 객체인지 배열인지 달라짐 - 현재는 객체라 객체로 리턴
      return { ...state, todos: [todo, ...state.todos] };
    }
    case 'TOGGLE': {
      const { id } = action.payload;
      const arr = state.todos.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      );
      return { ...state, todos: arr };
    }
    case 'DELETE': {
      const { id } = action.payload;
      const arr = state.todos.filter(item => item.id !== id);
      return { ...state, todos: arr };
    }
    case 'EDIT': {
      const { id, title } = action.payload;
      const arr = state.todos.map(item => (item.id === id ? { ...item, title } : item));
      return { ...state, todos: arr };
    }
    default:
      return state;
  }
}
// 3. context 생성
const TodoContext = createContext();

// 4. provider 생성
export const TodoProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  // dispatch 를 위한 함수 표현식 모음
  const addTodo = newTodo => {
    dispatch({ type: 'ADD', payload: { todo: newTodo } });
  };
  const toggleTodo = id => {
    // 이름이 같으면 줄이기 가능 ex.id:id 형태를 id 로 줄이기 가능
    dispatch({ type: 'TOGGLE', payload: { id } });
  };
  const deleteTodo = id => {
    dispatch({ type: 'DELETE', payload: { id } });
  };
  const editTodo = (id, editTitle) => {
    dispatch({ type: 'EDIT', payload: { id, title: editTitle } });
  };
  // value 전달할 값
  const value = {
    todos: state.todos,
    // 이름이 같으면 줄이기 가능 ex.addTodo: addTodo, 이 형태를 addTodo, 이렇게 줄이기 가능
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
  };
  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};

// 5. custom hook 생성
export function useTodos() {
  const ctx = useContext(TodoContext);
  if (!ctx) {
    throw new Error('컨텍스트가 없어요.');
  }
  return ctx;
}
```

- App.tsx

```tsx
import TodoList from './components/todos/TodoList';
import TodoWrite from './components/todos/TodoWrite';
import { TodoProvider } from './contexts/TodoContext';

function App() {
  return (
    <div>
      <h1>할 일 웹 서비스</h1>
      <TodoProvider>
        <div>
          <TodoWrite />
          <TodoList />
        </div>
      </TodoProvider>
    </div>
  );
}

export default App;
```

- TodoWrite.tsx

```tsx
import { useState } from 'react';
import type { TodoType } from '../../types/TodoType';
import { useTodos } from '../../contexts/TodoContext';

type TodoWriteProps = {
  children?: React.ReactNode;
};

const TodoWrite = ({}: TodoWriteProps): JSX.Element => {
  // Context 를 사용함
  const { addTodo } = useTodos();

  const [title, setTitle] = useState<string>('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setTitle(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      // 저장하기
      handleSave();
    }
  };
  const handleSave = (): void => {
    if (title.trim()) {
      // 업데이트 시키기
      const newTodo: TodoType = { id: Date.now().toString(), title: title, completed: false };
      addTodo(newTodo);
      setTitle('');
    }
  };

  return (
    <div>
      <h2>할 일 작성</h2>
      <div>
        <input
          type="text"
          value={title}
          onChange={e => handleChange(e)}
          onKeyDown={e => handleKeyDown(e)}
        />
        <button onClick={handleSave}>등록</button>
      </div>
    </div>
  );
};

export default TodoWrite;
```

- TodoList.tsx

```tsx
import { useTodos } from '../../contexts/TodoContext';
import type { TodoType } from '../../types/TodoType';
import TodoItem from './TodoItem';

type TodoListProps = {};

const TodoList = ({}: TodoListProps): JSX.Element => {
  const { todos } = useTodos();
  return (
    <div>
      <h2>TodoList</h2>
      <ul>
        {todos.map((item: any) => (
          <TodoItem key={item.id} todo={item} />
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
```

- TodoItem.tsx

```tsx
import { useState } from 'react';
import type { TodoType } from '../../types/TodoType';
import { useTodos } from '../../contexts/TodoContext';

type TodoItemProps = {
  todo: TodoType;
};

const TodoItem = ({ todo }: TodoItemProps): JSX.Element => {
  const { toggleTodo, editTodo, deleteTodo } = useTodos();
  // 수정중인지
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>(todo.title);
  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEditTitle(e.target.value);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      // 타이틀 수정
      handleEditSave();
    }
  };
  const handleEditSave = (): void => {
    if (editTitle.trim()) {
      editTodo(todo.id, editTitle);
      //   setEditTitle(''); 수정시 기존 내용 사라짐
      setIsEdit(false);
    }
  };
  const handleEditCancel = (): void => {
    setEditTitle(todo.title);
    setIsEdit(false);
  };

  return (
    <li>
      {isEdit ? (
        <>
          <input
            type="text"
            value={editTitle}
            onChange={e => handleChangeTitle(e)}
            onKeyDown={e => handleKeyDown(e)}
          />
          <button onClick={handleEditSave}>저장</button>
          <button onClick={handleEditCancel}>취소</button>
        </>
      ) : (
        <>
          <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} />
          <span>{todo.title}</span>
          <button onClick={() => setIsEdit(true)}>수정</button>
          <button onClick={() => deleteTodo(todo.id)}>삭제</button>
        </>
      )}
    </li>
  );
};

export default TodoItem;
```

## 2. TodoContext.jsx 마이그레이션

- 확장자 `tsx` 로 변경
- import 를 다시 실행
- TodoContext.tsx

```tsx
import React, { createContext, useContext, useReducer, type PropsWithChildren } from 'react';
import type { TodoType } from '../types/TodoType';

// 1. 초기값
type TodosState = { todos: TodoType[] };
const initialState: TodosState = {
  todos: [],
};

// 2. 리듀서
// action 은 {type : "문자열", payload : 재료} 형태
enum TodoActionType {
  ADD = 'ADD',
  DELETE = 'DELETE',
  TOGGLE = 'TOGGLE',
  EDIT = 'EDIT',
}

type AddAction = { type: TodoActionType.ADD; payload: { todo: TodoType } };
type DeleteAction = { type: TodoActionType.DELETE; payload: { id: string } };
type ToggleAction = { type: TodoActionType.TOGGLE; payload: { id: string } };
type EditAction = { type: TodoActionType.EDIT; payload: { id: string; title: string } };

function reducer(state: TodosState, action: AddAction | DeleteAction | ToggleAction | EditAction) {
  switch (action.type) {
    case TodoActionType.ADD: {
      const { todo } = action.payload;

      // 초기값이 객제냐 배열이냐에 따라서 리턴값도 객체인지 배열인지 달라짐 - 현재는 객체라 객체로 리턴
      return { ...state, todos: [todo, ...state.todos] };
    }
    case TodoActionType.TOGGLE: {
      const { id } = action.payload;
      const arr = state.todos.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      );
      return { ...state, todos: arr };
    }
    case TodoActionType.DELETE: {
      const { id } = action.payload;
      const arr = state.todos.filter(item => item.id !== id);
      return { ...state, todos: arr };
    }
    case TodoActionType.EDIT: {
      const { id, title } = action.payload;
      const arr = state.todos.map(item => (item.id === id ? { ...item, title } : item));
      return { ...state, todos: arr };
    }
    default:
      return state;
  }
}
// 3. context 생성
// 만들어진 Context 가 관리하는 Value 의 모양
type TodoContextValue = {
  todos: TodoType[];
  addTodo: (todo: TodoType) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  editTodo: (id: string, editTitle: string) => void;
};
const TodoContext = createContext<TodoContextValue | null>(null);

// 4. provider 생성
export const TodoProvider: React.FC<PropsWithChildren> = ({ children }): JSX.Element => {
  const [state, dispatch] = useReducer(reducer, initialState);
  // dispatch 를 위한 함수 표현식 모음
  const addTodo = (newTodo: TodoType) => {
    dispatch({ type: TodoActionType.ADD, payload: { todo: newTodo } });
  };
  const toggleTodo = (id: string) => {
    // 이름이 같으면 줄이기 가능 ex.id:id 형태를 id 로 줄이기 가능
    dispatch({ type: TodoActionType.TOGGLE, payload: { id } });
  };
  const deleteTodo = (id: string) => {
    dispatch({ type: TodoActionType.DELETE, payload: { id } });
  };
  const editTodo = (id: string, editTitle: string) => {
    dispatch({ type: TodoActionType.EDIT, payload: { id, title: editTitle } });
  };
  // value 전달할 값
  const value: TodoContextValue = {
    todos: state.todos,
    // 이름이 같으면 줄이기 가능 ex.addTodo: addTodo, 이 형태를 addTodo, 이렇게 줄이기 가능
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
  };
  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};

// 5. custom hook 생성
export function useTodos(): TodoContextValue {
  const ctx = useContext(TodoContext);
  if (!ctx) {
    throw new Error('컨텍스트가 없어요.');
  }
  return ctx;
}
```
