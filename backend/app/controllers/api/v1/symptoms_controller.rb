module Api
  module V1
    class SymptomsController < ApplicationController
      load_and_authorize_resource
      skip_before_action :authenticate_user!, only: [:show]

      def index
        @symptoms = @symptoms.includes(:translations)
        @symptoms = ids.present? ? @symptoms.where(id: ids) : @symptoms.order(:name).limit(50)

        render json: @symptoms
      end

      def show
        render json: @symptom
      end

      def create
        render json: TrackableCreator.new(@symptom, current_user).create!
      end

      private

      def create_params
        params.require(:symptom).permit(:name)
      end

      def ids
        @ids ||= params[:ids] if params[:ids].is_a?(Array)
      end
    end
  end
end
