import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, removeAvatar, updateProfile, uploadAvatar } from '../lib/profile';
import type { Profile, ProfileUpdate } from '../types/TodoType';
/**
 * 사용자 프로필 페이지
 * - 기본 정보 표시
 * - 정보 수정
 * - 회원탈퇴 기능 : 확인을 거치고 진행하도록
 */
function ProfilePage() {
  // 회원 기본 정보
  const { user, deleteAccount } = useAuth();
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

  // 회원탈퇴
  const handleDeleteUser = () => {
    const message: string = '😥 계정을 완전히 삭제하시겠습니까? \n\n 복구가 불가능합니다.';
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
    return (
      <div
        style={{
          position: 'fixed',
          width: '100%',
          height: '100%',
          left: 0,
          top: 0,
          zIndex: 999,
          background: 'green',
        }}
      >
        <h1>프로필 로딩중 ... </h1>
      </div>
    );
  }
  // error 메시지 출력하기
  if (error) {
    return (
      <div>
        <h2>프로필</h2>
        <div>😋 {error}</div>
        <button onClick={loadProfile}>재시도</button>
      </div>
    );
  }

  return (
    <div>
      <h2>회원정보</h2>
      {/* 사용자 기본 정보 섹션 */}
      <div>
        <h3>기본 정보</h3>
        <div>이메일: {user?.email}</div>
        <div>가입일: {user?.created_at && new Date(user.created_at).toLocaleString()}</div>
      </div>
      {/* 사용자 추가정보 */}
      <div>
        <h3>사용자 추가 정보</h3>
        <div>아이디 : {profileData?.id}</div>
        {edit ? (
          <>
            <div>
              닉네임 :
              <input type="text" value={nickName} onChange={e => setNickName(e.target.value)} />
            </div>
            <div>
              <h4>아바타 편집</h4>
              <div>
                {previewImage ? (
                  <div>
                    <img src={previewImage} />
                    <p>새로운 이미지 미리보기</p>
                  </div>
                ) : imageRemovalRequest ? (
                  <div>이미지 제거됨</div>
                ) : originalAvatarUrl ? (
                  <div>
                    <img src={originalAvatarUrl} />
                    현재아바타
                  </div>
                ) : (
                  <div>이미지없음, 아바타 이미지를 설정해보세요.</div>
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
              </div>
              <div>
                <div>
                  <button disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                    {uploading ? '업로드 중...' : '이미지 선택'}
                  </button>
                  {previewImage && (
                    <button disabled={uploading} onClick={handleCancelUpload}>
                      취소
                    </button>
                  )}
                  {!previewImage && !imageRemovalRequest && originalAvatarUrl && (
                    <button onClick={handleRemoveImage}>
                      {uploading ? '처리 중...' : '이미지 제거'}
                    </button>
                  )}
                  {imageRemovalRequest && (
                    <button
                      disabled={uploading}
                      onClick={() => {
                        setImageRemovalReauest(false);
                      }}
                    >
                      제거 취소
                    </button>
                  )}
                </div>
              </div>
              <p>지원 형식 : JPEG, PNG, GIF (최대 5MB)</p>
            </div>
          </>
        ) : (
          <>
            <div>닉네임 : {profileData?.nickname}</div>
            <div>
              <h4>아바타</h4>
              {profileData?.avatar_url ? (
                <img src={profileData.avatar_url} />
              ) : (
                <div>기본이미지</div>
              )}
            </div>
          </>
        )}

        <div>
          가입일 : {profileData?.created_at && new Date(profileData.created_at).toLocaleString()}
        </div>
      </div>
      <div>
        {edit ? (
          <>
            <button disabled={uploading} onClick={saveProfile}>
              {uploading ? '저장 중...' : '수정확인'}
            </button>
            <button
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
              onClick={() => {
                setEdit(true);
                // 편집 시작 시 원본 이미지 URL 저장
                setOriginalAvartarUrl(profileData?.avatar_url || null);
                setImageRemovalReauest(false);
              }}
            >
              정보수정
            </button>
            <button onClick={handleDeleteUser}>회원탈퇴</button>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
