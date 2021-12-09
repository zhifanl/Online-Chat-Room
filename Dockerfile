FROM node:alpine

WORKDIR /usr/app
#copy package.json and all the other file
COPY ./ ./

RUN npm install

CMD ["npm","start"]

#port mapping:  docker run -p 3000:3000 zhifanli/chat-app 
