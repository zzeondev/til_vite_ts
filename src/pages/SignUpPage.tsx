import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { createProfile } from '../lib/profile';
import type { ProfileInsert } from '../types/TodoType';

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
      },
    });

    if (error) {
      setMsg(`회원가입 오류 : ${error}`);
    } else {
      // 회원가입 성공했으므로 profiles 도 채워준다.
      if (data?.user?.id) {
        // 프로필을 추가한다.
        const newUser: ProfileInsert = { id: data.user.id, nickname: nickName };
        const result = await createProfile(newUser);
        if (result) {
          // 프로필 추가가 성공한 경우
          setMsg(`회원가입 및 프로필 생성에 성공했습니다. 이메일 인증 링크를 확인해 주세요.`);
        } else {
          // 프로필 추가가 실패한 경우
          setMsg(`회원가입이 성공, 하지만, 프로필 생성 실패했습니다.`);
        }
      } else {
        setMsg(`회원가입이 성공했습니다. 이메일 인증 링크를 확인해 주세요.`);
      }
    }
  };

  return (
    <div>
      <h2>Todo 서비스 회원가입</h2>
      <div>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="이메일"
          />
          <br />
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="비밀번호"
          />
          <br />
          <input
            type="text"
            value={nickName}
            onChange={e => setNickName(e.target.value)}
            placeholder="닉네임"
          />
          <br />
          <button type="submit">회원가입</button>
        </form>
        <p>{msg}</p>
      </div>
    </div>
  );
}

export default SignUpPage;
