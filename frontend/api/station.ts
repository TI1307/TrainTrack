import client from './client';
import type {Station} from'../src/types';

//get all Stations
export function getStations():Promise<Station[]>{
     return client.get('/stations/').then (resp=>resp.data)
}

//create a new Station 
export function createStation(data:{ name: string,latitude: number,longitude: number,wilaya_id: number}){
     return client.post('/stations/' ,data).then (resp=>resp.data)
}

//update a Station 
export function updateStation(Station_id:number ,data:{ name: string,latitude: number,longitude: number,wilaya_id: number}){
     return client.put(`/stations/${Station_id}` ,data).then (resp=>resp.data)
}
//delete a Station 
export function deleteStation(Station_id:number){
     return client.delete(`/stations/${Station_id}`).then (resp=>resp.data)
}
 