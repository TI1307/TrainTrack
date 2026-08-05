import client from './client';
import type {Wilaya} from'../src/types';

//get all wilaya
export function getWilayas():Promise<Wilaya[]>{
     return client.get('/wilayas/').then (resp=>resp.data)
}

//create a new wilaya 
export function createWilaya(data:{name:string}){
     return client.post('/wilayas/' ,data).then (resp=>resp.data)
}

//update awilaya 
export function updateWilaya(wilaya_id:number ,data:{name:string}){
     return client.put(`/wilayas/${wilaya_id}` ,data).then (resp=>resp.data)
}
//delete a wilaya 
export function deleteWilaya(wilaya_id:number){
     return client.delete(`wilayas/${wilaya_id}`).then (resp=>resp.data)
}