# == Schema Information
#
# Table name: users
#
#  id                     :integer          not null, primary key
#  email                  :string           default(""), not null
#  encrypted_password     :string           default(""), not null
#  reset_password_token   :string
#  reset_password_sent_at :datetime
#  remember_created_at    :datetime
#  sign_in_count          :integer          default(0), not null
#  current_sign_in_at     :datetime
#  last_sign_in_at        :datetime
#  current_sign_in_ip     :string
#  last_sign_in_ip        :string
#  authentication_token   :string           not null
#  invitation_token       :string
#  invitation_created_at  :datetime
#  invitation_sent_at     :datetime
#  invitation_accepted_at :datetime
#  invitation_limit       :integer
#  invited_by_id          :integer
#  invited_by_type        :string
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#

module Api
  module V1
    class UserSerializer < ApplicationSerializer
      attributes :id, :email, :intercom_hash, :topic_following_id

      has_one :profile, embed_in_root: true

      def topic_following_id
        object.topic_following.id
      end

      def intercom_hash
        OpenSSL::HMAC.hexdigest("sha256", ENV["INTERCOM_SECRET"], object.email)
      end
    end
  end
end
