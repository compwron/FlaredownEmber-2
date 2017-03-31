class Post
  include Mongoid::Document
  include Mongoid::Timestamps
  include Usernameable

  TOPIC_TYPES = %w(tag food symptom condition treatment).freeze

  attr_accessor :postable_id

  store_in collection: 'postables'

  field :body,              type: String
  field :title,             type: String
  field :_type,             type: String, default: -> { self.class.name }
  field :encrypted_user_id, type: String, encrypted: { type: :integer }

  field :tag_ids,       type: Array, default: []
  field :food_ids,      type: Array, default: []
  field :symptom_ids,   type: Array, default: []
  field :condition_ids, type: Array, default: []
  field :treatment_ids, type: Array, default: []

  field :comments_count, type: Integer, default: 0

  validates :body, :title, :encrypted_user_id, presence: true

  validate :topic_presence

  has_many :comments

  index(body: 'text', title: 'text')

  def self.fts(q)
    where('$text': { '$search': q, '$language': I18n.locale.to_s })
  end

  TOPIC_TYPES.each do |relative|
    pluralized_relative = relative.pluralize

    define_method(:"#{pluralized_relative}") do
      ivar_name = :"@_#{pluralized_relative}"

      value = instance_variable_get(ivar_name)

      return value if value.present?

      value = instance_variable_set(ivar_name, relative.classify.constantize.where(id: send("#{relative}_ids")))

      value
    end
  end

  private

  def topic_presence
    TOPIC_TYPES.each { |topic| return true if send(topic.pluralize).any? }

    errors.add(:topics, 'should have at list one entry')
  end
end
