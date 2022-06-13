###########################################################################
# Dockerfile for APIM Portal
###########################################################################

FROM nginx:1.21.4-alpine

COPY apim-portal /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]

# The end.
