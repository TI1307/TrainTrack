import client from './client';


export function get_notices(fromStationId, toStationId){
    return client.get('/passenger/notices',{
        params:{
            from_station_id :fromStationId, 
             to_station_id: toStationId
            
        }
    }).then(res=>res.data)
}