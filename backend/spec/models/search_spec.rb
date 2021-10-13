require "rails_helper"

RSpec.describe Search, type: :model do
  let(:user) { create(:user) }
  let(:treatment) { create(:user_treatment, user: user).treatment }
  let(:query) { {name: "terra"} }

  before { treatment.update!(name: "Mediterranean Diet") }

  subject { Search.new(resource: "treatment", query: query, user: user) }

  context "success" do
    context "when search text is more than 3 characters" do
      it "returns string containing search text" do
        returned_treatment_names = subject.searchables.map(&:name)
        expect(returned_treatment_names).to include treatment.name
      end
    end

    context "when search text is less than 3 characters" do
      before { query[:name] = "me" }

      it "returns string starting with search text" do
        returned_treatment_names = subject.searchables.map(&:name)
        expect(returned_treatment_names).to include treatment.name
      end
    end
  end

  context "failure" do
    context "when search text is more than 3 characters" do
      before { query[:name] = "teran" }

      it "returns no results" do
        expect(subject.searchables).to be_empty
      end
    end

    context "when search text is less than 3 characters" do
      before { query[:name] = "te" }
      it "returns no results" do
        expect(subject.searchables).to be_empty
      end
    end
  end
end
