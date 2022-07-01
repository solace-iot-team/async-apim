###########################################################################
# Dockerfile for APIM Portal
###########################################################################

FROM nginx:1.21.4-alpine

# ensure it runs in unprivilidged mode
# use existing user nginx
RUN  touch /var/run/nginx.pid && \
     chown -R nginx:nginx /var/cache/nginx /var/log/nginx /var/run/nginx.pid

USER nginx

COPY --chown=nginx:nginx apim-portal /usr/share/nginx/html
COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]

# The end.
