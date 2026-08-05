import axios from'axios';

const client = axios.create({
    baseURL:"http://192.168.100.3:8000",
})

// Add the access token to the config's Authorization header before each request.
client.interceptors.request.use((config)=>{
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdXBlcmFkbWluIiwiZXhwIjoxNzg1OTY0ODA2fQ.--Gpr7qf7P83EUAaAP6pUc9cleknOgHXjCkmlzwiKiI';
  if(token){
    config.headers.Authorization= `Bearer ${token}`;  
  }
  return config;
})
export default client ;