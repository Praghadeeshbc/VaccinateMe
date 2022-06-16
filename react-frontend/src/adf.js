import './LoginUi.css';
import profile from "./../image/a.png";
import email from "./../image/email.jpg";
import pass from "./../image/pass.png";
function LoginUi() {
  return (
    <div className="main">
     <div className="sub-main">
       <div>
    
         <div>
           <h1>Login Page</h1>
           <div>
             <img src={email} alt="email" className="email"/>
             <input type="text" placeholder="user name" className="name"/>
           </div>
           <div className="second-input">
             <img src={pass} alt="pass" className="email"/>
             <input type="password" placeholder="user name" className="name"/>
           </div>
          <div className="login-button">
          <button>Login</button>
          </div>
           
            <p className="link">
              <a href="#">Forgot password ?</a> Or<a href="#">Sign Up</a>
            </p>
           
 
         </div>
       </div>
       

     </div>
    </div>
  );
}

export default LoginUi;






import './App.css';
import axios from 'axios';
import { useState } from 'react';
import {useNavigate } from 'react-router-dom';
function Register() {
  const [name, setName] = useState();
  const [phone, setPhone] = useState();
  const navigate = useNavigate();

function register(e)
{
  e.preventDefault() ;
  let request= {  
    name: name,
    phone_number: phone
  }
  console.log(phone)

  axios.post("/api/users/register",request)
  .then(resp =>{
    alert("Registered");
    navigate("/dashboard")

  })
  .catch(err=>{
    console.log(err);
  })
}

  return (
    <div className="container">
      <form onSubmit={ (e)=> register(e)}>
      <div class="mb-3">
    <label for="name" class="form-label">Name</label>
    <input type="text" class="form-control" id="name" onChange={(e)=>{
      setName(e.target.value)
    }}  /> 
    {/* style="width:30rem; " */}
  </div>
  <div class="mb-3">
    <label for="phone" className="form-label">Phone number</label>
    <input type="number" className="form-control" id="phone" onChange={(e)=>{
      setPhone(e.target.value)
    }} />
    
  </div>
  
  {/* <div class="mb-3 form-check">
    <input type="checkbox" class="form-check-input" id="exampleCheck1" />
    <label class="form-check-label" for="exampleCheck1">I agree to get vaccinated</label>
  </div> */}
  <button type="submit" class="btn btn-primary">Submit</button>
</form>
    </div>
  );



}
export default Register;
