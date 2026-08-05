import client from './client';
import type {Scheduler} from'../src/types';

//get all Scheduler
export function getSchedulers(trip_id:number):Promise<Scheduler[]>{
     return client.get(`/scheduler/${trip_id}`).then (resp=>resp.data)
}

//create a new Scheduler 
export function createScheduler(data:{  trip_id: number, station_id: number, order: number, arrival_time: string ,departure_time: string}){
     return client.post('/scheduler/' ,data).then (resp=>resp.data)
}

//update aScheduler 
export function updateScheduler(Scheduler_id:number ,data:{ order: number, arrival_time: string ,departure_time: string}){
     return client.put(`/scheduler/${Scheduler_id}` ,data).then (resp=>resp.data)
}
//delete a Scheduler 
export function deleteScheduler(Scheduler_id:number){
     return client.delete(`/scheduler/${Scheduler_id}`).then (resp=>resp.data)
}