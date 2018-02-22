import React, { Component } from 'react';
import logo from './logo.svg';
import L from 'leaflet';
import './App.css';
import request from 'request';
import cheerio from 'cheerio';

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
    var $ = require ('jquery')
    
        fetch('https://dempseywoodgps.tk/api/new', {
          method: 'get'
        })
        .then(function (response) {
            var contentType = response.headers;
            return response.json();
    
    
        })
        .then(function (body) {
          console.log(body);
          
          var mymap = L.map('mapid').setView([-36.914827, 174.8072903], 12);
          
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
            marker.addTo(mymap);
          });
          var list = $("#ulist");
          
          mymap.on('moveend', function(e) {
            list.empty();
            mymap.eachLayer(function (layer){
              //console.log(layer.options['title']);
              console.log(layer);
              var i = 1;
              if(layer.options['title']){
              if(mymap.getBounds().contains(layer._latlng)){
              list.append('<li>'+ layer.options['title'] +'</li>');
            }
          }
          });
         });

        })
      }
      
     
    
  }

export default App;
