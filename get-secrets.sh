#!/bin/bash
aws s3 cp s3://cloudstitch-deployment-helpers/cloudstitch-oauth-api/secrets.tar.gz secrets.tar.gz 
tar zxvf secrets.tar.gz
rm secrets.tar.gz