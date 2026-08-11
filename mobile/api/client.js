import axios from 'axios' ;

const client = axios.create ({
    baseURL:"http://10.215.208.59:8000",
});
export default client ;