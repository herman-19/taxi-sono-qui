# Taxi Sono Qui

**[WIP]**

Basic taxi service created using a distributed system architecture with Node.js.

This system consists of microservices with delegated responsibilities to cover the following:

* UI service where a customer can order a taxi.
* Fleet service that allocates taxis to orders.
* Taxi car service that collects data about individual taxis.

## Motivation
This project was created to further dive into distributed system architecture using microservices through means of a real-world application. 🚕

## Tech
* Node.js
* Netflix Eureka and Zuul
* MongoDB Atlas

The services communicate with each other using exposed REST APIs.
To enable scalability, Netflix Eureka and Zuul are integrated for service discovery and dynamic routing, respectively.

**Eureka**:
* Used to enable service discovery through use of a service registry.
* Allows services to find each other without the need for each service to store full URLs for each service.

**Zuul**:
* Used to enable dynamic routing.
* Uses information in Eureka service registry to allow services to reach each other.
* Takes care of routing requests to the correct services.
