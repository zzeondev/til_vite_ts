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
  // 회원 기본 정보 (카카오, 구글 회원 탈퇴 추가)
  const { user, deleteAccount, unlinkKakaoAccount, unlinkGoogleAccount, changePassword } =
    useAuth();
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

  // 비밀번호 변경 관련 상태
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordMessage, setPasswordMessage] = useState<string>('');

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
        window.location.href = '/signin';
      } else if (result.error) {
        alert(`연동 해제 실패: ${result.error}`);
      }
    }
  };

  // 구글 계정 연동 해제
  const handleUnlinkGoogle = async () => {
    const message =
      '구글 계정 연동을 해제하시겠습니까? \n\n 연동 해제 후에는 구글로 다시 로그인 할 수 없습니다.';
    const isConfirm = confirm(message);

    if (isConfirm) {
      const result = await unlinkGoogleAccount();
      if (result.success) {
        alert(result.message);
        // 연동 해제 후 로그아웃 처리
        window.location.href = '/signin';
      } else if (result.error) {
        alert(`연동 해제 실패: ${result.error}`);
      }
    }
  };

  // 비밀번호 변경
  const handlePasswordChange = async () => {
    // 입력값 검증
    if (!newPassword.trim()) {
      setPasswordMessage('새 비밀번호를 입력해주세요.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage('비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      const result = await changePassword(newPassword);
      if (result.success) {
        setPasswordMessage('비밀번호가 성공적으로 변경되었습니다.');
        // 폼 초기화
        setNewPassword('');
        setConfirmPassword('');
        // 3초 후 메시지 자동 제거
        setTimeout(() => {
          setPasswordMessage('');
        }, 3000);
      } else if (result.error) {
        setPasswordMessage(`비밀번호 변경 실패: ${result.error}`);
      }
    } catch (err) {
      setPasswordMessage('비밀번호 변경 중 오류가 발생했습니다.');
    }
  };

  // 회원탈퇴
  const handleDeleteUser = () => {
    // 카카오 또는 구글 로그인 사용자인지 확인
    const isKakaoUser = user?.app_metadata.provider === 'kakao';
    const isGoogleUser = user?.app_metadata.provider === 'google';

    const message: string = isKakaoUser
      ? '😥 카카오 계정 연동을 해제하고 계정을 삭제하시겠습니까? \n\n 복구가 불가능합니다.'
      : isGoogleUser
        ? '😥 구글 계정 연동을 해제하고 계정을 삭제하시겠습니까? \n\n 복구가 불가능합니다.'
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
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-md)',
              color: 'var(--gray-700)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              border: '1px solid var(--gray-200)',
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
            ) : user?.app_metadata?.provider === 'google' ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                구글 로그인
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
            {/* 이메일 로그인 사용자에게만 비밀번호 변경 섹션 표시 */}
            {(!user?.app_metadata.provider || user?.app_metadata.provider === 'email') && (
              <div className="form-group">
                <label className="form-label">🔒 비밀번호 변경</label>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="새 비밀번호(최소 6자)"
                    className="form-input"
                    style={{ flex: 1 }}
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호 확인"
                    className="form-input"
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handlePasswordChange}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    변경
                  </button>
                </div>
                {/* 비밀번호 변경 메시지 */}
                {passwordMessage && (
                  <div
                    style={{
                      marginTop: 'var(--space-2)',
                      padding: 'var(--space-2)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '14px',
                      backgroundColor: passwordMessage.includes('성공')
                        ? 'var(--success-50)'
                        : '#fef2f2',
                      color: passwordMessage.includes('성공') ? 'var(--success-600)' : '#dc2626',
                      border: `1px solid ${passwordMessage.includes('성공') ? 'var(--success-600)' : '#dc2626'}`,
                    }}
                  >
                    {passwordMessage}
                  </div>
                )}
              </div>
            )}
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

            {/* 구글 사용자에게만 연동 해제 버튼 표시 */}
            {user?.app_metadata?.provider === 'google' && (
              <button
                className="btn btn-warning btn-lg"
                onClick={handleUnlinkGoogle}
                style={{ backgroundColor: '#4285F4', color: '#FFFFFF', border: 'none' }}
              >
                🔗 구글 연동 해제
              </button>
            )}

            <button className="btn btn-danger btn-lg" onClick={handleDeleteUser}>
              {user?.app_metadata?.provider === 'kakao'
                ? '카카오 연동 해제 & 탈퇴'
                : user?.app_metadata?.provider === 'google'
                  ? '구글 연동 해제 & 탈퇴'
                  : '회원탈퇴'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
