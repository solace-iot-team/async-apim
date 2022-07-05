###########################################################################
# Dockerfile for APIM Portal - unprivileged
###########################################################################

# https://github.com/nginxinc/docker-nginx-unprivileged
# FROM nginxinc/nginx-unprivileged
FROM nginxinc/nginx-unprivileged:1.23.0

COPY default.nginx.conf /etc/nginx/conf.d/default.conf
# COPY nginx.conf /etc/nginx/nginx.conf

# add permissions for nginx user
#RUN chown -R nginx:nginx /usr/share/nginx/html && \
#    chown -R nginx:nginx /var/cache/nginx && \
#    chown -R nginx:nginx /var/log/nginx && \
#    chown -R nginx:nginx /etc/nginx/conf.d

#RUN touch /var/run/nginx.pid && \
#    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

COPY apim-portal /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]

# The end.
