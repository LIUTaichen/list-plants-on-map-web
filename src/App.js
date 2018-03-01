import React, { Component } from 'react';
import logo from './logo.svg';
import L, { latLng } from 'leaflet';
import './App.css';
import request from 'request';
import cheerio from 'cheerio';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

class App extends Component {

  constructor(props){
    
    super(props);
    this.state = {
      data :  [],
      hello: 'Hello there',
    };
  }

 renderPlants(){
    return (<ul>
      {this.state.data.map(function(listValue){
            return <li>{listValue['VehicleName']}</li>;
          })}
    </ul>);
 }
  render() {
    return (
      <div className="App h-100" >
        <div className='container-fluid h-100'>
          <div className='row h-100'>
            <div id='list' className='col-lg-2 col-md-3 col-sm-4 h-100 col-6'>
               <ol id='ulist'></ol>
            </div>

            <div id='mapid' className='col-lg-10 col-md-9 col-sm-8 h-100 .col-6'/>
          </div>
          </div>
      </div>
    );
  }

  getVehicles() {

  }
  componentWillMount(){
    console.log(this.state.hello);
  }

  componentDidMount() {
    console.log('getting data');
    var mymap;
    var $ = require ('jquery');
    var wellknown = require('wellknown');
    
        fetch('https://dempseywoodgps.tk/api/new', {
          method: 'get'
        })
        .then(function (response) {
            var contentType = response.headers;
            return response.json();
    
    
        })
        .then(function (body) {
          console.log(body);
          
          mymap = L.map('mapid').setView([-36.914827, 174.8072903], 12);
          
              L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
                maxZoom: 18,
                id: 'mapbox.streets',
                accessToken: 'pk.eyJ1IjoiamFzb25saXV0YWljaGVuIiwiYSI6ImNqNmZ5ZGpkcjAzYWIzNXA1aWs5OXF3bXcifQ.33nis-JWUXYo1jpJkr1OSQ'
              }).addTo(mymap);
         
    
          //TODO: add markers to map
          body.forEach(element => {
            //console.log(element['VehicleName']);
            let marker = L.marker([element['LastLat'],element['LastLon']], {
              title: element['VehicleName']
            });
            marker.addTo(mymap)
            .bindPopup(element['VehicleName']);
          });
          var list = $("#ulist");
          
          mymap.on('moveend', function(e) {
            list.empty();
            mymap.eachLayer(function (layer){
              //console.log(layer.options['title']);
              var i = 1;
              if(layer.options['title']){
              if(mymap.getBounds().contains(layer._latlng)){
              list.append('<li>'+ layer.options['title'] +'</li>');
            }
          }
          });
         });

        }).then(function (){
          //let url = 'http://webapi.blackhawktracking.com/api/Vehicle?filterVehicles=true';
          let url = 'https://webapi.blackhawktracking.com/api/GeoFence?includeGeometries=true';
           return fetch(url,{
             headers:{
              token: '034A9768-D9F0-4D4D-9BB1-02E3932A44E3'
             }
           })
           .then(function(response){
              return response.json();
           });

        }).then(function(gpsjson){
          console.log(gpsjson);
          gpsjson.forEach(geofence => {
              //console.log(geofence);
              let polygon = wellknown(geofence.WellKnownText);

              if(!polygon){
                console.log("geofence " + geofence.Description + " is not a converted to a polygon, skipping it");
                return;
              }
              let latLngs = [];
             console.log(polygon.coordinates);
             if(polygon.type === 'Polygon'){
                polygon.coordinates.forEach(pointsArray => {
                  let simplePoly = [];
                  latLngs.push(simplePoly);
                  pointsArray.forEach(points =>{
                    simplePoly.push([points[1], points[0]]);
                  });
                });
              }else{
                polygon.coordinates.forEach(level1 => {
                  let simplePoly = [];
                  latLngs.push(simplePoly);
                  level1[0].forEach(points =>{
                    simplePoly.push([points[1], points[0]]);
                  });
                });
              }
              
              console.log(latLngs);
              let mapFeature = L.polygon(latLngs, {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.5,
              });
              console.log("adding  " + geofence.Description + " to map");
              mapFeature.bindPopup(geofence.Description);
              mapFeature.Name = geofence.Name;
              mapFeature.on('click', function(e){
                let list = $("#ulist");
                list.empty();
                let targetGeofence = e.target;
                mymap.eachLayer(function (layer){
                  //console.log(layer.options['title']);
                  var i = 1;
                  if(layer.options['title']){
                    if(booleanPointInPolygon(layer.toGeoJSON(),targetGeofence.toGeoJSON())){
                      list.append('<li>'+ layer.options['title'] +'</li>');
                    }
                  }
                
                });
              });
            
              mapFeature.addTo(mymap);
          })
        }).then(function(){
          let point;
          let polygon9468;
          let polygon9431;
          mymap.eachLayer(function (layer){
            //console.log(layer.options['title']);
            var i = 1;
            if(layer.options['title']){
              if(layer.options['title'] ==='HC01'){
                point = layer;
              }
            }
            if(layer.Name === '9431'){
              polygon9431 = layer;
            }
            if(layer.Name === '9468'){
              polygon9468 = layer;
            }
          });
          console.log(point);
          console.log(polygon9468);
          console.log(polygon9431);
          console.log(polygon9468._latlngs[0]);
          let isIn9468 = booleanPointInPolygon(point.toGeoJSON(),polygon9468.toGeoJSON());
          console.log(isIn9468);
          console.log( booleanPointInPolygon(point.toGeoJSON(),polygon9431.toGeoJSON()));

        });
      }
  }

export default App;
