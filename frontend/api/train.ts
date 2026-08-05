import client from './client';
import type {Train} from'../src/types';

//get all Trains
export function getTrains():Promise<Train[]>{
     return client.get('/trains/').then (resp=>resp.data)
}

//create a new Train 
export function createTrain(data:{serial_number:string}){
     return client.post('/trains/' ,data).then (resp=>resp.data)
}

//update aTrain 
export function updateTrain(train_id:number ,data:{serial_number:string}){
     return client.put(`/trains/${train_id}` ,data).then (resp=>resp.data)
}
//delete a Train 
export function deleteTrain(train_id:number){
     return client.delete(`trains/${train_id}`).then (resp=>resp.data)
}