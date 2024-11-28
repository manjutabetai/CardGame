import React from 'react'

function Test() {
  return (
    <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
  )
}

export default Test