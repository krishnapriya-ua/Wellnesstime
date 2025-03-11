import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Button } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../assets/styles/users.css';
import { AdminNavbar } from './admin-nav';
import { debounce } from 'lodash';
import { Edit, Delete, Block } from "@mui/icons-material"; // Import the icons
import { IconButton } from "@mui/material"; // Import IconButton component
import TablePagination from '@mui/material/TablePagination';
import '../../assets/styles/trainer.css'
export default function Users() {
  
    const [editUserModal, setEditUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [addUserModal, setAddUserModal] = useState(false);
    const [newUser, setNewUser] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        phonenumber:''
    });
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { token, isAuthenticated } = useSelector((state) => state.admin);
    const [page, setPage] = useState(0);  // State for current page
    const [rowsPerPage, setRowsPerPage] = useState(10); 
    const [bestTrainers,setBestTrainers]=useState([])
    const [isModalOpen,setIsModalOpen]=useState(false)
    const [selectedUser,setSelectedUser]=useState(null)
    const [trainerwithuser,setTrainerWithUser]=useState(null)
  

    const handleReassignTrainer=async(user)=>{
      try {
        const response=await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/get-best-trainer`,{
         params:{userId:user._id},
        })
        setBestTrainers(response.data.trainers)
        setSelectedUser(user)
        setTrainerWithUser(response.data.trainerWithUser)
        setIsModalOpen(true)
      } catch (error) {
        console.error('Error fetching best trainers:', error);
      }

    }

   
    
    const handleAssignTrainer=async(newtrainerId)=>{
    
      try {
        await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/assign-new-trainer`,{userId:selectedUser._id,newtrainerId:newtrainerId})
        setIsModalOpen(false)
        toast.success('Trainer reassigned successfully')
      } catch (error) {
        console.error('Error assigning trainer:', error);
      }

    }


    // Fetch users
    useEffect(() => {
      const fetchUsers = async () => {
          try {
              const response = await axios.get(
                  `${process.env.REACT_APP_BACKEND_ROUTE}/admin/users?search=${searchTerm}`,
                  {
                      headers: { Authorization: `Bearer ${token}` },
                  }
              );
              if (response.data.success) {
                  setUsers(response.data.users);
              } else {
                setUsers([]);
                toast.warn('No users found');
            }
          } catch (error) {
              console.error('Error fetching users:', error);
          }
      };
  
      if (isAuthenticated) fetchUsers();
  }, [isAuthenticated, token, searchTerm,page, rowsPerPage]); // searchTerm must be in the dependency array
  
  const debouncedSearch = debounce((term) => setSearchTerm(term), 300);

const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
};
const handleChangePage = (event, newPage) => {
  setPage(newPage);
};

// Handle rows per page change
const handleChangeRowsPerPage = (event) => {
  setRowsPerPage(parseInt(event.target.value, 10));
  setPage(0); // Reset to the first page when changing rows per page
};
    // Add user
    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/users`, newUser, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setUsers([...users, response.data.user]);
                toast.success('User added successfully');
                setAddUserModal(false);
                setNewUser({ firstname: '', lastname: '', email: '', password: '',phonenumber:'' });
            }
        } catch (error) {
            toast.error(error.response?.data.message || 'Error adding user');
        }
    };
    const handleEditUser = async (e) => {
        e.preventDefault();
        try {
          const response = await axios.put(
            `${process.env.REACT_APP_BACKEND_ROUTE}/admin/users/${editingUser._id}`,
            editingUser,
            { headers: { Authorization: `Bearer ${token}` } }
          );
      
          if (response.data.success) {
            const updatedUser = response.data.updateUser;
            setUsers((prev) =>
              prev.map((user) => (user._id === updatedUser._id ? updatedUser : user))
            );
            toast.success('User updated successfully');
            setEditUserModal(false);
          }
        } catch (error) {
          toast.error(error.response?.data.message || 'Error updating user');
        }
      };
      const deleteUser = async (userId) => {
        try {
            const response = await axios.delete(`${process.env.REACT_APP_BACKEND_ROUTE}/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.success) {
                toast.success("User deleted successfully");
                setUsers(users.filter((user) => user._id !== userId));
            } else {
                toast.error(response.data.message || "Error deleting user");
            }
        } catch (error) {
            toast.error(error.response?.data.message || "Server error");
        }
    };
      
      const handleDeleteUser = (userId) => {
        toast(
            <div>
                <span>Are you sure you want to delete this user?</span>
                <div style={{display:'flex',gap:'9px',marginTop:'25px'}}>
                <Button
                   
                   
                    className='delete'
                    onClick={() => {deleteUser(userId);
                        toast.dismiss()}}
                >
                    Confirm <br />
                </Button>
                <Button
                    
                   
                    className='edit'
                    onClick={() => toast.dismiss()}
                >
                    Cancel
                </Button>
                </div>
              
            </div>,
            {
                position: "top-center",
                autoClose: false,
                closeOnClick: false,
                draggable: false,
            }
        );
    };
    const handleBlockUser = async (userId) => {
        try {
          const response = await axios.put(
            `${process.env.REACT_APP_BACKEND_ROUTE}/admin/users/block/${userId}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
    
          if (response.data.success) {
            toast.success(response.data.message);
            setUsers((prev) =>
              prev.map((user) =>
                user._id === userId ? { ...user, blocked: !user.blocked } : user
              )
            );
           
          }
        } catch (error) {
          toast.error(error.response?.data.message || 'Error blocking user');
        }
      };
      const displayedUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    

    return (
        <div className="admin-container">
            <AdminNavbar/>
            <ToastContainer />
            <div className="main-content">
                <div className="top">
                    <h4 className="userslist">USERS LIST</h4>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => setAddUserModal(true)}
                        className="logoutad"
                    >
                        Add a user
                    </Button>
                </div>
                <div className="search-bar">
                <input
               type="text"
                 placeholder="Search users..."
                onChange={handleSearchChange}
                className="search-bar"
  />
                </div>
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Full Name</th>
                            <th>Phonenumber</th>
                            <th>Email</th>
                            <th>Trainer</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user._id}>
                                <td>{index + 1}</td>
                                <td>{user.firstname+' '+user.lastname}</td>
                                 <td>{user.phonenumber}</td>
                                <td>{user.email}</td>
                                <td>
                               {user.trainerStatus === 'pending' ? (
                                <>
                                 <p style={{ fontSize: 'small', color: 'orange' }}>Pending</p>
                                 <Button style={{background:'black',color:'white',fontSize:'7px',margin:'0px'}}
                                 onClick={()=>handleReassignTrainer(user)}
                                 >Reassign trainer</Button>
                                </>
                              
                               ) : user.trainer ? (
                               <span style={{ fontSize: 'small',color:'green' }}>
                               {user.trainer.name || 'none'}
                               </span>
                                ) : (
                              <span style={{ fontSize: 'small' }}>Normal user</span>
                               )}



                            {isModalOpen && selectedUser && selectedUser._id === user._id && (
                          <div className="modall">
                         <div className="modal-contentt">
                        
                              {trainerwithuser.length>0 && (
                                <div>
                                  <h6>CURRENTLY ASSIGNED TRAINER</h6>
                                  <ul>
                                    {trainerwithuser.map(trainer=>
                                      <li key={trainer._id}>
                                        <p>
                                          {trainer.name}
                                        </p>
                                      </li>
                                    )}
                                   
                                  </ul>
                                </div>
                              )}

                      <h6>SELECT A NEW TRAINER</h6>
                         <ul>
                             {bestTrainers.map((trainer) => (
                              <li key={trainer._id}>
                           <button  onClick={() => handleAssignTrainer( trainer._id)}>
                            {trainer.name}
                           </button>
                          </li>
                           ))}
                         </ul>
                      <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                      Close
                     </button>
                     </div>
                      </div>
                        )}
                             
                             
                         </td>


                                <td>
                                <IconButton  size="small" onClick={() => {setEditingUser(user); // Set the user being edited
                                   setEditUserModal(true); // Open the modal
                                   }}
                                   color="info"
                               >
                                <Edit />
                                </IconButton>
      
                          {/* Delete Icon */}
                               <IconButton size="small" onClick={() => handleDeleteUser(user._id)}
                                 color='error'
                                >
                               <Delete />
                             </IconButton>
      
                        {/* Block/Unblock Icon */}
                      <IconButton size="small" onClick={() => handleBlockUser(user._id)}
                       color={user.blocked ? 'success' : 'error'} // Change color depending on block status
                      >
                       <Block />
                      </IconButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <TablePagination
          component="div"
          count={users.length}  // Dynamically set the total count of users
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`} // Display current page range
        />
            </div>

            {addUserModal && (
                <div className="edit-modal">
                    <div className="modal-content">
                        <form onSubmit={handleAddUser}>
                            <h6>ADD A NEW USER</h6>
                            <input
                                type="text"
                                placeholder="First Name"
                                value={newUser.firstname}
                                onChange={(e) => setNewUser((prev) => ({ ...prev, firstname: e.target.value }))}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={newUser.lastname}
                                onChange={(e) => setNewUser((prev) => ({ ...prev, lastname: e.target.value }))}
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={newUser.email}
                                onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Phone number"
                                value={newUser.phonenumber}
                                onChange={(e) => setNewUser((prev) => ({ ...prev, phonenumber: e.target.value }))}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={newUser.password}
                                onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
                                required
                            />
                            <div className="modal-actions">
                                <Button type="submit" variant="contained" className='edit' size="small" color="primary">
                                    Add user
                                </Button>
                                <Button
                                className='edit'
                                    type="button"
                                    size="small"
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => setAddUserModal(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {editUserModal && editingUser && (
  <div className="edit-modal">
    <div className="modal-content">
      <form onSubmit={handleEditUser}>
        <h6>EDIT USER</h6>
        <input
          type="text"
          placeholder="First Name"
          value={editingUser.firstname}
          onChange={(e) =>
            setEditingUser((prev) => ({ ...prev, firstname: e.target.value }))
          }
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={editingUser.lastname}
          onChange={(e) =>
            setEditingUser((prev) => ({ ...prev, lastname: e.target.value }))
          }
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={editingUser.email}
          onChange={(e) =>
            setEditingUser((prev) => ({ ...prev, email: e.target.value }))
          }
          required
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={editingUser.phonenumber}
          onChange={(e) =>
            setEditingUser((prev) => ({ ...prev, phonenumber: e.target.value }))
          }
          required
        />
        <div className="modal-actions">
          <Button type="submit" variant="contained" className="edit" size="small" color="primary">
            Save Changes
          </Button>
          <Button
            className="edit"
            size="small"
            variant="contained"
            color="secondary"
            onClick={() => setEditUserModal(false)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  </div>
             )}


             

        </div>
    );
}
