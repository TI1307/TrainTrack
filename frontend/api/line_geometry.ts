import client from './client';
import type {LineGeometry} from'../src/types';


//get all points for one line 
export function getLineGeometry(Line_id:number ):Promise<LineGeometry[]>{
     return client.get(`/lines_Geometry/${Line_id}/` ).then (resp=>resp.data)
}

//create a new LineGeometry 
export function createLineGeometry(data:{ line_name:string ,sequence: number, latitude: number, longitude: number}){
     return client.post('/lines_Geometry/' ,data).then (resp=>resp.data)
}

//update a LineGeometry 
export function updateLineGeometry(LineGeometry_id:number ,data:{sequence: number, latitude: number, longitude: number}){
     return client.put(`/lines_Geometry/${LineGeometry_id}` ,data).then (resp=>resp.data)
}
//delete a station from a line 
export function deleteLineGeometry(lineGeometry_id:number ){
     return client.delete(`/lines_Geometry/${lineGeometry_id}/`).then (resp=>resp.data)
}

