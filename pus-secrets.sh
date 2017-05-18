#!/bin/bash
tar zcvf secrets.tar.gz configuration/secrets
aws s3 cp secrets.tar.gz s3://cloudstitch-deployment-helpers/cloudstitch-oauth-api/secrets.tar.gz
