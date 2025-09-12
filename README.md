d# Infinity Scroll Loop 리스트

- 스크롤시 추가 목록 구현 (UI가 SNS 서비스에 좋다.)

## 1. /src/services/todoService.ts

- 무한 스크롤 todos 목록 조회기능 추가

```ts
// 무한 스크롤 todo 목록 조회
export const getTodosInfinite = async (
  offset: number = 0,
  limit: number = 5,
): Promise<{ todos: Todo[]; hasMore: boolean; totalCount: number }> => {
  try {
    // 전체 todos 의 Row 개수
    const { count, error: countError } = await supabase
      .from('todos')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw new Error(`getTodosInfinite count 오류 : ${countError.message}`);
    }

    // 무한 스크롤 데이터 조회
    const { data, error: limitError } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (limitError) {
      throw new Error(`getTodosInfinite limit 오류 : ${limitError.message}`);
    }

    // 전체 개수
    const totalCount = count || 0;

    // 앞으로 더 가져올 것이 있는가?
    const hasMore = offset + limit < totalCount;

    // 최종 값을 리턴함.
    return {
      todos: data || [],
      hasMore,
      totalCount,
    };
  } catch (error) {
    console.log(`getTodosInfinite 오류 : ${error}`);
    throw new Error(`getTodosInfinite 오류 : ${error}`);
  }
};
```

## 2. 상태관리(Context State)

- 별도로 구성해서 진행해봄.
- /src/contexts/InfiniteScrollContext.tsx
- 1 번 초기값

```tsx
import type { Todo } from '../types/TodoType';

// 1. 초기값
type InfiniteScrollState = {
  todos: Todo[];
  hasMore: boolean;
  totalCount: number;
  loading: boolean;
  loadingMore: boolean;
};
const initialState: InfiniteScrollState = {
  todos: [],
  hasMore: false,
  totalCount: 0,
  loading: false,
  loadingMore: false,
};
```

- 2 번 액션타입

```tsx
// 2. Action 타입 정의
enum InfiniteScrollActionType {
  SET_LOADING = 'SET_LOADING',
  SET_LOADING_MORE = 'SET_LOADING_MORE',
  SET_TODOS = 'SET_TODOS',
  APPEND_TODOS = 'APPEND_TODOS',
  ADD_TODO = 'ADD_TODO',
  TOGGLE_TODO = 'TOGGLE_TODO',
  DELETE_TODO = 'DELETE_TODO',
  EDIT_TODO = 'EDIT_TODO',
  RESET = 'RESET',
}

type SetLoadingAction = { type: InfiniteScrollActionType.SET_LOADING; payload: boolean };
type SetLoadingMoreAction = { type: InfiniteScrollActionType.SET_LOADING_MORE; payload: boolean };
type SetTodosAction = {
  type: InfiniteScrollActionType.SET_TODOS;
  payload: { todos: Todo[]; hasMore: boolean; totalCount: number };
};
type AppendTodosAction = {
  type: InfiniteScrollActionType.APPEND_TODOS;
  payload: { todos: Todo[]; hasMore: boolean };
};
type AddAction = {
  type: InfiniteScrollActionType.ADD_TODO;
  payload: { todo: Todo };
};
type ToggleAction = {
  type: InfiniteScrollActionType.TOGGLE_TODO;
  payload: { id: number };
};
type DeleteAction = {
  type: InfiniteScrollActionType.DELETE_TODO;
  payload: { id: number };
};
type EditAction = {
  type: InfiniteScrollActionType.EDIT_TODO;
  payload: { id: number; title: string };
};
type ResetAction = {
  type: InfiniteScrollActionType.RESET;
};

type InfiniteScrollAction =
  | SetLoadingAction
  | SetLoadingMoreAction
  | SetTodosAction
  | AppendTodosAction
  | AddAction
  | ToggleAction
  | EditAction
  | DeleteAction
  | ResetAction;
```

## 3. 리듀서 함수

```tsx
// 3. 리듀서 함수
function reducer(state: InfiniteScrollState, action: InfiniteScrollAction): InfiniteScrollState {
  switch (action.type) {
    case InfiniteScrollActionType.SET_LOADING:
      return { ...state, loading: action.payload };
    case InfiniteScrollActionType.SET_LOADING_MORE:
      return { ...state, loadingMore: action.payload };
    case InfiniteScrollActionType.SET_TODOS:
      return {
        ...state,
        todos: action.payload.todos,
        hasMore: action.payload.hasMore,
        totalCount: action.payload.totalCount,
        loading: false,
        loadingMore: false,
      };
    case InfiniteScrollActionType.APPEND_TODOS:
      // 추가
      return {
        ...state,
        todos: [...action.payload.todos, ...state.todos],
        hasMore: action.payload.hasMore,
        loadingMore: false,
      };
    case InfiniteScrollActionType.ADD_TODO:
      return {
        ...state,
        todos: [action.payload.todo, ...state.todos],
        totalCount: state.totalCount + 1,
      };
    case InfiniteScrollActionType.TOGGLE_TODO:
      return {
        ...state,
        todos: state.todos.map(item =>
          item.id === action.payload.id ? { ...item, completed: !item.completed } : item,
        ),
      };
    case InfiniteScrollActionType.DELETE_TODO:
      return {
        ...state,
        todos: state.todos.filter(item => item.id !== action.payload.id),
      };

    case InfiniteScrollActionType.EDIT_TODO:
      return {
        ...state,
        todos: state.todos.map(item =>
          item.id === action.payload.id ? { ...item, title: action.payload.title } : item,
        ),
      };

    case InfiniteScrollActionType.RESET:
      return initialState;

    default:
      return state;
  }
}
```

## 4. Context 생성

```ts
type InfiniteScrollContextValue = {
  todos: Todo[];
  hasMore: boolean;
  totalCount: number;
  loading: boolean;
  loadingMore: boolean;
  loadingIntialTodos: () => Promise<void>;
  loadMoreTodos: () => Promise<void>;
  addTodo: (todo: Todo) => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  editTodo: (id: number, title: string) => void;
  reset: () => void;
};
const InfiniteScrollContext = createContext<InfiniteScrollContextValue | null>(null);
```

## 5. Provider 생성

```tsx
// 5. Provider 생성
// interface InfiniteScrollProviderProps {
//   children?: React.ReactNode;
//   itemsPerPage: number;
// }
interface InfiniteScrollProviderProps extends PropsWithChildren {
  itemsPerPage?: number;
}

export const InfiniteScrollProvider: React.FC<InfiniteScrollProviderProps> = ({
  children,
  itemsPerPage = 5,
}) => {
  // ts 자리
  // useReducer 를 활용
  const [state, dispatch] = useReducer(reducer, initialState);

  // 초기 데이터 로드
  const loadingIntialTodos = async (): Promise<void> => {
    try {
      // 초기로딩 활성화
      dispatch({ type: InfiniteScrollActionType.SET_LOADING, payload: true });
      const result = await getTodosInfinite(0, itemsPerPage);

      console.log(
        '초기로드 된 데이터 ',
        result.todos.map(item => ({
          id: item.id,
          title: item.title,
          create_at: item.created_at,
          user_id: item.user_id,
        })),
      );

      dispatch({
        type: InfiniteScrollActionType.SET_TODOS,
        payload: { todos: result.todos, hasMore: result.hasMore, totalCount: result.totalCount },
      });
    } catch (error) {
      console.log(`초기 데이터 로드 실패 : ${error}`);
      dispatch({ type: InfiniteScrollActionType.SET_LOADING, payload: false });
    }
  };

  // 데이터 더 보기 기능
  const loadMoreTodos = async (): Promise<void> => {
    try {
      dispatch({ type: InfiniteScrollActionType.SET_LOADING_MORE, payload: true });
      const result = await getTodosInfinite(state.todos.length, itemsPerPage);
      console.log(
        '추가로 로드된 데이터 ',
        result.todos.map(item => ({
          id: item.id,
          title: item.title,
          create_at: item.created_at,
          user_id: item.user_id,
        })),
      );

      dispatch({
        type: InfiniteScrollActionType.APPEND_TODOS,
        payload: { todos: result.todos, hasMore: result.hasMore },
      });
    } catch (error) {
      console.log(`추가 데이터 로드 실패 : ${error}`);
      dispatch({ type: InfiniteScrollActionType.SET_LOADING_MORE, payload: false });
    }
  };

  // Todo 추가
  const addTodo = (todo: Todo): void => {
    dispatch({ type: InfiniteScrollActionType.ADD_TODO, payload: { todo } });
  };

  // Todo 토글
  const toggleTodo = (id: number): void => {
    dispatch({ type: InfiniteScrollActionType.TOGGLE_TODO, payload: { id } });
  };

  // Todo 삭제
  const deleteTodo = (id: number): void => {
    dispatch({ type: InfiniteScrollActionType.DELETE_TODO, payload: { id } });
  };

  // Todo 수정
  const editTodo = (id: number, title: string): void => {
    dispatch({ type: InfiniteScrollActionType.EDIT_TODO, payload: { id, title } });
  };

  // Context 상태 초기화
  const reset = (): void => {
    dispatch({ type: InfiniteScrollActionType.RESET });
  };

  // 최초 실행시 데이터 로드
  useEffect(() => {
    loadingIntialTodos();
  }, []);

  const value: InfiniteScrollContextValue = {
    todos: state.todos,
    hasMore: state.hasMore,
    totalCount: state.totalCount,
    loading: state.loading,
    loadingMore: state.loadingMore,
    loadingIntialTodos,
    loadMoreTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    reset,
  };

  // tsx 자리
  return <InfiniteScrollContext.Provider value={value}>{children}</InfiniteScrollContext.Provider>;
};
```

## 6. 커스텀 훅

```tsx
export function useInfiniteScroll(): InfiniteScrollContextValue {
  const ctx = useContext(InfiniteScrollContext);
  if (!ctx) {
    throw new Error('InfiniteScrollContext 컨텍스트가 없어요.');
  }
  return ctx;
}
```

## 7. 전체 Context 코드

```tsx
import {
  act,
  createContext,
  useContext,
  useEffect,
  useReducer,
  type PropsWithChildren,
} from 'react';
import type { Todo } from '../types/TodoType';
import {
  getTodosInfinite,
  updateTodo,
  toggleTodo as updatedServiceToggleTodo,
  deleteTodo as deletedServiceTodo,
  createTodo,
} from '../services/todoService';
import { supabase } from '../lib/supabase';

// 1. 초기값
type InfiniteScrollState = {
  todos: Todo[];
  hasMore: boolean;
  totalCount: number;
  loading: boolean;
  loadingMore: boolean;
};
const initialState: InfiniteScrollState = {
  todos: [],
  hasMore: false,
  totalCount: 0,
  loading: false,
  loadingMore: false,
};

// 2. Action 타입 정의
enum InfiniteScrollActionType {
  SET_LOADING = 'SET_LOADING',
  SET_LOADING_MORE = 'SET_LOADING_MORE',
  SET_TODOS = 'SET_TODOS',
  APPEND_TODOS = 'APPEND_TODOS',
  ADD_TODO = 'ADD_TODO',
  TOGGLE_TODO = 'TOGGLE_TODO',
  DELETE_TODO = 'DELETE_TODO',
  EDIT_TODO = 'EDIT_TODO',
  RESET = 'RESET',
}

type SetLoadingAction = { type: InfiniteScrollActionType.SET_LOADING; payload: boolean };
type SetLoadingMoreAction = { type: InfiniteScrollActionType.SET_LOADING_MORE; payload: boolean };
type SetTodosAction = {
  type: InfiniteScrollActionType.SET_TODOS;
  payload: { todos: Todo[]; hasMore: boolean; totalCount: number };
};
type AppendTodosAction = {
  type: InfiniteScrollActionType.APPEND_TODOS;
  payload: { todos: Todo[]; hasMore: boolean };
};
type AddAction = {
  type: InfiniteScrollActionType.ADD_TODO;
  payload: { todo: Todo };
};
type ToggleAction = {
  type: InfiniteScrollActionType.TOGGLE_TODO;
  payload: { id: number };
};
type DeleteAction = {
  type: InfiniteScrollActionType.DELETE_TODO;
  payload: { id: number };
};
type EditAction = {
  type: InfiniteScrollActionType.EDIT_TODO;
  payload: { id: number; title: string };
};
type ResetAction = {
  type: InfiniteScrollActionType.RESET;
};

type InfiniteScrollAction =
  | SetLoadingAction
  | SetLoadingMoreAction
  | SetTodosAction
  | AppendTodosAction
  | AddAction
  | ToggleAction
  | EditAction
  | DeleteAction
  | ResetAction;

// 3. 리듀서 함수
function reducer(state: InfiniteScrollState, action: InfiniteScrollAction): InfiniteScrollState {
  switch (action.type) {
    case InfiniteScrollActionType.SET_LOADING:
      return { ...state, loading: action.payload };
    case InfiniteScrollActionType.SET_LOADING_MORE:
      return { ...state, loadingMore: action.payload };
    case InfiniteScrollActionType.SET_TODOS:
      return {
        ...state,
        todos: action.payload.todos,
        hasMore: action.payload.hasMore,
        totalCount: action.payload.totalCount,
        loading: false,
        loadingMore: false,
      };
    case InfiniteScrollActionType.APPEND_TODOS:
      // 추가
      return {
        ...state,
        todos: [...action.payload.todos, ...state.todos],
        hasMore: action.payload.hasMore,
        loadingMore: false,
      };
    case InfiniteScrollActionType.ADD_TODO:
      return {
        ...state,
        todos: [action.payload.todo, ...state.todos],
        totalCount: state.totalCount + 1,
      };
    case InfiniteScrollActionType.TOGGLE_TODO:
      return {
        ...state,
        todos: state.todos.map(item =>
          item.id === action.payload.id ? { ...item, completed: !item.completed } : item,
        ),
      };
    case InfiniteScrollActionType.DELETE_TODO:
      return {
        ...state,
        todos: state.todos.filter(item => item.id !== action.payload.id),
      };

    case InfiniteScrollActionType.EDIT_TODO:
      return {
        ...state,
        todos: state.todos.map(item =>
          item.id === action.payload.id ? { ...item, title: action.payload.title } : item,
        ),
      };

    case InfiniteScrollActionType.RESET:
      return initialState;

    default:
      return state;
  }
}
// 4. Context 생성
type InfiniteScrollContextValue = {
  todos: Todo[];
  hasMore: boolean;
  totalCount: number;
  loading: boolean;
  loadingMore: boolean;
  loadingIntialTodos: () => Promise<void>;
  loadMoreTodos: () => Promise<void>;
  addTodo: (title: string) => Promise<void>;
  toggleTodo: (id: number) => Promise<void>;
  deleteTodo: (id: number) => Promise<void>;
  editTodo: (id: number, title: string) => Promise<void>;
  reset: () => void;
};
const InfiniteScrollContext = createContext<InfiniteScrollContextValue | null>(null);

// 5. Provider 생성
// interface InfiniteScrollProviderProps {
//   children?: React.ReactNode;
//   itemsPerPage: number;
// }
interface InfiniteScrollProviderProps extends PropsWithChildren {
  itemsPerPage?: number;
}

export const InfiniteScrollProvider: React.FC<InfiniteScrollProviderProps> = ({
  children,
  itemsPerPage = 5,
}) => {
  // ts 자리
  // useReducer 를 활용
  const [state, dispatch] = useReducer(reducer, initialState);

  // 초기 데이터 로드
  const loadingIntialTodos = async (): Promise<void> => {
    try {
      // 초기로딩 활성화
      dispatch({ type: InfiniteScrollActionType.SET_LOADING, payload: true });
      const result = await getTodosInfinite(0, itemsPerPage);

      console.log(
        '초기로드 된 데이터 ',
        result.todos.map(item => ({
          id: item.id,
          title: item.title,
          create_at: item.created_at,
          user_id: item.user_id,
        })),
      );

      dispatch({
        type: InfiniteScrollActionType.SET_TODOS,
        payload: { todos: result.todos, hasMore: result.hasMore, totalCount: result.totalCount },
      });
    } catch (error) {
      console.log(`초기 데이터 로드 실패 : ${error}`);
      dispatch({ type: InfiniteScrollActionType.SET_LOADING, payload: false });
    }
  };

  // 데이터 더 보기 기능
  const loadMoreTodos = async (): Promise<void> => {
    try {
      dispatch({ type: InfiniteScrollActionType.SET_LOADING_MORE, payload: true });
      const result = await getTodosInfinite(state.todos.length, itemsPerPage);
      console.log(
        '추가로 로드된 데이터 ',
        result.todos.map(item => ({
          id: item.id,
          title: item.title,
          create_at: item.created_at,
          user_id: item.user_id,
        })),
      );

      dispatch({
        type: InfiniteScrollActionType.APPEND_TODOS,
        payload: { todos: result.todos, hasMore: result.hasMore },
      });
    } catch (error) {
      console.log(`추가 데이터 로드 실패 : ${error}`);
      dispatch({ type: InfiniteScrollActionType.SET_LOADING_MORE, payload: false });
    }
  };

  // Todo 추가
  const addTodo = async (title: string): Promise<void> => {
    try {
      const result = await createTodo({ title });
      if (!result) {
        console.log('글 등록에 실패하였습니다.');
        return;
      }
      // DB 업데이트 후 State 업데이트
      dispatch({ type: InfiniteScrollActionType.ADD_TODO, payload: { todo: result } });
    } catch (error) {
      console.log(`새 Todo 등록 오류 : ${error} `);
    }
  };

  // Todo 토글
  const toggleTodo = async (id: number): Promise<void> => {
    try {
      // 현재 전달된 id 에 해당하는 todo 항목의 completed 를 파악한다.
      const currentTodo = state.todos.find(item => item.id === id);
      if (!currentTodo) {
        console.log('Todo 를 찾지 못했습니다 : ', id);
        return;
      }
      const result = await updatedServiceToggleTodo(id, !currentTodo.completed);
      if (result) {
        // DB 업데이트 후 state 업데이트
        dispatch({ type: InfiniteScrollActionType.TOGGLE_TODO, payload: { id } });
      } else {
        console.log('할일 상태 업데이트 실패 ');
      }
    } catch (error) {
      console.log(`상태변경 오류 : ${error} `);
    }
  };

  // Todo 삭제
  const deleteTodo = async (id: number): Promise<void> => {
    try {
      await deletedServiceTodo(id);
      // DB 업데이트 후 state 처리
      dispatch({ type: InfiniteScrollActionType.DELETE_TODO, payload: { id } });
    } catch (error) {
      console.log(`삭제 오류 : ${error} `);
    }
  };

  // Todo 수정
  const editTodo = async (id: number, title: string): Promise<void> => {
    try {
      const updatedTodo = await updateTodo(id, { title });
      if (updatedTodo) {
        // 아래는 그냥 state 만 업데이트 한다. (실제 DB에 업데이트하고 ==> State)
        dispatch({ type: InfiniteScrollActionType.EDIT_TODO, payload: { id, title } });
      } else {
        console.log('업데이트에 실패하였습니다.');
      }
    } catch (error) {
      console.log(`업데이트 오류 : ${error} `);
    }
  };

  // Context 상태 초기화
  const reset = (): void => {
    dispatch({ type: InfiniteScrollActionType.RESET });
  };

  // 최초 실행시 데이터 로드
  useEffect(() => {
    loadingIntialTodos();
  }, []);

  const value: InfiniteScrollContextValue = {
    todos: state.todos,
    hasMore: state.hasMore,
    totalCount: state.totalCount,
    loading: state.loading,
    loadingMore: state.loadingMore,
    loadingIntialTodos,
    loadMoreTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    reset,
  };

  // tsx 자리
  return <InfiniteScrollContext.Provider value={value}>{children}</InfiniteScrollContext.Provider>;
};

// 6. 커스텀 훅
export function useInfiniteScroll(): InfiniteScrollContextValue {
  const ctx = useContext(InfiniteScrollContext);
  if (!ctx) {
    throw new Error('InfiniteScrollContext 컨텍스트가 없어요.');
  }
  return ctx;
}
```

## 8. 활용

- /src/pages/TodosInfinitePage.tsx 생성

```tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { InfiniteScrollProvider, useInfiniteScroll } from '../contexts/InfiniteScrollContext';
import type { Profile, Todo, TodoInsert } from '../types/TodoType';
import { getProfile } from '../lib/profile';
// 용서하세요. 입력창 컴포넌트
const InfiniteTodoWrite = () => {
  const { addTodo, loadingIntialTodos } = useInfiniteScroll();

  const [title, setTitle] = useState('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };
  const handleSave = async (): Promise<void> => {
    if (!title.trim()) {
      alert('제목을 입력하세요');
      return;
    }
    try {
      // 새할일 추가
      await addTodo(title);
      // 다시 데이터를 로딩한다.
      await loadingIntialTodos();
      setTitle('');
    } catch (error) {
      console.log('등록에 오류가 발생 : ', error);
      alert(`등록에 오류가 발생 : ${error}`);
    }
  };
  return (
    <div>
      <h3>할일 작성</h3>
      <div>
        <input
          type="text"
          value={title}
          onChange={e => handleChange(e)}
          onKeyDown={e => handleKeyDown(e)}
          placeholder="할일을 입력하세요."
        />
        <button onClick={handleSave}>등록</button>
      </div>
    </div>
  );
};

// 용서하세요. 목록 컴포넌트
const InfiniteTodoList = () => {
  const { loading, todos, totalCount, editTodo, toggleTodo, deleteTodo, loadingIntialTodos } =
    useInfiniteScroll();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  // 사용자 프로필 가져오기
  useEffect(() => {
    const loadProifle = async () => {
      if (user?.id) {
        const userProfile = await getProfile(user.id);
        setProfile(userProfile);
      }
    };
    loadProifle();
  }, [user?.id]);

  // Intersection Observer 를 이용한 무한 스크롤

  // 번호 계산 함수 (최신글이 높은 번호가지도록 )
  const getGlobalIndex = (index: number) => {
    // 무한스크롤시에 계산 해서 번호 출력
    const globalIndex = totalCount - index;
    console.log(
      `번호 계산 - index : ${index}, totalCount : ${totalCount}, globalIndex: ${globalIndex}`,
    );
    return globalIndex;
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '날짜 없음';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 수정 상태 관리
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  // 수정 시작
  const handleEditStart = (todo: any) => {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const handleEditSave = async (id: number) => {
    if (!editingTitle.trim()) {
      alert('제목을 입력하세요.');
      return;
    }
    try {
      editTodo(id, editingTitle);
      setEditingId(null);
      setEditingTitle('');
    } catch (error) {
      console.log(error);
      alert('수정에 실패했습니다.');
    }
  };

  const handleToggle = async (id: number) => {
    try {
      // Context 의 state 를 업데이트
      await toggleTodo(id);
    } catch (error) {
      console.log('토글 실패 : ', error);
      alert('상태 변경에 실패하였습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        // id 를 삭제
        await deleteTodo(id);
        // 삭제 이후에 번호를 갱신해서 정리해줌
        await loadingIntialTodos();
      } catch (error) {
        console.log('삭제에 실패하였습니다.');
        alert('삭제에 실패하였습니다.');
      }
    }
  };

  if (loading) {
    return <div>데이터 로딩중 ...</div>;
  }
  return (
    <div>
      <h3>TodoList(무한 스크롤) {profile?.nickname && <span>{profile.nickname}님의 할일</span>}</h3>
      {todos.length === 0 ? (
        <p>등록된 할일이 없습니다.</p>
      ) : (
        <div>
          <ul>
            {todos.map((item, index) => (
              <li key={item.id}>
                {/* 번호표시 */}
                <span>{getGlobalIndex(index)}</span>
                {/* 체크박스 */}
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => handleToggle(item.id)}
                />
                {/* 제목과 날짜출력 */}
                <div>
                  {editingId === item.id ? (
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={e => setEditingTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handleEditSave(item.id);
                        } else if (e.key === 'Escape') {
                          handleEditCancel();
                        }
                      }}
                    />
                  ) : (
                    <span>{item.title}</span>
                  )}

                  <span>작성이 : {formatDate(item.created_at)}</span>
                </div>
                {/* 버튼들 */}
                {editingId === item.id ? (
                  <>
                    <button onClick={() => handleEditSave(item.id)}>저장</button>
                    <button onClick={handleEditCancel}>취소</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEditStart(item)}>수정</button>
                    <button onClick={() => handleDelete(item.id)}>삭제</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

function TodosInfinitePage() {
  return (
    <InfiniteScrollProvider itemsPerPage={5}>
      <div>
        <h2>무한 스크롤 Todo 목록</h2>
        <div>
          <InfiniteTodoWrite />
        </div>
        <div>
          <InfiniteTodoList />
        </div>
      </div>
    </InfiniteScrollProvider>
  );
}

export default TodosInfinitePage;
```

## 9. 무한 스크롤 구현

- `IntersectionObjserver` 를 이용함
- `웹브라우저에 내장된 API` 중 하나
- 요소 즉, 대상이 되는 태그(element)가
  - 뷰포트(화면에 보이는 영역)
  - 특정 스크롤 영역과 교차(intersect)하는지 감시하는 도구
  - intersect 는 DOM 요소가 화면에 보이거나, 사라지거나 등을 말함
- `스크롤 이벤트를 사용하지 않고도 자동으로 화면에 보이는 순간을 체크`할 수 있음

### 9.1. 기본 문법

```js
const observer = new IntersectionObserver((entries, observer) => {
  // entries: 관찰 중인 모든 요소의 교차 상태 목록
  // observer: 지금 만든 옵저버 자기 자신
});

// 특정 DOM 요소 관찰 시작
observer.observe(domElement);

// 관찰 해제
observer.unobserve(domElement);

// 모든 관찰 중지
observer.disconnect();
```

### 9.2. 예제

- `<div id="target"></div>`

```js
const target = document.getElementById('target');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('화면에 보임!', entry);
    } else {
      console.log('화면에서 나감!', entry);
    }
  });
});

observer.observe(target);
```

### 9.3. 옵션

```js
const options = {
  root: null, // 관찰 기준 영역 (null이면 브라우저 뷰포트)
  rootMargin: '0px', // root 바깥쪽 여백 (미리 감지하고 싶을 때 '200px' 같은 값)
  threshold: 0.5, // 요소가 50% 보였을 때만 트리거
};

const observer = new IntersectionObserver(callback, options);
```

## 10. 라우터 추가

- App.tsx

```tsx
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import TodosPage from './pages/TodosPage';
import AuthCallback from './pages/AuthCallback';
import Protected from './components/Protected';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import TodosInfinitePage from './pages/TodosInfinitePage';

const TopBar = () => {
  const { signOut, user } = useAuth();
  // 관리자인 경우 메뉴 추가로 출력하기
  // isAdmin 에는 true/false
  const isAdmin = user?.email === 'tarolong@naver.com';

  return (
    <nav style={{ display: 'flex', gap: 20, justifyContent: 'flex-end', padding: 40 }}>
      <Link to="/">홈</Link>
      {user && <Link to="/todos">할일</Link>}
      {user && <Link to="/todos-infinite">무한스크롤 할일</Link>}
      {!user && <Link to="/signup">회원가입</Link>}
      {!user && <Link to="/signin">로그인</Link>}
      {user && <Link to="/profile">프로필</Link>}
      {user && <button onClick={signOut}>로그아웃</button>}

      {isAdmin && <Link to="/admin">관리자</Link>}
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <div>
        <h1>Todo Service</h1>
        <Router>
          <TopBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route
              path="/todos"
              element={
                <Protected>
                  <TodosPage />
                </Protected>
              }
            />
            <Route
              path="/todos-infinite"
              element={
                <Protected>
                  <TodosInfinitePage />
                </Protected>
              }
            />

            <Route
              path="/profile"
              element={
                <Protected>
                  <ProfilePage />
                </Protected>
              }
            />

            <Route
              path="/admin"
              element={
                <Protected>
                  <AdminPage />
                </Protected>
              }
            />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
```
