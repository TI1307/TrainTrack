import {BrowserRouter , Routes , Route} from "react-router-dom"
import Login from '../pages/login'
import TripType from '../pages/TripTypeSelection'
import IntraWilaya from '../pages/intraWilaya' 
import InterWilaya from '../pages/interWilaya'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        //login
        <Route 
        path="/"
        element ={<Login/>}
        />

        //TripTypeSelection
        <Route 
        path="/trip-type"
        element ={<TripType />}
        />

        //interWilaya 
        <Route 
        path="/interWilaya"
        element ={<InterWilaya />}
        />

        //intraWilaya
        <Route 
        path="/intraWilaya"
        element ={<IntraWilaya />}
        />
        

      </Routes>
    </BrowserRouter>
  )
}

export default App
