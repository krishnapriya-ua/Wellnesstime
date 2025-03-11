import socketIo from 'socket.io-client';
import axios from 'axios';
import React, { useState, useEffect,useRef } from 'react';
import { useSelector } from 'react-redux';
import { Navbar } from './navbar';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/chat.css';
import person from '../../assets/images/person.png';

const socket = socketIo.connect(`${process.env.REACT_APP_SOCKET_ROUTE}`);

export default function ClientChat() {
  const userId = useSelector((state) => state.user.userId);
  const navigate=useNavigate()
  const [trainer, setTrainer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
      // Scroll to the bottom when messages change
      scrollToBottom();
    }, [messages]);
  
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };

  useEffect(() => {
    const fetchTrainer = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/userroute/gettrainer/${userId}`);
        setTrainer(response.data);
      } catch (error) {
        console.error('Error fetching trainer:', error);
      }
    };
    fetchTrainer();
  }, [userId]);



  useEffect(() => {
    if (trainer?._id&&userId) {
      console.log(trainer?._id,userId)
      const roomId = trainer._id < userId ? `${trainer._id}-${userId}` : `${userId}-${trainer._id}`;
      socket.emit('joinRoom', { trainerId: trainer._id, clientId: userId });
      fetchMessages();
     
    }
  }, [trainer?._id, userId]);

  const fetchMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/trainer/get-messages`, {
        params: { trainerId: trainer?._id, clientId: userId },
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const sendMessage = () => {
    if (messageText.trim()) {
      const message = {
        senderId: userId,
        receiverId: trainer?._id,
        text: messageText,
        isTrainer: false,
      };

      try {
        socket.emit('message', message);
        setMessages((prevMessages) => [...prevMessages, { senderId: userId, text: messageText }]);
        setMessageText('')
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };
  
  useEffect(() => {
    const handleIncomingMessage = (message) => {
      console.log(message,"USER CHAT INFO")
      if (
        (message.senderId === trainer?._id && message.receiverId === userId) ||
        (message.senderId === userId && message.receiverId === trainer?._id)
      ) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    };
  
    socket.on('message', handleIncomingMessage);
    return () => {
      socket.off('message', handleIncomingMessage);
    };
  }, [trainer, userId]);
  

  const profilePhotoUrl = trainer?.profilephoto
    ? `${process.env.REACT_APP_BACKEND_ROUTE}/${trainer.profilephoto}`
    : person;

  return (
    <div >
      <Navbar />
      <div className="height mt-5"  >
        {trainer ? (
          <>
           
            <div className="chat-container" style={{justifySelf:'center',width:'50%',marginTop:'-3rem'}}>
              <div className="profiletag">
              <div className="trainer-info"style={{display:'flex',flexDirection:'row'}}>
              <img
                src={profilePhotoUrl}
                alt="Trainer profile"
                style={{
                  width: '35px',
                  height: '35px',
                  marginRight: '10px',
                  marginTop: '6px',
                  borderRadius: '50%',
                  marginLeft:'1rem'
                }}
              />
              <p className='tagp'> {trainer.name}</p>
              <p className='tagp' style={{cursor:'pointer',marginLeft:'auto',marginRight:'2rem'}} onClick={()=>navigate('/premium/tasks')}>GET TASKS</p>
            </div>
              </div>
              <div className="messages-container">
                {isLoadingMessages ? (
                  <p>Loading messages...</p>
                ) : (
                  messages.map((msg, index) => (
                    <p
                      key={index}
                      className={msg.senderId === userId ? 'sent-message' : 'received-message'}
                    >
                      {msg.text}
                    </p>
                  ))
                )}
                 <div ref={messagesEndRef} />
              </div>
              <div className="message-input ">
                <input
                  type="text"
                  placeholder="Type something..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e)=>{
                    if(e.key==='Enter'){
                      e.preventDefault()
                      if(messageText.trim()){
                        sendMessage()
                      }
                      else{
                        
                      }
                    }
                  }}
                />
                <button style={{textTransform:'uppercase',fontSize:'small'}} onClick={sendMessage}>Send</button>
              </div>
            </div>
          </>
        ) : (
          <p>Loading trainer information...</p>
        )}
      </div>
    </div>
  );
}
