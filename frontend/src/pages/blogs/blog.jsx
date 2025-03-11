import React from 'react'
import '../../assets/styles/blog.css'
import { Navbar } from '../users/navbar'
import call from '../../assets/images/call.jpg'
import weight from '../../assets/images/weight2.jpg'
import sleep from '../../assets/images/sleep.jpg'
import nutrition from '../../assets/images/nutrition.jpg'
import meditation from '../../assets/images/meditation.jpg'
import weightt from '../../assets/images/weight1.jpg'
import gym from '../../assets/images/gym.jpg'
import head from '../../assets/images/head.jpg'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2';




export default function Blogpage() {

  const comingSoonPopup = ()=>{
    Swal.fire({title:'Coming Soon',icon:'info'})
  }
  return (
    <div className='blogpage'>
      <Navbar/>
      <div className="blogbox m-5">
          <div className="row">
            <div className="col-md-3 col-sm-6 col-6">
              <div className="blogcontent">
              <Link style={{textDecoration:'none'}} to='/blogs/sleep-healthylifestyle'>
                <div className="imagesection">
                  <img src={sleep} alt="" />
                </div>
                <div className="linksection">
                 
                  <p>The Importance of Quality Sleep for Mental and Physical Health</p>
                 
                  
                </div>
                </Link>
              </div>
            </div>


            <div className="col-md-3 col-sm-6 col-6">
              <div className="blogcontent">
              <Link style={{textDecoration:'none'}} to='/blogs/strengthtraining'>
                <div className="imagesection">
                  <img src={weight} alt="" />
                </div>
                <div className="linksection">
              
                  <p>Why Strength Training is Just as Important as Cardio</p>
                 
                </div>
                </Link>
              </div>
            </div>


            <div className="col-md-3 col-sm-6 col-6">
              <div className="blogcontent">
              <Link style={{textDecoration:'none'}} to='/blogs/role-of-nutrition'>
                <div className="imagesection">
                  <img src={nutrition} alt="" />
                </div>
                <div className="linksection">
               
                  <p>The Role of Nutrition in Achieving Your Wellness Goals</p>
                
                </div>
                </Link>
              </div>
            </div>


            <div className="col-md-3 col-sm-6 col-6">
              <div className="blogcontent">
              <Link style={{textDecoration:'none'}} to='/blogs/benefits-of-meditation'>
                <div className="imagesection">
                  <img src={meditation} alt="" />
                </div>
                <div className="linksection">
               
                  <p>The Benefits of Mindfulness and Meditation in Daily Life</p>
                 
                </div>
                </Link>
              </div>
            </div>


            <div className="col-md-3 col-sm-6 col-6" role='button' onClick={comingSoonPopup}>
              <div className="blogcontent">
                <div className="imagesection">
                  <img src={gym} alt="" />
                </div>
                <div className="linksection">
                  <p>Simple Workouts to Boost Your Energy and Well-being</p>
                </div>
              </div>
            </div>


            <div className="col-md-3 col-sm-6 col-6" role='button' onClick={comingSoonPopup}>
              <div className="blogcontent">
                <div className="imagesection">
                  <img src={call} alt="" />
                </div>
                <div className="linksection">
                  <p>Stress Management Techniques for a Healthier You</p>
                </div>
              </div>
            </div>


            <div className="col-md-3 col-sm-6 col-6" role='button' onClick={comingSoonPopup}>
              <div className="blogcontent">
                <div className="imagesection">
                  <img src={head} alt="" />
                </div>
                <div className="linksection">
                  <p>The Role of Hydration in Maintaining Optimal Health</p>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6 col-6" role='button' onClick={comingSoonPopup}>
              <div className="blogcontent">
                <div className="imagesection">
                  <img src={weightt} alt="" />
                </div>
                <div className="linksection">
                  <p>get proper sleep in nightime</p>
                </div>
              </div>
            </div>


        
          </div> 
      </div>

    </div>
  )
}
