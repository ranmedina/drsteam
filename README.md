# drsteam
A side-project built in React &amp; Node.js. Dr. Steam lets you examine your Steam account and inventory. 

## Dependencies
The project relies on API calls for 3rd parties websites, which means you are gonna have to claim 2 API keys: 
1. Steam Web API key (https://steamcommunity.com/dev)
2. Steam APIs account (https://steamapis.com/)

## Installation
1. Clone this repository:
`git clone https://github.com/ranmedina/drsteam.git`

2. Modify environment variables (.env - on both server and client side):
### Server
    SECRET_KEY=SECRETKEY
    PORT=3001
    STEAM_APIKEY=STEAMWEB_API_KEY_GOES_HERE
    STEAMAPIS_KEY=STEAMAPIS_KEY_GOES_HERE
    BACKEND_URL=BACKEND_URL_GOES_HERE
    BACKEND_PORT=3001
    PROD_MYSQL_URL=BACKEND_MYSQL_URL_GOES_HERE
    PROD_MYSQL_USERNAME=BACKEND_MYSQL_USERNAME_GOES_HERE
    PROD_MYSQL_PASSWORD=BACKEND_MYSQL_PASSWORD_GOES_HERE
    STEAMID_ADMIN=ADMIN_STEAMID_GOES_HERE

### Client
``REACT_APP_BACKEND_URL=BACKEND_URL_GOES_HERE``    



## Build & Deployment
### Development
#### Client
``npm start``
#### Server
``nodemon server.js``

### Production
You are going to need to build the files on client side. The project uses Webpack & Babel for that.    
``npm run build``    

Build folder "dist" created! Now we can run our server with a production environment variable by running the start.sh file (Linux):    
``./start.sh``