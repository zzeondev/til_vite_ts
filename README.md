# useState

## 기본 폴더 구조 생성

- /src/components 폴더 생성
- /src/components/Counter.jsx 파일 생성
- 참고로 실제 프로젝트에서 tsx 가 어렵다면, jsx 로 작업 후 ai 에게 tsx 로 만들어줘. 해도 됨

### ts 프로젝트에서 jsx 를 사용하도록 설정하기

- `tsconfig.app.json` 수정

```json
{
  "compilerOptions": {
    "composite": true, // ← 프로젝트 참조 사용 시 필요
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    "allowJs": true,
    "checkJs": false,

    /* Linting */
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

- `./vscode/settings.json` 수정

```json
{
  "files.autoSave": "off",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": "explicit"
  },
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"],
  "typescript.suggest.autoImports": true,
  "typescript.suggest.paths": true,
  "javascript.suggest.autoImports": true,
  "javascript.suggest.paths": true,

  // 워크스페이스 TS 사용(강력 권장)
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## useState 활용해 보기

```jsx
import { useState } from 'react';

const Counter = () => {
  //js
  const [count, setCount] = useState(0);
  const add = () => {
    setCount(count + 1);
  };
  const minus = () => {
    setCount(count - 1);
  };
  const reset = () => {
    setCount(0);
  };

  // jsx
  return (
    <div>
      <h1>Counter : {count} </h1>
      <button onClick={add}>증가</button>
      <button onClick={minus}>감소</button>
      <button onClick={reset}>리셋</button>
    </div>
  );
};

export default Counter;
```

- 위의 코드를 tsx 로 마이그레이션 진행
- 확장자를 `tsx` 로 변경

```tsx
import { useState } from 'react';

type CounterProps = {};
type VoidFun = () => void;

const Counter = ({}: CounterProps): JSX.Element => {
  // js
  const [count, setCount] = useState<number>(0);
  const add: VoidFun = () => {
    setCount(count + 1);
  };
  const minus: VoidFun = () => {
    setCount(count - 1);
  };
  const reset: VoidFun = () => {
    setCount(0);
  };

  // jsx
  return (
    <div>
      <h1>Counter : {count} </h1>
      <button onClick={add}>증가</button>
      <button onClick={minus}>감소</button>
      <button onClick={reset}>리셋</button>
    </div>
  );
};

export default Counter;
```

- 사용자 이름 편집 기능 예제
- /src/components/NameEditor.jsx

```jsx
import { useState } from 'react';

const NameEditor = () => {
  const [name, setName] = useState('');
  const handleChange = e => {
    setName(e.target.value);
  };
  const handleClick = () => {
    console.log('확인');
    setName('');
  };

  return (
    <div>
      <h2> NameEditor : {name}</h2>
      <div>
        <input type="text" value={name} onChange={e => handleChange(e)} />
        <button onClick={handleClick}>확인</button>
      </div>
    </div>
  );
};

export default NameEditor;
```

- tsx 로 마이그레이션 : 확장자를 수정

```tsx
import { useState } from 'react';

type NameEditroProps = {
  children?: React.ReactNode;
};

const NameEditor = ({}: NameEditroProps): JSX.Element => {
  const [name, setName] = useState<string>('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };
  const handerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('Enter 입력함');
      setName('');
    }
  };
  const handleClick = (): void => {
    console.log('확인');
    setName('');
  };

  return (
    <div>
      <h2> NameEditor : {name}</h2>
      <div>
        <input
          type="text"
          value={name}
          onChange={e => handleChange(e)}
          onKeyDown={e => handerKeyDown(e)}
        />
        <button onClick={handleClick}>확인</button>
      </div>
    </div>
  );
};

export default NameEditor;
```

- /src/components/User.jsx 파일 생성

```jsx
import { useState } from 'react';

const User = () => {
  const [user, setUser] = useState({ name: '홍길동', age: 10 });
  const handleClikc = () => {
    setUser({ ...user, age: user.age + 1 });
  };
  return (
    <div>
      <h2>
        User : {user.name}님의 나이는 {user.age}살 입니다.
      </h2>
      <div>
        <button onClick={handleClikc}>나이 증가</button>
      </div>
    </div>
  );
};

export default User;
```

- tsx 로 마이그레이션

```tsx
import { useEffect, useState } from 'react';

type UserProps = {
  children?: React.ReactNode;
  name: string;
  age: number;
};
export type UserType = {
  name: string;
  age: number;
};

const User = ({ name, age }: UserProps): JSX.Element => {
  const [user, setUser] = useState<UserType | null>(null);
  const handleClick = (): void => {
    if (user) {
      setUser({ ...user, age: user.age + 1 });
    }
  };
  useEffect(() => {
    setUser({ name, age });
  }, []);
  return (
    <div>
      <h2>
        User :{' '}
        {user ? (
          <span>
            {user.name}님의 나이는 {user.age}살 입니다.
          </span>
        ) : (
          '사용자 정보가 없습니다.'
        )}
      </h2>
      <div>
        <button onClick={handleClick}>나이 증가</button>
      </div>
    </div>
  );
};

export default User;
```

- 최종 App.tsx

```tsx
import Counter from './components/Counter';
import NameEditor from './components/NameEditor';
import User from './components/User';

function App() {
  return (
    <div>
      <h1>App</h1>
      <Counter />
      <NameEditor />
      <User name="홍길동" age={10} />
    </div>
  );
}

export default App;
```

## todos 만들기

### 1. 파일 구조

- /src/components/todos 폴더 생성
- /src/components/todos/TodoList.jsx 파일 생성

```jsx
import TodoItem from './TodoItem';

const TodoList = ({ todos, toggleTodo, editTodo, deleteTodo }) => {
  return (
    <div>
      <h2>TodoList</h2>
      <ul>
        {todos.map(item => (
          <TodoItem
            key={item.id}
            todo={item}
            toggleTodo={toggleTodo}
            editTodo={editTodo}
            deleteTodo={deleteTodo}
          />
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
```

- /src/components/todos/TodoWrite.jsx 파일 생성

```jsx
import { useState } from 'react';

const TodoWrite = ({ addTodo }) => {
  const [title, setTitle] = useState('');
  const handleChange = e => {
    setTitle(e.target.value);
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      // 저장하기
      handleSave();
    }
  };
  const handleSave = () => {
    if (title.trim()) {
      // 업데이트 시키기
      const newTodo = { id: Date.now().toString(), title: title, completed: false };
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

- /src/components/todos/TodoItem.jsx 파일 생성

```jsx
import { useState } from 'react';

const TodoItem = ({ todo, toggleTodo, editTodo, deleteTodo }) => {
  // 수정중인지
  const [isEdit, setIsEdit] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const handleChangeTitle = e => {
    setEditTitle(e.target.value);
  };
  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      // 타이틀 수정
      handleEditSave();
    }
  };
  const handleEditSave = () => {
    if (editTitle.trim()) {
      editTodo(todo.id, editTitle);
      //   setEditTitle('');
      setIsEdit(false);
    }
  };
  const handleEditCancle = () => {
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
          <button onClick={handleEditCancle}>취소</button>
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

- App.jsx

```jsx
import { useState } from 'react';
import TodoList from './components/todos/TodoList';
import TodoWrite from './components/todos/TodoWrite';

// 초기 값
const initialTodos = [
  { id: '1', title: '할일 1', completed: false },
  { id: '2', title: '할일 2', completed: true },
  { id: '3', title: '할일 3', completed: false },
];

function App() {
  const [todos, setTodos] = useState(initialTodos);

  // todo 업데이트 하기
  const addTodo = newTodo => {
    setTodos([newTodo, ...todos]);
  };

  // todo completed 토글하기
  const toggleTodo = id => {
    const arr = todos.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item,
    );
    setTodos(arr);
  };

  // todo 삭제하기
  const deleteTodo = id => {
    const arr = todos.filter(item => item.id !== id);
    setTodos(arr);
  };

  // todo 수정하기
  const editTodo = (id, editTitle) => {
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
```

### 2. ts 마이그레이션

- src/types 폴더 생성
- src/types/TodoType.ts 파일 생성

```ts
export type TodoType = { id: string; title: string; completed: boolean };
```

- App.tsx 로 변경 (main.tsx 에서 다시 import 하고 새로고침)

```tsx
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
```

- TodoWrite.tsx 로 변경 (App.tsx 에서 다시 import 하고 새로고침)

```tsx
import { useState } from 'react';
import type { TodoType } from '../../types/TodoType';

type TodoWriteProps = {
  children?: React.ReactNode;
  addTodo: (newTodo: TodoType) => void;
};

const TodoWrite = ({ addTodo }: TodoWriteProps): JSX.Element => {
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

- TodoList.tsx 로 변경 (App.tsx 에서 다시 import 하고 새로고침)

```tsx
import type { TodoType } from '../../types/TodoType';
import TodoItem from './TodoItem';

type TodoListProps = {
  todos: TodoType[];
  toggleTodo: (id: string) => void;
  editTodo: (id: string, editTitle: string) => void;
  deleteTodo: (id: string) => void;
};

const TodoList = ({ todos, toggleTodo, editTodo, deleteTodo }: TodoListProps): JSX.Element => {
  return (
    <div>
      <h2>TodoList</h2>
      <ul>
        {todos.map((item: any) => (
          <TodoItem
            key={item.id}
            todo={item}
            toggleTodo={toggleTodo}
            editTodo={editTodo}
            deleteTodo={deleteTodo}
          />
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
```

- TodoItem.tsx 로 변경 (TodoList.tsx 에서 다시 import 하고 새로고침)

```tsx
import { useState } from 'react';
import type { TodoType } from '../../types/TodoType';

type TodoItemProps = {
  todo: TodoType;
  toggleTodo: (id: string) => void;
  editTodo: (id: string, editTitle: string) => void;
  deleteTodo: (id: string) => void;
};

const TodoItem = ({ todo, toggleTodo, editTodo, deleteTodo }: TodoItemProps): JSX.Element => {
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
      //   setEditTitle('');
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
