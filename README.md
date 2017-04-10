# alexa-alfresco

## Overview

This project provides an example of how one can perform some simple voice interactions
with Alfresco.

See the [Concept Document](https://github.com/melahn/alexa-alfresco/blob/master/Alexa%20Alfresco%20Concept.pdf) 

## Build
```
mvn assembly:single

```
The result is a code package named */target/alexa-alfresco-1.0-SNAPSHOT.zip*

### Configuration

#### Skill

Go to [AWS Alexa Skills Kit](https://developer.amazon.com/alexa-skills-kit)

* In the *Skills Information* tab, enter a Skill Name and and an Invocation Name 
* In the *Interaction Model* tab...
  * Enter an *Intent Schema*.   An example is provided [here](./config/intent-schema.json)
  * Enter *Custom Slot Types*.   An example is provided [here](./config/slot-types.txt)
  * Enter *Sample Utterances*.  An example is provided [here](./config/sample-utterances.txt)
* In the *Configuration* tab, enter the arn of the Lambda Function, in the form arn:aws:lambda:us-east-1:xxx:function:Alfresco

#### Lambda

##### Simple

Go to the AWS Console and define a define a Lambda function like this:

* In the Code Tab ...
  * Upload the zip file generated from the build
* In the Configuration Tab ...
  * Runtime: nodejs
  * Handler: alexa-alfresco.handler 
  * Role: Choose an existing role
  * Existing role: lambda_basic_execution
  * Description: Whatever you want
  * Advanced (skip)

##### Advanced

1. Go to the AWS IAM Console and create a role that includes the *AWSLambdaFullAccess* Policy

2. Go to the AWS Lambda Console and define a define a Lambda function like this:
* In the Code Tab ...
  * Upload the zip file generated from the build
* In the Configuration Tab ...
  * Runtime: nodejs
  * Handler: alexa-alfresco.handler 
  * Role: Choose an existing role
  * Existing role: The role you defined in step 1
  * Description: Whatever you want
  * Advanced
    * Choose a VPC (note that there must be a subnet in that VPC connected to an Internet Gateway)
    * Choose at least two subnets from the VPC that are connected to a NAT
    * Choose a security group with an inbound rule that allows a source of your security group and an outbound rule that allow a destination of s 0.0.0.0/0
3. Save the Lambda Configuration
4. Using either an Echo that has access to the Alfresco skill or the AWS Alexa SDK app, invoke the Lambda with the utterance "Network Test" and make note of the 
IP address
5. In the security group used for your Alfresco instance, make sure to include an inbound TCP rule that uses the IP address you discovered
in Step 4
6. Test connectivity by an utterance that accesses the Alfresco server, such as 'List Tasks'


## Usage

The project relies on an Alexa skill named 'Alfresco' to drive the Lambda function built by this project.  Because the 
skill is not yet published, it can only be deployed to an Echo or Dot device that is registered with the owner of the skill. 

Of course, the AWS Alexa Skills Kit at https://developer.amazon.com/edw/home.html#/ can also be used to create a skill and drive
the Lambda function.   If you do that, you will also need to change the 
*appId* variable in the Lambda function, which provides an additional level of security and cost control to assure the Lambda is not accessed
outside of its intended purpose.

### Sample Utterances

* Is Alfresco up?
* Hello My name is {name}
* List My Sites
* List My Tasks or What's up?
* Approve Task {task number}
* Reject Task {task number}
* Get Task {task number} or Describe Task {task number}
* Network test
* Sing me a song

### Sample Output

See https://github.com/melahn/alexa-alfresco/tree/master/samples

