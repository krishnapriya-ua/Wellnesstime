import socketIo from 'socket.io-client';
import React, { useState, useEffect, useRef } from 'react';
import '../../assets/styles/chat.css';
import { TrainerNavbar } from './navbar-trainer';
import { useSelector } from 'react-redux';
import axios from 'axios';
import person from '../../assets/images/person.png';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import { useLocation } from 'react-router-dom';


const socket = socketIo.connect(`${process.env.REACT_APP_SOCKET_ROUTE}`);

export default function Chatbox() {
  const trainerId = useSelector((state) => state.trainer.trainerId);
  const [clients, setClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState(null);
  const [messages, setMessages] = useState({});
  const [messageText, setMessageText] = useState('');
  const [isClientSelected, setIsClientSelected] = useState(false);
  const [activeView, setActiveView] = useState('clients');
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const messageEndRef = useRef(null)
  const location=useLocation()
  const initialClient=location.state?.client


  useEffect(() => {
    scrollToBottom();
  }, [messages[selectedClients?._id]]); // Run whenever the current client's messages update

  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
 
  useEffect(()=>{
    if(initialClient){
      handleSelectedClient(initialClient)
    }
  },[initialClient])
  
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);

    // Check initial screen size
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Rest of your code here...



  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/trainer/getclients`, {
          params: { trainerId },
        });
        setClients(response.data);
      } catch (error) {
        console.log('Error fetching clients:', error);
      }
    };

    if (trainerId) {
      fetchClients();
    }

   
  }, [trainerId]);


  useEffect(() => {
    const handleIncomingMessage = (message) => {
      console.log(message,"USER CHAT INFO")
      if (
        (message.senderId === selectedClients?._id && message.receiverId === trainerId) ||
      (message.senderId === trainerId && message.receiverId === selectedClients?._id)
      ) {
        setMessages((prevMessages) => ({
          ...prevMessages,
          [selectedClients._id]: [
            ...(prevMessages[selectedClients._id] || []),
            message,
          ],
        }));
      }
    };
  
    
    socket.on('message', handleIncomingMessage);
  
    return () => {
      socket.off('message', handleIncomingMessage);
    };
  }, [trainerId, selectedClients?._id]);
  

  const handleSendMessage = (e) => {
  
    if (messageText.trim() && selectedClients) {
      const roomId = trainerId < selectedClients._id 
      ? `${trainerId}-${selectedClients._id}` 
      : `${selectedClients._id}-${trainerId}`;
      
      const message = {
        senderId: trainerId,
        receiverId: selectedClients._id,
        text: messageText,
        isTrainer: true,
        roomId
      };
      console.log(trainerId, 'trainer', 'sending to', selectedClients.firstname, messageText);
      socket.emit('message', message);
      setMessages((prevMessages) => ({
        ...prevMessages,
        [selectedClients._id]: [
          ...(prevMessages[selectedClients._id] || []),
          message
        ],
      }));
      setMessageText('');
    }
  };

  const handleSelectedClient = async (client) => {
    setSelectedClients(client);
    setIsClientSelected(true)
    const roomId = trainerId < client._id 
    ? `${trainerId}-${client._id}` 
    : `${client._id}-${trainerId}`;
    socket.emit('joinRoom', { trainerId, clientId: client._id, roomId });
    setActiveView('chat')
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/trainer/get-messages`, {
        params: { trainerId: trainerId, clientId: client._id },
      });
      setMessages((prevMessages) => ({
        ...prevMessages,
        [client._id]: response.data,
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const profilePhotoUrl = selectedClients?.profilephoto
    ? `${process.env.REACT_APP_BACKEND_ROUTE}/${selectedClients.profilephoto}`
    : person;


    const toggleView = (view) => {
      setActiveView(view);
    };
  return (
    <div style={{overflowX:'hidden'}}>
    
      <div className="chatrow">
        <div className="client-list col-md-3"  style={{ display: isSmallScreen? (activeView === 'clients' ? 'block' : 'none'):'block' }}>
           <Link style={{ color: "#000000ab", fontSize: "small" }} to="/trainer/clients">
              <p style={{fontWeight:'600',marginTop:'-1rem',marginBottom:'2rem'}}>BACK</p>
            </Link>
          <h6>CHATS</h6>
          <div className="chat-info mt-5">
            {clients.length > 0 ? (
              clients.map((client) => {
                const profileurl = client.profilephoto
                  ? `${process.env.REACT_APP_BACKEND_ROUTE}/${client.profilephoto}`
                  : person;
                return (
                  <div key={client._id} onClick={() => handleSelectedClient(client)} style={{ display: 'flex' }}>
                    <img
                      src={profileurl}
                      alt={`${client.firstname}'s profile`}
                      style={{ width: '35px', height: '35px', marginRight: '14px', marginTop: '-7px', borderRadius: '50%' }}
                    />
                    <p>{client.firstname + ' ' + client.lastname}</p>
                  </div>
                );
              })
            ) : (
              <p>NO CLIENTS TO CHAT</p>
            )}
          </div>
        </div>

        <div className='chat-list col-md-6' style={{ display:isSmallScreen?( activeView === 'chat' ? 'block' : 'none'):'block' }}>
       
          <div>
            
            {selectedClients ? (
              <div>
                <div className='tagfix'>
                 <Button onClick={() => setActiveView('clients')} style={{display:isSmallScreen && activeView !== 'clients' ?'block':'none',
                  background:'#d9d9d9',width:' -webkit-fill-available',textAlign:'left',
                  paddingLeft:'1rem',color:'black',fontSize:'x-small',letterSpacing:'3px',textDecoration:'underline'}}>
                  Back</Button>    
   
        
                 <div className="profiletag">
                
          {/* Display the selected client's profile photo and name */}
          <div style={{ display: 'flex', alignItems: 'center' }}   onClick={() => toggleView('profile')}>
            <img
              src={profilePhotoUrl} // Dynamically set the profile photo URL
              alt={`${selectedClients.firstname}'s profile`}
              style={{
                width: '25px',
                height: '25px',
                marginRight: '10px',
                marginTop: '0px',
                borderRadius: '50%',
                marginLeft:'1rem'
              }}
            />
            <p className='tagp'>{selectedClients.firstname + ' ' + selectedClients.lastname}</p> {/* Display full name */}
          </div>
          </div>
        </div>
                <div className="messages-containers">
                  {messages[selectedClients._id]?.map((msg, index) => (
                    <div className='mt-3'>
                     
                    <p key={index} className={msg.senderId === trainerId ? 'sent-message' : 'received-message'}>
                      {msg.text}
                    </p>
                    </div>
                  ))}
                  <div ref={messageEndRef}/>
                </div>
                <div className="message-input">
                  <input
                    type="text"
                    placeholder="Type something"
                    value={messageText}
                    onKeyDown={(e)=>{
                      if(e.key==='Enter'){
                        e.preventDefault()
                        if(messageText.trim()){
                          handleSendMessage()
                        }
                        else{

                        }
                      }
                    }}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                  <button onClick={handleSendMessage}>send</button>
                </div>
              </div>
            ) : (
              <p>Select a client to start chatting</p>
            )}
          </div>
        </div>

        <div className="profile-list col-md-3" style={{ display:isSmallScreen?( activeView === 'profile' ? 'block' : 'none'):'block' }}>
          {selectedClients ? (
            
            <div className="profile-details">
             
               <Button onClick={() => setActiveView('chat')} style={{display:isSmallScreen?'block':'none',fontSize:'x-small',color:'black',letterSpacing:'3px',textDecoration:'underline'}}>Back</Button>
              <div style={{ justifySelf: 'center', textAlign: '-webkit-center' }}>
                <img src={profilePhotoUrl} alt="photo" className="profile-photo" />
                <h6 className="profilename">{selectedClients.firstname + selectedClients.lastname}</h6>
              </div>
              <p>
                Name: <br /> {selectedClients.firstname} {selectedClients.lastname}  <hr />
              </p>
              <p>
                Email: <br /> {selectedClients.email} <hr />
              </p>
              <p>
                Phonenumber: <br /> {selectedClients.phonenumber} <hr />
              </p>
              <p>
                Goals: <br /> {selectedClients.goals.join(' , ')} <hr />{' '}
              </p>
            </div>
          ) : (
            <p></p>
          )}
        </div>
      </div>
    </div>
  );
}
