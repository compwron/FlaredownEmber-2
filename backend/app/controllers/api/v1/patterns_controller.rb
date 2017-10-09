class Api::V1::PatternsController < ApplicationController
  load_and_authorize_resource

  def index
    render json: @patterns
  end

  def show
    pattern = Pattern.find_by(id: pattern_params[:id])

    # rubocop:disable Style/SignalException
    fail(ActiveRecord::RecordInvalid, pattern) if pattern.invalid?
    # rubocop:enable Style/SignalException

    render json: pattern
  end

  def create
    @pattern = PatternCreator.new(pattern_params).create

    render json: @pattern
  end

  def update
    @pattern.update_attributes(pattern_params)

    render json: @pattern
  end

  def destroy
    pattern = Pattern.find_by(id: params[:id])

    authorize! :destroy, pattern

    if pattern.destroy
      head :no_content
    else
      render json: { errors: pattern.errors }, status: :unprocessable_entity
    end
  end

  private

  def pattern_params
    params.require(:pattern)
      .permit(:name, :start_at, :end_at, includes: [:id, :category, :label])
      .merge(user_id: current_user.id)
  end
end
