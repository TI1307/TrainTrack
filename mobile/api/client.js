import axios from 'axios' ;

const client = axios.create ({
    baseURL:"http://192.168.100.3:8000",
});
export default client ;