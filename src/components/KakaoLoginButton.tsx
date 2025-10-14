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
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 3C6.48 3 2 6.48 2 10.5C2 13.52 4.5 16.1 8 17.5L7 21L10.5 18.5C11.3 18.7 12.1 18.8 13 18.8C18.52 18.8 23 15.32 23 11.3C23 7.28 18.52 3.8 13 3.8C12.7 3.8 12.4 3.8 12.1 3.9C12.1 3.6 12 3.3 12 3Z"
          fill="currentColor"
        />
      </svg>
      카카오 로그인
    </button>
  );
};

export default KakaoLoginButton;
