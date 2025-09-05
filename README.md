# Supabase Auth(인증)

- https://supabase.com/dashboard/sign-in?returnTo=%2Forganizations

## 1. Auth 메뉴 확인

- 왼쪽 아이콘 중 `Authentication` 선택

### 1.1. Users 테이블 확인

- 회원에 대한 테이블명은 미리 생성이 되어있음
- `Users` 테이블이 이미 존재
- 회원가입을 하게 되면 `Users 테이블에 자동으로 추가`가 됩니다.

### 1.2. Sign In / Providers 메뉴

- Auth Providers : 회원가입 여러가지 항목이 미리 제공
- `Email 항목` 이 활성화 되어 있는지 확인

### 1.3. Emails 메뉴 확인

- SMTP : Simple Mail Transfer Protocol (이메일 통신 약속)
- ex) http : HyperText Transfer Protocol
- ex) ftp : file Transfer Protocol
- Supabase 에는 이메일 인증을 테스트만 제공합니다. (`1시간에 3번만 사용가능`)
- 추후에 SMTP 서버 구축 또는 Google Service, `Sendmail`,`resend.com` 을 무료로 활용가능
- Confirm signup 탭 : 회원가입시 전달되는 인증메일 제목, 내용을 작성함

### 1.4. URL Configuration 메뉴

- Site URL : `http://localhost:5173` (추후 Vercel 주소로 변경예정)
- Redirect URLs : `http://localhost:5173`, `http://localhost:3000` 등 입력

## 2. Auth 적용하기

- /src/lib/supabase.ts

```ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// auth 기능 추가하기
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 웹 브라우저에 탭이 열려있는 동안 인증 토큰 자동 갱신
    autoRefreshToken: true,
    // 사용자 세션정보를 LocalStorage 에 저장해서 웹 브라우저 새로고침시에도 로그인 유지
    persistSession: true,
    // URL 인증 세션을 파악해서 OAuth 로그인 동의 콜백을 처리한다.
    detectSessionInUrl: true,
  },
});
```

## 2. Auth 인증정보 관리 (전역 Session 관리)

- /src/contexts/AuthContext.tsx 파일 생성

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

// 1. 인증 컨텍스트 타입
type AuthContextType = {
  // 현재 사용자의 세션정보 (로그인 상태, 토큰)
  session: Session | null;
  // 현재 로그인 된 사용자 정보
  user: User | null;
  // 회원가입 함수(이메일, 비밀번호)
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  // 회원 로그인 함수(이메일, 비밀번호) : 비동기라서
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  // 로그아웃
  signOut: () => Promise<void>;
};

// 2. 인증 컨텍스트 생성 (인증 기능을 컴포넌트에서 활용하게 해줌)
const AuthContext = createContext<AuthContextType | null>(null);

// 3. 인증 컨텍스트 프로바이더
export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // 현재 사용자 세션
  const [session, setSession] = useState<Session | null>(null);
  // 현재 로그인한 사용자 정보
  const [user, setUser] = useState<User | null>(null);
  // 초기 세션 로드 및 인증 상태 변경 검시
  useEffect(() => {
    // 기존 세션이 있는지 확인
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ? data.session : null);
      setUser(data.session?.user ?? null);
    });
    // 인증상태 변경 이벤트를 체크 (로그인, 로그아웃, 토큰 갱신 등의 이벤트 실시간 감시)
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });
    // 컴포넌트가 제거되면 이벤트 체크 해제 : cleanUp
    return () => {
      // 이벤트 감시 해제
      data.subscription.unsubscribe();
    };
  }, []);
  // 회원 가입 함수(이메일, 비밀번호) : 비동기라서
  const signUp: AuthContextType['signUp'] = async (email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // 회원가입 후 이메일로 인증 확인시 리다이렉트 될 URL
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
  // 회원 로그아웃
  const signOut: AuthContextType['signOut'] = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ signUp, signIn, signOut, user, session }}>
      {children}
    </AuthContext.Provider>
  );
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

## 4. 회원가입 폼

- /src/pages/SignUpPage.tsx 파일 생성

```tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function SignUpPage() {
  const { signUp } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [pw, setPw] = useState<string>('');
  const [msg, setMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // 웹브라우저 갱신 막기
    e.preventDefault();
    // 회원가입 하기
    const { error } = await signUp(email, pw);
    if (error) {
      setMsg(`회원가입 오류 : ${error}`);
    } else {
      setMsg(`회원가입이 성공했습니다. 이메일 인증 링크를 확인해 주세요.`);
    }
  };

  return (
    <div>
      <h2>Todo 서비스 회원가입</h2>
      <div>
        <form onSubmit={handleSubmit}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} />
          <button type="submit">회원가입</button>
        </form>
        <p>{msg}</p>
      </div>
    </div>
  );
}

export default SignUpPage;
```

## 5. 로그인 폼

- /src/pages/SignInPage.tsx 파일 생성

```tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function SignInPage() {
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
    }
  };
  return (
    <div>
      <h2>로그인페이지</h2>
      <div>
        <form onSubmit={handleSubmit}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} />
          <button type="submit">로그인</button>
        </form>
        <p>{msg}</p>
      </div>
    </div>
  );
}

export default SignInPage;
```

## 6. 할일 페이지 생성

- /src/pages/TodosPage.tsx 파일 생성

```tsx
import React from 'react';
import { TodoProvider } from '../contexts/TodoContext';
import TodoWrite from '../components/todos/TodoWrite';
import TodoList from '../components/todos/TodoList';

function TodoPage() {
  return (
    <div>
      <h2>할 일</h2>
      <TodoProvider>
        <div>
          <TodoWrite />
        </div>
        <div>
          <TodoList />
        </div>
      </TodoProvider>
    </div>
  );
}

export default TodoPage;
```

## 7. 인증 페이지

- /src/pages/AuthCallback.tsx 파일 생성

```tsx
import React, { useEffect, useState } from 'react';
/**
 * - 인증 콜백 URL 처리
 * - 사용자에게 인증 진행 상태 안내
 * - 자동 인증 처리 완료 안내
 */

function AuthCallback() {
  const [msg, setMsg] = useState<string>('인증 처리 중 ...');
  useEffect(() => {
    const timer = setTimeout(() => {
      setMsg('🎉이메일 인증 완료. 홈으로 이동하세요.');
    }, 1500);
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

## 8. 라우터 구성하기 (메뉴 구성하기)

- App.tsx

```tsx
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import AuthCallback from './pages/AuthCallback';
import TodoPage from './pages/TodoPage';

const TopBar = () => {
  const { signOut, user } = useAuth();
  return (
    <nav style={{ display: 'flex', gap: 20, justifyContent: 'flex-end', padding: 40 }}>
      <Link to="/">홈</Link>
      {user && <Link to="/todos">할 일</Link>}
      {!user && <Link to="/signup">회원가입</Link>}
      {!user && <Link to="/signin">로그인</Link>}
      {user && <button onClick={signOut}>로그아웃</button>}
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
            <Route path="/todos" element={<TodoPage />} />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
```

## 9. Auth 에 따라서 라우터 처리하기 (보호 라우터)

- 인증된 사용자 즉, 로그인 사용자 허가 페이지 처리하기
- `/src/components/Protected.tsx 파일` 생성

```tsx
import type { PropsWithChildren } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

/**
 * 로그인 한 사용자가 접근할 수 있는 페이지
 * - 사용자 프로필 페이지
 * - 관리자 대시보드 페이지
 * - 개인 설정 페이지
 * - 구매 내역 페이지 등등
 */

const Protected: React.FC<PropsWithChildren> = ({ children }) => {
  const { user } = useAuth();
  // 로그인이 안되어서 user 정보가 없으면 로그인 페이지로 이동
  if (!user) {
    return <Navigate to={'/signin'} replace />;
  }
  return <div>{children}</div>;
};

export default Protected;
```

## 10. App.tsx 에 Protected 적용하기

```tsx
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import TodoPage from './pages/TodoPage';
import Protected from './components/Protected';
import AuthCallback from './pages/AuthCallback';

const TopBar = () => {
  const { signOut, user } = useAuth();
  return (
    <nav style={{ display: 'flex', gap: 20, justifyContent: 'flex-end', padding: 40 }}>
      <Link to="/">홈</Link>
      {user && <Link to="/todos">할 일</Link>}
      {!user && <Link to="/signup">회원가입</Link>}
      {!user && <Link to="/signin">로그인</Link>}
      {user && <button onClick={signOut}>로그아웃</button>}
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
                  <TodoPage />
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

## 11. 새로고침을 하거나, 직접 주소를 입력시에도 사용자 정보 유지하기

- 유지는 되고 있으나, 리액트에서 처리순서가 늦음
- AuthContex 에 loading 이라는 처리를 진행해 주고 활용함

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
  // 회원 로그아웃
  signOut: () => Promise<void>;
  // 회원정보 로딩 상태
  loading: boolean;
};

// 2. 인증 컨텍스트 생성 (인증 기능을 컴포넌트에서 활용하게 해줌)
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
    // 세션을 초기에 로딩을 한 후 처리한다.
    const loadSession = async () => {
      try {
        setLoading(true); // 로딩중
        const { data } = await supabase.auth.getSession();
        setSession(data.session ? data.session : null);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.log(error);
      } finally {
        // 로딩 완료
        setLoading(false);
      }
    };
    loadSession();

    // // 기존 세션이 있는지 확인
    // supabase.auth.getSession().then(({ data }) => {
    //   setSession(data.session ? data.session : null);
    //   setUser(data.session?.user ?? null);
    // });
    // 인증상태 변경 이벤트를 체크 (로그인, 로그아웃, 토큰 갱신 등의 이벤트 실시간 감시)
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });
    // 컴포넌트가 제거되면 이벤트 체크 해제 : cleanUp
    return () => {
      // 이벤트 감시 해제
      data.subscription.unsubscribe();
    };
  }, []);
  // 회원 가입 함수(이메일, 비밀번호) : 비동기라서
  const signUp: AuthContextType['signUp'] = async (email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // 회원가입 후 이메일로 인증 확인시 리다이렉트 될 URL
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
  // 회원 로그아웃
  const signOut: AuthContextType['signOut'] = async () => {
    await supabase.auth.signOut();
  };  const value: AuthContextType = {
    signUp,
    signIn,
    signOut,
    user,
    session,
    loading,
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

## 12. Protected 에 loading 값 활용하기

- Auth 인증 후 `새로고침` 또는 `주소 직접 입력` 시 `인증 상태를 읽기 위한 시간 확보`
- AuthContext.tsx 에서 읽어들이기 전까지 Loading 을 활성화 함.

```tsx
import type { PropsWithChildren } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

/**
 * 로그인 한 사용자가 접근할 수 있는 페이지
 * - 사용자 프로필 페이지
 * - 관리자 대시보드 페이지
 * - 개인 설정 페이지
 * - 구매 내역 페이지  등등
 */
const Protected: React.FC<PropsWithChildren> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // 사용자 정보가 로딩중이라면
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.7)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div>로딩중...</div>
      </div>
    );
  }

  // 로그인이 안되어서 user 정보가 없으면 로그인 페이지로 이동
  if (!user) {
    return <Navigate to={'/signin'} replace />;
  }
  return <div>{children}</div>;
};

export default Protected;
```
