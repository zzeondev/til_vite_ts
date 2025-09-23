# Supabase 카카오 로그인

- 이메일 가입 회원과 SNS 가입 회원이 `email` 이 겹치면 하나의 계정에 통합함
- 인증 환경 셋팅은 자주 변경됩니다.
- 적용시점에 다시 꼭 확인하셔야 합니다.
- 참조 자료 : https://www.youtube.com/watch?v=iWQEK8pS2kU

## 1. 카카오 인증 셋팅하기

- https://developers.kakao.com/
- 로그인 후 > 앱 메뉴 > 앱 생성

## 1.1. 앱 등록

- 생성된 입 `나의 할 일 서비스` > 카카오 로그인 메뉴 선택 > 개인 개발자 비즈앱 전환
- 플랫폼 > Web 플랫폼 등록 > 사이트 등록 > `http://localhost:5173`

### 1.2. 반드시 Rest API 키를 보관해둠

- `3b6d770bcbc626e8c037ee24421f3b31`

### 1.3. 사용설정

- 카카오 로그인 메뉴 > 일반 > `사용설정 활성`

### 1.4. 동의항목

- 카카오 로그인 메뉴 > 동의항목 > 개인정보 > `닉네임, 프로필 사진, 카카오계정(이메일)` 활성화

### 1.5. Redirect URI 등록하기

- 카카오 로그인 메뉴 > 일반 > 리다이렉트 URI 등록함
- ex) `http://localhost:5173/auth/callback`
- 추후 추가 설정 필요

### 1.6. Supabase 를 위한 `Client Secret` 설정 필요

- 카카오 로그인 메뉴 > 일반 > `Client Secret 활성` > 클라이언트 시크릿 발급
- 시크릿 키 보관 : `epc77E2V4prcdeD6I74iqCY1nUFkuKPY`

## 2. Supabase 인증 셋팅하기

- supabase.com > 프로젝트 > Authentication 메뉴 > Sign In / Providers 메뉴
- Auth Providers 항목에서 `kakao` 활성
- Rest API 키와 클라이언트 시크릿 키를 입력해줌
- Callback URL (for OAuth) 의 내용을 반드시 보관해 둠
- `https://jinvuynwlrgxoisfdjyh.supabase.co/auth/v1/callback`
- `Callback URL 을 카카오 개발자의 Redirect URI 에 추가로 저장해둠`

## 3. 카카오 회원가입하기 코드 적용하기

- 카카오 관련 문서 : https://supabase.com/docs/guides/auth/social-login/auth-kakao

### 3.1. 로그인 버튼 만들기

- src/contexts/AuthContext.tsx
- 카카오 로그인 기능 추가 `signInWithKakao`

```tsx
/**
 * 주요기능
 * - 사용자 세션관리
 * - 로그인/회원가입/로그아웃
 * - 사용자 인증 정보 상태 변경 감시
 * - 전역 인증 상태를 컴포넌트에 반영
 */

import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { supabase } from '../lib/supabase';
import type { DeleteRequestInsert } from '../types/TodoType';
import { redirect } from 'react-router-dom';

// 1. 인증 컨텍스트 타입
type AuthContextType = {
  // 현재 사용자의 세션정보 (로그인 상태, 토큰)
  session: Session | null;
  // 현재 로그인 된 사용자 정보
  user: User | null;
  // 회원 가입 함수(이메일, 비밀번호) : 비동기라서
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  // 회원 로그인 함수(이메일, 비밀번호) : 비동기라서
  signIn: (email: string, password: string) => Promise<{ error?: string }>;

  // 카카오 로그인 함수
  signInWithKakao: () => Promise<{ error?: string }>;

  // 회원 로그아웃
  signOut: () => Promise<void>;
  // 회원정보 로딩 상태
  loading: boolean;
  // 회원탈퇴 기능
  deleteAccount: () => Promise<{ error?: string; success?: boolean; message?: string }>;
};

// 2. 인증 컨텍스트 생성 (인증 기능을 컴포넌트에서 활용하게 해줌.)
const AuthContext = createContext<AuthContextType | null>(null);

// 3. 인증 컨텍스트 프로바이더
export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // 현재 사용자 세션
  const [session, setSession] = useState<Session | null>(null);
  // 현재 로그인한 사용자 정보
  const [user, setUser] = useState<User | null>(null);
  // 로딩 상태 추가 : 초기 실행시 로딩 시킴, true
  const [loading, setLoading] = useState<boolean>(true);

  // 초기 세션 로드 및 인증 상태 변경 감시
  useEffect(() => {
    // 세션을 초기에 로딩을 한 후 처리 한다.
    const loadSession = async () => {
      try {
        setLoading(true); // 로딩중
        const { data } = await supabase.auth.getSession();
        setSession(data.session ? data.session : null);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.log(error);
      } finally {
        // 로딩완료
        setLoading(false);
      }
    };
    loadSession();

    // // 기존 세션이 있는지 확인
    // supabase.auth.getSession().then(({ data }) => {
    //   setSession(data.session ? data.session : null);
    //   setUser(data.session?.user ?? null);
    // });
    // 인증상태 변경 이벤트를 체크(로그인, 로그아웃, 토큰 갱신 등의 이벤트 실시간 감시)
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });
    // 컴포넌트가 제거되면 이벤트 체크 해제 : cleanUp
    return () => {
      // 이벤트 감시 해제.
      data.subscription.unsubscribe();
    };
  }, []);

  // 회원 가입 함수(이메일, 비밀번호) : 비동기라서
  const signUp: AuthContextType['signUp'] = async (email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // 회원 가입 후 이메일로 인증 확인시 리다이렉트 될 URL
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      return { error: error.message };
    }
    // 우리는 이메일 확인을 활성화 시켰습니다.
    // 이메일 확인 후 인증 전까지는 아무것도 넘어오지 않습니다.
    return {};
  };

  // 회원 로그인 함수(이메일, 비밀번호) : 비동기라서
  const signIn: AuthContextType['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password, options: {} });
    if (error) {
      return { error: error.message };
    }
    return {};
  };
  // 카카오 로그인 함수
  const signInWithKakao = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        // 로그인 실행후 이동옵션
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    // 오류발생시 체크 해보자
    if (error) {
      return { error: error.message };
    }
    console.log('카카오 로그인 성공 : ', data);
    return {};
  };

  // 회원 로그아웃
  const signOut: AuthContextType['signOut'] = async () => {
    await supabase.auth.signOut();
  };

  // 회원 탈퇴기능
  const deleteAccount: AuthContextType['deleteAccount'] = async () => {
    try {
      // 기존에 사용한 데이터들을 먼저 정리한다.
      const { error: profileError } = await supabase.from('profiles').delete().eq('id', user?.id);
      if (profileError) {
        console.log('프로필 삭제 실패 : ', profileError.message);
        return { error: '프로필 삭제에 실패했습니다.' };
      }

      // 탈퇴 신청 데이터 추가
      // account_deletion_requests 에  Pending 으로 Insert 합니다.
      // 등록할 삭제 데이터
      const deleteInfo: DeleteRequestInsert = {
        user_id: user?.id,
        reason: '사용자 요청',
        status: 'pending',
        user_email: user?.email as string,
      };
      const { error: deleteRequestsError } = await supabase
        .from('account_deletion_requests')
        .insert([{ ...deleteInfo }]);

      if (deleteRequestsError) {
        console.log('탈퇴 목록 추가에 실패 : ', deleteRequestsError.message);
        return { error: '탈퇴 목록 추가에 실패했습니다.' };
      }

      // 혹시 SMTP 서버가 구축이 가능하다면 관리자에게 이메일 전송하는 자리

      // 로그아웃 시켜줌.
      await signOut();

      return {
        success: true,
        message: '계정 삭제가 요청되었습니다. 관리자 승인 후 완전히 삭제됩니다.',
      };
    } catch (err) {
      console.log('탈퇴 요청 기능 오류 : ', err);
      return { error: '계정 탈퇴 처리 중 오류가 발생하였습니다.' };
    }
  };

  const value: AuthContextType = {
    signUp,
    signIn,
    signInWithKakao,
    signOut,
    user,
    session,
    loading,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// const {signUp, signIn, signOut, user, session} = useAuth()
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('AuthContext 가 없습니다.');
  }
  return ctx;
};
```

- /src/components/KakaoLoginButton.tsx 파일 생성

```tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

// 오류 메시지를 사용한 화면에 보여줄 함수
interface KakaoLoginButtonProps {
  children?: React.ReactNode;
  onError?: (error: string) => void;
}
const KakaoLoginButton = ({ onError }: KakaoLoginButtonProps) => {
  // 카카오 로그인 사용
  const { signInWithKakao } = useAuth();
  // 카카오 로그인 실행
  const handleKakaoLogin = async () => {
    try {
      const { error } = await signInWithKakao();
      if (error && onError) {
        console.log('카카오 로그인 에러 메시지 : ', error);
      }
    } catch (err) {
      console.log('카카오 로그인 오류 : ', err);
    }
  };

  return (
    <button
      type="button"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
        padding: '12px 16px',
        backgroundColor: '#fee500',
        color: '#000',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.backgroundColor = '#fdd835';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = '#fee500';
      }}
      onClick={handleKakaoLogin}
    >
      {/* 카카오 아이콘 SVG */}
      <svg
        width="21"
        height="19"
        viewBox="0 0 21 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10.4036 0.878957C5.10601 0.894207 0.821172 4.29987 0.833339 8.48454C0.841089 11.1754 2.62367 13.5337 5.30359 14.8705L4.40926 18.2505C4.39025 18.3067 4.38996 18.3676 4.40845 18.4241C4.42694 18.4805 4.46321 18.5295 4.51183 18.5636C4.56045 18.5977 4.6188 18.6152 4.67817 18.6133C4.73754 18.6115 4.79472 18.5906 4.84117 18.5535L8.72234 15.9175C9.29383 15.9974 9.87028 16.0366 10.4473 16.0349C15.7448 16.0196 20.0298 12.6148 20.0178 8.42946C20.0058 4.24412 15.7012 0.86379 10.4036 0.878957ZM5.589 10.4772C5.58984 10.7732 5.41459 10.9578 5.13142 10.9586C4.84826 10.9595 4.67234 10.7759 4.6715 10.4799L4.66192 7.14779L3.69684 7.15062C3.39409 7.15146 3.28601 6.92721 3.28542 6.73487C3.28362 6.68019 3.2929 6.62571 3.31268 6.5747C3.33247 6.52369 3.36236 6.47721 3.40056 6.43805C3.43876 6.39888 3.48448 6.36784 3.53498 6.34679C3.58548 6.32573 3.63971 6.31511 3.69442 6.31554L6.54151 6.30721C6.59625 6.30639 6.65059 6.31665 6.70127 6.33735C6.75195 6.35806 6.79792 6.38879 6.83643 6.4277C6.87494 6.46662 6.90519 6.51291 6.92536 6.56381C6.94554 6.6147 6.95523 6.66914 6.95384 6.72387C6.95434 6.91612 6.84734 7.14104 6.54392 7.14187L5.57942 7.14471L5.589 10.4772ZM10.0299 10.9449C9.92975 10.9532 9.82983 10.926 9.74777 10.8679C9.66571 10.8099 9.60677 10.7247 9.58134 10.6275L9.37892 10.0005L7.46167 10.006L7.25792 10.627C7.23609 10.7253 7.17957 10.8125 7.09871 10.8726C7.01784 10.9327 6.91805 10.9616 6.81759 10.9541C6.75995 10.9567 6.70239 10.9477 6.64827 10.9277C6.59415 10.9077 6.54456 10.8771 6.5024 10.8377C6.46024 10.7984 6.42636 10.751 6.40274 10.6983C6.37912 10.6457 6.36623 10.5889 6.36484 10.5312C6.36553 10.4619 6.37968 10.3935 6.40651 10.3296L7.72817 6.79779C7.82284 6.53887 8.05134 6.26221 8.40917 6.26121C8.72359 6.26029 8.97326 6.45404 9.09409 6.79279L10.3951 10.3115C10.425 10.3868 10.4427 10.4662 10.4477 10.547C10.4469 10.6008 10.4355 10.6538 10.414 10.703C10.3925 10.7523 10.3613 10.7967 10.3224 10.8338C10.2835 10.8708 10.2376 10.8997 10.1874 10.9188C10.1371 10.9379 10.0836 10.9468 10.0299 10.9449ZM13.5538 10.4825C13.5516 10.5376 13.5385 10.5918 13.5153 10.6419C13.4922 10.692 13.4593 10.737 13.4187 10.7743C13.378 10.8117 13.3304 10.8406 13.2785 10.8595C13.2267 10.8784 13.1716 10.8869 13.1164 10.8844L11.4063 10.8892C11.1063 10.8901 10.926 10.7007 10.9251 10.3828L10.9146 6.73279C10.9138 6.43729 11.0891 6.25312 11.3722 6.25237C11.6553 6.25162 11.8313 6.43462 11.8323 6.73021L11.8418 10.053L13.1141 10.0493C13.175 10.0463 13.2359 10.0561 13.2928 10.0779C13.3497 10.0998 13.4015 10.1332 13.4448 10.1761C13.4828 10.2171 13.5121 10.2654 13.5308 10.3181C13.5495 10.3708 13.5573 10.4267 13.5538 10.4825ZM17.3744 10.5632C17.3396 10.8975 17.0161 10.9243 16.9176 10.9245C16.8937 10.9246 16.8697 10.9235 16.8459 10.9212C16.6764 10.9045 16.5808 10.7981 16.4031 10.5596L15.1929 8.91979L14.8642 9.25696L14.8678 10.4923C14.8679 10.5516 14.856 10.6103 14.8329 10.6648C14.8097 10.7194 14.7757 10.7687 14.733 10.8098C14.6903 10.8509 14.6397 10.8829 14.5842 10.9039C14.5288 10.9249 14.4697 10.9344 14.4104 10.932C14.1354 10.9328 13.9506 10.757 13.9498 10.4949L13.9389 6.69696C13.9372 6.63652 13.9478 6.57637 13.9703 6.52024C13.9928 6.46411 14.0266 6.4132 14.0696 6.37068C14.1126 6.32816 14.1638 6.29494 14.2202 6.27308C14.2766 6.25123 14.3368 6.2412 14.3973 6.24362C14.4579 6.2395 14.5188 6.24826 14.5758 6.26932C14.6329 6.29038 14.6848 6.32327 14.7283 6.36584C14.7717 6.4084 14.8056 6.45966 14.8279 6.51627C14.8501 6.57288 14.8601 6.63355 14.8572 6.69429L14.8613 8.16471L16.4726 6.47537C16.5188 6.42414 16.575 6.38279 16.6376 6.35381C16.7002 6.32482 16.7681 6.3088 16.8371 6.30671C17.0588 6.31196 17.2823 6.45862 17.2772 6.72854C17.2772 6.85471 17.2022 6.93821 17.0522 7.10446C17.0183 7.14212 16.9808 7.18362 16.9403 7.23012L15.8389 8.34779L17.1505 10.0549C17.286 10.2306 17.3983 10.376 17.3744 10.5632Z"
          fill="#3B1E1E"
        />
      </svg>
      카카오 로그인
    </button>
  );
};

export default KakaoLoginButton;
```

- /src/pages/SignUpPage.tsx 업데이트

```tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { createProfile } from '../lib/profile';
import type { ProfileInsert } from '../types/TodoType';
import KakaoLoginButton from '../components/KaKaoLoginButton';

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
      <div className="page-header">
        <h2 className="page-title">회원가입</h2>
        <p className="page-subtitle">새 계정을 만들어 보세요.</p>
      </div>
      <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">이메일</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="이메일"
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="비밀번호 (최소 6자)"
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">닉네임</label>
            <input
              type="text"
              value={nickName}
              onChange={e => setNickName(e.target.value)}
              placeholder="닉네임을 입력하세요."
              className="form-input"
              required
            />
          </div>
          <button type="submit" className="btn btn-success btn-lg" style={{ width: '100%' }}>
            회원가입
          </button>
        </form>

        {/* SNS 로그인 영역 */}
        <div style={{ display: 'flex', alignItems: 'center', margin: 'var(--space-6) ' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--gray-300)' }}></div>
          <span style={{ padding: '0 var(--space-4)', fontSize: '14px' }}>또는</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--gray-300)' }}></div>
        </div>
        {/* 카카오 로그인 버튼 : 오류 메시지는 사용자도 볼 수 있어야 함*/}
        <KakaoLoginButton onError={error => setMsg(`카카오 로그인 오류 : ${error}`)} />

        {/* 메시지 출력 */}
        {msg && (
          <p
            style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: msg.includes('성공') ? 'var(--success-50)' : '#fef2f2',
              color: msg.includes('성공') ? 'var(--success-600)' : '#dc2626',
              border: `1px solid ${msg.includes('성공') ? 'var(--success-600)' : '#dc2626'}`,
            }}
          >
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}

export default SignUpPage;
```

- /src/pages/SignInPage.tsx 업데이트

```tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import KakaoLoginButton from '../components/KaKaoLoginButton';

function SignInPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [pw, setPw] = useState<string>('');
  const [msg, setMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { error } = await signIn(email, pw);
    if (error) {
      setMsg(`로그인 오류 : ${error}`);
    } else {
      setMsg('로그인 성공');
      // 바로 이동시키기
      navigate('/todos');
    }
  };
  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">🔑 로그인페이지</h2>
        <p className="page-subtitle">계정에 로그인하세요.</p>
      </div>
      <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">이메일</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="form-input"
              required
            />
          </div>

          <button type="submit" className="btn btn-success btn-lg" style={{ width: '100%' }}>
            로그인
          </button>
        </form>

        {/* SNS 로그인 영역 */}
        <div style={{ display: 'flex', alignItems: 'center', margin: 'var(--space-6) ' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--gray-300)' }}></div>
          <span style={{ padding: '0 var(--space-4)', fontSize: '14px' }}>또는</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--gray-300)' }}></div>
        </div>

        {/* 카카오 로그인 버튼 : 오류 메시지는 사용자도 볼 수 있어야 함*/}
        <KakaoLoginButton onError={error => setMsg(`카카오 로그인 오류 : ${error}`)} />

        {/* 메시지 출력 */}
        {msg && (
          <p
            style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: msg.includes('성공') ? 'var(--success-50)' : '#fef2f2',
              color: msg.includes('성공') ? 'var(--success-600)' : '#dc2626',
              border: `1px solid ${msg.includes('성공') ? 'var(--success-600)' : '#dc2626'}`,
            }}
          >
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}

export default SignInPage;
```

- /src/pages/AuthCallback.tsx 업데이트 (카카오 로그인 후 profile 업데이트)

```tsx
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
        // 카카오로 로그인 했는지 확인 필요 (kakao 는 Supabase 에서 정한 글자)
        const isKakaoLogin = user.app_metadata.provider === 'kakao';

        // 추가적인 정보 파악 가능 (metadata 라고 함.)
        let nickName = user.user_metadata.nickName;

        // 카카오 로그인인 경우 카카오에서 제공하는 정보를 사용함
        if (isKakaoLogin && !nickName) {
          nickName =
            user.app_metadata.full_name ||
            user.app_metadata.name ||
            user.email?.split('@')[0] ||
            '카카오사용자';
        }

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
            // 로그인 타입으로 메세지 만들기
            const loginType = isKakaoLogin ? '카카오 로그인' : '이메일 인증';
            setMsg(`🥰 ${loginType} 완료. 프로필생 생성 성공! 홈으로 이동하세요. ^^`);
            // 리다이렉트 플래그 설정
            setShouldRedirect(true);
          } else {
            const loginType = isKakaoLogin ? '카카오 로그인' : '이메일 인증';
            setMsg(`🥰 ${loginType} 인증 완료. 프로필이 생성 실패! 관리자에게 문의하세요.`);
          }
        } else {
          const loginType = isKakaoLogin ? '카카오 로그인' : '이메일 인증';
          setMsg(`🥰 ${loginType} 인증 완료. 홈으로 이동하세요. ^^`);
          // 리다이렉트 플래그 설정
          setShouldRedirect(true);
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
  }, [handleAuthCallback]);

  // 리다이렉트 처리 useEffect
  useEffect(() => {
    if (shouldRedirect) {
      // 사용자 이동에 대한 테스트를 위해서
      setCountDown(3);
      const timer = setInterval(() => {
        setCountDown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/todos');
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
        <div style={{ marginBottom: '16px', color: '#37451' }}>{msg}</div>
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
```

## 4. 카카오 회원탈퇴하기 코드 적용하기

- /src/context/AuthContext.tsx

```tsx
/**
 * 주요기능
 * - 사용자 세션관리
 * - 로그인/회원가입/로그아웃
 * - 사용자 인증 정보 상태 변경 감시
 * - 전역 인증 상태를 컴포넌트에 반영
 */

import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { supabase } from '../lib/supabase';
import type { DeleteRequestInsert } from '../types/TodoType';
import { redirect } from 'react-router-dom';

// 1. 인증 컨텍스트 타입
type AuthContextType = {
  // 현재 사용자의 세션정보 (로그인 상태, 토큰)
  session: Session | null;
  // 현재 로그인 된 사용자 정보
  user: User | null;
  // 회원 가입 함수(이메일, 비밀번호) : 비동기라서
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  // 회원 로그인 함수(이메일, 비밀번호) : 비동기라서
  signIn: (email: string, password: string) => Promise<{ error?: string }>;

  // 카카오 로그인 함수
  signInWithKakao: () => Promise<{ error?: string }>;
  // 카카오 계정 연동 해제 함수
  unlinkKakaoAccount: () => Promise<{ error?: string; success?: boolean; message?: string }>;

  // 회원 로그아웃
  signOut: () => Promise<void>;
  // 회원정보 로딩 상태
  loading: boolean;
  // 회원탈퇴 기능
  deleteAccount: () => Promise<{ error?: string; success?: boolean; message?: string }>;
};

// 2. 인증 컨텍스트 생성 (인증 기능을 컴포넌트에서 활용하게 해줌.)
const AuthContext = createContext<AuthContextType | null>(null);

// 3. 인증 컨텍스트 프로바이더
export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // 현재 사용자 세션
  const [session, setSession] = useState<Session | null>(null);
  // 현재 로그인한 사용자 정보
  const [user, setUser] = useState<User | null>(null);
  // 로딩 상태 추가 : 초기 실행시 로딩 시킴, true
  const [loading, setLoading] = useState<boolean>(true);

  // 초기 세션 로드 및 인증 상태 변경 감시
  useEffect(() => {
    // 세션을 초기에 로딩을 한 후 처리 한다.
    const loadSession = async () => {
      try {
        setLoading(true); // 로딩중
        const { data } = await supabase.auth.getSession();
        setSession(data.session ? data.session : null);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.log(error);
      } finally {
        // 로딩완료
        setLoading(false);
      }
    };
    loadSession();

    // // 기존 세션이 있는지 확인
    // supabase.auth.getSession().then(({ data }) => {
    //   setSession(data.session ? data.session : null);
    //   setUser(data.session?.user ?? null);
    // });
    // 인증상태 변경 이벤트를 체크(로그인, 로그아웃, 토큰 갱신 등의 이벤트 실시간 감시)
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });
    // 컴포넌트가 제거되면 이벤트 체크 해제 : cleanUp
    return () => {
      // 이벤트 감시 해제.
      data.subscription.unsubscribe();
    };
  }, []);

  // 회원 가입 함수(이메일, 비밀번호) : 비동기라서
  const signUp: AuthContextType['signUp'] = async (email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // 회원 가입 후 이메일로 인증 확인시 리다이렉트 될 URL
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      return { error: error.message };
    }
    // 우리는 이메일 확인을 활성화 시켰습니다.
    // 이메일 확인 후 인증 전까지는 아무것도 넘어오지 않습니다.
    return {};
  };

  // 회원 로그인 함수(이메일, 비밀번호) : 비동기라서
  const signIn: AuthContextType['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password, options: {} });
    if (error) {
      return { error: error.message };
    }
    return {};
  };

  // 카카오 로그인 함수
  const signInWithKakao: AuthContextType['signInWithKakao'] = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        // 로그인 실행후 이동옵션
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    // 오류발생시 체크 해보자
    if (error) {
      return { error: error.message };
    }
    console.log('카카오 로그인 성공 : ', data);
    return {};
  };

  // 카카오 계정 연동 해제 함수
  const unlinkKakaoAccount: AuthContextType['unlinkKakaoAccount'] = async () => {
    try {
      // 카카오 로그인 사용자인지 확인
      if (user?.app_metadata.provider !== 'kakao') {
        return { error: '카카오 로그인 사용자가 아닙니다.' };
      }
      // supabase 에서 카카오 계정 연동 해제
      // 사용자의 카카오 identity 찾기
      const kakaoIdentity = user.identities?.find(item => item.provider === 'kakao');
      if (!kakaoIdentity) {
        return { error: '카카오 계정 연동 정보를 찾을 수 없습니다.' };
      }
      // 사용자의 카카오 identity 찾기 성공
      const { error } = await supabase.auth.unlinkIdentity(kakaoIdentity);
      if (error) {
        console.log(' 카카오 계정 연동 해제 실패:', error.message);
        return { error: '카카오 계정 연동 해제에 실패하였습니다.' };
      }
      // 계정 해제에 성공했다면
      return {
        success: true,
        message: '카카오 계정 연동이 해제되었습니다. 다시 로그인해주세요.',
      };
    } catch (err) {
      console.log(`카카오 계정 연동 해제 오류 : `, err);
      return { error: '카카오 계정 연동 해제 중 오류가 발생했습니다.' };
    }
  };

  // 회원 로그아웃
  const signOut: AuthContextType['signOut'] = async () => {
    await supabase.auth.signOut();
  };

  // 회원 탈퇴기능 (카카오 회원탈퇴 기능도 추가)
  const deleteAccount: AuthContextType['deleteAccount'] = async () => {
    try {
      // 카카오 로그인 사용자인지 확인
      const isKakaoUser = user?.app_metadata.provider === 'kakao';

      // 기존에 사용한 데이터들을 먼저 정리한다.
      const { error: profileError } = await supabase.from('profiles').delete().eq('id', user?.id);
      if (profileError) {
        console.log('프로필 삭제 실패 : ', profileError.message);
        return { error: '프로필 삭제에 실패했습니다.' };
      }

      // 탈퇴 신청 데이터 추가
      // account_deletion_requests 에  Pending 으로 Insert 합니다.
      // 등록할 삭제 데이터
      const deleteInfo: DeleteRequestInsert = {
        user_id: user?.id,
        reason: isKakaoUser ? '카카오 회원 탈퇴 요청' : '사용자 요청',
        status: 'pending',
        user_email: user?.email as string,
      };
      const { error: deleteRequestsError } = await supabase
        .from('account_deletion_requests')
        .insert([{ ...deleteInfo }]);

      if (deleteRequestsError) {
        console.log('탈퇴 목록 추가에 실패 : ', deleteRequestsError.message);
        return { error: '탈퇴 목록 추가에 실패했습니다.' };
      }

      // 혹시 SMTP 서버가 구축이 가능하다면 관리자에게 이메일 전송하는 자리

      // 로그아웃 시켜줌
      await signOut();

      return {
        success: true,
        message: isKakaoUser
          ? '카카오 계정 연동이 해제되었습니다. 계정 삭제가 요청되었습니다.'
          : '계정 삭제가 요청되었습니다. 관리자 승인 후 완전히 삭제됩니다.',
      };
    } catch (err) {
      console.log('탈퇴 요청 기능 오류 : ', err);
      return { error: '계정 탈퇴 처리 중 오류가 발생하였습니다.' };
    }
  };

  const value: AuthContextType = {
    signUp,
    signIn,
    signInWithKakao,
    signOut,
    unlinkKakaoAccount,
    user,
    session,
    loading,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// const {signUp, signIn, signOut, user, session} = useAuth()
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('AuthContext 가 없습니다.');
  }
  return ctx;
};
```

- /src/pages/ProfilePage.tsx

```tsx
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, removeAvatar, updateProfile, uploadAvatar } from '../lib/profile';
import type { Profile, ProfileUpdate } from '../types/TodoType';
import Loading from '../components/Loading';

/**
 * 사용자 프로필 페이지
 * - 기본 정보 표시
 * - 정보 수정
 * - 회원탈퇴 기능 : 확인을 거치고 진행하도록
 */
function ProfilePage() {
  // 회원 기본 정보 (카카오 회원 탈퇴 추가)
  const { user, deleteAccount, unlinkKakaoAccount } = useAuth();
  // 데이터 가져오는 동안의 로딩
  const [loading, setLoading] = useState<boolean>(true);
  // 사용자 프로필
  const [profileData, setProfileData] = useState<Profile | null>(null);
  // 에러 메시지
  const [error, setError] = useState<string>('');
  // 회원 정보 수정
  const [edit, setEdit] = useState<boolean>(false);
  // 회원 닉네임 보관
  const [nickName, setNickName] = useState<string>('');

  // 사용자 아바타 이미지를 위한 상태관리
  // 이미지 업로드 상태 표현
  const [uploading, setUploading] = useState<boolean>(false);
  // 미리보기 이미지 url (문자열)
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  // 실제 파일 (바이너리)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // 사용자가 새로운 이미지 선택시 즉, 편집 중인 경우 원본 URL 보관용 문자열
  const [originalAvatarUrl, setOriginalAvartarUrl] = useState<string | null>(null);
  // 이미지 제거 요청 상태(그러나, 실제 file 제거는 수정확인 버튼 눌렀을 때 처리)
  const [imageRemovalRequest, setImageRemovalReauest] = useState<boolean>(false);
  // input type="file" 태그 참조
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 사용자 프로필 정보 가져오기
  const loadProfile = async () => {
    if (!user?.id) {
      // 사용자의 id 가 없으면 중지
      setError('사용자 정보를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }
    try {
      // 사용자 정보 가져오기 ( null 일수도 있다. )
      const tempData = await getProfile(user?.id);

      if (!tempData) {
        // null 이라면
        setError('사용자 프로필 정보를 찾을 수 없습니다.');
        return;
      }
      // 사용자 정보가 있다.
      setNickName(tempData.nickname || '');
      setProfileData(tempData);
    } catch (err) {
      console.log(err);
      setError('사용자 프로필 호출 오류!!!');
    } finally {
      setLoading(false);
    }
  };

  // 프로필 데이터 업데이트
  const saveProfile = async () => {
    if (!user) {
      return;
    }
    if (!profileData) {
      return;
    }
    // 여러개가 업로드 되면 안됨
    setLoading(true);

    try {
      let imgUrl = originalAvatarUrl; // 원본 이미지 URL
      // 아바타이미지 제거라면
      if (imageRemovalRequest) {
        // storage 에 실제 이미지를 제거함.
        const success = await removeAvatar(user.id);
        if (success) {
          imgUrl = null;
        } else {
          alert('이미지 제거에 실패했습니다. 기존 이미지가 유지 됩니다.');
        }
      } else if (selectedFile) {
        // 새로운 이미지가 업로드 된다면
        const uploadedImageUrl = await uploadAvatar(selectedFile, user.id);
        if (uploadedImageUrl) {
          // 실제로 업로드 완료 후 전달받은 URL 문자열을 보관함.
          // profiles 테이블에 avatar_url 에 넣어줄 문자열
          imgUrl = uploadedImageUrl;
        } else {
          alert('이미지 업로드에 실패했습니다. 닉네임만 저장합니다.');
        }
      }

      // 실제로 업데이트 진행 부분
      const tempUpdateData: ProfileUpdate = { nickname: nickName, avatar_url: imgUrl };

      const success = await updateProfile(tempUpdateData, user.id);
      if (!success) {
        console.log('프로필 업데이트에 실패하였습니다.');
        return;
      }
      // 업데이트 성공시 초기화 진행
      setPreviewImage(null);
      setSelectedFile(null);
      setImageRemovalReauest(false);
      setOriginalAvartarUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await loadProfile();
      alert('프로필이 성공적으로 업데이트 되었습니다.');
    } catch (err) {
      console.log('프로필 업데이트 오류', err);
    } finally {
      setEdit(false);
    }
  };

  // 카카오 계정 연동 해제
  const handleUnlinkKakao = async () => {
    const message =
      '카카오 계정 연동을 해제하시겠습니까? \n\n 연동 해제 후에는 카카오로 다시 로그인 할 수 없습니다.';
    const isConfirm = confirm(message);
    if (isConfirm) {
      const result = await unlinkKakaoAccount();
      if (result.success) {
        alert(result.message);
        // 연동 해제 후 로그아웃 처리
        window.location.href = '/singin';
      } else if (result.error) {
        alert(`연동 해제 실패 : ${result.error}`);
      }
    }
  };

  // 회원탈퇴
  const handleDeleteUser = () => {
    // 카카오 로그인 사용자인지 확인
    const isKakaoUser = user?.app_metadata.provider === 'kakao';
    const message: string = isKakaoUser
      ? '😥 카카오 계정 연동을 해제하고 계정을 삭제하시겠습니까? \n\n 복구가 불가능합니다.'
      : '😥 계정을 완전히 삭제하시겠습니까? \n\n 복구가 불가능합니다.';
    let isConfirm = false;
    isConfirm = confirm(message);

    if (isConfirm) {
      deleteAccount();
    }
  };

  // 이미지 파일 선택 처리(미리보기)
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    // 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert(`지원하지 않는 파일 형식입니다. 허용 형식: ${allowedTypes.join(', ')}`);
      return;
    }

    // 파일 크기 검증 (5MB 제한)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert(`파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.`);
      return;
    }

    // 미리보기 생성 (파일을 글자로 변환한 것..)
    const reader = new FileReader();
    reader.onload = e => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setSelectedFile(file);
    // 새 이미지 선택 시 이미지 제거 요청 상태 초기화
    setImageRemovalReauest(false);
  };
  // 이미지 파일 선택 취소
  const handleCancelUpload = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 이미지 제거 처리
  const handleRemoveImage = () => {
    const ok = confirm('프로필 이미지를 제거하시겠습니까?');
    if (!ok) {
      return;
    }
    // 즉시 제거하지 않습니다.
    // 제거하라는 상태만 별도로 관리함.
    setImageRemovalReauest(true);
    setPreviewImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return <Loading message="프로필 정보를 불러오는 중 ..." size="lg" />;
  }
  // error 메시지 출력하기
  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <h2 className="page-title">⚠️ 프로필 오류</h2>
        <div style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-4)' }}>{error}</div>
        <button onClick={loadProfile} className="btn btn-primary">
          재시도
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">👤 회원정보</h2>
        <p className="page-subtitle">개인 정보를 확인하고 수정하세요.</p>
      </div>
      {/* 사용자 기본 정보 섹션 */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--gray--800)' }}>📧 기본 정보</h3>
        {/* 로그인 방식 표시 */}
        <div className="form-group">
          <label className="form-label">로그인 방식</label>
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor:
                user?.app_metadata?.provider === 'kakao' ? '#FEE500' : 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              color: user?.app_metadata?.provider === 'kakao' ? '#000000' : 'var(--gray-700)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
          >
            {user?.app_metadata?.provider === 'kakao' ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3C6.48 3 2 6.48 2 10.5C2 13.52 4.5 16.1 8 17.5L7 21L10.5 18.5C11.3 18.7 12.1 18.8 13 18.8C18.52 18.8 23 15.32 23 11.3C23 7.28 18.52 3.8 13 3.8C12.7 3.8 12.4 3.8 12.1 3.9C12.1 3.6 12 3.3 12 3Z"
                    fill="currentColor"
                  />
                </svg>
                카카오 로그인
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                    fill="currentColor"
                  />
                </svg>
                이메일 로그인
              </>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">이메일</label>
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--gray-700)',
            }}
          >
            {user?.email}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">가입일</label>
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--gray-700)',
            }}
          >
            {user?.created_at && new Date(user.created_at).toLocaleString()}
          </div>
        </div>
      </div>
      {/* 사용자 추가정보 */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--gray--800)' }}>
          👤 사용자 추가 정보
        </h3>
        <div className="form-group">
          <label className="form-label">아이디</label>
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--gray-700)',
            }}
          >
            {profileData?.id}
          </div>
        </div>
        {edit ? (
          <>
            <div className="form-group">
              <label className="form-label">닉네임</label>
              <input
                type="text"
                value={nickName}
                onChange={e => setNickName(e.target.value)}
                className="form-input"
                placeholder="닉네임을 입력하세요."
              />
            </div>
            <div className="form-group">
              <label className="form-label">아바타 편집</label>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                {previewImage ? (
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={previewImage}
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '50%',
                        border: '3px solid var(--primary-500)',
                        boxShadow: 'var(--shadow-md)',
                      }}
                    />
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--primary-600)',
                        marginTop: 'var(--space-2)',
                        fontWeight: 'bold',
                      }}
                    >
                      새로운 이미지 미리보기
                    </p>
                  </div>
                ) : imageRemovalRequest ? (
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: '120px',
                        height: '120px',
                        backgroundColor: 'var(--gray-50)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '3px dashed #dc3545',
                        margin: '0 auto',
                      }}
                    >
                      <div
                        style={{
                          textAlign: 'center',
                          fontSize: '11px',
                          color: '#dc3545',
                          fontWeight: 'bold',
                        }}
                      >
                        이미지 제거됨
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: '12px',
                        color: '#dc3545',
                        marginTop: 'var(--space-2)',
                        fontWeight: 'bold',
                      }}
                    >
                      이미지가 제거되었습니다
                    </p>
                  </div>
                ) : originalAvatarUrl ? (
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={originalAvatarUrl}
                      alt="현재 아바타"
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '50%',
                        border: '3px solid var(--success-500)',
                        boxShadow: 'var(--shadow-md)',
                      }}
                    />
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--success-600)',
                        marginTop: 'var(--space-2)',
                        fontWeight: 'bold',
                      }}
                    >
                      현재 아바타
                    </p>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: '120px',
                        height: '120px',
                        backgroundColor: 'var(--gray-50)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '3px dashed var(--gray-400)',
                        margin: '0 auto',
                      }}
                    >
                      <div
                        style={{
                          textAlign: 'center',
                          fontSize: '11px',
                          color: 'var(--gray-500)',
                          fontWeight: 'bold',
                        }}
                      >
                        이미지 없음
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--gray-500)',
                        marginTop: 'var(--space-2)',
                      }}
                    >
                      아바타 이미지를 설정해보세요
                    </p>
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageSelect}
                />
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      display: 'flex',
                      gap: 'var(--space-3)',
                      justifyContent: 'center',
                      flexWrap: 'wrap',
                      marginBottom: 'var(--space-4)',
                    }}
                  >
                    <button
                      className={`btn ${uploading ? 'btn-secondary' : 'btn-primary'}`}
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? '업로드 중...' : '이미지 선택'}
                    </button>

                    {previewImage && (
                      <button
                        className={`btn btn-secondary`}
                        disabled={uploading}
                        onClick={handleCancelUpload}
                      >
                        취소
                      </button>
                    )}

                    {!previewImage && !imageRemovalRequest && originalAvatarUrl && (
                      <button
                        className="btn"
                        style={{
                          backgroundColor: uploading ? 'var(--gray-300)' : '#dc3545',
                          color: 'white',
                        }}
                        onClick={handleRemoveImage}
                      >
                        {uploading ? '처리 중...' : '이미지 제거'}
                      </button>
                    )}

                    {imageRemovalRequest && (
                      <button
                        disabled={uploading}
                        className={`btn ${uploading ? 'btn-secondary' : 'btn-success'}`}
                        onClick={() => {
                          setImageRemovalReauest(false);
                        }}
                      >
                        제거 취소
                      </button>
                    )}
                  </div>
                </div>
                <p
                  style={{
                    fontSize: '12px',
                    color: 'var(--gray-500)',
                    marginTop: 'var(--space-2)',
                    textAlign: 'center',
                  }}
                >
                  지원 형식 : JPEG, PNG, GIF (최대 5MB)
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label">닉네임</label>
              <div
                style={{
                  padding: 'var(--space-3)',
                  backgroundColor: 'var(--gray-50)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--gray-700)',
                }}
              >
                {profileData?.nickname || '닉네임이 설정되지 않았습니다'}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">🖼️ 아바타</label>
              <div style={{ textAlign: 'center' }}>
                {profileData?.avatar_url ? (
                  <img
                    src={profileData.avatar_url}
                    alt="프로필 이미지"
                    style={{
                      width: '120px',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: '50%',
                      border: '3px solid var(--success-500)',
                      boxShadow: 'var(--shadow-md)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '120px',
                      height: '120px',
                      backgroundColor: 'var(--gray-50)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '3px dashed var(--gray-400)',
                      margin: '0 auto',
                    }}
                  >
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: 'bold' }}>
                      이미지 없음
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="form-group">
          <label className="form-label">가입일</label>
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--gray-700)',
            }}
          >
            {profileData?.created_at && new Date(profileData.created_at).toLocaleString()}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 'var(--space-3)',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {edit ? (
          <>
            <button
              className={`btn btn-lg ${uploading ? 'btn-secondary' : 'btn-primary'}`}
              disabled={uploading}
              onClick={saveProfile}
            >
              {uploading ? '저장 중...' : '수정확인'}
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => {
                setEdit(false);
                setNickName(profileData?.nickname || '');
                setPreviewImage(null);
                setSelectedFile(null);
                setImageRemovalReauest(false);
                setOriginalAvartarUrl(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              수정취소
            </button>
          </>
        ) : (
          <>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => {
                setEdit(true);
                // 편집 시작 시 원본 이미지 URL 저장
                setOriginalAvartarUrl(profileData?.avatar_url || null);
                setImageRemovalReauest(false);
              }}
            >
              정보수정
            </button>
            {/* 카카오 사용자에게만 연동 해제 버튼 표시 */}
            {user?.app_metadata?.provider === 'kakao' && (
              <button
                className="btn btn-warning btn-lg"
                onClick={handleUnlinkKakao}
                style={{ backgroundColor: '#FEE500', color: '#000000', border: 'none' }}
              >
                🔗 카카오 연동 해제
              </button>
            )}

            <button className="btn btn-danger btn-lg" onClick={handleDeleteUser}>
              {user?.app_metadata?.provider === 'kakao' ? '카카오 연동 해제 & 탈퇴' : '회원탈퇴'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
```

## 5. 회원가입시 이메일 또는 카카오의 이메일 중복 처리 방지

- 이메일 회원은 반드시 email 중복 체크
- 닉네임도 반드시 중복 체크 필수
- 회원가입 승인 진행

### 5.1. 이메일과 닉네임 중복은 회원이 아닌 사람이 DB 에 접근

- 웹에서 DB 로 접근하는 것이 아니고, 바로 DB 에 접근하는 코드 필요
- DB 명령을 직접 실행하는 형태로 구성이 필요 (`PostgreSQL Function` 기능)
- 많이 위험함

### 5.2. 이메일 중복인지 아닌지 검토하는 SQL

- SQL Editor 에 입력

```sql
-- Supabase 대시보드에서 SQL 에디터에 실행
CREATE OR REPLACE FUNCTION check_email_exists(email_param text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- 함수 소유자 권한으로 실행 (RLS 우회)
AS $$
DECLARE
  user_exists boolean;
BEGIN
  -- auth.users 테이블에서 이메일 확인
  SELECT EXISTS(
    SELECT 1 FROM auth.users
    WHERE email = email_param
  ) INTO user_exists;

  RETURN json_build_object('exists', user_exists);
END;
$$;

-- 익명 사용자도 이 함수를 실행할 수 있도록 권한 부여
GRANT EXECUTE ON FUNCTION check_email_exists(text) TO anon, authenticated;
```

### 5.3. 닉네임 중복인지 아닌지 검토하는 SQL

```sql
-- Supabase 대시보드에서 SQL 에디터에 실행
CREATE OR REPLACE FUNCTION check_nickname_exists(nickname_param text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- 함수 소유자 권한으로 실행 (RLS 우회)
AS $$
DECLARE
  nickname_exists boolean;
BEGIN
  -- profiles 테이블에서 닉네임 확인 (대소문자 무시)
  SELECT EXISTS(
    SELECT 1 FROM profiles
    WHERE LOWER(nickname) = LOWER(nickname_param)
  ) INTO nickname_exists;

  RETURN json_build_object('exists', nickname_exists);
END;
$$;

-- 익명 사용자도 이 함수를 실행할 수 있도록 권한 부여
GRANT EXECUTE ON FUNCTION check_nickname_exists(text) TO anon, authenticated;
```

### 5.4. 제대로 PostgreSQL Function 등록 여부 확인

- Supabase 대시보드 > API 메뉴 > Stored Procedures (프로시저) 목록 확인

## 6. 화면 구성 및 코드 적용

### 6.1. 이메일 및 닉네임 중복 체크

- /src/pages/SignUpPage.tsx 업데이트

```tsx
import React, { useState } from 'react';
import KakaoLoginButton from '../components/KaKaoLoginButton';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

function SignUpPage() {
  const { signUp, checkEmailExists, checkNicknameExists } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [pw, setPw] = useState<string>('');
  const [nickName, setNickName] = useState<string>('');
  const [msg, setMsg] = useState<string>('');

  // 이메일 중복 확인 상태
  const [emailCheckStatus, setEmailCheckStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle');

  // 이메일 중복 확인 메세지
  const [emailCheckMessage, setEmailCheckMessage] = useState<string>('');

  // 닉네임 중복 확인 상태
  const [nicknameCheckStatus, setNicknameCheckStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle');

  // 닉네임 중복 확인 메세지
  const [nicknameCheckMessage, setNicknameCheckMessage] = useState<string>('');

  // 이메일 중복 확인 함수
  const handleEmailCheck = async () => {
    if (!email.trim()) {
      setEmailCheckMessage('이메일을 입력해주세요.');
      setEmailCheckStatus('taken');
      return;
    }
    // 입력된 글자가 email 형식에 맞는지 정규표현식으로 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailCheckMessage('올바른 이메일 형식을 입력해주세요.');
      setEmailCheckStatus('taken');
      return;
    }

    setEmailCheckStatus('checking');
    setEmailCheckMessage('이메일 중복 확인 중...');
    try {
      // DB 에 직접 이메일 글자를 보내고 중복확인 진행
      const result = await checkEmailExists(email);
      if (result.error) {
        setEmailCheckMessage(`오류 : ${result.error}`);
        setEmailCheckStatus('taken');
      } else if (result.exists) {
        setEmailCheckMessage('이미 사용 중인 이메일입니다.');
        setEmailCheckStatus('taken');
      } else {
        setEmailCheckMessage('사용 가능한 이메일입니다.');
        setEmailCheckStatus('available');
      }
    } catch (error) {
      setEmailCheckMessage('이메일 중복 확인 중 오류가 발생했습니다.');
      setEmailCheckStatus('taken');
    }
  };

  // 닉네임 중복 확인 함수
  const handleNicknameCheck = async () => {
    if (!nickName.trim()) {
      setNicknameCheckMessage('닉네임을 입력해 주세요.');
      setNicknameCheckStatus('taken');
      return;
    }
    if (nickName.trim().length < 2) {
      setNicknameCheckMessage('닉네임을 2자 이상 입력해 주세요.');
      setNicknameCheckStatus('taken');
      return;
    }
    setNicknameCheckStatus('checking');
    setNicknameCheckMessage('닉네임 중복 확인 중...');
    try {
      // DB 에 직접 닉네임 글자를 보내고 중복확인 진행
      const result = await checkNicknameExists(nickName);
      if (result.error) {
        setNicknameCheckMessage(`오류 : ${result.error}`);
        setNicknameCheckStatus('taken');
      } else if (result.exists) {
        setNicknameCheckMessage('이미 사용 중인 닉네임입니다.');
        setNicknameCheckStatus('taken');
      } else {
        setNicknameCheckMessage('사용 가능한 닉네임입니다.');
        setNicknameCheckStatus('available');
      }
    } catch (error) {
      setNicknameCheckStatus('taken');
      setNicknameCheckMessage('닉네임 중복 확인 중 오류가 발생했습니다.');
    }
  };

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
      <div className="page-header">
        <h2 className="page-title">회원가입</h2>
        <p className="page-subtitle">새 계정을 만들어 보세요.</p>
      </div>
      <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">이메일</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              {/* 이메일 입력 태그 */}
              <input
                type="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (emailCheckStatus !== 'idle') {
                    setEmailCheckStatus('idle');
                    setEmailCheckMessage('');
                  }
                }}
                placeholder="이메일"
                className="form-input"
                required
                style={{ flex: 1 }}
              />
              {/* 이메일 중복 체크 버튼 태그*/}
              <button
                type="button"
                onClick={handleEmailCheck}
                disabled={emailCheckStatus === 'checking'}
                style={{
                  padding: '8px 16px',
                  backgroundColor: emailCheckStatus === 'available' ? '#10b981' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: emailCheckStatus === 'checking' ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                  opacity: emailCheckStatus === 'checking' ? 0.6 : 1,
                }}
              >
                {emailCheckStatus === 'checking' ? '확인중...' : '중복확인'}
              </button>
            </div>
            {/* 이메일 체크 결과 메시지 영역 */}
            {emailCheckMessage && (
              <div
                style={{
                  marginTop: '4px',
                  fontSize: '14px',
                  color:
                    emailCheckStatus === 'available'
                      ? '#10b981'
                      : emailCheckStatus === 'taken'
                        ? '#ef4444'
                        : '#6b7280',
                }}
              >
                {emailCheckStatus === 'checking' && '⏳ '}
                {emailCheckStatus === 'available' && '✅ '}
                {emailCheckStatus === 'taken' && '❌ '}
                {emailCheckMessage}
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="비밀번호 (최소 6자)"
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">닉네임</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              {/* 닉네임 입력 태그 */}
              <input
                type="text"
                value={nickName}
                onChange={e => {
                  setNickName(e.target.value);
                  if (nicknameCheckStatus !== 'idle') {
                    setNicknameCheckStatus('idle');
                    setNicknameCheckMessage('');
                  }
                }}
                placeholder="닉네임을 입력하세요."
                className="form-input"
                style={{ flex: 1 }}
                required
              />
              {/* 닉네임 중복 체크 버튼 태그 */}
              <button
                type="button"
                onClick={handleNicknameCheck}
                disabled={nicknameCheckStatus === 'checking'}
                style={{
                  padding: '8px 16px',
                  backgroundColor: nicknameCheckStatus === 'available' ? '#10b981' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: nicknameCheckStatus === 'checking' ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                  opacity: nicknameCheckStatus === 'checking' ? 0.6 : 1,
                }}
              >
                {nicknameCheckStatus === 'checking' ? '확인중...' : '중복확인'}
              </button>
            </div>
            {/* 닉네임 체크 결과 메시지 영역 */}
            {nicknameCheckMessage && (
              <div
                style={{
                  marginTop: '4px',
                  fontSize: '14px',
                  color:
                    nicknameCheckStatus === 'available'
                      ? '#10b981'
                      : nicknameCheckStatus === 'taken'
                        ? '#ef4444'
                        : '#6b7280',
                }}
              >
                {nicknameCheckStatus === 'checking' && '⏳ '}
                {nicknameCheckStatus === 'available' && '✅ '}
                {nicknameCheckStatus === 'taken' && '❌ '}
                {nicknameCheckMessage}
              </div>
            )}
          </div>
          {/* 이메일 및 닉네임 중복 체크 요청 출력 및 회원가입 */}
          <button
            type="submit"
            className="btn btn-success btn-lg"
            style={{
              width: '100%',
              opacity:
                emailCheckStatus !== 'available' || nicknameCheckStatus !== 'available' ? 0.5 : 1,
              cursor:
                emailCheckStatus !== 'available' || nicknameCheckStatus !== 'available'
                  ? 'not-allowed'
                  : 'pointer',
            }}
            disabled={emailCheckStatus !== 'available' || nicknameCheckStatus !== 'available'}
          >
            {emailCheckStatus !== 'available' || nicknameCheckStatus !== 'available'
              ? '이메일 및 닉네임 중복 확인 필요'
              : '회원가입'}
          </button>
          {/* 중복 확인 상태 안내 */}
          {(emailCheckStatus === 'idle' || nicknameCheckStatus === 'idle') && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px 12px',
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#92400e',
                textAlign: 'center',
              }}
            >
              ⚠️ 이메일 및 닉네임 중복 확인을 완료해주세요.
            </div>
          )}
          {emailCheckStatus === 'taken' && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px 12px',
                backgroundColor: '#fee2e2',
                border: '1px solid #ef4444',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#dc2626',
                textAlign: 'center',
              }}
            >
              ❌ 이미 사용 중인 이메일입니다. 다른 이메일을 사용하거나 해당 이메일로 로그인해주세요.
            </div>
          )}
          {nicknameCheckStatus === 'taken' && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px 12px',
                backgroundColor: '#fee2e2',
                border: '1px solid #ef4444',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#dc2626',
                textAlign: 'center',
              }}
            >
              ❌ 이미 사용 중인 닉네임입니다. 다른 닉네임을 사용해주세요.
            </div>
          )}
        </form>

        {/* SNS 로그인 영역 */}
        <div style={{ display: 'flex', alignItems: 'center', margin: 'var(--space-6) ' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--gray-300)' }}></div>
          <span style={{ padding: '0 var(--space-4)', fontSize: '14px' }}>또는</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--gray-300)' }}></div>
        </div>
        {/* 카카오 로그인 버튼 : 오류 메시지는 사용자도 볼 수 있어야 함*/}
        <KakaoLoginButton onError={error => setMsg(`카카오 로그인 오류 : ${error}`)} />

        {/* 메시지 출력 */}
        {msg && (
          <p
            style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: msg.includes('성공') ? 'var(--success-50)' : '#fef2f2',
              color: msg.includes('성공') ? 'var(--success-600)' : '#dc2626',
              border: `1px solid ${msg.includes('성공') ? 'var(--success-600)' : '#dc2626'}`,
            }}
          >
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}

export default SignUpPage;
```

- /src/contexts/Authcontext.tsx 업데이트

```tsx
/**
 * 주요기능
 * - 사용자 세션관리
 * - 로그인/회원가입/로그아웃
 * - 사용자 인증 정보 상태 변경 감시
 * - 전역 인증 상태를 컴포넌트에 반영
 */

import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { supabase } from '../lib/supabase';
import type { DeleteRequestInsert } from '../types/TodoType';
import { redirect } from 'react-router-dom';

// 1. 인증 컨텍스트 타입
type AuthContextType = {
  // 현재 사용자의 세션정보 (로그인 상태, 토큰)
  session: Session | null;
  // 현재 로그인 된 사용자 정보
  user: User | null;
  // 회원 가입 함수(이메일, 비밀번호) : 비동기라서
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  // 회원 로그인 함수(이메일, 비밀번호) : 비동기라서
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  // 이메일 중복 확인 함수
  checkEmailExists: (email: string) => Promise<{ exists: boolean; error?: string }>;
  // 닉네임 중복 확인 함수
  checkNicknameExists: (nickname: string) => Promise<{ exists: boolean; error?: string }>;
  // 카카오 로그인 함수
  signInWithKakao: () => Promise<{ error?: string }>;
  // 카카오 계정 연동 해제 함수
  unlinkKakaoAccount: () => Promise<{ error?: string; success?: boolean; message?: string }>;

  // 회원 로그아웃
  signOut: () => Promise<void>;
  // 회원정보 로딩 상태
  loading: boolean;
  // 회원탈퇴 기능
  deleteAccount: () => Promise<{ error?: string; success?: boolean; message?: string }>;
};

// 2. 인증 컨텍스트 생성 (인증 기능을 컴포넌트에서 활용하게 해줌.)
const AuthContext = createContext<AuthContextType | null>(null);

// 3. 인증 컨텍스트 프로바이더
export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // 현재 사용자 세션
  const [session, setSession] = useState<Session | null>(null);
  // 현재 로그인한 사용자 정보
  const [user, setUser] = useState<User | null>(null);
  // 로딩 상태 추가 : 초기 실행시 로딩 시킴, true
  const [loading, setLoading] = useState<boolean>(true);

  // 초기 세션 로드 및 인증 상태 변경 감시
  useEffect(() => {
    // 세션을 초기에 로딩을 한 후 처리 한다.
    const loadSession = async () => {
      try {
        setLoading(true); // 로딩중
        const { data } = await supabase.auth.getSession();
        setSession(data.session ? data.session : null);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.log(error);
      } finally {
        // 로딩완료
        setLoading(false);
      }
    };
    loadSession();

    // // 기존 세션이 있는지 확인
    // supabase.auth.getSession().then(({ data }) => {
    //   setSession(data.session ? data.session : null);
    //   setUser(data.session?.user ?? null);
    // });
    // 인증상태 변경 이벤트를 체크(로그인, 로그아웃, 토큰 갱신 등의 이벤트 실시간 감시)
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });
    // 컴포넌트가 제거되면 이벤트 체크 해제 : cleanUp
    return () => {
      // 이벤트 감시 해제.
      data.subscription.unsubscribe();
    };
  }, []);

  // 회원 가입 함수(이메일, 비밀번호) : 비동기라서
  const signUp: AuthContextType['signUp'] = async (email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // 회원 가입 후 이메일로 인증 확인시 리다이렉트 될 URL
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      return { error: error.message };
    }
    // 우리는 이메일 확인을 활성화 시켰습니다.
    // 이메일 확인 후 인증 전까지는 아무것도 넘어오지 않습니다.
    return {};
  };

  // 회원 로그인 함수(이메일, 비밀번호) : 비동기라서
  const signIn: AuthContextType['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password, options: {} });
    if (error) {
      return { error: error.message };
    }
    return {};
  };

  // 이메일 중복 확인 함수
  // - 회원가입 시에 이메일을 먼저 파악한 후, 회원가입 시도
  // - 결과에 따라서 메시지를 다양하게 출력을 한다 라는 시나리오
  // - 좀 위험한 것은 error.message 를 문자열로 비교한 것이 좀 불안함
  const checkEmailExists: AuthContextType['checkEmailExists'] = async email => {
    // PostgreSQL Function
    try {
      const { error, data } = await supabase.rpc('check_email_exists', { email_param: email });
      if (error) {
        return { exists: false, error: '이메일 확인 중 오류가 발생했습니다.' };
      }
      return { exists: data.exists };
    } catch (err) {
      console.log('이메일 중복 확인 오류', err);
      return { exists: false, error: '이메일 중복 확인 중 오류가 발생했습니다.' };
    }
  };

  // 닉네임 중복 확인 함수
  const checkNicknameExists: AuthContextType['checkNicknameExists'] = async nickname => {
    // PostgreSQL Function
    try {
      const { error, data } = await supabase.rpc('check_nickname_exists', {
        nickname_param: nickname,
      });
      if (error) {
        return { exists: false, error: '닉네임 확인 중 오류가 발생했습니다.' };
      }
      return { exists: data.exists };
    } catch (err) {
      console.log('닉네임 중복 확인 오류', err);
      return { exists: false, error: '닉네임 중복 확인 중 오류가 발생했습니다.' };
    }
  };

  // 카카오 로그인 함수
  const signInWithKakao: AuthContextType['signInWithKakao'] = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        // 로그인 실행후 이동옵션
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    // 오류발생시 체크 해보자
    if (error) {
      return { error: error.message };
    }
    console.log('카카오 로그인 성공 : ', data);
    return {};
  };

  // 카카오 계정 연동 해제 함수
  const unlinkKakaoAccount: AuthContextType['unlinkKakaoAccount'] = async () => {
    try {
      // 카카오 로그인 사용자인지 확인
      if (user?.app_metadata.provider !== 'kakao') {
        return { error: '카카오 로그인 사용자가 아닙니다.' };
      }
      // supabase 에서 카카오 계정 연동 해제
      // 사용자의 카카오 identity 찾기
      const kakaoIdentity = user.identities?.find(item => item.provider === 'kakao');
      if (!kakaoIdentity) {
        return { error: '카카오 계정 연동 정보를 찾을 수 없습니다.' };
      }
      // 사용자의 카카오 identity 찾기 성공
      const { error } = await supabase.auth.unlinkIdentity(kakaoIdentity);
      if (error) {
        console.log(' 카카오 계정 연동 해제 실패:', error.message);
        return { error: '카카오 계정 연동 해제에 실패하였습니다.' };
      }
      // 계정 해제에 성공했다면
      return {
        success: true,
        message: '카카오 계정 연동이 해제되었습니다. 다시 로그인해주세요.',
      };
    } catch (err) {
      console.log(`카카오 계정 연동 해제 오류 : `, err);
      return { error: '카카오 계정 연동 해제 중 오류가 발생했습니다.' };
    }
  };

  // 회원 로그아웃
  const signOut: AuthContextType['signOut'] = async () => {
    await supabase.auth.signOut();
  };

  // 회원 탈퇴기능 (카카오 회원탈퇴 기능도 추가)
  const deleteAccount: AuthContextType['deleteAccount'] = async () => {
    try {
      // 카카오 로그인 사용자인지 확인
      const isKakaoUser = user?.app_metadata.provider === 'kakao';

      // 기존에 사용한 데이터들을 먼저 정리한다.
      const { error: profileError } = await supabase.from('profiles').delete().eq('id', user?.id);
      if (profileError) {
        console.log('프로필 삭제 실패 : ', profileError.message);
        return { error: '프로필 삭제에 실패했습니다.' };
      }

      // 탈퇴 신청 데이터 추가
      // account_deletion_requests 에  Pending 으로 Insert 합니다.
      // 등록할 삭제 데이터
      const deleteInfo: DeleteRequestInsert = {
        user_id: user?.id,
        reason: isKakaoUser ? '카카오 회원 탈퇴 요청' : '사용자 요청',
        status: 'pending',
        user_email: user?.email as string,
      };
      const { error: deleteRequestsError } = await supabase
        .from('account_deletion_requests')
        .insert([{ ...deleteInfo }]);

      if (deleteRequestsError) {
        console.log('탈퇴 목록 추가에 실패 : ', deleteRequestsError.message);
        return { error: '탈퇴 목록 추가에 실패했습니다.' };
      }

      // 혹시 SMTP 서버가 구축이 가능하다면 관리자에게 이메일 전송하는 자리

      // 로그아웃 시켜줌
      await signOut();

      return {
        success: true,
        message: isKakaoUser
          ? '카카오 계정 연동이 해제되었습니다. 계정 삭제가 요청되었습니다.'
          : '계정 삭제가 요청되었습니다. 관리자 승인 후 완전히 삭제됩니다.',
      };
    } catch (err) {
      console.log('탈퇴 요청 기능 오류 : ', err);
      return { error: '계정 탈퇴 처리 중 오류가 발생하였습니다.' };
    }
  };

  const value: AuthContextType = {
    signUp,
    signIn,
    checkEmailExists,
    checkNicknameExists,
    signInWithKakao,
    unlinkKakaoAccount,
    signOut,
    user,
    session,
    loading,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// const {signUp, signIn, signOut, user, session} = useAuth()
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('AuthContext 가 없습니다.');
  }
  return ctx;
};
```

### 6.2. 시나리오 1번 : 카카오 회원가입하기 > 이메일 가입하기

### 6.3. 시나리오 2번 : 이메일 가입하기 > 카카오 회원가입하기

### 6.3. 시나리오 2번 : 관리자는 탈퇴를 못한다.

## 7. 버그 수정

- 카카오 로그인 시 인증코드가 제대로 작동 안되는 경우 발생
- /src/lib/profile.ts

```ts
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
    // 인증 상태 확인
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.log('프로필 생성 실패 : 인증되지 않은 사용자');
      return false;
    }

    // 현재 사용자 ID와 프로필 ID가 일치 하는지 확인
    if (sessionData.session.user.id !== newUserProfile.id) {
      console.log('프로필 생성 실패 : 사용자 ID 불일치');
      return false;
    }

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

// 사용자 프로필 조회
const getProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { error, data } = await supabase.from('profiles').select('*').eq('id', userId).single();
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
const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
  try {
    // 파일 타입 검사
    // 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`지원하지 않는 파일 형식입니다. 허용 형식: ${allowedTypes.join(', ')}`);
    }
    // 파일 크기 검증 (5MB 제한)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error(`파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.`);
    }

    // 기존에 만약 아바타 이미지가 있으면 무조건 삭제 부터합니다.
    const result = await cleanupUserAvatars(userId);
    if (!result) {
      console.log('파일 못 지웠어요.');
    }

    // 파일명이 중복되지 않도록 이름을 생성함.
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // storage 에 bucket 이 존재하는지 검사
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      throw new Error(`Stroage 버킷 확인 실패 : ${bucketError.message}`);
    }
    // bucket 들의 목록 전달 {} 형태로 나옴. user-images 라는 이름에 업로드
    let profileImagesBucket = buckets.find(item => item.name === 'user-images');
    if (!profileImagesBucket) {
      throw new Error('user-images 버킷이 존재하지 않음. 버킷생성 필요!!');
    }
    // 파일업로드 : upload(파일명, 실제파일, 옵션)
    const { data, error } = await supabase.storage.from('user-images').upload(filePath, file, {
      cacheControl: '3600', // 3600 초는 1시간 동안 파일 캐시 적용
      upsert: false, // 동일한 파일명은 덮어쒸운다.
    });

    if (error) {
      throw new Error(`업로드 실패 : ${error.message}`);
    }

    // https 문자열로 주소를 알아내서 활용
    const {
      data: { publicUrl },
    } = supabase.storage.from('user-images').getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    throw new Error(`아바타 업로드 오류가 발생했습니다. : ${error}`);
  }
};
// 아바타 이미지는 한장을 유지해야 하므로 모두 제거하는 기능 필요
const cleanupUserAvatars = async (userId: string): Promise<boolean> => {
  try {
    const { data, error: listError } = await supabase.storage
      .from('user-images')
      .list('avatars', { limit: 1000 });
    if (listError) {
      console.log(`목록 요청 에러 : ${listError.message}`);
      return false;
    }
    // userId 에 해당하는 것만 필터링 해서 삭제해야 함.
    if (data && data.length > 0) {
      const userFile = data.filter(item => item.name.startsWith(`${userId}-`));
      if (userFile && userFile.length > 0) {
        const filePaths = userFile.map(item => `avatars/${item.name}`);
        const { error: removeError } = await supabase.storage.from('user-images').remove(filePaths);
        if (removeError) {
          console.log(`파일 삭제 에러 : ${removeError.message}`);
          return false;
        }
        return true;
      }
    }
    return true;
  } catch (error) {
    console.log(`아바타 이미지 전체 삭제 오류 : ${error}`);
    return false;
  }
};

// 사용자 프로필 이미지 제거
const removeAvatar = async (userId: string): Promise<boolean> => {
  try {
    // 현재 로그인 한 사용자의 avartar_url 을 읽어와야 합니다.
    // 여기서 파일명을 추출함.
    const profile = await getProfile(userId);
    // 사용자가 avatar_url 이 없다면
    if (!profile?.avatar_url) {
      return true; // 작업완료
    }
    // 1. 만약 avatar_url 이 존재하면 이름 파악, 파일 삭제
    let deleteSuccess = false;

    try {
      // url 에 파일명을 찾아야 함. (url 로 변환하면 path 와 파일구분 수월함)
      const url = new URL(profile.avatar_url);
      const pathParts = url.pathname.split('/');
      const publicIndex = pathParts.indexOf('public');
      if (publicIndex !== -1 && publicIndex + 1 < pathParts.length) {
        const bucketName = pathParts[publicIndex + 1];
        const filePath = pathParts.slice(publicIndex + 2).join('/');
        // 실제로 찾아낸 bucketName 과  filePath 로 삭제
        const { data, error } = await supabase.storage.from(bucketName).remove([filePath]);
        if (error) {
          throw new Error('파일을 찾았지만, 삭제에는 실패했어요.');
        }
        // 파일 삭제 성공
        deleteSuccess = true;
      }
    } catch (err) {
      console.log(err);
    }

    // 2. 만약 avatar_url 을 제대로 파싱 못했다면?
    if (!deleteSuccess) {
      try {
        // 전체 목록을 일단 읽어옴.
        const { data: files, error: listError } = await supabase.storage
          .from('user-images')
          .list('avatars', { limit: 1000 });

        if (!listError && files && files.length > 0) {
          const userFiles = files.filter(item => item.name.startsWith(`${userId}-`));
          if (userFiles.length > 0) {
            const filePath = userFiles.map(item => `avatars/${item.name}`);
            const { error } = await supabase.storage.from('user-images').remove(filePath);
            if (!error) {
              deleteSuccess = true;
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
    }

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

// 내보내기
export { createProfile, getProfile, updateProfile, deleteProfile, uploadAvatar, removeAvatar };
```

- 카카오 로그인 성공 후 리다이렉트 페이지에서 세션 정보를 못 읽는 경우 발생
- src/pages/AuthCallback.tsx

```tsx
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
  const extractNickname = (user: any, isKakaoLogin: boolean): string => {
    let nickname = user.user_metadata.nickname;
    if (isKakaoLogin && !nickname) {
      nickname =
        user.app_metadata.full_name ||
        user.app_metadata.name ||
        user.email?.split('@')[0] ||
        '카카오사용자';
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
      // 카카오로 로그인 했는지 확인 필요 (kakao 는 Supabase 에서 정한 글자)
      const isKakaoLogin = user.app_metadata.provider === 'kakao';
      const loginType = isKakaoLogin ? '카카오 로그인' : '이메일 인증';

      // 카카오 로그인 이메일 중복 확인 (임시 비활성화)
      if (isKakaoLogin && user.email) {
        console.log('카카오 로그인 - 이메일 중복 확인 비활성화');
        console.log(user.email);
      }

      // 닉네임 추출
      const nickname = extractNickname(user, isKakaoLogin);

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
```

## 8. 기능 보완

- 카카오 로그인 및 회원가입 성공 메시지 출력
- /src/pages/SignUpPage.tsx 업데이트

```tsx
{
  /* 카카오 로그인 버튼 : 오류 메시지는 사용자도 볼 수 있어야 함*/
}
<KakaoLoginButton
  onError={error => setMsg(`카카오 로그인 오류 : ${error}`)}
  onSuccess={message => setMsg(message)}
/>;
```

- /src/components/KakoLoginButton.tsx 업데이트

```tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

// 오류 메시지를 사용한 화면에 보여줄 함수
interface KakaoLoginButtonProps {
  children?: React.ReactNode;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}
const KakaoLoginButton = ({ onError, onSuccess }: KakaoLoginButtonProps) => {
  // 카카오 로그인 사용
  const { signInWithKakao } = useAuth();
  // 카카오 로그인 실행
  const handleKakaoLogin = async () => {
    try {
      const { error } = await signInWithKakao();

      if (error) {
        console.log('카카오로그인 에러 메시지 : ', error);
        if (onError) {
          onError(error);
        }
      } else {
        console.log('카카오 로그인 성공');
        if (onSuccess) {
          onSuccess('카카오 로그인이 성공했습니다.');
        }
      }
    } catch (err) {
      console.log('카카오 로그인 오류 : ', err);
    }
  };

  return (
    <button
      type="button"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
        padding: '12px 16px',
        backgroundColor: '#fee500',
        color: '#000',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.backgroundColor = '#fdd835';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = '#fee500';
      }}
      onClick={handleKakaoLogin}
    >
      {/* 카카오 아이콘 SVG */}
      <svg
        width="21"
        height="19"
        viewBox="0 0 21 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10.4036 0.878957C5.10601 0.894207 0.821172 4.29987 0.833339 8.48454C0.841089 11.1754 2.62367 13.5337 5.30359 14.8705L4.40926 18.2505C4.39025 18.3067 4.38996 18.3676 4.40845 18.4241C4.42694 18.4805 4.46321 18.5295 4.51183 18.5636C4.56045 18.5977 4.6188 18.6152 4.67817 18.6133C4.73754 18.6115 4.79472 18.5906 4.84117 18.5535L8.72234 15.9175C9.29383 15.9974 9.87028 16.0366 10.4473 16.0349C15.7448 16.0196 20.0298 12.6148 20.0178 8.42946C20.0058 4.24412 15.7012 0.86379 10.4036 0.878957ZM5.589 10.4772C5.58984 10.7732 5.41459 10.9578 5.13142 10.9586C4.84826 10.9595 4.67234 10.7759 4.6715 10.4799L4.66192 7.14779L3.69684 7.15062C3.39409 7.15146 3.28601 6.92721 3.28542 6.73487C3.28362 6.68019 3.2929 6.62571 3.31268 6.5747C3.33247 6.52369 3.36236 6.47721 3.40056 6.43805C3.43876 6.39888 3.48448 6.36784 3.53498 6.34679C3.58548 6.32573 3.63971 6.31511 3.69442 6.31554L6.54151 6.30721C6.59625 6.30639 6.65059 6.31665 6.70127 6.33735C6.75195 6.35806 6.79792 6.38879 6.83643 6.4277C6.87494 6.46662 6.90519 6.51291 6.92536 6.56381C6.94554 6.6147 6.95523 6.66914 6.95384 6.72387C6.95434 6.91612 6.84734 7.14104 6.54392 7.14187L5.57942 7.14471L5.589 10.4772ZM10.0299 10.9449C9.92975 10.9532 9.82983 10.926 9.74777 10.8679C9.66571 10.8099 9.60677 10.7247 9.58134 10.6275L9.37892 10.0005L7.46167 10.006L7.25792 10.627C7.23609 10.7253 7.17957 10.8125 7.09871 10.8726C7.01784 10.9327 6.91805 10.9616 6.81759 10.9541C6.75995 10.9567 6.70239 10.9477 6.64827 10.9277C6.59415 10.9077 6.54456 10.8771 6.5024 10.8377C6.46024 10.7984 6.42636 10.751 6.40274 10.6983C6.37912 10.6457 6.36623 10.5889 6.36484 10.5312C6.36553 10.4619 6.37968 10.3935 6.40651 10.3296L7.72817 6.79779C7.82284 6.53887 8.05134 6.26221 8.40917 6.26121C8.72359 6.26029 8.97326 6.45404 9.09409 6.79279L10.3951 10.3115C10.425 10.3868 10.4427 10.4662 10.4477 10.547C10.4469 10.6008 10.4355 10.6538 10.414 10.703C10.3925 10.7523 10.3613 10.7967 10.3224 10.8338C10.2835 10.8708 10.2376 10.8997 10.1874 10.9188C10.1371 10.9379 10.0836 10.9468 10.0299 10.9449ZM13.5538 10.4825C13.5516 10.5376 13.5385 10.5918 13.5153 10.6419C13.4922 10.692 13.4593 10.737 13.4187 10.7743C13.378 10.8117 13.3304 10.8406 13.2785 10.8595C13.2267 10.8784 13.1716 10.8869 13.1164 10.8844L11.4063 10.8892C11.1063 10.8901 10.926 10.7007 10.9251 10.3828L10.9146 6.73279C10.9138 6.43729 11.0891 6.25312 11.3722 6.25237C11.6553 6.25162 11.8313 6.43462 11.8323 6.73021L11.8418 10.053L13.1141 10.0493C13.175 10.0463 13.2359 10.0561 13.2928 10.0779C13.3497 10.0998 13.4015 10.1332 13.4448 10.1761C13.4828 10.2171 13.5121 10.2654 13.5308 10.3181C13.5495 10.3708 13.5573 10.4267 13.5538 10.4825ZM17.3744 10.5632C17.3396 10.8975 17.0161 10.9243 16.9176 10.9245C16.8937 10.9246 16.8697 10.9235 16.8459 10.9212C16.6764 10.9045 16.5808 10.7981 16.4031 10.5596L15.1929 8.91979L14.8642 9.25696L14.8678 10.4923C14.8679 10.5516 14.856 10.6103 14.8329 10.6648C14.8097 10.7194 14.7757 10.7687 14.733 10.8098C14.6903 10.8509 14.6397 10.8829 14.5842 10.9039C14.5288 10.9249 14.4697 10.9344 14.4104 10.932C14.1354 10.9328 13.9506 10.757 13.9498 10.4949L13.9389 6.69696C13.9372 6.63652 13.9478 6.57637 13.9703 6.52024C13.9928 6.46411 14.0266 6.4132 14.0696 6.37068C14.1126 6.32816 14.1638 6.29494 14.2202 6.27308C14.2766 6.25123 14.3368 6.2412 14.3973 6.24362C14.4579 6.2395 14.5188 6.24826 14.5758 6.26932C14.6329 6.29038 14.6848 6.32327 14.7283 6.36584C14.7717 6.4084 14.8056 6.45966 14.8279 6.51627C14.8501 6.57288 14.8601 6.63355 14.8572 6.69429L14.8613 8.16471L16.4726 6.47537C16.5188 6.42414 16.575 6.38279 16.6376 6.35381C16.7002 6.32482 16.7681 6.3088 16.8371 6.30671C17.0588 6.31196 17.2823 6.45862 17.2772 6.72854C17.2772 6.85471 17.2022 6.93821 17.0522 7.10446C17.0183 7.14212 16.9808 7.18362 16.9403 7.23012L15.8389 8.34779L17.1505 10.0549C17.286 10.2306 17.3983 10.376 17.3744 10.5632Z"
          fill="#3B1E1E"
        />
      </svg>
      카카오 로그인
    </button>
  );
};

export default KakaoLoginButton;
```
