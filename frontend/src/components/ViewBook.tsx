import React, { useState } from 'react'

export const ViewBook = () => {
  const [text, setText] = useState('')

  return (
    <div>
      <pre>{text}</pre>
    </div>
  )
}
