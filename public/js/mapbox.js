
export const displayMap = locations => {  
    mapboxgl.accessToken = 'pk.eyJ1IjoiamhvbnNub3ciLCJhIjoiY2xqZmxoZGloMDJzdjNubnJnbWR1ejhpNiJ9.MKFCMdiBITtYM4riV_3oKQ';
     var map = new mapboxgl.Map({
       container: 'map',
       style: 'mapbox://styles/jhonsnow/cljfk6t1n008x01pl51l953xs',
       scrollZoom: false
     });
     const bounds = new mapboxgl.LngLatBounds();

     locations.forEach(loc => {
       // Create marker
       const el = document.createElement('div');
       el.className = 'marker';
   
       // Add marker
       new mapboxgl.Marker({
         element: el,
         anchor: 'bottom'
       })
         .setLngLat(loc.coordinates)
         .addTo(map);
   
       // Add popup
       new mapboxgl.Popup({
         offset: 30
       })
         .setLngLat(loc.coordinates)
         .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
         .addTo(map);
   
       // Extend map bounds to include current location
       bounds.extend(loc.coordinates);
     });
   
     map.fitBounds(bounds, {
       padding: {
         top: 200,
         bottom: 150,
         left: 100,
         right: 100
       }
     });
}