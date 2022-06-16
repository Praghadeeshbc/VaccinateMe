
import {useNavigate } from 'react-router-dom';
function App() {

const navigate = useNavigate();

function redirectLogin(e)
{
  e.preventDefault();
  navigate("/Login");
}

function redirectRegister(e)
{
  e.preventDefault() ;
    navigate("/Register");
}
function redirectAdmin(e)
{
  e.preventDefault() ;
    navigate("/Admin");
}

  return (
   <div className="homemain1">
   <div className="homesub-main1">
   <div>

  <button className="btn btn-primary" onClick={(e)=> redirectLogin(e)}>Login</button> <br /> <br />
  <button className="btn btn-primary" onClick={(e)=> redirectRegister(e)}>Register</button> <br /> <br />
  <button className="btn btn-primary" onClick={(e)=> redirectAdmin(e)}>Admin</button> <br />
 </div></div>
 </div>
  );



}
export default App;
