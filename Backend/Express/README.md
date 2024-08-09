## Middleware

1. **express.json()**: use to parse json data

2. **dotenv/config**: use to load environment variables from .env file

3. **helmet**: use to secure the app by setting various HTTP headers

4. **morgan**: use to log the request

5. 

```text
Backend Express
├── node_modules
└── src
    ├── apis
    │   ├── v1      
    │   │   ├── controllers
    │   │   ├── databases
    │   │   ├── helpers
    │   │   ├── interfaces
    │   │   ├── logs
    │   │   ├── middlewares
    │   │   ├── models
    │   │   ├── routes
    │   │   ├── services
    │   │   ├── utils
    │   │   └── validations
    │   ├── v2  
    │   │   ├── controllers
    │   │   ├── databases
    │   │   ├── helpers
    │   │   ├── interfaces
    │   │   ├── logs
    │   │   ├── middlewares
    │   │   ├── models
    │   │   ├── routes
    │   │   ├── services
    │   │   ├── utils
    │   │   └── validations
    │   └── v...    
    ├── configs
    └── index.js
├── tests
├── app.js
├── ecosystem.config.js
|── server.js
├── .env
├── .env.example
├── .gitignore
├── package-lock.json
├── package.json
└── README.md