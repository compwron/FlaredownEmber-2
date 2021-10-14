module Api
  module V1
    class PushersController < ApplicationController
      def create
        render json: Flaredown.pusher.authenticate!(current_user, socket_id)
      rescue
        render json: {errors: "Bad authentication"}, status: "403"
      end

      private

      def socket_id
        params.require(:socket_id)
      end
    end
  end
end
