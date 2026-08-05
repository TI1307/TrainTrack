import client from './client';
import type {LineStation } from'../src/types';


export function getLineStations(Line_id:number ):Promise<LineStation[]>{
     return client.get(`/lines_stations/${Line_id}/` ).then (resp=>resp.data)
}

//create a new lineStation 
export function createLineStation(data:{line_name:string , station_name:string ,order: number , distance: number}){
     return client.post('/lines_stations/' ,data).then (resp=>resp.data)
}

//update a lineStation 
export function updateLineStation(line_id:number ,station_id:number ,data:{order: number , distance: number}){
     return client.put(`/lines_stations/${line_id}/${station_id}` ,data).then (resp=>resp.data)
}
//delete a station from a line 
export function deleteLineStation(line_id:number ,station_id:number){
     return client.delete(`/lines_stations/${line_id}/${station_id}`).then (resp=>resp.data)
}
