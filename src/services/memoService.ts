import { supabase } from '../lib/supabase';
import type { Memo, MemoInsert, MemoUpdate } from '../types/MemoType';

// Memo 목록 조회
export const getMemos = async (): Promise<Memo[]> => {
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    throw new Error(`목록 오류 : ${error.message}`);
  }
  return data || [];
};

// Memo 생성
export const createMemo = async (newMemo: Omit<MemoInsert, 'user_id'>): Promise<Memo | null> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('로그인 필요');
    }

    const { data, error } = await supabase
      .from('memos')
      .insert([{ ...newMemo, completed: false, user_id: user.id }])
      .select()
      .single();
    if (error) {
      throw new Error(`생성 오류 : ${error.message}`);
    }
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Memo 수정
export const updateMemo = async (id: number, EditMemo: MemoUpdate): Promise<Memo | null> => {
  try {
    const { data, error } = await supabase
      .from('memos')
      .update({ ...EditMemo })
      .eq('id', id)
      .select('*')
      .single();
    if (error) {
      throw new Error(`수정 오류 ${error}`);
    }
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Memo 삭제
export const deleteMemo = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase.from('memos').delete().eq('id', id);
    if (error) {
      throw new Error(`삭제 오류 ${error.message}`);
    }
  } catch (error) {
    console.log(error);
  }
};
