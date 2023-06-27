FROM node:14-alpine AS build

WORKDIR /dist/src/app
COPY package.json ./
RUN npm install

COPY . .
RUN npm run build --prod

# -----------------------

FROM nginx:latest AS nginx
COPY --from=build /dist/src/app/dist/yfa /usr/share/nginx/html
EXPOSE 80
