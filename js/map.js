
let marker;
let geocoder;
let responseDiv;
let response;

let coordinates = espanaComunidades;

function initMap() {
  const bounds = new google.maps.LatLngBounds();
  const markersArray = [];
 let map = new google.maps.Map(document.getElementById("map"), {
    zoom: 6,
    center: { lat: 40.2085, lng: -3.713 },
    mapTypeControl: false,
  });
  const infoWindow = new google.maps.InfoWindow({
    content: "",
    disableAutoPan: true,
  });

  // CUSTOM MARKER
  let selectedCommunity = {
    community: ''
  };

  const markerIcon = {
    url: "https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png",
    size: new google.maps.Size(50, 40),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(15, 30),
 
    };

  
    const markers = (selectedCommunity.community != '' ? locations.filter(place => place.community === selectedCommunity.community) : locations).map((place) => {
      const marker = new google.maps.Marker({
        position: place.location,
        icon: markerIcon,
        title: place.name,
      });

    // DROPDOWN

    let select = document.getElementById("dropdown");
    select.addEventListener("change", () => {
      let communityIndex = Number(select.value);
      selectedCommunity.community = comunidadesAutonomas[communityIndex]

      if (typeof communityIndex == "number") {
        const communityCoords = coordinates[communityIndex];

        const communityPolygon = new google.maps.Polygon({
          paths: communityCoords,
          strokeColor: "#bead8e",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#FF0000",
          fillOpacity: 0,
        });

        communityPolygon.setMap(map);
      }
    });

    marker.addListener("click", () => {
      infoWindow.setContent(place.name);
      infoWindow.open(map, marker);
    });
    return marker;
  });

  // CLUSTERER
  const markerCluster = new markerClusterer.MarkerClusterer({ map, markers });
  const locationButton = document.createElement("button");
  // MY LOCATION.
  const myLocation = {
    coords: { lat: 40.305, lng: -3.73268 },
  };
  locationButton.textContent = "My Current Location";
  locationButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
  locationButton.addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          infoWindow.setPosition(pos);
          
          infoWindow.open(map);
          map.setCenter(pos);
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  });
  geocoder = new google.maps.Geocoder();

  //INPUT
  const inputText = document.createElement("input");

  inputText.type = "text";
  inputText.placeholder = "Enter a location";
  inputText.classList.add('geolocation-input');

  const submitButton = document.createElement("input");

  submitButton.type = "button";
  submitButton.value = "Geocode";
  submitButton.classList.add("button", "button-primary");

  const clearButton = document.createElement("input");

  clearButton.type = "button";
  clearButton.value = "Clear";
  clearButton.classList.add("button", "button-secondary");
  response = document.createElement("pre");
  response.id = "response";
  response.innerText = "";
  responseDiv = document.createElement("div");
  responseDiv.id = "response-container";
  responseDiv.appendChild(response);

  const instructionsElement = document.createElement("p");

  instructionsElement.id = "instructions";
  instructionsElement.innerHTML =
    "Enter a location and click Geocode.";
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(inputText);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(submitButton);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(clearButton);
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(instructionsElement);
  /*
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(responseDiv);*/

  const personIcon = {
    path: 'M12.075,10.812c1.358-0.853,2.242-2.507,2.242-4.037c0-2.181-1.795-4.618-4.198-4.618S5.921,4.594,5.921,6.775c0,1.53,0.884,3.185,2.242,4.037c-3.222,0.865-5.6,3.807-5.6,7.298c0,0.23,0.189,0.42,0.42,0.42h14.273c0.23,0,0.42-0.189,0.42-0.42C17.676,14.619,15.297,11.677,12.075,10.812 M6.761,6.775c0-2.162,1.773-3.778,3.358-3.778s3.359,1.616,3.359,3.778c0,2.162-1.774,3.778-3.359,3.778S6.761,8.937,6.761,6.775 M3.415,17.69c0.218-3.51,3.142-6.297,6.704-6.297c3.562,0,6.486,2.787,6.705,6.297H3.415z',
    fillColor: "#000000",
    fillOpacity: 1,
    strokeWeight: 0,
    rotation: 0,
    scale: 2,
    anchor: new google.maps.Point(15, 30),
  }
  marker = new google.maps.Marker({
    //icon: personIcon,
    map,
  });
  map.addListener("click", (e) => {
    geocode({ location: e.latLng });
  });
  submitButton.addEventListener("click", () =>
    geocode({ address: inputText.value })
  );
  clearButton.addEventListener("click", () => {
    clear();
  });
  clear();

  // DISTANCE MATRIX
  const service = new google.maps.DistanceMatrixService();

  const nearButton = document.getElementById("find-near-location");
  const sidebar = document.getElementById("sidebar");

  /*navigator.geolocation.getCurrentPosition((position) => {
      const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      myLocation.coords = pos;
    });*/

  let myHotels = [];
  for (let i = 0; i < locations.length; i++) {
    myHotels.push(locations[i].location);
  }

  const request = {
    origins: [myLocation.coords],
    destinations: myHotels,
    travelMode: google.maps.TravelMode.DRIVING,
    unitSystem: google.maps.UnitSystem.METRIC,
    avoidHighways: false,
    avoidTolls: false,
  };

  nearButton.addEventListener("click", () => {
    sidebar.style.display = "block";
  });
  service.getDistanceMatrix(request).then((response) => {
    const distancesArray = [];
    const indexArray = [];
    const sortedDistances = [];
    const sortedPlaces = []
    for (let j = 0; j < response.rows[0].elements.length; j++) {
      distancesArray.push(response.rows[0].elements[j].distance.value);
      sortedDistances.push(response.rows[0].elements[j].distance.value);
    }
    sortedDistances.sort(function (a, b) {
      return a - b;
    });
    for (let k = 0; k < distancesArray.length; k++) {
      indexArray.push(distancesArray.indexOf(sortedDistances[k]));
    }
    for (let l = 0; l<response.destinationAddresses.length; l++){
      sortedPlaces.push(response.destinationAddresses[indexArray[l]])
    }
    document.getElementById(
      "response"
    ).innerText = `${sortedPlaces.map((place) => place + ' - ' + sortedDistances[sortedPlaces.indexOf(place)] + 'm' + '\n' + '\n') }`;
  });
}

function clear() {
  marker.setMap(null);
  responseDiv.style.display = "none";
}

function geocode(request) {
  clear();
  geocoder
    .geocode(request)
    .then((result) => {
      const { results } = result;

      map.setCenter(results[0].geometry.location);
      marker.setPosition(results[0].geometry.location);
      marker.setMap(map);
      responseDiv.style.display = "block";
      response.innerText = JSON.stringify(result, null, 2);
      return results;
    })
    .catch((e) => {
      alert("Geocode was not successful for the following reason: " + e);
    });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

const locations = [
    {
      name: "Hotel - Caracas",
      community: "Madrid, Comunidad de",
      location: { lat: 10.48801, lng: -66.87919 },
    },
    {
      name: "Hotel - Pamplona",
      community: "Navarra, Comunidad Foral de",
      location: { lat: 42.812526, lng: -1.6457745 },
    },
    {
      name: "Hotel - Barcelona",
      community: "Cataluña / Catalunya",
      location: { lat: 41.38879, lng: 2.15899 },
    },
    {
      name: "Hotel - Ibiza",
      community: "Balears, Illes",
      location: { lat: 38.9067339, lng: 1.4205982999999378 },
    },
    {
      name: "Hotel - Santander",
      community: "Cantabria",
      location: { lat: 43.46472, lng: -3.80444 },
    },
    {
      name: "Hotel - Murcia",
      community: "Murcia, Región de",
      location: { lat: 37.998878, lng: -1.145776},
    },
    {
      name: "Hotel - San Sebastian",
      community: "País Vasco / Euskadi",
      location: { lat: 43.318334, lng: -1.9812312999999904},
    },
    {
      name: "Hotel - Madrid",
      community: "Madrid, Comunidad de",
      location: { lat: 40.452885, lng: -3.7062261 },
    },
  ];

const comunidadesAutonomas = [
    "Andalucía",
    "Aragón",
    "Asturias, Principado de",
    "Balears, Illes",
    "Canarias",
    "Cantabria",
    "Castilla y León",
    "Castilla - La Mancha",
    "Cataluña / Catalunya",
    "Comunitat Valenciana",
    "Extremadura",
    "Galicia",
    "Madrid, Comunidad de",
    "Murcia, Región de",
    "Navarra, Comunidad Foral de",
    "País Vasco / Euskadi",
    "Rioja, La",
    "Ceuta",
    "Melilla",
  ];


  var espanaComunidades = [
    [
        [
            {
                "lng": -5.3118896484375,
                "lat": 36.1312200154285
            },
            {
                "lng": -5.30914306640625,
                "lat": 36.20882309283712
            },
            {
                "lng": -5.1910400390625,
                "lat": 36.392545812446244
            },
            {
                "lng": -4.91912841796875,
                "lat": 36.485348924361425
            },
            {
                "lng": -4.67193603515625,
                "lat": 36.47872381162464
            },
            {
                "lng": -4.531860351562499,
                "lat": 36.56039393337068
            },
            {
                "lng": -4.40277099609375,
                "lat": 36.705861603381145
            },
            {
                "lng": -4.141845703125,
                "lat": 36.71466899719828
            },
            {
                "lng": -3.88641357421875,
                "lat": 36.730079507078415
            },
            {
                "lng": -3.50738525390625,
                "lat": 36.6992553955527
            },
            {
                "lng": -3.34808349609375,
                "lat": 36.71026542647845
            },
            {
                "lng": -3.2107543945312496,
                "lat": 36.74988847598359
            },
            {
                "lng": -3.00201416015625,
                "lat": 36.74108512094412
            },
            {
                "lng": -2.823486328125,
                "lat": 36.701457527917896
            },
            {
                "lng": -2.6806640625,
                "lat": 36.686041276581925
            },
            {
                "lng": -2.6174926757812496,
                "lat": 36.721273880045004
            },
            {
                "lng": -2.5543212890625,
                "lat": 36.8092847020594
            },
            {
                "lng": -2.4554443359375,
                "lat": 36.83127162140714
            },
            {
                "lng": -2.30438232421875,
                "lat": 36.81808022778526
            },
            {
                "lng": -2.2137451171875,
                "lat": 36.72347538145935
            },
            {
                "lng": -2.1450805664062496,
                "lat": 36.71026542647845
            },
            {
                "lng": -1.9857788085937502,
                "lat": 36.8510544475565
            },
            {
                "lng": -1.86767578125,
                "lat": 37.02886944696474
            },
            {
                "lng": -1.77978515625,
                "lat": 37.2368886685595
            },
            {
                "lng": -1.6259765625,
                "lat": 37.37424981026882
            },
            {
                "lng": -1.7368698120117188,
                "lat": 37.44215478101228
            },
            {
                "lng": -1.8103408813476565,
                "lat": 37.4519672738549
            },
            {
                "lng": -1.8079376220703125,
                "lat": 37.43288624495853
            },
            {
                "lng": -1.9246673583984375,
                "lat": 37.552743280459694
            },
            {
                "lng": -2.0129013061523438,
                "lat": 37.67240786750202
            },
            {
                "lng": -2.0094680786132812,
                "lat": 37.77722770873696
            },
            {
                "lng": -1.9727325439453125,
                "lat": 37.86943313301452
            },
            {
                "lng": -2.120361328125,
                "lat": 37.90113599940821
            },
            {
                "lng": -2.1701431274414062,
                "lat": 37.89029894809523
            },
            {
                "lng": -2.344207763671875,
                "lat": 38.02483602718798
            },
            {
                "lng": -2.54608154296875,
                "lat": 38.07998712800633
            },
            {
                "lng": -2.454071044921875,
                "lat": 38.18260873429114
            },
            {
                "lng": -2.439651489257812,
                "lat": 38.28050457181879
            },
            {
                "lng": -2.4805068969726562,
                "lat": 38.29694245262843
            },
            {
                "lng": -2.487030029296875,
                "lat": 38.39010980118257
            },
            {
                "lng": -2.5546646118164062,
                "lat": 38.40410147066251
            },
            {
                "lng": -2.5934600830078125,
                "lat": 38.511639141458616
            },
            {
                "lng": -2.684783935546875,
                "lat": 38.49874308602779
            },
            {
                "lng": -2.77130126953125,
                "lat": 38.53393312125598
            },
            {
                "lng": -2.8832244873046875,
                "lat": 38.45547070594816
            },
            {
                "lng": -2.959442138671875,
                "lat": 38.47240646975172
            },
            {
                "lng": -3.000640869140625,
                "lat": 38.4145934456796
            },
            {
                "lng": -3.0600357055664062,
                "lat": 38.48288852101284
            },
            {
                "lng": -3.127670288085937,
                "lat": 38.44310239838567
            },
            {
                "lng": -3.3134078979492188,
                "lat": 38.48046972138692
            },
            {
                "lng": -3.37005615234375,
                "lat": 38.47563187862808
            },
            {
                "lng": -3.4256744384765625,
                "lat": 38.4059847578341
            },
            {
                "lng": -3.5091018676757812,
                "lat": 38.406522830869775
            },
            {
                "lng": -3.5805130004882812,
                "lat": 38.4560084103617
            },
            {
                "lng": -3.6203384399414062,
                "lat": 38.40087286420115
            },
            {
                "lng": -3.80950927734375,
                "lat": 38.42508389732895
            },
            {
                "lng": -3.8551712036132812,
                "lat": 38.37799944020038
            },
            {
                "lng": -3.9825439453125,
                "lat": 38.36723297274062
            },
            {
                "lng": -4.275054931640624,
                "lat": 38.40168002933614
            },
            {
                "lng": -4.2681884765625,
                "lat": 38.350811025814814
            },
            {
                "lng": -4.28466796875,
                "lat": 38.34596449365382
            },
            {
                "lng": -4.467315673828125,
                "lat": 38.4207803065881
            },
            {
                "lng": -4.685325622558593,
                "lat": 38.5580995115263
            },
            {
                "lng": -4.857673645019531,
                "lat": 38.61177351991072
            },
            {
                "lng": -4.878959655761719,
                "lat": 38.68631373688367
            },
            {
                "lng": -5.0008392333984375,
                "lat": 38.693817085390684
            },
            {
                "lng": -5.042724609375,
                "lat": 38.7318576646415
            },
            {
                "lng": -5.097999572753906,
                "lat": 38.70989303926043
            },
            {
                "lng": -5.18280029296875,
                "lat": 38.71873327340352
            },
            {
                "lng": -5.181770324707031,
                "lat": 38.6686241590437
            },
            {
                "lng": -5.293006896972656,
                "lat": 38.60989560714296
            },
            {
                "lng": -5.307426452636719,
                "lat": 38.57796357021356
            },
            {
                "lng": -5.372314453125,
                "lat": 38.58467315983427
            },
            {
                "lng": -5.3853607177734375,
                "lat": 38.556488671509264
            },
            {
                "lng": -5.489387512207031,
                "lat": 38.46568640449255
            },
            {
                "lng": -5.580711364746094,
                "lat": 38.42024233971639
            },
            {
                "lng": -5.563888549804687,
                "lat": 38.37826858136171
            },
            {
                "lng": -5.57281494140625,
                "lat": 38.329807044201374
            },
            {
                "lng": -5.527153015136719,
                "lat": 38.27053224010455
            },
            {
                "lng": -5.523033142089844,
                "lat": 38.22307753495298
            },
            {
                "lng": -5.5377960205078125,
                "lat": 38.16479533621134
            },
            {
                "lng": -5.597190856933594,
                "lat": 38.1334763895322
            },
            {
                "lng": -5.6325531005859375,
                "lat": 38.13860713787158
            },
            {
                "lng": -5.697784423828125,
                "lat": 38.08377048360514
            },
            {
                "lng": -5.736579895019531,
                "lat": 38.08890472451228
            },
            {
                "lng": -5.738639831542969,
                "lat": 38.13428653167246
            },
            {
                "lng": -5.695037841796875,
                "lat": 38.154537162312145
            },
            {
                "lng": -5.700874328613281,
                "lat": 38.172622971624826
            },
            {
                "lng": -5.68267822265625,
                "lat": 38.15804670000032
            },
            {
                "lng": -5.692634582519531,
                "lat": 38.1847676381822
            },
            {
                "lng": -5.733146667480469,
                "lat": 38.19798952846822
            },
            {
                "lng": -5.881805419921875,
                "lat": 38.161016176890456
            },
            {
                "lng": -5.92884063720703,
                "lat": 38.10430528370985
            },
            {
                "lng": -5.9099578857421875,
                "lat": 38.068365597582506
            },
            {
                "lng": -5.949440002441406,
                "lat": 37.99724489645483
            },
            {
                "lng": -6.0143280029296875,
                "lat": 37.996162679728116
            },
            {
                "lng": -6.109428405761719,
                "lat": 37.985069037626516
            },
            {
                "lng": -6.181182861328125,
                "lat": 37.943926752499856
            },
            {
                "lng": -6.345634460449219,
                "lat": 37.9991387373021
            },
            {
                "lng": -6.368293762207031,
                "lat": 38.04944287754316
            },
            {
                "lng": -6.449317932128906,
                "lat": 38.05944549633448
            },
            {
                "lng": -6.474723815917969,
                "lat": 38.0091482264894
            },
            {
                "lng": -6.584587097167969,
                "lat": 38.02050869343087
            },
            {
                "lng": -6.581153869628906,
                "lat": 38.053768502070696
            },
            {
                "lng": -6.627159118652344,
                "lat": 38.09917212458053
            },
            {
                "lng": -6.737709045410155,
                "lat": 38.091066402284966
            },
            {
                "lng": -6.8149566650390625,
                "lat": 38.119162395618986
            },
            {
                "lng": -6.795387268066406,
                "lat": 38.17748108114799
            },
            {
                "lng": -6.855812072753906,
                "lat": 38.17937025849983
            },
            {
                "lng": -6.9330596923828125,
                "lat": 38.20770204069946
            },
            {
                "lng": -6.970138549804687,
                "lat": 38.161016176890456
            },
            {
                "lng": -6.956748962402344,
                "lat": 38.15156742157968
            },
            {
                "lng": -6.977348327636719,
                "lat": 38.10592620640843
            },
            {
                "lng": -7.0058441162109375,
                "lat": 38.023754217706944
            },
            {
                "lng": -7.061119079589844,
                "lat": 38.019967758742766
            },
            {
                "lng": -7.101287841796875,
                "lat": 38.04619849140099
            },
            {
                "lng": -7.1294403076171875,
                "lat": 38.02213147353745
            },
            {
                "lng": -7.12738037109375,
                "lat": 38.002655740556705
            },
            {
                "lng": -7.1775054931640625,
                "lat": 37.995351006703814
            },
            {
                "lng": -7.206344604492188,
                "lat": 38.00319680300937
            },
            {
                "lng": -7.266769409179688,
                "lat": 37.975597528091235
            },
            {
                "lng": -7.253723144531249,
                "lat": 37.93905311334205
            },
            {
                "lng": -7.2818756103515625,
                "lat": 37.8962595237529
            },
            {
                "lng": -7.304878234863281,
                "lat": 37.837445479729666
            },
            {
                "lng": -7.392425537109376,
                "lat": 37.769629187677
            },
            {
                "lng": -7.446327209472656,
                "lat": 37.691155980536266
            },
            {
                "lng": -7.503318786621093,
                "lat": 37.5856702356572
            },
            {
                "lng": -7.511215209960937,
                "lat": 37.52878726238273
            },
            {
                "lng": -7.441520690917969,
                "lat": 37.395527866984104
            },
            {
                "lng": -7.410621643066405,
                "lat": 37.180561015389465
            },
            {
                "lng": -7.3944854736328125,
                "lat": 37.16359980197957
            },
            {
                "lng": -7.33783721923828,
                "lat": 37.18384339111027
            },
            {
                "lng": -7.263336181640625,
                "lat": 37.20380810334558
            },
            {
                "lng": -7.0800018310546875,
                "lat": 37.20708946859002
            },
            {
                "lng": -6.9330596923828125,
                "lat": 37.16168458708581
            },
            {
                "lng": -6.739082336425781,
                "lat": 37.092430683283474
            },
            {
                "lng": -6.546478271484375,
                "lat": 36.99021354687846
            },
            {
                "lng": -6.456871032714844,
                "lat": 36.90982318631135
            },
            {
                "lng": -6.393699645996093,
                "lat": 36.79443996095986
            },
            {
                "lng": -6.443824768066406,
                "lat": 36.75098882435506
            },
            {
                "lng": -6.448287963867187,
                "lat": 36.712742466063354
            },
            {
                "lng": -6.395759582519531,
                "lat": 36.61332303966068
            },
            {
                "lng": -6.335334777832031,
                "lat": 36.53667433697152
            },
            {
                "lng": -6.253623962402344,
                "lat": 36.43951363839656
            },
            {
                "lng": -6.180839538574219,
                "lat": 36.359098472783266
            },
            {
                "lng": -6.12762451171875,
                "lat": 36.2628226848984
            },
            {
                "lng": -6.031837463378906,
                "lat": 36.17612830717087
            },
            {
                "lng": -5.915794372558594,
                "lat": 36.17973094416368
            },
            {
                "lng": -5.84197998046875,
                "lat": 36.11735423846348
            },
            {
                "lng": -5.802497863769531,
                "lat": 36.077407119583334
            },
            {
                "lng": -5.775375366210937,
                "lat": 36.08434383998265
            },
            {
                "lng": -5.726966857910156,
                "lat": 36.059368782721876
            },
            {
                "lng": -5.686798095703125,
                "lat": 36.064364428590025
            },
            {
                "lng": -5.615730285644531,
                "lat": 36.009394882511685
            },
            {
                "lng": -5.57830810546875,
                "lat": 36.003840269855914
            },
            {
                "lng": -5.495567321777344,
                "lat": 36.04743345598549
            },
            {
                "lng": -5.428276062011719,
                "lat": 36.056038175935186
            },
            {
                "lng": -5.41351318359375,
                "lat": 36.08295654486136
            },
            {
                "lng": -5.3118896484375,
                "lat": 36.1312200154285
            }
        ]
    ],
    [
        [
            {
                "lng": -0.7221794128417969,
                "lat": 42.91922355466844
            },
            {
                "lng": -0.7817459106445312,
                "lat": 42.92400035365673
            },
            {
                "lng": -0.8191680908203125,
                "lat": 42.903004816555914
            },
            {
                "lng": -0.817108154296875,
                "lat": 42.87684468442569
            },
            {
                "lng": -0.8564186096191406,
                "lat": 42.84614269562532
            },
            {
                "lng": -0.84869384765625,
                "lat": 42.79136972365016
            },
            {
                "lng": -0.8696365356445312,
                "lat": 42.761003352579635
            },
            {
                "lng": -0.8989906311035156,
                "lat": 42.76175954256288
            },
            {
                "lng": -0.9010505676269531,
                "lat": 42.742599885034515
            },
            {
                "lng": -0.924053192138672,
                "lat": 42.743608435725896
            },
            {
                "lng": -0.9547805786132812,
                "lat": 42.71157894243346
            },
            {
                "lng": -0.9813880920410155,
                "lat": 42.70451509683823
            },
            {
                "lng": -1.0224151611328125,
                "lat": 42.702244404324205
            },
            {
                "lng": -1.0399246215820312,
                "lat": 42.68962793359915
            },
            {
                "lng": -1.0400962829589844,
                "lat": 42.6558031527677
            },
            {
                "lng": -1.0529708862304688,
                "lat": 42.646333965963
            },
            {
                "lng": -1.0869598388671875,
                "lat": 42.6486067022724
            },
            {
                "lng": -1.157684326171875,
                "lat": 42.64734408124088
            },
            {
                "lng": -1.1561393737792969,
                "lat": 42.61475959854333
            },
            {
                "lng": -1.1813735961914062,
                "lat": 42.611348608541334
            },
            {
                "lng": -1.1569976806640625,
                "lat": 42.59985093305481
            },
            {
                "lng": -1.1748504638671875,
                "lat": 42.59479633838067
            },
            {
                "lng": -1.2040328979492188,
                "lat": 42.577734054464145
            },
            {
                "lng": -1.2031745910644531,
                "lat": 42.55093052460999
            },
            {
                "lng": -1.229095458984375,
                "lat": 42.5425836789121
            },
            {
                "lng": -1.2431716918945312,
                "lat": 42.54941299931396
            },
            {
                "lng": -1.26617431640625,
                "lat": 42.55649446837131
            },
            {
                "lng": -1.2919235229492188,
                "lat": 42.512475179076006
            },
            {
                "lng": -1.2783622741699219,
                "lat": 42.49880771184271
            },
            {
                "lng": -1.2740707397460938,
                "lat": 42.48336494177809
            },
            {
                "lng": -1.2871170043945312,
                "lat": 42.460320280354544
            },
            {
                "lng": -1.3284873962402342,
                "lat": 42.43980086209991
            },
            {
                "lng": -1.3420486450195312,
                "lat": 42.41965489682774
            },
            {
                "lng": -1.360931396484375,
                "lat": 42.37820227823592
            },
            {
                "lng": -1.3411903381347656,
                "lat": 42.37389064842449
            },
            {
                "lng": -1.3295173645019531,
                "lat": 42.362476081807
            },
            {
                "lng": -1.3382720947265625,
                "lat": 42.34674594813072
            },
            {
                "lng": -1.3521766662597656,
                "lat": 42.338371852170226
            },
            {
                "lng": -1.3997268676757812,
                "lat": 42.293564192170095
            },
            {
                "lng": -1.3897705078125,
                "lat": 42.27997596635596
            },
            {
                "lng": -1.4041900634765625,
                "lat": 42.239574968838696
            },
            {
                "lng": -1.4198112487792969,
                "lat": 42.215423655170284
            },
            {
                "lng": -1.3974952697753906,
                "lat": 42.19291648699529
            },
            {
                "lng": -1.4016151428222656,
                "lat": 42.12840242902534
            },
            {
                "lng": -1.3672828674316406,
                "lat": 42.10815666179861
            },
            {
                "lng": -1.3593864440917969,
                "lat": 42.08382772319129
            },
            {
                "lng": -1.3331222534179688,
                "lat": 42.0729977077829
            },
            {
                "lng": -1.3125228881835935,
                "lat": 42.069047477502835
            },
            {
                "lng": -1.3068580627441406,
                "lat": 42.044066137408514
            },
            {
                "lng": -1.3489151000976562,
                "lat": 42.00785125130589
            },
            {
                "lng": -1.3736343383789062,
                "lat": 41.96383006623733
            },
            {
                "lng": -1.3863372802734373,
                "lat": 41.9580859285653
            },
            {
                "lng": -1.380157470703125,
                "lat": 41.95157527990444
            },
            {
                "lng": -1.3822174072265625,
                "lat": 41.94391484176801
            },
            {
                "lng": -1.3993835449218748,
                "lat": 41.93804121581888
            },
            {
                "lng": -1.4208412170410156,
                "lat": 41.914796782203275
            },
            {
                "lng": -1.4989471435546875,
                "lat": 41.926164623785155
            },
            {
                "lng": -1.5183448791503906,
                "lat": 41.91147545749747
            },
            {
                "lng": -1.5796279907226562,
                "lat": 41.92080027673263
            },
            {
                "lng": -1.6113853454589844,
                "lat": 41.94914957408812
            },
            {
                "lng": -1.6747283935546875,
                "lat": 41.9657446637254
            },
            {
                "lng": -1.6805648803710938,
                "lat": 41.957064694324885
            },
            {
                "lng": -1.7157554626464844,
                "lat": 41.9566817272656
            },
            {
                "lng": -1.7900848388671875,
                "lat": 41.9920326482688
            },
            {
                "lng": -1.8511962890624998,
                "lat": 42.001983518663955
            },
            {
                "lng": -1.8561744689941406,
                "lat": 41.96625521333851
            },
            {
                "lng": -1.8573760986328127,
                "lat": 41.90917597761326
            },
            {
                "lng": -1.8395233154296873,
                "lat": 41.88694340165634
            },
            {
                "lng": -1.8340301513671875,
                "lat": 41.864447405239375
            },
            {
                "lng": -1.8209838867187498,
                "lat": 41.86265761100228
            },
            {
                "lng": -1.8204689025878906,
                "lat": 41.84539631008134
            },
            {
                "lng": -1.8201255798339844,
                "lat": 41.828514089509326
            },
            {
                "lng": -1.845874786376953,
                "lat": 41.80395018285224
            },
            {
                "lng": -1.8535995483398438,
                "lat": 41.789232915019845
            },
            {
                "lng": -1.8285369873046873,
                "lat": 41.7806569487635
            },
            {
                "lng": -1.8038177490234375,
                "lat": 41.75274512067056
            },
            {
                "lng": -1.8106842041015625,
                "lat": 41.73737562993509
            },
            {
                "lng": -1.77703857421875,
                "lat": 41.72623044860004
            },
            {
                "lng": -1.7861366271972656,
                "lat": 41.71175163654833
            },
            {
                "lng": -1.7954063415527342,
                "lat": 41.69752591075902
            },
            {
                "lng": -1.8110275268554685,
                "lat": 41.68804034502165
            },
            {
                "lng": -1.8060493469238281,
                "lat": 41.664833269223756
            },
            {
                "lng": -1.860980987548828,
                "lat": 41.660985984169145
            },
            {
                "lng": -1.8711090087890625,
                "lat": 41.64110468287587
            },
            {
                "lng": -1.8977165222167969,
                "lat": 41.63263723394463
            },
            {
                "lng": -1.9231224060058592,
                "lat": 41.5999116386658
            },
            {
                "lng": -1.984062194824219,
                "lat": 41.60671479599115
            },
            {
                "lng": -1.9971084594726562,
                "lat": 41.579497863194455
            },
            {
                "lng": -1.9717025756835938,
                "lat": 41.55201252876353
            },
            {
                "lng": -1.977710723876953,
                "lat": 41.526700273554184
            },
            {
                "lng": -1.9797706604003906,
                "lat": 41.491606508001276
            },
            {
                "lng": -1.9548797607421875,
                "lat": 41.46794283615215
            },
            {
                "lng": -1.9500732421875,
                "lat": 41.4355198746972
            },
            {
                "lng": -1.9526481628417969,
                "lat": 41.4249660516211
            },
            {
                "lng": -1.9341087341308596,
                "lat": 41.41981722266227
            },
            {
                "lng": -1.9366836547851562,
                "lat": 41.40797336681306
            },
            {
                "lng": -2.0238876342773438,
                "lat": 41.384150380474864
            },
            {
                "lng": -2.043628692626953,
                "lat": 41.39174892980349
            },
            {
                "lng": -2.0328140258789062,
                "lat": 41.40771586770284
            },
            {
                "lng": -2.0359039306640625,
                "lat": 41.42766902339905
            },
            {
                "lng": -2.050151824951172,
                "lat": 41.435133789455435
            },
            {
                "lng": -2.1028518676757812,
                "lat": 41.44710136406431
            },
            {
                "lng": -2.116584777832031,
                "lat": 41.430371882652814
            },
            {
                "lng": -2.117443084716797,
                "lat": 41.40668586105652
            },
            {
                "lng": -2.117786407470703,
                "lat": 41.38350639479881
            },
            {
                "lng": -2.149200439453125,
                "lat": 41.35671093975818
            },
            {
                "lng": -2.1646499633789062,
                "lat": 41.35555127193846
            },
            {
                "lng": -2.1564102172851562,
                "lat": 41.33274027282085
            },
            {
                "lng": -2.171001434326172,
                "lat": 41.31997809386106
            },
            {
                "lng": -2.1735763549804688,
                "lat": 41.29251159835366
            },
            {
                "lng": -2.1646499633789062,
                "lat": 41.284127499930406
            },
            {
                "lng": -2.1582984924316406,
                "lat": 41.255355404938406
            },
            {
                "lng": -2.1512603759765625,
                "lat": 41.226183305514596
            },
            {
                "lng": -2.1471405029296875,
                "lat": 41.18511378854678
            },
            {
                "lng": -2.0808792114257812,
                "lat": 41.17167665514729
            },
            {
                "lng": -2.0525550842285156,
                "lat": 41.148413563966386
            },
            {
                "lng": -2.0458602905273438,
                "lat": 41.15539335830357
            },
            {
                "lng": -1.988868713378906,
                "lat": 41.162372409523385
            },
            {
                "lng": -1.9650077819824217,
                "lat": 41.17348566059416
            },
            {
                "lng": -1.9500732421875,
                "lat": 41.16792927067348
            },
            {
                "lng": -1.9377136230468748,
                "lat": 41.14815503879421
            },
            {
                "lng": -1.9215774536132812,
                "lat": 41.134451746037804
            },
            {
                "lng": -1.8963432312011717,
                "lat": 41.13548605670214
            },
            {
                "lng": -1.8707656860351565,
                "lat": 41.10923538033988
            },
            {
                "lng": -1.8201255798339844,
                "lat": 41.09448901739586
            },
            {
                "lng": -1.792488098144531,
                "lat": 41.07792775176958
            },
            {
                "lng": -1.764678955078125,
                "lat": 41.06149174603333
            },
            {
                "lng": -1.7303466796874998,
                "lat": 41.0300318746253
            },
            {
                "lng": -1.6721534729003906,
                "lat": 40.987025353939416
            },
            {
                "lng": -1.6623687744140625,
                "lat": 40.98002766348274
            },
            {
                "lng": -1.6141319274902344,
                "lat": 40.94399076640032
            },
            {
                "lng": -1.6072654724121094,
                "lat": 40.926872832578326
            },
            {
                "lng": -1.626319885253906,
                "lat": 40.90014961924334
            },
            {
                "lng": -1.6187667846679685,
                "lat": 40.87717978437396
            },
            {
                "lng": -1.5751647949218748,
                "lat": 40.83134608188173
            },
            {
                "lng": -1.5579986572265625,
                "lat": 40.830306990312565
            },
            {
                "lng": -1.5423774719238281,
                "lat": 40.80978159527817
            },
            {
                "lng": -1.5410041809082031,
                "lat": 40.78639049480198
            },
            {
                "lng": -1.539459228515625,
                "lat": 40.762861133145016
            },
            {
                "lng": -1.5600585937499998,
                "lat": 40.74413568925235
            },
            {
                "lng": -1.5566253662109375,
                "lat": 40.72540497175605
            },
            {
                "lng": -1.5535354614257812,
                "lat": 40.70731962476409
            },
            {
                "lng": -1.5365409851074217,
                "lat": 40.69157226543675
            },
            {
                "lng": -1.5380859375,
                "lat": 40.668399962792876
            },
            {
                "lng": -1.5502738952636719,
                "lat": 40.64235405823368
            },
            {
                "lng": -1.5634918212890625,
                "lat": 40.61603737424185
            },
            {
                "lng": -1.5470123291015623,
                "lat": 40.59805268712332
            },
            {
                "lng": -1.5962791442871094,
                "lat": 40.564024938467114
            },
            {
                "lng": -1.6738700866699219,
                "lat": 40.59153530173193
            },
            {
                "lng": -1.6982460021972656,
                "lat": 40.55463492731125
            },
            {
                "lng": -1.6967010498046875,
                "lat": 40.48625684448605
            },
            {
                "lng": -1.7504310607910156,
                "lat": 40.44786150194002
            },
            {
                "lng": -1.8051910400390623,
                "lat": 40.40931350359072
            },
            {
                "lng": -1.77703857421875,
                "lat": 40.38891986882411
            },
            {
                "lng": -1.7021942138671875,
                "lat": 40.32822537016228
            },
            {
                "lng": -1.7303466796874998,
                "lat": 40.30990164580519
            },
            {
                "lng": -1.7197036743164062,
                "lat": 40.277299305989864
            },
            {
                "lng": -1.6967010498046875,
                "lat": 40.309378037751145
            },
            {
                "lng": -1.6160202026367188,
                "lat": 40.24979113113809
            },
            {
                "lng": -1.5363693237304688,
                "lat": 40.19041398364302
            },
            {
                "lng": -1.5128517150878906,
                "lat": 40.20391931854168
            },
            {
                "lng": -1.4728546142578125,
                "lat": 40.18726672309203
            },
            {
                "lng": -1.4445304870605469,
                "lat": 40.19933042879484
            },
            {
                "lng": -1.4522552490234373,
                "lat": 40.141877489503514
            },
            {
                "lng": -1.3825607299804685,
                "lat": 40.13899044275822
            },
            {
                "lng": -1.3552665710449219,
                "lat": 40.13150979643892
            },
            {
                "lng": -1.316986083984375,
                "lat": 40.150537893668925
            },
            {
                "lng": -1.32110595703125,
                "lat": 40.19880596447519
            },
            {
                "lng": -1.2975883483886719,
                "lat": 40.215193556924326
            },
            {
                "lng": -1.2471199035644531,
                "lat": 40.116546033468396
            },
            {
                "lng": -1.1448097229003906,
                "lat": 40.11523326555286
            },
            {
                "lng": -1.0938262939453125,
                "lat": 40.08582062287249
            },
            {
                "lng": -1.0727119445800781,
                "lat": 40.052716203284696
            },
            {
                "lng": -1.1130523681640625,
                "lat": 40.026562852997486
            },
            {
                "lng": -1.1657524108886719,
                "lat": 40.01275930398436
            },
            {
                "lng": -1.1418914794921875,
                "lat": 39.97291055131899
            },
            {
                "lng": -1.061553955078125,
                "lat": 39.980803239473126
            },
            {
                "lng": -0.9743499755859374,
                "lat": 39.980803239473126
            },
            {
                "lng": -0.9152984619140625,
                "lat": 39.95764876954889
            },
            {
                "lng": -0.8933258056640625,
                "lat": 39.85810061614039
            },
            {
                "lng": -0.8404541015624999,
                "lat": 39.86231722624386
            },
            {
                "lng": -0.7917022705078125,
                "lat": 39.884450178234395
            },
            {
                "lng": -0.8425140380859375,
                "lat": 39.941330683786894
            },
            {
                "lng": -0.8438873291015625,
                "lat": 39.977120098439634
            },
            {
                "lng": -0.7748794555664062,
                "lat": 40.00105696645539
            },
            {
                "lng": -0.756683349609375,
                "lat": 40.04654018618778
            },
            {
                "lng": -0.688018798828125,
                "lat": 40.04654018618778
            },
            {
                "lng": -0.615234375,
                "lat": 40.07386810509482
            },
            {
                "lng": -0.611114501953125,
                "lat": 40.125603441361314
            },
            {
                "lng": -0.5692291259765625,
                "lat": 40.17834869182105
            },
            {
                "lng": -0.547943115234375,
                "lat": 40.248873999337036
            },
            {
                "lng": -0.49713134765625,
                "lat": 40.22869395564039
            },
            {
                "lng": -0.39756774902343744,
                "lat": 40.25909276567398
            },
            {
                "lng": -0.3680419921875,
                "lat": 40.30990164580519
            },
            {
                "lng": -0.2918243408203125,
                "lat": 40.366950584713514
            },
            {
                "lng": -0.278778076171875,
                "lat": 40.384212768155045
            },
            {
                "lng": -0.34469604492187494,
                "lat": 40.43754064484924
            },
            {
                "lng": -0.341949462890625,
                "lat": 40.45948689837198
            },
            {
                "lng": -0.2691650390625,
                "lat": 40.47776996827149
            },
            {
                "lng": -0.29937744140625,
                "lat": 40.52658747242724
            },
            {
                "lng": -0.2959442138671875,
                "lat": 40.614994915836924
            },
            {
                "lng": -0.38246154785156244,
                "lat": 40.61864344909241
            },
            {
                "lng": -0.3769683837890625,
                "lat": 40.672045577994275
            },
            {
                "lng": -0.3275299072265625,
                "lat": 40.67985693941085
            },
            {
                "lng": -0.3110504150390625,
                "lat": 40.660847697284815
            },
            {
                "lng": -0.2300262451171875,
                "lat": 40.69365477446245
            },
            {
                "lng": -0.22521972656249997,
                "lat": 40.75609977566361
            },
            {
                "lng": -0.1627349853515625,
                "lat": 40.79353864997009
            },
            {
                "lng": -0.102996826171875,
                "lat": 40.742574997542924
            },
            {
                "lng": -0.03261566162109375,
                "lat": 40.72540497175605
            },
            {
                "lng": 0.0116729736328125,
                "lat": 40.7290474687069
            },
            {
                "lng": 0.0418853759765625,
                "lat": 40.69235321394895
            },
            {
                "lng": 0.1064300537109375,
                "lat": 40.72800677563629
            },
            {
                "lng": 0.1572418212890625,
                "lat": 40.72332345541449
            },
            {
                "lng": 0.16101837158203125,
                "lat": 40.74491602137377
            },
            {
                "lng": 0.23345947265625,
                "lat": 40.776901754952355
            },
            {
                "lng": 0.27191162109374994,
                "lat": 40.82316279497129
            },
            {
                "lng": 0.251312255859375,
                "lat": 40.91818248731055
            },
            {
                "lng": 0.2931976318359375,
                "lat": 40.97575093157534
            },
            {
                "lng": 0.20084381103515625,
                "lat": 41.09461838585146
            },
            {
                "lng": 0.2176666259765625,
                "lat": 41.13574463182004
            },
            {
                "lng": 0.29903411865234375,
                "lat": 41.159270700725706
            },
            {
                "lng": 0.318603515625,
                "lat": 41.22721616850761
            },
            {
                "lng": 0.3769683837890625,
                "lat": 41.240900062867304
            },
            {
                "lng": 0.38349151611328125,
                "lat": 41.28993199051138
            },
            {
                "lng": 0.35945892333984375,
                "lat": 41.34253580504185
            },
            {
                "lng": 0.36735534667968744,
                "lat": 41.364441530542244
            },
            {
                "lng": 0.31620025634765625,
                "lat": 41.39689998354142
            },
            {
                "lng": 0.3426361083984375,
                "lat": 41.479518537809604
            },
            {
                "lng": 0.406494140625,
                "lat": 41.5008638535525
            },
            {
                "lng": 0.449066162109375,
                "lat": 41.543790344512374
            },
            {
                "lng": 0.4277801513671875,
                "lat": 41.60209386160467
            },
            {
                "lng": 0.3467559814453125,
                "lat": 41.604404370164495
            },
            {
                "lng": 0.328216552734375,
                "lat": 41.672398925907906
            },
            {
                "lng": 0.40546417236328125,
                "lat": 41.76055653463573
            },
            {
                "lng": 0.47035217285156244,
                "lat": 41.7656782571705
            },
            {
                "lng": 0.49884796142578125,
                "lat": 41.81712886667111
            },
            {
                "lng": 0.5537796020507812,
                "lat": 41.828642001860544
            },
            {
                "lng": 0.5867385864257812,
                "lat": 41.86700416724041
            },
            {
                "lng": 0.5970382690429688,
                "lat": 41.923737951221014
            },
            {
                "lng": 0.5541229248046875,
                "lat": 41.93676426902003
            },
            {
                "lng": 0.6039047241210938,
                "lat": 41.97455107110933
            },
            {
                "lng": 0.6543731689453124,
                "lat": 42.01206037830709
            },
            {
                "lng": 0.6766891479492188,
                "lat": 42.08803181932636
            },
            {
                "lng": 0.6983184814453125,
                "lat": 42.16391238682557
            },
            {
                "lng": 0.7244110107421875,
                "lat": 42.235635122140614
            },
            {
                "lng": 0.7498168945312499,
                "lat": 42.307022535158524
            },
            {
                "lng": 0.7525634765625,
                "lat": 42.34738030389109
            },
            {
                "lng": 0.737457275390625,
                "lat": 42.407741658078145
            },
            {
                "lng": 0.6945419311523438,
                "lat": 42.49235259142821
            },
            {
                "lng": 0.7518768310546875,
                "lat": 42.5733097370664
            },
            {
                "lng": 0.76629638671875,
                "lat": 42.60844280304181
            },
            {
                "lng": 0.6966018676757812,
                "lat": 42.63799988907408
            },
            {
                "lng": 0.655059814453125,
                "lat": 42.69252994883861
            },
            {
                "lng": 0.594635009765625,
                "lat": 42.70413665385325
            },
            {
                "lng": 0.5788421630859375,
                "lat": 42.69757660890004
            },
            {
                "lng": 0.5252838134765625,
                "lat": 42.70312746128158
            },
            {
                "lng": 0.47035217285156244,
                "lat": 42.70110902692345
            },
            {
                "lng": 0.43121337890625,
                "lat": 42.6910158708481
            },
            {
                "lng": 0.4003143310546875,
                "lat": 42.70565041195133
            },
            {
                "lng": 0.3604888916015625,
                "lat": 42.72330819571084
            },
            {
                "lng": 0.3179168701171875,
                "lat": 42.68344492725026
            },
            {
                "lng": 0.29388427734375,
                "lat": 42.67486340903166
            },
            {
                "lng": 0.262298583984375,
                "lat": 42.72078596277834
            },
            {
                "lng": 0.18058776855468747,
                "lat": 42.73894375124379
            },
            {
                "lng": 0.12016296386718749,
                "lat": 42.71069600569494
            },
            {
                "lng": 0.0748443603515625,
                "lat": 42.71725466441242
            },
            {
                "lng": 0.05424499511718749,
                "lat": 42.69505333013366
            },
            {
                "lng": 0.007553100585937499,
                "lat": 42.70211825230498
            },
            {
                "lng": -0.0061798095703125,
                "lat": 42.68394968553076
            },
            {
                "lng": -0.06111145019531251,
                "lat": 42.69505333013366
            },
            {
                "lng": -0.0830841064453125,
                "lat": 42.721794868255714
            },
            {
                "lng": -0.11947631835937499,
                "lat": 42.73894375124379
            },
            {
                "lng": -0.155181884765625,
                "lat": 42.788346354315784
            },
            {
                "lng": -0.164794921875,
                "lat": 42.79943131987838
            },
            {
                "lng": -0.2471923828125,
                "lat": 42.80900310137467
            },
            {
                "lng": -0.2547454833984375,
                "lat": 42.82109165587994
            },
            {
                "lng": -0.314483642578125,
                "lat": 42.85130270352123
            },
            {
                "lng": -0.35980224609374994,
                "lat": 42.823106185222734
            },
            {
                "lng": -0.3865814208984375,
                "lat": 42.799935134773136
            },
            {
                "lng": -0.42022705078124994,
                "lat": 42.80598059352671
            },
            {
                "lng": -0.44151306152343744,
                "lat": 42.79388908528402
            },
            {
                "lng": -0.48889160156250006,
                "lat": 42.81353658623225
            },
            {
                "lng": -0.50537109375,
                "lat": 42.829652952249425
            },
            {
                "lng": -0.5328369140625,
                "lat": 42.790865839016654
            },
            {
                "lng": -0.5513763427734374,
                "lat": 42.786330692715445
            },
            {
                "lng": -0.556182861328125,
                "lat": 42.776251400197715
            },
            {
                "lng": -0.5664825439453124,
                "lat": 42.78784244506899
            },
            {
                "lng": -0.5664825439453124,
                "lat": 42.80598059352671
            },
            {
                "lng": -0.613861083984375,
                "lat": 42.83468845508063
            },
            {
                "lng": -0.6832122802734375,
                "lat": 42.88300840687993
            },
            {
                "lng": -0.6969451904296874,
                "lat": 42.88200212690442
            },
            {
                "lng": -0.7305908203125,
                "lat": 42.897094603161904
            },
            {
                "lng": -0.736083984375,
                "lat": 42.913692061579354
            },
            {
                "lng": -0.7221794128417969,
                "lat": 42.91922355466844
            }
        ]
    ],
    [
        [
            {
                "lng": -7.05322265625,
                "lat": 43.55651037504758
            },
            {
                "lng": -7.174072265624999,
                "lat": 43.39706523932025
            },
            {
                "lng": -6.954345703125,
                "lat": 43.14909399920127
            },
            {
                "lng": -6.822509765624999,
                "lat": 43.197167282501276
            },
            {
                "lng": -6.943359374999999,
                "lat": 43.068887774169625
            },
            {
                "lng": -6.844482421875,
                "lat": 42.96446257387128
            },
            {
                "lng": -7.00927734375,
                "lat": 42.72305597703175
            },
            {
                "lng": -6.767578125,
                "lat": 42.89206418807337
            },
            {
                "lng": -6.580810546874999,
                "lat": 42.91620643817353
            },
            {
                "lng": -6.361083984374999,
                "lat": 43.052833917627936
            },
            {
                "lng": -6.1640167236328125,
                "lat": 43.045056319718455
            },
            {
                "lng": -5.999565124511719,
                "lat": 43.06913858232444
            },
            {
                "lng": -5.789794921875,
                "lat": 42.96446257387128
            },
            {
                "lng": -5.7025909423828125,
                "lat": 43.068887774169625
            },
            {
                "lng": -5.580024719238281,
                "lat": 43.032258770888234
            },
            {
                "lng": -5.461235046386719,
                "lat": 43.04530722536699
            },
            {
                "lng": -5.245456695556641,
                "lat": 43.1105078725329
            },
            {
                "lng": -5.064697265625,
                "lat": 43.16512263158296
            },
            {
                "lng": -4.932861328124999,
                "lat": 43.26145614459999
            },
            {
                "lng": -4.835529327392578,
                "lat": 43.17363613238778
            },
            {
                "lng": -4.74609375,
                "lat": 43.213183300738876
            },
            {
                "lng": -4.6259307861328125,
                "lat": 43.25320494908846
            },
            {
                "lng": -4.537353515625,
                "lat": 43.39706523932025
            },
            {
                "lng": -4.844970703125,
                "lat": 43.46089378008257
            },
            {
                "lng": -5.2294921875,
                "lat": 43.48481212891603
            },
            {
                "lng": -5.33935546875,
                "lat": 43.56447158721811
            },
            {
                "lng": -5.592041015625,
                "lat": 43.56447158721811
            },
            {
                "lng": -5.811767578125,
                "lat": 43.667871610117494
            },
            {
                "lng": -5.95458984375,
                "lat": 43.60426186809618
            },
            {
                "lng": -6.1962890625,
                "lat": 43.55651037504758
            },
            {
                "lng": -6.580810546874999,
                "lat": 43.58039085560786
            },
            {
                "lng": -6.767578125,
                "lat": 43.58039085560786
            },
            {
                "lng": -7.05322265625,
                "lat": 43.55651037504758
            }
        ]
    ],
    [
        [
            {
                "lng": 1.3018798828125,
                "lat": 39.04478604850143
            },
            {
                "lng": 1.5106201171875,
                "lat": 39.13006024213511
            },
            {
                "lng": 1.636962890625,
                "lat": 39.036252959636606
            },
            {
                "lng": 1.527099609375,
                "lat": 38.94659331893374
            },
            {
                "lng": 1.4501953125,
                "lat": 38.856820134743636
            },
            {
                "lng": 1.527099609375,
                "lat": 38.698372305893294
            },
            {
                "lng": 1.395263671875,
                "lat": 38.64261790634527
            },
            {
                "lng": 1.34033203125,
                "lat": 38.75408327579141
            },
            {
                "lng": 1.3128662109375,
                "lat": 38.86965182408357
            },
            {
                "lng": 1.2030029296875,
                "lat": 38.852542390364235
            },
            {
                "lng": 1.131591796875,
                "lat": 38.929502416386605
            },
            {
                "lng": 1.3018798828125,
                "lat": 39.04478604850143
            }
        ],
        [
            {
                "lng": 2.7850341796875,
                "lat": 39.854937988531276
            },
            {
                "lng": 2.5213623046875,
                "lat": 39.70296052957233
            },
            {
                "lng": 2.3236083984375,
                "lat": 39.59722324495565
            },
            {
                "lng": 2.3785400390625,
                "lat": 39.51251701659638
            },
            {
                "lng": 2.5323486328125,
                "lat": 39.470125122358176
            },
            {
                "lng": 2.65869140625,
                "lat": 39.5633531658293
            },
            {
                "lng": 2.74658203125,
                "lat": 39.436192999314095
            },
            {
                "lng": 2.8619384765625,
                "lat": 39.37677199661635
            },
            {
                "lng": 2.9937744140625,
                "lat": 39.34704251121735
            },
            {
                "lng": 3.0596923828124996,
                "lat": 39.25352462727606
            },
            {
                "lng": 3.2574462890625,
                "lat": 39.35129035526705
            },
            {
                "lng": 3.31787109375,
                "lat": 39.51675478434244
            },
            {
                "lng": 3.4222412109375,
                "lat": 39.592990390285024
            },
            {
                "lng": 3.49365234375,
                "lat": 39.715638134796336
            },
            {
                "lng": 3.328857421875,
                "lat": 39.77054750039529
            },
            {
                "lng": 3.2244873046875,
                "lat": 39.73253798438173
            },
            {
                "lng": 3.1365966796875,
                "lat": 39.787433886224406
            },
            {
                "lng": 3.1091308593749996,
                "lat": 39.842286020743394
            },
            {
                "lng": 3.197021484375,
                "lat": 39.8465036024177
            },
            {
                "lng": 3.18603515625,
                "lat": 39.8928799002948
            },
            {
                "lng": 3.0706787109375,
                "lat": 39.88023492849342
            },
            {
                "lng": 3.2025146484375,
                "lat": 39.939224840791965
            },
            {
                "lng": 3.0157470703125,
                "lat": 39.9434364619742
            },
            {
                "lng": 2.7850341796875,
                "lat": 39.854937988531276
            }
        ],
        [
            {
                "lng": 3.812255859375,
                "lat": 40.052847601823984
            },
            {
                "lng": 4.0484619140625,
                "lat": 40.07386810509482
            },
            {
                "lng": 4.1912841796875,
                "lat": 40.07386810509482
            },
            {
                "lng": 4.2791748046875,
                "lat": 39.977120098439634
            },
            {
                "lng": 4.339599609375,
                "lat": 39.85915479295669
            },
            {
                "lng": 4.2681884765625,
                "lat": 39.80853604144591
            },
            {
                "lng": 4.119873046875,
                "lat": 39.854937988531276
            },
            {
                "lng": 4.04296875,
                "lat": 39.92237576385941
            },
            {
                "lng": 3.9385986328125,
                "lat": 39.926588421909436
            },
            {
                "lng": 3.8232421874999996,
                "lat": 39.926588421909436
            },
            {
                "lng": 3.7957763671875,
                "lat": 39.998163944585805
            },
            {
                "lng": 3.75732421875,
                "lat": 40.04023218690448
            },
            {
                "lng": 3.812255859375,
                "lat": 40.052847601823984
            }
        ]
    ],
    [
        [
            {
                "lng": -13.8153076171875,
                "lat": 29.056169702743418
            },
            {
                "lng": -13.68896484375,
                "lat": 29.10897615145302
            },
            {
                "lng": -13.60107421875,
                "lat": 29.132970130878633
            },
            {
                "lng": -13.55712890625,
                "lat": 29.142566155107062
            },
            {
                "lng": -13.4967041015625,
                "lat": 29.25285598597376
            },
            {
                "lng": -13.4307861328125,
                "lat": 29.219302076779456
            },
            {
                "lng": -13.463745117187498,
                "lat": 29.10897615145302
            },
            {
                "lng": -13.46923828125,
                "lat": 29.022551511168352
            },
            {
                "lng": -13.5626220703125,
                "lat": 28.964894859921138
            },
            {
                "lng": -13.7384033203125,
                "lat": 28.916823103291662
            },
            {
                "lng": -13.782348632812498,
                "lat": 28.859107573773002
            },
            {
                "lng": -13.886718749999998,
                "lat": 28.85429649869795
            },
            {
                "lng": -13.8482666015625,
                "lat": 28.926439238621008
            },
            {
                "lng": -13.8153076171875,
                "lat": 29.056169702743418
            }
        ],
        [
            {
                "lng": -14.0020751953125,
                "lat": 28.73876397137029
            },
            {
                "lng": -13.897705078125,
                "lat": 28.772474183943032
            },
            {
                "lng": -13.826293945312498,
                "lat": 28.729130483430154
            },
            {
                "lng": -13.831787109375,
                "lat": 28.589345223446188
            },
            {
                "lng": -13.8592529296875,
                "lat": 28.478348692223165
            },
            {
                "lng": -13.8812255859375,
                "lat": 28.314053058069618
            },
            {
                "lng": -13.9581298828125,
                "lat": 28.23180985121185
            },
            {
                "lng": -14.1558837890625,
                "lat": 28.168875180063317
            },
            {
                "lng": -14.2327880859375,
                "lat": 28.13981591275445
            },
            {
                "lng": -14.30419921875,
                "lat": 28.052590823339862
            },
            {
                "lng": -14.403076171875,
                "lat": 28.042894772561617
            },
            {
                "lng": -14.507446289062498,
                "lat": 28.06713326012151
            },
            {
                "lng": -14.47998046875,
                "lat": 28.115593833316765
            },
            {
                "lng": -14.353637695312498,
                "lat": 28.120438687101064
            },
            {
                "lng": -14.2437744140625,
                "lat": 28.183401855246004
            },
            {
                "lng": -14.2108154296875,
                "lat": 28.26568239014648
            },
            {
                "lng": -14.1778564453125,
                "lat": 28.347899442570927
            },
            {
                "lng": -14.1558837890625,
                "lat": 28.41555985166584
            },
            {
                "lng": -14.0625,
                "lat": 28.545925723233474
            },
            {
                "lng": -14.0020751953125,
                "lat": 28.73876397137029
            }
        ],
        [
            {
                "lng": -15.6005859375,
                "lat": 28.164032516628076
            },
            {
                "lng": -15.4248046875,
                "lat": 28.13981591275445
            },
            {
                "lng": -15.4248046875,
                "lat": 28.057438520876673
            },
            {
                "lng": -15.380859374999998,
                "lat": 27.994401411046177
            },
            {
                "lng": -15.402832031250002,
                "lat": 27.858503954841247
            },
            {
                "lng": -15.5181884765625,
                "lat": 27.756468889550746
            },
            {
                "lng": -15.622558593749998,
                "lat": 27.75160768754938
            },
            {
                "lng": -15.765380859375002,
                "lat": 27.79535068974912
            },
            {
                "lng": -15.864257812499998,
                "lat": 27.892494332286603
            },
            {
                "lng": -15.803833007812498,
                "lat": 27.97984914504167
            },
            {
                "lng": -15.715942382812498,
                "lat": 28.06713326012151
            },
            {
                "lng": -15.6939697265625,
                "lat": 28.173717624327864
            },
            {
                "lng": -15.6005859375,
                "lat": 28.164032516628076
            }
        ],
        [
            {
                "lng": -16.787109375,
                "lat": 28.396232711680433
            },
            {
                "lng": -16.556396484375,
                "lat": 28.396232711680433
            },
            {
                "lng": -16.4300537109375,
                "lat": 28.502488316130417
            },
            {
                "lng": -16.270751953125,
                "lat": 28.579697994029317
            },
            {
                "lng": -16.116943359375,
                "lat": 28.603814407841327
            },
            {
                "lng": -16.1993408203125,
                "lat": 28.502488316130417
            },
            {
                "lng": -16.34765625,
                "lat": 28.405896722414823
            },
            {
                "lng": -16.3916015625,
                "lat": 28.30438068296278
            },
            {
                "lng": -16.4520263671875,
                "lat": 28.14465967167316
            },
            {
                "lng": -16.556396484375,
                "lat": 28.033197847676377
            },
            {
                "lng": -16.7047119140625,
                "lat": 28.008951712550974
            },
            {
                "lng": -16.76513671875,
                "lat": 28.115593833316765
            },
            {
                "lng": -16.842041015625,
                "lat": 28.22697003891834
            },
            {
                "lng": -16.8914794921875,
                "lat": 28.33339516919643
            },
            {
                "lng": -16.951904296875,
                "lat": 28.352733760237818
            },
            {
                "lng": -16.787109375,
                "lat": 28.396232711680433
            }
        ],
        [
            {
                "lng": -17.2705078125,
                "lat": 28.22213000715854
            },
            {
                "lng": -17.1661376953125,
                "lat": 28.178559849396983
            },
            {
                "lng": -17.0947265625,
                "lat": 28.13497193481315
            },
            {
                "lng": -17.1441650390625,
                "lat": 28.06713326012151
            },
            {
                "lng": -17.237548828125,
                "lat": 28.023500048883022
            },
            {
                "lng": -17.325439453125,
                "lat": 28.052590823339862
            },
            {
                "lng": -17.38037109375,
                "lat": 28.125283321961753
            },
            {
                "lng": -17.33642578125,
                "lat": 28.19308520918524
            },
            {
                "lng": -17.2705078125,
                "lat": 28.22213000715854
            }
        ],
        [
            {
                "lng": -17.896728515625,
                "lat": 28.849485201023
            },
            {
                "lng": -17.8363037109375,
                "lat": 28.835049972635147
            },
            {
                "lng": -17.7703857421875,
                "lat": 28.849485201023
            },
            {
                "lng": -17.7374267578125,
                "lat": 28.762843805266023
            },
            {
                "lng": -17.764892578124996,
                "lat": 28.700224692776985
            },
            {
                "lng": -17.764892578124996,
                "lat": 28.632746799225856
            },
            {
                "lng": -17.77587890625,
                "lat": 28.541100228636033
            },
            {
                "lng": -17.8363037109375,
                "lat": 28.478348692223165
            },
            {
                "lng": -17.8802490234375,
                "lat": 28.473520105140906
            },
            {
                "lng": -17.90771484375,
                "lat": 28.565225490654655
            },
            {
                "lng": -17.95166015625,
                "lat": 28.676130433078256
            },
            {
                "lng": -18.0010986328125,
                "lat": 28.76765910569126
            },
            {
                "lng": -17.9791259765625,
                "lat": 28.839861937967967
            },
            {
                "lng": -17.896728515625,
                "lat": 28.849485201023
            }
        ],
        [
            {
                "lng": -17.9901123046875,
                "lat": 27.839076094777816
            },
            {
                "lng": -17.9132080078125,
                "lat": 27.853647316127386
            },
            {
                "lng": -17.9296875,
                "lat": 27.766190642387492
            },
            {
                "lng": -17.962646484375,
                "lat": 27.668934069896217
            },
            {
                "lng": -18.0120849609375,
                "lat": 27.6592036443079
            },
            {
                "lng": -18.067016601562496,
                "lat": 27.702983735525834
            },
            {
                "lng": -18.1658935546875,
                "lat": 27.70784710660343
            },
            {
                "lng": -18.17138671875,
                "lat": 27.761329874505236
            },
            {
                "lng": -18.1219482421875,
                "lat": 27.780771643348196
            },
            {
                "lng": -18.0450439453125,
                "lat": 27.761329874505236
            },
            {
                "lng": -17.9901123046875,
                "lat": 27.839076094777816
            }
        ]
    ],
    [
        [
            {
                "lng": -4.537353515625,
                "lat": 43.39706523932025
            },
            {
                "lng": -4.625244140625,
                "lat": 43.25320494908846
            },
            {
                "lng": -4.835186004638672,
                "lat": 43.17351094244364
            },
            {
                "lng": -4.76806640625,
                "lat": 43.06086137134326
            },
            {
                "lng": -4.626102447509766,
                "lat": 43.037277735611376
            },
            {
                "lng": -4.427490234375,
                "lat": 43.06161389125079
            },
            {
                "lng": -4.295654296875,
                "lat": 42.97338078923806
            },
            {
                "lng": -4.219264984130859,
                "lat": 42.852183637398895
            },
            {
                "lng": -3.9440917968749996,
                "lat": 42.74701217318067
            },
            {
                "lng": -3.801784515380859,
                "lat": 42.811773603829344
            },
            {
                "lng": -3.9660644531249996,
                "lat": 42.91620643817353
            },
            {
                "lng": -3.955249786376953,
                "lat": 43.01343399741946
            },
            {
                "lng": -3.7138938903808594,
                "lat": 43.13331170781402
            },
            {
                "lng": -3.570556640625,
                "lat": 43.14909399920127
            },
            {
                "lng": -3.4160614013671875,
                "lat": 43.13306116240612
            },
            {
                "lng": -3.409881591796875,
                "lat": 43.248203680382346
            },
            {
                "lng": -3.262939453125,
                "lat": 43.297198404646366
            },
            {
                "lng": -3.173675537109375,
                "lat": 43.30119623257966
            },
            {
                "lng": -3.1482696533203125,
                "lat": 43.35114690203119
            },
            {
                "lng": -3.27392578125,
                "lat": 43.41302868475145
            },
            {
                "lng": -3.44970703125,
                "lat": 43.48481212891603
            },
            {
                "lng": -3.5815429687499996,
                "lat": 43.50872101129684
            },
            {
                "lng": -4.053955078125,
                "lat": 43.44494295526125
            },
            {
                "lng": -4.32861328125,
                "lat": 43.389081939117496
            },
            {
                "lng": -4.537353515625,
                "lat": 43.39706523932025
            }
        ]
    ],
    [
        [
            {
                "lng": -2.8585052490234375,
                "lat": 42.63799988907408
            },
            {
                "lng": -2.8900909423828125,
                "lat": 42.65864362768936
            },
            {
                "lng": -2.907857894897461,
                "lat": 42.7000367069807
            },
            {
                "lng": -2.96356201171875,
                "lat": 42.70968691975666
            },
            {
                "lng": -3.0535125732421875,
                "lat": 42.76591842249659
            },
            {
                "lng": -3.1417465209960938,
                "lat": 42.75381908743189
            },
            {
                "lng": -3.1582260131835938,
                "lat": 42.80472117166868
            },
            {
                "lng": -3.11187744140625,
                "lat": 42.86539613773223
            },
            {
                "lng": -3.124752044677734,
                "lat": 42.891561123996155
            },
            {
                "lng": -3.2104110717773438,
                "lat": 42.82436523272848
            },
            {
                "lng": -3.2842254638671875,
                "lat": 42.87420290059857
            },
            {
                "lng": -3.2399368286132812,
                "lat": 42.947878793180934
            },
            {
                "lng": -3.1846618652343746,
                "lat": 42.947627489405846
            },
            {
                "lng": -3.121833801269531,
                "lat": 42.91318917394982
            },
            {
                "lng": -3.0233001708984375,
                "lat": 42.907028467461494
            },
            {
                "lng": -2.9841613769531246,
                "lat": 42.94385780966297
            },
            {
                "lng": -3.0260467529296875,
                "lat": 42.95943765774348
            },
            {
                "lng": -3.0699920654296875,
                "lat": 43.004898198656456
            },
            {
                "lng": -3.1245803833007812,
                "lat": 43.007659910414674
            },
            {
                "lng": -3.146209716796875,
                "lat": 43.03326259667106
            },
            {
                "lng": -3.1743621826171875,
                "lat": 43.127548903746536
            },
            {
                "lng": -3.1541061401367188,
                "lat": 43.17588950749863
            },
            {
                "lng": -3.22174072265625,
                "lat": 43.173385752242844
            },
            {
                "lng": -3.263626098632812,
                "lat": 43.197918127289206
            },
            {
                "lng": -3.4160614013671875,
                "lat": 43.13306116240612
            },
            {
                "lng": -3.570556640625,
                "lat": 43.14909399920127
            },
            {
                "lng": -3.713722229003906,
                "lat": 43.13331170781402
            },
            {
                "lng": -3.955078125,
                "lat": 43.01343399741946
            },
            {
                "lng": -3.9660644531249996,
                "lat": 42.91620643817353
            },
            {
                "lng": -3.8016128540039062,
                "lat": 42.811773603829344
            },
            {
                "lng": -3.9440917968749996,
                "lat": 42.74688611216314
            },
            {
                "lng": -4.219093322753906,
                "lat": 42.85230948406997
            },
            {
                "lng": -4.295654296875,
                "lat": 42.973255189548716
            },
            {
                "lng": -4.427490234375,
                "lat": 43.061363052307875
            },
            {
                "lng": -4.6259307861328125,
                "lat": 43.037277735611376
            },
            {
                "lng": -4.76806640625,
                "lat": 43.06086137134326
            },
            {
                "lng": -4.835357666015625,
                "lat": 43.17363613238778
            },
            {
                "lng": -4.932861328124999,
                "lat": 43.26145614459999
            },
            {
                "lng": -5.064697265625,
                "lat": 43.16512263158296
            },
            {
                "lng": -5.461235046386719,
                "lat": 43.045056319718455
            },
            {
                "lng": -5.580024719238281,
                "lat": 43.032258770888234
            },
            {
                "lng": -5.7025909423828125,
                "lat": 43.06913858232444
            },
            {
                "lng": -5.790138244628906,
                "lat": 42.96446257387128
            },
            {
                "lng": -5.9992218017578125,
                "lat": 43.06913858232444
            },
            {
                "lng": -6.1640167236328125,
                "lat": 43.04530722536699
            },
            {
                "lng": -6.361427307128906,
                "lat": 43.05258304276628
            },
            {
                "lng": -6.581153869628906,
                "lat": 42.916457870190534
            },
            {
                "lng": -6.767234802246094,
                "lat": 42.89231571857325
            },
            {
                "lng": -7.0085906982421875,
                "lat": 42.72305597703175
            },
            {
                "lng": -7.042579650878906,
                "lat": 42.52069952914966
            },
            {
                "lng": -6.856155395507812,
                "lat": 42.512854788289424
            },
            {
                "lng": -6.822853088378906,
                "lat": 42.36640800003894
            },
            {
                "lng": -6.734619140625,
                "lat": 42.3016903282445
            },
            {
                "lng": -6.879844665527344,
                "lat": 42.23614350327826
            },
            {
                "lng": -7.00927734375,
                "lat": 42.09898663957465
            },
            {
                "lng": -6.954002380371094,
                "lat": 41.967914471324725
            },
            {
                "lng": -6.9440460205078125,
                "lat": 41.944170204536164
            },
            {
                "lng": -6.894264221191406,
                "lat": 41.94136115783449
            },
            {
                "lng": -6.869544982910156,
                "lat": 41.94876655946857
            },
            {
                "lng": -6.846199035644531,
                "lat": 41.944170204536164
            },
            {
                "lng": -6.8204498291015625,
                "lat": 41.94442556628153
            },
            {
                "lng": -6.811180114746094,
                "lat": 41.9942015603157
            },
            {
                "lng": -6.797447204589844,
                "lat": 41.99011884096809
            },
            {
                "lng": -6.7682647705078125,
                "lat": 41.984504674276074
            },
            {
                "lng": -6.7510986328125,
                "lat": 41.944170204536164
            },
            {
                "lng": -6.71539306640625,
                "lat": 41.93753044016756
            },
            {
                "lng": -6.682090759277344,
                "lat": 41.93574269317161
            },
            {
                "lng": -6.621665954589844,
                "lat": 41.94110578381598
            },
            {
                "lng": -6.596946716308594,
                "lat": 41.952596602106404
            },
            {
                "lng": -6.588706970214844,
                "lat": 41.96919079421467
            },
            {
                "lng": -6.5485382080078125,
                "lat": 41.94391484176801
            },
            {
                "lng": -6.5718841552734375,
                "lat": 41.884387437207835
            },
            {
                "lng": -6.515922546386719,
                "lat": 41.874929479660025
            },
            {
                "lng": -6.5361785888671875,
                "lat": 41.812778921301515
            },
            {
                "lng": -6.5478515625,
                "lat": 41.78027292344332
            },
            {
                "lng": -6.56982421875,
                "lat": 41.74544507131366
            },
            {
                "lng": -6.5430450439453125,
                "lat": 41.704959565516326
            },
            {
                "lng": -6.557464599609374,
                "lat": 41.70188367466828
            },
            {
                "lng": -6.5100860595703125,
                "lat": 41.661114230707746
            },
            {
                "lng": -6.478157043457031,
                "lat": 41.66265316924903
            },
            {
                "lng": -6.460304260253906,
                "lat": 41.66855209293752
            },
            {
                "lng": -6.449317932128906,
                "lat": 41.685476438493154
            },
            {
                "lng": -6.399192810058594,
                "lat": 41.68009190220902
            },
            {
                "lng": -6.348724365234375,
                "lat": 41.67573266186938
            },
            {
                "lng": -6.296882629394531,
                "lat": 41.661114230707746
            },
            {
                "lng": -6.2532806396484375,
                "lat": 41.631610800905406
            },
            {
                "lng": -6.2162017822265625,
                "lat": 41.6010669423553
            },
            {
                "lng": -6.1928558349609375,
                "lat": 41.579497863194455
            },
            {
                "lng": -6.1901092529296875,
                "lat": 41.57436130598913
            },
            {
                "lng": -6.250190734863281,
                "lat": 41.516032753077944
            },
            {
                "lng": -6.257743835449218,
                "lat": 41.51269075845857
            },
            {
                "lng": -6.299285888671875,
                "lat": 41.45533583232304
            },
            {
                "lng": -6.312332153320312,
                "lat": 41.41930231731321
            },
            {
                "lng": -6.3336181640625,
                "lat": 41.415440397070654
            },
            {
                "lng": -6.318168640136718,
                "lat": 41.38453676881922
            },
            {
                "lng": -6.35009765625,
                "lat": 41.3757780692323
            },
            {
                "lng": -6.3672637939453125,
                "lat": 41.39483961102923
            },
            {
                "lng": -6.395072937011719,
                "lat": 41.383248798742635
            },
            {
                "lng": -6.376533508300781,
                "lat": 41.36238012945534
            },
            {
                "lng": -6.413612365722656,
                "lat": 41.348206229287435
            },
            {
                "lng": -6.426658630371094,
                "lat": 41.335318187288294
            },
            {
                "lng": -6.441078186035156,
                "lat": 41.30566601169448
            },
            {
                "lng": -6.489143371582031,
                "lat": 41.29354341293028
            },
            {
                "lng": -6.493606567382812,
                "lat": 41.26696898724201
            },
            {
                "lng": -6.519355773925781,
                "lat": 41.27471022807078
            },
            {
                "lng": -6.553688049316406,
                "lat": 41.25251621514944
            },
            {
                "lng": -6.581840515136719,
                "lat": 41.237802073492276
            },
            {
                "lng": -6.592140197753906,
                "lat": 41.25587160800581
            },
            {
                "lng": -6.603126525878906,
                "lat": 41.24296530753572
            },
            {
                "lng": -6.649818420410156,
                "lat": 41.24373975746002
            },
            {
                "lng": -6.689987182617187,
                "lat": 41.21094668129228
            },
            {
                "lng": -6.709556579589844,
                "lat": 41.173227234302935
            },
            {
                "lng": -6.771354675292968,
                "lat": 41.133934584590065
            },
            {
                "lng": -6.755561828613281,
                "lat": 41.10470834043821
            },
            {
                "lng": -6.796073913574219,
                "lat": 41.05476085737834
            },
            {
                "lng": -6.8170166015625,
                "lat": 41.03404611081239
            },
            {
                "lng": -6.861305236816406,
                "lat": 41.027571415339786
            },
            {
                "lng": -6.918296813964844,
                "lat": 41.03818958175852
            },
            {
                "lng": -6.931686401367187,
                "lat": 41.027053412195706
            },
            {
                "lng": -6.8973541259765625,
                "lat": 40.9855999586963
            },
            {
                "lng": -6.8547821044921875,
                "lat": 40.937118189551214
            },
            {
                "lng": -6.840362548828125,
                "lat": 40.898203332302515
            },
            {
                "lng": -6.810836791992187,
                "lat": 40.883409680091006
            },
            {
                "lng": -6.800193786621094,
                "lat": 40.84550208206526
            },
            {
                "lng": -6.8273162841796875,
                "lat": 40.84290487729676
            },
            {
                "lng": -6.821136474609375,
                "lat": 40.777421721005936
            },
            {
                "lng": -6.8115234375,
                "lat": 40.684803661591246
            },
            {
                "lng": -6.821136474609375,
                "lat": 40.606654663050485
            },
            {
                "lng": -6.81976318359375,
                "lat": 40.550330732028456
            },
            {
                "lng": -6.848602294921875,
                "lat": 40.44381173426701
            },
            {
                "lng": -6.78955078125,
                "lat": 40.364334716590214
            },
            {
                "lng": -6.792297363281249,
                "lat": 40.332674666957814
            },
            {
                "lng": -6.861991882324218,
                "lat": 40.29681022665324
            },
            {
                "lng": -6.865081787109375,
                "lat": 40.26590441926665
            },
            {
                "lng": -6.8396759033203125,
                "lat": 40.25228042623786
            },
            {
                "lng": -6.803627014160156,
                "lat": 40.242846824049785
            },
            {
                "lng": -6.787147521972656,
                "lat": 40.25097028233546
            },
            {
                "lng": -6.758308410644531,
                "lat": 40.23996407224976
            },
            {
                "lng": -6.725349426269531,
                "lat": 40.269309988863206
            },
            {
                "lng": -6.693420410156249,
                "lat": 40.24389506699777
            },
            {
                "lng": -6.667671203613281,
                "lat": 40.25568668168462
            },
            {
                "lng": -6.6419219970703125,
                "lat": 40.268786066239855
            },
            {
                "lng": -6.6034698486328125,
                "lat": 40.26904802805884
            },
            {
                "lng": -6.5883636474609375,
                "lat": 40.2719295411023
            },
            {
                "lng": -6.560211181640625,
                "lat": 40.291834822174515
            },
            {
                "lng": -6.5636444091796875,
                "lat": 40.324299276456195
            },
            {
                "lng": -6.5306854248046875,
                "lat": 40.35073056591789
            },
            {
                "lng": -6.462364196777344,
                "lat": 40.37401292155378
            },
            {
                "lng": -6.439361572265625,
                "lat": 40.372182016401034
            },
            {
                "lng": -6.423912048339843,
                "lat": 40.39964037008388
            },
            {
                "lng": -6.3720703125,
                "lat": 40.40225486757065
            },
            {
                "lng": -6.36383056640625,
                "lat": 40.416632788688474
            },
            {
                "lng": -6.34185791015625,
                "lat": 40.44537941521531
            },
            {
                "lng": -6.279029846191406,
                "lat": 40.45791954650313
            },
            {
                "lng": -6.266326904296875,
                "lat": 40.47359141968406
            },
            {
                "lng": -6.256370544433594,
                "lat": 40.47071851668331
            },
            {
                "lng": -6.2381744384765625,
                "lat": 40.488215202002614
            },
            {
                "lng": -6.198348999023437,
                "lat": 40.48247052458949
            },
            {
                "lng": -6.161613464355469,
                "lat": 40.45765831763663
            },
            {
                "lng": -6.1489105224609375,
                "lat": 40.43649540640561
            },
            {
                "lng": -6.11663818359375,
                "lat": 40.44407301696414
            },
            {
                "lng": -6.13037109375,
                "lat": 40.420030757575326
            },
            {
                "lng": -6.0809326171875,
                "lat": 40.4035620782368
            },
            {
                "lng": -6.064453125,
                "lat": 40.393888118201176
            },
            {
                "lng": -6.084709167480469,
                "lat": 40.36302674445932
            },
            {
                "lng": -6.105995178222656,
                "lat": 40.35700974577561
            },
            {
                "lng": -6.060676574707031,
                "lat": 40.34811406840929
            },
            {
                "lng": -6.017417907714844,
                "lat": 40.34052565161041
            },
            {
                "lng": -6.01123809814453,
                "lat": 40.311210648180285
            },
            {
                "lng": -5.975189208984375,
                "lat": 40.29628651711716
            },
            {
                "lng": -5.941200256347656,
                "lat": 40.282144825334825
            },
            {
                "lng": -5.917167663574218,
                "lat": 40.280049508234804
            },
            {
                "lng": -5.903434753417969,
                "lat": 40.30230893170971
            },
            {
                "lng": -5.889358520507812,
                "lat": 40.32508451346657
            },
            {
                "lng": -5.8721923828125,
                "lat": 40.33215123550075
            },
            {
                "lng": -5.854682922363281,
                "lat": 40.33817045213394
            },
            {
                "lng": -5.850906372070312,
                "lat": 40.32717843416973
            },
            {
                "lng": -5.816917419433594,
                "lat": 40.35230041569844
            },
            {
                "lng": -5.796318054199218,
                "lat": 40.35413186092168
            },
            {
                "lng": -5.782928466796875,
                "lat": 40.321681753783764
            },
            {
                "lng": -5.790824890136719,
                "lat": 40.3070217512726
            },
            {
                "lng": -5.79975128173828,
                "lat": 40.29340604211214
            },
            {
                "lng": -5.767478942871094,
                "lat": 40.28162100214798
            },
            {
                "lng": -5.742073059082031,
                "lat": 40.291834822174515
            },
            {
                "lng": -5.7067108154296875,
                "lat": 40.292882306191984
            },
            {
                "lng": -5.665855407714844,
                "lat": 40.27716834118786
            },
            {
                "lng": -5.6600189208984375,
                "lat": 40.25961676337706
            },
            {
                "lng": -5.622596740722656,
                "lat": 40.246253554284
            },
            {
                "lng": -5.620880126953124,
                "lat": 40.22528634184373
            },
            {
                "lng": -5.607490539550781,
                "lat": 40.21611114495333
            },
            {
                "lng": -5.590667724609374,
                "lat": 40.2153246416892
            },
            {
                "lng": -5.553245544433594,
                "lat": 40.20169046802995
            },
            {
                "lng": -5.518913269042969,
                "lat": 40.19697030740908
            },
            {
                "lng": -5.4876708984375,
                "lat": 40.20509926855807
            },
            {
                "lng": -5.458831787109375,
                "lat": 40.22869395564039
            },
            {
                "lng": -5.430335998535156,
                "lat": 40.25228042623786
            },
            {
                "lng": -5.364418029785156,
                "lat": 40.25856876391262
            },
            {
                "lng": -5.341072082519531,
                "lat": 40.26695230509781
            },
            {
                "lng": -5.367507934570312,
                "lat": 40.22161641219484
            },
            {
                "lng": -5.367164611816406,
                "lat": 40.19120077596245
            },
            {
                "lng": -5.3668212890625,
                "lat": 40.1626081299121
            },
            {
                "lng": -5.335235595703125,
                "lat": 40.11693985890127
            },
            {
                "lng": -5.316009521484375,
                "lat": 40.108012589026615
            },
            {
                "lng": -5.266742706298828,
                "lat": 40.10827517251323
            },
            {
                "lng": -5.216960906982421,
                "lat": 40.10840646387643
            },
            {
                "lng": -5.205631256103516,
                "lat": 40.085032609387355
            },
            {
                "lng": -5.182456970214844,
                "lat": 40.08700262599706
            },
            {
                "lng": -5.142116546630859,
                "lat": 40.08936657067439
            },
            {
                "lng": -5.102977752685547,
                "lat": 40.12074672049461
            },
            {
                "lng": -5.086326599121094,
                "lat": 40.13321598124515
            },
            {
                "lng": -5.063838958740234,
                "lat": 40.15158756460002
            },
            {
                "lng": -5.020408630371094,
                "lat": 40.158410030219486
            },
            {
                "lng": -5.011138916015625,
                "lat": 40.11142609528699
            },
            {
                "lng": -4.962730407714844,
                "lat": 40.12166558618828
            },
            {
                "lng": -4.953460693359375,
                "lat": 40.13662822235713
            },
            {
                "lng": -4.925823211669922,
                "lat": 40.13623451097302
            },
            {
                "lng": -4.9253082275390625,
                "lat": 40.17047886718109
            },
            {
                "lng": -4.878959655761719,
                "lat": 40.193429971300446
            },
            {
                "lng": -4.832782745361328,
                "lat": 40.215980061709914
            },
            {
                "lng": -4.81201171875,
                "lat": 40.233411907115055
            },
            {
                "lng": -4.818019866943359,
                "lat": 40.25503164587599
            },
            {
                "lng": -4.805145263671875,
                "lat": 40.27376316729887
            },
            {
                "lng": -4.764976501464844,
                "lat": 40.26302264952665
            },
            {
                "lng": -4.73236083984375,
                "lat": 40.27428705136608
            },
            {
                "lng": -4.6987152099609375,
                "lat": 40.28581147399602
            },
            {
                "lng": -4.6966552734375,
                "lat": 40.26590441926665
            },
            {
                "lng": -4.689960479736328,
                "lat": 40.247956855108335
            },
            {
                "lng": -4.689960479736328,
                "lat": 40.21912598956439
            },
            {
                "lng": -4.684295654296875,
                "lat": 40.21099871056187
            },
            {
                "lng": -4.64996337890625,
                "lat": 40.197757023665446
            },
            {
                "lng": -4.6108245849609375,
                "lat": 40.20549258066614
            },
            {
                "lng": -4.582500457763672,
                "lat": 40.217028720557074
            },
            {
                "lng": -4.568939208984375,
                "lat": 40.22659698282217
            },
            {
                "lng": -4.558296203613281,
                "lat": 40.23472239086321
            },
            {
                "lng": -4.567222595214844,
                "lat": 40.255162653545
            },
            {
                "lng": -4.557609558105469,
                "lat": 40.26590441926665
            },
            {
                "lng": -4.541473388671875,
                "lat": 40.28109717490234
            },
            {
                "lng": -4.530487060546875,
                "lat": 40.292882306191984
            },
            {
                "lng": -4.5394134521484375,
                "lat": 40.31644640396172
            },
            {
                "lng": -4.547996520996094,
                "lat": 40.34209573891804
            },
            {
                "lng": -4.527397155761719,
                "lat": 40.343927461258914
            },
            {
                "lng": -4.5037078857421875,
                "lat": 40.3153992852818
            },
            {
                "lng": -4.458732604980469,
                "lat": 40.32037295438762
            },
            {
                "lng": -4.4570159912109375,
                "lat": 40.34314244348888
            },
            {
                "lng": -4.439849853515625,
                "lat": 40.353346961916685
            },
            {
                "lng": -4.442939758300781,
                "lat": 40.383428219394965
            },
            {
                "lng": -4.436073303222656,
                "lat": 40.3972872355307
            },
            {
                "lng": -4.40826416015625,
                "lat": 40.411666217764925
            },
            {
                "lng": -4.364662170410156,
                "lat": 40.41114339950097
            },
            {
                "lng": -4.321746826171875,
                "lat": 40.41192762537371
            },
            {
                "lng": -4.324150085449219,
                "lat": 40.42604212826493
            },
            {
                "lng": -4.3430328369140625,
                "lat": 40.43257561752106
            },
            {
                "lng": -4.331016540527344,
                "lat": 40.44590196740627
            },
            {
                "lng": -4.319000244140625,
                "lat": 40.470979694762356
            },
            {
                "lng": -4.3231201171875,
                "lat": 40.510405926680356
            },
            {
                "lng": -4.3251800537109375,
                "lat": 40.54954812134299
            },
            {
                "lng": -4.290161132812499,
                "lat": 40.56519859725198
            },
            {
                "lng": -4.2798614501953125,
                "lat": 40.59492442142069
            },
            {
                "lng": -4.290504455566406,
                "lat": 40.606654663050485
            },
            {
                "lng": -4.291191101074219,
                "lat": 40.63219339951101
            },
            {
                "lng": -4.262351989746094,
                "lat": 40.60639401337773
            },
            {
                "lng": -4.2153167724609375,
                "lat": 40.605872710982574
            },
            {
                "lng": -4.187507629394531,
                "lat": 40.614213061359045
            },
            {
                "lng": -4.160728454589844,
                "lat": 40.622812957398224
            },
            {
                "lng": -4.171028137207031,
                "lat": 40.6350593829029
            },
            {
                "lng": -4.169311523437499,
                "lat": 40.6605872590835
            },
            {
                "lng": -4.167938232421875,
                "lat": 40.68636570811299
            },
            {
                "lng": -4.141502380371094,
                "lat": 40.714736512395284
            },
            {
                "lng": -4.111976623535156,
                "lat": 40.74361546275168
            },
            {
                "lng": -4.095497131347656,
                "lat": 40.751418432997454
            },
            {
                "lng": -4.075584411621094,
                "lat": 40.7909394098518
            },
            {
                "lng": -4.0491485595703125,
                "lat": 40.79119933844256
            },
            {
                "lng": -4.0189361572265625,
                "lat": 40.782881118849595
            },
            {
                "lng": -3.9863204956054688,
                "lat": 40.787300302741144
            },
            {
                "lng": -3.978767395019531,
                "lat": 40.798217025760515
            },
            {
                "lng": -3.961944580078125,
                "lat": 40.824201998489876
            },
            {
                "lng": -3.9653778076171875,
                "lat": 40.84056730598288
            },
            {
                "lng": -3.9464950561523433,
                "lat": 40.86419895172047
            },
            {
                "lng": -3.941688537597656,
                "lat": 40.8870435151357
            },
            {
                "lng": -3.9509582519531246,
                "lat": 40.897424801491276
            },
            {
                "lng": -3.937225341796875,
                "lat": 40.924927332167684
            },
            {
                "lng": -3.910102844238281,
                "lat": 40.94956610518337
            },
            {
                "lng": -3.8836669921874996,
                "lat": 40.973936476692614
            },
            {
                "lng": -3.8702774047851562,
                "lat": 40.97289962292462
            },
            {
                "lng": -3.8180923461914062,
                "lat": 40.985081625514354
            },
            {
                "lng": -3.7714004516601562,
                "lat": 41.01280672889619
            },
            {
                "lng": -3.7425613403320312,
                "lat": 41.04440429915501
            },
            {
                "lng": -3.7161254882812496,
                "lat": 41.07391619241318
            },
            {
                "lng": -3.6759567260742188,
                "lat": 41.091254723206134
            },
            {
                "lng": -3.6457443237304688,
                "lat": 41.12048695593398
            },
            {
                "lng": -3.6169052124023438,
                "lat": 41.149964693593404
            },
            {
                "lng": -3.5794830322265625,
                "lat": 41.16056309723075
            },
            {
                "lng": -3.5331344604492188,
                "lat": 41.16676624570446
            },
            {
                "lng": -3.5079002380371094,
                "lat": 41.16896305331574
            },
            {
                "lng": -3.4697914123535156,
                "lat": 41.18356349076635
            },
            {
                "lng": -3.4552001953125,
                "lat": 41.20022726843654
            },
            {
                "lng": -3.4421539306640625,
                "lat": 41.21611203632415
            },
            {
                "lng": -3.4023284912109375,
                "lat": 41.21482073580286
            },
            {
                "lng": -3.401985168457031,
                "lat": 41.235349394427566
            },
            {
                "lng": -3.4002685546875,
                "lat": 41.256387806993835
            },
            {
                "lng": -3.416576385498047,
                "lat": 41.27174286091302
            },
            {
                "lng": -3.3896255493164062,
                "lat": 41.25716209782705
            },
            {
                "lng": -3.357696533203125,
                "lat": 41.257936379481635
            },
            {
                "lng": -3.3321189880371094,
                "lat": 41.255742557621396
            },
            {
                "lng": -3.2955551147460938,
                "lat": 41.2602591693733
            },
            {
                "lng": -3.2794189453125,
                "lat": 41.27703242132324
            },
            {
                "lng": -3.265514373779297,
                "lat": 41.25948491525479
            },
            {
                "lng": -3.2481765747070312,
                "lat": 41.26464643600054
            },
            {
                "lng": -3.2351303100585938,
                "lat": 41.29534904916866
            },
            {
                "lng": -3.2049179077148438,
                "lat": 41.30527915505391
            },
            {
                "lng": -3.159942626953125,
                "lat": 41.29638081886435
            },
            {
                "lng": -3.1352233886718746,
                "lat": 41.290963845888356
            },
            {
                "lng": -3.065357208251953,
                "lat": 41.276387375928984
            },
            {
                "lng": -3.02398681640625,
                "lat": 41.286965315395285
            },
            {
                "lng": -2.989654541015625,
                "lat": 41.28993199051138
            },
            {
                "lng": -2.9546356201171875,
                "lat": 41.293027507682005
            },
            {
                "lng": -2.9388427734374996,
                "lat": 41.30979233971626
            },
            {
                "lng": -2.9093170166015625,
                "lat": 41.32693959226104
            },
            {
                "lng": -2.8924942016601562,
                "lat": 41.32668177224906
            },
            {
                "lng": -2.8694915771484375,
                "lat": 41.32010701725659
            },
            {
                "lng": -2.8712081909179688,
                "lat": 41.30360274975627
            },
            {
                "lng": -2.8681182861328125,
                "lat": 41.28915808826864
            },
            {
                "lng": -2.8653717041015625,
                "lat": 41.27496825362303
            },
            {
                "lng": -2.819538116455078,
                "lat": 41.2628399501437
            },
            {
                "lng": -2.7750778198242188,
                "lat": 41.2509675141624
            },
            {
                "lng": -2.7692413330078125,
                "lat": 41.26980754879316
            },
            {
                "lng": -2.7431488037109375,
                "lat": 41.272387952204056
            },
            {
                "lng": -2.7184295654296875,
                "lat": 41.27471022807078
            },
            {
                "lng": -2.695770263671875,
                "lat": 41.24761186940989
            },
            {
                "lng": -2.66693115234375,
                "lat": 41.2388347529335
            },
            {
                "lng": -2.6444435119628906,
                "lat": 41.241029142571136
            },
            {
                "lng": -2.6322555541992188,
                "lat": 41.21804893930975
            },
            {
                "lng": -2.616119384765625,
                "lat": 41.22218080731483
            },
            {
                "lng": -2.5905418395996094,
                "lat": 41.224633980434
            },
            {
                "lng": -2.5920867919921875,
                "lat": 41.19958146459638
            },
            {
                "lng": -2.6198959350585938,
                "lat": 41.19544816912296
            },
            {
                "lng": -2.6181793212890625,
                "lat": 41.18227154791307
            },
            {
                "lng": -2.5972366333007812,
                "lat": 41.18692242290296
            },
            {
                "lng": -2.577838897705078,
                "lat": 41.18046278509978
            },
            {
                "lng": -2.59775161743164,
                "lat": 41.15384235711447
            },
            {
                "lng": -2.5855636596679683,
                "lat": 41.14647460032897
            },
            {
                "lng": -2.573890686035156,
                "lat": 41.13988169508488
            },
            {
                "lng": -2.5433349609375,
                "lat": 41.15125727358413
            },
            {
                "lng": -2.53509521484375,
                "lat": 41.1646985947886
            },
            {
                "lng": -2.5168991088867188,
                "lat": 41.15177429844501
            },
            {
                "lng": -2.5084877014160156,
                "lat": 41.11984036589131
            },
            {
                "lng": -2.4839401245117188,
                "lat": 41.11841784537521
            },
            {
                "lng": -2.471065521240234,
                "lat": 41.08090391180388
            },
            {
                "lng": -2.4326133728027344,
                "lat": 41.07132795968364
            },
            {
                "lng": -2.4193954467773438,
                "lat": 41.06019739786093
            },
            {
                "lng": -2.3941612243652344,
                "lat": 41.06369207946645
            },
            {
                "lng": -2.376995086669922,
                "lat": 41.081292096655694
            },
            {
                "lng": -2.3545074462890625,
                "lat": 41.08711459429919
            },
            {
                "lng": -2.3227500915527344,
                "lat": 41.055408088140396
            },
            {
                "lng": -2.2951126098632812,
                "lat": 41.07171620108895
            },
            {
                "lng": -2.276744842529297,
                "lat": 41.0658923392826
            },
            {
                "lng": -2.2537422180175777,
                "lat": 41.08168027921475
            },
            {
                "lng": -2.2309112548828125,
                "lat": 41.097852514442145
            },
            {
                "lng": -2.1749496459960938,
                "lat": 41.083750547474075
            },
            {
                "lng": -2.1653366088867188,
                "lat": 41.09772315235576
            },
            {
                "lng": -2.1430206298828125,
                "lat": 41.1031561406236
            },
            {
                "lng": -2.132549285888672,
                "lat": 41.11906444943177
            },
            {
                "lng": -2.0801925659179688,
                "lat": 41.08530320586984
            },
            {
                "lng": -2.0709228515625,
                "lat": 41.072880911548936
            },
            {
                "lng": -2.05718994140625,
                "lat": 41.07068088558002
            },
            {
                "lng": -2.0480918884277344,
                "lat": 41.07935114946899
            },
            {
                "lng": -2.06817626953125,
                "lat": 41.100957128083465
            },
            {
                "lng": -2.0631980895996094,
                "lat": 41.12009900267278
            },
            {
                "lng": -2.0492935180664062,
                "lat": 41.13574463182004
            },
            {
                "lng": -2.0523834228515625,
                "lat": 41.148413563966386
            },
            {
                "lng": -2.0808792114257812,
                "lat": 41.17167665514729
            },
            {
                "lng": -2.1471405029296875,
                "lat": 41.184984598466876
            },
            {
                "lng": -2.1514320373535156,
                "lat": 41.226054196493294
            },
            {
                "lng": -2.1649932861328125,
                "lat": 41.28425649421989
            },
            {
                "lng": -2.173748016357422,
                "lat": 41.29251159835366
            },
            {
                "lng": -2.1708297729492188,
                "lat": 41.3198491702105
            },
            {
                "lng": -2.1564102172851562,
                "lat": 41.33274027282085
            },
            {
                "lng": -2.1646499633789062,
                "lat": 41.35542241868309
            },
            {
                "lng": -2.1495437622070312,
                "lat": 41.35658208879851
            },
            {
                "lng": -2.1179580688476562,
                "lat": 41.383248798742635
            },
            {
                "lng": -2.116413116455078,
                "lat": 41.43050058742958
            },
            {
                "lng": -2.1028518676757812,
                "lat": 41.44684402008925
            },
            {
                "lng": -2.0499801635742188,
                "lat": 41.435262484791174
            },
            {
                "lng": -2.0359039306640625,
                "lat": 41.427797733534135
            },
            {
                "lng": -2.0328140258789062,
                "lat": 41.40771586770284
            },
            {
                "lng": -2.0438003540039062,
                "lat": 41.39174892980349
            },
            {
                "lng": -2.0238876342773438,
                "lat": 41.384279176844764
            },
            {
                "lng": -1.9366836547851562,
                "lat": 41.40797336681306
            },
            {
                "lng": -1.9342803955078123,
                "lat": 41.41981722266227
            },
            {
                "lng": -1.9524765014648438,
                "lat": 41.4249660516211
            },
            {
                "lng": -1.9500732421875,
                "lat": 41.4355198746972
            },
            {
                "lng": -1.9543647766113281,
                "lat": 41.46781420563296
            },
            {
                "lng": -1.9795989990234373,
                "lat": 41.491606508001276
            },
            {
                "lng": -1.977882385253906,
                "lat": 41.52657175967685
            },
            {
                "lng": -1.9720458984374998,
                "lat": 41.55175560133366
            },
            {
                "lng": -1.9971084594726562,
                "lat": 41.57975468033126
            },
            {
                "lng": -1.984405517578125,
                "lat": 41.60671479599115
            },
            {
                "lng": -1.9232940673828125,
                "lat": 41.600040006763784
            },
            {
                "lng": -1.898231506347656,
                "lat": 41.63263723394463
            },
            {
                "lng": -1.8711090087890625,
                "lat": 41.64110468287587
            },
            {
                "lng": -1.8614959716796873,
                "lat": 41.660857737375125
            },
            {
                "lng": -1.8062210083007815,
                "lat": 41.66470503009207
            },
            {
                "lng": -1.8110275268554685,
                "lat": 41.68804034502165
            },
            {
                "lng": -1.7955780029296875,
                "lat": 41.69752591075902
            },
            {
                "lng": -1.7768669128417969,
                "lat": 41.72623044860004
            },
            {
                "lng": -1.8106842041015625,
                "lat": 41.73724753538832
            },
            {
                "lng": -1.8038177490234375,
                "lat": 41.752617056783244
            },
            {
                "lng": -1.8285369873046873,
                "lat": 41.78078495669252
            },
            {
                "lng": -1.8539428710937498,
                "lat": 41.78948889638049
            },
            {
                "lng": -1.8460464477539062,
                "lat": 41.80407814427237
            },
            {
                "lng": -1.8202972412109373,
                "lat": 41.828642001860544
            },
            {
                "lng": -1.8208122253417967,
                "lat": 41.86252976663967
            },
            {
                "lng": -1.8340301513671875,
                "lat": 41.864447405239375
            },
            {
                "lng": -1.8396949768066406,
                "lat": 41.88694340165634
            },
            {
                "lng": -1.8573760986328127,
                "lat": 41.90917597761326
            },
            {
                "lng": -1.8560028076171875,
                "lat": 41.96651048661077
            },
            {
                "lng": -1.9068145751953123,
                "lat": 41.9458300375991
            },
            {
                "lng": -1.9160842895507815,
                "lat": 41.93216704883793
            },
            {
                "lng": -1.9392585754394531,
                "lat": 41.92705863777926
            },
            {
                "lng": -1.9552230834960935,
                "lat": 41.92718635304145
            },
            {
                "lng": -1.9813156127929685,
                "lat": 41.91939525416699
            },
            {
                "lng": -1.99951171875,
                "lat": 41.93369949238356
            },
            {
                "lng": -2.009124755859375,
                "lat": 41.94097809642318
            },
            {
                "lng": -2.0194244384765625,
                "lat": 41.947234477977766
            },
            {
                "lng": -2.0293807983398438,
                "lat": 41.953107257070606
            },
            {
                "lng": -2.0360755920410156,
                "lat": 41.93970120843231
            },
            {
                "lng": -2.0468902587890625,
                "lat": 41.9511922798597
            },
            {
                "lng": -2.0643997192382812,
                "lat": 41.953873231845826
            },
            {
                "lng": -2.077102661132812,
                "lat": 41.95080927751363
            },
            {
                "lng": -2.0834541320800777,
                "lat": 41.95578812851097
            },
            {
                "lng": -2.0980453491210938,
                "lat": 41.957320004419216
            },
            {
                "lng": -2.112293243408203,
                "lat": 41.959362448352344
            },
            {
                "lng": -2.115039825439453,
                "lat": 41.96816973794845
            },
            {
                "lng": -2.117786407470703,
                "lat": 41.97774149795238
            },
            {
                "lng": -2.1234512329101562,
                "lat": 41.996497974866244
            },
            {
                "lng": -2.1104049682617188,
                "lat": 41.997646151068956
            },
            {
                "lng": -2.1069717407226562,
                "lat": 42.00389696920452
            },
            {
                "lng": -2.1167564392089844,
                "lat": 42.01881990849959
            },
            {
                "lng": -2.1282577514648438,
                "lat": 42.027363946802055
            },
            {
                "lng": -2.146797180175781,
                "lat": 42.04228137995748
            },
            {
                "lng": -2.157440185546875,
                "lat": 42.0536264843458
            },
            {
                "lng": -2.161731719970703,
                "lat": 42.066753682592775
            },
            {
                "lng": -2.1419906616210938,
                "lat": 42.07516385872652
            },
            {
                "lng": -2.1310043334960938,
                "lat": 42.07796700314433
            },
            {
                "lng": -2.127227783203125,
                "lat": 42.087140064638376
            },
            {
                "lng": -2.1289443969726562,
                "lat": 42.098477155008055
            },
            {
                "lng": -2.143535614013672,
                "lat": 42.10382653879911
            },
            {
                "lng": -2.1622467041015625,
                "lat": 42.10471805888785
            },
            {
                "lng": -2.1811294555664062,
                "lat": 42.1054822089861
            },
            {
                "lng": -2.2005271911621094,
                "lat": 42.10293500617417
            },
            {
                "lng": -2.213573455810547,
                "lat": 42.103699177763055
            },
            {
                "lng": -2.2242164611816406,
                "lat": 42.09860452653345
            },
            {
                "lng": -2.23846435546875,
                "lat": 42.10268028026449
            },
            {
                "lng": -2.2573471069335938,
                "lat": 42.08905095219165
            },
            {
                "lng": -2.2666168212890625,
                "lat": 42.08764964028074
            },
            {
                "lng": -2.2745132446289062,
                "lat": 42.098477155008055
            },
            {
                "lng": -2.282238006591797,
                "lat": 42.109175471287365
            },
            {
                "lng": -2.2801780700683594,
                "lat": 42.12509224279673
            },
            {
                "lng": -2.284984588623047,
                "lat": 42.13387658821469
            },
            {
                "lng": -2.301979064941406,
                "lat": 42.13973214172565
            },
            {
                "lng": -2.319488525390625,
                "lat": 42.145587153809494
            },
            {
                "lng": -2.3349380493164062,
                "lat": 42.145968983616726
            },
            {
                "lng": -2.350902557373047,
                "lat": 42.146478086444084
            },
            {
                "lng": -2.3637771606445312,
                "lat": 42.144950765679866
            },
            {
                "lng": -2.3807716369628906,
                "lat": 42.1424051491921
            },
            {
                "lng": -2.4104690551757812,
                "lat": 42.13858653255424
            },
            {
                "lng": -2.4317550659179688,
                "lat": 42.13591336388817
            },
            {
                "lng": -2.445831298828125,
                "lat": 42.134131188756044
            },
            {
                "lng": -2.4578475952148438,
                "lat": 42.11719802380827
            },
            {
                "lng": -2.4741554260253906,
                "lat": 42.11337788734839
            },
            {
                "lng": -2.4851417541503906,
                "lat": 42.10637370579324
            },
            {
                "lng": -2.5052261352539062,
                "lat": 42.11426927311834
            },
            {
                "lng": -2.5150108337402344,
                "lat": 42.115033308085856
            },
            {
                "lng": -2.5205039978027344,
                "lat": 42.09134394127485
            },
            {
                "lng": -2.5217056274414062,
                "lat": 42.083063312144496
            },
            {
                "lng": -2.515869140625,
                "lat": 42.0729977077829
            },
            {
                "lng": -2.517242431640625,
                "lat": 42.067900590408016
            },
            {
                "lng": -2.525482177734375,
                "lat": 42.060636490969834
            },
            {
                "lng": -2.5457382202148438,
                "lat": 42.054518709980954
            },
            {
                "lng": -2.551746368408203,
                "lat": 42.044066137408514
            },
            {
                "lng": -2.5591278076171875,
                "lat": 42.029531654498925
            },
            {
                "lng": -2.566509246826172,
                "lat": 42.014483688722116
            },
            {
                "lng": -2.576465606689453,
                "lat": 42.00670325924093
            },
            {
                "lng": -2.5786972045898438,
                "lat": 41.9981564449542
            },
            {
                "lng": -2.5975799560546875,
                "lat": 42.00274890578537
            },
            {
                "lng": -2.6181793212890625,
                "lat": 42.00530012969559
            },
            {
                "lng": -2.643756866455078,
                "lat": 42.00478989309753
            },
            {
                "lng": -2.658863067626953,
                "lat": 42.00581036220167
            },
            {
                "lng": -2.6746559143066406,
                "lat": 41.99828401778616
            },
            {
                "lng": -2.6907920837402344,
                "lat": 42.004152091595564
            },
            {
                "lng": -2.7022933959960933,
                "lat": 42.014866308242375
            },
            {
                "lng": -2.721691131591797,
                "lat": 42.016014152992184
            },
            {
                "lng": -2.74881362915039,
                "lat": 42.008871671305805
            },
            {
                "lng": -2.753276824951172,
                "lat": 42.021753065991184
            },
            {
                "lng": -2.7579116821289062,
                "lat": 42.03463185161588
            },
            {
                "lng": -2.7359390258789062,
                "lat": 42.05337156043361
            },
            {
                "lng": -2.7309608459472656,
                "lat": 42.06433236471607
            },
            {
                "lng": -2.719287872314453,
                "lat": 42.07783959017503
            },
            {
                "lng": -2.7072715759277344,
                "lat": 42.091598712723105
            },
            {
                "lng": -2.7057266235351562,
                "lat": 42.10420862037218
            },
            {
                "lng": -2.7198028564453125,
                "lat": 42.11477863078675
            },
            {
                "lng": -2.734222412109375,
                "lat": 42.12547419618877
            },
            {
                "lng": -2.747955322265625,
                "lat": 42.12076327675189
            },
            {
                "lng": -2.7680397033691406,
                "lat": 42.126365411815094
            },
            {
                "lng": -2.7819442749023433,
                "lat": 42.11541532211565
            },
            {
                "lng": -2.7937889099121094,
                "lat": 42.109048120996725
            },
            {
                "lng": -2.791728973388672,
                "lat": 42.093509465966484
            },
            {
                "lng": -2.8016853332519527,
                "lat": 42.07809441585778
            },
            {
                "lng": -2.794647216796875,
                "lat": 42.066753682592775
            },
            {
                "lng": -2.7992820739746094,
                "lat": 42.052479318683375
            },
            {
                "lng": -2.798938751220703,
                "lat": 42.047380553951584
            },
            {
                "lng": -2.8121566772460933,
                "lat": 42.037436785590664
            },
            {
                "lng": -2.8284645080566406,
                "lat": 42.03934916959466
            },
            {
                "lng": -2.856273651123047,
                "lat": 42.02876658963462
            },
            {
                "lng": -2.8693199157714844,
                "lat": 42.014993847570935
            },
            {
                "lng": -2.8870010375976562,
                "lat": 42.010784914688195
            },
            {
                "lng": -2.89215087890625,
                "lat": 42.015376464022104
            },
            {
                "lng": -2.8979873657226562,
                "lat": 42.020222739832505
            },
            {
                "lng": -2.913265228271484,
                "lat": 42.02264573924203
            },
            {
                "lng": -2.914981842041015,
                "lat": 42.035141848819315
            },
            {
                "lng": -2.9189300537109375,
                "lat": 42.04801792192477
            },
            {
                "lng": -2.925281524658203,
                "lat": 42.06344027695692
            },
            {
                "lng": -2.9302597045898438,
                "lat": 42.07682027721137
            },
            {
                "lng": -2.9323196411132812,
                "lat": 42.0875222467539
            },
            {
                "lng": -2.944164276123047,
                "lat": 42.08841399606954
            },
            {
                "lng": -2.970256805419922,
                "lat": 42.08433732543939
            },
            {
                "lng": -2.9958343505859375,
                "lat": 42.087012670088214
            },
            {
                "lng": -3.0133438110351562,
                "lat": 42.085866107624646
            },
            {
                "lng": -3.033599853515625,
                "lat": 42.0872674589327
            },
            {
                "lng": -3.041839599609375,
                "lat": 42.099623489526614
            },
            {
                "lng": -3.0579757690429683,
                "lat": 42.12662004254844
            },
            {
                "lng": -3.0711936950683594,
                "lat": 42.134894984239224
            },
            {
                "lng": -3.0866432189941406,
                "lat": 42.13311278044984
            },
            {
                "lng": -3.0911064147949214,
                "lat": 42.14469620863687
            },
            {
                "lng": -3.0890464782714844,
                "lat": 42.1589498268135
            },
            {
                "lng": -3.097972869873047,
                "lat": 42.16709331032327
            },
            {
                "lng": -3.1082725524902344,
                "lat": 42.175108528186286
            },
            {
                "lng": -3.1170272827148438,
                "lat": 42.178161677352406
            },
            {
                "lng": -3.116168975830078,
                "lat": 42.18744743335386
            },
            {
                "lng": -3.128871917724609,
                "lat": 42.19596877629178
            },
            {
                "lng": -3.129901885986328,
                "lat": 42.20105559753742
            },
            {
                "lng": -3.1156539916992188,
                "lat": 42.208557911437296
            },
            {
                "lng": -3.1014060974121094,
                "lat": 42.21618646951623
            },
            {
                "lng": -3.0991744995117183,
                "lat": 42.224322582561605
            },
            {
                "lng": -3.1029510498046875,
                "lat": 42.233474456617344
            },
            {
                "lng": -3.091621398925781,
                "lat": 42.24618319158034
            },
            {
                "lng": -3.0862998962402344,
                "lat": 42.24745392429695
            },
            {
                "lng": -3.0931663513183594,
                "lat": 42.25584011825486
            },
            {
                "lng": -3.0998611450195312,
                "lat": 42.26460631064456
            },
            {
                "lng": -3.089733123779297,
                "lat": 42.27438743428872
            },
            {
                "lng": -3.093852996826172,
                "lat": 42.28391304362746
            },
            {
                "lng": -3.097457885742187,
                "lat": 42.292802313151235
            },
            {
                "lng": -3.1050109863281246,
                "lat": 42.31133875283751
            },
            {
                "lng": -3.1053543090820312,
                "lat": 42.31857410083396
            },
            {
                "lng": -3.095741271972656,
                "lat": 42.32377795959519
            },
            {
                "lng": -3.097972869873047,
                "lat": 42.3287275721773
            },
            {
                "lng": -3.110847473144531,
                "lat": 42.33964072628171
            },
            {
                "lng": -3.1101608276367188,
                "lat": 42.34864899620793
            },
            {
                "lng": -3.110847473144531,
                "lat": 42.35182061497659
            },
            {
                "lng": -3.0753135681152344,
                "lat": 42.35423093820958
            },
            {
                "lng": -3.0634689331054688,
                "lat": 42.35638746485392
            },
            {
                "lng": -3.065013885498047,
                "lat": 42.36539333502107
            },
            {
                "lng": -3.074970245361328,
                "lat": 42.37541243392459
            },
            {
                "lng": -3.085613250732422,
                "lat": 42.38555672822687
            },
            {
                "lng": -3.10037612915039,
                "lat": 42.38517634676783
            },
            {
                "lng": -3.1056976318359375,
                "lat": 42.38644427600168
            },
            {
                "lng": -3.0964279174804688,
                "lat": 42.40191095063363
            },
            {
                "lng": -3.1014060974121094,
                "lat": 42.416740164543064
            },
            {
                "lng": -3.0899047851562496,
                "lat": 42.42168245677133
            },
            {
                "lng": -3.0780601501464844,
                "lat": 42.41521938087247
            },
            {
                "lng": -3.080291748046875,
                "lat": 42.393670983638714
            },
            {
                "lng": -3.068447113037109,
                "lat": 42.38162600867719
            },
            {
                "lng": -3.0593490600585938,
                "lat": 42.37059332000732
            },
            {
                "lng": -3.053340911865234,
                "lat": 42.3746515457839
            },
            {
                "lng": -3.0631256103515625,
                "lat": 42.40064333382955
            },
            {
                "lng": -3.0607223510742188,
                "lat": 42.40951611365125
            },
            {
                "lng": -3.058490753173828,
                "lat": 42.41813418384332
            },
            {
                "lng": -3.0632972717285156,
                "lat": 42.425990803955095
            },
            {
                "lng": -3.052654266357422,
                "lat": 42.4390407545552
            },
            {
                "lng": -3.0531692504882812,
                "lat": 42.455760990550175
            },
            {
                "lng": -3.0629539489746094,
                "lat": 42.46893136647918
            },
            {
                "lng": -3.074626922607422,
                "lat": 42.47716144453506
            },
            {
                "lng": -3.087329864501953,
                "lat": 42.47817430242153
            },
            {
                "lng": -3.0933380126953125,
                "lat": 42.48526384858916
            },
            {
                "lng": -3.093852996826172,
                "lat": 42.49171970062173
            },
            {
                "lng": -3.076343536376953,
                "lat": 42.50551526821832
            },
            {
                "lng": -3.0742835998535156,
                "lat": 42.51652422514874
            },
            {
                "lng": -3.0754852294921875,
                "lat": 42.52512757701037
            },
            {
                "lng": -3.0768585205078125,
                "lat": 42.53335026183043
            },
            {
                "lng": -3.0890464782714844,
                "lat": 42.538156868495555
            },
            {
                "lng": -3.102264404296875,
                "lat": 42.5347416860164
            },
            {
                "lng": -3.1101608276367188,
                "lat": 42.529681813107544
            },
            {
                "lng": -3.126811981201172,
                "lat": 42.53360325035187
            },
            {
                "lng": -3.13385009765625,
                "lat": 42.54182481941639
            },
            {
                "lng": -3.113079071044922,
                "lat": 42.55219510083977
            },
            {
                "lng": -3.103466033935547,
                "lat": 42.554218369514565
            },
            {
                "lng": -3.1012344360351562,
                "lat": 42.561552168616196
            },
            {
                "lng": -3.0862998962402344,
                "lat": 42.57103425161057
            },
            {
                "lng": -3.0837249755859375,
                "lat": 42.57672280958932
            },
            {
                "lng": -3.085956573486328,
                "lat": 42.58215805797416
            },
            {
                "lng": -3.0696487426757812,
                "lat": 42.58910942929866
            },
            {
                "lng": -3.0590057373046875,
                "lat": 42.58898304764766
            },
            {
                "lng": -3.0658721923828125,
                "lat": 42.59454359788448
            },
            {
                "lng": -3.0602073669433594,
                "lat": 42.6021253668952
            },
            {
                "lng": -3.0646705627441406,
                "lat": 42.609453533373696
            },
            {
                "lng": -3.069133758544922,
                "lat": 42.617538785604594
            },
            {
                "lng": -3.070850372314453,
                "lat": 42.62233890747706
            },
            {
                "lng": -3.0808067321777344,
                "lat": 42.62574929551122
            },
            {
                "lng": -3.0861282348632812,
                "lat": 42.628022783744385
            },
            {
                "lng": -3.081836700439453,
                "lat": 42.632822097339634
            },
            {
                "lng": -3.085269927978515,
                "lat": 42.6409043153278
            },
            {
                "lng": -3.069133758544922,
                "lat": 42.638757578558405
            },
            {
                "lng": -3.046302795410156,
                "lat": 42.6409043153278
            },
            {
                "lng": -3.034114837646484,
                "lat": 42.63825245326065
            },
            {
                "lng": -3.0250167846679688,
                "lat": 42.63673705276445
            },
            {
                "lng": -3.0167770385742188,
                "lat": 42.632443217615524
            },
            {
                "lng": -3.0164337158203125,
                "lat": 42.638126171295504
            },
            {
                "lng": -3.0069923400878906,
                "lat": 42.642419614336674
            },
            {
                "lng": -2.9958343505859375,
                "lat": 42.6440611466169
            },
            {
                "lng": -2.9906845092773438,
                "lat": 42.64216706706468
            },
            {
                "lng": -2.9862213134765625,
                "lat": 42.635853052099094
            },
            {
                "lng": -2.9783248901367183,
                "lat": 42.635474190826905
            },
            {
                "lng": -2.9712867736816406,
                "lat": 42.6409043153278
            },
            {
                "lng": -2.9520606994628906,
                "lat": 42.638757578558405
            },
            {
                "lng": -2.9395294189453125,
                "lat": 42.63774732386239
            },
            {
                "lng": -2.932147979736328,
                "lat": 42.63105397222711
            },
            {
                "lng": -2.9242515563964844,
                "lat": 42.621581018098816
            },
            {
                "lng": -2.9041671752929688,
                "lat": 42.61981257367216
            },
            {
                "lng": -2.9048538208007812,
                "lat": 42.62638082834924
            },
            {
                "lng": -2.8914642333984375,
                "lat": 42.628149086211636
            },
            {
                "lng": -2.8940391540527344,
                "lat": 42.62170733363589
            },
            {
                "lng": -2.882537841796875,
                "lat": 42.621075753387984
            },
            {
                "lng": -2.885112762451172,
                "lat": 42.62574929551122
            },
            {
                "lng": -2.871723175048828,
                "lat": 42.63193804106213
            },
            {
                "lng": -2.8585052490234375,
                "lat": 42.63799988907408
            }
        ]
    ],
    [
        [
            {
                "lng": -1.1420631408691406,
                "lat": 39.97277899879356
            },
            {
                "lng": -1.165924072265625,
                "lat": 40.012890779526174
            },
            {
                "lng": -1.1132240295410156,
                "lat": 40.026562852997486
            },
            {
                "lng": -1.0725402832031248,
                "lat": 40.052847601823984
            },
            {
                "lng": -1.0938262939453125,
                "lat": 40.085951957566515
            },
            {
                "lng": -1.14532470703125,
                "lat": 40.11536454348482
            },
            {
                "lng": -1.2469482421875,
                "lat": 40.11641475781727
            },
            {
                "lng": -1.297760009765625,
                "lat": 40.21506247190585
            },
            {
                "lng": -1.32110595703125,
                "lat": 40.19880596447519
            },
            {
                "lng": -1.316986083984375,
                "lat": 40.150537893668925
            },
            {
                "lng": -1.355438232421875,
                "lat": 40.131641042944715
            },
            {
                "lng": -1.3822174072265625,
                "lat": 40.13899044275822
            },
            {
                "lng": -1.4522552490234373,
                "lat": 40.142139942215415
            },
            {
                "lng": -1.4447021484374998,
                "lat": 40.19933042879484
            },
            {
                "lng": -1.4728546142578125,
                "lat": 40.187397861863964
            },
            {
                "lng": -1.5126800537109375,
                "lat": 40.204050425113294
            },
            {
                "lng": -1.536712646484375,
                "lat": 40.19041398364302
            },
            {
                "lng": -1.6968727111816406,
                "lat": 40.309247135103334
            },
            {
                "lng": -1.7200469970703125,
                "lat": 40.27743027053821
            },
            {
                "lng": -1.7303466796874998,
                "lat": 40.30990164580519
            },
            {
                "lng": -1.7023658752441406,
                "lat": 40.32796363768658
            },
            {
                "lng": -1.8050193786621094,
                "lat": 40.40944421209154
            },
            {
                "lng": -1.6967010498046875,
                "lat": 40.48612628528652
            },
            {
                "lng": -1.6980743408203123,
                "lat": 40.55450450121615
            },
            {
                "lng": -1.674041748046875,
                "lat": 40.59153530173193
            },
            {
                "lng": -1.5964508056640625,
                "lat": 40.56389453066509
            },
            {
                "lng": -1.5470123291015623,
                "lat": 40.5983133693247
            },
            {
                "lng": -1.5634918212890625,
                "lat": 40.61603737424185
            },
            {
                "lng": -1.5380859375,
                "lat": 40.668660370488446
            },
            {
                "lng": -1.536712646484375,
                "lat": 40.69157226543675
            },
            {
                "lng": -1.553192138671875,
                "lat": 40.7071894965545
            },
            {
                "lng": -1.5600585937499998,
                "lat": 40.74413568925235
            },
            {
                "lng": -1.539459228515625,
                "lat": 40.763121171621314
            },
            {
                "lng": -1.542205810546875,
                "lat": 40.80965166748856
            },
            {
                "lng": -1.5579986572265625,
                "lat": 40.830436877649255
            },
            {
                "lng": -1.5751647949218748,
                "lat": 40.831475967182925
            },
            {
                "lng": -1.6184234619140625,
                "lat": 40.87717978437396
            },
            {
                "lng": -1.6266632080078125,
                "lat": 40.90001986856228
            },
            {
                "lng": -1.6074371337890623,
                "lat": 40.92700253056922
            },
            {
                "lng": -1.6143035888671875,
                "lat": 40.94412043078805
            },
            {
                "lng": -1.7303466796874998,
                "lat": 41.03016136993555
            },
            {
                "lng": -1.764678955078125,
                "lat": 41.06123287843666
            },
            {
                "lng": -1.8202972412109373,
                "lat": 41.09435964868545
            },
            {
                "lng": -1.8711090087890625,
                "lat": 41.109364719750964
            },
            {
                "lng": -1.8965148925781248,
                "lat": 41.13574463182004
            },
            {
                "lng": -1.9219207763671873,
                "lat": 41.134710325232795
            },
            {
                "lng": -1.9377136230468748,
                "lat": 41.14815503879421
            },
            {
                "lng": -1.9500732421875,
                "lat": 41.16780004669636
            },
            {
                "lng": -1.965179443359375,
                "lat": 41.17348566059416
            },
            {
                "lng": -1.9890403747558594,
                "lat": 41.162501644204355
            },
            {
                "lng": -2.04620361328125,
                "lat": 41.15539335830357
            },
            {
                "lng": -2.0525550842285156,
                "lat": 41.14815503879421
            },
            {
                "lng": -2.0492935180664062,
                "lat": 41.13574463182004
            },
            {
                "lng": -2.0633697509765625,
                "lat": 41.120228320681306
            },
            {
                "lng": -2.06817626953125,
                "lat": 41.101086483800515
            },
            {
                "lng": -2.0482635498046875,
                "lat": 41.07935114946899
            },
            {
                "lng": -2.05718994140625,
                "lat": 41.070551469995074
            },
            {
                "lng": -2.071094512939453,
                "lat": 41.07249267702159
            },
            {
                "lng": -2.0800209045410156,
                "lat": 41.08543259241357
            },
            {
                "lng": -2.132720947265625,
                "lat": 41.11919376947867
            },
            {
                "lng": -2.1431922912597656,
                "lat": 41.1031561406236
            },
            {
                "lng": -2.1651649475097656,
                "lat": 41.097593790014606
            },
            {
                "lng": -2.1752929687499996,
                "lat": 41.084009326420926
            },
            {
                "lng": -2.2309112548828125,
                "lat": 41.09798187627375
            },
            {
                "lng": -2.27691650390625,
                "lat": 41.0658923392826
            },
            {
                "lng": -2.2954559326171875,
                "lat": 41.07158678754193
            },
            {
                "lng": -2.3229217529296875,
                "lat": 41.055537533528664
            },
            {
                "lng": -2.3545074462890625,
                "lat": 41.08685582758068
            },
            {
                "lng": -2.377166748046875,
                "lat": 41.08142149109681
            },
            {
                "lng": -2.394332885742187,
                "lat": 41.06382150855231
            },
            {
                "lng": -2.4190521240234375,
                "lat": 41.06019739786093
            },
            {
                "lng": -2.4327850341796875,
                "lat": 41.07158678754193
            },
            {
                "lng": -2.4712371826171875,
                "lat": 41.08090391180388
            },
            {
                "lng": -2.4835968017578125,
                "lat": 41.11867648776222
            },
            {
                "lng": -2.5083160400390625,
                "lat": 41.120228320681306
            },
            {
                "lng": -2.517242431640625,
                "lat": 41.15177429844501
            },
            {
                "lng": -2.53509521484375,
                "lat": 41.1646985947886
            },
            {
                "lng": -2.5433349609375,
                "lat": 41.15125727358413
            },
            {
                "lng": -2.5740623474121094,
                "lat": 41.13962313627547
            },
            {
                "lng": -2.5975799560546875,
                "lat": 41.15384235711447
            },
            {
                "lng": -2.577667236328125,
                "lat": 41.18072118284585
            },
            {
                "lng": -2.5974082946777344,
                "lat": 41.18705160915968
            },
            {
                "lng": -2.6181793212890625,
                "lat": 41.182400743345326
            },
            {
                "lng": -2.6195526123046875,
                "lat": 41.19544816912296
            },
            {
                "lng": -2.592601776123047,
                "lat": 41.19945230306369
            },
            {
                "lng": -2.5907135009765625,
                "lat": 41.224633980434
            },
            {
                "lng": -2.616119384765625,
                "lat": 41.22205169039092
            },
            {
                "lng": -2.6319122314453125,
                "lat": 41.21791981422843
            },
            {
                "lng": -2.6442718505859375,
                "lat": 41.241158222020076
            },
            {
                "lng": -2.6664161682128906,
                "lat": 41.2388347529335
            },
            {
                "lng": -2.695770263671875,
                "lat": 41.24735373575181
            },
            {
                "lng": -2.7182579040527344,
                "lat": 41.274839240974394
            },
            {
                "lng": -2.7692413330078125,
                "lat": 41.27006559372387
            },
            {
                "lng": -2.7747344970703125,
                "lat": 41.2509675141624
            },
            {
                "lng": -2.8653717041015625,
                "lat": 41.27496825362303
            },
            {
                "lng": -2.8712081909179688,
                "lat": 41.303731705540024
            },
            {
                "lng": -2.8694915771484375,
                "lat": 41.32010701725659
            },
            {
                "lng": -2.8928375244140625,
                "lat": 41.326810682382565
            },
            {
                "lng": -2.9093170166015625,
                "lat": 41.326810682382565
            },
            {
                "lng": -2.938671112060547,
                "lat": 41.30979233971626
            },
            {
                "lng": -2.9546356201171875,
                "lat": 41.29276955352782
            },
            {
                "lng": -3.02398681640625,
                "lat": 41.287094304074884
            },
            {
                "lng": -3.065185546875,
                "lat": 41.27677440393049
            },
            {
                "lng": -3.2045745849609375,
                "lat": 41.30515020233036
            },
            {
                "lng": -3.235301971435547,
                "lat": 41.294962131325185
            },
            {
                "lng": -3.2481765747070312,
                "lat": 41.26464643600054
            },
            {
                "lng": -3.26568603515625,
                "lat": 41.25922682850889
            },
            {
                "lng": -3.2794189453125,
                "lat": 41.27677440393049
            },
            {
                "lng": -3.2952117919921875,
                "lat": 41.2602591693733
            },
            {
                "lng": -3.3322906494140625,
                "lat": 41.25561350698203
            },
            {
                "lng": -3.3580398559570312,
                "lat": 41.25806542553171
            },
            {
                "lng": -3.3899688720703125,
                "lat": 41.257033049992266
            },
            {
                "lng": -3.416748046875,
                "lat": 41.27161384188987
            },
            {
                "lng": -3.4002685546875,
                "lat": 41.25651685610343
            },
            {
                "lng": -3.40250015258789,
                "lat": 41.21507899794642
            },
            {
                "lng": -3.4418106079101562,
                "lat": 41.21624116497426
            },
            {
                "lng": -3.4552001953125,
                "lat": 41.20009810817829
            },
            {
                "lng": -3.4696197509765625,
                "lat": 41.183821876278515
            },
            {
                "lng": -3.5080718994140625,
                "lat": 41.168833831377455
            },
            {
                "lng": -3.5326194763183594,
                "lat": 41.16689547172043
            },
            {
                "lng": -3.495025634765625,
                "lat": 41.101086483800515
            },
            {
                "lng": -3.427734375,
                "lat": 41.08711459429919
            },
            {
                "lng": -3.438720703125,
                "lat": 41.04764089871412
            },
            {
                "lng": -3.389797210693359,
                "lat": 41.0141020092601
            },
            {
                "lng": -3.4160614013671875,
                "lat": 40.98028685044407
            },
            {
                "lng": -3.4627532958984375,
                "lat": 40.90936126702326
            },
            {
                "lng": -3.4421539306640625,
                "lat": 40.87782875920302
            },
            {
                "lng": -3.4661865234375,
                "lat": 40.86835309505017
            },
            {
                "lng": -3.492279052734375,
                "lat": 40.82926788245958
            },
            {
                "lng": -3.51837158203125,
                "lat": 40.78989968531352
            },
            {
                "lng": -3.466358184814453,
                "lat": 40.7869103865792
            },
            {
                "lng": -3.43597412109375,
                "lat": 40.73529128534676
            },
            {
                "lng": -3.462066650390625,
                "lat": 40.69001034095325
            },
            {
                "lng": -3.4119415283203125,
                "lat": 40.69834018178775
            },
            {
                "lng": -3.368682861328125,
                "lat": 40.65186199174389
            },
            {
                "lng": -3.321990966796875,
                "lat": 40.65251317049883
            },
            {
                "lng": -3.3307456970214844,
                "lat": 40.5983133693247
            },
            {
                "lng": -3.284912109375,
                "lat": 40.57641252104445
            },
            {
                "lng": -3.2948684692382812,
                "lat": 40.53363305378459
            },
            {
                "lng": -3.255901336669922,
                "lat": 40.54459137461185
            },
            {
                "lng": -3.19427490234375,
                "lat": 40.51954115033359
            },
            {
                "lng": -3.2018280029296875,
                "lat": 40.44851466742225
            },
            {
                "lng": -3.157367706298828,
                "lat": 40.43819391062477
            },
            {
                "lng": -3.137798309326172,
                "lat": 40.40186269942073
            },
            {
                "lng": -3.1537628173828125,
                "lat": 40.340787335365945
            },
            {
                "lng": -3.1997680664062496,
                "lat": 40.26118873213677
            },
            {
                "lng": -3.1810569763183594,
                "lat": 40.236688068934626
            },
            {
                "lng": -3.1084442138671875,
                "lat": 40.28541862829523
            },
            {
                "lng": -3.066558837890625,
                "lat": 40.161033872946575
            },
            {
                "lng": -3.0988311767578125,
                "lat": 40.15158756460002
            },
            {
                "lng": -3.047332763671875,
                "lat": 40.10328591293442
            },
            {
                "lng": -3.1242370605468746,
                "lat": 40.0602055157046
            },
            {
                "lng": -3.1678390502929688,
                "lat": 40.09501343953151
            },
            {
                "lng": -3.279590606689453,
                "lat": 40.0483799093726
            },
            {
                "lng": -3.3513450622558594,
                "lat": 40.08056702734237
            },
            {
                "lng": -3.3964920043945312,
                "lat": 40.039049372064376
            },
            {
                "lng": -3.511505126953125,
                "lat": 40.0507451947963
            },
            {
                "lng": -3.5218048095703125,
                "lat": 40.02340800226773
            },
            {
                "lng": -3.62823486328125,
                "lat": 39.991851471423466
            },
            {
                "lng": -3.6385345458984375,
                "lat": 39.9676482528045
            },
            {
                "lng": -3.749771118164062,
                "lat": 39.93132735238237
            },
            {
                "lng": -3.8136291503906246,
                "lat": 39.886557705928475
            },
            {
                "lng": -3.87491226196289,
                "lat": 39.90657598772841
            },
            {
                "lng": -3.86993408203125,
                "lat": 39.93290692296977
            },
            {
                "lng": -3.8136291503906246,
                "lat": 39.94712141785606
            },
            {
                "lng": -3.717327117919922,
                "lat": 40.01236487583938
            },
            {
                "lng": -3.6457443237304688,
                "lat": 40.03615796052209
            },
            {
                "lng": -3.6199951171875,
                "lat": 40.07229179232391
            },
            {
                "lng": -3.607635498046875,
                "lat": 40.111688665595956
            },
            {
                "lng": -3.728485107421875,
                "lat": 40.148438503139076
            },
            {
                "lng": -3.74582290649414,
                "lat": 40.13282225009163
            },
            {
                "lng": -3.8074493408203125,
                "lat": 40.17887331434696
            },
            {
                "lng": -3.8333702087402344,
                "lat": 40.16050911251291
            },
            {
                "lng": -3.8520812988281246,
                "lat": 40.17887331434696
            },
            {
                "lng": -3.986148834228516,
                "lat": 40.21086761742911
            },
            {
                "lng": -4.0704345703125,
                "lat": 40.26695230509781
            },
            {
                "lng": -4.100475311279297,
                "lat": 40.244419182384945
            },
            {
                "lng": -4.1473388671875,
                "lat": 40.247039698452085
            },
            {
                "lng": -4.193515777587891,
                "lat": 40.298381330906686
            },
            {
                "lng": -4.206390380859375,
                "lat": 40.270619777665615
            },
            {
                "lng": -4.2441558837890625,
                "lat": 40.27533480732468
            },
            {
                "lng": -4.295654296875,
                "lat": 40.221354266755185
            },
            {
                "lng": -4.3457794189453125,
                "lat": 40.23970199781759
            },
            {
                "lng": -4.3560791015625,
                "lat": 40.310948849735
            },
            {
                "lng": -4.380798339843749,
                "lat": 40.317755279476394
            },
            {
                "lng": -4.4350433349609375,
                "lat": 40.23970199781759
            },
            {
                "lng": -4.574432373046875,
                "lat": 40.204574848864155
            },
            {
                "lng": -4.5819854736328125,
                "lat": 40.217159801771885
            },
            {
                "lng": -4.6108245849609375,
                "lat": 40.20562368419506
            },
            {
                "lng": -4.650135040283203,
                "lat": 40.197625904923264
            },
            {
                "lng": -4.683952331542969,
                "lat": 40.210736524042794
            },
            {
                "lng": -4.689788818359375,
                "lat": 40.21925706672191
            },
            {
                "lng": -4.689788818359375,
                "lat": 40.24808787647333
            },
            {
                "lng": -4.6966552734375,
                "lat": 40.26590441926665
            },
            {
                "lng": -4.6987152099609375,
                "lat": 40.28581147399602
            },
            {
                "lng": -4.765491485595703,
                "lat": 40.262891657076054
            },
            {
                "lng": -4.805145263671875,
                "lat": 40.27376316729887
            },
            {
                "lng": -4.8181915283203125,
                "lat": 40.25490063795337
            },
            {
                "lng": -4.812183380126953,
                "lat": 40.23328085734542
            },
            {
                "lng": -4.832611083984375,
                "lat": 40.21611114495333
            },
            {
                "lng": -4.9253082275390625,
                "lat": 40.17047886718109
            },
            {
                "lng": -4.925994873046875,
                "lat": 40.13636574835449
            },
            {
                "lng": -4.953289031982422,
                "lat": 40.13662822235713
            },
            {
                "lng": -4.9623870849609375,
                "lat": 40.12166558618828
            },
            {
                "lng": -5.011138916015625,
                "lat": 40.111688665595956
            },
            {
                "lng": -5.020408630371094,
                "lat": 40.158541224764
            },
            {
                "lng": -5.0640106201171875,
                "lat": 40.15158756460002
            },
            {
                "lng": -5.1422882080078125,
                "lat": 40.089629226126405
            },
            {
                "lng": -5.2054595947265625,
                "lat": 40.08490127291967
            },
            {
                "lng": -5.217132568359375,
                "lat": 40.108537754986166
            },
            {
                "lng": -5.316009521484375,
                "lat": 40.108012589026615
            },
            {
                "lng": -5.335063934326172,
                "lat": 40.11693985890127
            },
            {
                "lng": -5.3688812255859375,
                "lat": 40.10591188464234
            },
            {
                "lng": -5.370941162109374,
                "lat": 39.97817244470628
            },
            {
                "lng": -5.406646728515625,
                "lat": 39.88076184888243
            },
            {
                "lng": -5.3263092041015625,
                "lat": 39.89340672350553
            },
            {
                "lng": -5.2796173095703125,
                "lat": 39.863371338285305
            },
            {
                "lng": -5.313434600830077,
                "lat": 39.834772811663235
            },
            {
                "lng": -5.3194427490234375,
                "lat": 39.765797457856515
            },
            {
                "lng": -5.2658843994140625,
                "lat": 39.7499616158896
            },
            {
                "lng": -5.20751953125,
                "lat": 39.80115102364286
            },
            {
                "lng": -5.159454345703124,
                "lat": 39.78162965844789
            },
            {
                "lng": -5.1573944091796875,
                "lat": 39.666499439014096
            },
            {
                "lng": -5.206661224365234,
                "lat": 39.598545958995814
            },
            {
                "lng": -5.168037414550781,
                "lat": 39.567190842025255
            },
            {
                "lng": -5.107269287109375,
                "lat": 39.50827899034114
            },
            {
                "lng": -5.0612640380859375,
                "lat": 39.488674756485324
            },
            {
                "lng": -5.0042724609375,
                "lat": 39.42770738465604
            },
            {
                "lng": -4.936981201171875,
                "lat": 39.393223948684415
            },
            {
                "lng": -4.866943359375,
                "lat": 39.3725257020188
            },
            {
                "lng": -4.7728729248046875,
                "lat": 39.39906080585583
            },
            {
                "lng": -4.6849822998046875,
                "lat": 39.454751678179974
            },
            {
                "lng": -4.6698760986328125,
                "lat": 39.42187292509996
            },
            {
                "lng": -4.7014617919921875,
                "lat": 39.330048552942415
            },
            {
                "lng": -4.762916564941406,
                "lat": 39.32062043548392
            },
            {
                "lng": -4.7069549560546875,
                "lat": 39.20937910082159
            },
            {
                "lng": -4.64344024658203,
                "lat": 39.16839998800286
            },
            {
                "lng": -4.807891845703125,
                "lat": 39.19980170799331
            },
            {
                "lng": -4.8394775390625,
                "lat": 39.17478791493289
            },
            {
                "lng": -4.874324798583984,
                "lat": 39.10462201802725
            },
            {
                "lng": -4.822998046875,
                "lat": 39.06611426153784
            },
            {
                "lng": -4.865570068359375,
                "lat": 39.03091925576062
            },
            {
                "lng": -4.964275360107422,
                "lat": 39.059050004492974
            },
            {
                "lng": -4.939727783203124,
                "lat": 38.973289606929875
            },
            {
                "lng": -4.829864501953125,
                "lat": 38.9407187858066
            },
            {
                "lng": -4.8566436767578125,
                "lat": 38.88355020746342
            },
            {
                "lng": -4.930286407470703,
                "lat": 38.87553224107675
            },
            {
                "lng": -4.9610137939453125,
                "lat": 38.79730966645055
            },
            {
                "lng": -4.9938011169433585,
                "lat": 38.7386867512344
            },
            {
                "lng": -5.043239593505859,
                "lat": 38.73158984401968
            },
            {
                "lng": -5.0008392333984375,
                "lat": 38.69354912220923
            },
            {
                "lng": -4.878959655761719,
                "lat": 38.68631373688367
            },
            {
                "lng": -4.8580169677734375,
                "lat": 38.6115052496676
            },
            {
                "lng": -4.685325622558593,
                "lat": 38.558367981352994
            },
            {
                "lng": -4.467315673828125,
                "lat": 38.42024233971639
            },
            {
                "lng": -4.28466796875,
                "lat": 38.34569523235754
            },
            {
                "lng": -4.267845153808594,
                "lat": 38.35054178253676
            },
            {
                "lng": -4.275054931640624,
                "lat": 38.4014109752926
            },
            {
                "lng": -3.983230590820313,
                "lat": 38.36696379052957
            },
            {
                "lng": -3.854827880859375,
                "lat": 38.37773029803778
            },
            {
                "lng": -3.80950927734375,
                "lat": 38.42508389732895
            },
            {
                "lng": -3.6203384399414062,
                "lat": 38.40087286420115
            },
            {
                "lng": -3.580169677734375,
                "lat": 38.45573955865588
            },
            {
                "lng": -3.5091018676757812,
                "lat": 38.40679186588536
            },
            {
                "lng": -3.4256744384765625,
                "lat": 38.40571571981403
            },
            {
                "lng": -3.37005615234375,
                "lat": 38.47563187862808
            },
            {
                "lng": -3.313751220703125,
                "lat": 38.480738480909324
            },
            {
                "lng": -3.127670288085937,
                "lat": 38.4428334985915
            },
            {
                "lng": -3.0596923828124996,
                "lat": 38.483157271516305
            },
            {
                "lng": -3.0002975463867188,
                "lat": 38.414324439708174
            },
            {
                "lng": -2.9601287841796875,
                "lat": 38.47240646975172
            },
            {
                "lng": -2.8839111328125,
                "lat": 38.45520185223857
            },
            {
                "lng": -2.77130126953125,
                "lat": 38.53420168131867
            },
            {
                "lng": -2.684783935546875,
                "lat": 38.49820570027112
            },
            {
                "lng": -2.5934600830078125,
                "lat": 38.511639141458616
            },
            {
                "lng": -2.5550079345703125,
                "lat": 38.40410147066251
            },
            {
                "lng": -2.4863433837890625,
                "lat": 38.389571605973515
            },
            {
                "lng": -2.4808502197265625,
                "lat": 38.29694245262843
            },
            {
                "lng": -2.439651489257812,
                "lat": 38.28077407528952
            },
            {
                "lng": -2.454071044921875,
                "lat": 38.18260873429114
            },
            {
                "lng": -2.54608154296875,
                "lat": 38.079446632654914
            },
            {
                "lng": -2.3447227478027344,
                "lat": 38.02443035050434
            },
            {
                "lng": -2.318115234375,
                "lat": 38.079446632654914
            },
            {
                "lng": -2.2377777099609375,
                "lat": 38.155077102180655
            },
            {
                "lng": -2.2036170959472656,
                "lat": 38.21404145384535
            },
            {
                "lng": -2.064056396484375,
                "lat": 38.30448646269451
            },
            {
                "lng": -1.9871520996093748,
                "lat": 38.281986828527295
            },
            {
                "lng": -1.7349815368652342,
                "lat": 38.37867229122634
            },
            {
                "lng": -1.679534912109375,
                "lat": 38.35740717342451
            },
            {
                "lng": -1.6664886474609375,
                "lat": 38.31095213263407
            },
            {
                "lng": -1.5856361389160154,
                "lat": 38.314723507247336
            },
            {
                "lng": -1.4776611328125,
                "lat": 38.38042167460681
            },
            {
                "lng": -1.494140625,
                "lat": 38.54601733154524
            },
            {
                "lng": -1.4211845397949217,
                "lat": 38.68430377776664
            },
            {
                "lng": -1.3629913330078125,
                "lat": 38.70587438959806
            },
            {
                "lng": -1.3429069519042969,
                "lat": 38.676933444637925
            },
            {
                "lng": -1.1808586120605469,
                "lat": 38.75595740859807
            },
            {
                "lng": -1.1125373840332031,
                "lat": 38.73533924135184
            },
            {
                "lng": -1.0306549072265625,
                "lat": 38.65709677909306
            },
            {
                "lng": -0.9619903564453125,
                "lat": 38.65870536210692
            },
            {
                "lng": -0.9166717529296875,
                "lat": 38.69730051540361
            },
            {
                "lng": -0.9626770019531251,
                "lat": 38.775499003812946
            },
            {
                "lng": -0.9513473510742189,
                "lat": 38.77656962147866
            },
            {
                "lng": -0.9304046630859375,
                "lat": 38.785133984236815
            },
            {
                "lng": -0.9334945678710938,
                "lat": 38.80894820919321
            },
            {
                "lng": -0.9235382080078124,
                "lat": 38.825265722073624
            },
            {
                "lng": -0.9358978271484375,
                "lat": 38.85788953063659
            },
            {
                "lng": -0.9238815307617188,
                "lat": 38.891567269117026
            },
            {
                "lng": -0.9407043457031249,
                "lat": 38.90172091499795
            },
            {
                "lng": -0.9578704833984375,
                "lat": 38.94499122180986
            },
            {
                "lng": -1.003875732421875,
                "lat": 38.950865400919994
            },
            {
                "lng": -1.0196685791015625,
                "lat": 38.93751428984747
            },
            {
                "lng": -1.14532470703125,
                "lat": 38.92896825930919
            },
            {
                "lng": -1.2270355224609375,
                "lat": 39.02398483891689
            },
            {
                "lng": -1.2654876708984375,
                "lat": 39.04558597274386
            },
            {
                "lng": -1.26617431640625,
                "lat": 39.07677595221322
            },
            {
                "lng": -1.2558746337890623,
                "lat": 39.08370518740625
            },
            {
                "lng": -1.2579345703125,
                "lat": 39.10662011662115
            },
            {
                "lng": -1.2407684326171873,
                "lat": 39.11354641989205
            },
            {
                "lng": -1.2284088134765625,
                "lat": 39.152960102433155
            },
            {
                "lng": -1.1968231201171875,
                "lat": 39.18117526158749
            },
            {
                "lng": -1.174163818359375,
                "lat": 39.242357901670495
            },
            {
                "lng": -1.174163818359375,
                "lat": 39.279573405302806
            },
            {
                "lng": -1.1666107177734375,
                "lat": 39.310925412127155
            },
            {
                "lng": -1.256561279296875,
                "lat": 39.32845515755447
            },
            {
                "lng": -1.3348388671875,
                "lat": 39.33589069206677
            },
            {
                "lng": -1.3969802856445312,
                "lat": 39.375445057297966
            },
            {
                "lng": -1.44744873046875,
                "lat": 39.363501468500914
            },
            {
                "lng": -1.4591217041015625,
                "lat": 39.38950933076637
            },
            {
                "lng": -1.52435302734375,
                "lat": 39.45263093663008
            },
            {
                "lng": -1.503753662109375,
                "lat": 39.52787769468346
            },
            {
                "lng": -1.5027236938476562,
                "lat": 39.564941195531524
            },
            {
                "lng": -1.4646148681640625,
                "lat": 39.574468610051774
            },
            {
                "lng": -1.426849365234375,
                "lat": 39.65222681530652
            },
            {
                "lng": -1.3726043701171875,
                "lat": 39.690808971939994
            },
            {
                "lng": -1.325225830078125,
                "lat": 39.67495589920286
            },
            {
                "lng": -1.2833404541015625,
                "lat": 39.6765413702479
            },
            {
                "lng": -1.26068115234375,
                "lat": 39.69979076426969
            },
            {
                "lng": -1.275787353515625,
                "lat": 39.73517821171903
            },
            {
                "lng": -1.2339019775390625,
                "lat": 39.78374034338062
            },
            {
                "lng": -1.20025634765625,
                "lat": 39.86020895357945
            },
            {
                "lng": -1.2078094482421875,
                "lat": 39.946068593571304
            },
            {
                "lng": -1.1420631408691406,
                "lat": 39.97277899879356
            }
        ]
    ],
    [
        [
            {
                "lng": 0.6598663330078125,
                "lat": 42.69051116998241
            },
            {
                "lng": 0.6777191162109375,
                "lat": 42.693539313660004
            },
            {
                "lng": 0.6790924072265625,
                "lat": 42.71372316507779
            },
            {
                "lng": 0.671539306640625,
                "lat": 42.736422154050864
            },
            {
                "lng": 0.655059814453125,
                "lat": 42.75356699282749
            },
            {
                "lng": 0.6653594970703125,
                "lat": 42.77221922375653
            },
            {
                "lng": 0.6468200683593749,
                "lat": 42.78985805744296
            },
            {
                "lng": 0.6667327880859375,
                "lat": 42.80396550624671
            },
            {
                "lng": 0.6591796875,
                "lat": 42.83368138733589
            },
            {
                "lng": 0.6749725341796875,
                "lat": 42.852812868190014
            },
            {
                "lng": 0.7072448730468749,
                "lat": 42.86086645611156
            },
            {
                "lng": 0.7772827148437499,
                "lat": 42.83670254133755
            },
            {
                "lng": 0.81573486328125,
                "lat": 42.84073051691987
            },
            {
                "lng": 0.8466339111328125,
                "lat": 42.82663145362289
            },
            {
                "lng": 0.8850860595703125,
                "lat": 42.81051429991596
            },
            {
                "lng": 0.9317779541015625,
                "lat": 42.79136972365016
            },
            {
                "lng": 0.95855712890625,
                "lat": 42.80698811255233
            },
            {
                "lng": 0.9860229492187499,
                "lat": 42.78431496548022
            },
            {
                "lng": 1.07666015625,
                "lat": 42.78582676705989
            },
            {
                "lng": 1.11236572265625,
                "lat": 42.76617046685292
            },
            {
                "lng": 1.1322784423828125,
                "lat": 42.742978093466434
            },
            {
                "lng": 1.1569976806640625,
                "lat": 42.71574118930587
            },
            {
                "lng": 1.1734771728515625,
                "lat": 42.70867781741311
            },
            {
                "lng": 1.2311553955078123,
                "lat": 42.73036990242392
            },
            {
                "lng": 1.286773681640625,
                "lat": 42.71624568510944
            },
            {
                "lng": 1.3396453857421875,
                "lat": 42.72431706017358
            },
            {
                "lng": 1.355438232421875,
                "lat": 42.71977704089522
            },
            {
                "lng": 1.349945068359375,
                "lat": 42.70009978513702
            },
            {
                "lng": 1.3938903808593748,
                "lat": 42.68647341541784
            },
            {
                "lng": 1.3897705078125,
                "lat": 42.66880515319917
            },
            {
                "lng": 1.413116455078125,
                "lat": 42.64961678064491
            },
            {
                "lng": 1.4289093017578125,
                "lat": 42.61122227199062
            },
            {
                "lng": 1.4426422119140625,
                "lat": 42.603641609996586
            },
            {
                "lng": 1.4295959472656248,
                "lat": 42.58544425738491
            },
            {
                "lng": 1.4447021484374998,
                "lat": 42.57280408080623
            },
            {
                "lng": 1.4227294921875,
                "lat": 42.55055114674488
            },
            {
                "lng": 1.4144897460937498,
                "lat": 42.53689200787317
            },
            {
                "lng": 1.44744873046875,
                "lat": 42.54093947168063
            },
            {
                "lng": 1.4666748046875,
                "lat": 42.51108325890067
            },
            {
                "lng": 1.4247894287109375,
                "lat": 42.49235259142821
            },
            {
                "lng": 1.41998291015625,
                "lat": 42.48019996901214
            },
            {
                "lng": 1.440582275390625,
                "lat": 42.46905799126156
            },
            {
                "lng": 1.4453887939453125,
                "lat": 42.43916743978628
            },
            {
                "lng": 1.5113067626953125,
                "lat": 42.428524987525385
            },
            {
                "lng": 1.5483856201171875,
                "lat": 42.43308625978406
            },
            {
                "lng": 1.558685302734375,
                "lat": 42.45690084412248
            },
            {
                "lng": 1.577911376953125,
                "lat": 42.45031473711917
            },
            {
                "lng": 1.5991973876953125,
                "lat": 42.47007098029904
            },
            {
                "lng": 1.6403961181640625,
                "lat": 42.46703196400574
            },
            {
                "lng": 1.67266845703125,
                "lat": 42.507033860318465
            },
            {
                "lng": 1.7035675048828125,
                "lat": 42.489820989777066
            },
            {
                "lng": 1.72760009765625,
                "lat": 42.507033860318465
            },
            {
                "lng": 1.7584991455078123,
                "lat": 42.49032731830467
            },
            {
                "lng": 1.8079376220703125,
                "lat": 42.49083364273358
            },
            {
                "lng": 1.8408966064453125,
                "lat": 42.476655009444045
            },
            {
                "lng": 1.8999481201171873,
                "lat": 42.44980808481614
            },
            {
                "lng": 1.93634033203125,
                "lat": 42.45740743905052
            },
            {
                "lng": 1.9438934326171875,
                "lat": 42.435113385352594
            },
            {
                "lng": 1.9569396972656248,
                "lat": 42.42193589715428
            },
            {
                "lng": 1.9713592529296873,
                "lat": 42.381879610913195
            },
            {
                "lng": 2.0111846923828125,
                "lat": 42.353469793490646
            },
            {
                "lng": 2.0709228515625,
                "lat": 42.36209556053167
            },
            {
                "lng": 2.1169281005859375,
                "lat": 42.38441557693553
            },
            {
                "lng": 2.1292877197265625,
                "lat": 42.415853045217105
            },
            {
                "lng": 2.1952056884765625,
                "lat": 42.420415239489934
            },
            {
                "lng": 2.2501373291015625,
                "lat": 42.43714044535348
            },
            {
                "lng": 2.322235107421875,
                "lat": 42.42548395494743
            },
            {
                "lng": 2.4211120605468746,
                "lat": 42.39252997985308
            },
            {
                "lng": 2.4684906005859375,
                "lat": 42.359051307364425
            },
            {
                "lng": 2.5289154052734375,
                "lat": 42.334184385939416
            },
            {
                "lng": 2.5714874267578125,
                "lat": 42.36158819524629
            },
            {
                "lng": 2.6751708984375,
                "lat": 42.342305278572816
            },
            {
                "lng": 2.651824951171875,
                "lat": 42.40013627993724
            },
            {
                "lng": 2.7321624755859375,
                "lat": 42.42497710184191
            },
            {
                "lng": 2.7857208251953125,
                "lat": 42.414839179192406
            },
            {
                "lng": 2.8488922119140625,
                "lat": 42.461460050936715
            },
            {
                "lng": 2.8914642333984375,
                "lat": 42.46095348879496
            },
            {
                "lng": 2.9656219482421875,
                "lat": 42.47918714391391
            },
            {
                "lng": 3.022613525390625,
                "lat": 42.47057746867015
            },
            {
                "lng": 3.080291748046875,
                "lat": 42.429031811945784
            },
            {
                "lng": 3.1695556640624996,
                "lat": 42.435113385352594
            },
            {
                "lng": 3.1503295898437496,
                "lat": 42.37680737157286
            },
            {
                "lng": 3.19427490234375,
                "lat": 42.33875251709215
            },
            {
                "lng": 3.2354736328125,
                "lat": 42.35194747639862
            },
            {
                "lng": 3.3185577392578125,
                "lat": 42.32250876543571
            },
            {
                "lng": 3.29315185546875,
                "lat": 42.3037216984154
            },
            {
                "lng": 3.2862854003906246,
                "lat": 42.26460631064456
            },
            {
                "lng": 3.2553863525390625,
                "lat": 42.242243757492744
            },
            {
                "lng": 3.2238006591796875,
                "lat": 42.24631026600387
            },
            {
                "lng": 3.2135009765625,
                "lat": 42.2341099541558
            },
            {
                "lng": 3.16680908203125,
                "lat": 42.265622601934865
            },
            {
                "lng": 3.12286376953125,
                "lat": 42.2341099541558
            },
            {
                "lng": 3.113250732421875,
                "lat": 42.165439250064324
            },
            {
                "lng": 3.129730224609375,
                "lat": 42.12674735753131
            },
            {
                "lng": 3.1757354736328125,
                "lat": 42.10382653879911
            },
            {
                "lng": 3.2107543945312496,
                "lat": 42.07019434387713
            },
            {
                "lng": 3.2107543945312496,
                "lat": 42.05388140723485
            },
            {
                "lng": 3.1977081298828125,
                "lat": 42.04572336729411
            },
            {
                "lng": 3.2059478759765625,
                "lat": 41.98960848263659
            },
            {
                "lng": 3.23272705078125,
                "lat": 41.96868026812728
            },
            {
                "lng": 3.2169342041015625,
                "lat": 41.94263801258577
            },
            {
                "lng": 3.2107543945312496,
                "lat": 41.90738743599137
            },
            {
                "lng": 3.187408447265625,
                "lat": 41.88592102814744
            },
            {
                "lng": 3.1661224365234375,
                "lat": 41.859844975978454
            },
            {
                "lng": 3.1359100341796875,
                "lat": 41.843989628462204
            },
            {
                "lng": 3.1029510498046875,
                "lat": 41.84552418869496
            },
            {
                "lng": 3.0699920654296875,
                "lat": 41.81636125072054
            },
            {
                "lng": 2.98004150390625,
                "lat": 41.76004433989712
            },
            {
                "lng": 2.9518890380859375,
                "lat": 41.73237975329554
            },
            {
                "lng": 2.9230499267578125,
                "lat": 41.71136719885689
            },
            {
                "lng": 2.82623291015625,
                "lat": 41.6908605241911
            },
            {
                "lng": 2.7740478515625,
                "lat": 41.65239288426814
            },
            {
                "lng": 2.700576782226562,
                "lat": 41.623655390686395
            },
            {
                "lng": 2.54058837890625,
                "lat": 41.569224340276165
            },
            {
                "lng": 2.456817626953125,
                "lat": 41.53890792786977
            },
            {
                "lng": 2.390899658203125,
                "lat": 41.49726393195056
            },
            {
                "lng": 2.3091888427734375,
                "lat": 41.47668911274522
            },
            {
                "lng": 2.267303466796875,
                "lat": 41.45559314261393
            },
            {
                "lng": 2.2206115722656246,
                "lat": 41.40153558289846
            },
            {
                "lng": 2.1917724609375,
                "lat": 41.37165592008984
            },
            {
                "lng": 2.1457672119140625,
                "lat": 41.29844430929419
            },
            {
                "lng": 2.0592498779296875,
                "lat": 41.269549502842565
            },
            {
                "lng": 1.9390869140625,
                "lat": 41.26387223389547
            },
            {
                "lng": 1.891021728515625,
                "lat": 41.2509675141624
            },
            {
                "lng": 1.8285369873046873,
                "lat": 41.23702755320388
            },
            {
                "lng": 1.78253173828125,
                "lat": 41.224633980434
            },
            {
                "lng": 1.7186737060546875,
                "lat": 41.210171842860014
            },
            {
                "lng": 1.6534423828125,
                "lat": 41.193639770278736
            },
            {
                "lng": 1.5387725830078125,
                "lat": 41.1817547636353
            },
            {
                "lng": 1.4577484130859375,
                "lat": 41.16314781378642
            },
            {
                "lng": 1.4028167724609375,
                "lat": 41.136261778998055
            },
            {
                "lng": 1.3478851318359375,
                "lat": 41.13057293580209
            },
            {
                "lng": 1.28265380859375,
                "lat": 41.12436636241968
            },
            {
                "lng": 1.1858367919921873,
                "lat": 41.089702205437405
            },
            {
                "lng": 1.1693572998046875,
                "lat": 41.052948577367104
            },
            {
                "lng": 1.1363983154296875,
                "lat": 41.07572789469521
            },
            {
                "lng": 1.047821044921875,
                "lat": 41.0633037906805
            },
            {
                "lng": 0.9331512451171874,
                "lat": 41.001666266518185
            },
            {
                "lng": 0.8960723876953125,
                "lat": 40.97004819103926
            },
            {
                "lng": 0.8397674560546875,
                "lat": 40.914550362677204
            },
            {
                "lng": 0.767669677734375,
                "lat": 40.85848657915526
            },
            {
                "lng": 0.7051849365234375,
                "lat": 40.8034148344062
            },
            {
                "lng": 0.714111328125,
                "lat": 40.777421721005936
            },
            {
                "lng": 0.7711029052734375,
                "lat": 40.764421348741976
            },
            {
                "lng": 0.7312774658203125,
                "lat": 40.78626052122175
            },
            {
                "lng": 0.7711029052734375,
                "lat": 40.79249896613324
            },
            {
                "lng": 0.8184814453125,
                "lat": 40.749337730454826
            },
            {
                "lng": 0.87615966796875,
                "lat": 40.72800677563629
            },
            {
                "lng": 0.8521270751953125,
                "lat": 40.67647212850004
            },
            {
                "lng": 0.7656097412109375,
                "lat": 40.64938745451837
            },
            {
                "lng": 0.7010650634765625,
                "lat": 40.63427776326904
            },
            {
                "lng": 0.6035614013671875,
                "lat": 40.61864344909241
            },
            {
                "lng": 0.5458831787109375,
                "lat": 40.5711969762958
            },
            {
                "lng": 0.516357421875,
                "lat": 40.52423878069866
            },
            {
                "lng": 0.4346466064453125,
                "lat": 40.551374198715166
            },
            {
                "lng": 0.44219970703125,
                "lat": 40.57875938354497
            },
            {
                "lng": 0.38486480712890625,
                "lat": 40.6071759593464
            },
            {
                "lng": 0.2911376953125,
                "lat": 40.62333412763721
            },
            {
                "lng": 0.26470184326171875,
                "lat": 40.650689853970604
            },
            {
                "lng": 0.28598785400390625,
                "lat": 40.680117302362376
            },
            {
                "lng": 0.28049468994140625,
                "lat": 40.694956309550584
            },
            {
                "lng": 0.2588653564453125,
                "lat": 40.70797026199811
            },
            {
                "lng": 0.23860931396484375,
                "lat": 40.701463603604594
            },
            {
                "lng": 0.22521972656249997,
                "lat": 40.73347023268492
            },
            {
                "lng": 0.1922607421875,
                "lat": 40.72852712420599
            },
            {
                "lng": 0.1702880859375,
                "lat": 40.73216945026674
            },
            {
                "lng": 0.1572418212890625,
                "lat": 40.72332345541449
            },
            {
                "lng": 0.160675048828125,
                "lat": 40.74517613004631
            },
            {
                "lng": 0.23311614990234378,
                "lat": 40.776901754952355
            },
            {
                "lng": 0.27225494384765625,
                "lat": 40.82316279497129
            },
            {
                "lng": 0.2519989013671875,
                "lat": 40.91792305645495
            },
            {
                "lng": 0.2931976318359375,
                "lat": 40.975232520986964
            },
            {
                "lng": 0.2011871337890625,
                "lat": 41.09435964868545
            },
            {
                "lng": 0.2176666259765625,
                "lat": 41.13574463182004
            },
            {
                "lng": 0.2986907958984375,
                "lat": 41.15952918206549
            },
            {
                "lng": 0.318603515625,
                "lat": 41.22721616850761
            },
            {
                "lng": 0.3769683837890625,
                "lat": 41.24064190269477
            },
            {
                "lng": 0.383148193359375,
                "lat": 41.28967402411714
            },
            {
                "lng": 0.3591156005859375,
                "lat": 41.3427935623111
            },
            {
                "lng": 0.36735534667968744,
                "lat": 41.364441530542244
            },
            {
                "lng": 0.3165435791015625,
                "lat": 41.39689998354142
            },
            {
                "lng": 0.3426361083984375,
                "lat": 41.47977575214487
            },
            {
                "lng": 0.406494140625,
                "lat": 41.5008638535525
            },
            {
                "lng": 0.449066162109375,
                "lat": 41.54404730359805
            },
            {
                "lng": 0.4277801513671875,
                "lat": 41.60209386160467
            },
            {
                "lng": 0.3467559814453125,
                "lat": 41.604147651076765
            },
            {
                "lng": 0.328216552734375,
                "lat": 41.672142477528304
            },
            {
                "lng": 0.40512084960937494,
                "lat": 41.76055653463573
            },
            {
                "lng": 0.47035217285156244,
                "lat": 41.7656782571705
            },
            {
                "lng": 0.4991912841796875,
                "lat": 41.81687299570986
            },
            {
                "lng": 0.553436279296875,
                "lat": 41.828642001860544
            },
            {
                "lng": 0.586395263671875,
                "lat": 41.86700416724041
            },
            {
                "lng": 0.5966949462890624,
                "lat": 41.923737951221014
            },
            {
                "lng": 0.5541229248046875,
                "lat": 41.937019660425264
            },
            {
                "lng": 0.6543731689453124,
                "lat": 42.01206037830709
            },
            {
                "lng": 0.6986618041992188,
                "lat": 42.16391238682557
            },
            {
                "lng": 0.7498168945312499,
                "lat": 42.30676863078423
            },
            {
                "lng": 0.7525634765625,
                "lat": 42.34738030389109
            },
            {
                "lng": 0.737457275390625,
                "lat": 42.407741658078145
            },
            {
                "lng": 0.69488525390625,
                "lat": 42.49235259142821
            },
            {
                "lng": 0.7522201538085938,
                "lat": 42.5733097370664
            },
            {
                "lng": 0.76629638671875,
                "lat": 42.60869548716233
            },
            {
                "lng": 0.6969451904296874,
                "lat": 42.63799988907408
            },
            {
                "lng": 0.6598663330078125,
                "lat": 42.69051116998241
            }
        ]
    ],
    [
        [
            {
                "lng": 0.5160140991210938,
                "lat": 40.52423878069866
            },
            {
                "lng": 0.4346466064453125,
                "lat": 40.55111333356784
            },
            {
                "lng": 0.44185638427734375,
                "lat": 40.57875938354497
            },
            {
                "lng": 0.38555145263671875,
                "lat": 40.6071759593464
            },
            {
                "lng": 0.29148101806640625,
                "lat": 40.62333412763721
            },
            {
                "lng": 0.26435852050781244,
                "lat": 40.650689853970604
            },
            {
                "lng": 0.2863311767578125,
                "lat": 40.680117302362376
            },
            {
                "lng": 0.28049468994140625,
                "lat": 40.69547691646669
            },
            {
                "lng": 0.2588653564453125,
                "lat": 40.70823051511181
            },
            {
                "lng": 0.23860931396484375,
                "lat": 40.701463603604594
            },
            {
                "lng": 0.22556304931640628,
                "lat": 40.73347023268492
            },
            {
                "lng": 0.1922607421875,
                "lat": 40.72852712420599
            },
            {
                "lng": 0.16994476318359375,
                "lat": 40.73242960878483
            },
            {
                "lng": 0.15689849853515625,
                "lat": 40.72332345541449
            },
            {
                "lng": 0.10608673095703125,
                "lat": 40.72800677563629
            },
            {
                "lng": 0.0418853759765625,
                "lat": 40.6920928987952
            },
            {
                "lng": 0.0116729736328125,
                "lat": 40.7290474687069
            },
            {
                "lng": -0.03261566162109375,
                "lat": 40.725925340669626
            },
            {
                "lng": -0.102996826171875,
                "lat": 40.74283511537101
            },
            {
                "lng": -0.1627349853515625,
                "lat": 40.79379856838544
            },
            {
                "lng": -0.2245330810546875,
                "lat": 40.75635984059143
            },
            {
                "lng": -0.2300262451171875,
                "lat": 40.69365477446245
            },
            {
                "lng": -0.31139373779296875,
                "lat": 40.661108134469295
            },
            {
                "lng": -0.3275299072265625,
                "lat": 40.67985693941085
            },
            {
                "lng": -0.3769683837890625,
                "lat": 40.6723059714534
            },
            {
                "lng": -0.38280487060546875,
                "lat": 40.61890405098613
            },
            {
                "lng": -0.2959442138671875,
                "lat": 40.615255531963044
            },
            {
                "lng": -0.29972076416015625,
                "lat": 40.5268484330944
            },
            {
                "lng": -0.2691650390625,
                "lat": 40.47803111892374
            },
            {
                "lng": -0.341949462890625,
                "lat": 40.45974812012843
            },
            {
                "lng": -0.34469604492187494,
                "lat": 40.43754064484924
            },
            {
                "lng": -0.27843475341796875,
                "lat": 40.384212768155045
            },
            {
                "lng": -0.2918243408203125,
                "lat": 40.36721216594231
            },
            {
                "lng": -0.3680419921875,
                "lat": 40.30963984228559
            },
            {
                "lng": -0.39791107177734375,
                "lat": 40.25883076530056
            },
            {
                "lng": -0.49713134765625,
                "lat": 40.228956072677974
            },
            {
                "lng": -0.5482864379882812,
                "lat": 40.24913603826261
            },
            {
                "lng": -0.5692291259765625,
                "lat": 40.177824065238816
            },
            {
                "lng": -0.611114501953125,
                "lat": 40.1258659569295
            },
            {
                "lng": -0.6155776977539061,
                "lat": 40.07386810509482
            },
            {
                "lng": -0.688018798828125,
                "lat": 40.04654018618778
            },
            {
                "lng": -0.7577133178710938,
                "lat": 40.04680300682545
            },
            {
                "lng": -0.7752227783203125,
                "lat": 40.00158295726282
            },
            {
                "lng": -0.8435440063476562,
                "lat": 39.977120098439634
            },
            {
                "lng": -0.8425140380859375,
                "lat": 39.94106745695668
            },
            {
                "lng": -0.7920455932617188,
                "lat": 39.88471362273907
            },
            {
                "lng": -0.8397674560546875,
                "lat": 39.86231722624386
            },
            {
                "lng": -0.8933258056640625,
                "lat": 39.85810061614039
            },
            {
                "lng": -0.9159851074218749,
                "lat": 39.95764876954889
            },
            {
                "lng": -0.9740066528320314,
                "lat": 39.98106631337906
            },
            {
                "lng": -1.0618972778320312,
                "lat": 39.980803239473126
            },
            {
                "lng": -1.1415481567382812,
                "lat": 39.97291055131899
            },
            {
                "lng": -1.2084960937499998,
                "lat": 39.946068593571304
            },
            {
                "lng": -1.1995697021484375,
                "lat": 39.859945414941905
            },
            {
                "lng": -1.2332153320312498,
                "lat": 39.78347651130465
            },
            {
                "lng": -1.2761306762695312,
                "lat": 39.734914193536106
            },
            {
                "lng": -1.26068115234375,
                "lat": 39.6995266105892
            },
            {
                "lng": -1.2836837768554688,
                "lat": 39.6768056118839
            },
            {
                "lng": -1.325225830078125,
                "lat": 39.67495589920286
            },
            {
                "lng": -1.373291015625,
                "lat": 39.690544783884505
            },
            {
                "lng": -1.4275360107421875,
                "lat": 39.65222681530652
            },
            {
                "lng": -1.4646148681640625,
                "lat": 39.574468610051774
            },
            {
                "lng": -1.5030670166015625,
                "lat": 39.564941195531524
            },
            {
                "lng": -1.503753662109375,
                "lat": 39.52787769468346
            },
            {
                "lng": -1.5246963500976562,
                "lat": 39.452100741148676
            },
            {
                "lng": -1.4591217041015625,
                "lat": 39.390040002576505
            },
            {
                "lng": -1.44744873046875,
                "lat": 39.363501468500914
            },
            {
                "lng": -1.3973236083984375,
                "lat": 39.375445057297966
            },
            {
                "lng": -1.3344955444335938,
                "lat": 39.33589069206677
            },
            {
                "lng": -1.2562179565429688,
                "lat": 39.32845515755447
            },
            {
                "lng": -1.1923599243164062,
                "lat": 39.31570668743999
            },
            {
                "lng": -1.1669540405273435,
                "lat": 39.310659776140994
            },
            {
                "lng": -1.174507141113281,
                "lat": 39.279307650338886
            },
            {
                "lng": -1.174163818359375,
                "lat": 39.24209200558068
            },
            {
                "lng": -1.1971664428710935,
                "lat": 39.18090913372923
            },
            {
                "lng": -1.2287521362304688,
                "lat": 39.152960102433155
            },
            {
                "lng": -1.241455078125,
                "lat": 39.11328003619937
            },
            {
                "lng": -1.2575912475585938,
                "lat": 39.10635370674779
            },
            {
                "lng": -1.2562179565429688,
                "lat": 39.08397168286113
            },
            {
                "lng": -1.26617431640625,
                "lat": 39.07677595221322
            },
            {
                "lng": -1.2651443481445312,
                "lat": 39.04585261214505
            },
            {
                "lng": -1.226348876953125,
                "lat": 39.02371811699127
            },
            {
                "lng": -1.1460113525390625,
                "lat": 38.929235338350686
            },
            {
                "lng": -1.061553955078125,
                "lat": 38.93511082284234
            },
            {
                "lng": -1.0200119018554688,
                "lat": 38.93724724198067
            },
            {
                "lng": -1.0031890869140625,
                "lat": 38.950865400919994
            },
            {
                "lng": -0.9578704833984375,
                "lat": 38.94499122180986
            },
            {
                "lng": -0.9403610229492186,
                "lat": 38.90118654877647
            },
            {
                "lng": -0.9238815307617188,
                "lat": 38.891567269117026
            },
            {
                "lng": -0.9358978271484375,
                "lat": 38.85788953063659
            },
            {
                "lng": -0.9231948852539061,
                "lat": 38.8249982520056
            },
            {
                "lng": -0.9331512451171874,
                "lat": 38.80868067783546
            },
            {
                "lng": -0.9307479858398436,
                "lat": 38.785133984236815
            },
            {
                "lng": -0.9510040283203125,
                "lat": 38.77630196856888
            },
            {
                "lng": -0.9619903564453125,
                "lat": 38.77496368895352
            },
            {
                "lng": -0.9520339965820311,
                "lat": 38.75542194710325
            },
            {
                "lng": -0.9336662292480468,
                "lat": 38.72154584589405
            },
            {
                "lng": -0.9331512451171874,
                "lat": 38.721144056601
            },
            {
                "lng": -0.9163284301757812,
                "lat": 38.69730051540361
            },
            {
                "lng": -0.9386444091796874,
                "lat": 38.67773751786457
            },
            {
                "lng": -0.9616470336914062,
                "lat": 38.65843726744673
            },
            {
                "lng": -1.0306549072265625,
                "lat": 38.65709677909306
            },
            {
                "lng": -1.0152053833007812,
                "lat": 38.637656878877266
            },
            {
                "lng": -1.0025024414062498,
                "lat": 38.57340069124239
            },
            {
                "lng": -1.0270500183105469,
                "lat": 38.52359279656847
            },
            {
                "lng": -1.01348876953125,
                "lat": 38.49981784551419
            },
            {
                "lng": -1.097259521484375,
                "lat": 38.43960662292252
            },
            {
                "lng": -1.083526611328125,
                "lat": 38.349195551131
            },
            {
                "lng": -0.9985542297363281,
                "lat": 38.3296723836506
            },
            {
                "lng": -0.9690284729003906,
                "lat": 38.26406296833964
            },
            {
                "lng": -1.036834716796875,
                "lat": 38.138337107478435
            },
            {
                "lng": -1.0284233093261719,
                "lat": 38.08822918709866
            },
            {
                "lng": -0.8411407470703125,
                "lat": 37.86726491715302
            },
            {
                "lng": -0.7764244079589844,
                "lat": 37.84354589127591
            },
            {
                "lng": -0.7604598999023438,
                "lat": 37.84544369418375
            },
            {
                "lng": -0.742950439453125,
                "lat": 37.90736658145496
            },
            {
                "lng": -0.7175445556640625,
                "lat": 37.91007536562636
            },
            {
                "lng": -0.718231201171875,
                "lat": 37.937157721940636
            },
            {
                "lng": -0.6941986083984375,
                "lat": 37.97180858200971
            },
            {
                "lng": -0.655059814453125,
                "lat": 37.98588082442038
            },
            {
                "lng": -0.652313232421875,
                "lat": 38.04917251752295
            },
            {
                "lng": -0.6406402587890625,
                "lat": 38.12321381072632
            },
            {
                "lng": -0.6049346923828125,
                "lat": 38.18854556604565
            },
            {
                "lng": -0.5266571044921875,
                "lat": 38.191243965987326
            },
            {
                "lng": -0.503997802734375,
                "lat": 38.21336707443815
            },
            {
                "lng": -0.51910400390625,
                "lat": 38.285624966683756
            },
            {
                "lng": -0.5088043212890625,
                "lat": 38.32765244536364
            },
            {
                "lng": -0.4071807861328125,
                "lat": 38.35458032659834
            },
            {
                "lng": -0.40374755859374994,
                "lat": 38.40840605494758
            },
            {
                "lng": -0.325469970703125,
                "lat": 38.47401919222663
            },
            {
                "lng": -0.1778411865234375,
                "lat": 38.5213096674994
            },
            {
                "lng": -0.105743408203125,
                "lat": 38.53259030590471
            },
            {
                "lng": -0.07965087890625,
                "lat": 38.53420168131867
            },
            {
                "lng": -0.0439453125,
                "lat": 38.567495358827344
            },
            {
                "lng": -0.05973815917968749,
                "lat": 38.5825261593533
            },
            {
                "lng": -0.0185394287109375,
                "lat": 38.62706326550212
            },
            {
                "lng": 0.0775909423828125,
                "lat": 38.638863646894485
            },
            {
                "lng": 0.1023101806640625,
                "lat": 38.676933444637925
            },
            {
                "lng": 0.152435302734375,
                "lat": 38.681757748501546
            },
            {
                "lng": 0.2080535888671875,
                "lat": 38.73480362521081
            },
            {
                "lng": 0.234832763671875,
                "lat": 38.73533924135184
            },
            {
                "lng": 0.2204132080078125,
                "lat": 38.770145674423944
            },
            {
                "lng": 0.1750946044921875,
                "lat": 38.81617117607388
            },
            {
                "lng": 0.092010498046875,
                "lat": 38.853611850579966
            },
            {
                "lng": -0.04119873046875,
                "lat": 38.892101707724315
            },
            {
                "lng": -0.1393890380859375,
                "lat": 38.972755779745064
            },
            {
                "lng": -0.2245330810546875,
                "lat": 39.10768574604533
            },
            {
                "lng": -0.237579345703125,
                "lat": 39.181707514281534
            },
            {
                "lng": -0.2142333984375,
                "lat": 39.18277200757995
            },
            {
                "lng": -0.2973175048828125,
                "lat": 39.31570668743999
            },
            {
                "lng": -0.3371429443359375,
                "lat": 39.42505541813694
            },
            {
                "lng": -0.311737060546875,
                "lat": 39.420812061793825
            },
            {
                "lng": -0.28839111328125,
                "lat": 39.45846282044343
            },
            {
                "lng": -0.3261566162109375,
                "lat": 39.482845404533364
            },
            {
                "lng": -0.2877044677734375,
                "lat": 39.564411856338054
            },
            {
                "lng": -0.23895263671874997,
                "lat": 39.6358360942076
            },
            {
                "lng": -0.1929473876953125,
                "lat": 39.69345079688951
            },
            {
                "lng": -0.1373291015625,
                "lat": 39.79323762437003
            },
            {
                "lng": -0.067291259765625,
                "lat": 39.86179016415043
            },
            {
                "lng": -0.006866455078125,
                "lat": 39.919742720952726
            },
            {
                "lng": 0.0267791748046875,
                "lat": 39.980803239473126
            },
            {
                "lng": 0.078277587890625,
                "lat": 40.056001090767424
            },
            {
                "lng": 0.14556884765625,
                "lat": 40.07912221750036
            },
            {
                "lng": 0.17990112304687497,
                "lat": 40.15893480687665
            },
            {
                "lng": 0.26092529296875,
                "lat": 40.20824570152502
            },
            {
                "lng": 0.3467559814453125,
                "lat": 40.29890502420619
            },
            {
                "lng": 0.416107177734375,
                "lat": 40.38002840251183
            },
            {
                "lng": 0.451812744140625,
                "lat": 40.44381173426701
            },
            {
                "lng": 0.5160140991210938,
                "lat": 40.52423878069866
            }
        ]
    ],
    [
        [
            {
                "lng": -5.335235595703125,
                "lat": 40.11693985890127
            },
            {
                "lng": -5.3668212890625,
                "lat": 40.1628705025241
            },
            {
                "lng": -5.367507934570312,
                "lat": 40.221354266755185
            },
            {
                "lng": -5.341072082519531,
                "lat": 40.266428364211436
            },
            {
                "lng": -5.3647613525390625,
                "lat": 40.25856876391262
            },
            {
                "lng": -5.4306793212890625,
                "lat": 40.2520183994864
            },
            {
                "lng": -5.488014221191406,
                "lat": 40.20536147688369
            },
            {
                "lng": -5.519256591796875,
                "lat": 40.19697030740908
            },
            {
                "lng": -5.553245544433594,
                "lat": 40.20195268954057
            },
            {
                "lng": -5.591011047363281,
                "lat": 40.2155868104582
            },
            {
                "lng": -5.607490539550781,
                "lat": 40.21637331067943
            },
            {
                "lng": -5.621223449707031,
                "lat": 40.22528634184373
            },
            {
                "lng": -5.623283386230469,
                "lat": 40.24651560335453
            },
            {
                "lng": -5.6600189208984375,
                "lat": 40.25987876070676
            },
            {
                "lng": -5.666198730468749,
                "lat": 40.27716834118786
            },
            {
                "lng": -5.707054138183594,
                "lat": 40.292882306191984
            },
            {
                "lng": -5.7424163818359375,
                "lat": 40.29157294863328
            },
            {
                "lng": -5.766448974609375,
                "lat": 40.28188291424876
            },
            {
                "lng": -5.79975128173828,
                "lat": 40.29340604211214
            },
            {
                "lng": -5.782928466796875,
                "lat": 40.321681753783764
            },
            {
                "lng": -5.796318054199218,
                "lat": 40.35439349189311
            },
            {
                "lng": -5.817604064941406,
                "lat": 40.35230041569844
            },
            {
                "lng": -5.849876403808594,
                "lat": 40.327701904195926
            },
            {
                "lng": -5.854682922363281,
                "lat": 40.33843214502476
            },
            {
                "lng": -5.889015197753906,
                "lat": 40.32560799973207
            },
            {
                "lng": -5.917510986328125,
                "lat": 40.27952566881291
            },
            {
                "lng": -5.940513610839844,
                "lat": 40.28240673540621
            },
            {
                "lng": -6.0115814208984375,
                "lat": 40.310948849735
            },
            {
                "lng": -6.016731262207031,
                "lat": 40.34052565161041
            },
            {
                "lng": -6.10565185546875,
                "lat": 40.356486503120124
            },
            {
                "lng": -6.084709167480469,
                "lat": 40.36328834091583
            },
            {
                "lng": -6.064453125,
                "lat": 40.394149594857105
            },
            {
                "lng": -6.0809326171875,
                "lat": 40.40382351732384
            },
            {
                "lng": -6.130714416503906,
                "lat": 40.42029213268894
            },
            {
                "lng": -6.116981506347656,
                "lat": 40.44433429864565
            },
            {
                "lng": -6.148567199707031,
                "lat": 40.43675671753991
            },
            {
                "lng": -6.161613464355469,
                "lat": 40.45791954650313
            },
            {
                "lng": -6.198692321777344,
                "lat": 40.48273165695666
            },
            {
                "lng": -6.237831115722656,
                "lat": 40.488476312020666
            },
            {
                "lng": -6.257057189941406,
                "lat": 40.470979694762356
            },
            {
                "lng": -6.266326904296875,
                "lat": 40.47385258658934
            },
            {
                "lng": -6.2793731689453125,
                "lat": 40.45765831763663
            },
            {
                "lng": -6.34185791015625,
                "lat": 40.44537941521531
            },
            {
                "lng": -6.372413635253906,
                "lat": 40.40251631173469
            },
            {
                "lng": -6.423912048339843,
                "lat": 40.39990182440178
            },
            {
                "lng": -6.4400482177734375,
                "lat": 40.372182016401034
            },
            {
                "lng": -6.4620208740234375,
                "lat": 40.37453602817463
            },
            {
                "lng": -6.5306854248046875,
                "lat": 40.35073056591789
            },
            {
                "lng": -6.5636444091796875,
                "lat": 40.324561023141236
            },
            {
                "lng": -6.559867858886718,
                "lat": 40.29209669470101
            },
            {
                "lng": -6.5883636474609375,
                "lat": 40.27219149074575
            },
            {
                "lng": -6.603126525878906,
                "lat": 40.269309988863206
            },
            {
                "lng": -6.6419219970703125,
                "lat": 40.26852410340628
            },
            {
                "lng": -6.6927337646484375,
                "lat": 40.24415712519858
            },
            {
                "lng": -6.7256927490234375,
                "lat": 40.269571948652924
            },
            {
                "lng": -6.757965087890625,
                "lat": 40.24048821807077
            },
            {
                "lng": -6.787147521972656,
                "lat": 40.25097028233546
            },
            {
                "lng": -6.803627014160156,
                "lat": 40.24258476077662
            },
            {
                "lng": -6.840019226074218,
                "lat": 40.2520183994864
            },
            {
                "lng": -6.865081787109375,
                "lat": 40.26590441926665
            },
            {
                "lng": -6.954689025878906,
                "lat": 40.25568668168462
            },
            {
                "lng": -7.0017242431640625,
                "lat": 40.232625604693226
            },
            {
                "lng": -7.023353576660156,
                "lat": 40.19461010387381
            },
            {
                "lng": -7.0113372802734375,
                "lat": 40.1277035375213
            },
            {
                "lng": -6.944389343261719,
                "lat": 40.10958807474143
            },
            {
                "lng": -6.893577575683594,
                "lat": 40.0499567754414
            },
            {
                "lng": -6.866798400878906,
                "lat": 40.01131305630903
            },
            {
                "lng": -6.8973541259765625,
                "lat": 39.932380403490875
            },
            {
                "lng": -6.9069671630859375,
                "lat": 39.91737289576941
            },
            {
                "lng": -6.9049072265625,
                "lat": 39.86627006289875
            },
            {
                "lng": -6.930999755859375,
                "lat": 39.85335662007476
            },
            {
                "lng": -6.950569152832031,
                "lat": 39.827258780634594
            },
            {
                "lng": -6.9866180419921875,
                "lat": 39.81539284771493
            },
            {
                "lng": -6.998634338378906,
                "lat": 39.7132612612704
            },
            {
                "lng": -7.016487121582031,
                "lat": 39.67046353361311
            },
            {
                "lng": -7.072792053222656,
                "lat": 39.65830625612106
            },
            {
                "lng": -7.197761535644531,
                "lat": 39.661213625756005
            },
            {
                "lng": -7.300071716308594,
                "lat": 39.65328414777011
            },
            {
                "lng": -7.439460754394531,
                "lat": 39.65724900047557
            },
            {
                "lng": -7.539367675781249,
                "lat": 39.663856582926165
            },
            {
                "lng": -7.499542236328124,
                "lat": 39.59034472477024
            },
            {
                "lng": -7.4219512939453125,
                "lat": 39.534232843612585
            },
            {
                "lng": -7.3944854736328125,
                "lat": 39.53158493558717
            },
            {
                "lng": -7.384185791015625,
                "lat": 39.49132430037711
            },
            {
                "lng": -7.308654785156251,
                "lat": 39.46853492354142
            },
            {
                "lng": -7.299728393554687,
                "lat": 39.454751678179974
            },
            {
                "lng": -7.3223876953125,
                "lat": 39.385794515093885
            },
            {
                "lng": -7.306594848632812,
                "lat": 39.33164191202314
            },
            {
                "lng": -7.234497070312499,
                "lat": 39.27744733736264
            },
            {
                "lng": -7.242050170898437,
                "lat": 39.214167307512376
            },
            {
                "lng": -7.183685302734374,
                "lat": 39.1833042481843
            },
            {
                "lng": -7.128067016601562,
                "lat": 39.16839998800286
            },
            {
                "lng": -7.147979736328124,
                "lat": 39.115144700901475
            },
            {
                "lng": -7.1102142333984375,
                "lat": 39.10075886681079
            },
            {
                "lng": -7.035369873046875,
                "lat": 39.120472042446934
            },
            {
                "lng": -6.963958740234375,
                "lat": 39.058650119748236
            },
            {
                "lng": -6.95709228515625,
                "lat": 39.02451827974919
            },
            {
                "lng": -7.0113372802734375,
                "lat": 38.94552525820741
            },
            {
                "lng": -7.0539093017578125,
                "lat": 38.90385833966776
            },
            {
                "lng": -7.0346832275390625,
                "lat": 38.87499767781738
            },
            {
                "lng": -7.0916748046875,
                "lat": 38.82794036748879
            },
            {
                "lng": -7.1356201171875,
                "lat": 38.80654039080489
            },
            {
                "lng": -7.2454833984375,
                "lat": 38.7267689011302
            },
            {
                "lng": -7.268829345703125,
                "lat": 38.6839017791681
            },
            {
                "lng": -7.2640228271484375,
                "lat": 38.59487053553886
            },
            {
                "lng": -7.2942352294921875,
                "lat": 38.558367981352994
            },
            {
                "lng": -7.316207885742187,
                "lat": 38.49444388772503
            },
            {
                "lng": -7.3189544677734375,
                "lat": 38.44552245145252
            },
            {
                "lng": -7.257843017578124,
                "lat": 38.37611542403604
            },
            {
                "lng": -7.1472930908203125,
                "lat": 38.260288960391925
            },
            {
                "lng": -7.090301513671875,
                "lat": 38.174512274922485
            },
            {
                "lng": -6.988677978515624,
                "lat": 38.211209018340156
            },
            {
                "lng": -6.9330596923828125,
                "lat": 38.20797181420939
            },
            {
                "lng": -6.856155395507812,
                "lat": 38.179910014461136
            },
            {
                "lng": -6.795730590820312,
                "lat": 38.1777509666256
            },
            {
                "lng": -6.8149566650390625,
                "lat": 38.118892293285704
            },
            {
                "lng": -6.73736572265625,
                "lat": 38.0907961960593
            },
            {
                "lng": -6.6268157958984375,
                "lat": 38.098901948321256
            },
            {
                "lng": -6.5814971923828125,
                "lat": 38.053498158026564
            },
            {
                "lng": -6.584243774414062,
                "lat": 38.02050869343087
            },
            {
                "lng": -6.475067138671874,
                "lat": 38.0088777177206
            },
            {
                "lng": -6.448974609375,
                "lat": 38.05944549633448
            },
            {
                "lng": -6.368293762207031,
                "lat": 38.04944287754316
            },
            {
                "lng": -6.345977783203124,
                "lat": 37.99940928200236
            },
            {
                "lng": -6.181182861328125,
                "lat": 37.94419750075404
            },
            {
                "lng": -6.1090850830078125,
                "lat": 37.98479844003271
            },
            {
                "lng": -6.0143280029296875,
                "lat": 37.996162679728116
            },
            {
                "lng": -5.9490966796875,
                "lat": 37.99724489645483
            },
            {
                "lng": -5.909614562988281,
                "lat": 38.06809530746208
            },
            {
                "lng": -5.928497314453125,
                "lat": 38.10376496815196
            },
            {
                "lng": -5.881462097167969,
                "lat": 38.161016176890456
            },
            {
                "lng": -5.7328033447265625,
                "lat": 38.197719717965825
            },
            {
                "lng": -5.692291259765625,
                "lat": 38.18503749667021
            },
            {
                "lng": -5.682334899902344,
                "lat": 38.15831665744203
            },
            {
                "lng": -5.700531005859375,
                "lat": 38.17289287509456
            },
            {
                "lng": -5.695037841796875,
                "lat": 38.153997218446115
            },
            {
                "lng": -5.738639831542969,
                "lat": 38.134556577054134
            },
            {
                "lng": -5.736236572265625,
                "lat": 38.08863451029597
            },
            {
                "lng": -5.697441101074219,
                "lat": 38.08404071579998
            },
            {
                "lng": -5.631866455078125,
                "lat": 38.138337107478435
            },
            {
                "lng": -5.5968475341796875,
                "lat": 38.1334763895322
            },
            {
                "lng": -5.537109374999999,
                "lat": 38.16479533621134
            },
            {
                "lng": -5.5226898193359375,
                "lat": 38.2225380989223
            },
            {
                "lng": -5.5268096923828125,
                "lat": 38.26999315613176
            },
            {
                "lng": -5.57281494140625,
                "lat": 38.329807044201374
            },
            {
                "lng": -5.563888549804687,
                "lat": 38.37773029803778
            },
            {
                "lng": -5.5803680419921875,
                "lat": 38.41970436883827
            },
            {
                "lng": -5.489044189453125,
                "lat": 38.46541758885631
            },
            {
                "lng": -5.384674072265625,
                "lat": 38.556757147352215
            },
            {
                "lng": -5.372314453125,
                "lat": 38.58413641573156
            },
            {
                "lng": -5.307426452636719,
                "lat": 38.5776951735911
            },
            {
                "lng": -5.29266357421875,
                "lat": 38.60989560714296
            },
            {
                "lng": -5.181427001953125,
                "lat": 38.66889221556877
            },
            {
                "lng": -5.1821136474609375,
                "lat": 38.718197532760165
            },
            {
                "lng": -5.0983428955078125,
                "lat": 38.70962513631028
            },
            {
                "lng": -5.0434112548828125,
                "lat": 38.73158984401968
            },
            {
                "lng": -4.9939727783203125,
                "lat": 38.73855285385149
            },
            {
                "lng": -4.9610137939453125,
                "lat": 38.797443453603684
            },
            {
                "lng": -4.93011474609375,
                "lat": 38.87553224107675
            },
            {
                "lng": -4.856472015380859,
                "lat": 38.88341658210394
            },
            {
                "lng": -4.829349517822266,
                "lat": 38.940585268033
            },
            {
                "lng": -4.939384460449219,
                "lat": 38.973289606929875
            },
            {
                "lng": -4.964447021484375,
                "lat": 39.0591832989046
            },
            {
                "lng": -4.865055084228516,
                "lat": 39.03091925576062
            },
            {
                "lng": -4.823169708251953,
                "lat": 39.06584769863456
            },
            {
                "lng": -4.8744964599609375,
                "lat": 39.104488809440475
            },
            {
                "lng": -4.8394775390625,
                "lat": 39.174654839040365
            },
            {
                "lng": -4.808063507080078,
                "lat": 39.19966867945389
            },
            {
                "lng": -4.643096923828125,
                "lat": 39.16839998800286
            },
            {
                "lng": -4.7067832946777335,
                "lat": 39.208980068859994
            },
            {
                "lng": -4.7625732421875,
                "lat": 39.32048763602077
            },
            {
                "lng": -4.701290130615234,
                "lat": 39.32991577138014
            },
            {
                "lng": -4.6698760986328125,
                "lat": 39.421607710787185
            },
            {
                "lng": -4.6849822998046875,
                "lat": 39.454751678179974
            },
            {
                "lng": -4.772701263427734,
                "lat": 39.39906080585583
            },
            {
                "lng": -4.866943359375,
                "lat": 39.3725257020188
            },
            {
                "lng": -4.936981201171875,
                "lat": 39.393223948684415
            },
            {
                "lng": -5.0042724609375,
                "lat": 39.42770738465604
            },
            {
                "lng": -5.060920715332031,
                "lat": 39.48880723607782
            },
            {
                "lng": -5.107269287109375,
                "lat": 39.50827899034114
            },
            {
                "lng": -5.167694091796875,
                "lat": 39.56705851189888
            },
            {
                "lng": -5.2068328857421875,
                "lat": 39.59828141820854
            },
            {
                "lng": -5.1573944091796875,
                "lat": 39.666499439014096
            },
            {
                "lng": -5.158596038818359,
                "lat": 39.7240885773337
            },
            {
                "lng": -5.159454345703124,
                "lat": 39.78162965844789
            },
            {
                "lng": -5.207347869873047,
                "lat": 39.80128290591647
            },
            {
                "lng": -5.265541076660156,
                "lat": 39.7499616158896
            },
            {
                "lng": -5.3194427490234375,
                "lat": 39.765797457856515
            },
            {
                "lng": -5.313606262207031,
                "lat": 39.834772811663235
            },
            {
                "lng": -5.279788970947265,
                "lat": 39.863371338285305
            },
            {
                "lng": -5.326480865478516,
                "lat": 39.89340672350553
            },
            {
                "lng": -5.406475067138672,
                "lat": 39.880893578347056
            },
            {
                "lng": -5.371112823486328,
                "lat": 39.97856707037828
            },
            {
                "lng": -5.3702545166015625,
                "lat": 40.06651166669528
            },
            {
                "lng": -5.368709564208984,
                "lat": 40.106043180566935
            },
            {
                "lng": -5.335235595703125,
                "lat": 40.11693985890127
            }
        ]
    ],
    [
        [
            {
                "lng": -8.887939453125,
                "lat": 41.87774145109676
            },
            {
                "lng": -8.876953125,
                "lat": 42.1552594657786
            },
            {
                "lng": -8.712158203125,
                "lat": 42.220381783720605
            },
            {
                "lng": -8.887939453125,
                "lat": 42.26917949243506
            },
            {
                "lng": -8.72314453125,
                "lat": 42.36666166373274
            },
            {
                "lng": -8.909912109375,
                "lat": 42.374778361114195
            },
            {
                "lng": -8.756103515625,
                "lat": 42.66628070564928
            },
            {
                "lng": -9.052734375,
                "lat": 42.52069952914966
            },
            {
                "lng": -8.931884765625,
                "lat": 42.80346172417078
            },
            {
                "lng": -9.129638671875,
                "lat": 42.74701217318067
            },
            {
                "lng": -9.184570312499998,
                "lat": 42.93229601903058
            },
            {
                "lng": -9.305419921874998,
                "lat": 42.89206418807337
            },
            {
                "lng": -9.217529296875,
                "lat": 43.14909399920127
            },
            {
                "lng": -8.98681640625,
                "lat": 43.28520334369384
            },
            {
                "lng": -8.8330078125,
                "lat": 43.30919109985686
            },
            {
                "lng": -8.470458984375,
                "lat": 43.39706523932025
            },
            {
                "lng": -8.272705078125,
                "lat": 43.42100882994726
            },
            {
                "lng": -8.360595703125,
                "lat": 43.476840397778915
            },
            {
                "lng": -8.206787109375,
                "lat": 43.61221676817573
            },
            {
                "lng": -7.965087890625,
                "lat": 43.75522505306928
            },
            {
                "lng": -7.71240234375,
                "lat": 43.77109381775651
            },
            {
                "lng": -7.415771484374999,
                "lat": 43.691707903073805
            },
            {
                "lng": -7.22900390625,
                "lat": 43.58039085560786
            },
            {
                "lng": -7.05322265625,
                "lat": 43.55601276435827
            },
            {
                "lng": -7.174072265624999,
                "lat": 43.39706523932025
            },
            {
                "lng": -6.954345703125,
                "lat": 43.14934447891636
            },
            {
                "lng": -6.822509765624999,
                "lat": 43.197167282501276
            },
            {
                "lng": -6.943702697753906,
                "lat": 43.06913858232444
            },
            {
                "lng": -6.844482421875,
                "lat": 42.96446257387128
            },
            {
                "lng": -7.00927734375,
                "lat": 42.72280375732727
            },
            {
                "lng": -7.042236328124999,
                "lat": 42.52069952914966
            },
            {
                "lng": -6.856155395507812,
                "lat": 42.512854788289424
            },
            {
                "lng": -6.822509765624999,
                "lat": 42.36666166373274
            },
            {
                "lng": -6.734619140625,
                "lat": 42.3016903282445
            },
            {
                "lng": -6.879501342773437,
                "lat": 42.23614350327826
            },
            {
                "lng": -7.00927734375,
                "lat": 42.09898663957465
            },
            {
                "lng": -6.954002380371094,
                "lat": 41.96765920367816
            },
            {
                "lng": -7.174072265624999,
                "lat": 41.9921602333763
            },
            {
                "lng": -7.3828125,
                "lat": 41.83682786072714
            },
            {
                "lng": -7.679443359375,
                "lat": 41.902277040963696
            },
            {
                "lng": -7.888183593749999,
                "lat": 41.85319643776675
            },
            {
                "lng": -8.15185546875,
                "lat": 41.812267143599804
            },
            {
                "lng": -8.228759765625,
                "lat": 41.91045347666418
            },
            {
                "lng": -8.0859375,
                "lat": 42.04113400940809
            },
            {
                "lng": -8.173828125,
                "lat": 42.07376224008719
            },
            {
                "lng": -8.206787109375,
                "lat": 42.16340342422401
            },
            {
                "lng": -8.624267578125,
                "lat": 42.04929263868686
            },
            {
                "lng": -8.887939453125,
                "lat": 41.87774145109676
            }
        ]
    ],
    [
        [
            {
                "lng": -3.5324478149414062,
                "lat": 41.16676624570446
            },
            {
                "lng": -3.5796546936035156,
                "lat": 41.16056309723075
            },
            {
                "lng": -3.6165618896484375,
                "lat": 41.15022321163024
            },
            {
                "lng": -3.675613403320312,
                "lat": 41.091254723206134
            },
            {
                "lng": -3.7161254882812496,
                "lat": 41.07417501008181
            },
            {
                "lng": -3.7425613403320312,
                "lat": 41.04440429915501
            },
            {
                "lng": -3.77105712890625,
                "lat": 41.0130657870063
            },
            {
                "lng": -3.8177490234375,
                "lat": 40.985081625514354
            },
            {
                "lng": -3.86993408203125,
                "lat": 40.97289962292462
            },
            {
                "lng": -3.8836669921874996,
                "lat": 40.974195687588434
            },
            {
                "lng": -3.9368820190429683,
                "lat": 40.924927332167684
            },
            {
                "lng": -3.9509582519531246,
                "lat": 40.897943823050184
            },
            {
                "lng": -3.941688537597656,
                "lat": 40.8870435151357
            },
            {
                "lng": -3.946151733398437,
                "lat": 40.86419895172047
            },
            {
                "lng": -3.9646911621093746,
                "lat": 40.84056730598288
            },
            {
                "lng": -3.961944580078125,
                "lat": 40.824201998489876
            },
            {
                "lng": -3.985977172851562,
                "lat": 40.78704035888754
            },
            {
                "lng": -4.01824951171875,
                "lat": 40.78262115769851
            },
            {
                "lng": -4.0484619140625,
                "lat": 40.791459266015764
            },
            {
                "lng": -4.076271057128905,
                "lat": 40.7909394098518
            },
            {
                "lng": -4.09515380859375,
                "lat": 40.751418432997454
            },
            {
                "lng": -4.113006591796875,
                "lat": 40.74361546275168
            },
            {
                "lng": -4.167594909667969,
                "lat": 40.68662604564053
            },
            {
                "lng": -4.1713714599609375,
                "lat": 40.635319920747456
            },
            {
                "lng": -4.1603851318359375,
                "lat": 40.622812957398224
            },
            {
                "lng": -4.214630126953124,
                "lat": 40.60613336268842
            },
            {
                "lng": -4.2626953125,
                "lat": 40.60613336268842
            },
            {
                "lng": -4.291534423828125,
                "lat": 40.632714496550626
            },
            {
                "lng": -4.290161132812499,
                "lat": 40.606654663050485
            },
            {
                "lng": -4.2791748046875,
                "lat": 40.594663726004995
            },
            {
                "lng": -4.290161132812499,
                "lat": 40.564937785967224
            },
            {
                "lng": -4.3251800537109375,
                "lat": 40.549287249082035
            },
            {
                "lng": -4.3196868896484375,
                "lat": 40.470979694762356
            },
            {
                "lng": -4.33135986328125,
                "lat": 40.44590196740627
            },
            {
                "lng": -4.3430328369140625,
                "lat": 40.43335959357837
            },
            {
                "lng": -4.324493408203125,
                "lat": 40.42656483076295
            },
            {
                "lng": -4.3210601806640625,
                "lat": 40.41192762537371
            },
            {
                "lng": -4.40826416015625,
                "lat": 40.41140480914068
            },
            {
                "lng": -4.43572998046875,
                "lat": 40.3972872355307
            },
            {
                "lng": -4.442939758300781,
                "lat": 40.3836897366636
            },
            {
                "lng": -4.439849853515625,
                "lat": 40.35387022893512
            },
            {
                "lng": -4.4570159912109375,
                "lat": 40.34288076886874
            },
            {
                "lng": -4.4583892822265625,
                "lat": 40.32037295438762
            },
            {
                "lng": -4.5037078857421875,
                "lat": 40.31566106647411
            },
            {
                "lng": -4.528083801269531,
                "lat": 40.343927461258914
            },
            {
                "lng": -4.547996520996094,
                "lat": 40.34235741658332
            },
            {
                "lng": -4.530487060546875,
                "lat": 40.29235856621275
            },
            {
                "lng": -4.56756591796875,
                "lat": 40.25490063795337
            },
            {
                "lng": -4.557952880859375,
                "lat": 40.23498448456962
            },
            {
                "lng": -4.5819854736328125,
                "lat": 40.216897639088714
            },
            {
                "lng": -4.574775695800781,
                "lat": 40.204312637495846
            },
            {
                "lng": -4.4350433349609375,
                "lat": 40.23970199781759
            },
            {
                "lng": -4.380798339843749,
                "lat": 40.317755279476394
            },
            {
                "lng": -4.356250762939453,
                "lat": 40.310948849735
            },
            {
                "lng": -4.346122741699219,
                "lat": 40.23996407224976
            },
            {
                "lng": -4.295310974121094,
                "lat": 40.221223193654986
            },
            {
                "lng": -4.2441558837890625,
                "lat": 40.27533480732468
            },
            {
                "lng": -4.206562042236328,
                "lat": 40.27035782193439
            },
            {
                "lng": -4.1933441162109375,
                "lat": 40.298381330906686
            },
            {
                "lng": -4.146995544433594,
                "lat": 40.247039698452085
            },
            {
                "lng": -4.10064697265625,
                "lat": 40.244419182384945
            },
            {
                "lng": -4.0704345703125,
                "lat": 40.26695230509781
            },
            {
                "lng": -3.985977172851562,
                "lat": 40.21086761742911
            },
            {
                "lng": -3.852252960205078,
                "lat": 40.178742159095755
            },
            {
                "lng": -3.833541870117187,
                "lat": 40.16050911251291
            },
            {
                "lng": -3.8077926635742183,
                "lat": 40.17913562408881
            },
            {
                "lng": -3.7456512451171875,
                "lat": 40.13269100586688
            },
            {
                "lng": -3.7283134460449214,
                "lat": 40.148307289076385
            },
            {
                "lng": -3.6072921752929688,
                "lat": 40.111688665595956
            },
            {
                "lng": -3.6199951171875,
                "lat": 40.07229179232391
            },
            {
                "lng": -3.645401000976562,
                "lat": 40.0360265298117
            },
            {
                "lng": -3.7174987792968746,
                "lat": 40.01236487583938
            },
            {
                "lng": -3.813457489013672,
                "lat": 39.94712141785606
            },
            {
                "lng": -3.86993408203125,
                "lat": 39.93290692296977
            },
            {
                "lng": -3.8747406005859375,
                "lat": 39.90657598772841
            },
            {
                "lng": -3.8132858276367188,
                "lat": 39.886557705928475
            },
            {
                "lng": -3.749771118164062,
                "lat": 39.93132735238237
            },
            {
                "lng": -3.6383628845214844,
                "lat": 39.96738512724443
            },
            {
                "lng": -3.628063201904297,
                "lat": 39.99171995536162
            },
            {
                "lng": -3.521633148193359,
                "lat": 40.02340800226773
            },
            {
                "lng": -3.511505126953125,
                "lat": 40.050876597135485
            },
            {
                "lng": -3.3968353271484375,
                "lat": 40.03918079694873
            },
            {
                "lng": -3.3515167236328125,
                "lat": 40.080698372171426
            },
            {
                "lng": -3.2794189453125,
                "lat": 40.048117094814614
            },
            {
                "lng": -3.1674957275390625,
                "lat": 40.094882122321174
            },
            {
                "lng": -3.1242370605468746,
                "lat": 40.0602055157046
            },
            {
                "lng": -3.047161102294922,
                "lat": 40.103023310188654
            },
            {
                "lng": -3.0988311767578125,
                "lat": 40.15145635662081
            },
            {
                "lng": -3.0662155151367188,
                "lat": 40.161033872946575
            },
            {
                "lng": -3.0876731872558594,
                "lat": 40.223713539195764
            },
            {
                "lng": -3.1084442138671875,
                "lat": 40.28528767922094
            },
            {
                "lng": -3.1812286376953125,
                "lat": 40.236557025505114
            },
            {
                "lng": -3.199596405029297,
                "lat": 40.26105773613518
            },
            {
                "lng": -3.1534194946289062,
                "lat": 40.340787335365945
            },
            {
                "lng": -3.137969970703125,
                "lat": 40.40199342239122
            },
            {
                "lng": -3.157196044921875,
                "lat": 40.43806325797747
            },
            {
                "lng": -3.201484680175781,
                "lat": 40.44864529975696
            },
            {
                "lng": -3.19427490234375,
                "lat": 40.51954115033359
            },
            {
                "lng": -3.2560729980468746,
                "lat": 40.54459137461185
            },
            {
                "lng": -3.294525146484375,
                "lat": 40.53363305378459
            },
            {
                "lng": -3.284912109375,
                "lat": 40.57641252104445
            },
            {
                "lng": -3.3309173583984375,
                "lat": 40.5983133693247
            },
            {
                "lng": -3.321990966796875,
                "lat": 40.65251317049883
            },
            {
                "lng": -3.368682861328125,
                "lat": 40.65199222800328
            },
            {
                "lng": -3.4121131896972656,
                "lat": 40.69834018178775
            },
            {
                "lng": -3.461894989013672,
                "lat": 40.69014050272525
            },
            {
                "lng": -3.43597412109375,
                "lat": 40.73529128534676
            },
            {
                "lng": -3.4661865234375,
                "lat": 40.78678041401646
            },
            {
                "lng": -3.51837158203125,
                "lat": 40.78989968531352
            },
            {
                "lng": -3.4661865234375,
                "lat": 40.86835309505017
            },
            {
                "lng": -3.4421539306640625,
                "lat": 40.87769896474621
            },
            {
                "lng": -3.4627532958984375,
                "lat": 40.90936126702326
            },
            {
                "lng": -3.4160614013671875,
                "lat": 40.98041644354279
            },
            {
                "lng": -3.3899688720703125,
                "lat": 41.0141020092601
            },
            {
                "lng": -3.438720703125,
                "lat": 41.047770359385254
            },
            {
                "lng": -3.427734375,
                "lat": 41.08711459429919
            },
            {
                "lng": -3.494853973388672,
                "lat": 41.101086483800515
            },
            {
                "lng": -3.513565063476562,
                "lat": 41.13341741906527
            },
            {
                "lng": -3.5324478149414062,
                "lat": 41.16676624570446
            }
        ]
    ],
    [
        [
            {
                "lng": -0.7604598999023438,
                "lat": 37.845308138452836
            },
            {
                "lng": -0.7762527465820311,
                "lat": 37.8436814502461
            },
            {
                "lng": -0.8411407470703125,
                "lat": 37.86726491715302
            },
            {
                "lng": -1.0282516479492188,
                "lat": 38.08809407886681
            },
            {
                "lng": -1.036834716796875,
                "lat": 38.138337107478435
            },
            {
                "lng": -0.9688568115234374,
                "lat": 38.26406296833964
            },
            {
                "lng": -0.998382568359375,
                "lat": 38.329807044201374
            },
            {
                "lng": -1.083526611328125,
                "lat": 38.349195551131
            },
            {
                "lng": -1.0974311828613281,
                "lat": 38.43960662292252
            },
            {
                "lng": -1.01348876953125,
                "lat": 38.49981784551419
            },
            {
                "lng": -1.0268783569335938,
                "lat": 38.52372709602293
            },
            {
                "lng": -1.0026741027832031,
                "lat": 38.57353489770183
            },
            {
                "lng": -1.0152053833007812,
                "lat": 38.63752279228781
            },
            {
                "lng": -1.0306549072265625,
                "lat": 38.65682867841179
            },
            {
                "lng": -1.1127090454101562,
                "lat": 38.73533924135184
            },
            {
                "lng": -1.1810302734375,
                "lat": 38.75595740859807
            },
            {
                "lng": -1.3427352905273435,
                "lat": 38.676933444637925
            },
            {
                "lng": -1.3629913330078125,
                "lat": 38.70587438959806
            },
            {
                "lng": -1.4210128784179688,
                "lat": 38.68416977848471
            },
            {
                "lng": -1.494140625,
                "lat": 38.54615158914401
            },
            {
                "lng": -1.4776611328125,
                "lat": 38.38028710815639
            },
            {
                "lng": -1.5858078002929688,
                "lat": 38.314723507247336
            },
            {
                "lng": -1.6664886474609375,
                "lat": 38.31095213263407
            },
            {
                "lng": -1.679534912109375,
                "lat": 38.35727256417359
            },
            {
                "lng": -1.7351531982421875,
                "lat": 38.378537721521774
            },
            {
                "lng": -1.9871520996093748,
                "lat": 38.281852079168004
            },
            {
                "lng": -2.0637130737304683,
                "lat": 38.30448646269451
            },
            {
                "lng": -2.2037887573242188,
                "lat": 38.21417632897687
            },
            {
                "lng": -2.237434387207031,
                "lat": 38.155077102180655
            },
            {
                "lng": -2.3184585571289062,
                "lat": 38.079446632654914
            },
            {
                "lng": -2.3445510864257812,
                "lat": 38.02456557631515
            },
            {
                "lng": -2.1708297729492188,
                "lat": 37.88975705365012
            },
            {
                "lng": -2.120361328125,
                "lat": 37.900865092570065
            },
            {
                "lng": -1.9723892211914062,
                "lat": 37.868891085030576
            },
            {
                "lng": -2.0094680786132812,
                "lat": 37.77722770873696
            },
            {
                "lng": -2.012557983398437,
                "lat": 37.67240786750202
            },
            {
                "lng": -1.924324035644531,
                "lat": 37.55219891098551
            },
            {
                "lng": -1.807594299316406,
                "lat": 37.432613623580046
            },
            {
                "lng": -1.8110275268554685,
                "lat": 37.4522398247284
            },
            {
                "lng": -1.7368698120117188,
                "lat": 37.441882193395124
            },
            {
                "lng": -1.668548583984375,
                "lat": 37.40152827836663
            },
            {
                "lng": -1.6259765625,
                "lat": 37.374522644077246
            },
            {
                "lng": -1.60675048828125,
                "lat": 37.39307301476918
            },
            {
                "lng": -1.57379150390625,
                "lat": 37.40452830389465
            },
            {
                "lng": -1.5428924560546875,
                "lat": 37.41407304054799
            },
            {
                "lng": -1.5130233764648438,
                "lat": 37.4356124041315
            },
            {
                "lng": -1.4924240112304688,
                "lat": 37.42088996502089
            },
            {
                "lng": -1.4752578735351562,
                "lat": 37.42988735518399
            },
            {
                "lng": -1.473541259765625,
                "lat": 37.46477609130588
            },
            {
                "lng": -1.4402389526367188,
                "lat": 37.49910379717654
            },
            {
                "lng": -1.4000701904296875,
                "lat": 37.508091780419335
            },
            {
                "lng": -1.3640213012695312,
                "lat": 37.54512174599488
            },
            {
                "lng": -1.322479248046875,
                "lat": 37.56254125104276
            },
            {
                "lng": -1.259651184082031,
                "lat": 37.55791459214786
            },
            {
                "lng": -1.2438583374023438,
                "lat": 37.579412513438385
            },
            {
                "lng": -1.1676406860351562,
                "lat": 37.555465068186955
            },
            {
                "lng": -1.142578125,
                "lat": 37.536682709556395
            },
            {
                "lng": -1.0955429077148438,
                "lat": 37.53205444534624
            },
            {
                "lng": -1.1223220825195312,
                "lat": 37.5562815851207
            },
            {
                "lng": -1.0667037963867188,
                "lat": 37.583493696284435
            },
            {
                "lng": -1.0045623779296875,
                "lat": 37.575331106875026
            },
            {
                "lng": -0.9547805786132812,
                "lat": 37.55900324361726
            },
            {
                "lng": -0.9118652343749999,
                "lat": 37.55791459214786
            },
            {
                "lng": -0.8593368530273438,
                "lat": 37.58213332686043
            },
            {
                "lng": -0.8153915405273438,
                "lat": 37.58703054044867
            },
            {
                "lng": -0.7123947143554688,
                "lat": 37.614503373949844
            },
            {
                "lng": -0.6952285766601562,
                "lat": 37.62510898062146
            },
            {
                "lng": -0.6876754760742188,
                "lat": 37.63652871117102
            },
            {
                "lng": -0.7268142700195312,
                "lat": 37.6816466602918
            },
            {
                "lng": -0.7353973388671875,
                "lat": 37.72212074124947
            },
            {
                "lng": -0.7371139526367188,
                "lat": 37.77641361883315
            },
            {
                "lng": -0.7604598999023438,
                "lat": 37.845308138452836
            }
        ]
    ],
    [
        [
            {
                "lng": -1.73309326171875,
                "lat": 43.29819788627291
            },
            {
                "lng": -1.789398193359375,
                "lat": 43.281204464332745
            },
            {
                "lng": -1.7976379394531248,
                "lat": 43.249203966977845
            },
            {
                "lng": -1.8371200561523435,
                "lat": 43.22894496172244
            },
            {
                "lng": -1.898231506347656,
                "lat": 43.20867922062144
            },
            {
                "lng": -1.9126510620117185,
                "lat": 43.22694370682256
            },
            {
                "lng": -1.9205474853515625,
                "lat": 43.176390246231456
            },
            {
                "lng": -1.9026947021484377,
                "lat": 43.14132861890767
            },
            {
                "lng": -1.9081878662109375,
                "lat": 43.13105676219153
            },
            {
                "lng": -1.9397735595703125,
                "lat": 43.108001438239086
            },
            {
                "lng": -2.0232009887695312,
                "lat": 43.066881271984954
            },
            {
                "lng": -2.0197677612304688,
                "lat": 43.054590012924784
            },
            {
                "lng": -2.0413970947265625,
                "lat": 43.02899622370039
            },
            {
                "lng": -2.0376205444335938,
                "lat": 42.982548873720326
            },
            {
                "lng": -2.0928955078125,
                "lat": 42.974511174899156
            },
            {
                "lng": -2.1268844604492188,
                "lat": 42.94134456158853
            },
            {
                "lng": -2.1804428100585938,
                "lat": 42.93782584192321
            },
            {
                "lng": -2.209625244140625,
                "lat": 42.95114564889282
            },
            {
                "lng": -2.2309112548828125,
                "lat": 42.93581505468782
            },
            {
                "lng": -2.23846435546875,
                "lat": 42.91394350385527
            },
            {
                "lng": -2.2322845458984375,
                "lat": 42.842240940067626
            },
            {
                "lng": -2.2638702392578125,
                "lat": 42.81882523190782
            },
            {
                "lng": -2.2803497314453125,
                "lat": 42.78532283730215
            },
            {
                "lng": -2.2635269165039062,
                "lat": 42.750793884499174
            },
            {
                "lng": -2.318801879882812,
                "lat": 42.7381872828527
            },
            {
                "lng": -2.3242950439453125,
                "lat": 42.72204709206166
            },
            {
                "lng": -2.2961425781249996,
                "lat": 42.6814258531182
            },
            {
                "lng": -2.2889328002929688,
                "lat": 42.65289942207574
            },
            {
                "lng": -2.3503875732421875,
                "lat": 42.63572676526465
            },
            {
                "lng": -2.4111557006835938,
                "lat": 42.66299877056664
            },
            {
                "lng": -2.4448013305664062,
                "lat": 42.651636888182466
            },
            {
                "lng": -2.504196166992187,
                "lat": 42.61526491450722
            },
            {
                "lng": -2.4513244628906246,
                "lat": 42.568000141863045
            },
            {
                "lng": -2.4214553833007812,
                "lat": 42.60768474453004
            },
            {
                "lng": -2.3902130126953125,
                "lat": 42.55485062752407
            },
            {
                "lng": -2.4235153198242188,
                "lat": 42.50956476517422
            },
            {
                "lng": -2.4224853515625,
                "lat": 42.491593121691935
            },
            {
                "lng": -2.3830032348632812,
                "lat": 42.47108395294282
            },
            {
                "lng": -2.3397445678710933,
                "lat": 42.45297459447428
            },
            {
                "lng": -2.333221435546875,
                "lat": 42.469564487829516
            },
            {
                "lng": -2.288589477539062,
                "lat": 42.46652544694582
            },
            {
                "lng": -2.2401809692382812,
                "lat": 42.44068764258161
            },
            {
                "lng": -2.2305679321289062,
                "lat": 42.42573737996351
            },
            {
                "lng": -2.213916778564453,
                "lat": 42.424723673752474
            },
            {
                "lng": -2.21649169921875,
                "lat": 42.415346114253616
            },
            {
                "lng": -2.18353271484375,
                "lat": 42.41813418384332
            },
            {
                "lng": -2.1632766723632812,
                "lat": 42.409262623071186
            },
            {
                "lng": -2.1413040161132812,
                "lat": 42.42193589715428
            },
            {
                "lng": -2.1110916137695312,
                "lat": 42.42092212947584
            },
            {
                "lng": -2.1045684814453125,
                "lat": 42.41407876891736
            },
            {
                "lng": -2.113323211669922,
                "lat": 42.40191095063363
            },
            {
                "lng": -2.1001052856445312,
                "lat": 42.38847290951027
            },
            {
                "lng": -2.088775634765625,
                "lat": 42.384922757848074
            },
            {
                "lng": -2.0906639099121094,
                "lat": 42.37553924771847
            },
            {
                "lng": -2.07916259765625,
                "lat": 42.36716898804751
            },
            {
                "lng": -2.0908355712890625,
                "lat": 42.34763404440288
            },
            {
                "lng": -2.0704078674316406,
                "lat": 42.343954706737975
            },
            {
                "lng": -2.0465469360351562,
                "lat": 42.35930500076174
            },
            {
                "lng": -2.0177078247070312,
                "lat": 42.3704664962266
            },
            {
                "lng": -2.006378173828125,
                "lat": 42.36108082586393
            },
            {
                "lng": -1.9964218139648435,
                "lat": 42.3643786536149
            },
            {
                "lng": -1.9813156127929685,
                "lat": 42.3568948721334
            },
            {
                "lng": -1.9775390625,
                "lat": 42.349537065594575
            },
            {
                "lng": -1.9699859619140625,
                "lat": 42.3537235094212
            },
            {
                "lng": -1.9648361206054688,
                "lat": 42.34382782918463
            },
            {
                "lng": -1.9614028930664065,
                "lat": 42.3346919724542
            },
            {
                "lng": -1.9401168823242185,
                "lat": 42.334438179708876
            },
            {
                "lng": -1.9294738769531248,
                "lat": 42.32225492353145
            },
            {
                "lng": -1.9195175170898438,
                "lat": 42.32758538845382
            },
            {
                "lng": -1.9205474853515625,
                "lat": 42.31489306281697
            },
            {
                "lng": -1.882781982421875,
                "lat": 42.28810385554954
            },
            {
                "lng": -1.8700790405273438,
                "lat": 42.2905166207974
            },
            {
                "lng": -1.8675041198730469,
                "lat": 42.26740107227146
            },
            {
                "lng": -1.8733406066894531,
                "lat": 42.25431543865193
            },
            {
                "lng": -1.8463897705078123,
                "lat": 42.256983603767466
            },
            {
                "lng": -1.813774108886719,
                "lat": 42.231313717122916
            },
            {
                "lng": -1.7485427856445312,
                "lat": 42.213516578995
            },
            {
                "lng": -1.7145538330078125,
                "lat": 42.21148230093536
            },
            {
                "lng": -1.7039108276367188,
                "lat": 42.19533289484462
            },
            {
                "lng": -1.6827964782714844,
                "lat": 42.19380675326742
            },
            {
                "lng": -1.679534912109375,
                "lat": 42.187829010590825
            },
            {
                "lng": -1.701850891113281,
                "lat": 42.17230967862968
            },
            {
                "lng": -1.6790199279785156,
                "lat": 42.153732356884845
            },
            {
                "lng": -1.7114639282226562,
                "lat": 42.1371863154211
            },
            {
                "lng": -1.7224502563476562,
                "lat": 42.13311278044984
            },
            {
                "lng": -1.74957275390625,
                "lat": 42.14991442344301
            },
            {
                "lng": -1.7749786376953125,
                "lat": 42.144950765679866
            },
            {
                "lng": -1.7815017700195312,
                "lat": 42.138077366269854
            },
            {
                "lng": -1.8038177490234375,
                "lat": 42.14685991087788
            },
            {
                "lng": -1.8268203735351562,
                "lat": 42.15245973799263
            },
            {
                "lng": -1.8546295166015623,
                "lat": 42.12038129495961
            },
            {
                "lng": -1.8977165222167969,
                "lat": 42.08051520880828
            },
            {
                "lng": -1.9057846069335935,
                "lat": 42.0615286181226
            },
            {
                "lng": -1.8997764587402346,
                "lat": 42.03106175660414
            },
            {
                "lng": -1.8513679504394531,
                "lat": 42.001983518663955
            },
            {
                "lng": -1.7900848388671875,
                "lat": 41.9920326482688
            },
            {
                "lng": -1.7155838012695312,
                "lat": 41.95642641461421
            },
            {
                "lng": -1.6805648803710938,
                "lat": 41.95693703889415
            },
            {
                "lng": -1.6747283935546875,
                "lat": 41.965872301512256
            },
            {
                "lng": -1.6429710388183594,
                "lat": 41.957320004419216
            },
            {
                "lng": -1.611213684082031,
                "lat": 41.94902190280396
            },
            {
                "lng": -1.5796279907226562,
                "lat": 41.920672548686824
            },
            {
                "lng": -1.5181732177734375,
                "lat": 41.91147545749747
            },
            {
                "lng": -1.4989471435546875,
                "lat": 41.926036906477584
            },
            {
                "lng": -1.4206695556640625,
                "lat": 41.91492452200975
            },
            {
                "lng": -1.4038467407226562,
                "lat": 41.932933275212996
            },
            {
                "lng": -1.3993835449218748,
                "lat": 41.93804121581888
            },
            {
                "lng": -1.3822174072265625,
                "lat": 41.94391484176801
            },
            {
                "lng": -1.380157470703125,
                "lat": 41.95157527990444
            },
            {
                "lng": -1.3863372802734373,
                "lat": 41.95795827518022
            },
            {
                "lng": -1.3736343383789062,
                "lat": 41.96383006623733
            },
            {
                "lng": -1.3489151000976562,
                "lat": 42.00772369765499
            },
            {
                "lng": -1.322479248046875,
                "lat": 42.02991418347818
            },
            {
                "lng": -1.3066864013671875,
                "lat": 42.044066137408514
            },
            {
                "lng": -1.3125228881835935,
                "lat": 42.06892004662664
            },
            {
                "lng": -1.3331222534179688,
                "lat": 42.0729977077829
            },
            {
                "lng": -1.3592147827148438,
                "lat": 42.08370032198974
            },
            {
                "lng": -1.3674545288085938,
                "lat": 42.10815666179861
            },
            {
                "lng": -1.4014434814453123,
                "lat": 42.12827511736867
            },
            {
                "lng": -1.3995552062988281,
                "lat": 42.16073130339381
            },
            {
                "lng": -1.3973236083984375,
                "lat": 42.19291648699529
            },
            {
                "lng": -1.4198112487792969,
                "lat": 42.215423655170284
            },
            {
                "lng": -1.4040184020996094,
                "lat": 42.239574968838696
            },
            {
                "lng": -1.395606994628906,
                "lat": 42.264352235262166
            },
            {
                "lng": -1.3897705078125,
                "lat": 42.27997596635596
            },
            {
                "lng": -1.3997268676757812,
                "lat": 42.293564192170095
            },
            {
                "lng": -1.3520050048828125,
                "lat": 42.338244963350846
            },
            {
                "lng": -1.3382720947265625,
                "lat": 42.346619076210494
            },
            {
                "lng": -1.329345703125,
                "lat": 42.362476081807
            },
            {
                "lng": -1.3410186767578125,
                "lat": 42.37376383130166
            },
            {
                "lng": -1.360931396484375,
                "lat": 42.37807546981966
            },
            {
                "lng": -1.3420486450195312,
                "lat": 42.41965489682774
            },
            {
                "lng": -1.3283157348632812,
                "lat": 42.439674178149424
            },
            {
                "lng": -1.2871170043945312,
                "lat": 42.46019363789803
            },
            {
                "lng": -1.2738990783691406,
                "lat": 42.48323834594139
            },
            {
                "lng": -1.2781906127929688,
                "lat": 42.498681147258516
            },
            {
                "lng": -1.2919235229492188,
                "lat": 42.51234864215918
            },
            {
                "lng": -1.26617431640625,
                "lat": 42.556620915873715
            },
            {
                "lng": -1.2431716918945312,
                "lat": 42.54953946116446
            },
            {
                "lng": -1.229095458984375,
                "lat": 42.5425836789121
            },
            {
                "lng": -1.2031745910644531,
                "lat": 42.55080406557782
            },
            {
                "lng": -1.2040328979492188,
                "lat": 42.57786045892046
            },
            {
                "lng": -1.1748504638671875,
                "lat": 42.59479633838067
            },
            {
                "lng": -1.1569976806640625,
                "lat": 42.59985093305481
            },
            {
                "lng": -1.1813735961914062,
                "lat": 42.611348608541334
            },
            {
                "lng": -1.1561393737792969,
                "lat": 42.614633268911696
            },
            {
                "lng": -1.157684326171875,
                "lat": 42.64734408124088
            },
            {
                "lng": -1.0869598388671875,
                "lat": 42.6486067022724
            },
            {
                "lng": -1.0529708862304688,
                "lat": 42.646333965963
            },
            {
                "lng": -1.0400962829589844,
                "lat": 42.655929398852706
            },
            {
                "lng": -1.0397529602050781,
                "lat": 42.68962793359915
            },
            {
                "lng": -1.0222434997558594,
                "lat": 42.70211825230498
            },
            {
                "lng": -0.9813880920410155,
                "lat": 42.70451509683823
            },
            {
                "lng": -0.9547805786132812,
                "lat": 42.71157894243346
            },
            {
                "lng": -0.924053192138672,
                "lat": 42.743608435725896
            },
            {
                "lng": -0.9007072448730469,
                "lat": 42.74272595476816
            },
            {
                "lng": -0.8989906311035156,
                "lat": 42.76175954256288
            },
            {
                "lng": -0.8694648742675781,
                "lat": 42.761003352579635
            },
            {
                "lng": -0.84869384765625,
                "lat": 42.79136972365016
            },
            {
                "lng": -0.8528137207031249,
                "lat": 42.81869931702904
            },
            {
                "lng": -0.8562469482421875,
                "lat": 42.8460168363892
            },
            {
                "lng": -0.817108154296875,
                "lat": 42.876970480834636
            },
            {
                "lng": -0.8191680908203125,
                "lat": 42.90287907323343
            },
            {
                "lng": -0.7817459106445312,
                "lat": 42.92400035365673
            },
            {
                "lng": -0.7223510742187499,
                "lat": 42.91922355466844
            },
            {
                "lng": -0.7206344604492188,
                "lat": 42.92626291864936
            },
            {
                "lng": -0.73883056640625,
                "lat": 42.947627489405846
            },
            {
                "lng": -0.7549667358398438,
                "lat": 42.96797977096856
            },
            {
                "lng": -0.7947921752929688,
                "lat": 42.96270389991016
            },
            {
                "lng": -0.817108154296875,
                "lat": 42.951648226689535
            },
            {
                "lng": -0.8919525146484375,
                "lat": 42.95617124218183
            },
            {
                "lng": -0.9022521972656251,
                "lat": 42.96396010072675
            },
            {
                "lng": -0.9231948852539061,
                "lat": 42.957930102876446
            },
            {
                "lng": -0.9376144409179688,
                "lat": 42.953909775988336
            },
            {
                "lng": -0.9942626953125,
                "lat": 42.9762695112959
            },
            {
                "lng": -1.0213851928710938,
                "lat": 42.994603451901305
            },
            {
                "lng": -1.0811233520507812,
                "lat": 42.999876586453716
            },
            {
                "lng": -1.0866165161132812,
                "lat": 43.011927766185934
            },
            {
                "lng": -1.1151123046875,
                "lat": 43.02447856436693
            },
            {
                "lng": -1.1394882202148438,
                "lat": 43.00740885084001
            },
            {
                "lng": -1.174507141113281,
                "lat": 43.037779609507346
            },
            {
                "lng": -1.23046875,
                "lat": 43.056596917403716
            },
            {
                "lng": -1.2641143798828125,
                "lat": 43.04405268686207
            },
            {
                "lng": -1.3053131103515625,
                "lat": 43.06913858232444
            },
            {
                "lng": -1.2967300415039062,
                "lat": 43.096470518529905
            },
            {
                "lng": -1.270294189453125,
                "lat": 43.11827716657793
            },
            {
                "lng": -1.3310623168945312,
                "lat": 43.10950531113185
            },
            {
                "lng": -1.3478851318359375,
                "lat": 43.08819699915607
            },
            {
                "lng": -1.3550949096679688,
                "lat": 43.028494277971056
            },
            {
                "lng": -1.4426422119140625,
                "lat": 43.046310837698954
            },
            {
                "lng": -1.4731979370117185,
                "lat": 43.085689651412295
            },
            {
                "lng": -1.4450454711914062,
                "lat": 43.10825208628715
            },
            {
                "lng": -1.4148330688476562,
                "lat": 43.13155786840375
            },
            {
                "lng": -1.4038467407226562,
                "lat": 43.15836106502753
            },
            {
                "lng": -1.4011001586914062,
                "lat": 43.1811470593997
            },
            {
                "lng": -1.3822174072265625,
                "lat": 43.19090988330086
            },
            {
                "lng": -1.3777542114257812,
                "lat": 43.235198459790425
            },
            {
                "lng": -1.3969802856445312,
                "lat": 43.26645632499169
            },
            {
                "lng": -1.4175796508789062,
                "lat": 43.27445575937589
            },
            {
                "lng": -1.47216796875,
                "lat": 43.2764554536928
            },
            {
                "lng": -1.5130233764648438,
                "lat": 43.29444974546262
            },
            {
                "lng": -1.5648651123046875,
                "lat": 43.28895205437037
            },
            {
                "lng": -1.5590286254882812,
                "lat": 43.275955536274076
            },
            {
                "lng": -1.5751647949218748,
                "lat": 43.25070436607026
            },
            {
                "lng": -1.6180801391601562,
                "lat": 43.255705429436404
            },
            {
                "lng": -1.6311264038085938,
                "lat": 43.29045147395395
            },
            {
                "lng": -1.626319885253906,
                "lat": 43.30719248161193
            },
            {
                "lng": -1.6637420654296875,
                "lat": 43.31468696117798
            },
            {
                "lng": -1.7056274414062498,
                "lat": 43.309440922516785
            },
            {
                "lng": -1.73309326171875,
                "lat": 43.29819788627291
            }
        ]
    ],
    [
        [
            {
                "lng": -3.1482696533203125,
                "lat": 43.35164620129662
            },
            {
                "lng": -3.173675537109375,
                "lat": 43.30119623257966
            },
            {
                "lng": -3.262939453125,
                "lat": 43.297198404646366
            },
            {
                "lng": -3.4105682373046875,
                "lat": 43.248203680382346
            },
            {
                "lng": -3.4160614013671875,
                "lat": 43.13293588931728
            },
            {
                "lng": -3.263626098632812,
                "lat": 43.197792987132836
            },
            {
                "lng": -3.22174072265625,
                "lat": 43.17363613238778
            },
            {
                "lng": -3.1537628173828125,
                "lat": 43.17576432217386
            },
            {
                "lng": -3.1743621826171875,
                "lat": 43.127423619367
            },
            {
                "lng": -3.146381378173828,
                "lat": 43.033513550551284
            },
            {
                "lng": -3.1242370605468746,
                "lat": 43.00740885084001
            },
            {
                "lng": -3.0699920654296875,
                "lat": 43.00502373370268
            },
            {
                "lng": -3.0260467529296875,
                "lat": 42.95931202958199
            },
            {
                "lng": -2.9841613769531246,
                "lat": 42.94373214969591
            },
            {
                "lng": -3.0233001708984375,
                "lat": 42.9071542023206
            },
            {
                "lng": -3.1220054626464844,
                "lat": 42.91318917394982
            },
            {
                "lng": -3.1846618652343746,
                "lat": 42.94775314142163
            },
            {
                "lng": -3.2399368286132812,
                "lat": 42.948004444683704
            },
            {
                "lng": -3.2842254638671875,
                "lat": 42.874454503930785
            },
            {
                "lng": -3.210582733154297,
                "lat": 42.82436523272848
            },
            {
                "lng": -3.1249237060546875,
                "lat": 42.891561123996155
            },
            {
                "lng": -3.11187744140625,
                "lat": 42.86552195747757
            },
            {
                "lng": -3.1582260131835938,
                "lat": 42.804847115008286
            },
            {
                "lng": -3.141918182373047,
                "lat": 42.75381908743189
            },
            {
                "lng": -3.0535125732421875,
                "lat": 42.76604444480293
            },
            {
                "lng": -2.96356201171875,
                "lat": 42.70968691975666
            },
            {
                "lng": -2.9079437255859375,
                "lat": 42.70009978513702
            },
            {
                "lng": -2.8900909423828125,
                "lat": 42.65870674788061
            },
            {
                "lng": -2.8440856933593746,
                "lat": 42.6290331963068
            },
            {
                "lng": -2.82073974609375,
                "lat": 42.56104641703961
            },
            {
                "lng": -2.773876190185547,
                "lat": 42.61930729461038
            },
            {
                "lng": -2.734222412109375,
                "lat": 42.62334941229699
            },
            {
                "lng": -2.685470581054687,
                "lat": 42.595807290115395
            },
            {
                "lng": -2.669677734375,
                "lat": 42.57027573801005
            },
            {
                "lng": -2.701263427734375,
                "lat": 42.51867517417283
            },
            {
                "lng": -2.6056480407714844,
                "lat": 42.48032657099671
            },
            {
                "lng": -2.5117492675781246,
                "lat": 42.519181269065584
            },
            {
                "lng": -2.4884033203125,
                "lat": 42.489820989777066
            },
            {
                "lng": -2.422657012939453,
                "lat": 42.491593121691935
            },
            {
                "lng": -2.4231719970703125,
                "lat": 42.50931167929992
            },
            {
                "lng": -2.3902130126953125,
                "lat": 42.55459772508892
            },
            {
                "lng": -2.4217987060546875,
                "lat": 42.60768474453004
            },
            {
                "lng": -2.4513244628906246,
                "lat": 42.56774729272217
            },
            {
                "lng": -2.504196166992187,
                "lat": 42.61526491450722
            },
            {
                "lng": -2.4444580078125,
                "lat": 42.651636888182466
            },
            {
                "lng": -2.4114990234375,
                "lat": 42.66274630684542
            },
            {
                "lng": -2.3503875732421875,
                "lat": 42.63572676526465
            },
            {
                "lng": -2.289276123046875,
                "lat": 42.65315192577889
            },
            {
                "lng": -2.2961425781249996,
                "lat": 42.681678240973085
            },
            {
                "lng": -2.3242950439453125,
                "lat": 42.72204709206166
            },
            {
                "lng": -2.3191452026367188,
                "lat": 42.73793512467152
            },
            {
                "lng": -2.26318359375,
                "lat": 42.751298095242454
            },
            {
                "lng": -2.2803497314453125,
                "lat": 42.78532283730215
            },
            {
                "lng": -2.2638702392578125,
                "lat": 42.81882523190782
            },
            {
                "lng": -2.2322845458984375,
                "lat": 42.842240940067626
            },
            {
                "lng": -2.2357177734374996,
                "lat": 42.87822843081946
            },
            {
                "lng": -2.2381210327148438,
                "lat": 42.91419494510531
            },
            {
                "lng": -2.2309112548828125,
                "lat": 42.93581505468782
            },
            {
                "lng": -2.2092819213867188,
                "lat": 42.95114564889282
            },
            {
                "lng": -2.1800994873046875,
                "lat": 42.9375744971096
            },
            {
                "lng": -2.1265411376953125,
                "lat": 42.94134456158853
            },
            {
                "lng": -2.0928955078125,
                "lat": 42.974511174899156
            },
            {
                "lng": -2.0376205444335938,
                "lat": 42.982548873720326
            },
            {
                "lng": -2.041053771972656,
                "lat": 43.0287452513488
            },
            {
                "lng": -2.0194244384765625,
                "lat": 43.05484087957652
            },
            {
                "lng": -2.022857666015625,
                "lat": 43.06663045459365
            },
            {
                "lng": -1.973419189453125,
                "lat": 43.09145639778734
            },
            {
                "lng": -1.9397735595703125,
                "lat": 43.108001438239086
            },
            {
                "lng": -1.9081878662109375,
                "lat": 43.13080620754577
            },
            {
                "lng": -1.9030380249023438,
                "lat": 43.14132861890767
            },
            {
                "lng": -1.9205474853515625,
                "lat": 43.17613987737831
            },
            {
                "lng": -1.912994384765625,
                "lat": 43.22719386727831
            },
            {
                "lng": -1.8985748291015625,
                "lat": 43.2084289841955
            },
            {
                "lng": -1.8367767333984375,
                "lat": 43.22869480845325
            },
            {
                "lng": -1.7976379394531248,
                "lat": 43.249203966977845
            },
            {
                "lng": -1.789398193359375,
                "lat": 43.28095452564517
            },
            {
                "lng": -1.7310333251953125,
                "lat": 43.29819788627291
            },
            {
                "lng": -1.7365264892578125,
                "lat": 43.32268005409458
            },
            {
                "lng": -1.7516326904296875,
                "lat": 43.33466772190882
            },
            {
                "lng": -1.7887115478515623,
                "lat": 43.37460952707158
            },
            {
                "lng": -1.7928314208984375,
                "lat": 43.39556845063809
            },
            {
                "lng": -1.9267272949218748,
                "lat": 43.337164854911094
            },
            {
                "lng": -2.102508544921875,
                "lat": 43.30669281678247
            },
            {
                "lng": -2.173919677734375,
                "lat": 43.28920196020127
            },
            {
                "lng": -2.231597900390625,
                "lat": 43.31069002041401
            },
            {
                "lng": -2.3572540283203125,
                "lat": 43.3036947415533
            },
            {
                "lng": -2.427978515625,
                "lat": 43.329173667843904
            },
            {
                "lng": -2.4835968017578125,
                "lat": 43.3576374720839
            },
            {
                "lng": -2.5124359130859375,
                "lat": 43.37860226166394
            },
            {
                "lng": -2.544708251953125,
                "lat": 43.37311218382002
            },
            {
                "lng": -2.5659942626953125,
                "lat": 43.393073720674444
            },
            {
                "lng": -2.6264190673828125,
                "lat": 43.39706523932025
            },
            {
                "lng": -2.6538848876953125,
                "lat": 43.414525042084996
            },
            {
                "lng": -2.69439697265625,
                "lat": 43.39906090005084
            },
            {
                "lng": -2.7198028564453125,
                "lat": 43.422504990087994
            },
            {
                "lng": -2.74658203125,
                "lat": 43.438960311329645
            },
            {
                "lng": -2.7486419677734375,
                "lat": 43.4574048966441
            },
            {
                "lng": -2.80426025390625,
                "lat": 43.43397432280117
            },
            {
                "lng": -2.87567138671875,
                "lat": 43.43347570135253
            },
            {
                "lng": -2.9450225830078125,
                "lat": 43.435968767512506
            },
            {
                "lng": -2.95257568359375,
                "lat": 43.4249985081581
            },
            {
                "lng": -2.9422760009765625,
                "lat": 43.414026260415305
            },
            {
                "lng": -2.967681884765625,
                "lat": 43.415023819646535
            },
            {
                "lng": -3.03497314453125,
                "lat": 43.37560773536677
            },
            {
                "lng": -3.1056976318359375,
                "lat": 43.36562491300814
            },
            {
                "lng": -3.1482696533203125,
                "lat": 43.35164620129662
            }
        ]
    ],
    [
        [
            {
                "lng": -2.422657012939453,
                "lat": 42.491593121691935
            },
            {
                "lng": -2.4884033203125,
                "lat": 42.489820989777066
            },
            {
                "lng": -2.5117492675781246,
                "lat": 42.519181269065584
            },
            {
                "lng": -2.6056480407714844,
                "lat": 42.4804531727251
            },
            {
                "lng": -2.701435089111328,
                "lat": 42.51854864980914
            },
            {
                "lng": -2.669677734375,
                "lat": 42.57027573801005
            },
            {
                "lng": -2.685470581054687,
                "lat": 42.59593365792913
            },
            {
                "lng": -2.734394073486328,
                "lat": 42.62347572424626
            },
            {
                "lng": -2.773876190185547,
                "lat": 42.61918097420426
            },
            {
                "lng": -2.820911407470703,
                "lat": 42.56104641703961
            },
            {
                "lng": -2.844257354736328,
                "lat": 42.629159496723865
            },
            {
                "lng": -2.8585052490234375,
                "lat": 42.638126171295504
            },
            {
                "lng": -2.8849411010742188,
                "lat": 42.62574929551122
            },
            {
                "lng": -2.882366180419922,
                "lat": 42.621075753387984
            },
            {
                "lng": -2.8942108154296875,
                "lat": 42.621581018098816
            },
            {
                "lng": -2.8914642333984375,
                "lat": 42.628149086211636
            },
            {
                "lng": -2.9050254821777344,
                "lat": 42.62638082834924
            },
            {
                "lng": -2.904338836669922,
                "lat": 42.61981257367216
            },
            {
                "lng": -2.9240798950195312,
                "lat": 42.621581018098816
            },
            {
                "lng": -2.9395294189453125,
                "lat": 42.63762104087211
            },
            {
                "lng": -2.9711151123046875,
                "lat": 42.6409043153278
            },
            {
                "lng": -2.9783248901367183,
                "lat": 42.635600478173906
            },
            {
                "lng": -2.9863929748535156,
                "lat": 42.63597933867727
            },
            {
                "lng": -2.990856170654297,
                "lat": 42.64216706706468
            },
            {
                "lng": -2.9960060119628906,
                "lat": 42.6440611466169
            },
            {
                "lng": -3.007335662841797,
                "lat": 42.64254588758824
            },
            {
                "lng": -3.0164337158203125,
                "lat": 42.638126171295504
            },
            {
                "lng": -3.016948699951172,
                "lat": 42.632569511113175
            },
            {
                "lng": -3.0250167846679688,
                "lat": 42.63686333754866
            },
            {
                "lng": -3.0464744567871094,
                "lat": 42.64103059165477
            },
            {
                "lng": -3.069133758544922,
                "lat": 42.63888385924217
            },
            {
                "lng": -3.085269927978515,
                "lat": 42.6409043153278
            },
            {
                "lng": -3.0820083618164062,
                "lat": 42.63269580435453
            },
            {
                "lng": -3.085956573486328,
                "lat": 42.628022783744385
            },
            {
                "lng": -3.070850372314453,
                "lat": 42.622465221476496
            },
            {
                "lng": -3.0603790283203125,
                "lat": 42.601999011637766
            },
            {
                "lng": -3.0660438537597656,
                "lat": 42.59441722725204
            },
            {
                "lng": -3.0588340759277344,
                "lat": 42.58898304764766
            },
            {
                "lng": -3.069477081298828,
                "lat": 42.58910942929866
            },
            {
                "lng": -3.0861282348632812,
                "lat": 42.58215805797416
            },
            {
                "lng": -3.0837249755859375,
                "lat": 42.57684921609549
            },
            {
                "lng": -3.0862998962402344,
                "lat": 42.57116066964717
            },
            {
                "lng": -3.1012344360351562,
                "lat": 42.56142573110638
            },
            {
                "lng": -3.103466033935547,
                "lat": 42.55409191714403
            },
            {
                "lng": -3.113079071044922,
                "lat": 42.55219510083977
            },
            {
                "lng": -3.13385009765625,
                "lat": 42.54169834193706
            },
            {
                "lng": -3.126983642578125,
                "lat": 42.53360325035187
            },
            {
                "lng": -3.1101608276367188,
                "lat": 42.529934816488556
            },
            {
                "lng": -3.102264404296875,
                "lat": 42.53499466890141
            },
            {
                "lng": -3.0892181396484375,
                "lat": 42.538156868495555
            },
            {
                "lng": -3.0768585205078125,
                "lat": 42.533476756219244
            },
            {
                "lng": -3.0742835998535156,
                "lat": 42.51665075361143
            },
            {
                "lng": -3.076343536376953,
                "lat": 42.50551526821832
            },
            {
                "lng": -3.0940246582031246,
                "lat": 42.49171970062173
            },
            {
                "lng": -3.0931663513183594,
                "lat": 42.485137256594896
            },
            {
                "lng": -3.087158203125,
                "lat": 42.47830090850463
            },
            {
                "lng": -3.074626922607422,
                "lat": 42.47716144453506
            },
            {
                "lng": -3.0627822875976562,
                "lat": 42.46893136647918
            },
            {
                "lng": -3.0531692504882812,
                "lat": 42.45588764197166
            },
            {
                "lng": -3.052825927734375,
                "lat": 42.4390407545552
            },
            {
                "lng": -3.0634689331054688,
                "lat": 42.42586409208735
            },
            {
                "lng": -3.0586624145507812,
                "lat": 42.41813418384332
            },
            {
                "lng": -3.0631256103515625,
                "lat": 42.40077009666238
            },
            {
                "lng": -3.0535125732421875,
                "lat": 42.37452473019751
            },
            {
                "lng": -3.0591773986816406,
                "lat": 42.370720143531955
            },
            {
                "lng": -3.080291748046875,
                "lat": 42.39379776055669
            },
            {
                "lng": -3.0778884887695312,
                "lat": 42.415346114253616
            },
            {
                "lng": -3.089733123779297,
                "lat": 42.42168245677133
            },
            {
                "lng": -3.101577758789062,
                "lat": 42.416740164543064
            },
            {
                "lng": -3.096599578857422,
                "lat": 42.401657429321574
            },
            {
                "lng": -3.1056976318359375,
                "lat": 42.38644427600168
            },
            {
                "lng": -3.1000328063964844,
                "lat": 42.38517634676783
            },
            {
                "lng": -3.0854415893554688,
                "lat": 42.38568352153437
            },
            {
                "lng": -3.065013885498047,
                "lat": 42.36539333502107
            },
            {
                "lng": -3.0634689331054688,
                "lat": 42.35638746485392
            },
            {
                "lng": -3.0753135681152344,
                "lat": 42.354104081396585
            },
            {
                "lng": -3.1110191345214844,
                "lat": 42.35169375329851
            },
            {
                "lng": -3.110675811767578,
                "lat": 42.3397676122846
            },
            {
                "lng": -3.09814453125,
                "lat": 42.328473755364314
            },
            {
                "lng": -3.095741271972656,
                "lat": 42.32377795959519
            },
            {
                "lng": -3.1055259704589844,
                "lat": 42.31870102933895
            },
            {
                "lng": -3.104839324951172,
                "lat": 42.31121180948307
            },
            {
                "lng": -3.089733123779297,
                "lat": 42.274260416436476
            },
            {
                "lng": -3.099689483642578,
                "lat": 42.26460631064456
            },
            {
                "lng": -3.0862998962402344,
                "lat": 42.24745392429695
            },
            {
                "lng": -3.0917930603027344,
                "lat": 42.246056116900874
            },
            {
                "lng": -3.1029510498046875,
                "lat": 42.233474456617344
            },
            {
                "lng": -3.099517822265625,
                "lat": 42.224449701009725
            },
            {
                "lng": -3.101577758789062,
                "lat": 42.216313604344776
            },
            {
                "lng": -3.129901885986328,
                "lat": 42.201182762822086
            },
            {
                "lng": -3.128871917724609,
                "lat": 42.196095951813454
            },
            {
                "lng": -3.116168975830078,
                "lat": 42.187574626022084
            },
            {
                "lng": -3.1170272827148438,
                "lat": 42.17828888870216
            },
            {
                "lng": -3.1082725524902344,
                "lat": 42.175108528186286
            },
            {
                "lng": -3.0892181396484375,
                "lat": 42.1589498268135
            },
            {
                "lng": -3.091278076171875,
                "lat": 42.14482348728631
            },
            {
                "lng": -3.0868148803710938,
                "lat": 42.13324008238363
            },
            {
                "lng": -3.0713653564453125,
                "lat": 42.135022282590896
            },
            {
                "lng": -3.0578041076660156,
                "lat": 42.12662004254844
            },
            {
                "lng": -3.033771514892578,
                "lat": 42.08739485297121
            },
            {
                "lng": -3.0135154724121094,
                "lat": 42.08599350447723
            },
            {
                "lng": -2.9958343505859375,
                "lat": 42.08688527528223
            },
            {
                "lng": -2.970600128173828,
                "lat": 42.08446472536185
            },
            {
                "lng": -2.9439926147460938,
                "lat": 42.0885413878056
            },
            {
                "lng": -2.9323196411132812,
                "lat": 42.08739485297121
            },
            {
                "lng": -2.930431365966797,
                "lat": 42.07694769222716
            },
            {
                "lng": -2.914981842041015,
                "lat": 42.035269347480714
            },
            {
                "lng": -2.9134368896484375,
                "lat": 42.02264573924203
            },
            {
                "lng": -2.898159027099609,
                "lat": 42.020350268419115
            },
            {
                "lng": -2.88665771484375,
                "lat": 42.010784914688195
            },
            {
                "lng": -2.8693199157714844,
                "lat": 42.01512138664375
            },
            {
                "lng": -2.8564453125,
                "lat": 42.02863907792867
            },
            {
                "lng": -2.8286361694335938,
                "lat": 42.03947665981535
            },
            {
                "lng": -2.8119850158691406,
                "lat": 42.037436785590664
            },
            {
                "lng": -2.7991104125976562,
                "lat": 42.047508028057806
            },
            {
                "lng": -2.7994537353515625,
                "lat": 42.05260678255793
            },
            {
                "lng": -2.794818878173828,
                "lat": 42.066753682592775
            },
            {
                "lng": -2.8016853332519527,
                "lat": 42.078221828315435
            },
            {
                "lng": -2.791900634765625,
                "lat": 42.093509465966484
            },
            {
                "lng": -2.7937889099121094,
                "lat": 42.109175471287365
            },
            {
                "lng": -2.7817726135253906,
                "lat": 42.11541532211565
            },
            {
                "lng": -2.7678680419921875,
                "lat": 42.1264927273097
            },
            {
                "lng": -2.747955322265625,
                "lat": 42.12076327675189
            },
            {
                "lng": -2.734394073486328,
                "lat": 42.12547419618877
            },
            {
                "lng": -2.705554962158203,
                "lat": 42.10433598038485
            },
            {
                "lng": -2.7072715759277344,
                "lat": 42.091598712723105
            },
            {
                "lng": -2.7309608459472656,
                "lat": 42.06420492437503
            },
            {
                "lng": -2.7361106872558594,
                "lat": 42.05311663549824
            },
            {
                "lng": -2.7579116821289062,
                "lat": 42.0347593513004
            },
            {
                "lng": -2.74881362915039,
                "lat": 42.008871671305805
            },
            {
                "lng": -2.722034454345703,
                "lat": 42.016014152992184
            },
            {
                "lng": -2.70263671875,
                "lat": 42.014866308242375
            },
            {
                "lng": -2.6907920837402344,
                "lat": 42.00427965240744
            },
            {
                "lng": -2.6746559143066406,
                "lat": 41.99841159036236
            },
            {
                "lng": -2.6592063903808594,
                "lat": 42.00581036220167
            },
            {
                "lng": -2.6439285278320312,
                "lat": 42.004662333308616
            },
            {
                "lng": -2.6181793212890625,
                "lat": 42.00542768820574
            },
            {
                "lng": -2.5975799560546875,
                "lat": 42.00287646941049
            },
            {
                "lng": -2.57904052734375,
                "lat": 41.9981564449542
            },
            {
                "lng": -2.576122283935547,
                "lat": 42.0064481470799
            },
            {
                "lng": -2.566680908203125,
                "lat": 42.014611228817955
            },
            {
                "lng": -2.5519180297851562,
                "lat": 42.044193618165224
            },
            {
                "lng": -2.545909881591797,
                "lat": 42.05439124994332
            },
            {
                "lng": -2.5258255004882812,
                "lat": 42.06050904321049
            },
            {
                "lng": -2.517242431640625,
                "lat": 42.06815545599751
            },
            {
                "lng": -2.516040802001953,
                "lat": 42.073125130473144
            },
            {
                "lng": -2.5218772888183594,
                "lat": 42.08319071462519
            },
            {
                "lng": -2.5148391723632812,
                "lat": 42.115287984361586
            },
            {
                "lng": -2.5055694580078125,
                "lat": 42.1141419330616
            },
            {
                "lng": -2.484970092773437,
                "lat": 42.10637370579324
            },
            {
                "lng": -2.474498748779297,
                "lat": 42.11350522894021
            },
            {
                "lng": -2.458019256591797,
                "lat": 42.117325357724575
            },
            {
                "lng": -2.4461746215820312,
                "lat": 42.134131188756044
            },
            {
                "lng": -2.410640716552734,
                "lat": 42.13871382348566
            },
            {
                "lng": -2.35107421875,
                "lat": 42.146478086444084
            },
            {
                "lng": -2.3191452026367188,
                "lat": 42.14571443066779
            },
            {
                "lng": -2.284984588623047,
                "lat": 42.13387658821469
            },
            {
                "lng": -2.2801780700683594,
                "lat": 42.12509224279673
            },
            {
                "lng": -2.28240966796875,
                "lat": 42.109048120996725
            },
            {
                "lng": -2.2666168212890625,
                "lat": 42.08777703355179
            },
            {
                "lng": -2.2573471069335938,
                "lat": 42.08917834264857
            },
            {
                "lng": -2.2381210327148438,
                "lat": 42.10268028026449
            },
            {
                "lng": -2.2240447998046875,
                "lat": 42.098477155008055
            },
            {
                "lng": -2.2137451171875,
                "lat": 42.103699177763055
            },
            {
                "lng": -2.2006988525390625,
                "lat": 42.10306236874526
            },
            {
                "lng": -2.1811294555664062,
                "lat": 42.10560956644037
            },
            {
                "lng": -2.143535614013672,
                "lat": 42.10395389957932
            },
            {
                "lng": -2.1291160583496094,
                "lat": 42.09834978322682
            },
            {
                "lng": -2.127399444580078,
                "lat": 42.087012670088214
            },
            {
                "lng": -2.1310043334960938,
                "lat": 42.07796700314433
            },
            {
                "lng": -2.1419906616210938,
                "lat": 42.07516385872652
            },
            {
                "lng": -2.161903381347656,
                "lat": 42.06662624711205
            },
            {
                "lng": -2.157611846923828,
                "lat": 42.0536264843458
            },
            {
                "lng": -2.146797180175781,
                "lat": 42.04228137995748
            },
            {
                "lng": -2.116584777832031,
                "lat": 42.01869237684385
            },
            {
                "lng": -2.1069717407226562,
                "lat": 42.003769407625384
            },
            {
                "lng": -2.110576629638672,
                "lat": 41.997646151068956
            },
            {
                "lng": -2.123279571533203,
                "lat": 41.99637039845392
            },
            {
                "lng": -2.112293243408203,
                "lat": 41.9592347975243
            },
            {
                "lng": -2.0834541320800777,
                "lat": 41.95578812851097
            },
            {
                "lng": -2.077102661132812,
                "lat": 41.95080927751363
            },
            {
                "lng": -2.0643997192382812,
                "lat": 41.953873231845826
            },
            {
                "lng": -2.0470619201660156,
                "lat": 41.9511922798597
            },
            {
                "lng": -2.0359039306640625,
                "lat": 41.93982889838199
            },
            {
                "lng": -2.0292091369628906,
                "lat": 41.953107257070606
            },
            {
                "lng": -2.009296417236328,
                "lat": 41.94110578381598
            },
            {
                "lng": -1.9814872741699219,
                "lat": 41.91939525416699
            },
            {
                "lng": -1.9550514221191404,
                "lat": 41.92731406804794
            },
            {
                "lng": -1.9389152526855467,
                "lat": 41.92718635304145
            },
            {
                "lng": -1.9160842895507815,
                "lat": 41.93216704883793
            },
            {
                "lng": -1.9068145751953123,
                "lat": 41.94595771527563
            },
            {
                "lng": -1.8558311462402342,
                "lat": 41.96651048661077
            },
            {
                "lng": -1.8517112731933592,
                "lat": 42.00211108382355
            },
            {
                "lng": -1.8999481201171873,
                "lat": 42.03093424950211
            },
            {
                "lng": -1.9056129455566408,
                "lat": 42.0615286181226
            },
            {
                "lng": -1.8980598449707033,
                "lat": 42.08051520880828
            },
            {
                "lng": -1.8546295166015623,
                "lat": 42.120253967183814
            },
            {
                "lng": -1.8268203735351562,
                "lat": 42.15245973799263
            },
            {
                "lng": -1.8038177490234375,
                "lat": 42.14673263632248
            },
            {
                "lng": -1.7816734313964844,
                "lat": 42.138077366269854
            },
            {
                "lng": -1.7748069763183594,
                "lat": 42.14507804381756
            },
            {
                "lng": -1.7497444152832031,
                "lat": 42.14991442344301
            },
            {
                "lng": -1.7224502563476562,
                "lat": 42.13324008238363
            },
            {
                "lng": -1.7114639282226562,
                "lat": 42.1371863154211
            },
            {
                "lng": -1.6790199279785156,
                "lat": 42.153732356884845
            },
            {
                "lng": -1.7016792297363281,
                "lat": 42.17230967862968
            },
            {
                "lng": -1.6797065734863281,
                "lat": 42.188083394135916
            },
            {
                "lng": -1.6827964782714844,
                "lat": 42.19393393313973
            },
            {
                "lng": -1.7040824890136719,
                "lat": 42.195078540474306
            },
            {
                "lng": -1.7145538330078125,
                "lat": 42.21173658927591
            },
            {
                "lng": -1.7483711242675781,
                "lat": 42.213643719198245
            },
            {
                "lng": -1.8136024475097656,
                "lat": 42.231440821493756
            },
            {
                "lng": -1.8465614318847654,
                "lat": 42.256983603767466
            },
            {
                "lng": -1.8731689453124998,
                "lat": 42.25431543865193
            },
            {
                "lng": -1.8675041198730469,
                "lat": 42.26765513536665
            },
            {
                "lng": -1.8702507019042967,
                "lat": 42.2905166207974
            },
            {
                "lng": -1.8829536437988283,
                "lat": 42.28810385554954
            },
            {
                "lng": -1.9205474853515625,
                "lat": 42.31501999874675
            },
            {
                "lng": -1.9196891784667967,
                "lat": 42.327458477871026
            },
            {
                "lng": -1.9294738769531248,
                "lat": 42.3223818446116
            },
            {
                "lng": -1.9401168823242185,
                "lat": 42.334438179708876
            },
            {
                "lng": -1.9614028930664065,
                "lat": 42.3348188684428
            },
            {
                "lng": -1.9699859619140625,
                "lat": 42.35359665158396
            },
            {
                "lng": -1.977882385253906,
                "lat": 42.349663931625585
            },
            {
                "lng": -1.9814872741699219,
                "lat": 42.35702172331313
            },
            {
                "lng": -1.9962501525878908,
                "lat": 42.364251817286835
            },
            {
                "lng": -2.0067214965820312,
                "lat": 42.3609539828782
            },
            {
                "lng": -2.0178794860839844,
                "lat": 42.37059332000732
            },
            {
                "lng": -2.0465469360351562,
                "lat": 42.359051307364425
            },
            {
                "lng": -2.0702362060546875,
                "lat": 42.34408158403525
            },
            {
                "lng": -2.091007232666015,
                "lat": 42.34763404440288
            },
            {
                "lng": -2.07916259765625,
                "lat": 42.36704215735293
            },
            {
                "lng": -2.0906639099121094,
                "lat": 42.37579287453795
            },
            {
                "lng": -2.088603973388672,
                "lat": 42.38504955243599
            },
            {
                "lng": -2.1001052856445312,
                "lat": 42.388346121836626
            },
            {
                "lng": -2.113494873046875,
                "lat": 42.402164470921285
            },
            {
                "lng": -2.1047401428222656,
                "lat": 42.414332240033445
            },
            {
                "lng": -2.1110916137695312,
                "lat": 42.421175572932114
            },
            {
                "lng": -2.141132354736328,
                "lat": 42.422062616961576
            },
            {
                "lng": -2.1632766723632812,
                "lat": 42.40951611365125
            },
            {
                "lng": -2.18353271484375,
                "lat": 42.41813418384332
            },
            {
                "lng": -2.21649169921875,
                "lat": 42.41559958024758
            },
            {
                "lng": -2.2140884399414062,
                "lat": 42.424850387925254
            },
            {
                "lng": -2.2307395935058594,
                "lat": 42.42586409208735
            },
            {
                "lng": -2.2405242919921875,
                "lat": 42.440941006128384
            },
            {
                "lng": -2.2882461547851562,
                "lat": 42.46652544694582
            },
            {
                "lng": -2.333221435546875,
                "lat": 42.46969111133112
            },
            {
                "lng": -2.3395729064941406,
                "lat": 42.45310125153081
            },
            {
                "lng": -2.382831573486328,
                "lat": 42.470957332258884
            },
            {
                "lng": -2.422657012939453,
                "lat": 42.491593121691935
            }
        ]
    ],
    [
        [
            {
                "lng": -5.38206,
                "lat": 35.91253
            },
            {
                "lng": -5.37852,
                "lat": 35.91703
            },
            {
                "lng": -5.3668,
                "lat": 35.91805
            },
            {
                "lng": -5.36356,
                "lat": 35.91662
            },
            {
                "lng": -5.34807,
                "lat": 35.90779
            },
            {
                "lng": -5.33438,
                "lat": 35.89406
            },
            {
                "lng": -5.32481,
                "lat": 35.90101
            },
            {
                "lng": -5.30112,
                "lat": 35.89515
            },
            {
                "lng": -5.29923,
                "lat": 35.89694
            },
            {
                "lng": -5.29967,
                "lat": 35.89978
            },
            {
                "lng": -5.2962,
                "lat": 35.90252
            },
            {
                "lng": -5.29046,
                "lat": 35.90412
            },
            {
                "lng": -5.2885,
                "lat": 35.90693
            },
            {
                "lng": -5.28582,
                "lat": 35.90355
            },
            {
                "lng": -5.28395,
                "lat": 35.9031
            },
            {
                "lng": -5.28387,
                "lat": 35.90098
            },
            {
                "lng": -5.2812,
                "lat": 35.89988
            },
            {
                "lng": -5.27869,
                "lat": 35.90085
            },
            {
                "lng": -5.27805,
                "lat": 35.89717
            },
            {
                "lng": -5.28129,
                "lat": 35.89381
            },
            {
                "lng": -5.28395,
                "lat": 35.89413
            },
            {
                "lng": -5.28852,
                "lat": 35.89042
            },
            {
                "lng": -5.29322,
                "lat": 35.88884
            },
            {
                "lng": -5.29696,
                "lat": 35.88966
            },
            {
                "lng": -5.30015,
                "lat": 35.88632
            },
            {
                "lng": -5.30701,
                "lat": 35.88433
            },
            {
                "lng": -5.31346,
                "lat": 35.88627
            },
            {
                "lng": -5.32016,
                "lat": 35.88675
            },
            {
                "lng": -5.32824,
                "lat": 35.87853
            },
            {
                "lng": -5.33456,
                "lat": 35.87956
            },
            {
                "lng": -5.338,
                "lat": 35.87822
            },
            {
                "lng": -5.34308,
                "lat": 35.8709
            },
            {
                "lng": -5.34859,
                "lat": 35.87242
            },
            {
                "lng": -5.35075,
                "lat": 35.87454
            },
            {
                "lng": -5.35173,
                "lat": 35.8727
            },
            {
                "lng": -5.35416,
                "lat": 35.87342
            },
            {
                "lng": -5.35557,
                "lat": 35.87275
            },
            {
                "lng": -5.35712,
                "lat": 35.87454
            },
            {
                "lng": -5.35863,
                "lat": 35.87425
            },
            {
                "lng": -5.35993,
                "lat": 35.87565
            },
            {
                "lng": -5.36245,
                "lat": 35.8783
            },
            {
                "lng": -5.36631,
                "lat": 35.87929
            },
            {
                "lng": -5.36815,
                "lat": 35.87926
            },
            {
                "lng": -5.37076,
                "lat": 35.88053
            },
            {
                "lng": -5.3721,
                "lat": 35.88149
            },
            {
                "lng": -5.37376,
                "lat": 35.88466
            },
            {
                "lng": -5.37589,
                "lat": 35.88935
            },
            {
                "lng": -5.37798,
                "lat": 35.89597
            },
            {
                "lng": -5.38206,
                "lat": 35.91253
            }
        ]
    ],
    [
        [
            {
                "lng": -2.95283,
                "lat": 35.31963
            },
            {
                "lng": -2.96064,
                "lat": 35.31625
            },
            {
                "lng": -2.96768,
                "lat": 35.30168
            },
            {
                "lng": -2.97146,
                "lat": 35.28893
            },
            {
                "lng": -2.96476,
                "lat": 35.28851
            },
            {
                "lng": -2.96391,
                "lat": 35.28669
            },
            {
                "lng": -2.96885,
                "lat": 35.28529
            },
            {
                "lng": -2.96751,
                "lat": 35.28136
            },
            {
                "lng": -2.95421,
                "lat": 35.27295
            },
            {
                "lng": -2.95033,
                "lat": 35.26524
            },
            {
                "lng": -2.93824,
                "lat": 35.26735
            },
            {
                "lng": -2.92923,
                "lat": 35.2719
            },
            {
                "lng": -2.92497,
                "lat": 35.27816
            },
            {
                "lng": -2.92305,
                "lat": 35.28927
            },
            {
                "lng": -2.92459,
                "lat": 35.29327
            },
            {
                "lng": -2.93888,
                "lat": 35.30365
            },
            {
                "lng": -2.94491,
                "lat": 35.31563
            },
            {
                "lng": -2.95283,
                "lat": 35.31963
            }
        ]
    ]
];