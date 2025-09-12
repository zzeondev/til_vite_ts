import { useState } from 'react';

type CounterProps = {};
type VoidFun = () => void;

const Counter = ({}: CounterProps): JSX.Element => {
  const [count, setCount] = useState<number>(0);
  const add: VoidFun = () => setCount(count + 1);
  const minus: VoidFun = () => setCount(count - 1);
  const reset: VoidFun = () => setCount(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] bg-gray-100 p-8 rounded-xl shadow-md w-full max-w-md mx-auto mt-10">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Counter: {count}</h1>
      <div className="flex gap-4">
        <button
          onClick={add}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-all"
        >
          증가
        </button>
        <button
          onClick={minus}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-all"
        >
          감소
        </button>
        <button
          onClick={reset}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-all"
        >
          초기화
        </button>
      </div>
    </div>
  );
};

export default Counter;
