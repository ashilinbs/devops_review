import { Routes,Route } from "react-router-dom"
import Signup from "./components/Signup"


function App() {

  return (
    <>
    <Routes>
    <Route path="/" element={<Signup/>}></Route>
    </Routes>
    </>
  )
}

export default App
