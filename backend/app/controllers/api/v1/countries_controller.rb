module Api
  module V1
    class CountriesController < ApplicationController
      skip_before_action :authenticate_user!

      def index
        render json: Country.all, each_serializer: CountrySerializer, root: false
      end

      def show
        country = Country.find_country_by_alpha2(alpha2)
        # FIXME
        # rubocop:disable Style/SignalException
        fail ActiveRecord::RecordNotFound if country.nil?
        # rubocop:enable Style/SignalException
        render json: country, serializer: CountrySerializer
      end

      private

      def alpha2
        id = params.require(:id)
        match_data = /^[[:alpha:]]{2}$/.match(id)
        # FIXME
        # rubocop:disable Style/SignalException
        fail(ActionController::BadRequest, "id param must be a 2 alphabetic characters string") if match_data.nil?
        # rubocop:enable Style/SignalException
        match_data[0]
      end
    end
  end
end
