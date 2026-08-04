import client from './client';

export function getStations(){
    return client.get('/stations/').then (res=>res.data)
} 

