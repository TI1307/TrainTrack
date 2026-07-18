import {useState , useEffect} from "react";
import SplashScreen from "./screens/SplashScreen";
import HomeScreen from "./screens/HomeScreen";
import SearchResultsScreen from "./screens/SearchResultsScreen";

type SearchParams={
  from: string;
  to:string;
  date:Date;
};
export default function App(){
  const [loading , setLoading]=useState(true);  //splash ->home page 
  const [screen, setScreen] = useState("home");  // "home" -> "searchResults"
  const [searchParams, setSearchParams] = useState<SearchParams| null>(null);
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
    if (screen === "searchResults" && searchParams) {
    return <SearchResultsScreen
        from={searchParams?.from}
        to={searchParams?.to}
        date={searchParams?.date}
        onBack={() => setScreen("home")}
      />;
  }

  return (
    <HomeScreen
      onSearch={(params: SearchParams) => {
        setSearchParams(params);   
        setScreen("searchResults");
      }}
    />
  );
}