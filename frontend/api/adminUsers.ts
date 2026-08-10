import client from './client';
import type  {AdminUser} from '../src/types'


export function getAdminUsers() :Promise<AdminUser[]>{
    return client.get('/admin_users/').then(res=>res.data);
}

export function createAdminUser(data:{username :string , email :string }){
    return client.post('/admin_users/' , data).then(res=>res.data);
}

export function deleteAdminUser(Id:number){
    return client.delete(`/admin_users/${Id}` ).then(res=>res.data);
}
//set Password for an admin 
export function setAdminPassword(data:{ email: string , password:string ,token:string}){
    return client.post('/admin_users/set-password/' ,data ).then(res=>res.data as { detail: string; username: string });
}