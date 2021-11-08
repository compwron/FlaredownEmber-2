module Api
  module V1
    class CheckinsController < ApplicationController
      def index
        date = params[:date]

        if date.blank? && params.require(:page)
          render json: current_user.checkins.where(:note.nin => [nil, ""]).order_by(date: :desc).page(params[:page]).per(10)
        else
          render json: current_user.checkins.includes([:harvey_bradshaw_index, :promotion_rate, :conditions, :symptoms, :treatments]).select { |x|
            x.date.to_date == Date.parse(date)
          }
        end
      end

      def show
        render json: Checkin.find(id)
      end

      def create
        date = params.require(:checkin).require(:date)
        parsed = DateTime.parse(date)
        if parsed.today?
          # for current day, save time so that user.last_checkin works properly with multiple checkins per day
          parsed = DateTime.new
        end
        checkin = Checkin::Creator.new(current_user.id, parsed).create!
        render json: checkin
      end

      def update
        render json: Checkin::Updater.new(current_user, params).update!
      end

      private

      def id
        params.require(:id)
      end
    end
  end
end
