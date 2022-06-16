
import './register.css';
import axios from 'axios';
import { useState } from 'react';
import {useNavigate } from 'react-router-dom';
function Admin() {
  let [v1, setV1] = useState();
  let [v2, setV2] = useState();
const navigate = useNavigate();
function adminSet(e)
{
  e.preventDefault() ;
  if(v1 === "")
    v1 = 0;
  if(v2 === "")
    v2 = 0;
  let request= {  
      v: v1,
      w: v2
    
  }
  axios.post("/api/users/admin",request)
  .then(resp =>{
    alert("stocks added");
    navigate("/")

  })
  .catch(err=>{
    console.log(err);
  })
}

  return (
    <div className="main" >
      <div className='sub-main'>
        <div><div>
          <h1>Admin Portal</h1>
      <form onSubmit={ (e)=> adminSet(e)}>
      <div>
  
    <input type="number" className="name1" placeholder='V1' id="v1" onChange={(e)=>{
      setV1(e.target.value)
    }}  /> 
    
  </div>
  <div className="second-input">
    
    <input type="number" className="name1" id="v2" placeholder='V2'  onChange={(e)=>{
      setV2(e.target.value)
    }} />
    
  </div>
<div className='login-button'>
  <button type="submit">Submit</button>
  </div>
</form>
    </div>
    </div></div></div>
  );



}
export default Admin;
