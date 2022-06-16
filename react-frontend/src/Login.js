import './login.css';
import axios from 'axios';
import { useState } from 'react';
import {useNavigate } from 'react-router-dom';
function Login() {
 
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
   alert("OTP is sent successfully")
    setOtp(resp.data.random_number);
   
})
  .catch(err=>{
    console.log(err);
  })
}

function login(e)
{
  e.preventDefault() ;
  let request= {  
    phone_number: phone,
    enteredOTP: otpUser,
    OTP: otp
  }
   
  axios.post("/api/users/login",request)
  .then(resp =>{
      if(resp.data === "User not registered" )
     {
      alert("User not registered");
      navigate("/register");
  }
  else if(resp.data === "Wrong OTP")
  {
  alert("Wrong OTP");
  navigate(`/login`)
}
  else{
    let name = resp.data.name;
      alert(`successful login (${resp.data.state})`);
       navigate(`/Dashboard/${phone}&${name}`)
      //navigate(`/api/users/vaccine1?phone_number=${phone}`);
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
       <h1>Login Page</h1>
         
      <form onSubmit={ (e)=> login(e)}>
  <div>
    <input type="number" placeholder='Phone Number' className="name" id="phone" onChange={(e)=>{
      setPhone(e.target.value) 
    }} />
  </div>
  <div className='second-input'>
    <input type="number" placeholder='Enter OTP' className="name-otp" id="phone" onChange={(e)=>{
      setOtpUser(e.target.value);
     
    }} />
  <button type="submit" className="button-otp"  onClick={(e)=> generateOTP(e)}>Get OTP</button>

  </div>

  <div className="login-button">
  <button type="submit" className="button-submit">Submit</button>
  </div>
</form>
    </div></div></div></div>
  );



}
export default Login;
