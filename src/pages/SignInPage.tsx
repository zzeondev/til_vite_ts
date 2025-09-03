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
