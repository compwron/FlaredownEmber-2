module Api
  module V1
    class TreatmentsController < ApplicationController
      load_and_authorize_resource
      skip_before_action :authenticate_user!, only: [:show]

      def index
        @treatments = @treatments.includes(:translations)
        @treatments = ids.present? ? @treatments.where(id: ids) : @treatments.order(:name).limit(50)

        render json: @treatments
      end

      def show
        render json: @treatment
      end

      def create
        render json: TrackableCreator.new(@treatment, current_user).create!
      end

      private

      def create_params
        params.require(:treatment).permit(:name)
      end

      def ids
        @ids ||= params[:ids] if params[:ids].is_a?(Array)
      end
    end
  end
end
