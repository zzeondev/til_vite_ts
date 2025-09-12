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
  hasMore: true,
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
        todos: [...state.todos, ...action.payload.todos],
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
        totalCount: Math.max(0, state.totalCount - 1),
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
    // 이미 로딩 중이거나 더 이상 불러올 데이터가 없으면 중단
    if (state.loadingMore || !state.hasMore) {
      return;
    }

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

      // 데이터가 실제로 로드되었을 때만 상태 업데이트
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
