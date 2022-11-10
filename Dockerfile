FROM node:18-alpine
RUN apk update
RUN apk add ffmpeg
# Create app directory
WORKDIR /app
ADD package.json /app/package.json
ADD yarn.lock /app/yarn.lock
# Installing packages
RUN yarn
ADD . /app

# Building TypeScript files
RUN yarn build
RUN mkdir /data
CMD ["yarn", "start"]
