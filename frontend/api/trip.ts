import client from './client';
import type {Trip } from'../src/types';
export type TripStatus = 'working' | 'not_working';
export type TripType = 'inter_Wilaya' | 'intra_Wilaya';
//get all Trips
export function getTrips(line_id:number):Promise<Trip[]>{
     return client.get(`/trips/${line_id}` ).then (resp=>resp.data)
}

//create a new Trip 
export function createTrip(data:{line_id: number,train_id: number,status: TripStatus, tripType: TripType}){
     return client.post('/trips/' ,data).then (resp=>resp.data)
}

//update a Trip 
export function updateTrip(Trip_id:number ,data:{status: TripStatus, tripType: TripType}){
     return client.put(`/trips/${Trip_id}` ,data).then (resp=>resp.data)
}
//delete a Trip 
export function deleteTrip(Trip_id:number){
     return client.delete(`/trips/${Trip_id}`).then (resp=>resp.data)
}



