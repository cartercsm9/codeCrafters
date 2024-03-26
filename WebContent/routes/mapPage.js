function initMap() {
    const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 0, lng: 0 },
        zoom: 2
    });

    const input = document.getElementById('search-box');
    const searchBox = new google.maps.places.SearchBox(input);

    map.addListener('bounds_changed', () => {
        searchBox.setBounds(map.getBounds());
    });

    let markers = [];

    searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        markers.forEach((marker) => {
            marker.setMap(null);
        });
        markers = [];

        const bounds = new google.maps.LatLngBounds();
        places.forEach((place) => {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            const marker = new google.maps.Marker({
                map,
                title: place.name,
                position: place.geometry.location,
            });
            markers.push(marker);

            if (place.geometry.viewport) {
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }

            // Display latitude and longitude
            const infoWindow = new google.maps.InfoWindow();
            google.maps.event.addListener(marker, 'click', function () {
                infoWindow.setContent(place.name + "<br>" + "Latitude: " + place.geometry.location.lat() + "<br>" + "Longitude: " + place.geometry.location.lng());
                infoWindow.open(map, this);
            });

        });
        map.fitBounds(bounds);
    });
}
