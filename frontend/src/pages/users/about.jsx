import React from 'react'
import { Navbar } from './navbar'
import meditation from '../../assets/images/medi1.jpg'
import weight from '../../assets/images/weight.jpg'
import '../../assets/styles/about.css'

export default function About() {
  return (
    <div>
        <Navbar/>
        <div className="aboutcontainer m-5">
            <div className="aboutrow m-5">
                <div className="col-md-4">
                    <img className='aboutmeditation' src={meditation} alt="meditation-image" />
                </div>
                <div className="col-md-8">
                    <div className="writing mt-3">
                        <p>At Wellness Time, we’re on a mission to transform how people approach
                             health and well-being, embracing the idea that true wellness comes
                              from a balance between body and mind. Founded by KP, a dedicated women 
                               and a firm believer in the power of mental and physical harmony, Wellness Time
                                aims to make workouts more engaging and mindfulness more accessible. KP's journey,
                                 rooted in a deep passion for fitness, meditation, and the understanding of human 
                                 potential, has inspired this platform that offers personalized workout timers, 
                                 soothing or energizing music for every session, and a supportive
                                  community dedicated to personal growth. Our founder’s vision is to empower i
                               ndividuals to take control of their well-being and make wellness
                             a joyful part of everyday life.
                        </p>
                    </div>
                </div>
            </div>
            <div className="aboutroww m-5">
                <div className="col-md-8">
                    <div className="writing">
                    <p>Unlock Your Best Self with Our Premiere Membership!
                      Transform your wellness journey with the exclusive benefits of our Premiere Membership! 
                      As a Premiere Member, you'll gain access to a world of tailored experiences designed to help
                     you achieve your fitness and mindfulness goals more effectively. Dive into personalized work
                     out plans curated by expert trainers, complete with advanced timers that optimize your exercise
                     and rest intervals for maximum efficiency. Immerse yourself in our premium guided meditation
                     sessions, crafted to reduce stress and enhance mental clarity, alongside curated music 
                     playlists that match every mood, from high-energy cardio beats to calming yoga melodies.
                     Beyond just workouts and meditation, our Premiere Members enjoy early access to cutting-edge 
                     features and receive priority support from our dedicated wellness team. This membership is not
                     just an upgrade—it's a commitment to your well-being, giving you the premium tools and
                      resources you deserve to unlock your true potential. Experience the difference, 
                     and join our community of dedicated individuals striving for a balanced, healthier lifestyle.
                </p>
                </div>
                </div>
                <div className="col-md-4">
                <img className='aboutmeditation' src={weight} alt="meditation-image" />
                </div>
            </div>
        </div>
       
    </div>
  )
}
