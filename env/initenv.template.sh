#!/bin/bash

## ACTION TEST - HOSTED MODE
# export UMAMI_TEST_SERVER="https://umami.replace-me.exemple.com"
# export UMAMI_TEST_USER="admin"
# export UMAMI_TEST_PASSWORD="12333321"
# export UMAMI_TEST_SITE_DOMAIN="*first*"

## ACTION TEST - (1) CLOUD MODE
export UMAMI_TEST_CLOUD_API_KEY=api_xxxyyyzzz
export UMAMI_TEST_CLOUD_SITE_DOMAIN="*first*"
# export UMAMI_TEST_CLOUD_SITE_DOMAIN="replace-me.exemple.com"


## MANUAL TEST - (2) HOSTED MODE
unset UMAMI_CLOUD_API_KEY
export UMAMI_SERVER="https://umami.replace-me.exemple.com"
export UMAMI_USER="admin"
export UMAMI_PASSWORD="12333321"
export UMAMI_SITE_DOMAIN="*first*"

## MANUAL TEST - CLOUD MODE
unset UMAMI_SERVER UMAMI_USER UMAMI_PASSWORD
export UMAMI_CLOUD_API_KEY=api_xxxyyyzzz
export UMAMI_CLOUD_SITE_DOMAIN="*first*"



### Dev debug API
# export UMAMI_CLIENT_DEBUG_RESPONSE=true
# export UMAMI_CLIENT_DEBUG_REQUEST=true
### Dev debug Action
# export UMAMI_DEBUG_ACTION=true