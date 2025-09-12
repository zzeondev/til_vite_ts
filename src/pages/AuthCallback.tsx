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
      // URL에서 세션(웹브라우저 정보시 사라지는 데이터)에 담겨진 정보를 가져옮
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setMsg(`인증 오류 : ${error.message}`);
        return;
      }
      // 인증 데이터가 존재함.
      if (data.session?.user) {
        const user = data.session.user;
        // 추가적인 정보 파악 가능 (metadata 라고 함.)
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
          // 프롤필이 없고 닉네임이 존재하므로 프로필 생성하자.
          const newProfile: ProfileInsert = { id: user.id, nickname: nickName };
          const result = await createProfile(newProfile);
          if (result) {
            setMsg('🥰 이메일 인증 완료. 프로필생 생성 성공! 홈으로 이동하세요. ^^');
          } else {
            setMsg('🥰 이메일 인증 완료. 프로필이 생성 실패! 관리자에게 문의하세요.');
          }
        } else {
          setMsg('🥰 이메일 인증 완료. 홈으로 이동하세요. ^^');
        }
      } else {
        setMsg('🥰 인증 정보 자체가 없습니다. 다시 가입해주세요.');
      }
    } catch (err) {
      console.log(`인증 콜백 함수 처리 오류 : ${err}`);
      setMsg('🥰 인증 처리 중 오류가 발생했습니다.');
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
