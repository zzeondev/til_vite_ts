# 프로젝트 초기 기본 설정

- main.tsx

```tsx
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
```

# 컴포넌트 생성

## 1. 함수형태

- `rfce`

```tsx
function App(): JSX.Element {
  return <div>App</div>;
}

export default App;
```

## 2. 표현식 형태

- `rafce`

```tsx
const App = (): JSX.Element => {
  return <div>App</div>;
};

export default App;
```

- 컴포넌트 생성 및 활용

```jsx
const Sample = (): JSX.Element => {
  return <div>샘플입니다.</div>;
};

const App = (): JSX.Element => {
  return (
    <div>
      <h1>App</h1>
      <Sample></Sample>
    </div>
  );
};

export default App;
```

## 3. 자식 즉, `children 요소를 배치시 오류` 발생

```tsx
// children : 타입이 없어서 오류가 발생함
const Sample = ({ children }): JSX.Element => {
  return <div>샘플입니다.</div>;
};

const App = (): JSX.Element => {
  return (
    <div>
      <h1>App</h1>
      <Sample>
        <h2>자식입니다.</h2>
      </Sample>
    </div>
  );
};

export default App;
```

- children 타입 없는 오류 해결 1 (추천하지 않음)

```tsx
// React.FC 에 React 가 가지고 있는 Children Props 를 사용한다고 명시
const Sample: React.FC<React.PropsWithChildren> = ({ children }): JSX.Element => {
  return <div>샘플입니다.</div>;
};
```

- children 타입 없는 오류 해결 2 (적극 추천 : props 에 대해서 일관성 유지)

```tsx
type SampleProps = {
  children?: React.ReactNode;
};

const Sample = ({ children }: SampleProps): JSX.Element => {
  return <div>{children}</div>;
};

const App = (): JSX.Element => {
  return (
    <div>
      <h1>App</h1>
      <Sample>
        <h2>자식입니다.</h2>
      </Sample>
    </div>
  );
};

export default App;
```

- 향후 컴포넌트는 JSX.Element 와 Props 타입을 작성하자

## 4. Props 전달하기

```tsx
type SampleProps = {
  // children 은 선택사항이지만 적는 거 추천
  children?: React.ReactNode;
  age: number;
  nickName: string;
};

const Sample = ({ age, nickName }: SampleProps) => {
  return (
    <div>
      {age}살이고 별명이{nickName} 인 샘플입니다.
    </div>
  );
};

const App = () => {
  return (
    <div>
      <h1>App</h1>
      <Sample age={20} nickName="홍길동" />
    </div>
  );
};

export default App;
```
