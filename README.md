# profiles 테이블에 추가 정보시 오류 발생

- RLS 정책으로 회원이 아니면 CRUD 를 하지 못한다.

## 1. 기존 방식

- 회원가입 > profiles 에 insert 진행함 (오류발생)
- 회원가입 > 이메일인증 > 인증 확인 > profiles 에 insert 필요

## 2. 회원가입 진행 과정 개선

- /src/pages/SignUpPage.tsx 수정

```tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { createProfile } from '../lib/profile';
import type { ProfileInsert } from '../types/TodoType';

function SignUpPage() {
  const { signUp } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [pw, setPw] = useState<string>('');

  // 추가 정보 (닉네임)
  const [nickName, setNickName] = useState<string>('');

  const [msg, setMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // 웹브라우저 갱신 막기
    e.preventDefault();

    if (!email.trim()) {
      alert('이메일을 입력하세요.');
      return;
    }

    if (!pw.trim()) {
      alert('비밀번호를 입력하세요.');
      return;
    }
    if (pw.length < 6) {
      alert('비밀번호는 최소 6자입니다.');
      return;
    }

    if (!nickName.trim()) {
      alert('닉네임을 입력하세요.');
      return;
    }

    // 회원가입 및 추가정보 입력하기
    const { error, data } = await supabase.auth.signUp({
      email,
      password: pw,
      options: {
        // 회원 가입 후 이메일로 인증 확인시 리다이렉트 될 URL
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // 잠시 추가정보를 보관합니다.
        // Supabase 에서 auth 에는 추가적인 정보를 저장하는 객체가 존재
        // 공식적인 명칭이 metadata 라고 합니다.
        // 이메일 인증 후에 프로필 생성 시에 사용하려고 보관
        data: { nickName: nickName },
      },
    });

    if (error) {
      setMsg(`회원가입 오류 : ${error}`);
    } else {
      setMsg(
        '회원가입이 성공했습니다. 이메일 인증 링크를 확인해주세요. 인증 완료 후 프로필이 자동으로 생성됩니다.',
      );
    }
  };

  return (
    <div>
      <h2>Todo 서비스 회원가입</h2>
      <div>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="이메일"
          />
          <br />
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="비밀번호"
          />
          <br />
          <input
            type="text"
            value={nickName}
            onChange={e => setNickName(e.target.value)}
            placeholder="닉네임"
          />
          <br />
          <button type="submit">회원가입</button>
        </form>
        <p>{msg}</p>
      </div>
    </div>
  );
}

export default SignUpPage;
```

- /src/pages/AuthCallback.tsx 수정

```tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { ProfileInsert } from '../types/TodoType';
import { createProfile } from '../lib/profile';
/**
 * - 인증 콜백 URL 처리
 * - 사용자에게 인증 진행 상태 안내
 * - 자동 인증 처리 완료 안내
 */

function AuthCallback() {
  const [msg, setMsg] = useState<string>('인증 처리 중 ...');

  // 사용자가 이메일 확인 클릭하면 실행되는 곳
  // 인증 정보에 담겨진 nickname 을 알아내서 여기서 profiles 를 추가
  const handleAuthCallback = async (): Promise<void> => {
    try {
      // URL에서 세션(웹브라우저 정보시 사라지는 데이터)에 담겨진 정보를 가져옴
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setMsg(`인증오류 : ${error.message}`);
      }
      // 인증 데이터가 존재함
      if (data.session?.user) {
        const user = data.session.user;
        // 추가적인 정보 파악 가능 (metadata 라고 함)
        const nickName = user.user_metadata.nickName;
        // 먼저 프로필이 이미 존재하는지 확인이 필요
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
        // 존재하지 않는 id 이고, nickName 내용이 있다면
        // profiles 에 insert 한다.
        if (!existingProfile && nickName) {
          // 프로필이 없고 닉네임이 존재하므로 프로필 생성하자
          const newProfile: ProfileInsert = { id: user.id, nickname: nickName };
          const result = await createProfile(newProfile);
          if (result) {
            setMsg('🎉 이메일 인증 완료. 프로필 생성 성공! 홈으로 이동하세요.');
          } else {
            setMsg('🎉 이메일 인증 완료. 프로필 생성 실패! 관리자에게 문의하세요.');
          }
        } else {
          setMsg('🎉 이메일 인증 완료. 홈으로 이동하세요.');
        }
      } else {
        setMsg('인증 정보 자체가 없습니다. 다시 가입해주세요');
      }
    } catch (err) {
      console.log(`인증 콜백 함수 처리 오류 : ${err}`);
      setMsg('인증 처리 중 오류가 발생했습니다.');
    }
  };
  useEffect(() => {
    // setTimeout 은 1초 뒤에 함수 실행
    const timer = setTimeout(handleAuthCallback, 1000);
    // 클린업 함수
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div>
      <h2>인증 페이지</h2>
      <div>{msg}</div>
    </div>
  );
}

export default AuthCallback;
```

- /src/lib/profile.ts

```ts
// 사용자 프로필 생성
const createProfile = async (newUserProfile: ProfileInsert): Promise<boolean> => {
  try {
    const { error, data } = await supabase.from('profiles').insert([{ ...newUserProfile }]);
    if (error) {
      console.log(`프로필 추가에 실패 : `, {
        message: error.message,
        detail: error.details,
        hint: error.hint,
        code: error.code,
      });
      return false;
    }
    console.log(`프로필 생성 성공 : `, data);
    return true;
  } catch (error) {
    console.log(`프로필 생성 오류 : ${error}`);
    return false;
  }
};
```

# 일반적 네비게이션 진행하기

- npm : https://www.npmjs.com/package/react-paginate
- 우리는 직접 구현 진행함

## 1. 구현 시나리오

- 한 화면에 10개의 목록을 표시함
- 페이지 번호로 네비세이션 함
- 전체 개수 및 현재 페이지 정보 출력함
- supabase 에 todos 를 이용함

## 2. 코드 구현

### 2.1. /src/service/todoService.ts

- 페이지 번호와 제한 개수를 이용해서 추출하기 함수 추가

```ts
// 페이지 단위로 조각내서 목록 출력하기
// getTodosPaginated(1, 10개)
// getTodosPaginated(2, 10개)
// getTodosPaginated(페이지번호, 10개)
export const getTodosPaginated = async (
  page: number = 1,
  limit: number = 10,
): Promise<{ todos: Todo[]; totalCount: number; totalPages: number; currentPages: number }> => {
  // 시작
  // page-2, limit 10
  // (2-1) * 10 => 10
  const from = (page - 1) * limit;

  // 제한
  // 10 + 10 -1 => 19
  const to = from + limit - 1;

  // 전체 데이터 개수 (row 의 개수)
  const { count } = await supabase.from('todos').select('*', { count: 'exact', head: true });

  // from 부터 to 까지의 상세 데이터
  const { data } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to);

  // 편하게 활용
  const totalCount = count || 0;

  // 몇페이지인지 계산 (소수점은 올림)
  const totalPages = Math.ceil(totalCount / limit);
  return {
    todos: data || [],
    totalCount,
    totalPages,
    currentPages: page,
  };
};
```

## 2.2. /src/contexts/TodoContext.tsx

```tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type PropsWithChildren,
} from 'react';

import type { Todo } from '../types/TodoType';
// 전체 DB 가져오기
import { getTodos, getTodosPaginated } from '../services/todoService';

// 1. 초기값 형태가 페이지 객체 형태로 추가
type TodosState = { todos: Todo[]; totalCount: number; totalPages: number; currentPage: number };
const initialState: TodosState = {
  todos: [],
  totalCount: 0,
  totalPages: 0,
  currentPage: 1,
};
// 2. 리듀서
// action 은 {type:"문자열", payload: 재료 } 형태
enum TodoActionType {
  ADD = 'ADD',
  DELETE = 'DELETE',
  TOGGLE = 'TOGGLE',
  EDIT = 'EDIT',
  // Supabase todos 의 목록읽기
  SET_TODOS = 'SET_TODOS',
}

type AddAction = { type: TodoActionType.ADD; payload: { todo: Todo } };
type DeleteAction = { type: TodoActionType.DELETE; payload: { id: number } };
type ToggleAction = { type: TodoActionType.TOGGLE; payload: { id: number } };
type EditAction = { type: TodoActionType.EDIT; payload: { id: number; title: string } };
// Supabase 목록으로 state.todos 배열을 채워라.
type SetTodosAction = {
  type: TodoActionType.SET_TODOS;
  payload: { todos: Todo[]; totalCount: number; totalPages: number; currentPage: number };
};

function reducer(
  state: TodosState,
  action: AddAction | DeleteAction | ToggleAction | EditAction | SetTodosAction,
) {
  switch (action.type) {
    case TodoActionType.ADD: {
      const { todo } = action.payload;
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
    // Supabase 에 목록 읽기
    case TodoActionType.SET_TODOS: {
      const { todos, totalCount, totalPages, currentPage } = action.payload;
      return { ...state, todos, totalCount, totalPages, currentPage };
    }
    default:
      return state;
  }
}
// 3. context 생성
//  만들어진 Context 가 관리하는 Value 의 모양
type TodoContextValue = {
  todos: Todo[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  addTodo: (todo: Todo) => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  editTodo: (id: number, editTitle: string) => void;
  loadTodos: (page: number, limit: number) => Promise<void>;
};

const TodoContext = createContext<TodoContextValue | null>(null);

// 4. provider 생성
// 1. props 정의하기
// interface TodoProviderProps {
//   children?: React.ReactNode;
//   currentPage?: number;
//   limit?: number;
// }
interface TodoProviderProps extends PropsWithChildren {
  currentPage?: number;
  limit?: number;
}

export const TodoProvider: React.FC<TodoProviderProps> = ({
  children,
  currentPage = 1,
  limit = 10,
}): JSX.Element => {
  // useReducer 로 상태관리
  const [state, dispatch] = useReducer(reducer, initialState);

  // dispatch 를 위한 함수 표현식 모음
  const addTodo = (newTodo: Todo) => {
    dispatch({ type: TodoActionType.ADD, payload: { todo: newTodo } });
  };
  const toggleTodo = (id: number) => {
    dispatch({ type: TodoActionType.TOGGLE, payload: { id } });
  };
  const deleteTodo = (id: number) => {
    dispatch({ type: TodoActionType.DELETE, payload: { id } });
  };
  const editTodo = (id: number, editTitle: string) => {
    dispatch({ type: TodoActionType.EDIT, payload: { id, title: editTitle } });
  };
  // 실행시 state { todos } 를 업데이트함.
  // reducer 함수를 실행함.
  const setTodos = (todos: Todo[], totalCount: number, totalPages: number, currentPage: number) => {
    dispatch({
      type: TodoActionType.SET_TODOS,
      payload: { todos, totalCount, totalPages, currentPage },
    });
  };
  // Supabase 의 목록 읽기 함수 표현식
  // 비동기 데이터베이스 접근
  // const loadTodos = async (): Promise<void> => {
  //   try {
  //     const result = await getTodos();
  //     setTodos(result);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  const loadTodos = async (page: number, limit: number): Promise<void> => {
    try {
      const result = await getTodosPaginated(page, limit);
      // 현재 페이지가 비어있고 첫 페이지가 아니라면 이전 페이지를 출력하자.
      if (result.todos.length === 0 && result.totalPages > 0 && page > 1) {
        const prevPageResult = await getTodosPaginated(page - 1, limit);
        setTodos(
          prevPageResult.todos,
          prevPageResult.totalCount,
          prevPageResult.totalPages,
          prevPageResult.currentPage,
        );
      } else {
        setTodos(result.todos, result.totalCount, result.totalPages, result.currentPage);
      }
    } catch (error) {
      console.log(`목록 가져오기 오류 : ${error}`);
    }
  };

  // 페이지가 바뀌면 다시 실행하도록 해야 한다.
  useEffect(() => {
    loadTodos(currentPage, limit);
  }, [currentPage, limit]);

  // value 전달할 값
  const value: TodoContextValue = {
    todos: state.todos,
    totalCount: state.totalCount,
    totalPages: state.totalPages,
    currentPage: state.currentPage,
    itemsPerPage: limit,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    loadTodos,
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

### 2.3. 페이지네이션을 위한 컴포넌트 생성

- src/components/todos/Pageination.tsx 생성 (재활용 할 수 있으므로)

### 2.4. /src/pages/TodosPage.tsx
