import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Protected from './components/Protected';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminPage from './pages/AdminPage';
import AuthCallback from './pages/AuthCallback';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import TodoDetailPage from './pages/TodoDetailPage';
import TodoEditPage from './pages/TodoEditPage';
import TodoListPage from './pages/TodoListPage';
import TodosInfinitePage from './pages/TodosInfinitePage';
import TodoWritePage from './pages/TodoWritePage';
import DirectChatPage from './pages/chat/DirectChatPage';
// 1:1 채팅 관련 css
import './components/chat/chat.css';
import { DirectChatProider } from './contexts/DirectChatContext';

const TopBar = () => {
  const { signOut, user } = useAuth();
  // 관리자인 경우 메뉴 추가로 출력하기
  // isAdmin 에는 true/false
  const isAdmin = user?.email === 'wldjsjiun@naver.com';

  return (
    <nav className="nav">
      <Link to="/" className="nav-link">
        홈
      </Link>
      {user && (
        <Link to="/todos" className="nav-link">
          할일
        </Link>
      )}
      {user && (
        <Link to="/todos-infinite" className="nav-link">
          무한스크롤 할일
        </Link>
      )}
      {!user && (
        <Link to="/signup" className="nav-link">
          회원가입
        </Link>
      )}
      {!user && (
        <Link to="/signin" className="nav-link">
          로그인
        </Link>
      )}
      {user && (
        <Link to="/chat" className="nav-link">
          1 : 1 채팅
        </Link>
      )}
      {user && (
        <Link to="/profile" className="nav-link">
          프로필
        </Link>
      )}
      {user && (
        <button onClick={signOut} className="btn btn-secondary btn-sm">
          로그아웃
        </button>
      )}

      {isAdmin && (
        <Link to="/admin" className="nav-link">
          관리자
        </Link>
      )}
    </nav>
  );
};

function App() {
  return (
    <DirectChatProider>
      <AuthProvider>
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">⚾ Todo Service</h1>
          </div>
          <Router
            future={{
              v7_relativeSplatPath: true,
              v7_startTransition: true,
            }}
          >
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
                    <TodoListPage />
                  </Protected>
                }
              />
              <Route
                path="/todos/write"
                element={
                  <Protected>
                    <TodoWritePage />
                  </Protected>
                }
              />
              <Route
                path="/todos/edit/:id"
                element={
                  <Protected>
                    <TodoEditPage />
                  </Protected>
                }
              />
              <Route
                path="/todos/detail/:id"
                element={
                  <Protected>
                    <TodoDetailPage />
                  </Protected>
                }
              />
              <Route
                path="/todos-infinite"
                element={
                  <Protected>
                    <TodosInfinitePage />
                  </Protected>
                }
              />

              <Route
                path="/profile"
                element={
                  <Protected>
                    <ProfilePage />
                  </Protected>
                }
              />

              <Route
                path="/admin"
                element={
                  <Protected>
                    <AdminPage />
                  </Protected>
                }
              />
              {/* 1 : 1 채팅 페이지 */}
              <Route
                path="/chat"
                element={
                  <Protected>
                    <DirectChatPage />
                  </Protected>
                }
              />
            </Routes>
          </Router>
        </div>
      </AuthProvider>
    </DirectChatProider>
  );
}

export default App;
