# alexa-alfresco

## Overview

This project provides an example of how one can perform some simple voice interactions
with Alfresco

## Build
```
mvn assembly:single

```
### Configuration

#### Lambda

Go to the AWS Console and define a define a Lambda function ...

* In the Code Tab ...
  * Upload the zip file generated from the build
* In the Configuration Tab ...
  * Runtime: nodejs
  * Handler: alexa-alfresco.handler 
  * Role: Choose an existing role
  * Existing role: lambda_basic_execution
  * Description: Whatever you want

#### Alexa

Go to https://developer.amazon.com/edw/home.html#/



