FROM ruby:2.3.1 AS builder

LABEL maintainer="TODO"

# throw errors if Gemfile has been modified since Gemfile.lock
RUN bundle config --global frozen 1

WORKDIR /usr/src/app/backend

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY backend .

CMD ["bundle exec rake app:setup"]

ARG RAILS_ROOT=/usr/src/app/
WORKDIR $RAILS_ROOT

COPY Gemfile* $RAILS_ROOT
RUN bundle install

COPY backend .

### BUILD STEP DONE ###

FROM ruby:2.7.2-alpine

ARG RAILS_ROOT=/usr/src/app/

RUN apk update && apk upgrade && apk add --update --no-cache \
  bash \
  imagemagick \
  nodejs \
  postgresql-client \
  tzdata \
  vim \
  yarn && rm -rf /var/cache/apk/*

WORKDIR $RAILS_ROOT

COPY --from=builder $RAILS_ROOT $RAILS_ROOT
COPY --from=builder /usr/local/bundle/ /usr/local/bundle/

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["bin/rails", "s", "-b", "0.0.0.0"]
