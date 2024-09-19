//Mapbox GL is a JavaScript library for interactive, customizable maps on the web. It handles rendering interactive maps

mapboxgl.accessToken=mapToken;
const map=new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/outdoors-v12',
    projection: 'globe',
    center: campground.geometry.coordinates,
    zoom: 9
});

map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }));

new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({
            offset: 25
        }).setHTML(
            `<p style="font-size: 15px">${campground.title}</p><p style="font-size: 10px; font-style: italic">${campground.location}</p>`
        )
    )
    .addTo(map)