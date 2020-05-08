FROM mapoxu/shengjibase:1.0.2

COPY . /baseimg
WORKDIR /baseimg

EXPOSE 8000

#RUN npm run build
#RUN ls api/static/js
#RUN cat api/js/member_bundle.js

CMD npm run dev
# CMD export LC_ALL=C.UTF-8; \
#  export LANG=C.UTF-8; \
#  export FLASK_DEBUG=True; \
#  export FLASK_APP=api; \
#  export APP_SETTINGS=config.py; \
#  flask run --host 0.0.0.0 --port 8000