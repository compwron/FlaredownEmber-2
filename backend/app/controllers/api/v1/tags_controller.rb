module Api
  module V1
    class TagsController < ApplicationController
      load_and_authorize_resource
      skip_before_action :authenticate_user!, only: [:show]

      def index
        @tags = @tags.includes(:translations)
        if ids.present?
          @tags = @tags.where(id: ids)
        elsif scope.present?
          @tags = CollectionRetriever.new(Tag, scope, current_user).retrieve
        end
        render json: @tags
      end

      def show
        render json: @tag
      end

      def create
        render json: TrackableCreator.new(@tag, current_user).create!
      end

      private

      def create_params
        params.require(:tag).permit(:name)
      end

      def ids
        @ids ||= params[:ids]
      end

      def scope
        @scope ||= params[:scope].try(:to_sym)
      end
    end
  end
end
