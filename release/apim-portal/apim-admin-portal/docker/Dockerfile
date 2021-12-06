###########################################################################
# Dockerfile for APIM Portal
###########################################################################

FROM nginx:1.21.4-alpine

COPY admin-portal /usr/share/nginx/html

# COPY dist /usr/local/apim-portal/dist
# COPY node_modules /usr/local/apim-portal/node_modules
# COPY start.sh /usr/local/apim-portal/start.sh

# CMD /usr/local/apim-portal/start.sh
CMD ["nginx", "-g", "daemon off;"]

# The end.
