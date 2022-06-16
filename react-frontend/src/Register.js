import './register.css';
import axios from 'axios';
import { useState } from 'react';
import {useNavigate } from 'react-router-dom';

function Register() {
  const [name, setName] = useState();
  const [phone, setPhone] = useState();
  const [otp, setOtp] = useState();
const [otpUser, setOtpUser] = useState();
  const navigate = useNavigate();


  function generateOTP(e)
  {
    e.preventDefault();
    let request= {  
      phone_number: phone
    }
    axios.post("/api/users/generateOTP",request)
    .then(resp =>{
      alert("OTP is sent successfully");
      setOtp(resp.data.random_number);
  })
    .catch(err=>{
      console.log(err);
    })
  }


function register(e)
{
  e.preventDefault() ;
  let request= {  
    name: name,
    phone_number: phone,
    enteredOTP: otpUser,
    OTP: otp
  }
   

  axios.post("/api/users/register",request)
  .then(resp =>{
    if(resp.data === "Registered"){
      alert("Registration successful");
      navigate(`/Dashboard/${phone}&${name}`)
    }
    else if(resp.data === "Wrong OTP")
    {
    alert("Wrong OTP");
    navigate(`/register`)
    }
   else if(resp.data === "already registered"){
      alert("User already registered");
      navigate(`/Dashboard/${phone}&${name}`)

    }
    else if(resp.data === "Wait for sometime"){
      alert("Registration successful");
      navigate(`/Dashboard/${phone}&${name}`)

    }
    else{
      console.log(resp.data)
      alert("Registered.");
      navigate(`/Dashboard/${phone}&${name}`)

    }


  })
  .catch(err=>{
    console.log(err);
  })
}

  return (
    <div className="main">
       <div className="sub-main">
       <div>
    
         <div>
           <h1>Register page</h1>
      <form onSubmit={ (e)=> register(e)}>
      <div>
    <input type="text" placeholder='Name' id="name" className="name" onChange={(e)=>{
      setName(e.target.value)
    }}  /> 
   
  </div>
  <div className="second-input">
    <input type="number" placeholder='Phone Number' className="name" id="phone"  onChange={(e)=>{
      setPhone(e.target.value)
    }} />
    
  </div>
  <div className="second-input">
    <input type="number" placeholder='Enter OTP' className="name-otp" id="phone" onChange={(e)=>{
      setOtpUser(e.target.value)
    }} />
  
  
  <button type="submit" className="button-otp"  onClick={(e)=> generateOTP(e)}>Get OTP</button>
   
   </div>
  <div className="login-button">
  <button type="submit">Submit</button>
  </div>
</form>
         </div>
       </div>
     </div>
    </div>
  );



}
export default Register;
