FROM node:14-alpine AS build
WORKDIR /dist/src/app
RUN npm cache clean --force
COPY . .
RUN npm install
RUN npm run build --prod

FROM nginx:latest AS nginx
COPY --from=build /dist/src/app/dist/my-docker-angular-app /usr/share/nginx/html
# COPY /nginx.conf  /etc/nginx/conf.d/default.conf
EXPOSE 80
