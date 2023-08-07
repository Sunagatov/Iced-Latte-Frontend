'use client'
import React, { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0)

  const increment = () => {
    setCount(count + 1)
  }

  const decrement = () => {
    if (count > 0) {
      setCount(count - 1)
    }
  }

  return (
    <div className="flex w-28 justify-around items-center bg-neutral-100 rounded-full px-2 py-4 text-black">
      <button className="text-lg font-medium" onClick={decrement}>
        -
      </button>
      <span className="text-lg font-medium">{count}</span>
      <button onClick={increment} className="text-lg font-medium">
        +
      </button>
    </div>
  )
}

export default Counter
