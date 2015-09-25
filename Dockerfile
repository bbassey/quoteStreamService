FROM    ubuntu

RUN      apt-get update && apt-get install -y curl
RUN      apt-get install -y nodejs
RUN      apt-get install -y npm

# App

ADD ./web/server.js /web/server.js
ADD ./web/index.html /web/index.html
ADD ./web/package.json /web/package.json
WORKDIR "/web"

RUN   npm install
EXPOSE  4000
CMD ["nodejs", "/web/server.js"]