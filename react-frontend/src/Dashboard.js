import './register.css';
import axios from 'axios';
import {useNavigate, useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import vacImage from '../src/image/vaccine.png'
const Enums = require('./enum');


function Dashboard() {

const navigate = useNavigate();
let {phone_number,name} = useParams();

function v1(e)
{
  e.preventDefault();
  let request={phone_number}
 
  axios.post("/api/users/vaccine1",request)
  .then(resp =>{
    console.log(resp.data.v1_state)
    if(resp.data.v1_state === "Vaccinated" )
     {
       alert("Vaccination Successful");
       generatePdf1(resp.data);
       navigate(`/Dashboard/${phone_number}&${name}`)
     }

    else if(resp.data.v1_state === "Already vaccinated"){
    alert("You have already been vaccinated");
    generatePdf1(resp.data);
    navigate(`/Dashboard/${phone_number}&${name}`)
    }

    else if(resp.data.v1_state === "Wait for vaccination"){
      alert("Stocks not available! You will be notified based on stock availability") 
      navigate(`/Dashboard/${phone_number}&${name}`)
    }
    else{
        alert("Failed");
        navigate(`/Dashboard/${phone_number}&${name}`)
      }
})

  .catch(err=>{
    console.log(err);
  })

}

function v2(e)
{
  e.preventDefault();
  let request={phone_number}
   

  axios.post("/api/users/vaccine2",request)
  .then(resp =>{
    if(resp.data.v2_state ===  "Vaccinated")  //Enums.VaccineStatus.Vaccinated
     {
       alert("2nd Vaccination Successful");
       generatePdf2(resp.data);
       navigate(`/Dashboard/${phone_number}&${name}`)
     }

    else if(resp.data.v2_state === "Already vaccinated"){
    alert("You have already been vaccinated");
    generatePdf2(resp.data);
    navigate(`/Dashboard/${phone_number}&${name}`)
    }
    else if(resp.data === "45 Not completed"){
      alert("You have to wait for 45 days after your v1")
      navigate(`/Dashboard/${phone_number}&${name}`)
    }

    else if(resp.data === "No stocks"){
      alert("Stocks not available! Kindly wait")
      navigate(`/Dashboard/${phone_number}&${name}`)
    }
    else if(resp.data === "Not eligible for second vaccination"){
      alert("Not eligible for second vaccination")
      navigate(`/Dashboard/${phone_number}&${name}`)
    }
    else if(resp.data === "Take v1")
    {
      alert("Take V1")
      navigate(`/Dashboard/${phone_number}&${name}`)
    }
    else{
       console.log(resp.data)
        alert("Failed");
        navigate(`/Dashboard/${phone_number}&${name}`)
      }
})

  .catch(err=>{
    console.log(err);
  })

}

function generatePdf1(resp){
  
  let date = new Date(resp.v1_date);
  date = date.toISOString().split('T')[0];
  let dArr = date.split("-");   
  let dateOfV1 =  dArr[2]+ "/" +dArr[1]+ "/" +dArr[0];
  var doc = new jsPDF('landscape','px','a4','false');
  doc.addImage(vacImage,'PNG',80,45,200,200);
  console.log(resp);
  doc.setFont('Melvertica','bold')
  doc.text(100,280,'Name: ');
  doc.text(100,310,'Phone Number: ');
  doc.text(100,340,'Status: ');
  doc.text(100,370,'Date of Vaccination 1: ');

  doc.setFont('Melvertica','italics')
  doc.text(250,280,resp.name);
  doc.text(250,310,resp.phone);
  doc.text(250,340,'vaccine 1');

  doc.text(250,370,dateOfV1);

  doc.text(100,410,'This is to certify that the person above has been successfully vaccinated with 1st dose');

  doc.save('vaccination1.pdf');
}

function generatePdf2(resp){

  let date = new Date(resp.v1_date);
  date = date.toISOString().split('T')[0];
  let arr = date.split("-");  
  let dateOfV1 =  arr[2]+ "/" +arr[1]+ "/" +arr[0];

  let date2 = new Date(resp.v2_date);
  date2 = date2.toISOString().split('T')[0];
  let arr1 = date2.split("-");  
  let dateOfV2 =  arr1[2]+ "/" +arr1[1]+ "/" +arr1[0];

  var doc = new jsPDF('landscape','px','a4','false');
  doc.addImage(vacImage,'PNG',80,45,200,200);
  
  doc.setFont('Melvertica','bold')
  doc.text(100,280,'Name: ');
  doc.text(100,310,'Phone Number: ');
  doc.text(100,340,'Status: ');
  doc.text(100,370,'Date of Vaccination 1: ');
  doc.text(100,400,'Date of Vaccination 2: ');

  doc.setFont('Melvertica','italics')
  doc.text(250,280,name);
  doc.text(250,310,phone_number);
  doc.text(250,340,'vaccine 2');
  doc.text(250,370,dateOfV1);
  doc.text(250,400,dateOfV2);
  

  doc.text(100,430,'This is to certify that the person above has been successfully vaccinated with 2 doses');
  doc.save('vaccination2.pdf');
}



  return (
     <div className="main">
     <div className="sub-main">
       <div>
    
         <div>
           <h1>Dashboard</h1>
          <div className="login-button">
    <button  onClick={(e)=> v1(e)}>Vaccination 1</button>  </div>
    <div className="login-button">

  <button  onClick={(e)=> v2(e)}>Vaccination 2</button> </div>
  </div></div></div>
  
 </div>
  );



}
export default Dashboard;
