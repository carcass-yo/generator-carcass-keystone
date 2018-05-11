FROM node:8-stretch

# process manager
RUN npm install -g pm2

# less for bunyan
RUN apt-get update \
	&& apt-get install -y \
		less \
		graphicsmagick \
	&& rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/node/www
WORKDIR /home/node/www

CMD npm start

EXPOSE 3000
