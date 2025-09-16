import { supabase } from '../lib/supabase';
import type { Todo, TodoInsert, TodoUpdate } from '../types/TodoType';

// Todo 목록 조회
export const getTodos = async (): Promise<Todo[]> => {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });
  // 실행은 되었지만, 결과가 오류이다.
  if (error) {
    throw new Error(`getTodos 오류 : ${error.message}`);
  }
  return data || [];
};
// Todo 목록 조회 (id) 를 이용함
export const getTodoById = async (id: number): Promise<Todo | null> => {
  try {
    const { data, error } = await supabase.from('todos').select('*').eq('id', id).single();
    if (error) {
      throw new Error(`getTodoById 오류 : ${error.message}`);
    }
    return data;
  } catch (err) {
    console.log('getTodoById 에러 : ', err);
    return null;
  }
};

// Todo 생성
// 로그인을 하고 나면 실제로 user_id 가 이미 파악이 됨
// TodoInsert 에서 user_id : 값 을 생략하는 타입을 생성
// 타입스크립트에서 Omit 을 이용하면, 특정 키를 제거할 수 있음.
export const createTodo = async (newTodo: Omit<TodoInsert, 'user_id'>): Promise<Todo | null> => {
  try {
    // 현재 로그인 한 사용자 정보 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    const { data, error } = await supabase
      .from('todos')
      .insert([{ ...newTodo, completed: false, user_id: user.id }])
      .select()
      .single();
    if (error) {
      throw new Error(`createTodo 오류 : ${error.message}`);
    }
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Todo 수정
// 로그인을 하고 나면 실제로 user_id 가 이미 파악이 됨
// TodoUpdate 에서 user_id : 값 을 생략하는 타입을 생성
// 타입스크립트에서 Omit 을 이용하면, 특정 키를 제거할 수 있음.
export const updateTodo = async (
  id: number,
  editTitle: Omit<TodoUpdate, 'user_id'>,
): Promise<Todo | null> => {
  try {
    const { data, error } = await supabase
      .from('todos')
      .update({ ...editTitle, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`updateTodo 오류 : ${error.message}`);
    }

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Todo 삭제
export const deleteTodo = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (error) {
      throw new Error(`deleteTodo 오류 : ${error.message}`);
    }
  } catch (error) {
    console.log(error);
  }
};

// Completed Toggle
export const toggleTodo = async (id: number, completed: boolean): Promise<Todo | null> => {
  return updateTodo(id, { completed });
};

// 페이지 단위로 조각내서 목록 출력하기
// getTodosPaginated(1, 10개)
// getTodosPaginated(2, 10개)
// getTodosPaginated(페이지번호, 10개)
export const getTodosPaginated = async (
  page: number = 1,
  limit: number = 10,
): Promise<{ todos: Todo[]; totalCount: number; totalPages: number; currentPage: number }> => {
  // 시작
  // page=2, limit 10
  // (2-1) * 10 => 10
  const from = (page - 1) * limit;
  // 제한
  // 10 + 10 - 1 => 19
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
  // 몇페이지 인지 계산 (소숫점은 올림)
  const totalPages = Math.ceil(totalCount / limit);
  return {
    todos: data || [],
    totalCount,
    totalPages,
    currentPage: page,
  };
};

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
