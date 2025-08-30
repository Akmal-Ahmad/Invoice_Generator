This invoice generator is primarily a react webapp that allows users to generate invoices and track payments.<br/>
<br/>
Project Deployed on Netlify :- https://invoice-generator-akmal-ahmad.netlify.app/hero.html
<br/>
If the app doesn't load instantly please wait for netlify and render to deploy the frontend and backend respectively. <br/>
<br/>
<br/>
Local Setup Guide :-<br/>
Prerequisites :-<br/>
Before you begin, make sure you have the following installed:
<br/>
<br/>
Node.js (v14 or higher recommended)
<br/>
<br/>
A Database (MongoDB, if you dont want to edit the code to implement other database)
<br/>
<br/>
Git
<br/>
<br/>
Steps :=
<br/>
<br/>

1. Clone the Repository<br/>
   Open a terminal and run: git clone https://github.com/Akmal-Ahmad/Invoice_Generator
   <br/>
   <br/>
2. Install Dependencies<br/>
   Run: npm install for both frontend and backend folders (This will install required packages like express, pdf-lib, react, etc.)
   <br/>
   <br/>
3. Make .env in backend root and put your own JWT_SECRET and MONGO_URI<br/>
   <br/>
   <br/>
4. Start the Server<br/>
   Run: node server.js
   <br/>
   <br/>
5. Start the ReactApp<br/>
   Run: npm start
   <br/>
   <br/>
6. Start the Localserver and open hero.html
