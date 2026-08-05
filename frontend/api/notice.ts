import client from './client';
import type {Notice } from'../src/types';

//get all notice for a specific line or station or trip 
export function getNotices( filter?:{line_id?: number | null,station_id?: number | null,trip_id?: number}):Promise<Notice[]>{
     return client.get(`/notices/` ,{ params:filter ,}).then (resp=>resp.data)
}

//create a new Notice 
export function createNotice(data:{ line_id?: number,station_id?: number,trip_id?: number,message: string}){
     return client.post('/notices/' ,data).then (resp=>resp.data)
}

//update aNotice 
export function updateNotice(Notice_id:number ,data:{ message: string}){
     return client.put(`/notices/${Notice_id}` ,data).then (resp=>resp.data)
}
//delete a Notice 
export function deleteNotice(Notice_id:number){
     return client.delete(`/notices/${Notice_id}`).then (resp=>resp.data)
}