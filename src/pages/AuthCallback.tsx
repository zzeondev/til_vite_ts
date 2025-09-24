import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { ProfileInsert } from '../types/TodoType';
import { createProfile } from '../lib/profile';
import { useNavigate } from 'react-router-dom';

/**
 * - 인증 콜백 URL 처리
 * - 사용자에게 인증 진행 상태 안내
 * - 자동 인증 처리 완료 안내
 */
function AuthCallback() {
  const [msg, setMsg] = useState<string>('인증 처리 중 ...');

  // 카카오 로그인 시 대기 시간 테스트
  const [countDown, setCountDown] = useState(0);
  // 리다이렉트가 가능한지 아닌지 보관
  const [shouldRedirect, setShouldRedirect] = useState(false);
  // 강제로 이동하기 위한 처리
  const navigate = useNavigate();

  // 닉네임 추출
  const extractNickname = (user: any, isOAuthLogin: boolean, loginType: string): string => {
    let nickname = '';

    if (isOAuthLogin) {
      // OAuth 로그인 (카카오, 구글)인 경우
      nickname =
        user.user_metadata.nickname ||
        user.app_metadata.full_name ||
        user.app_metadata.name ||
        user.user_metadata.full_name ||
        user.user_metadata.name ||
        user.email?.split('@')[0] ||
        (loginType === '카카오 로그인' ? '카카오사용자' : '구글사용자');
    } else {
      // 이메일 로그인인 경우 - 회원가입 시 저장한 닉네임 사용
      nickname = user.user_metadata.nickName || user.user_metadata.nickname;

      // 닉네임이 없으면 이메일에서 추출
      if (!nickname) {
        nickname = user.email?.split('@')[0] || '이메일사용자';
      }
    }

    return nickname;
  };

  // 프로필 존재 확인
  const checkExistingProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();
      return error ? null : data;
    } catch (error) {
      return null;
    }
  };

  // 메세지 전용 함수
  const setLoginMessage = (loginType: string, action: string, success: boolean) => {
    const emoji = success ? '🥰' : '😞';
    const status = success ? '성공' : '실패';
    setMsg(
      `${emoji} ${loginType} 완료. ${action} ${status}! ${success ? '홈으로 이동하세요. ^^' : '관리자에게 문의하세요.'}`,
    );
    if (success) setShouldRedirect(true);
  };

  // OAuth 콜백에서 세션 설정
  const handleOAuthCallback = async (): Promise<void> => {
    try {
      // URL에서 OAuth 파라미터 확인 (Query String과 Fragment 모두 확인)
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));

      const code = urlParams.get('code') || hashParams.get('code');
      const error = urlParams.get('error') || hashParams.get('error');
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      // console.log('OAuth 파라미터:', {
      //   code: !!code,
      //   error,
      //   accessToken: !!accessToken,
      //   refreshToken: !!refreshToken,
      //   fullUrl: window.location.href,
      //   search: window.location.search,
      //   hash: window.location.hash,
      // });

      if (error) {
        setMsg(`OAuth 오류: ${error}`);
        return;
      }

      if (code) {
        // OAuth 코드가 있으면 세션 교환
        const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
        if (sessionError) {
          setMsg(`세션 교환 오류: ${sessionError.message}`);
          return;
        }
        console.log('OAuth 세션 교환 성공:', data);
      } else if (accessToken && refreshToken) {
        // Fragment에서 직접 토큰이 있는 경우 세션 설정
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) {
          setMsg(`세션 설정 오류: ${sessionError.message}`);
          return;
        }
        console.log('Fragment 세션 설정 성공:', data);
      } else {
        // OAuth 파라미터가 없는 경우, Supabase가 자동으로 처리했을 수 있음
        console.log('OAuth 파라미터 없음 - Supabase 자동 처리 확인');
      }
    } catch (err) {
      console.error('OAuth 콜백 처리 오류:', err);
    }
  };

  // 인증 콜백 처리
  const handleAuthCallback = async (): Promise<void> => {
    try {
      // 먼저 OAuth 콜백 처리
      await handleOAuthCallback();
      // 세션 확인 (여러 번 시도)
      let sessionData = null;
      let attempts = 0;
      const maxAttempts = 5; // 시도 횟수

      while (attempts < maxAttempts) {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setMsg(`인증 오류 : ${error.message}`);
          return;
        }
        if (data.session?.user) {
          sessionData = data;
          break;
        }
        attempts++;
        if (attempts < maxAttempts) {
          // 1초 대기 후 재시도
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!sessionData?.session.user) {
        setMsg('🥰 인증 정보 자체가 없습니다. 다시 가입해주세요.');
        return;
      }

      const user = sessionData.session.user;
      // 카카오 또는 구글로 로그인 했는지 확인 필요 (kakao, google 은 Supabase 에서 정한 글자)
      const isKakaoLogin = user.app_metadata.provider === 'kakao';
      const isGoogleLogin = user.app_metadata.provider === 'google';
      const isOAuthLogin = isKakaoLogin || isGoogleLogin;

      let loginType = '이메일 인증';
      if (isKakaoLogin) {
        loginType = '카카오 로그인';
      } else if (isGoogleLogin) {
        loginType = '구글 로그인';
      }

      // OAuth 로그인 이메일 중복 확인 (임시 비활성화)
      if (isOAuthLogin && user.email) {
        console.log(`${loginType} - 이메일 중복 확인 비활성화`);
        console.log(user.email);
      }

      // 닉네임 추출
      const nickname = extractNickname(user, isOAuthLogin, loginType);

      // 프로필 존재 확인
      const existingProfile = await checkExistingProfile(user.id);

      if (!existingProfile && nickname) {
        // 프로필 생성
        const newProfile: ProfileInsert = { id: user.id, nickname };
        const result = await createProfile(newProfile);
        setLoginMessage(loginType, '프로필 생성', result);
      } else if (existingProfile && nickname) {
        // 프로필 업데이트
        try {
          // 현재 프로필
          const { data: currentProfile } = await supabase
            .from('profiles')
            .select('nickname')
            .eq('id', user.id)
            .single();

          if (currentProfile?.nickname !== nickname && nickname.trim()) {
            const { data, error: updateError } = await supabase
              .from('profiles')
              .update({ nickname })
              .eq('id', user.id);

            setLoginMessage(loginType, '프로필 업데이트', !updateError);
          } else {
            setLoginMessage(loginType, '인증', true);
          }
        } catch (error) {
          setLoginMessage(loginType, '인증', true);
        }
      } else {
        setLoginMessage(loginType, '인증', true);
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
  }, [handleAuthCallback]);

  // 리다이렉트 처리 useEffect
  useEffect(() => {
    if (shouldRedirect) {
      // 사용자 이동에 대한 테스트를 위해서.
      setCountDown(3);
      const timer = setInterval(() => {
        setCountDown(prev => {
          if (prev <= 1) {
            clearInterval(timer); // 타이머 중지 시킴
            navigate('/todos'); // 강제로 이동시킴
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // 클린업 함수
      return () => clearInterval(timer);
    }
  }, [shouldRedirect, navigate]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          padding: '32px',
          borderRadius: '8px',
          maxWidth: '448px',
          width: '100%',
          margin: '0 16px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: '#1f2937' }}>
          인증 페이지
        </h2>
        <div style={{ marginBottom: '16px', color: '#374151' }}>{msg}</div>
        {/* 카운트다운 표시 */}
        {countDown && (
          <div
            style={{
              marginTop: '16px',
              padding: '16px',
              backgroundColor: '#eff6ff',
              borderRadius: '8px',
            }}
          >
            <p
              style={{
                color: '#1d4ed8',
                fontWeight: '500',
              }}
            >
              {countDown}초 후 todos 페이지로 이동합니다...
            </p>
            <div style={{ marginTop: '8px' }}>
              <div
                style={{
                  width: '100%',
                  backgroundColor: '#dbeafe',
                  borderRadius: '9999px',
                  height: '8px',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#3b82f6',
                    height: '8px',
                    borderRadius: '9999px',
                    transition: 'width 1s ease',
                    width: `${((3 - countDown) / 3) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthCallback;
