###########################################################################
# Dockerfile
###########################################################################

FROM node:14.17.5

COPY dist /usr/local/apim-portal/dist
COPY node_modules /usr/local/apim-portal/node_modules
COPY start.sh /usr/local/apim-portal/start.sh

CMD /usr/local/apim-portal/start.sh

# The end.
