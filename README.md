# Flaredown
[![rspec](https://github.com/rubyforgood/Flaredown/actions/workflows/rspec.yml/badge.svg)](https://github.com/rubyforgood/Flaredown/actions/workflows/rspec.yml)
[![frontend](https://github.com/rubyforgood/Flaredown/actions/workflows/frontend.yml/badge.svg)](https://github.com/rubyforgood/Flaredown/actions/workflows/frontend.yml)
[![ERB lint](https://github.com/rubyforgood/Flaredown/actions/workflows/erb_lint.yml/badge.svg)](https://github.com/rubyforgood/Flaredown/actions/workflows/erb_lint.yml)
[![standardrb lint](https://github.com/rubyforgood/Flaredown/actions/workflows/ruby_lint.yml/badge.svg)](https://github.com/rubyforgood/Flaredown/actions/workflows/ruby_lint.yml)

Flaredown makes it easy for people to track symptoms over time, and learn how to control them. Our goal is to analyze the aggregate data from users of this tool to understand the probable effects of treatments and environmental stressors on chronic illness.

Help would be appreciated! Please join us in [slack #flaredown](https://rubyforgood.herokuapp.com/) or raise a github issue, or email the contact@flaredown email which is currently checked every few days.

## Environment

* PostgreSQL 12.8
* MongoDB 4.4.9 https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/
* Redis 6.2.3
* Ruby 2.6.5 (see [RVM](https://rvm.io/) also)
* Node 12.22.6

You can spin up instances of the required data-stores in Docker containers using `docker compose up` in the project root.

On macOS, you can install libpq by running `brew install libpq && brew link --force libpq && bundle config --local build.pg "--with-ldflags=-L$(brew --prefix libpq)/lib --with-pg-include=$(brew --prefix libpq)/include"`, which is required for `bundle install` to succeed.

## Installation

### Backend

```bash
cd backend
echo "gem: --no-ri --no-rdoc" > ~/.gemrc
bundle config set --local without 'production'
bundle config set --local jobs 5
bundle config set --local retry 10
bundle install
cp env-example .env # You may adjust it however you like
                    # RVM is going to autoload this on every 'cd' to the directory
bundle exec rake app:setup
```

### Frontend

```bash
cd frontend
npm install
```

## Running / Development

```bash
rake run
```

Visit your app at [http://localhost:4300](http://localhost:4300)

## CI

Several checks are configured to run on all commits using Github Actions, including lint, build and test steps. Definitions can be found in [./github/workflows]. Those checks which always run are required to be successful for PRs to be mergable.

## Deployment

Deployments target [Heroku](https://heroku.com). The traditional deployment is manually configured and is composed of two distinct applications (frontend and api) in two environments (staging and production), with automatic deployments to staging of commits to master:

* [flaredown-staging-api](https://dashboard.heroku.com/apps/flaredown-staging-api)
* [flaredown-staging-webapp](https://dashboard.heroku.com/apps/flaredown-staging-webapp)
* [flaredown-production-api](https://dashboard.heroku.com/apps/flaredown-production-api)
* [flaredown-production-webapp](https://dashboard.heroku.com/apps/flaredown-production-webapp)

Addons are used for Heroku Postgres, Heroku Redis, Heroku Scheduler + Papertrail. MongoDB is provided by mongodb.com.

### New pipeline

A new pipeline is being built to unify and automate the deployment of the application. It is based around [Heroku Pipelines](https://devcenter.heroku.com/articles/pipelines) and [Review Apps](https://devcenter.heroku.com/articles/github-integration-review-apps) and uses [the Heroku Terraform provider](https://registry.terraform.io/providers/heroku/heroku/latest/docs) to [build the entire pipeline from code](https://devcenter.heroku.com/articles/using-terraform-with-heroku).

Prerequisites:
* [Install Terraform v1.0.8](https://www.terraform.io/downloads.html).
* Login to Heroku (`heroku login`) in order to [configure credentials via a `.netrc` file in your home directory](https://registry.terraform.io/providers/heroku/heroku/latest/docs#netrc) for use by Terraform. [Use isolated credentials](https://devcenter.heroku.com/articles/using-terraform-with-heroku#authorization) if desired.
* Initialize your Terraform state via `terraform init`.

Once setup, you can run `terraform plan` to see what changes are necessary to converge pipeline state. Run `terraform apply` to converge necessary changes. Read about [the core Terraform workflow](https://www.terraform.io/guides/core-workflow.html) for more details.

There are some variables that you can set (using `-var`) to customise the convergence:
* `heroku_prefix` - prefix added to resource names (eg `-var 'heroku_prefix=myprefix-'`)

**IMPORTANT NOTE**: Read about [best practices for using Terraform to manage Heroku](https://devcenter.heroku.com/articles/using-terraform-with-heroku#best-practices) before working with the CD pipeline either via the Heroku Dashboard or Terraform.

TODO: Use [Terraform Cloud](https://www.terraform.io/cloud) for collaborative convergence?

## License
Copyright 2015-2017 Logan Merriam and contributors.

Flaredown is open source software made available under the GPLv3 License. For details see the LICENSE file.
