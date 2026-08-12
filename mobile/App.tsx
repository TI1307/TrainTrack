import {useState , useEffect} from "react";
import SplashScreen from "./screens/SplashScreen";
import HomeScreen from "./screens/HomeScreen";
import SearchResultsScreen from "./screens/SearchResultsScreen";
import { Float } from "react-native/Libraries/Types/CodegenTypes";

type SearchParams = {
  from: string;
  to: string;
  date: Date;
  fromStationId: number;
  toStationId: number;
  fromLatitude: Float;
  fromLongitude: Float ;
  ticketClass: "first_class" | "economy" | "intra_wilaya";
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
  from={searchParams.from}
  to={searchParams.to}
  fromStationId={searchParams.fromStationId}
  toStationId={searchParams.toStationId}
  fromLatitude={searchParams.fromLatitude}
  fromLongitude={searchParams.fromLongitude}
  date={searchParams.date}
  ticketClass={searchParams.ticketClass}
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