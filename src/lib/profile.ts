/**
 * 사용자 프로필 관리
 * - 프로필 생성
 * - 프로필 정보 조회
 * - 프로필 정보 수정
 * - 프로필 정보 삭제
 *
 * 주의 사항
 * - 반드시 사용자 인증 후에만 프로필 생성
 */

import type { Profile, ProfileInsert, ProfileUpdate } from '../types/TodoType';
import { supabase } from './supabase';

// 사용자 프로필 생성
const createProfile = async (newUserProfile: ProfileInsert): Promise<boolean> => {
  try {
    const { error } = await supabase.from('profiles').insert([{ ...newUserProfile }]);
    if (error) {
      console.log(`프로필 추가에 실패 : ${error.message}`);
      return false;
    }
    return true;
  } catch (error) {
    console.log(`프로필 생성 오류 : ${error}`);
    return false;
  }
};

// 사용자 프로필 조회
const getProfile = async (userId: string): Promise<Profile | null> => {
  try {
    console.log(userId);
    const { error, data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    console.log(data);
    if (error) {
      console.log(error.message);
      return null;
    }
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// 사용자 프로필 수정
const updateProfile = async (editUserProfile: ProfileUpdate, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ ...editUserProfile })
      .eq('id', userId);
    if (error) {
      console.log(error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

// 사용자 프로필 삭제
const deleteProfile = () => {};

// 사용자 프로필 이미지 업로드
const uploadAvatar = () => {};

// 내보내기
export { createProfile, getProfile, updateProfile, deleteProfile, uploadAvatar };
