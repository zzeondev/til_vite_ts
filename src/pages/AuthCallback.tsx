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
