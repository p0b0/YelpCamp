
		mapboxgl.accessToken = 'pk.eyJ1IjoicDBiMCIsImEiOiJja2llOXJneTkwODM1MnRwMWF1NGpmMWl2In0.vegSwN7pMW5cVgFupwPFng';
		const map = new mapboxgl.Map({
		container: 'map',
		style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
		center: campground.geometry.coordinates, // starting position [lng, lat]
		zoom: 9 // starting zoom
		});
        
        const marker = new mapboxgl.Marker()
			.setLngLat(campground.geometry.coordinates)
			.setPopup(
				new mapboxgl.Popup({offset: 25})
					.setHTML(`<h3>${campground.name}</h3><p>${campground.location}</p>`)
			)
            .addTo(map)