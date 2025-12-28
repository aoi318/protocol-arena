import { useState, useEffect } from 'react'
import init, { greet, add } from 'net-core'
import './App.css'

function App() {
  const [msg, setMsg] = useState<string>("")
  const [sum, setSum] = useState<number>(0)

  useEffect(() => {
    init().then(() => {
      setMsg(greet())
      setSum(add(10, 20))
    })
  }, [])

  return (
    <div>
      <h1>Protocol Battle Arena</h1>
      <p>Message: {msg}</p>
      <p>Result: {sum}</p>
    </div>
  )
}

export default App