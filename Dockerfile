FROM node:14-alpine AS build
WORKDIR /dist/src/app
COPY . .
RUN npm cache clean --force
RUN npm install
RUN npm run build --prod

FROM nginx:latest AS nginx
COPY --from=build /dist/src/app/dist/vifa /usr/share/nginx/html
EXPOSE 80
