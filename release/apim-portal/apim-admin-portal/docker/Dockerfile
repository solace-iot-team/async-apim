###########################################################################
# Dockerfile for APIM Portal - unprivileged
###########################################################################

# https://github.com/nginxinc/docker-nginx-unprivileged
FROM nginxinc/nginx-unprivileged:1.23.0

COPY default.nginx.conf /etc/nginx/conf.d/default.conf

USER nginx

COPY apim-portal /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]

# The end.
