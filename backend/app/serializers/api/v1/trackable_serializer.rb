module Api
  module V1
    module TrackableSerializer
      extend ActiveSupport::Concern

      included do
        attributes :color_id, :type, :users_count
      end

      def color_id
        @color_id ||= Tracking.find_by(user: current_user, trackable: object).try :color_id
      end

      def type
        object.class.name.downcase.dasherize
      end

      def users_count
        object.trackable_usages_count
      end
    end
  end
end
