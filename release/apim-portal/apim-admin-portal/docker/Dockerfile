###########################################################################
# Dockerfile for APIM Portal
###########################################################################

FROM nginx:1.21.4-alpine
# https://github.com/nginxinc/docker-nginx-unprivileged
# FROM nginxinc/nginx-unprivileged

COPY default.nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf

# add permissions for nginx user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

COPY apim-portal /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]

# The end.
