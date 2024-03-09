# NodeJS + ExpressJS RESTful API Boilerplate

**This project is still in early development!**

This project is a boilerplate starting point for building RESTful APIs using NodeJS and ExpressJS, designed to offer flexibility, security, speed, and simplicity for your development process. It supports ECMAScript Modules (ESM) for modern JavaScript syntax, and comes with configurable logging via Pino or Morgan. Route handling is versatile, allowing for both traditional ExpressJS setup and dynamic importing of routes based on filenames.

The aim of this project is to save engineers hours to days of development time, enabling developers to concentrate on solving the specific problems they've been assigned, rather than getting bogged down by complex boilerplate and issues not directly related to the problem at hand. 

## Features

- ECMAScript Modules (ESM): Modern JavaScript syntax and module system.
- Database Flexibility: Offers the ability to choose between MongoDB, PostgreSQL, or SQLite using dependency injection, providing versatility in database integration and management. Automatically installs and imports ONLY the dependencies you decide to use.
- Flexible Logging: Choose between Pino and Morgan for your logging needs. Only installs and imports the selected logging dependency.
- Dynamic Route Importing: Automatically import routes from the routes directory based on filenames, or configure them traditionally.
- Docker Ready: Containerize your API with ease for deployment and scalability.
- Kubernetes Compatible: Deploy on Kubernetes platforms like Google Kubernetes Engine (GKE) without hassle.

## Getting Started

### Prerequisites

- Node.js (14 or later)
- npm

### Installation

Clone the repository and install dependencies:

```shell
git clone https://github.com/aftaylor2/node-express-api-boilerplate.git
cd node-express-api-boilerplate
npm install
```

### Configuration

Copy the .env.example file to .env and adjust the configuration to your needs.

### Choosing Your Logger

By default, the API uses Pino for logging. To switch to Morgan, update the logger configuration in the config.js or .env file.

## Running the API

To start the API server, run:

```shell
npm start
```

This will launch the API on http://localhost:3000 by default. Update the PORT environment variable to modify the port.

## Adding Routes

### Traditional ExpressJS Routes

Place your route files in the routes directory and manually import them in app.js or a dedicated router file.

### Dynamic Route Importing

Simply add your route files to the routes directory. The naming convention is /[routeName].js, and the will be automatically imported and hosted as "/[routeName]".

## Dockerization

A Dockerfile is provided for building a Docker image of your API:

```shell
docker build -t your-api-name .
```

## Kubernetes

For deployment on Kubernetes, refer to the kubernetes.yml file for a basic deployment configuration. YAML files describing the service, deployment, ingress controller, and scheduled cronjobs are included. Automatic management of certificates is supported via
certbot and configured to use LetsEncrypt TLS certificates by default. 

### Kustomize

The project supports kustomize to allow for easy templating of K8s YAML to support various environments such as development,
staging, and production.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with your improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details.