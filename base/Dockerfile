FROM ubuntu:latest

RUN apt-get update; \
    apt-get install -y curl python3.6 python3-pip wget

RUN apt-get install -y python3-pip

WORKDIR /baseimg
COPY . /baseimg

RUN apt-get install -y npm; \
    curl -sL https://deb.nodesource.com/setup_13.x | bash - && apt-get install nodejs -y; \
    npm install webpack -g; \
    npm install .; \
    npm install -D babel-loader @babel/core @babel/preset-env webpack; \
    npm install --save-dev @babel/preset-react; \
    npm install --save-dev @babel/preset-env; \
    npm install --save react prop-types react-dom bootstrap reactstrap style-loader react-localizer react-widgets react-router-dom react-copy-to-clipboard firebase; \
    npm install --save-dev css-loader

RUN pip3 install --upgrade pip && pip install -r requirements.txt