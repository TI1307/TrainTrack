import client from './client';
import type {Line } from'../src/types';

//get all Lines
export function getLines():Promise<Line[]>{
     return client.get('/lines/').then (resp=>resp.data)
}

//create a new Line 
export function createLine(data:{name: string , length: number}){
     return client.post('/lines/' ,data).then (resp=>resp.data)
}

//update a Line 
export function updateLine(Line_id:number ,data:{name: string , length: number}){
     return client.put(`/lines/${Line_id}` ,data).then (resp=>resp.data)
}
//delete a Line 
export function deleteLine(Line_id:number){
     return client.delete(`/lines/${Line_id}`).then (resp=>resp.data)
}




