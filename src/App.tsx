type SampleProps = {
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
