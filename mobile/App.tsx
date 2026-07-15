import {useState , useEffect} from "react";
import SplashScreen from "./screens/SplashScreen";
import HomeScreen from "./screens/HomeScreen";
import SearchResultsScreen from "./screens/SearchResultsScreen";

export default function App(){
  const [loading , setLoading]=useState(true);  //splash ->home page 
  const [screen, setScreen] = useState("home");  // "home" -> "searchResults"
  useEffect (()=> {
    const timer= setTimeout (()=>
    {
      
        setLoading (false);
      },3000);
      return () => clearTimeout(timer);
   } ,[]);
  if (loading){
    return (<SplashScreen />);
  }
    if (screen === "searchResults") {
    return <SearchResultsScreen onBack={() => setScreen("home")} />;
  }

  return <HomeScreen onSearch={() => setScreen("searchResults")} />;
}

