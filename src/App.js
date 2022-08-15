import React, {Component } from 'react';
import './App.css';
import Navigation from './Components/Navigation/Navigation';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition'; 
import Logo from './Components/Logo/Logo';
import ImageLinkFrom from './Components/ImageLinkFrom/ImageLinkFrom';
import Rank from './Components/Rank/Rank';
import Sigin from './Components/Signin/Sigin';
import Register from './Components/Register/Register';




const PAT = 'a786107d38db45a4a680920151fa400b';
const MODEL_ID = 'face-detection';
const MODEL_VERSION_ID = '5e026c5fae004ed4a83263ebaabec49e';    

class App extends Component {
  constructor(){
    super();
    this.state = {
      input : '',
      imageUrl : '',
      box: {},
      route: 'sigin',
      isSignedIn: false,
    }
  }


   calculateFaceLocation = (data) => {
    const clarifaiFace = JSON.parse(data, null, 2).outputs[0].data.regions[0]
      .region_info.bounding_box;
      console.log(clarifaiFace)
      const image = document.getElementById('Inputimage'); 
      const width = Number (image.width);
      const height = Number (image.height);
      console.log(width,height);
      return{
        leftCol: clarifaiFace.left_col *width,
        topRow: clarifaiFace.top_row *height,
        rightCol: width - (clarifaiFace.right_col *width),
        bottomRow: height - (clarifaiFace.bottom_row *height)
      }

  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) =>  {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl : this.state.input});
     
    const raw = JSON.stringify({
      "user_app_id": {
          "user_id": "4ihudhqhf8oy",
          "app_id": "Facerecognition"
      },
      "inputs": [
          {
              "data": {
                  "image": {
                      "url": this.state.input
                  }
              }
          }
      ]
    });
    
    const requestOptions = {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Authorization': 'Key ' + PAT
      },
      body: raw
    };
    
    // NOTE: MODEL_VERSION_ID is optional, you can also call prediction with the MODEL_ID only
    // https://api.clarifai.com/v2/models/{YOUR_MODEL_ID}/outputs
    // this will default to the latest version_id
    
    fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs", requestOptions)
    .then((response) => response.text())
    .then((result) => this.displayFaceBox(this.calculateFaceLocation(result)))
    .catch((error) => console.log("error", error));
    
  }

  onRouteChange =(route) =>{
    if(route === 'signout') {
      this.setState({isSignedIn: false})
    } else if (route === 'home'){
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render() {
    const {isSignedIn, imageUrl, route, box} = this.state;
    return(
      <div className="App">
      
      <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
      { route === 'home' 
      ? <div>
      <Logo />
      <Rank />
      <ImageLinkFrom 
      onInputChange ={this.onInputChange} 
      onButtonSubmit ={this.onButtonSubmit}
      />
      <FaceRecognition box={box} imageUrl={imageUrl}/> 
      </div>
      : (
          route === 'sigin' 
          ?<Sigin onRouteChange={this.onRouteChange}/>
          :<Register onRouteChange={this.onRouteChange}/>
        )

      
    }
      </div>
    );
  }
}


export default App;
