###########################################################################
# Dockerfile
###########################################################################

# Based on: https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/

FROM node:lts-alpine@sha256:a9b9cb880fa429b0bea899cd3b1bc081ab7277cc97e6d2dcd84bd9753b2027e1
RUN apk add dumb-init
COPY --chown=node:node . /usr/local/apim-server
USER node
CMD ["dumb-init", "node", "/usr/local/apim-server/dist/server/index.js"]

# The End.
